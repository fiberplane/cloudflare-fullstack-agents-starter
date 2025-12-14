---
id: 1e732d48-fba2-40aa-ae8f-5be340957732
short_id: PALS-8
title: Share websocket event/message types between backend and frontend
status: done
parent: PALS-1
branch: ""
range:
  base:
    _tag: git
    sha: ff2e40f20951b1cd9d6d11a0a131503a2b67a1bf
  tip:
    _tag: git
    sha: ff2e40f20951b1cd9d6d11a0a131503a2b67a1bf
created_at: 2025-12-14T10:09:08.330Z
updated_at: 2025-12-14T10:59:30.344Z
---

Create shared Zod schemas for websocket messages (FSH-6).

## Key Components
- Discriminated unions for type-safe message handling
- Server → Client and Client → Server message schemas
- Runtime validation with Zod
- Full TypeScript inference

## Files to Create
- worker/schemas/websocket-messages.ts (new)
- Update path aliases if needed for @/worker imports from frontend

## Reference
- See full-stack-honc/worker/schemas/websocket-messages.ts