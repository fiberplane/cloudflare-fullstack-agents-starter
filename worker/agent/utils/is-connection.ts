import type { Connection } from "agents";

/**
 * Type guard to check if a value is a Connection
 * @note - This is a workaround to properly override the onError method in Agent,
 *         which uses a method overload that we need to take into account.
 */
export const isConnection = (c: unknown): c is Connection => {
  return (
    typeof c === "object" &&
    c !== null &&
    "id" in c &&
    "setState" in c &&
    typeof c.setState === "function"
  );
};
