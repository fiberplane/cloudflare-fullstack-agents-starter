/** biome-ignore-all lint/suspicious/noConsole: we want console logs in a script */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { getLocalD1DbPath } from "../drizzle-scripts/local";
import { account, session, user } from "../worker/db/auth-schema";

// Load environment variables from .dev.vars
config({ path: path.resolve(__dirname, "../.dev.vars") });

const ENVIRONMENT = process.env.ENVIRONMENT;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;

if (ENVIRONMENT !== "development") {
  console.error("❌ This script can only be run in development environment.");
  console.error(`   Current environment: ${ENVIRONMENT}`);
  console.error("   Set ENVIRONMENT=development in your .dev.vars file.");
  process.exit(1);
}

if (!BETTER_AUTH_SECRET) {
  console.error("❌ BETTER_AUTH_SECRET is required in .dev.vars");
  process.exit(1);
}

/**
 * Sign a cookie value using HMAC-SHA-256 (matching Better Auth's implementation)
 * @param value - The value to sign (session token)
 * @param secret - The secret to sign with (BETTER_AUTH_SECRET)
 * @returns - The signed value in format: value.base64_signature
 */
function signCookieValue(value: string, secret: string): string {
  // Create HMAC-SHA256 signature
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(value);
  const signature = hmac.digest("base64");

  // Return in format: token.signature
  return `${value}.${signature}`;
}

// Test user constants
const TEST_USER_ID = "fpc-test-playwright-user-id";
const TEST_USER_EMAIL = "playwright-test@fiberplane.dev";
const TEST_USER_NAME = "Playwright Test User";
const TEST_USER_GITHUB_USERNAME = "fpc-test-nae4-playwright-user";

// Storage state file path
const STORAGE_STATE_PATH = path.resolve(__dirname, "../.playwright-storage.json");

async function seedPlaywrightUser() {
  console.log("🎭 Seeding Playwright test user...\n");

  // Get local database path
  const localDbPath = getLocalD1DbPath();
  console.log(`📁 Database path: ${localDbPath}`);

  // Connect to database
  const client = createClient({ url: `file:${localDbPath}` });
  const db = drizzle(client);

  // Check if user already exists
  const existingUser = await db.select().from(user).where(eq(user.id, TEST_USER_ID)).get();

  let userId: string;

  if (existingUser) {
    console.log(`✓ User already exists: ${existingUser.email}`);
    userId = existingUser.id;
  } else {
    // Create test user
    const newUser = {
      id: TEST_USER_ID,
      name: TEST_USER_NAME,
      email: TEST_USER_EMAIL,
      emailVerified: true,
      image: null,
      githubUsername: TEST_USER_GITHUB_USERNAME,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(user).values(newUser);
    console.log(`✓ Created test user: ${TEST_USER_EMAIL}`);
    userId = TEST_USER_ID;
  }

  // Create or update session (expires in 1 year)
  const sessionToken = nanoid(32);
  const sessionId = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Delete existing sessions for this user
  await db.delete(session).where(eq(session.userId, userId));

  // Create new session
  const newSession = {
    id: sessionId,
    expiresAt,
    token: sessionToken,
    createdAt: new Date(),
    updatedAt: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "Playwright MCP Agent",
    userId,
  };

  await db.insert(session).values(newSession);
  console.log(`✓ Created session (expires: ${expiresAt.toISOString()})`);

  // Create fake account record (optional, for realism)
  const existingAccount = await db.select().from(account).where(eq(account.userId, userId)).get();

  if (!existingAccount) {
    const fakeAccount = {
      id: nanoid(32),
      accountId: "00000000",
      providerId: "github",
      userId,
      accessToken: "fake_access_token_for_testing",
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: "read:user,user:email",
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(account).values(fakeAccount);
    console.log("✓ Created fake GitHub account record");
  }

  // Sign the session token (Better Auth signs cookies with HMAC-SHA256)
  // biome-ignore lint/style/noNonNullAssertion: should be defined OR ELSE
  const signedSessionToken = signCookieValue(sessionToken, BETTER_AUTH_SECRET!);
  console.log(`✓ Signed session token`);

  // Generate Playwright storage state file
  const storageState = {
    cookies: [
      {
        name: "fpc.session_token",
        value: signedSessionToken,
        domain: "localhost",
        path: "/",
        expires: Math.floor(expiresAt.getTime() / 1000),
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
      },
    ],
    origins: [],
  };

  fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2));
  console.log(`✓ Generated storage state file: ${STORAGE_STATE_PATH}`);

  console.log("\n✅ Playwright test user setup complete!");
  console.log("\nNext steps:");
  console.log("1. Add Playwright MCP to your MCP servers config with:");
  console.log("   --isolated --storage-state=.playwright-storage.json");
  console.log("2. Restart Claude Desktop");
  console.log("3. Use Playwright tools to test the authenticated app at http://localhost:7676");
}

seedPlaywrightUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error seeding Playwright user:", error);
    process.exit(1);
  });
