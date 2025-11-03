/** biome-ignore-all lint/suspicious/noConsole: we want console logs in a script */

/**
 * This file is used to generate the schema for the Better Auth database.
 *
 * In practice, we will only use this if we expand our auth strategies.
 * When you add a new provider, make sure this is in sync with the auth configuration in the backend.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";

const localDbPath = getLocalD1DB();

if (!localDbPath) {
  throw new Error("Local D1 DB not found");
}

// Create a dummy client pointing to a local file.
// This database won't actually be used beyond schema generation.
const mockClient = createClient({ url: `file:${localDbPath}` });
const mockDb = drizzle(mockClient);

export const auth = betterAuth({
  user: {
    additionalFields: {
      githubUsername: {
        type: "string", // Match the type in your database
        required: false, // Or true, if every user must have it
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          // Map GitHub login to our custom field
          githubUsername: profile.login,
        };
      },
    },
  },
  database: drizzleAdapter(mockDb, {
    provider: "sqlite",
  }),
  // You can omit runtime-specific variables like baseURL and secrets here,
  // as they are not needed for schema generation.
});

/**
 * Utility to get the path to the local D1 DB.
 * Used for schema generation only.
 *
 * This will break if we introduce additional D1 databases
 *
 * @NOTE - We cannot use the `getLocalD1DbPath` function from the `drizzle-scripts/local.ts` file
 *         because it fails to execute with the better auth cli due to the dependency on wrangler
 */
function getLocalD1DB() {
  try {
    const basePath = path.resolve(".wrangler", "state", "v3", "d1");
    const files = fs
      .readdirSync(basePath, { encoding: "utf-8", recursive: true })
      .filter((f) => f.endsWith(".sqlite"));

    // In case there are multiple .sqlite files, we want the most recent one.
    files.sort((a, b) => {
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
      console.log(`Error resolving local D1 DB: ${err.message}`);
    } else {
      console.log(`Error resolving local D1 DB: ${err}`);
    }
  }
}
