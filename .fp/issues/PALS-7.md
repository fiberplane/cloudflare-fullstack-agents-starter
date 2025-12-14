---
id: e8092ac6-ee77-4f22-bde5-8443b11c6460
short_id: PALS-7
title: Add HonoAppType and separate auth types
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
created_at: 2025-12-14T10:09:06.544Z
updated_at: 2025-12-14T10:57:58.004Z
---

Backport the type organization from full-stack-honc (FSH-14).

## Features
- Centralized HonoAppType with Bindings and Variables
- Separate AuthUser and AuthSession types
- Type-safe middleware variables

## Files to Create/Modify
- worker/types.ts (update)
- worker/lib/auth/types.ts (new)

## Reference
- See full-stack-honc/worker/api/types.ts