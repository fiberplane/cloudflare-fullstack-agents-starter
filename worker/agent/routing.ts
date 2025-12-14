import { routeAgentRequest as sdkRouteAgentRequest } from "agents";

/**
 * Props that can be forwarded to agents via routeAgentRequest.
 * Extend this type for agent-specific props.
 */
export type AgentRequestProps = {
  /** The authenticated user's ID */
  userId?: string;
  /** The current session ID */
  sessionId?: string;
  /** The server URL for callbacks */
  serverUrl?: string;
  /** Additional custom props */
  [key: string]: unknown;
};

/**
 * Options for routing agent requests
 */
export type RouteAgentRequestOptions = {
  /** Route prefix for agent endpoints */
  prefix?: string;
  /** Props to forward to the agent's onStart method */
  props?: AgentRequestProps;
  /** Whether to enable CORS */
  cors?: boolean | HeadersInit;
};

/**
 * Route a request to an agent with typed props support.
 *
 * This wrapper around the SDK's routeAgentRequest provides:
 * - Type-safe props forwarding to agent's onStart method
 * - Integration with auth middleware (userId, sessionId)
 * - Server URL forwarding for callbacks
 *
 * @example
 * ```typescript
 * // In your route handler
 * const response = await routeAgentRequest(c.req.raw, c.env, {
 *   prefix: "api/v1/agents",
 *   props: {
 *     userId: user.id,
 *     sessionId: session.id,
 *     serverUrl: new URL(c.req.url).origin,
 *   },
 * });
 * ```
 *
 * @param request - The incoming request
 * @param env - The environment bindings
 * @param options - Routing options including props
 * @returns Response from the agent or null if no route matched
 */
export async function routeAgentRequest<Env>(
  request: Request,
  env: Env,
  options?: RouteAgentRequestOptions,
): Promise<Response | null> {
  return sdkRouteAgentRequest(request, env, {
    prefix: options?.prefix,
    cors: options?.cors,
    props: options?.props,
  });
}

/**
 * Create props from a Hono context with common auth data.
 *
 * @example
 * ```typescript
 * const props = createPropsFromContext(c);
 * const response = await routeAgentRequest(c.req.raw, c.env, {
 *   prefix: "api/v1/agents",
 *   props,
 * });
 * ```
 */
export function createAgentProps(options: {
  userId?: string | null;
  sessionId?: string | null;
  serverUrl?: string;
  additionalProps?: Record<string, unknown>;
}): AgentRequestProps {
  const props: AgentRequestProps = {};

  if (options.userId) {
    props.userId = options.userId;
  }

  if (options.sessionId) {
    props.sessionId = options.sessionId;
  }

  if (options.serverUrl) {
    props.serverUrl = options.serverUrl;
  }

  if (options.additionalProps) {
    Object.assign(props, options.additionalProps);
  }

  return props;
}
