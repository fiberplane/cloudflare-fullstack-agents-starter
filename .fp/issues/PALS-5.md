---
id: ff3c4aa3-61c9-4f65-a7f7-14997a2e1089
short_id: PALS-5
title: Add global onError handler with structured logging
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
created_at: 2025-12-14T10:08:47.048Z
updated_at: 2025-12-14T10:57:15.428Z
---

Backport the Hono global error handler from full-stack-honc (FSH-16).

## Features
- Global onError handler on Hono app
- Uses prepareErrorForLogging for safe serialization
- Returns proper HTTPException responses
- Falls back to generic 500 error

## Files to Modify
- worker/index.ts

## Dependencies
- Requires logging infrastructure (PALS-3)
- Requires prepareErrorForLogging (PALS-4)