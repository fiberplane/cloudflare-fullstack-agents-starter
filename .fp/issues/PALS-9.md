---
id: 0752afc1-c2bb-4d77-bdb0-0f83568badbb
short_id: PALS-9
title: Implement state management pattern for agent connections (no x-state)
status: done
parent: PALS-1
branch: ""
range:
  base:
    _tag: git
    sha: d6e0a75640a8e99a6ffbd3e669c448100d884079
  tip:
    _tag: git
    sha: d6e0a75640a8e99a6ffbd3e669c448100d884079
created_at: 2025-12-14T10:09:09.961Z
updated_at: 2025-12-14T11:02:31.496Z
---

Add state management for agent/websocket connections using a simpler pattern than x-state (FSH-5).

## Pattern Features
- Simple global store with listeners
- Derived UI state instead of complex state machines
- useSyncExternalStore for global access
- No x-state dependency

## Files to Create
- app/lib/agent-state/store.ts
- app/lib/agent-state/derive-ui-state.ts
- app/lib/agent-state/use-agent-connection.ts
- app/lib/agent-state/types.ts
- app/lib/agent-state/index.ts

## Notes
- Remove x-state and @xstate/react dependencies
- Update existing components that use xstate

## Reference
- See full-stack-honc/src/lib/agent-state/