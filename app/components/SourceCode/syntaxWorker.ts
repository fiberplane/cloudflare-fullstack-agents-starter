// import jsLang from "@shikijs/langs-precompiled/javascript";
// import jsonLang from "@shikijs/langs-precompiled/json";
import mdLang from "@shikijs/langs-precompiled/markdown";
// import tomlLang from "@shikijs/langs-precompiled/toml";
// import tsLang from "@shikijs/langs-precompiled/typescript";
// import yamlLang from "@shikijs/langs-precompiled/yaml";
import type { ShikiTransformer } from "shiki";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import * as engine from "shiki/wasm";
import customTheme from "./syntaxHighlightingTheme";

let highlighter: Awaited<ReturnType<typeof createHighlighterCore>> | null = null;

// Initialize the highlighter
async function initializeHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighterCore({
      themes: [customTheme],
      langs: [mdLang],
      engine: createOnigurumaEngine(() => engine),
    });
  }
  return highlighter;
}

initializeHighlighter().then(() => {
  self.postMessage({ type: "ready" });
});

// Handle messages from the main thread
self.onmessage = async (e: MessageEvent) => {
  const { content, language = "ts", className, lineNumberOffset = 0 } = e.data;
  try {
    // Initialize highlighter if not already initialized
    if (!highlighter) {
      console.error("Highlighter not initialized");
      return;
    }

    const transformers: ShikiTransformer[] = [
      {
        name: "line-numbers",
        code(node) {
          node.properties.style = "counter-reset: line";
        },
        line(node, line) {
          // Add the offset to the line number
          const adjustedLine = line + lineNumberOffset;
          node.properties["data-line"] = adjustedLine;
          node.properties.style = "counter-increment: line";
        },
      },
      {
        name: "add-classname",
        pre(node) {
          if (className) {
            if (typeof node.properties.class === "string") {
              node.properties.class = `${node.properties.class} ${className}`;
            } else if (Array.isArray(node.properties.class)) {
              node.properties.class.push(className);
            } else {
              node.properties.class = className;
            }
          }
        },
      },
    ];

    const hast = highlighter.codeToHast(content, {
      lang: language,
      transformers,
      themes: { light: "CUSTOM", dark: "CUSTOM" },
    });

    // Send the result back to the main thread
    self.postMessage({ type: "success", hast });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    self.postMessage({ type: "error", error: errorMessage });
  }
};
