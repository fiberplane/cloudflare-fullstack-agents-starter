import { describe, expect, it, vi } from "vitest";

// Mock the env-utils module before importing allow-list
// This prevents "cloudflare:workers" module issues in tests
// The mock is hoisted by vitest, so it will be in place before allow-list is imported
vi.mock("../env-utils", () => ({
  isDevelopmentEnv: vi.fn(() => false),
}));

import { isAllowedGitHubUsername } from "./allow-list";

describe("isAllowedGitHubUsername", () => {
  it("should allow the username brettimus", async () => {
    const isAllowed = await isAllowedGitHubUsername("brettimus");
    expect(isAllowed).toBe(true);
  });

  it("should not allow the playwright test user when isDevelopmentEnv is false", async () => {
    const isAllowed = await isAllowedGitHubUsername("fpc-test-nae4-playwright-user");
    expect(isAllowed).toBe(false);
  });
});
