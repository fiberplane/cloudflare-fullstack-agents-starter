import type { MCPServersState } from "agents";
import { useAgent } from "agents/react";
import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { deriveUiState, getDisableReason } from "./derive-ui-state";
import { type AgentStore, createAgentStore } from "./store";
import type { McpServerInfo, McpToolInfo } from "./types";

export type UseAgentConnectionOptions = {
  agentId: string;
  prefix?: string;
  agentType?: string;
};

export function useAgentConnection(options: UseAgentConnectionOptions) {
  const { agentId, prefix = "api/v1/agents", agentType = "personal-agent" } = options;

  // Create store once per component instance
  const storeRef = useRef<AgentStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createAgentStore();
  }
  const store = storeRef.current;

  // Subscribe to store changes with useSyncExternalStore
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  // Set up agent connection
  const agent = useAgent({
    prefix,
    agent: agentType,
    name: agentId,
    onOpen: () => {
      console.log("[Agent Connection] Connection established");
      store.setConnectionStatus("connected");
    },
    onClose: () => {
      console.log("[Agent Connection] Connection closed");
      store.setConnectionStatus("disconnected");
      store.setError({ message: "Connection closed unexpectedly" });
    },
    onError: (event) => {
      console.error("[Agent Connection] Connection error:", event);
      store.setConnectionStatus("error");
      store.setError({ message: "Connection error occurred" });
    },
    onMcpUpdate: (mcpState: MCPServersState) => {
      console.log("[Agent Connection] MCP state update:", mcpState);
      store.setMcpState(mcpState);
    },
    onMessage: (message) => {
      console.log("[Agent Connection] Raw message received:", message.data);
      try {
        const parsed = JSON.parse(message.data) as {
          type: string;
          data?: MCPServersState;
          error?: string;
        };

        if (parsed.type === "mcp:reset:success") {
          console.log("[Agent Connection] MCP reset successful:", parsed.data);
          store.setResetInFlight(false);
          if (parsed.data) {
            store.setMcpState({
              servers: parsed.data.servers || {},
              tools: parsed.data.tools || [],
              prompts: parsed.data.prompts || [],
              resources: parsed.data.resources || [],
            });
          }
        }

        if (parsed.type === "mcp:reset:error") {
          console.error("[Agent Connection] MCP reset failed:", parsed.error);
          store.setResetInFlight(false);
          store.setError({ message: parsed.error || "Reset failed" });
        }
      } catch (error) {
        console.error("[Agent Connection] Error parsing message:", error);
      }
    },
  });

  // Derive UI state
  const uiState = useMemo(() => deriveUiState(state), [state]);
  const disableReason = useMemo(() => getDisableReason(uiState), [uiState]);
  const canStartReview = uiState === "ready";

  // Get server info
  const server: McpServerInfo | undefined = useMemo(() => {
    if (!state.selectedServerId || !state.mcpState) {
      return undefined;
    }
    return state.mcpState.servers[state.selectedServerId] as McpServerInfo | undefined;
  }, [state.selectedServerId, state.mcpState]);

  // Get tools
  const tools: McpToolInfo[] = useMemo(() => {
    return (state.mcpState?.tools || []) as McpToolInfo[];
  }, [state.mcpState]);

  // Reset connection handler
  const resetConnection = useCallback(() => {
    if (!confirm("Reset MCP connection? This will clear the current state and try to reconnect.")) {
      return;
    }

    console.log("[Agent Connection] Sending reset request...");

    store.setResetInFlight(true);
    agent.send(
      JSON.stringify({
        type: "mcp:reset",
      }),
    );
  }, [agent, store]);

  return {
    agent,
    uiState,
    canStartReview,
    disableReason,
    server,
    tools,
    error: state.error,
    resetConnection,
    connectionStatus: state.connectionStatus,
    resetInFlight: state.resetInFlight,
  };
}
