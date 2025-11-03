/**
 * Schema for Agent DO's SQLite storage.
 * Stores persistent data that needs to survive DO restarts.
 */

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { TaskPriority, TaskStatus } from "../dtos/tasks";

/**
 * Agent task list table for tracking work items across conversation turns.
 * Each task represents a discrete piece of work the agent needs to complete.
 * Tasks are associated with a specific message context and can have dependencies.
 */
export const agentTasksTable = sqliteTable("agent_tasks", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(), // Short descriptive title
  description: text("description"), // Optional detailed description
  status: text("status").$type<TaskStatus>().notNull().default("pending"),
  priority: text("priority").$type<TaskPriority>().notNull().default("medium"),
  // Index for ordering tasks
  sortOrder: integer("sort_order").notNull().default(0),
  // Optional metadata for extensibility (JSON)
  metadata: text("metadata", { mode: "json" }),
  // Timestamps for lifecycle tracking
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type AgentTaskSelect = typeof agentTasksTable.$inferSelect;
export type AgentTaskInsert = typeof agentTasksTable.$inferInsert;
