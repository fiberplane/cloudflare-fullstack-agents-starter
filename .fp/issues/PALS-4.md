---
id: eb4b853f-88a3-4917-b85e-1312e90392d1
short_id: PALS-4
title: Add prepareErrorForLogging utility
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
created_at: 2025-12-14T10:08:45.352Z
updated_at: 2025-12-14T10:56:57.017Z
---

Backport the error serialization utility from full-stack-honc (FSH-10).

## Features
- Safely serializes Error objects (name, message, stack, cause)
- Handles circular references
- Preserves enumerable properties
- Works with nested error causes

## Files to Create
- worker/lib/errors.ts (new or extend existing)

## Reference
- See full-stack-honc/worker/api/lib/errors.ts