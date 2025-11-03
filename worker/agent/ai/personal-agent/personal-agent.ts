import type { LanguageModelV2 } from "@ai-sdk/provider";
import { type StreamTextOnFinishCallback, stepCountIs, streamText, type ToolSet } from "ai";
import SYSTEM_PROMPT from "./system-prompt.txt?raw";

/**
 * @todo - Not yet implemented, but the configuration parameters for the personal agent.
 */
export type PersonalAgentConfig = {
  systemPrompt?: string;
  temperature?: number;
};

export function handleUserQuery(
  model: LanguageModelV2,
  _config: PersonalAgentConfig,
  userQuery: string,
  onFinish: StreamTextOnFinishCallback<ToolSet>,
) {
  return streamText({
    /**
     * Enable "Extended Thinking" with Claude (Anthropic).
     * Remove this block to disable thinking.
     */
    providerOptions: {
      anthropic: {
        thinking: {
          type: "enabled",
          budgetTokens: 1200,
        },
      },
    },
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
        /**
         * Enable caching for the system prompt (Anthropic).
         * Caching won't take effect until the system prompt is sufficiently long.
         */
        providerOptions: {
          anthropic: {
            cacheControl: { type: "ephemeral" },
          },
        },
      },
      {
        role: "user",
        content: userQuery,
      },
    ],
    model,
    // TODO - Add mcp tools here
    // tools: [],
    stopWhen: stepCountIs(100), // Allow up to 100 steps for autonomous analysis
    onFinish,
  });
}
