# Fiberplane's Cloudflare Agents Full-Stack Starter Kit

A WIP example of how Fiberplane builds full-stack apps on top of Cloudflare.

## Stack Overview

> Scroll down to **Getting Started** if you're more interested in just running the template

**Development**
- Bun as the package manager
- Vite with the Cloudflare Vite plugin
- Vitest setup
  * _NOTE_ Uses jsdom for frontend tests
  * _NOTE_ Vitest does not simulate workerd (Cloudflare) on the backend yet
- Biome for linting and formatting
- AGENTS.md (symlinked to CLAUDE.md) with development instructions for coding agents
- mcp
- (TODO) GitHub actions for testing and deploying

**Backend**
If you've seen the [HONC](https://honc.dev) templates, a lot of this will look familiar:

- Hono for the API
- Logtape for application logging
- Cloudflare D1 (sqlite) for the database
- Drizzle ORM for D1 as the sql query builder
- Login with GitHub via Better Auth (configured with Hono + Drizzle)
- _TODO_ Zod for api validation
- Vercel AI sdk
- Cloudflare Agents SDK
- Drizzle ORM for Durable Objects as the Durable Object sqlite ORM
- Cloudflare AI gateway

**Frontend**

- React
- Shadcn + tailwind
- Tanstack Query
- Tanstack Router
- Tanstack Form
- Cloudflare Agents hooks for chatting with an agent over websockets

## Getting Started

This is intended to be a production application, so there are a few steps to getting it up and running.

I'd love if we had a CLI to guide some of this config (_PRs always accepted!_), but for now there will be quite a bit of manual file tweaking.

### Prerequisites

- Bun
- GitHub OAuth App credentials
- Anthropic API Key

### Installation

```bash
bun install
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .dev.vars.example .dev.vars
```

2. Get GitHub OAuth credentials:
   - Go to https://github.com/settings/developers
   - Create a new OAuth App
   - Set the Authorization callback URL to: `http://localhost:7676/api/auth/callback/github`
   - Copy your Client ID and Client Secret into `.dev.vars`

3. Update `.dev.vars` with your credentials:
```env
ENVIRONMENT="development"
BETTER_AUTH_SECRET=generate-with-openssl-or-whatever
BETTER_AUTH_URL=http://localhost:7676
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
ANTHROPIC_API_KEY=sk-ant...
```

4. Configure Cloudflare account id in `wrangler.jsonc`. Replace `CLOUDFLARE_ACCOUNT_ID` placeholder with the return value of `bun wrangler whoami`

5. Configure Cloudflare D1 (sqlite). Create databases and fill in wrangler.jsonc
```sh
bun wrangler d1 create my-database
# fill in "d1_databases" in wrangler.jsonc
# - "database_name": "my-database"
# - "database_id": "whatever-the-cli-prints"

bun wrangler d1 create my-database-preview
# fill in "preview"."d1_databases" in wrangler.jsonc
# - "database_name": "my-database-preview"
# - "database_id": "whatever-the-cli-prints"
```

6. Create Cloudflare AI Gateways. Create (for now, unauthenticated) ai gateways for local, preview, and prod. Put their names in `wrangler.jsonc` as well as `worker/agent/ai/utils.ts` for the local one
```ts
const LOCAL_AI_GATEWAY_NAME = "my-gateway-for-local-dev";
```

7. Add yourself to the GitHub allowlist. Modify `worker/lib/auth/allow-list.ts`
```ts
/**
 * List of GitHub usernames that are explicitly allowed.
 * All usernames should be stored in lowercase.
 */
const allowedGitHubUsernames = new Set<string>(["brettimus"]);
```

### Database Setup (D1 sqlite)

```bash
bun run db:setup
```

This will:
- Create a local D1 database
- Generate migrations
- Apply pending migrations

### Running the Application

```bash
bun run dev
```

The application will be available at `http://localhost:7676`

## Authentication Flow

The application uses **Better Auth** with GitHub OAuth for authentication:

Note that we're using the Drizzle + Hono integrations.

Better auth takes care of generating the user schema as well as additional tables based off of your config.

