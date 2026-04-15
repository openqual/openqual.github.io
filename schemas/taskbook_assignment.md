# TaskbookAssignment

The assignment triple for a `Taskbook`: who is doing it, who will
evaluate it, and what organization is hosting it.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `assignee` | `TaskbookAssignee?` | No | The user performing the taskbook. |
| `evaluator` | `TaskbookEvaluator?` | No | The user responsible for evaluating / signing off. |
| `host_org` | `TaskbookHostOrg?` | No | The organization under which this work is happening. |

## Nested types

### `TaskbookAssignee`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | `String` | Yes | Opaque user ID. |
| `display_name` | `String` | Yes | Display name at time of assignment. |
| `assigned_at` | `DateTime?` | No | Timestamp of assignment. |

### `TaskbookEvaluator`

Identical shape to `TaskbookAssignee`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | `String` | Yes | Opaque user ID. |
| `display_name` | `String` | Yes | Display name at time of assignment. |
| `assigned_at` | `DateTime?` | No | Timestamp of assignment. |

### `TaskbookHostOrg`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `org_id` | `String` | Yes | Opaque organization ID. |
| `display_name` | `String` | Yes | Display name at time of assignment. |
| `assigned_at` | `DateTime?` | No | Timestamp of assignment. |

## Notes

- `user_ref` and `org_ref` are opaque string IDs. Resolution to the
  referenced entity is the host application's responsibility.
- `display_name` is captured at assignment time so implementations can
  render assignment history without re-resolving the user or org
  reference.
