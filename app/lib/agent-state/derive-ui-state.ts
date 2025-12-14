import type { AgentConnectionState, AgentUiState } from "./types";

/**
 * Derives the UI state from the raw agent connection state.
 * This replaces the complex state machine transitions with simple derived logic.
 */
export function deriveUiState(state: AgentConnectionState): AgentUiState {
  const { connectionStatus, mcpState, selectedServerId } = state;

  // If we're not connected yet or have no MCP state, we're initializing
  if (connectionStatus === "connecting" || !mcpState) {
    return "initializing";
  }

  // Connection error
  if (connectionStatus === "error") {
    return "failed";
  }

  // No servers available
  if (Object.keys(mcpState.servers).length === 0) {
    return "noServer";
  }

  // Check selected server state
  if (selectedServerId) {
    const server = mcpState.servers[selectedServerId];

    if (server) {
      if (server.state === "ready") {
        return "ready";
      }

      if (server.state === "authenticating") {
        return "needsAuth";
      }

      if (server.state === "failed") {
        return "failed";
      }
    }
  }

  // Default to initializing if state is unclear
  return "initializing";
}

/**
 * Gets the disable reason for UI elements based on the current state
 */
export function getDisableReason(uiState: AgentUiState): string | undefined {
  switch (uiState) {
    case "initializing":
      return "Loading server info...";
    case "noServer":
      return "No server available";
    case "needsAuth":
      return "Server needs authentication";
    case "failed":
      return "Server not connected";
    case "ready":
      return undefined;
  }
}