There is a `better-auth.config.ts` file in the root which was used for initial schema generation. We shouldn't have to touch this until we add some more providers.

Otherwise, the backend logic is in `worker/utils/auth.ts`

## AI Gateway and API Key(s)

You'll need at the very least an `ANTHROPIC_API_KEY`.

There are three different ai gateways (in Cloudflare) configured for this project

- `fp-cf-starter` for prod
- `fp-cf-starter-preview` for preview
- `fp-cf-starter-local` for local dev

You can replace these names with whatever gateways you create.

The local gateway will be used if your `.dev.vars` has `ENVIRONMENT=development` in it.

## DEVELOPMENT Notes

A few notes for the reader:

### Generating types

Whenever you add new Cloudflare bindings (or secrets in `.dev.vars`) you will want to rerun type generation,
so that typescript does not get mad:

```sh
bun run cf-typegen
```

### Agent Database Setup

Luckily, the agent database works out of the box. But if you add new tables with Drizzle for Durable Objects,
you will want to run:

```sh
bun run do-db:generate
```

After that, the durable object instances will pick up the migrations and automatically migrate themselves the next time they are invoked.

### Path aliases `@/`

`@/` aliases to the project root, so both the frontend and backend can use similar path aliases.

To import from the frontend: 

```ts
import { FrontendComponent } from "@/app";
```

To import from the worker: 

```ts
import { Backendserver } from "@/worker";
```

### Importing SVGs

To import SVGs as React components, use `?react` at the end of the import.
```tsx
import MySvg from "@/app/assets/my.svg?react";
```

### Configuring Cursor/VSCode for this project (tanstack router, shadcn)

You may want to add the following to `settings.json`

```json
{
  "files.readonlyInclude": {
    "**/routeTree.gen.ts": true
  },
  "files.watcherExclude": {
    "**/routeTree.gen.ts": true
  },
  "search.exclude": {
    "**/routeTree.gen.ts": true
  }
}
```

I also installed tailwind intellisense and told Cursor to not use the in-built css linter in `settings.json`

```json
{
  "css.validate": false
}
```

### Configuring MCP Servers for local dev

I have the shadcn mcp server already added for Claude Code and Cursor.

You may also want to add Context7 (you'll need an api key).

#### Using Playwright MCP for UI/E2E Testing

The app uses GitHub OAuth for authentication, which makes it challenging to use Playwright MCP for automated testing. To solve this, we've created a seeded test user that bypasses OAuth while maintaining the authentication flow.

**Setup Instructions:**

1. Run the seed script to create a test user and session:
   ```bash
   bun run seed:playwright
   ```

   This will:
   - Create a test user with GitHub username `fpc-test-nae4-playwright-user` (already in the allowlist)
   - Generate a long-lived session (expires in 1 year)
   - Create a `.playwright-storage.json` file with authentication cookies

2. Configure Playwright MCP in your mcp config:
   ```json
   {
     "mcpServers": {
       "playwright": {
         "command": "npx",
         "args": [
           "@playwright/mcp@latest",
           "--isolated",
           "--storage-state=.playwright-storage.json"
         ]
       }
     }
   }
   ```

3. Use Playwright tools to test the authenticated app at http://localhost:7676

**Note:** This setup only works in development environments. The seed script will refuse to run if `ENVIRONMENT !== "development"` in your `.dev.vars` file.

For more information about Playwright MCP, see the [official documentation](https://github.com/microsoft/playwright-mcp).

## Manual Testing

Example test URLs:
- https://math-tools-server-ef44gc.fp.dev/mcp 
- https://mcp.linear.app/mcp
- https://mcp.neon.tech/mcp

Bad example test URLs:
- https://mcp.figma.com/mcp (will fail bc does not support DCR)
- https://api.githubcopilot.com/mcp (will only work with a github api key header, not with DCR)

## TODOs

- [ ] Replace the Favicon
- [ ] LLM config tweaks (system prompt, etc)
- [ ] Consolidate UI
- [ ] MCP configuration

**NICE TO HAVES**
- [ ] Explain ...
- [ ] GitHub actions
- [ ] MCP configuration