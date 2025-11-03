import { env } from "cloudflare:workers";
import { isDevelopmentEnv } from "../../lib/env-utils";

/** Configured a special ai gateway for our local dev envs */
const LOCAL_AI_GATEWAY_NAME = "fp-cf-starter-local";

export function getAiGatewayName() {
  if (isDevelopmentEnv()) {
    return LOCAL_AI_GATEWAY_NAME;
  }

  return env.CLOUDFLARE_AI_GATEWAY_ID;
}
