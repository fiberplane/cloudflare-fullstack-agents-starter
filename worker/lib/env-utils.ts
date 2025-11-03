import { env } from "cloudflare:workers";

/**
 * Check if the current environment is development.
 * Used to enable development-only features like test user seeding.
 */
export function isDevelopmentEnv(): boolean {
  return env.ENVIRONMENT === "development";
}
