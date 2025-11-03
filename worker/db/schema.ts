import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export * from "./auth-schema";

import { user as usersTable } from "./auth-schema";

export type UserSelect = typeof usersTable.$inferSelect;

/**
 * Personal agents table that associates a created agent with a user
 */
export const personalAgents = sqliteTable("personal_agents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid())
    .unique()
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  agentName: text("agent_name").notNull(),
  archived: integer({ mode: "boolean" }).default(false).notNull(),
  createdAt: integer({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer({ mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type PersonalAgentSelect = typeof personalAgents.$inferSelect;
export type PersonalAgentInsert = typeof personalAgents.$inferInsert;
