# TaskbookTask

A leaf work unit within a `TaskbookSection`. Tasks are polymorphic via
`type` and `type_config`: a task can be a plain task, an evaluation, an
inspection, or a reference to a nested taskbook / skillsheet /
certification.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `String` | Yes | Opaque ID unique within the parent section. |
| `order` | `int` | Yes | Position among sibling tasks. |
| `type` | `TaskTypes` | Yes | Polymorphic discriminator. Defaults to `task`. |
| `type_config` | `TaskTypeConfig?` | No | Type-specific configuration. Required when `type != task`. |
| `critical` | `bool` | Yes | When `true`, a failure of this task is a critical failure of the whole book: a failed evaluation result, or an inspection observation that fails its criteria, derives `critical_failure` triage where triage applies and propagates `complete_failed` to the parent section and the taskbook. Task-level and independent of `type`; see "Critical tasks" below. Defaults to `false`. |
| `title` | `String` | Yes | Display name. |
| `description` | `String?` | No | Prose description. |
| `due_date` | `DateTime?` | No | Task due date. |
| `status` | `WorkItemStatus` | Yes | Computed by `computeStatus`. |
| `progress` | `double` | Yes | `0.0`–`1.0`. Computed from subtasks. |
| `completion` | `CompletionState` | Yes | Owner completion marker. For `type = evaluation` and `type = inspection`, "complete" is driven by the recorded result/observation, not by this field; see `computeStatus`. |
| `subtasks` | `List<TaskbookSubtask>` | Yes | Ordered by `TaskbookSubtask.order`. May be empty. |
| `signoff_policy` | `List<SignoffPolicy>` | Yes | Signoff policies for this task. May be empty. This tier's list is authoritative for this tier; no inheritance from the section or book at runtime (see `taskbook.md` → "Per-tier policy resolution"). |
| `signoffs_require_all` | `bool` | Yes | When `true`, all policies MUST be completed. Defaults to `true`. |
| `attachments` | `List<Attachment>` | Yes | May be empty. |
| `notes` | `String?` | No | Free-form notes. |

## Critical tasks

`critical` says what a failure of this task means to the book. It is
one flag, on the task, whatever the task's `type`:

- **Evaluation** (`type = evaluation`): a `result.outcome` of `fail`
  on a critical task takes the task to `complete_failed` (as any
  failed evaluation does) AND propagates `complete_failed` to the
  parent section and the taskbook.
- **Inspection** (`type = inspection`): an observation that fails its
  criteria derives `critical_failure` triage instead of `failing`
  (see `task_type_config.md` → "Triage derivation"), takes the task
  to `complete_failed`, AND propagates `complete_failed` to the
  parent section and the taskbook.
- Other types carry the flag (it is required on every task) but have
  no failing outcome for it to act on; producers SHOULD leave it
  `false` there.

Propagation is decided by the flag, not by any stored triage: a
critical task with `status = complete_failed` fails its section and
book (`taskbook_section.md` and `taskbook.md` → "Critical
propagation"). A critical task that passes, or has no result yet,
propagates nothing. A non-critical task that fails is `complete_failed`
on its own and leaves the parent tiers to their own waterfalls.

## Methods

### `TaskbookTask.computeStatus() → WorkItemStatus`

Pure. Computes the task's `status` given its current `subtasks`,
`signoff_policy`, `signoffs_require_all`, `type_config`, and
`completion`.

**Effective "complete" input.** For `type = evaluation`:
`is_complete = (type_config.evaluation_config.result.outcome is pass or fail)`.
For `type = inspection`:
`is_complete = (type_config.inspection_config.result is recorded)`.
For all other types:
`is_complete = completion.complete`.

**Priority waterfall:**

1. **Complete / complete_failed.** If `is_complete` AND signoffs are OK:
   - `complete` if the task is not an evaluation or inspection, OR if
     the evaluation outcome is `pass`, OR if the inspection triage is
     `pass` or `degraded`.
   - `complete_failed` if the task is an evaluation with outcome
     `fail`, or an inspection with triage `failing` or
     `critical_failure`.
2. **Pending validation.** If `is_complete` AND signoffs are not OK
   → `pending_validation`. Additionally, if the task is an evaluation
   and `completion.complete` is `true` but no outcome is recorded
   (`type_config.evaluation_config.result` is missing or
   `outcome` is neither `pass` nor `fail`) → `pending_validation`.
3. **Owner action needed.** For non-evaluation, non-inspection tasks
   only: if work exists (any subtasks or any policy), all subtasks are
   `complete`, signoffs are OK, and `completion.complete` is `false`
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

Inspection observations are the deliberate opposite: `measured_value`
and `found_quantity` are recorded **unclamped** — the observation is
the data. See `task_type_config.md` → `TaskTypeInspectionResult`.

## Notes

- **v0.1 → v1.0:** this tier's policy list was named
  `signoff_policy_override` in v0.1. See `taskbook.md` → "Per-tier
  policy resolution" and `MIGRATION.md`. `type = inspection` is new
  in v1.0.
- **v1.x → v2.0:** `critical` is new at the task level and replaces
  two v1.x spellings of the same concept: `evaluation_config.criteria.autofail`
  and `inspection_config.criteria.critical`, both retired. A producer
  upgrading a v1.x record sets `critical = autofail || criteria.critical`
  and drops the old keys. See `CHANGELOG.md`.
