import type { ThemeRegistrationResolved } from "shiki";

/**
 * To improve the theme, you can use vscode to inspect scopes in actual source code. It doesn't
 * always translate one to one, but it's a good starting point.
 *
 * For example, to find the scope for a function call, you can:
 * 1. Open the file in vscode
 * 2. Select the function call
 * 3. Open the command palette and run "Developer: Inspect Editor Tokens and Scopes"
 * 4. Look for the scope in the list
 */
export default {
  name: "CUSTOM",
  type: "dark" as const,
  fg: "hsl(var(--foreground))",
  bg: "hsl(var(--background))",
  settings: [
    {
      settings: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
    {
      name: "Storage Modifiers",
      scope: ["storage.modifier", "storage.type"],
      settings: {
        foreground: "hsl(var(--muted-foreground))",
      },
    },
    {
      name: "Comments",
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "hsl(var(--muted-foreground))",
      },
    },
    {
      name: "Punctuation",
      scope: "punctuation",
      settings: {
        foreground: "hsl(var(--muted-foreground))",
      },
    },
    {
      name: "Tags and Operators",
      scope: ["tag", "operator", "number"],
      settings: {
        foreground: "#88C0D0",
      },
    },

    {
      name: "Strings, keys and Values",
      scope: [
        "string",
        "punctuation.definition.string",
        "attr-value",
        "url",
        "constant.language",
        "constant.language.boolean",
        // The keys in object literals:
        "meta.object-literal.key",
      ],
      settings: {
        foreground: "#81A1C1",
      },
    },
    {
      name: "Keywords and Controls",
      scope: ["keyword"],
      settings: {
        foreground: "hsl(var(--muted-foreground))",
      },
    },
    {
      name: "function calls",
      scope: ["entity.name.function", "meta.function-call.ts"],
      settings: {
        foreground: "#B48EAD",
      },
    },
    {
      name: "blocks",
      scope: ["punctuation.definition.block.ts"],
      settings: {
        foreground: "hsl(var(--fg-subtle))",
      },
    },
    {
      name: "imports",
      scope: ["variable.other.readwrite.alias.ts"],
      settings: {
        foreground: "hsl(var(--foreground))",
      },
    },
  ],
} satisfies ThemeRegistrationResolved;
