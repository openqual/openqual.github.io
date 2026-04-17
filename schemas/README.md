# OpenQual Schemas — v0.1

OpenQual is an open standard for documenting and exchanging qualification
records — the credentials, skills, and demonstrated competencies that
prove a person is ready to do the work.

**Version:** 0.1
**License:** Apache 2.0
**Copyright:** FireCal LLC

This directory contains the authoritative language-agnostic specification
for OpenQual. Each `.md` file defines the fields, types, and methods of
one portable class (or a small family of closely-related classes).
Implementations in `../dart/` and `../js/` conform to these specs.

If an implementation differs from a spec, the spec is correct and the
implementation is the bug.

## Why OpenQual exists

Today, qualification records for first responders live scattered across
paper binders, vendor-locked apps, and siloed agency databases. A
firefighter who changes departments re-enters credentials by hand; a
department that switches software often strands its training history;
an incident commander verifying credentials across mutual-aid responders
has no common format to consult. JSON exports alone cannot solve this —
every application means different things by its fields, and without a
shared vocabulary for status, provenance, and validity, receivers cannot
reliably interpret what they receive.

Two forces make this more urgent. First, market consolidation in
emergency-services software has repeatedly left small departments
stranded: affordable tools they rely on are acquired, wound down, or
folded into larger platforms, and customers must migrate under time
pressure or lose access to their own records. A portable standard is a
department's safeguard against that outcome — and a signal to every
vendor, large or small, that customer data portability is table stakes.
Second, AI-assisted development is lowering the cost of building
credentialing software to the point where small new entrants — and
eventually ambitious champions inside departments — will increasingly
ship their own solutions; that is healthy for the market, but without a
shared standard to anchor the ecosystem, it accelerates fragmentation
rather than relieving it.

OpenQual is that shared standard — a portable, self-contained record
format that centers the responder as the holder of their own
qualifications. Those qualifications travel with them across
departments, agencies, and systems, and accumulate over a career that
may span decades, from a first certification through the expert,
officer, and administrator roles they grow into. The ecosystem, in
turn, has a common reference point as it grows around them.

## The OpenQual Principle

> **Standard = Structure + Semantics + Provenance.
> Catalog = Governance + Richness.**

Include in the standard: the minimum structural definition required for
a portable instance to be self-contained and meaningful without external
lookups, plus source attribution fields that enable optional enrichment
from catalogs or services. Exclude from the standard: operational
richness, validation rules, and domain-specific governance that create
value through curation or evolution.

When in doubt about whether something belongs in the standard, apply
this test: *is it the minimum needed to understand and exchange the
data independently?* If yes, include it. If it creates value through
curation or requires operational governance, it belongs in a catalog
or service layer.

## Catalog strategy

The standard works fully standalone. Source attribution
(`Source.canonical_id` + `Source.canonical_source`) is present on
portable instances so that implementations *can* enrich or verify
data against a catalog, but doing so is entirely optional. A
conforming implementation with no catalog access can still read,
display, and interact with any standards-compliant record.

Any party may operate a standards-compliant catalog — catalogs may be
offered free, commercially, or as subscription services. OpenQual does
not privilege any single catalog provider.

There is one conformance level in v0.1. No tiered compliance.

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
2. **Certification and credentialing** — the top-level `Certification`
   class, `CertType`, `OrganizationSnapshot` (fills the certifying-agency
   slot and is reusable across organization-shaped slots),
   `PersonSnapshot` for holder and instructor identity, and the
   `Attachment` type with inline content support for portable credential
   documents.
3. **Certification renewal** — renewal requirements/components, progress
   tracking, and archived renewals.
4. **Shared types, constants, and source attribution** —
   `CompletionState`, `StartAndEndTimes`, `Source`, `ValidityPeriod`,
   `neverExpireDate`, and the enums that support the above.

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

### Out of scope (different domain)

OpenQual is about person qualification. It does not model:

- **Asset and equipment records** — apparatus maintenance logs,
  inventory, PPE inspection, pump testing, or any other equipment-side
  data. These are a related but distinct domain and belong in separate
  future projects.
- **Operational workflows** — incident reporting, dispatch, CAD
  integration, response data, or post-incident analysis. These overlap
  with qualification data at the margins (e.g. incidents where a
  responder exercised a skill) but have their own data standards and
  governance needs.
- **Agency-level asset or readiness tracking** — department-level ISO
  ratings, apparatus readiness, station staffing analytics. These are
  operational concerns, not qualification concerns.

