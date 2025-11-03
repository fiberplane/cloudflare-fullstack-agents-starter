import { useMachine, useSelector } from "@xstate/react";
import type { MCPServersState } from "agents";
import { useAgent } from "agents/react";
import { useCallback } from "react";
import { mcpServerMachine } from "./mcp-server-machine";

export type McpServerUiState = "initializing" | "noServer" | "needsAuth" | "failed" | "ready";

export type McpServerInfo = {
  name: string;
  state: string;
  server_url: string;
  auth_url?: string | null;
};

export function useMcpServer(personalAgentId: string) {
  const [_machineState, sendEvent, machineRef] = useMachine(mcpServerMachine);

  const agent = useAgent({
    prefix: "api/v1/agents",
    agent: "personal-agent",
    name: personalAgentId,
    onOpen: () => {
      console.log("[MCP Server Hook] Connection established");
      sendEvent({ type: "connected" });
    },
    onClose: () => {
      console.log("[MCP Server Hook] Connection closed");
      sendEvent({
        type: "connection.error",
        error: { message: "Connection closed unexpectedly" },
      });
    },
    onError: (event) => {
      console.error("[MCP Server Hook] Connection error:", event);
      sendEvent({
        type: "connection.error",
        error: { message: "Connection error occurred" },
      });
    },
    onMcpUpdate: (state: MCPServersState) => {
      console.log("[MCP Server Hook] onMcpUpdate callback triggered with state:", state);
      console.log("[MCP Server Hook] Servers:", Object.keys(state.servers));
      console.log("[MCP Server Hook] Tools count:", state.tools.length);
      sendEvent({
        type: "mcp.update",
        state,
      });
    },
    onMessage: (message) => {
      console.log("[MCP Server Hook] Raw message received:", message.data);
      try {
        const parsed = JSON.parse(message.data) as {
          type: string;
          data?: MCPServersState;
          error?: string;
        };

        console.log("[MCP Server Hook] Parsed message type:", parsed.type);

        if (parsed.type === "mcp:reset:success") {
          console.log("[MCP Server Hook] MCP reset successful:", parsed.data);
          sendEvent({
            type: "reset.success",
            state: parsed.data
              ? {
                  servers: parsed.data.servers || {},
                  tools: parsed.data.tools || [],
                  prompts: parsed.data.prompts || [],
                  resources: parsed.data.resources || [],
                }
              : undefined,
          });
        }

        if (parsed.type === "mcp:reset:error") {
          console.error("[MCP Server Hook] MCP reset failed:", parsed.error);
          sendEvent({
            type: "reset.error",
            error: { message: parsed.error || "Reset failed" },
          });
        }
      } catch (error) {
        console.error("[MCP Server Hook] Error parsing message:", error);
      }
    },
  });

  const mcpState = useSelector(machineRef, (state) => state.context.mcpState);
  const selectedServerId = useSelector(machineRef, (state) => state.context.selectedServerId);
  const error = useSelector(machineRef, (state) => state.context.error);

  const uiState: McpServerUiState = useSelector(machineRef, (state) => {
    if (state.matches("Initializing")) {
      return "initializing";
    }

    if (state.matches("NoServer")) {
      return "noServer";
    }

    if (state.matches("NeedsAuth")) {
      return "needsAuth";
    }

    if (state.matches("Failed")) {
      return "failed";
    }

    if (state.matches("Ready")) {
      return "ready";
    }

    return "initializing";
  });

  const server: McpServerInfo | undefined =
    selectedServerId && mcpState ? mcpState.servers[selectedServerId] : undefined;

  const tools: Array<{ name: string; description?: string }> = mcpState?.tools || [];

  const canStartReview = uiState === "ready";

  const disableReason: string | undefined = (() => {
    if (uiState === "initializing") {
      return "Loading server info...";
    }

    if (uiState === "noServer") {
      return "No server available";
    }

    if (uiState === "needsAuth") {
      return "Server needs authentication";
    }

    if (uiState === "failed") {
      return "Server not connected";
    }

    return undefined;
  })();

  const resetConnection = useCallback(() => {
    if (!confirm("Reset MCP connection? This will clear the current state and try to reconnect.")) {
      return;
    }

    console.log("[MCP Server Hook] Sending reset request...");

    agent.send(
      JSON.stringify({
        type: "mcp:reset",
      }),
    );

    sendEvent({ type: "reset.request" });
  }, [agent, sendEvent]);

  return {
    agent,
    uiState,
    canStartReview,
    disableReason,
    server,
    tools,
    error,
    resetConnection,
  };
}
