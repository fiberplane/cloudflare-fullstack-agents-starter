/** biome-ignore-all lint/suspicious/noConsole: we want console logs in a script */
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

// HACK - To support Drizzle Studio locally
const STUDIO_LOCAL_DB = process.env.STUDIO_LOCAL_DB === "true";

let dbCredentials: { url?: string } | undefined;
if (STUDIO_LOCAL_DB) {
  dbCredentials = {
    url: getLocalDurableObjectDB(),
  };
}

export default defineConfig({
  out: "./worker/agent/storage/migrations",
  schema: "./worker/agent/storage/schema.ts",
  dialect: "sqlite",
  ...(STUDIO_LOCAL_DB
    ? {
        dbCredentials,
      }
    : {
        driver: "durable-sqlite",
      }),
});

function getLocalDurableObjectDB() {
  try {
    const basePath = path.resolve(path.join(".wrangler", "state", "v3", "do"));
    const files = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .filter((f: string) => f.endsWith(".sqlite"));

    // In case there are multiple .sqlite files, we want the most recent one.
    files.sort((a: string, b: string) => {
      const statA = fs.statSync(path.join(basePath, a));
      const statB = fs.statSync(path.join(basePath, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    const dbFile = files[0];

    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);

    return url;
  } catch (err) {
    if (err instanceof Error) {
      console.log(`Error resolving local DO DB: ${err.message}`);
    } else {
      console.log(`Error resolving local DO DB: ${err}`);
    }
  }
}
