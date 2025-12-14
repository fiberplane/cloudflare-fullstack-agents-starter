---
id: b83cd272-bf59-47fe-927f-9503e76737a3
short_id: PALS-2
title: "Update dependencies: agents, ai, wrangler, cloudflare vite plugin"
status: done
parent: PALS-1
branch: ""
range:
  base:
    _tag: git
    sha: 0bf6be3e7aa556b443a0e0db2fff0d4e31d9abd6
  tip:
    _tag: git
    sha: 0bf6be3e7aa556b443a0e0db2fff0d4e31d9abd6
created_at: 2025-12-14T10:08:42.063Z
updated_at: 2025-12-14T10:15:55.918Z
---

Update key dependencies to latest versions based on full-stack-honc (FSH-2).

## Updates Required
- @cloudflare/vite-plugin: ^1.12.1 → ^1.15.3
- wrangler: current → ^4.53.0
- agents: current → 0.2.26
- ai: current → 5.0.103
- @biomejs/biome: current → 2.3.6 (if not already)

## Files to Modify
- package.json

## Verification
- Run `bun install`
- Run `bun run typecheck`
- Ensure dev server starts