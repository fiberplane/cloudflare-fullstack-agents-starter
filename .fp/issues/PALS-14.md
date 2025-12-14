---
id: d6beaa62-6ee3-46d9-9c58-055ba8a51b49
short_id: PALS-14
title: Add authorization utility module
status: todo
parent: PALS-1
branch: ""
range: null
created_at: 2025-12-14T10:09:50.350Z
updated_at: 2025-12-14T10:09:50.350Z
---

Backport the authorization module for resource-level permission checks (FSH-12).

## Features
- Type-safe authorization functions with assertion returns
- Resource-level ownership checks
- Reusable validation patterns with proper HTTP exceptions
- Separation between authentication and authorization

## Files to Create
- worker/lib/authorization.ts (new)

## Reference
- See full-stack-honc/worker/api/lib/authorization.ts