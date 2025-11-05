# GitHub Actions Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment of the application.

## Overview

The workflows are configured to run tests automatically but keep deployments **disabled by default** in the template. This allows you to use the CI/CD infrastructure when you're ready, while preventing accidental deployments.

## Workflows

### 1. Test PALS (`pals-test.yaml`)

**Trigger**: Automatically runs on:
- Push to `main` branch
- Pull requests to any branch

**Purpose**: Validates code quality and ensures the application builds successfully.

**Jobs**:
- **test**: Runs linting, type checking, unit tests, database schema validation, and builds
- **deploy-to-preview**: ⚠️ **DISABLED BY DEFAULT** - Would deploy to preview environment on main branch pushes

**What it does**:
1. Sets up Bun and Biome
2. Installs dependencies
3. Runs `bun run lint` (Biome formatting check)
4. Runs `bun run typecheck` (TypeScript type checking)
5. Runs `bun run test run` (Vitest unit tests)
6. Checks for uncommitted Drizzle schema changes
7. Runs `bun run build` (Production build validation)

### 2. Deploy PALS (`pals-deploy.yaml`)

**Trigger**: Reusable workflow (called by other workflows)

**Purpose**: Shared deployment logic for both manual and automatic deployments.

**Status**: ⚠️ **Available but not automatically triggered** - This workflow is functional but only runs when explicitly called.

**What it does**:
1. Builds the application (with environment-specific config)
2. Runs database migrations (preview or prod)
3. Deploys the worker to Cloudflare using Wrangler
4. Configures required secrets for the deployed application

### 3. Deploy PALS (manual) (`pals-deploy-manual.yaml`)

**Trigger**: Manual workflow dispatch via GitHub Actions UI

**Purpose**: Allows on-demand deployments to preview or production environments.

**Status**: ✅ **Ready to use** (once secrets are configured)

**How to use**:
1. Go to the **Actions** tab in your GitHub repository
2. Select **Deploy PALS (manual)** from the workflows list
3. Click **Run workflow**
4. Choose the environment (`preview` or `prod`)
5. Click **Run workflow** to start the deployment

## Enabling Automatic Deployments

By default, automatic deployments are **disabled** to prevent accidental deploys from the template. To enable them:

### Step 1: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

#### Required Secrets

| Secret Name | Description | Where to get it |
|------------|-------------|-----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Workers deployment permissions | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) - Create token with "Edit Cloudflare Workers" permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Found in Cloudflare Dashboard > Workers & Pages > Overview |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude AI features | [Anthropic Console](https://console.anthropic.com/) |
| `OPENAI_API_KEY` | OpenAI API key (optional, for OpenAI features) | [OpenAI Platform](https://platform.openai.com/api-keys) |

### Step 2: Enable the Deploy Job

Edit `.github/workflows/pals-test.yaml` and modify the `deploy-to-preview` job:

**Change this:**
```yaml
deploy-to-preview:
  name: Deploy PALS
  uses: ./.github/workflows/pals-deploy.yaml
  needs: test
  if: false  # Disabled in template - see comment above to enable
  with:
    environment: preview
  secrets: inherit
```

**To this:**
```yaml
deploy-to-preview:
  name: Deploy PALS
  uses: ./.github/workflows/pals-deploy.yaml
  needs: test
  if: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}
  with:
    environment: preview
  secrets: inherit
```

### Step 3: Test the Deployment

Push a commit to your `main` branch and verify:
1. The test job completes successfully
2. The deploy-to-preview job runs
3. Your application is deployed to Cloudflare Workers

## Using Manual Deployments

Even with automatic deployments disabled, you can deploy manually at any time:

1. Configure the required GitHub secrets (see above)
2. Use the **Deploy PALS (manual)** workflow from the Actions tab
3. Choose your target environment (preview or prod)

This is useful for:
- Testing deployments before enabling automatic deploys
- Deploying hotfixes without waiting for CI
- Deploying to production with explicit approval

## Customizing for Your Environment

### Monorepo Setup

If you're moving this template into a monorepo, you'll need to:

1. Uncomment the `working-directory` parameters in the workflow files
2. Update the paths to point to your app directory (e.g., `apps/pals`)
3. Update the `workingDirectory` in the Wrangler deployment step

Look for comments in the workflow files marked with:
```yaml
# NOTE - if you are putting the template into a monorepo, you'll need the "working-directory" param here:
```

### Environment Variables

The workflows support two environments:
- **preview**: For staging/testing (`CLOUDFLARE_ENV=preview`)
- **prod**: For production (default, no env variable)

You can customize the build and deployment behavior by:
- Modifying the build commands in `pals-deploy.yaml`
- Adjusting the migration commands for your database setup
- Adding additional deployment steps or environments

## Troubleshooting

### Build Failures

If builds fail in CI but work locally:
- Ensure `bun.lock` is committed (workflow uses `--frozen-lockfile`)
- Check that all dependencies are properly declared in `package.json`
- Verify that environment-specific code doesn't rely on local-only resources

### Deployment Failures

If deployments fail:
- Verify all required secrets are configured correctly
- Check Cloudflare API token has the necessary permissions
- Review the Wrangler logs in the GitHub Actions output
- Ensure your `wrangler.jsonc` is properly configured

### Schema Migration Issues

If the schema check fails:
- Run `bun run db:generate` locally
- Commit any generated migration files
- Push the changes and re-run the workflow

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Bun Documentation](https://bun.sh/docs)

