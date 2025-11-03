import type { Logger } from "@logtape/logtape";
import type { Agent } from "agents";
import { prepareErrorForLogging } from "@/worker/lib/errors";

/**
 * Creates an observability handler for the agent.
 * This is used to capture internal agent events for debugging.
 *
 * @note - As of writing, this is only used for helping debug MCP issues on the agent
 */
export function createObservability(logger: Logger): Agent["observability"] {
  return {
    emit: (event) => {
      logger.info(`[MCP Observability] ${event.type}`, {
        displayMessage: event.displayMessage,
        payload: event.payload,
        timestamp: event.timestamp,
        id: event.id,
      });

      // Log connection failures with extra detail
      if (event.type === "mcp:client:connect") {
        const payload = event.payload as {
          url?: string;
          transport?: string;
          state?: string;
          error?: string | Error;
        };

        if (payload.error) {
          const errorMessage =
            payload.error instanceof Error ? payload.error.message : String(payload.error);

          // Detect dynamic client registration failures (403 on OAuth registration)
          // This indicates the server requires pre-registered clients (like Figma)
          const isDynamicClientRegFailure =
            errorMessage.includes("HTTP 403") && errorMessage.includes("OAuth");

          // Extract full error details including stack if available
          const errorDetails =
            payload.error instanceof Error
              ? {
                  message: payload.error.message,
                  name: payload.error.name,
                  stack: payload.error.stack?.split("\n").slice(0, 10), // First 10 stack frames
                  cause: payload.error.cause,
                }
              : {
                  message: String(payload.error),
                };

          if (isDynamicClientRegFailure) {
            logger.error("[MCP Connection Error] Dynamic client registration not supported", {
              url: payload.url,
              transport: payload.transport,
              state: payload.state,
              error: errorDetails,
              displayMessage: event.displayMessage,
              reason:
                "Server requires pre-registered OAuth clients (does not support dynamic registration)",
              requiresPreRegistration: true,
            });
          } else {
            logger.error("[MCP Connection Error] Connection initialization failed", {
              url: payload.url,
              transport: payload.transport,
              state: payload.state,
              error: errorDetails,
              displayMessage: event.displayMessage,
              fullPayload: payload,
            });
          }
        }
      }

      // Log discovery failures
      if (event.type === "mcp:client:discover") {
        const payload = event.payload as {
          url?: string;
          capability?: string;
          error?: unknown;
        };

        logger.info("[MCP Discovery]", {
          url: payload.url,
          capability: payload.capability,
          error: prepareErrorForLogging(payload.error),
          displayMessage: event.displayMessage,
        });
      }
    },
  };
}
