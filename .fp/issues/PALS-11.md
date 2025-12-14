---
id: ec86d963-168e-431d-bd89-7a85e62bb034
short_id: PALS-11
title: Add routeAgentRequest helper with props forwarding
status: todo
parent: PALS-1
branch: ""
range: null
created_at: 2025-12-14T10:09:29.601Z
updated_at: 2025-12-14T10:09:29.601Z
---

Create a helper function to route requests to agents with props (FSH-19).

## Implementation
- Wrap routeAgentRequest from agents SDK
- Forward userId, sessionId, serverUrl as props
- Integrate with existing Hono auth middleware

## Files to Create
- worker/agent/routing.ts (new)

## Dependencies
- Requires Agent base class (PALS-10)

## Reference
- See full-stack-honc/worker/agent/routing.ts