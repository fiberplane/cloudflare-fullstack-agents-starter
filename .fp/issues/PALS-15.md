---
id: 6bab2783-68eb-4c96-8e8e-4da8f36d37fd
short_id: PALS-15
title: Improve Better Auth configuration with session caching
status: todo
parent: PALS-1
branch: ""
range: null
created_at: 2025-12-14T10:09:52.106Z
updated_at: 2025-12-14T10:09:52.106Z
---

Backport Better Auth improvements (FSH-13).

## Key Features
- Session expiration config (7 days)
- Session update age (1 day)
- Cookie caching enabled with maxAge (fixes 5-minute default timeout)
- Custom cookie prefix (e.g., 'fpc')
- Better Auth logger integration with structured logging

## Files to Modify
- worker/lib/auth/index.ts
- better-auth.config.ts

## Reference
- See full-stack-honc Better Auth configuration