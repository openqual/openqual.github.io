# OpenQual Schemas — v0.1

**Version:** 0.1
**License:** Apache 2.0
**Copyright:** FireCal LLC

This directory contains the authoritative language-agnostic specification
for the OpenQual standard. Each `.md` file defines the fields, types, and
methods of one portable class (or a small family of closely-related
classes). Implementations in `../dart/` and `../js/` conform to these
specs.

If an implementation differs from a spec, the spec is correct and the
implementation is the bug.

## Scope of v0.1

v0.1 publishes two slices of types:

1. **TaskBook core hierarchy** — the taskbook/section/task/subtask tree,
   signoff policies, assignment, attachments, and the evaluation config
   that drives status computation.
2. **Certification renewal** — renewal requirements/components, progress
   tracking, and archived renewals.

Future versions will expand coverage (see "Not yet in the standard"
below).

## Types

### Shared

| Type | File | Purpose |
|------|------|---------|
| `CompletionState` | [completion_state.md](completion_state.md) | Unified completion marker used at every hierarchy level. |
| `StartAndEndTimes` | [start_and_end_times.md](start_and_end_times.md) | Inclusive start/end time pair with derived duration. |

### TaskBook hierarchy

| Type | File | Purpose |
|------|------|---------|
| `Taskbook` | [taskbook.md](taskbook.md) | Root container; holds sections, assignment, book-level signoff and evaluation config. |
| `TaskbookSection` | [taskbook_section.md](taskbook_section.md) | Ordered collection of tasks; optional section-level scoring threshold. |
| `TaskbookTask` | [taskbook_task.md](taskbook_task.md) | Leaf work unit; may be a plain task or an evaluation (typed via `TaskTypeConfig`). |
| `TaskbookSubtask` | [taskbook_subtask.md](taskbook_subtask.md) | Checklist item under a task. |
| `TaskTypeConfig` | [task_type_config.md](task_type_config.md) | Polymorphic config for evaluation / nested taskbook / skillsheet / cert tasks. |
| `SignoffPolicy` | [signoff_policy.md](signoff_policy.md) | Who may sign off; attached at taskbook, section, or task level. |
| `SignoffRecord` | [signoff_record.md](signoff_record.md) | Authoritative record of a completed signoff. |
| `TaskbookAssignment` | [taskbook_assignment.md](taskbook_assignment.md) | Assignee + evaluator + host organization. |
| `TaskbookSummary` | [taskbook_summary.md](taskbook_summary.md) | Denormalized counts and aggregates for fast display. |
| `TaskbookAttachment` | [taskbook_attachment.md](taskbook_attachment.md) | File attached to any node in the hierarchy. |
| `TaskbookEvaluationConfig` | [taskbook_evaluation_config.md](taskbook_evaluation_config.md) | Book-level scoring mode and thresholds. |

### Certification renewal

| Type | File | Purpose |
|------|------|---------|
| `RenewalRequirements` | [renewal_requirements.md](renewal_requirements.md) | Versioned definition of a cert's renewal criteria. |
| `RenewalComponent` | [renewal_component.md](renewal_component.md) | One component of a cert renewal. |
| `RenewalRequirement` | [renewal_requirement.md](renewal_requirement.md) | One concrete requirement under a component. |
| `RenewalProgress` | [renewal_progress.md](renewal_progress.md) | In-flight progress against a renewal. |
| `RenewalComponentProgress` | [renewal_component_progress.md](renewal_component_progress.md) | Progress on one component. |
| `RenewalRequirementProgress` | [renewal_requirement_progress.md](renewal_requirement_progress.md) | Progress on one requirement. |
| `PreviousRenewal` | [previous_renewal.md](previous_renewal.md) | Archived snapshot of a completed renewal cycle. |
| `PreviousRenewals` | [previous_renewals.md](previous_renewals.md) | Ordered history of previous renewals. |

## Enums

The standard defines the following enums. They are exhaustive; third-party
implementations must treat unknown values as errors.

### `WorkItemStatus`

Applies at task, section, and taskbook level.

