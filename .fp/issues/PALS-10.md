---
id: 6f8cb450-8747-4ff8-8d04-735cc0ddbe21
short_id: PALS-10
title: Add Agent base class with Props type support
status: todo
parent: PALS-1
branch: ""
range: null
created_at: 2025-12-14T10:09:27.180Z
updated_at: 2025-12-14T10:09:27.180Z
---

Create a typed Agent base class with Props pattern (FSH-18).

## Components
- Typed Agent class with generics for Env, State, Props
- Props type export for external use
- Implements onStart(props) lifecycle method
- Example usage in comments

## Files to Create
- worker/agent/base.ts (new)

## Reference
- See full-stack-honc/worker/agent/base.ts
- This replaces the older 'hydrate' pattern with modern 'props' pattern