import { z } from "zod";

/**
 * Shared WebSocket message schemas for type-safe communication
 * between the frontend and backend.
 */

// ============================================================================
// Client → Server Messages
// ============================================================================

export const mcpResetRequestSchema = z.object({
  type: z.literal("mcp:reset"),
  name: z.string().optional(),
  url: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export const clientMessageSchema = z.discriminatedUnion("type", [mcpResetRequestSchema]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;
export type McpResetRequest = z.infer<typeof mcpResetRequestSchema>;

// ============================================================================
// Server → Client Messages
// ============================================================================

export const mcpResetSuccessSchema = z.object({
  type: z.literal("mcp:reset:success"),
  data: z
    .object({
      servers: z.record(z.string(), z.unknown()).optional(),
      tools: z.array(z.unknown()).optional(),
      prompts: z.array(z.unknown()).optional(),
      resources: z.array(z.unknown()).optional(),
    })
    .optional(),
});

export const mcpResetErrorSchema = z.object({
  type: z.literal("mcp:reset:error"),
  error: z.string(),
});

export const serverMessageSchema = z.discriminatedUnion("type", [
  mcpResetSuccessSchema,
  mcpResetErrorSchema,
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;
export type McpResetSuccess = z.infer<typeof mcpResetSuccessSchema>;
export type McpResetError = z.infer<typeof mcpResetErrorSchema>;

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Parse and validate a client message from a WebSocket
 */
export function parseClientMessage(message: string): ClientMessage | null {
  try {
    const parsed = JSON.parse(message);
    const result = clientMessageSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse and validate a server message from a WebSocket
 */
export function parseServerMessage(message: string): ServerMessage | null {
  try {
    const parsed = JSON.parse(message);
    const result = serverMessageSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a type-safe server message
 */
export function createServerMessage<T extends ServerMessage["type"]>(
  type: T,
  payload: Omit<Extract<ServerMessage, { type: T }>, "type">,
): Extract<ServerMessage, { type: T }> {
  return { type, ...payload } as Extract<ServerMessage, { type: T }>;
}
