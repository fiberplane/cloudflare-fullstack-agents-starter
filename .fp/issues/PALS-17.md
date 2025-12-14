---
id: 7afcdd59-4d2a-4187-b477-17c6da504721
short_id: PALS-17
title: Improve hono/hc type sharing with TypeScript project references
status: todo
parent: PALS-1
branch: ""
range: null
created_at: 2025-12-14T10:09:54.969Z
updated_at: 2025-12-14T10:09:54.969Z
---

Improve the hono/hc client setup for efficient type sharing (FSH-4).

## Benefits
- Cleaner imports with @/ alias
- Better IDE support for cross-project types
- Proper separation of concerns with project references

## Files to Modify
- tsconfig.json
- tsconfig.app.json
- tsconfig.worker.json
- Verify @/worker path alias works from frontend

## Reference
- See full-stack-honc TypeScript configuration