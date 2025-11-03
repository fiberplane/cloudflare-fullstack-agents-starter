import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";
import svgr from "vite-plugin-svgr";

/**
 * Custom plugin to make vite play nicely with drizzle durable object database migration files
 */
const sqlLoader = (): Plugin => {
  return {
    name: "sql-loader",
    transform(code, id) {
      if (id.endsWith(".sql")) {
        const escapedCode = code
          .replace(/\\/g, "\\\\")
          .replace(/`/g, "\\`")
          .replace(/\${/g, "\\${");
        return `export default \`${escapedCode}\`;`;
      }
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    port: 7676,
    host: "0.0.0.0",
    allowedHosts: [
      "localhost",
      // For tunneling purposes
      ".fiberplane.io",
      ".cfargotunnel.com",
      ".trycloudflare.com",
    ],
  },
  plugins: [
    sqlLoader(),
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./app/routes",
      generatedRouteTree: "./app/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    cloudflare(),
    svgr(),
  ],
});
