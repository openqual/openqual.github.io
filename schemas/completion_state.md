# CompletionState

Unified completion marker. Used at every level of the TaskBook hierarchy
(taskbook, section, task, subtask) in place of the inconsistent field
naming in the source apps.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `complete` | `bool` | Yes | `true` once the owner has marked the item complete. Defaults to `false`. |
| `completed_at` | `DateTime?` | No | Timestamp captured at the moment `complete` transitioned from `false` to `true`. `null` while `complete` is `false`. |

## Invariants

- If `complete` is `false`, `completed_at` MUST be `null`.
- If `complete` is `true`, `completed_at` SHOULD be set. Implementations
  MAY tolerate a missing `completed_at` for legacy data but MUST NOT
  write `complete = true` without also setting `completed_at`.

## Methods

None. This is a pure data struct.

## Design note

In the source apps, the upper three hierarchy levels used
`owner_marked_complete` (bool) + `owner_marked_complete_datetime`, while
`TaskbookSubtaskStruct` used `complete` + `complete_datetime`. OpenQual
picks one shape — this one — and uses it everywhere.
