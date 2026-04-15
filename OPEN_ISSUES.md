# Open Issues and Observations (v0.1)

Items noticed during Stage 3 extraction that are worth discussing
before v0.2. None are blockers for v0.1 — each is captured here so
they do not get lost.

## 1. Book-level status computation is not yet published

The source apps compute the taskbook-level status in the
`recalculateTaskBookStatuses` Cloud Function, using the same waterfall
pattern as `TaskbookSection.computeStatus` but with book-level
thresholds and "any section failed" child-failure propagation. v0.1
publishes the task- and section-level computations but stops short of
packaging the book-level waterfall as a method on `Taskbook`. The
reference implementation should be added in v0.2. The schema for
`Taskbook.computeStatus` should be the direct analogue of
`TaskbookSection.computeStatus` with these branches:

1. `hasChildFailure` → `complete_failed`
2. `bookCannotPass` (aggregated scoring threshold) → `complete_failed`
3. `bookFailedPoints` → `complete_failed`
4. `isComplete && signoffOK` → `complete`
5. `isComplete && !signoffOK` → `pending_validation`
6. `allSectionsDone && signoffOK && !isComplete` → `owner_action_needed`
7. any child activity or book-level signoff partial → `in_progress`
8. default → `not_started`

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
