import jsLang from "@shikijs/langs-precompiled/javascript";
import jsonLang from "@shikijs/langs-precompiled/json";
import tomlLang from "@shikijs/langs-precompiled/toml";
import tsLang from "@shikijs/langs-precompiled/typescript";
import yamlLang from "@shikijs/langs-precompiled/yaml";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import * as engine from "shiki/wasm";
import customTheme from "./syntaxHighlightingTheme";

let instance: Promise<HighlighterCore> | null = null;
export function createHighlighter() {
  // This is a singleton instance of the highlighter.
  // To avoid creating a new instance every time the highlighter is used.
  if (!instance) {
    instance = createHighlighterCore({
      themes: [customTheme],

      langs: [tsLang, jsLang, jsonLang, yamlLang, tomlLang],
      // Alternative engine (@see https://shiki.style/guide/regex-engines#javascript-regexp-engine):
      // engine: createJavaScriptRegexEngine(),
      engine: createOnigurumaEngine(() => engine),
    });
  }

  return instance;
}
