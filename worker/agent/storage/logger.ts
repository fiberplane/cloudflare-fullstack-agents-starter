import { getLogger } from "@logtape/logtape";
import type { Logger as DrizzleLogger } from "drizzle-orm";
import { LOGGER_NAME } from "@/worker/constants";

const logger = getLogger([LOGGER_NAME, "personal-agent"]);

/**
 * A verbose Drizzle logger that logs all queries in the Durable Object's database
 */
export const drizzleLogger: DrizzleLogger = {
  logQuery(query, params) {
    const filteredParams = params.map((param) => {
      // HACK - Prevents us from polluting local dev console with large Buffers
      if (param instanceof Buffer) {
        return "Buffer (truncated)";
      }
      return param;
    });
    logger.debug("Drizzle query", {
      query,
      params: filteredParams,
    });
  },
};