| Value | Meaning |
|-------|---------|
| `not_started` | No work has been recorded. |
| `in_progress` | Some child work has been done, or a signoff has been recorded, or an evaluation has started but not finalized. |
| `owner_action_needed` | All child work is done; the owner has not yet marked the item complete. Not used at the task level for evaluation-typed tasks. |
| `pending_validation` | Item has been marked complete but required signoffs are still outstanding, or an evaluation task was marked complete without an outcome recorded. |
| `complete` | Item is done and all required signoffs are in. |
| `complete_failed` | Item terminated in a failed state. At the task level this means an evaluation outcome of `fail`. At the section and taskbook levels it additionally fires from autofail propagation, a mathematically-unreachable scoring threshold (cannot-pass), or a completed-but-below-threshold score (did-not-pass). |

`complete_failed` at section/taskbook level may result from autofail
propagation, scoring threshold failure, or evaluation failure — not
exclusively from evaluation outcome.

### `EvaluationOutcome`

Lives on `TaskTypeEvaluationConfig.result.outcome`.

| Value | Meaning |
|-------|---------|
| `pass` | Evaluation passed. |
| `fail` | Evaluation failed. |

At the task level, `status: complete_failed` is always accompanied by
`outcome: fail`. `complete_failed` at section/taskbook level has
additional causes unrelated to evaluation outcome (see `WorkItemStatus`).

### `SignoffPolicyType`

| Value | Meaning |
|-------|---------|
| `this_user` | Only the current user (taskbook owner) may sign. |
| `specify_users` | Only users listed in `allowedUsers` may sign. |
| `org_members` | Any member of one of `allowedOrgs`, optionally further constrained by `allowedRoles`, may sign. |

`org_officers` and `org_admins` are expressible as `org_members` with
specific `allowedRoles` values. They are reserved for a future version
and should not be implemented.

### `TaskTypes`

Discriminator for the polymorphic `TaskTypeConfig` union.

| Value | Meaning |
|-------|---------|
| `task` | Plain task with subtasks and owner completion. |
| `evaluation` | Task whose completion is gated by an explicit pass/fail outcome, optionally scored. |
| `taskbook` | Task that requires the user to complete a referenced nested taskbook. |
| `skillsheet` | Task that requires the user to complete a referenced skillsheet. |
| `cert` | Task that requires the user to hold a referenced certification. |

### `TaskbookTypes`

| Value | Meaning |
|-------|---------|
| `taskbook` | Standard taskbook. |
| `skillsheet` | Skillsheet variant of a taskbook. |

### `RenewalStatus`

| Value | Meaning |
|-------|---------|
| `not_started` | No progress has been recorded. |
| `in_progress` | Some progress has been recorded but requirements are not yet satisfied. |
| `complete` | All renewal requirements have been satisfied. |
| `overdue` | The renewal due date has passed without completion. |

### `CertificationDurationUnits`

Unit for a certification's validity period.

| Value |
|-------|
| `days` |
| `months` |
| `quarters` |
| `years` |

### `RequirementUnits`

| Value |
|-------|
| `hours` |

Additional units (CE credits, sessions, contact hours) are planned for
v0.2.

### `OrgRoles`

| Value | Meaning |
|-------|---------|
| `admin` | Full administrative authority. |
| `officer` | Privileged role below admin. |
| `member` | Standard org member. |
| `requested` | Requested to join; not yet accepted. |
| `invited` | Invited to join; not yet accepted. |

## Conventions

- **Field naming:** the spec uses `snake_case` for wire/storage
  representation. Language bindings adopt their idiomatic casing
  (Dart/JS: `camelCase`).
- **IDs:** all IDs are opaque strings. The standard does not prescribe
  any particular ID generation scheme.
- **Timestamps:** all timestamps are absolute points in time (UTC). In
  the spec they are typed `DateTime`; language bindings use `DateTime`
  (Dart) and `Date` (JS).
- **Optional fields:** a `?` suffix on a type means nullable/optional.
  Implementations must accept missing or null values for these fields.
- **Required fields:** everything without a `?` is required. When a
  required field is missing from serialized input, an implementation
  must raise an error.
- **Zero side effects:** no method in this standard performs I/O. All
  methods are pure functions of the receiver's fields and their
  arguments.

## Not yet in the standard (roadmap)

The following are observed in the source apps but deferred to a later
version:

- Taskbook-level status computation (follows the same waterfall pattern
  as section-level; reference implementation planned for v0.2).
- `RequirementUnits` beyond `hours`.
- `org_officers` / `org_admins` as first-class signoff policy types.
- Notification preference structs (`CertificationsStruct`,
  `TrainingStruct`, `SharingStruct`, etc.) — these need consolidation
  before being published.
- Identity and address types — scope to be decided.
