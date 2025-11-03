import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],

  test: {
    environment: "node",
    environmentMatchGlobs: [
      // Use jsdom for client-side tests
      ["app/**", "jsdom"],
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
