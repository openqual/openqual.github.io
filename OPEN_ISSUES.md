# Open Issues and Observations (v0.1)

Items noticed during extraction that are worth discussing before v0.2.
Most are notes rather than blockers; resolved release blockers are
recorded at the top for history.

## Release blockers for v0.1 — resolved

All three v0.1 release blockers are now resolved. The following classes
are published: `Certification`, `CertType`, `OrganizationSnapshot`,
`PersonSnapshot`, and `Source`.

- **Top-level `Certification` class.** Resolved — published.
- **Identity and contact primitives.** Resolved — `PersonSnapshot` and
  `Source` are published.
- **Certifying-agency and cert-type modeling.** Resolved — `CertType`
  and `OrganizationSnapshot` are published (the latter fills the
  certifying-agency slot on `CertType` and is reusable for other
  organization-shaped slots).

## Community input requested

- **Renewal requirement shapes beyond NREMT.** The existing
  `RenewalRequirements` model was built around NREMT-shaped renewals
  (CE-hour components with sub-requirements). Cert types that renew
  via "attend refresher class" or "pass re-examination" may not fit
  cleanly. Community contributions of real-world renewal shapes from
  different agencies and disciplines would help identify gaps in the
  model.

- **Validity period edge cases.** `ValidityPeriod` models a single
  standard duration for all issuances of a cert type. Real-world
  exceptions exist (emergency extensions during disasters,
  jurisdictional overrides, provisional issuances with shorter
  validity). Community contributions of specific examples would help
  determine whether the model needs enhancement.

## Acknowledged future enhancements

- **Multi-source modification provenance.** When a portable record
  carrying provenance from one source is modified by another party,
  v0.1 provides a behavioral guideline (preserve original source
  attribution). Formal audit trail mechanisms (append-only logs, chain
  of custody, versioning) are acknowledged as a future enhancement
  with no specific version commitment.

- **Suspension / revocation status on `Certification`.** 
  `Certification.isCurrentlyValid` evaluates expiration dates only.
  Administrative states (suspension, revocation, probation) are not
  modeled in v0.1. Acknowledged for future enhancement.

## 1. Book-level status computation — published in v0.1

Resolved. `Taskbook.computeStatus` is now part of the standard; see
`schemas/taskbook.md` for the authoritative waterfall and
`schemas/taskbook_summary.md` for the `TaskbookSummary` recomputation
contract that it produces.

## 2. The source `TaskbookAttachmentStruct` is under-specified

The source struct carries only `name` and `path`. OpenQual v0.1
requires `mime_type`, `size_bytes`, and `uploaded_at`. The source apps
have a compliance gap; implementers adopting OpenQual will need to
populate those fields (or generate them at serve time from object
storage metadata).

## 3. `allowedRoles` has no reader in either Dart codebase

`TaskbookSignoffPolicyStruct.allowedRoles` exists as a field but the
source Dart `quickCheckSignoffEligibility` ignores it — it only
branches on `allowedUsers` / `allowedOrgs`. The Cloud Functions
`recalculateTaskBookStatuses` does consult `allowed_orgs` and
`allowed_users` but likewise does not consult `allowed_roles`. OpenQual
v0.1 publishes `allowedRoles` as a live field with intended semantics
("org members with one of these roles"), which is consistent with the
Stage 3 brief but not with any active reader in the source. Decide
whether the source apps need a back-fill before the standard is
marketed.

## 4. `min_passing_percentage > 1.0` auto-correction is a smell

Both section- and book-level scoring configs divide values above `1.0`
by 100 (`70` → `0.70`) with a warning. This is a guard against a UI
bug that lets users enter percents instead of fractions. A cleaner
long-term fix is a dedicated `PassingPercentage` value type with a
validating constructor, but for now the guard is present in the
reference implementations. Consider removing the guard in v0.2 once
UIs uniformly write fractions.

## 5. Divergence in `calculateCertificationProgress`

TaskBook clamps the final `certification_progress` to `[0.0, 1.0]`;
CertLocker does not. OpenQual publishes the clamped form. The source
CertLocker implementation should be patched to match.

## 6. Scoring at the task level vs section level

`TaskTypeEvaluationCriteria.min_passing_points` is declared but the
source status waterfalls use only `outcome` for task-level pass/fail
determination. v0.1 keeps `min_passing_points` on the criteria struct
(for display / UI feedback), but the standard should either:

- Document that `min_passing_points` at task level is advisory only, or
- Derive `outcome = fail` automatically when `points_awarded < min_passing_points`.

Current behavior is the former. Worth an explicit decision.

## 7. Summary tense: `tasks_complete` vs `tasks_completed`

The source `TaskbookSummaryStruct` uses `tasksCompleted` (past tense)
while the status enum value is `complete` (adjective). OpenQual
normalizes every summary count to match the enum
(`tasks_complete`, `sections_complete`). Implementers migrating from
the source app must rename the field.

## 8. `TaskTypeTaskbookConfig` and `TaskTypeSkillsheetConfig` are identical

Both have `taskbook_template_id` + `require_complete`. The source
codebase carries them as separate structs. v0.1 publishes them as
separate classes for parallelism with their matching `TaskTypes`
value, but the duplication is worth revisiting. A single
`TaskTypeReferenceConfig` with a discriminator would be cleaner.

## 9. `org_officers` and `org_admins` are deferred but not yet dropped from source

The source `quickCheckSignoffEligibility` branches on these two types.
If OpenQual formally reserves them for a future version, the source
apps should stop writing them (the UI already only offers the three
allowed types, but the eligibility function continues to read them).
No behavioral change is required in v0.1, but flagged for tidy-up.

## 10. Identity / address / notification-preference types are not yet in the standard

The inventory surfaced `AddressStruct`, `NameStruct`, `IdentityStruct`,
`CertificationsStruct`, `TrainingStruct`, `SharingStruct`, and
`OrgMembershipStruct`. None are in v0.1. Notification-preference
duplication across four structs needs consolidation into a single
`NotificationPreferences` before publishing. Identity in particular
needs a scoping decision: does the standard cover the person behind a
qualification, or only the qualification itself?

## 11. Phone-number normalization is US-only in the source

The Cloud Functions `User` class hardcodes `+1` and a digit-only
regex. If OpenQual cares about international first-responder ops at
all, any future phone-handling utility must be E.164-first.

## 12. `requirements_version` is opaque — no compatibility check exists

`PreviousRenewalStruct.renewal_progress_at_archiving.requirements_version`
pins the version that was satisfied, but nothing validates that the
current requirements definition is "compatible" with prior cycles. A
v0.2 decision: does the standard want a version-compatibility method,
or is "versioning is the host application's concern" the right answer?

## 13. `computeSection` mutates `pointsAwarded` when clamping

The source `computeTask` in `recalculateTaskBookStatuses` mutates
`evalResult.points_awarded` in memory when auto-capping to
`points_possible`. The reference implementations expose this as a pure
`withClampedPoints()` method on `TaskbookTask`. Callers should prefer
the pure form; the source should be migrated.
