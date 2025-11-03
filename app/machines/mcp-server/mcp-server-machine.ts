import type { MCPServersState } from "agents";
import { assign, setup } from "xstate";

export type McpServerMachineContext = {
  mcpState: MCPServersState | null;
  selectedServerId: string | null;
  error: { message: string } | null;
  resetInFlight: boolean;
};

type ConnectedEvent = {
  type: "connected";
};

type ConnectionErrorEvent = {
  type: "connection.error";
  error: { message: string };
};

type McpUpdateEvent = {
  type: "mcp.update";
  state: MCPServersState;
};

type ResetRequestEvent = {
  type: "reset.request";
};

type ResetSuccessEvent = {
  type: "reset.success";
  state?: MCPServersState;
};

type ResetErrorEvent = {
  type: "reset.error";
  error: { message: string };
};

export type McpServerEvent =
  | ConnectedEvent
  | ConnectionErrorEvent
  | McpUpdateEvent
  | ResetRequestEvent
  | ResetSuccessEvent
  | ResetErrorEvent;

export const mcpServerMachine = setup({
  types: {
    context: {} as McpServerMachineContext,
    events: {} as McpServerEvent,
  },
  guards: {
    hasNoServers: ({ event }) => {
      console.log("[MCP Machine Guard] hasNoServers - checking event:", event.type);
      if (event.type !== "mcp.update") {
        return false;
      }

      const hasNo = Object.keys(event.state.servers).length === 0;
      console.log("[MCP Machine Guard] hasNoServers result:", hasNo);
      return hasNo;
    },
    isServerReady: ({ event }) => {
      console.log("[MCP Machine Guard] isServerReady - checking event:", event.type);
      if (event.type !== "mcp.update") {
        console.log("[MCP Machine Guard] isServerReady - not an mcp.update event");
        return false;
      }

      const serverIds = Object.keys(event.state.servers);
      const selectedServerId = serverIds[0];

      if (!selectedServerId) {
        console.log("[MCP Machine Guard] isServerReady - no server ID found");
        return false;
      }

      const server = event.state.servers[selectedServerId];
      const isReady = server?.state === "ready";
      console.log(
        "[MCP Machine Guard] isServerReady - server state:",
        server?.state,
        "result:",
        isReady,
      );
      return isReady;
    },
    isServerAuthenticating: ({ event }) => {
      console.log("[MCP Machine Guard] isServerAuthenticating - checking event:", event.type);
      if (event.type !== "mcp.update") {
        return false;
      }

      const serverIds = Object.keys(event.state.servers);
      const selectedServerId = serverIds[0];

      if (!selectedServerId) {
        return false;
      }

      const server = event.state.servers[selectedServerId];
      const isAuth = server?.state === "authenticating";
      console.log(
        "[MCP Machine Guard] isServerAuthenticating - server state:",
        server?.state,
        "result:",
        isAuth,
      );
      return isAuth;
    },
    isServerFailed: ({ event }) => {
      console.log("[MCP Machine Guard] isServerFailed - checking event:", event.type);
      if (event.type !== "mcp.update") {
        return false;
      }

      const serverIds = Object.keys(event.state.servers);
      const selectedServerId = serverIds[0];

      if (!selectedServerId) {
        return false;
      }

      const server = event.state.servers[selectedServerId];
      const isFailed = server?.state === "failed";
      console.log(
        "[MCP Machine Guard] isServerFailed - server state:",
        server?.state,
        "result:",
        isFailed,
      );
      return isFailed;
    },
  },
  actions: {
    storeError: assign({
      error: ({ event }) => {
        if (event.type === "connection.error") {
          return event.error;
        }

        if (event.type === "reset.error") {
          return event.error;
        }

        return null;
      },
    }),
    clearError: assign({
      error: () => null,
    }),
    storeMcpUpdate: assign({
      mcpState: ({ event }) => {
        if (event.type === "mcp.update") {
          console.log("[MCP Machine] Storing MCP update:", event.state);
          return event.state;
        }

        return null;
      },
      selectedServerId: ({ event }) => {
        if (event.type === "mcp.update") {
          const serverIds = Object.keys(event.state.servers);

          console.log("[MCP Machine] Server IDs found:", serverIds);

          if (serverIds.length > 1) {
            console.warn(
              `[MCP Server Machine] Multiple servers detected (${serverIds.length}). Using first server: ${serverIds[0]}`,
            );
          }

          const selectedId = serverIds[0] || null;
          console.log("[MCP Machine] Selected server ID:", selectedId);

          if (selectedId) {
            const server = event.state.servers[selectedId];
            console.log("[MCP Machine] Selected server state:", server?.state);
          }

          return selectedId;
        }

        return null;
      },
    }),
    storeResetSuccess: assign({
      mcpState: ({ event }) => {
        if (event.type === "reset.success" && event.state) {
          return event.state;
        }

        return null;
      },
      selectedServerId: ({ event }) => {
        if (event.type === "reset.success" && event.state) {
          const serverIds = Object.keys(event.state.servers);

          if (serverIds.length > 1) {
            console.warn(
              `[MCP Server Machine] Multiple servers detected after reset (${serverIds.length}). Using first server: ${serverIds[0]}`,
            );
          }

          return serverIds[0] || null;
        }

        return null;
      },
      resetInFlight: () => false,
    }),
    markResetInFlight: assign({
      resetInFlight: () => true,
    }),
    clearResetInFlight: assign({
      resetInFlight: () => false,
    }),
  },
}).createMachine({
  id: "mcpServerMachine",
  initial: "Initializing",
  context: {
    mcpState: null,
    selectedServerId: null,
    error: null,
    resetInFlight: false,
  },
  states: {
    Initializing: {
      after: {
        10000: {
          target: "Failed",
          actions: assign({
            error: () => ({
              message: "Connection timeout: Failed to receive MCP server state within 10 seconds",
            }),
          }),
        },
      },
      on: {
        "connection.error": {
          target: "Failed",
          actions: "storeError",
        },
        "mcp.update": [
          {
            guard: "hasNoServers",
            target: "NoServer",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerReady",
            target: "Ready",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerAuthenticating",
            target: "NeedsAuth",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerFailed",
            target: "Failed",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            actions: "storeMcpUpdate",
          },
        ],
      },
    },
    NoServer: {
      on: {
        "connection.error": {
          target: "Failed",
          actions: "storeError",
        },
        "mcp.update": [
          {
            guard: "hasNoServers",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerReady",
            target: "Ready",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerAuthenticating",
            target: "NeedsAuth",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerFailed",
            target: "Failed",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            target: "Initializing",
            actions: "storeMcpUpdate",
          },
        ],
        "reset.request": {
          target: "Initializing",
          actions: "markResetInFlight",
        },
      },
    },
    NeedsAuth: {
      on: {
        "connection.error": {
          target: "Failed",
          actions: "storeError",
        },
        "mcp.update": [
          {
            guard: "hasNoServers",
            target: "NoServer",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerReady",
            target: "Ready",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerAuthenticating",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerFailed",
            target: "Failed",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            target: "Initializing",
            actions: "storeMcpUpdate",
          },
        ],
        "reset.request": {
          target: "Initializing",
          actions: "markResetInFlight",
        },
      },
    },
    Ready: {
      on: {
        "connection.error": {
          target: "Failed",
          actions: "storeError",
        },
        "mcp.update": [
          {
            guard: "hasNoServers",
            target: "NoServer",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerReady",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerAuthenticating",
            target: "NeedsAuth",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerFailed",
            target: "Failed",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            target: "Initializing",
            actions: "storeMcpUpdate",
          },
        ],
        "reset.request": {
          target: "Initializing",
          actions: "markResetInFlight",
        },
      },
    },
    Failed: {
      on: {
        "mcp.update": [
          {
            guard: "hasNoServers",
            target: "NoServer",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerReady",
            target: "Ready",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerAuthenticating",
            target: "NeedsAuth",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            guard: "isServerFailed",
            actions: ["storeMcpUpdate", "clearError"],
          },
          {
            target: "Initializing",
            actions: "storeMcpUpdate",
          },
        ],
        "reset.request": {
          target: "Initializing",
          actions: ["markResetInFlight", "clearError"],
        },
        "reset.success": {
          target: "Initializing",
          actions: ["storeResetSuccess", "clearError"],
        },
        "reset.error": {
          actions: "storeError",
        },
      },
    },
  },
});