Implementations may extend OpenQual with adjacent-domain records, but
the qualification standard proper is bounded to the person as the core
subject.

### Deferred to later versions

See the Roadmap section below for items that are intentionally out of
v0.1.

## Types

### Shared

| Type | File | Purpose |
|------|------|---------|
| `Source` | [source.md](source.md) | Source attribution (provenance) for portable data. |
| `PersonSnapshot` | [person_snapshot.md](person_snapshot.md) | Frozen point-in-time identity capture for any person reference. Optionally carries bounded `OrgMembership` snapshots for eligibility evaluation. |
| `OrganizationSnapshot` | [organization_snapshot.md](organization_snapshot.md) | Frozen organization identity + contact. Used for certifying agency, host org, and other organization-shaped slots. |
| `Attachment` | [attachment.md](attachment.md) | File attached to any node; supports inline content for portability. |
| `ValidityPeriod` | [validity_period.md](validity_period.md) | Duration + time unit pair. |
| `CompletionState` | [completion_state.md](completion_state.md) | Unified completion marker used at every hierarchy level. |
| `StartAndEndTimes` | [start_and_end_times.md](start_and_end_times.md) | Inclusive start/end time pair with derived duration. |
| Constants | [constants.md](constants.md) | Shared sentinels (e.g. `neverExpireDate`). |

### Certification and credentialing

| Type | File | Purpose |
|------|------|---------|
| `Certification` | [certification.md](certification.md) | Top-level portable certification — holder, cert type, agency, validity, renewal progress, credential document. |
| `CertType` | [cert_type.md](cert_type.md) | Portable definition of a certification type — discipline, level, validity period, renewal requirements. |

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
| `TaskbookAssignment` | [taskbook_assignment.md](taskbook_assignment.md) | Assignee + evaluator + host. Pairs `PersonSnapshot` and `OrganizationSnapshot` with assignment timestamps via `AssignedPerson` / `AssignedOrganization`. |
| `TaskbookSummary` | [taskbook_summary.md](taskbook_summary.md) | Denormalized counts and aggregates for fast display. |
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
| `org_members` | Any member of one of the organizations in `allowedOrgs`, optionally further constrained by `allowedRoles`, may sign. |

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

### `Discipline`

Discipline area for a certification type. Use `other` when the
discipline is not represented; populate `discipline_other` on the
parent type with a descriptive string.

| Value | Meaning |
|-------|---------|
| `fire` | Structural firefighting. |
| `wildland` | Wildland firefighting. |
| `ems` | Emergency medical services. |
| `hazmat` | Hazardous materials response. |
| `technical_rescue` | Technical rescue (rope, confined space, swift water, etc.). |
| `law_enforcement` | Law enforcement. |
| `dispatch` | Emergency dispatch / communications. |
| `emergency_management` | Emergency management. |
| `sar` | Search and rescue. |
| `ski_patrol` | Ski patrol. |
| `other` | Discipline not listed above; see `discipline_other`. |

### `CertStatus`

Administrative status of a `Certification`. Optional on the record.
When set to `revoked`, `suspended`, or `expired`, `isCurrentlyValid`
returns `false` regardless of dates. When absent or `active`,
validity is determined by dates.

| Value | Meaning |
|-------|---------|
| `active` | No administrative invalidity applies. Equivalent to the field being absent, but records an explicit affirmation. |
| `suspended` | Temporarily invalid by administrative action. |
| `revoked` | Permanently invalidated by administrative action. |
| `expired` | Explicitly marked expired. Usually redundant with a past `expiration_date`, but useful when the producer knows the cert is expired and wants to record it unambiguously. |

### `CertClassification`

Classification of a credential. Use `other` when the classification
is not represented; populate `classification_other` on the parent type.

| Value | Meaning |
|-------|---------|
| `certification` | A certification (e.g. NREMT EMT-B). |
| `license` | A license (e.g. state nursing license). |
| `other` | Classification not listed above; see `classification_other`. |

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

Organizations are referenced through `OrganizationSnapshot` wherever
the standard captures an org-shaped value. Today that includes
`CertType.certifying_agency` and `SignoffPolicy.allowed_orgs`, and the
pattern extends to any organization-shaped slot as the standard
develops. `OrganizationSnapshot` is snapshot-shaped: it captures
identity at a point in time and does not model the organization's own
lifecycle, subunits, or membership. Different kinds of organizations
(certifying agencies, employing departments, mutual-aid partners,
etc.) share the same struct; implementers encode kind distinctions via
`source.canonical_source` when their catalog distinguishes them. See
`organization_snapshot.md` and `source.md`.

