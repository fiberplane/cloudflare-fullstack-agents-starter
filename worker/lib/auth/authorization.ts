import { HTTPException } from "hono/http-exception";
import type { PersonalAgentSelect } from "../../db/schema";
import type { AuthUser } from "./types";

/**
 * Authorizes that a personal agent belongs to a user.
 *
 * @throws {HTTPException} 401 if user is not present
 * @throws {HTTPException} 403 if personal agent does not belong to user
 */
export function authorizePersonalAgentForUser(
  user: AuthUser | null,
  personalAgent: PersonalAgentSelect,
): asserts user is AuthUser {
  if (!user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  if (personalAgent.userId !== user.id) {
    throw new HTTPException(403, { message: "Forbidden" });
  }
}
