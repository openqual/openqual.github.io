# TaskbookSection

An ordered group of tasks within a `Taskbook`. Sections may carry their
own signoff policy and their own scoring threshold; both are independent
of the book-level policy and threshold.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `String` | Yes | Opaque ID unique within the parent taskbook. |
| `order` | `int` | Yes | Position among sibling sections. |
| `title` | `String` | Yes | Display name. |
| `description` | `String?` | No | Prose description. |
| `due_date` | `DateTime?` | No | Section due date. |
| `status` | `WorkItemStatus` | Yes | Computed by `computeStatus`. |
| `progress` | `double` | Yes | `0.0`–`1.0`. Computed from child tasks. |
| `completion` | `CompletionState` | Yes | Owner completion marker for the section. |
| `tasks` | `List<TaskbookTask>` | Yes | Ordered by `TaskbookTask.order`. May be empty. |
| `signoff_policy_override` | `List<SignoffPolicy>` | Yes | Signoff policies for this section. Overrides the book-level policy when non-empty or when the book's `signoff_policy_cascades` is `false`. |
| `signoffs_require_all` | `bool` | Yes | When `true`, all policies in `signoff_policy_override` must be completed. Defaults to `true`. |
| `signoff_policy_cascades` | `bool` | Yes | When `true`, this section's signoff policy also applies to child tasks that have no override. Defaults to `false`. |
| `scoring_config` | `SectionScoringConfig?` | No | Section-level scoring threshold. See below. |
| `scoring_summary` | `SectionScoringSummary?` | No | Denormalized scoring totals. Recomputed by `computeStatus`. |
| `attachments` | `List<TaskbookAttachment>` | Yes | May be empty. |
| `notes` | `String?` | No | Free-form notes. |

## Nested types

### `SectionScoringConfig`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `min_passing_points` | `double?` | No | Absolute point threshold. Preferred over percentage when both are set. |
| `min_passing_percentage` | `double?` | No | Fractional threshold in `[0.0, 1.0]`. Values above `1.0` are treated as percent (e.g. `70` → `0.70`) with a warning. Only used when `min_passing_points` is null. |

### `SectionScoringSummary`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `points_possible` | `double` | Yes | Sum of `points_possible` across all scored evaluation tasks in the section. |
| `points_awarded` | `double` | Yes | Sum of `points_awarded` across completed scored evaluation tasks. |
| `points_remaining` | `double` | Yes | Sum of `points_possible` on tasks that have no result yet. |
| `effective_threshold_points` | `double?` | No | Computed threshold in points. Set from `min_passing_points` directly, or derived as `ceil(min_passing_percentage * points_possible)`. |
| `effective_threshold_percentage` | `double?` | No | Computed threshold as a fraction of `points_possible`. |

## Methods

### `TaskbookSection.computeStatus() → WorkItemStatus`

Pure. Computes the section's `status` given its current `tasks`,
`scoring_config`, `signoff_policy_override`, `signoffs_require_all`,
and `completion`. Also populates `scoring_summary` as a side-effect on
the returned section (when implementations return an updated value) or
emits it alongside the status (when implementations return just the
enum).

**Priority waterfall:**

1. **Autofail propagation.** If any child task has
   `status = complete_failed` AND its evaluation criteria has
   `autofail = true` → `complete_failed`.
2. **Cannot pass.** If `scoring_config` has a threshold and
   `points_awarded + points_remaining < effective_threshold_points`
   → `complete_failed`. (All remaining scored evaluations, even at
   full credit, cannot reach the threshold.)
3. **Did not pass.** If `scoring_config` has a threshold, all scored
   evaluations have a result, and `points_awarded <
   effective_threshold_points` → `complete_failed`.
4. **Complete.** If `completion.complete` AND section-level signoffs
   are OK → `complete`.
5. **Pending validation.** If `completion.complete` AND section-level
   signoffs are not OK → `pending_validation`.
6. **Owner action needed.** If work exists (any tasks, or a policy),
   all tasks are done (`complete` or `complete_failed`), section
   signoffs are OK, and `completion.complete` is `false`
   → `owner_action_needed`.
7. **In progress.** If any child task has progressed beyond
   `not_started`, or any section-level signoff has been completed,
   → `in_progress`.
8. **Default.** → `not_started`.

"Signoffs OK" means: no policies (`signoff_policy_override` is empty)
→ OK; otherwise, if `signoffs_require_all`, every policy's `completed`
must be `true`; if not, at least one policy's `completed` must be
`true`.

### `TaskbookSection.computeProgress() → double`

Pure. Returns `1.0` when `status` is `complete` or `complete_failed`.
Otherwise returns the arithmetic mean of child tasks' `progress`, or
`0.0` when the section has no tasks.

## Notes

- The `min_passing_percentage > 1.0` auto-correction is a guard against
  users entering `70` when they meant `0.70`. A conforming
  implementation should log a warning and divide by 100.
- `scoring_config` is independent of the book-level
  `evaluation_config` — a section may have a stricter threshold than
  the book.
