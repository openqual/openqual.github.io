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

## Recomputation contract

`TaskbookSummary` is a pure function of the computed tree. For any
`Taskbook` whose sections and tasks have been passed through
`TaskbookSection.computeStatus` and `TaskbookTask.computeStatus`:

**Status histograms.** For each `WorkItemStatus` value `S`:

- `tasks_<S>` equals the count of tasks across all sections whose
  `status = S`.
- `sections_<S>` equals the count of sections whose `status = S`.

`tasks_total` equals the sum of all `tasks_<S>` values.
`sections_total` equals the sum of all `sections_<S>` values.

**Book-level flags.** `taskbook_owner_action_needed = true` iff the
book's computed `status = owner_action_needed`.

**Signoff totals.**

- `signoffs_required_total` = count of all `SignoffPolicy` instances
  across the book (`Taskbook.signoff_policy`), every section
  (`TaskbookSection.signoff_policy_override`), and every task
  (`TaskbookTask.signoff_policy_override`).
- `signoffs_completed_total` = count of those policies with
  `completed = true`.

**Scoring summary.** `scoring_summary` is populated whenever the book
contains at least one scored evaluation task. Its `points_possible`,
`points_awarded`, and `points_remaining` are raw sums across every
scored evaluation task in the book, regardless of any section's
pass/fail state. Threshold fields are populated only when
`evaluation_config.scoring_mode = aggregated` and
`evaluation_config.scoring_config` defines a threshold; see
`taskbook_evaluation_config.md` for the derivation.

**Recompute trigger.** Implementations that cache `TaskbookSummary`
MUST recompute on any write that changes a task's or section's
`status`, a section's or task's `signoff_policy_override`, the book's
`signoff_policy`, any policy's `completed` flag, or the book's
`completion`. `last_modified` is set to the recomputation time.

## Notes

- The tense in summary field names is normalized: `tasks_complete`
  (not `tasks_completed`) and `sections_complete` (not
  `sections_completed`), matching the `WorkItemStatus` enum value name.
