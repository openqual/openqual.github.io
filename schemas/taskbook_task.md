# TaskbookTask

A leaf work unit within a `TaskbookSection`. Tasks are polymorphic via
`type` and `type_config`: a task can be a plain task, an evaluation, or
a reference to a nested taskbook / skillsheet / certification.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `String` | Yes | Opaque ID unique within the parent section. |
| `order` | `int` | Yes | Position among sibling tasks. |
| `type` | `TaskTypes` | Yes | Polymorphic discriminator. Defaults to `task`. |
| `type_config` | `TaskTypeConfig?` | No | Type-specific configuration. Required when `type != task`. |
| `title` | `String` | Yes | Display name. |
| `description` | `String?` | No | Prose description. |
| `due_date` | `DateTime?` | No | Task due date. |
| `status` | `WorkItemStatus` | Yes | Computed by `computeStatus`. |
| `progress` | `double` | Yes | `0.0`–`1.0`. Computed from subtasks. |
| `completion` | `CompletionState` | Yes | Owner completion marker. For `type = evaluation`, "complete" is driven by the evaluation result, not by this field; see `computeStatus`. |
| `subtasks` | `List<TaskbookSubtask>` | Yes | Ordered by `TaskbookSubtask.order`. May be empty. |
| `signoff_policy_override` | `List<SignoffPolicy>` | Yes | Signoff policies for this task. Overrides the section/book policy when non-empty. |
| `signoffs_require_all` | `bool` | Yes | When `true`, all policies MUST be completed. Defaults to `true`. |
| `attachments` | `List<Attachment>` | Yes | May be empty. |
| `notes` | `String?` | No | Free-form notes. |

## Methods

### `TaskbookTask.computeStatus() → WorkItemStatus`

Pure. Computes the task's `status` given its current `subtasks`,
`signoff_policy_override`, `signoffs_require_all`, `type_config`, and
`completion`.

**Effective "complete" input.** For `type = evaluation`:
`is_complete = (type_config.evaluation_config.result.outcome is pass or fail)`.
For all other types:
`is_complete = completion.complete`.

**Priority waterfall:**

1. **Complete / complete_failed.** If `is_complete` AND signoffs are OK:
   - `complete` if the task is not an evaluation, OR if the evaluation
     outcome is `pass`.
   - `complete_failed` if the task is an evaluation and the outcome is
     `fail`.
2. **Pending validation.** If `is_complete` AND signoffs are not OK
   → `pending_validation`. Additionally, if the task is an evaluation
   and `completion.complete` is `true` but no outcome is recorded
   (`type_config.evaluation_config.result` is missing or
   `outcome` is neither `pass` nor `fail`) → `pending_validation`.
3. **Owner action needed.** For non-evaluation tasks only: if work
   exists (any subtasks or any policy), all subtasks are `complete`,
   signoffs are OK, and `completion.complete` is `false`
   → `owner_action_needed`.
4. **In progress.** If any subtask is `complete`, or any signoff is
   completed (partial), or the task is an evaluation with a `result`
   object recorded but no final outcome → `in_progress`.
5. **Default.** → `not_started`.

"Signoffs OK" is defined as in `TaskbookSection.computeStatus`.

### `TaskbookTask.computeProgress() → double`

Pure. Returns `1.0` when `status` is `complete` or `complete_failed`.
Otherwise returns `completed_subtasks / total_subtasks`, or `0.0` when
there are no subtasks.

## Evaluation scoring

For `type = evaluation` with
`type_config.evaluation_config.criteria.evaluation_type = scored`,
`points_awarded` in the result MUST be clamped to the task's
`points_possible`. The reference implementation caps awarded points
during `computeStatus` evaluation. Implementations MUST NOT persist a
value greater than `points_possible`.
