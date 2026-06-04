# design/incoming/

Drop exported claude.ai/design screens here, one folder per screen, then tell me
"screen <name> is ready". I'll refactor them into typed, wired components under
`/components` and delete the raw drop. See `/HANDOFF.md`.

```
design/incoming/
  daily-checkin/
    page.tsx        # or index.html / styles.css — whatever claude.ai/design exports
    notes.md        # optional: states / interactions to preserve
  dashboard/
  vet-brief/
```

This folder is a staging area — raw design output lands here; nothing here is shipped as-is.
