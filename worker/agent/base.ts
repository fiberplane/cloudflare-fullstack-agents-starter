import { Agent as BaseAgent } from "agents";

/**
 * Re-export the Agent class from the agents SDK with documented Props pattern.
 *
 * The Props pattern allows passing typed data to the agent when routing requests,
 * replacing the older "hydrate" pattern with a more explicit and type-safe approach.
 *
 * @example
 * ```typescript
 * // Define your props type
 * type MyAgentProps = {
 *   userId: string;
 *   workspaceId: string;
 * };
 *
 * // Define your state type
 * type MyAgentState = {
 *   initialized: boolean;
 * };
 *
 * // Create your agent extending the base Agent
 * class MyAgent extends Agent<CloudflareBindings, MyAgentState, MyAgentProps> {
 *   async onStart(props?: MyAgentProps): Promise<void> {
 *     if (props) {
 *       // Access typed props
 *       console.log(`User: ${props.userId}, Workspace: ${props.workspaceId}`);
 *     }
 *   }
 * }
 *
 * // Route with props
 * return routeAgentRequest(request, env, {
 *   prefix: "api/v1/agents",
 *   props: { userId: "123", workspaceId: "456" },
 * });
 * ```
 *
 * The Agent class from the SDK already supports a third generic parameter for Props:
 * - `Env` - The environment bindings type (e.g., CloudflareBindings)
 * - `State` - The agent's internal state type
 * - `Props` - The props type passed via routeAgentRequest (extends Record<string, unknown>)
 */
export { Agent } from "agents";

/**
 * Helper type to extract Props type from an Agent class.
 *
 * @example
 * ```typescript
 * type MyProps = AgentProps<typeof MyAgent>;
 * ```
 */
export type AgentProps<T> = T extends BaseAgent<infer _Env, infer _State, infer Props>
  ? Props
  : never;

/**
 * Helper type to extract State type from an Agent class.
 *
 * @example
 * ```typescript
 * type MyState = AgentState<typeof MyAgent>;
 * ```
 */
export type AgentState<T> = T extends BaseAgent<infer _Env, infer State, infer _Props>
  ? State
  : never;

/**
 * Helper type to extract Env type from an Agent class.
 *
 * @example
 * ```typescript
 * type MyEnv = AgentEnv<typeof MyAgent>;
 * ```
 */
export type AgentEnv<T> = T extends BaseAgent<infer Env, infer _State, infer _Props> ? Env : never;
