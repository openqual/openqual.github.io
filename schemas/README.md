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

OpenQual v0.1 publishes the portable class definitions and pure methods
that a third-party developer needs to build a conformant implementation
of the core areas of the standard. The release is intentionally focused,
but it must be self-sufficient: a reader should be able to describe a
person's certifications and the progress they've made on renewing them
using v0.1 alone.

### In scope for v0.1

1. **TaskBook core hierarchy** — the taskbook/section/task/subtask tree,
   signoff policies, assignment, attachments, and the evaluation config
   that drives book-, section-, and task-level status computation.
2. **Certification renewal** — renewal requirements/components, progress
   tracking, and archived renewals.
3. **Shared types and constants** — `CompletionState`,
   `StartAndEndTimes`, and the sentinels published in
   [constants.md](constants.md).

### Required for v0.1 (design in progress)

The following areas are **required before v0.1 can be released**.
They are not yet drafted but are inside the v0.1 scope commitment.
Each is substantial enough to warrant its own modeling pass, and
several interact, so they are being worked through deliberately
rather than rushed.

- **Top-level `Certification` class.** v0.1 already publishes
  everything needed to track progress against a certification's
  renewal, but the cert itself — its name, discipline, validity
  period, issuing authority reference, and relationship to its
  holder — must also be modeled before release. Without this, a
  conformant implementation cannot represent "a person's
  certifications" using v0.1 alone.
- **Identity and contact primitives.** `Name` and `Address` (and
  related person-identity shapes) are required so that the
  `Certification` class can reference who holds a certification and
  where correspondence or verification contacts live. How the
  standard relates qualifications to identity is being resolved
  together with the Certification and authority work.
- **Certifying agency and cert-type modeling.** The standard needs a
  portable representation of the authorities that issue
  certifications and of the cert-type catalogs those authorities
  maintain. This is the third leg of the Certification / identity /
  authority triangle and will be designed alongside the other two.

### Out of scope (app concerns, not standard concerns)

The following are intentionally excluded from the standard. They
represent how a specific application chooses to deliver functionality
to its users, not what a qualification record looks like on the wire.
Implementations are free to build any of these, but the standard does
not prescribe their shape:

- **Notification preferences and delivery** — per-user channel
  preferences, reminder scheduling, delivery status tracking, and the
  supporting data classes (`NotificationTypeSettings`,
  `SentNotificationStatus`, `NotificationRequest` and its channel
  variants, `CertificationsStruct`, `TrainingStruct`, `SharingStruct`,
  `OrgMembershipStruct`, `ReminderConfigStruct`).
- **Application-level permissions and user preferences** — per-record
  permission toggles, UI preferences, and acknowledgement flags
  (`CertPermissionsStruct`, `PermissionsStruct`, `PreferencesStruct`,
  `AdvisoryAcknowledgementsStruct`).
- **In-app aggregations and workflow state** —
  (`InboxCountStruct`, `ApplyTrainingSelectionStruct`).

### Deferred to later versions

See the Roadmap section below for items that are intentionally out of
v0.1.

## Types

### Shared

| Type | File | Purpose |
|------|------|---------|
| `CompletionState` | [completion_state.md](completion_state.md) | Unified completion marker used at every hierarchy level. |
| `StartAndEndTimes` | [start_and_end_times.md](start_and_end_times.md) | Inclusive start/end time pair with derived duration. |
| Constants | [constants.md](constants.md) | Shared sentinels (e.g. `neverExpireDate`). |

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

### `EvaluationType`

Shape of an evaluation task's pass/fail determination. Lives on
`TaskTypeEvaluationCriteria.evaluation_type`.

| Value | Meaning |
|-------|---------|
| `pass_fail` | Binary outcome; no scoring. |
| `scored` | Point-based outcome; requires `points_possible` and, when a result is recorded, `points_awarded`. |

### `ScoringMode`

How a book-level scoring threshold is applied across sections. Lives
on `TaskbookEvaluationConfig.scoring_mode`.

| Value | Meaning |
|-------|---------|
| `aggregated` | Book sums all scored-evaluation points across every section and applies its own threshold. |
| `per_section` | Book has no overall threshold; each section applies its own. A `complete_failed` section propagates to the book (see `Taskbook.computeStatus`). |

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

### `TimeUnit`

The single standard enum for calendar-time quantities — durations,
reporting windows, repeat intervals, and any other calendar-time
measurement across the standard. Distinct from `RequirementUnits`,
which measures training credit rather than elapsed time.

| Value |
|-------|
| `minutes` |
| `hours` |
| `days` |
| `weeks` |
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

Authority roles a user may hold in an organization. Pre-membership
states (pending invitation, pending join request, etc.) are outside
the scope of the standard — a user who is not an accepted member
holds no role.

| Value | Meaning |
|-------|---------|
| `admin` | Full administrative authority. |
| `officer` | Privileged role below admin. |
| `member` | Standard org member. |

## Organizations in the standard

The standard references organizations by opaque ID — for example, via
`SignoffPolicy.allowed_orgs`. v0.1 does not publish an `Organization`
class or prescribe how orgs are stored, how users join or leave, or
how pending / invited / accepted membership states are modeled.

What v0.1 does require of a compliant host: it must be able to answer,
for any user, "what roles does this user hold in which orgs?" —
represented as `Map<orgId, List<OrgRoles>>` and passed into
`SignoffPolicy.isEligible`. The role vocabulary is fixed by
`OrgRoles`; memberships returned by the host must contain only values
from that enum. A user who is not an accepted member of an org must
not appear in that map for the org in question.

Richer organization modeling — the `Organization` class itself, the
membership lifecycle, stations and other subunits, and the separation
between employing organizations (e.g. a fire department) and
certifying agencies — is planned for v0.2. See Roadmap below.

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

## Roadmap

Planned expansions to the standard in later versions. See "Scope of
v0.1" above for the full deferred / out-of-scope split.

- **Organization modeling** — a portable `Organization` class, the
  membership lifecycle (invited, requested, accepted), subunits such
  as stations, and the distinction between employing organizations
  and certifying agencies. v0.1 treats orgs as opaque references
  (see "Organizations in the standard" above). Planned for v0.2.
- **Additional `RequirementUnits`** (CE credits, sessions, contact
  hours). The current `hours`-only set will expand once the target
  disciplines' measurement conventions are agreed.
- **`org_officers` / `org_admins` as first-class signoff policy
  types.** v0.1 expresses them as `org_members` with specific
  `allowedRoles`; promoting them to first-class values is a later
  decision.
