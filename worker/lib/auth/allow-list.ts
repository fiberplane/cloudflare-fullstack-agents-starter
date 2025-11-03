import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { HonoAppType } from "../../types";
import { isDevelopmentEnv } from "../env-utils";

export const allowListMiddleware = createMiddleware<HonoAppType>(async (c, next) => {
  // Skip auth routes - they need to work without authentication
  const path = new URL(c.req.url).pathname;
  if (path.startsWith("/api/auth/")) {
    return next();
  }

  const user = c.get("user");

  if (!user?.githubUsername) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  if (!(await isAllowedGitHubUsername(user.githubUsername))) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  await next();
});

/**
 * List of GitHub usernames that are explicitly allowed.
 * All usernames should be stored in lowercase.
 */
const allowedGitHubUsernames = new Set<string>(["brettimus"]);

// In development, allow the test user to access the app
// This is used for testing the ui with playwright MCP
// see: `bun run seed:playwright` or `scripts/seed-playwright-user.ts`
if (isDevelopmentEnv()) {
  allowedGitHubUsernames.add("fpc-test-nae4-playwright-user");
}

/**
 * Checks if a given GitHub username is in the allowed list or in the provided KV namespace.
 * The check is case-insensitive.
 *
 * @param username - The GitHub username to check
 * @param kv_namespace - Optional KVNamespace to check for additional allowed usernames
 * @returns True if the username is in the allow list or the KV namespace, false otherwise
 */
export async function isAllowedGitHubUsername(username: string): Promise<boolean> {
  if (!username || typeof username !== "string") {
    return false;
  }

  if (allowedGitHubUsernames.has(username.toLowerCase())) {
    return true;
  }

  // NOTE - You could check a KV namespace here if you wanted to, for a dynamic allow list

  return false;
}
