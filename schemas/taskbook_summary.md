# TaskbookSummary

Denormalized aggregate counts and scoring totals for a `Taskbook`.
Recomputed by the book-level status waterfall. Cached on the taskbook
so clients can render dashboards without walking the full tree.

## Fields

### Task counts (across all sections)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tasks_total` | `int` | Yes | Total number of tasks. |
| `tasks_not_started` | `int` | Yes | |
| `tasks_in_progress` | `int` | Yes | |
| `tasks_owner_action_needed` | `int` | Yes | |
| `tasks_pending_validation` | `int` | Yes | |
| `tasks_complete` | `int` | Yes | |
| `tasks_complete_failed` | `int` | Yes | |

### Section counts

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sections_total` | `int` | Yes | |
| `sections_not_started` | `int` | Yes | |
| `sections_in_progress` | `int` | Yes | |
| `sections_owner_action_needed` | `int` | Yes | |
| `sections_pending_validation` | `int` | Yes | |
| `sections_complete` | `int` | Yes | |
| `sections_complete_failed` | `int` | Yes | |

### Book-level flags and signoff totals

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `taskbook_owner_action_needed` | `bool` | Yes | Convenience flag: `true` iff book `status = owner_action_needed`. |
| `signoffs_required_total` | `int` | Yes | Total signoff policies across book, sections, and tasks. |
| `signoffs_completed_total` | `int` | Yes | Count of those policies with `completed = true`. |

### Scoring

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scoring_summary` | `BookScoringSummary?` | No | Aggregated scoring across all sections. Absent when no scored evaluations exist. |

### Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `last_modified` | `DateTime` | Yes | Timestamp of last summary recomputation. |

## Nested type

### `BookScoringSummary`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `points_possible` | `double` | Yes | Sum across all scored evaluation tasks in the book. |
| `points_awarded` | `double` | Yes | Sum of awarded points on completed scored evaluations. |
| `points_remaining` | `double` | Yes | Sum of `points_possible` on scored evaluations without a result. |
| `effective_threshold_points` | `double?` | No | Book-level threshold in points (from `TaskbookEvaluationConfig`). |
| `effective_threshold_percentage` | `double?` | No | Book-level threshold as a fraction of `points_possible`. |

## Notes

- The tense in summary field names is normalized: `tasks_complete`
  (not `tasks_completed`) and `sections_complete` (not
  `sections_completed`), matching the `WorkItemStatus` enum value name.
- Implementations that cache `TaskbookSummary` must recompute on every
  write to any tree node.
