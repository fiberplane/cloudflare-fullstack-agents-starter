import { createAnthropic } from "@ai-sdk/anthropic";
// @ts-expect-error - this is used in the fallback model code below
// biome-ignore lint/correctness/noUnusedImports: we import this to show how to use fallback models
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { createAiGateway } from "ai-gateway-provider";
import type { AiContext } from "./types";

/**
 * Creates a `LanguageModelV2` instance that can be used with the Vercel AI SDK.
 *
 * In our case, we use a combination of Anthropic and OpenAI models, wrapped in the Cloudflare AI Gateway provider.
 *
 * We do not use fallback models by default, to reduce out-of-the-box configuration.
 * However, there is some code below that shows you how to use openai fallback models.
 */
export function createAiModel(
  context: AiContext,
  additionalMetadata?: Record<string, number | string | boolean | null | bigint>,
): LanguageModelV2 {
  const metadata = mergeMetadata(context.gatewayMetadata, additionalMetadata);

  const anthropic = createAnthropic({
    apiKey: context.anthropicApiKey,
  });

  // This is where you would instantiate the OpenAI instance, if you wanted a fallback
  //
  // const openai = createOpenAI({
  //   apiKey: context.openAiApiKey,
  // });

  const aiGateway = createAiGateway({
    accountId: context.gatewayAccountId,
    gateway: context.gatewayName,
    options: {
      metadata: metadata,
      skipCache: true,
    },
  });

  const model = aiGateway([
    anthropic("claude-sonnet-4-5"),
    // This is where you would add a fallback model, if you wanted to.
    //
    // openai("gpt-4.1-2025-04-14")
  ]);

  return model;
}

/**
 * Merges multiple metadata objects into a single object, filtering out falsy values.
 * If the resulting object is empty, it returns `undefined`.
 *
 * @param metadata - Variable number of metadata objects to merge. Each object contains
 *                   key-value pairs where values can be number, string, boolean, null, or bigint.
 * @returns A new object containing all non-falsy key-value pairs from the input objects.
 *          If multiple objects contain the same key, the last non-falsy value wins.
 *
 * @example
 * ```typescript
 * const result = mergeMetadata(
 *   { name: "John", age: 30, active: false },
 *   { age: 31, city: "NYC", active: null },
 *   { active: true }
 * );
 * // Returns: { name: "John", age: 31, city: "NYC", active: true }
 * ```
 */
export function mergeMetadata(
  ...metadata: Array<Record<string, number | string | boolean | null | bigint> | undefined>
): Record<string, number | string | boolean | null | bigint> | undefined {
  const result: Record<string, number | string | boolean | null | bigint> = {};

  for (const obj of metadata) {
    if (obj) {
      for (const key in obj) {
        if (obj[key]) {
          result[key] = obj[key];
        }
      }
    }
  }

  return Object.keys(result).length === 0 ? undefined : result;
}
