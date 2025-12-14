---
id: 1338870a-00f8-4879-85fe-bf52db5ccb6c
short_id: PALS-16
title: "Add vite plugins: sqlLoader, svgr, arraybuffer"
status: todo
parent: PALS-1
branch: ""
range: null
created_at: 2025-12-14T10:09:53.492Z
updated_at: 2025-12-14T10:09:53.492Z
---

Backport useful vite plugins from full-stack-honc (FSH-15).

## Plugins to Add
- **sqlLoader**: For loading .sql files as ES modules (for Drizzle DO migrations)
- **vite-plugin-svgr**: Import SVGs as React components
- **vite-plugin-arraybuffer**: Import binary files as ArrayBuffer

## Files to Modify
- vite.config.ts
- app/vite-env.d.ts (add type declarations)
- package.json (add dependencies)

## Reference
- See full-stack-honc/vite.config.ts