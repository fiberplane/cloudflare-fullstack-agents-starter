import { z } from "zod";

export const TaskStatusSchema = z.enum(["pending", "in_progress", "completed", "cancelled"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

// Task priority ordering utilities
export const TASK_PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
} as const;

export function getTaskPriorityValue(priority: TaskPriority): number {
  return TASK_PRIORITY_ORDER[priority];
}

export function compareTasksByPriority<T extends { priority: TaskPriority; sortOrder: number }>(
  a: T,
  b: T,
): number {
  const aPriority = getTaskPriorityValue(a.priority);
  const bPriority = getTaskPriorityValue(b.priority);

  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }
  return a.sortOrder - b.sortOrder;
}
