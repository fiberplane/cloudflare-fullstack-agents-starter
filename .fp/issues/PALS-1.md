---
id: 4d1c0dc0-8e17-476e-bad2-8ee956f3e6b2
short_id: PALS-1
title: "Template Refresh: Port improvements from full-stack-honc"
status: todo
parent: null
branch: ""
range: null
created_at: 2025-12-14T10:08:25.747Z
updated_at: 2025-12-14T10:08:25.747Z
---

Master plan to refresh this template based on improvements implemented in full-stack-honc (which were derived from nocturne--main patterns).

## Goals
- Update dependencies to latest versions
- Port agent infrastructure with Props pattern
- Improve type system and sharing between frontend/backend  
- Add production-ready logging infrastructure
- Simplify state management (remove x-state)
- Add shared websocket event types with Zod
- Improve testing setup for frontend
- Add useful vite plugins

## Source Reference
- Changes tracked in: /Users/brettbeutell/fiber/full-stack-honc/.fp
- Derived patterns from: /Users/brettbeutell/fiber/nocturne--main

## Success Criteria
- All 17 improvement areas from FSH tickets are ported
- Template maintains simplicity while adding production patterns
- Documentation updated to reflect new patterns