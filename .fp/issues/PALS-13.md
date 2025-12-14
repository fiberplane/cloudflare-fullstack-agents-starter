---
id: eb77791d-b8a8-42c9-8ff2-98fe46274bbb
short_id: PALS-13
title: Add vitest setup with jsdom and WebSocket polyfill
status: todo
parent: PALS-1
branch: ""
range: null
created_at: 2025-12-14T10:09:33.112Z
updated_at: 2025-12-14T10:09:33.112Z
---

Backport vitest configuration for frontend testing (FSH-11).

## Features
- Separate vitest.config.ts for frontend tests
- Environment matching (node for worker, jsdom for app)
- WebSocket polyfill for agent connection testing
- jest-dom matchers for DOM assertions
- requestAnimationFrame mocks

## Files to Create/Modify
- vitest.config.ts (update or create separate frontend config)
- vitest.setup.ts (new)
- package.json (add deps: jsdom, @testing-library/react, @testing-library/jest-dom, ws)

## Reference
- See full-stack-honc/vitest.config.ts and vitest.setup.ts