For eligibility evaluation, `SignoffPolicy.isEligible` takes a map of
the user's memberships keyed by organization `canonical_id`. That map
is an argument to the method, not a persisted record — it is the host
application's responsibility to answer "what roles does this user hold
in which orgs?" at the moment eligibility is evaluated. See
`signoff_policy.md` for the full matching contract.

What v0.1 does **not** model: the organization's own lifecycle (how it
is created, governed, dissolved), subunits (stations, shifts, crews),
or the membership lifecycle (invited, requested, accepted). A richer
`Organization` class covering these concerns is planned for v0.2. See
Roadmap below.

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
- **Timestamps:** absolute points in time (UTC). In the spec they are
  typed `DateTime`; language bindings use `DateTime` (Dart) and
  `Date` (JS).
- **Calendar dates:** a distinct semantic category that uses the same
  `DateTime` type but represents a calendar day in an issuing
  jurisdiction rather than an instant. `Certification.certification_date`
  and `Certification.expiration_date` are the v0.1 examples.
  Serialized as `YYYY-MM-DD` or `DateTime` at `00:00:00 UTC` on the
  named day; receivers MUST accept both. Comparisons happen at day
  granularity via a deterministic timezone cascade. See
  `certification.md` → "Calendar date semantics" for the full contract.
- **Optional fields:** a `?` suffix on a type means nullable/optional.
  Implementations must accept missing or null values for these fields.
- **Required fields:** everything without a `?` is required. When a
  required field is missing from serialized input, an implementation
  must raise an error.
- **Zero side effects:** no method in this standard performs I/O. All
  methods are pure functions of the receiver's fields and their
  arguments.

## Schema versioning

Every top-level portable record MUST carry a `schema_version` field
naming the version of the standard it was produced against.

**Required on:**
- `Certification` (top-level credential records)
- `Taskbook` (top-level qualification workflow records)

**Format:** `MAJOR.MINOR.PATCH` as a plain string (semantic
versioning, e.g. `"0.1.0"`). See `constants.md` → `schemaVersion` for
the current value.

**Receiver behavior.** When a receiving system encounters a
`schema_version`:

- **Exact match** (the value equals the version the receiver
  supports): proceed normally.
- **Unknown or newer** (the receiver does not recognize the value, or
  the value is a later version than the receiver supports): the
  receiver MUST NOT silently process the record. Options: reject with
  a clear error, or flag the record for review. The receiver MUST NOT
  assume forward compatibility absent an explicit policy.
- **Older and supported** (the receiver supports multiple versions
  including this one): proceed using the rules of the named version.
- **Older and unsupported** (the receiver does not retain support for
  the named version): reject or flag per the unknown/newer rule.

**Evolution.** Version bumps follow semantic versioning:

- **PATCH** — backward-compatible fixes: spec clarifications (typos,
  ambiguous wording), reference-implementation bug and security
  fixes, and other changes that do not alter the meaning of a
  portable record. Receivers supporting any PATCH of a given
  `MAJOR.MINOR` interpret records from any other PATCH of the same
  `MAJOR.MINOR` identically.
- **MINOR** — backward-compatible additions: new optional fields,
  new enum values, new types. Receivers at the same MAJOR but an
  older MINOR may encounter unknown fields or enum values; they
  SHOULD tolerate them if the record is otherwise interpretable.
- **MAJOR** — potentially breaking changes: field removals, type
  changes, breaking semantic changes. Receivers pinned to an older
  MAJOR MUST NOT assume they can interpret records from a newer
  MAJOR correctly.

**New root-exchangeable types.** If a future version of the standard
publishes additional types intended to be exchanged as independent
root records, those types will also carry `schema_version` on the
same terms.

## Roadmap

Planned expansions to the standard in later versions. See "Scope of
v0.1" above for the full deferred / out-of-scope split.

- **Organization lifecycle modeling** — a richer `Organization` class
  layered on top of `OrganizationSnapshot`, the membership lifecycle
  (invited, requested, accepted), and subunits such as stations.
  v0.1 publishes `OrganizationSnapshot` as the snapshot-shaped portable
  identity type; v0.2 adds the lifecycle and membership layer.
- **Additional `RequirementUnits`** (CE credits, sessions, contact
  hours). The current `hours`-only set will expand once the target
  disciplines' measurement conventions are agreed.
- **`org_officers` / `org_admins` as first-class signoff policy
  types.** v0.1 expresses them as `org_members` with specific
  `allowedRoles`; promoting them to first-class values is a later
  decision.
