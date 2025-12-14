---
id: 08bed0fc-4aa2-448e-a6e6-4c6d83eec26d
short_id: PALS-12
title: Update wrangler.jsonc with agent Durable Object bindings
status: todo
parent: PALS-1
branch: ""
range: null
created_at: 2025-12-14T10:09:31.472Z
updated_at: 2025-12-14T10:09:31.472Z
---

Ensure wrangler.jsonc has proper agent DO configuration (FSH-20).

## Updates to Verify/Add
```toml
[[durable_objects.bindings]]
name = "PersonalAgent"  
class_name = "PersonalAgent"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["PersonalAgent"]
```

## Files to Modify
- wrangler.jsonc

## Reference
- Compare with full-stack-honc/wrangler.jsonc