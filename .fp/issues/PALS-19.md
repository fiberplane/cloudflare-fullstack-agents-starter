---
id: 07096f49-9616-452c-8534-ed3ee3a37acd
short_id: PALS-19
title: "[Research] Investigate and upgrade to Vitest v4"
status: todo
parent: PALS-1
branch: ""
range: null
created_at: 2025-12-14T10:10:08.754Z
updated_at: 2025-12-14T10:10:08.754Z
---

Investigate the upgrade path from Vitest v3 to v4 (FSH-8 - still TODO).

## Context
This was not completed in full-stack-honc due to potential compatibility issues.

## Potential Issues to Check
- @cloudflare/vitest-pool-workers may not yet support Vitest v4
- Config file format may have changed
- Worker pool options syntax may differ

## Deliverables
- Document compatibility status
- If compatible, create implementation ticket
- If not, document blockers