# OpenQual Extraction Review Notes

Temporary working checklist completed before drafting:
`/tmp/openqual_review_checklist.md`

Review scope covered:
- Extracted files in `openqual/schemas/`, `openqual/dart/`, and `openqual/js/`
- Source structs/enums/actions in `_sources/certlocker/` and `_sources/taskbook/`
- Candidate inventory in `openqual/CANDIDATE_INVENTORY.md`

Review posture for this pass:
- A divergence from the proprietary apps is **not** treated as a defect by itself.
- Findings focus on whether the published standard is internally clear, portable, consistent, complete for its stated scope, and practical for third-party implementers.
- Source references are used as evidence for intent, omitted coverage, or ambiguity, not as the sole measure of correctness.

## Release Readiness

Overall assessment:
- OpenQual looks publishable as a `0.1` if you are comfortable releasing it as a focused first slice rather than a full extraction of everything portable in the source apps.
- The current state does **not** look fundamentally blocked by proprietary contamination in the runtime code. The main remaining risks are contract clarity and scope clarity.

Suggested `0.1` posture:
- **Should fix before publish**:
  publish the authoritative contract for `TaskbookSummary` recomputation, or soften the required status of the new summary counters.
- **Should fix before publish**:
  tighten the normative signing contract for `SignoffPolicy` + `SignoffRecord`.
- **Should fix before publish**:
  reconcile the public scope statement with the actual extracted scope so readers can tell what is intentionally in/out of `0.1`.
- **Safe to defer to `0.2` if clearly called out**:
  missing inventory-backed types outside the current TaskBook/renewal slices.
- **Safe to defer to `0.2`**:
  enum-izing remaining string discriminators like `evaluation_type` and `scoring_mode`.
- **Safe to defer to `0.2`**:
  richer documentation cleanup around Firestore/Firebase contrast language.

## Critical

### 1. TaskbookSummary adds required failure counters without publishing the recomputation contract that makes them interoperable
Affected extracted file(s):
- `openqual/schemas/taskbook_summary.md`
- `openqual/dart/taskbook_summary.dart`
- `openqual/js/taskbook_summary.js`
- `openqual/schemas/taskbook.md`
- `openqual/schemas/README.md`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/taskbook_summary_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_task_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_section_struct.dart`

Issue:
- Confirmed issue in the standard as published. `TaskbookSummary` now includes `tasks_complete_failed` and `sections_complete_failed`, which is a reasonable improvement for an open standard.
- The problem is that the standard does not yet publish the book-level recomputation algorithm that determines those counters, even though the README says book-level status computation is not yet published.
- That leaves implementers with required denormalized fields but no authoritative method for deriving them consistently across the whole tree.

Evidence:
- `openqual/schemas/taskbook_summary.md:18-19,30-31` require `tasks_complete_failed` and `sections_complete_failed`.
- `openqual/dart/taskbook_summary.dart:40-50` and `openqual/js/taskbook_summary.js:41-49` implement those counters as first-class fields.
- `openqual/schemas/taskbook.md:19-20,30,56-69` says the taskbook stores denormalized status/progress/summary and that summary is recomputed by the status waterfall.
- `openqual/schemas/README.md:196-197` says taskbook-level status computation is not yet in the standard.

Recommended fix:
- For `0.1`, pick one of these explicitly:
- Option A:
  publish the authoritative book-level recomputation contract for `TaskbookSummary`, including exactly how `tasks_complete_failed` and `sections_complete_failed` are derived.
- Option B:
  keep the richer fields but mark them as optional cache fields until the book-level recomputation contract is published.
- Option C:
  remove the new failure counters from `0.1` and defer them to the release that publishes the book-level waterfall.

### 2. SignoffPolicy and SignoffRecord split responsibilities cleanly, but the signing/write contract is still too loose for interoperable implementations
Affected extracted file(s):
- `openqual/schemas/signoff_policy.md`
- `openqual/schemas/signoff_record.md`
- `openqual/dart/signoff_policy.dart`
- `openqual/dart/signoff_record.dart`
- `openqual/js/signoff_policy.js`
- `openqual/js/signoff_record.js`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/taskbook_signoff_policy_struct.dart`
- `_sources/taskbook/lib/custom_code/actions/quick_check_signoff_eligibility.dart`

Issue:
- Confirmed issue in the standard contract. The extracted model is directionally strong: `SignoffPolicy` holds authorization rules and `SignoffRecord` holds the audit trail.
- What is still missing is the authoritative transition contract for when a signoff becomes valid. The docs say the host application is responsible for capturing a record and updating `completed`, but they do not define the required invariant set for a compliant signed policy.
- Without that, different implementers can all claim compliance while persisting materially different states.

Evidence:
- `openqual/schemas/signoff_policy.md:21-23` puts `completed`, `completion_timestamp`, and `signoff_record` on the same shape.
- `openqual/schemas/signoff_record.md:6-18` makes `SignoffRecord` an authoritative audit object.
- `openqual/schemas/signoff_policy.md:57-60` leaves the write semantics to the host application.
- `openqual/dart/signoff_policy.dart:70-84` and `openqual/js/signoff_policy.js:17-38` model the data shape, but no normative signing procedure exists.

Recommended fix:
- Add a short normative signing contract, for example:
  when a valid signer completes a policy, the implementation must set `completed = true`, set `completion_timestamp`, and set `signoff_record`, and `signoff_record.signed_at` must equal `completion_timestamp`.
- Also specify whether `completed = true` without `signoff_record` is:
  invalid,
  tolerated for legacy data,
  or allowed in minimal implementations.

## Important

### 3. The project’s published scope is still fuzzier than the actual extracted scope
Affected extracted file(s):
- `openqual/schemas/README.md`
- `openqual/CANDIDATE_INVENTORY.md`
- `openqual/schemas/`
- `openqual/dart/`
- `openqual/js/`

Relevant source file(s):
- `openqual/CANDIDATE_INVENTORY.md`

Issue:
- Confirmed release-readiness issue. The extracted standard is clearly centered on two slices: TaskBook core hierarchy and certification renewal.
- The candidate inventory, however, still contains many `INCLUDE` items outside those slices, and the README roadmap only partially explains their omission.
- For a public `0.1`, this is less a completeness bug than a scope-positioning problem: readers need to know whether `0.1` is “the beginning of OpenQual” or “a partial implementation of the full candidate set.”

Evidence:
- `openqual/schemas/README.md:13-19` states the current `0.1` scope as two slices.
- `openqual/CANDIDATE_INVENTORY.md:39-59,71` includes several portable non-TaskBook types and helpers not yet published:
  `ReportExpiringUnits`, `AddressStruct`, `NameStruct`, `ReminderConfigStruct`, `CertificationsStruct`, `TrainingStruct`, `SharingStruct`, `OrgMembershipStruct`, `CertPermissionsStruct`, `InboxCountStruct`, `ApplyTrainingSelectionStruct`, and `setNeverExpireDate`.
- `openqual/CANDIDATE_INVENTORY.md:158-162` includes notification-domain JS/TS types not yet published:
  `NotificationTypeSettings`, `NotificationDeliveryStatus`, `SentNotificationStatus`, `NotificationTypeOptions`, and `NotificationRequest` plus channel-specific variants.
- `openqual/schemas/README.md:191-203` only partially accounts for these omissions.

Recommended fix:
- Before release, make the scope crisp:
- Option A:
  say explicitly that `0.1` standardizes only the TaskBook core and renewal slices, and move other inventory-backed items into an explicit deferred list.
- Option B:
  expand `0.1` to include some of the highest-value omitted portable types.
- If speed matters most, Option A is the better `0.1` move.

### 4. The scoring model is now part of the public standard, but that scope decision is not fully reconciled across project artifacts
Affected extracted file(s):
- `openqual/schemas/taskbook_evaluation_config.md`
- `openqual/schemas/taskbook_section.md`
- `openqual/dart/taskbook_evaluation_config.dart`
- `openqual/dart/taskbook_section.dart`
- `openqual/js/taskbook_evaluation_config.js`
- `openqual/js/taskbook_section.js`
- `openqual/CANDIDATE_INVENTORY.md`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/taskbook_evaluation_config_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_scoring_config_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_scoring_summary_struct.dart`

Issue:
- Probable issue. The extracted standard has clearly chosen to include scoring concepts, and the section/task logic is reasonably well developed.
- The inconsistency is at the project level: `CANDIDATE_INVENTORY.md` still frames the underlying scoring structs as gray-area or excluded, while the standard publishes them as core.
- That is less a model bug than a governance/documentation mismatch, but it will confuse reviewers and implementers about what `0.1` actually commits to.

Evidence:
- `openqual/CANDIDATE_INVENTORY.md:123-125` marks `TaskbookEvaluationConfigStruct` as gray-area and the scoring config/summary structs as excluded.
- `openqual/schemas/taskbook_evaluation_config.md:8-20` and `openqual/schemas/taskbook_section.md:23-45` publish scoring configuration and scoring summaries as part of the standard.
- `openqual/dart/taskbook_section.dart:96-120` and the corresponding JS implementation compute scoring-derived section outcomes.

Recommended fix:
- Reconcile the inventory with the actual standard direction before release.
- If scoring is in `0.1`, update the inventory so the project artifacts agree.
- If parts of scoring are still unsettled, mark the unstable pieces explicitly rather than leaving the whole area contradictory.

### 5. TaskbookAttachment is a stronger open-standard shape, but the attachment contract is still looser than it should be
Affected extracted file(s):
- `openqual/schemas/taskbook_attachment.md`
- `openqual/dart/taskbook_attachment.dart`
- `openqual/js/taskbook_attachment.js`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/taskbook_attachment_struct.dart`

Issue:
- Confirmed improvement with remaining ambiguity. Requiring `mime_type`, `size_bytes`, and `uploaded_at` makes the standard more useful and portable than the source shape.
- The remaining issue is that `path` is defined as an opaque storage path or URL, while the standard does not say whether this must be dereferenceable, stable, private, signed, or merely an implementation handle.
- That ambiguity is survivable for `0.1`, but it is one of the places where a third-party implementer is likely to ask “what exactly do you want me to store?”

Evidence:
- `openqual/schemas/taskbook_attachment.md:10-14` defines the richer attachment contract.
- `openqual/schemas/taskbook_attachment.md:11` describes `path` as an opaque storage path or URL.
- `_sources/taskbook/lib/backend/schema/structs/taskbook_attachment_struct.dart:10-45` confirms the source provided only `name` and `path`, so the standard is making a real design choice here.

Recommended fix:
- Keep the richer shape in `0.1`.
- Tighten the path contract by specifying one of:
  `download_url`,
  `storage_key`,
  or a more explicit union-style note if both are allowed.
- Clarify whether `uploaded_at` is the upload time to backing storage, the time of attachment association, or either.

### 6. SignoffPolicyType normalization is good, but role vocabulary remains under-specified
Affected extracted file(s):
- `openqual/schemas/signoff_policy.md`
- `openqual/schemas/README.md`
- `openqual/dart/enums.dart`
- `openqual/js/enums.js`
- `openqual/dart/signoff_policy.dart`
- `openqual/js/signoff_policy.js`

Relevant source file(s):
- `_sources/taskbook/lib/custom_code/actions/quick_check_signoff_eligibility.dart`
- `_sources/taskbook/lib/backend/schema/enums/enums.dart`

Issue:
- Mixed assessment. Reducing signoff policy types to `this_user`, `specify_users`, and `org_members` is a cleaner, more portable design than carrying special-case `org_officers` and `org_admins`.
- The remaining weakness is that `allowed_roles` is still just `List<String>` rather than a constrained enum-backed vocabulary, even though `OrgRoles` already exists in the standard.

Evidence:
- `openqual/schemas/signoff_policy.md:20` types `allowed_roles` as `List<String>`.
- `openqual/dart/signoff_policy.dart:22-24` and `openqual/js/signoff_policy.js:19-23` keep roles as plain strings.
- `openqual/schemas/README.md:110-112` and `openqual/dart/enums.dart:62-63` already define `OrgRoles`.
- The source eligibility logic in `_sources/taskbook/lib/custom_code/actions/quick_check_signoff_eligibility.dart:33-45` effectively treats org eligibility as a constrained role problem.

Recommended fix:
- Consider making `allowed_roles` a `List<OrgRoles>` rather than free-form strings.
- If you intentionally want looser extensibility in `0.1`, document that these are implementation-defined role tokens and explain the interaction with `OrgRoles`.

## Nice to Have

### 7. Some polymorphic and string-discriminator fields would benefit from tighter constraints
Affected extracted file(s):
- `openqual/schemas/task_type_config.md`
- `openqual/schemas/taskbook_evaluation_config.md`
- `openqual/dart/task_type_config.dart`
- `openqual/dart/taskbook_evaluation_config.dart`
- `openqual/js/task_type_config.js`
- `openqual/js/taskbook_evaluation_config.js`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/task_type_evaluation_criteria_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_evaluation_config_struct.dart`

Issue:
- Probable improvement area. Several key discriminators remain plain strings:
  `evaluation_type` and `scoring_mode`.
- Those values are documented, but not normalized into enums the way `TaskTypes`, `TaskbookTypes`, `EvaluationOutcome`, and `RenewalStatus` already are.

Evidence:
- `openqual/schemas/task_type_config.md:28` says `evaluation_type` is a `String` with two allowed values.
- `openqual/schemas/taskbook_evaluation_config.md:10` says `scoring_mode` is a `String` with two allowed values.
- `openqual/dart/task_type_config.dart:44-53` and `openqual/dart/taskbook_evaluation_config.dart:24-31` keep those as plain strings.

Recommended fix:
- Reasonable `0.2` improvement:
  add enums for `EvaluationType` and `ScoringMode`.
- If you keep strings in `0.1`, explicitly state that unknown values are errors, not extension points.

### 8. Documentation still leans too hard on implementation contrast instead of leading with the standard’s own semantics
Affected extracted file(s):
- `openqual/dart/README.md`
- `openqual/js/README.md`
- `openqual/schemas/task_type_config.md`
- `openqual/schemas/taskbook_assignment.md`
- `openqual/schemas/previous_renewal.md`
- `openqual/schemas/renewal_component_progress.md`
- `openqual/schemas/renewal_requirement_progress.md`

Relevant source file(s):
- Source mappings are implicit throughout the extraction and candidate inventory.

Issue:
- Confirmed documentation polish issue. The standard itself is reasonably portable, but parts of the docs still introduce concepts by saying what they are not: not Firestore, not Firebase, not `DocumentReference`, and so on.
- That framing is useful for internal migration work, but it is not the cleanest presentation for outside implementers.

Evidence:
- `openqual/dart/README.md:14-16,64-73` and `openqual/js/README.md:13-15,61-73` are strongly framed around absence of Firebase/Firestore dependencies.
- Several schema notes still mention `DocumentReference` directly:
  `openqual/schemas/task_type_config.md:41,74-76`,
  `openqual/schemas/taskbook_assignment.md:44-45`,
  `openqual/schemas/previous_renewal.md:28`,
  `openqual/schemas/renewal_component_progress.md:22`,
  `openqual/schemas/renewal_requirement_progress.md:21`.

Recommended fix:
- Safe to defer until after `0.1` if time is tight.
- Long-term, move migration-oriented notes into a separate “host-app mapping” or “implementation notes” section and let the type docs lead with the open-standard contract first.

## Final Summary

### Missing extracted types
- Inventory-backed include items with no extracted schema/dart/js representation:
  `ReportExpiringUnits`, `AddressStruct`, `NameStruct`, `ReminderConfigStruct`, `CertificationsStruct`, `TrainingStruct`, `SharingStruct`, `OrgMembershipStruct`, `CertPermissionsStruct`, `InboxCountStruct`, `ApplyTrainingSelectionStruct`, and `setNeverExpireDate`.
- Inventory-backed JS/TS notification types with no extracted representation:
  `NotificationTypeSettings`, `NotificationDeliveryStatus`, `SentNotificationStatus`, `NotificationTypeOptions`, and `NotificationRequest` plus its channel-specific variants.
- This does **not** block `0.1` if the release is explicitly positioned as a focused initial slice.

### Dependency contamination findings
- Runtime contamination:
  none confirmed in `openqual/dart/` or `openqual/js/`; the extracted implementation code is clean and portable.
- Documentation contamination:
  some schema/readme files still lean on `DocumentReference`, `Firestore`, and `Firebase` terminology more than an external standards reader needs.

### Type mismatches
- The most important issues are no longer “mismatch with source,” but incomplete standardization around required derived fields and state transitions.
- Confirmed:
  `TaskbookSummary` requires richer counters than the published recomputation contract currently supports.
- Confirmed:
  `SignoffPolicy` and `SignoffRecord` together define a good model, but the normative signing contract is still too loose.
- Improvement with remaining ambiguity:
  `TaskbookAttachment` is stronger than the source shape, but `path` semantics still need tightening.
- Project-level inconsistency:
  scoring is clearly part of the extracted standard, but inventory/governance artifacts have not fully caught up.

### Documentation and standardization recommendations
- Before `0.1`, publish the authoritative `TaskbookSummary` recomputation contract or soften the required status of the new summary counters.
- Before `0.1`, add a normative signoff-write contract for `completed`, `completion_timestamp`, and `signoff_record`.
- Before `0.1`, reconcile `CANDIDATE_INVENTORY.md` and `schemas/README.md` with the actual scope of the release.
- Reasonable `0.2` items:
  enum-ize remaining discriminators, expand omitted slices, and clean up migration-heavy documentation language.

### Source tech debt observations
- The proprietary apps still encode some concepts in shapes that the standard has already improved upon, especially signoff typing, completion state consistency, and attachment metadata richness.
- The proprietary apps and the standard will both benefit from a clearer export/conformance path once you start building outward-facing interoperability workflows.

## Review Pass 2 — 2026-04-15

Verification scope for this pass:
- Re-read `openqual/REVIEW_NOTES.md` Review Pass 1 and verified the current extracted state in `openqual/schemas/`, `openqual/dart/`, and `openqual/js/`.
- Re-checked `openqual/CANDIDATE_INVENTORY.md` for scope/governance reconciliation.
- Re-scanned extracted artifacts for proprietary dependency leakage terms.

Overall assessment:
- Stage 5 substantially improved the extraction. Six of the eight Review Pass 1 findings are fully addressed in the current extracted artifacts.
- Two findings remain partially addressed, but the remaining gaps are much narrower than in Pass 1.
- No new runtime contamination by Firestore/Firebase/FlutterFlow was found in `schemas/`, `dart/`, or `js/`.
- One new release-readiness issue and one smaller documentation inconsistency were identified.

## Critical

### 1. v0.1 scope statement now explicitly requires types that are still not published
Affected extracted file(s):
- `openqual/schemas/README.md`
- `openqual/schemas/`
- `openqual/dart/`
- `openqual/js/`

Relevant source file(s):
- `openqual/CANDIDATE_INVENTORY.md`
- `_sources/certlocker/lib/backend/schema/structs/address_struct.dart`
- `_sources/certlocker/lib/backend/schema/structs/name_struct.dart`

Issue:
- New issue. The scope documentation is much clearer than in Pass 1, but it now creates an explicit release blocker: the README says v0.1 cannot be released without the top-level `Certification` class, identity/contact primitives, and certifying-agency / cert-type modeling.
- Those types are still not present in the extracted schemas or language bindings.

Evidence:
- `openqual/schemas/README.md:21-23` says v0.1 must be self-sufficient for representing a person's certifications and renewal progress.
- `openqual/schemas/README.md:36-61` says `Certification`, `Name`, `Address`, and certifying-agency / cert-type modeling are required before v0.1 can be released.
- `openqual/CANDIDATE_INVENTORY.md:12-29` repeats the same v0.1 requirement and points readers back to `schemas/README.md`.
- No extracted files currently publish those required types in `openqual/schemas/`, `openqual/dart/`, or `openqual/js/`.

Recommended fix:
- Pick one of these before release:
- Option A:
  draft and publish the missing required types so the release matches the README.
- Option B:
  narrow the README's v0.1 commitment so the currently published slice can stand on its own without claiming those missing types are release-gating.

## Important

### 2. Review Pass 1 finding 1 is fully resolved: TaskbookSummary recomputation contract is now published and implemented
Affected extracted file(s):
- `openqual/schemas/taskbook_summary.md`
- `openqual/schemas/taskbook.md`
- `openqual/dart/taskbook.dart`
- `openqual/js/taskbook.js`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/taskbook_summary_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_task_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_section_struct.dart`

Issue:
- Resolved. The standard now publishes the recomputation contract that Pass 1 said was missing, and both language bindings implement the book-level recomputation path.

Evidence:
- `openqual/schemas/taskbook_summary.md:65-105` now defines the recomputation contract for status histograms, signoff totals, scoring summary, and recompute triggers.
- `openqual/schemas/taskbook.md:71-83` now publishes `Taskbook.computeStatus()`.
- `openqual/dart/taskbook.dart:196-314` implements book-level status/summary recomputation.
- `openqual/js/taskbook.js:176-343` implements the same book-level recomputation path.

Recommended fix:
- No further fix required for the original finding.

### 3. Review Pass 1 finding 2 is fully resolved: SignoffPolicy now has a normative signing contract and compliance check
Affected extracted file(s):
- `openqual/schemas/signoff_policy.md`
- `openqual/schemas/signoff_record.md`
- `openqual/dart/signoff_policy.dart`
- `openqual/js/signoff_policy.js`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/taskbook_signoff_policy_struct.dart`
- `_sources/taskbook/lib/custom_code/actions/quick_check_signoff_eligibility.dart`

Issue:
- Resolved. The standard now clearly defines the state transition and invariants for a compliant signed policy, and both bindings expose `isValidSigned()`.

Evidence:
- `openqual/schemas/signoff_policy.md:51-104` now defines `SignoffPolicy.isValidSigned()` and a normative signing contract, including invalid states and legacy-data treatment.
- `openqual/schemas/signoff_record.md:6-17` continues to define the authoritative signature record.
- `openqual/dart/signoff_policy.dart:67-92` implements `isValidSigned()`.
- `openqual/js/signoff_policy.js:61-80` implements `isValidSigned()`.

Recommended fix:
- No further fix required for the original finding.

### 4. Review Pass 1 finding 3 is only partially resolved: scope is now much clearer, but the clarified scope introduces a release blocker
Affected extracted file(s):
- `openqual/schemas/README.md`
- `openqual/CANDIDATE_INVENTORY.md`

Relevant source file(s):
- `openqual/CANDIDATE_INVENTORY.md`

Issue:
- Partially addressed. The project-level scope statement is far clearer than in Pass 1: in-scope, required-before-release, out-of-scope, and deferred areas are now separated cleanly.
- The remaining problem is the new critical issue above: the clarified scope says v0.1 requires types that still are not published.

Evidence:
- `openqual/schemas/README.md:25-80` now clearly separates in-scope, required-before-release, and out-of-scope areas.
- `openqual/CANDIDATE_INVENTORY.md:6-29` has been updated to reflect the same scope-finalization decisions.

Recommended fix:
- Treat the original scope-clarity problem as fixed in documentation terms.
- Resolve the remaining release blocker by either publishing the required missing types or narrowing the v0.1 commitment.

### 5. Review Pass 1 finding 4 is fully resolved: scoring is now reconciled across the standard and inventory
Affected extracted file(s):
- `openqual/schemas/taskbook_evaluation_config.md`
- `openqual/schemas/taskbook_section.md`
- `openqual/dart/taskbook_evaluation_config.dart`
- `openqual/dart/taskbook_section.dart`
- `openqual/js/taskbook_evaluation_config.js`
- `openqual/js/taskbook_section.js`
- `openqual/CANDIDATE_INVENTORY.md`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/taskbook_evaluation_config_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_scoring_config_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_scoring_summary_struct.dart`

Issue:
- Resolved. The inventory now records the scope decision that scoring was promoted into the core standard, so the project artifacts no longer contradict the published schemas.

Evidence:
- `openqual/CANDIDATE_INVENTORY.md:22-24` now explicitly states that scoring was reclassified as core.
- `openqual/CANDIDATE_INVENTORY.md` rows for `TaskbookEvaluationConfigStruct`, `TaskbookScoringConfigStruct`, and `TaskbookScoringSummaryStruct` now describe their published v0.1 names.
- `openqual/schemas/taskbook_evaluation_config.md:1-33` and `openqual/schemas/taskbook_section.md` continue to publish scoring as part of the standard.

Recommended fix:
- No further fix required for the original finding.

### 6. Review Pass 1 finding 5 is fully resolved: TaskbookAttachment now has a clear portable storage-handle contract
Affected extracted file(s):
- `openqual/schemas/taskbook_attachment.md`
- `openqual/dart/taskbook_attachment.dart`
- `openqual/js/taskbook_attachment.js`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/taskbook_attachment_struct.dart`

Issue:
- Resolved. The spec now makes `path` an opaque stable handle rather than an underspecified URL/path hybrid, and it clarifies the meaning of `uploaded_at`.

Evidence:
- `openqual/schemas/taskbook_attachment.md:10-31` now defines `path` as an opaque stable handle, forbids persisting signed URLs there, and distinguishes dereferencing as a separate host-side operation.
- `openqual/schemas/taskbook_attachment.md:14` now clarifies the semantics of `uploaded_at`.

Recommended fix:
- No further fix required for the original finding.

### 7. Review Pass 1 finding 6 is fully resolved at the type-contract level, but one example still uses string literals
Affected extracted file(s):
- `openqual/schemas/signoff_policy.md`
- `openqual/schemas/README.md`
- `openqual/dart/enums.dart`
- `openqual/js/enums.js`
- `openqual/dart/signoff_policy.dart`
- `openqual/js/signoff_policy.js`

Relevant source file(s):
- `_sources/taskbook/lib/custom_code/actions/quick_check_signoff_eligibility.dart`
- `_sources/taskbook/lib/backend/schema/enums/enums.dart`

Issue:
- The original finding is resolved in substance. `allowed_roles` is now constrained to `List<OrgRoles>` in the schema and to `List<OrgRoles>` in Dart, which is what Pass 1 recommended.
- A small documentation inconsistency remains: the `Notes` section still shows `allowed_roles = ["officer"]` and `["admin"]`, which reads like free-form strings rather than enum values.

Evidence:
- `openqual/schemas/signoff_policy.md:20` now types `allowed_roles` as `List<OrgRoles>`.
- `openqual/dart/signoff_policy.dart:19-24` uses `List<OrgRoles>`.
- `openqual/schemas/README.md:150-183` publishes `OrgRoles` as a fixed enum vocabulary.
- `openqual/schemas/signoff_policy.md:108-112` still gives examples as `allowed_roles = ["officer"]` and `["admin"]`.

Recommended fix:
- Keep the type contract as-is.
- Update the note example so it clearly reflects enum-backed values rather than sounding like unrestricted strings.

### 8. Review Pass 1 finding 7 is fully resolved: remaining discriminators were tightened into enums
Affected extracted file(s):
- `openqual/schemas/task_type_config.md`
- `openqual/schemas/taskbook_evaluation_config.md`
- `openqual/dart/task_type_config.dart`
- `openqual/dart/taskbook_evaluation_config.dart`
- `openqual/dart/enums.dart`
- `openqual/js/task_type_config.js`
- `openqual/js/taskbook_evaluation_config.js`
- `openqual/js/enums.js`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/task_type_evaluation_criteria_struct.dart`
- `_sources/taskbook/lib/backend/schema/structs/taskbook_evaluation_config_struct.dart`

Issue:
- Resolved. `evaluation_type` and `scoring_mode` are now normalized into `EvaluationType` and `ScoringMode` across the schemas and both bindings.

Evidence:
- `openqual/schemas/task_type_config.md:30` types `evaluation_type` as `EvaluationType`.
- `openqual/schemas/taskbook_evaluation_config.md:8-10` types `scoring_mode` as `ScoringMode`.
- `openqual/dart/enums.dart:48-51` defines both enums.
- `openqual/js/enums.js:55-64` defines both enums.
- `openqual/dart/task_type_config.dart`, `openqual/dart/taskbook_evaluation_config.dart`, `openqual/js/task_type_config.js`, and `openqual/js/taskbook_evaluation_config.js` all use those normalized enum values.

Recommended fix:
- No further fix required for the original finding.

### 9. Review Pass 1 finding 8 is fully resolved: dependency-contrast language has been cleaned up materially
Affected extracted file(s):
- `openqual/dart/README.md`
- `openqual/js/README.md`
- `openqual/schemas/`

Relevant source file(s):
- Source mappings are implicit throughout the extraction and candidate inventory.

Issue:
- Resolved. The extracted docs no longer lean on Firestore/Firebase/FlutterFlow contrast in the way Pass 1 flagged, and a direct scan did not find remaining proprietary dependency terms in the extracted standard/bindings.

Evidence:
- `openqual/dart/README.md` and `openqual/js/README.md` now lead with plain value-object semantics and standard-library-only usage.
- A dependency scan across `openqual/schemas`, `openqual/dart`, and `openqual/js` found no remaining `Firestore`, `Firebase`, `FlutterFlow`, or `DocumentReference` references in the extracted artifacts.

Recommended fix:
- No further fix required for the original finding.

## Nice to Have

### 10. JS signoff-policy docs still underspecify the role value type
Affected extracted file(s):
- `openqual/js/signoff_policy.js`

Relevant source file(s):
- `openqual/schemas/signoff_policy.md`
- `openqual/dart/signoff_policy.dart`

Issue:
- New minor clarity issue. The JS binding behavior is correct, but its JSDoc still types `orgMemberships` as `Object<string, string[]>`, which weakens the now-enum-backed role vocabulary and makes the JS docs read looser than the schema and Dart binding.

Evidence:
- `openqual/js/signoff_policy.js:39-40` documents `orgMemberships` as `Object<string, string[]>` even though the comment text says those arrays contain `OrgRoles` values.
- `openqual/schemas/signoff_policy.md:28-49` and `openqual/dart/signoff_policy.dart:40-46` both describe the role vocabulary as enum-constrained.

Recommended fix:
- Tighten the JS doc comment so it clearly says the arrays contain `OrgRoles` values rather than generic strings.

## Pass 2 Summary

### Status of the original 8 findings
- Fully resolved:
  1, 2, 4, 5, 7, 8
- Partially resolved:
  3, 6

### Partially addressed or regressed items
- Scope clarity was improved substantially, but the clarified README now makes the missing `Certification` / identity / authority slice an explicit v0.1 release blocker.
- Role-vocabulary tightening was completed in the type system, but one schema example and one JS doc comment still read as if role values were plain strings.

### New issues observed beyond the original 8
- New important release-readiness issue:
  the README and inventory now explicitly require missing v0.1 types that are not yet published.
- New minor docs issue:
  the JS signoff-policy docs still describe role arrays too loosely.

### Dependency contamination findings
- No proprietary runtime dependency leakage found in the current extracted `schemas/`, `dart/`, or `js/` artifacts.

### Recommendation
- If the goal is to get `0.1` out cleanly and move on, the extraction itself is in good shape.
- The main decision left is not a field-level cleanup problem; it is whether to:
  publish the missing required certification/identity/authority slice now,
  or narrow the formal v0.1 scope so the already-published slice can ship without contradiction.

## Review Pass 3 — 2026-04-17

Review scope for this pass:
- Re-read prior review passes in `openqual/REVIEW_NOTES.md`.
- Reviewed the Stage 7 certification slice additions and updates in `openqual/schemas/`, `openqual/dart/`, and `openqual/js/`.
- Focused on internal consistency, the OpenQual Principle, provenance coverage, and the new `Certification.isCurrentlyValid()` method.

Overall assessment:
- Stage 7 materially strengthens the standard. The certification slice now makes the v0.1 scope feel much more self-sufficient and coherent.
- The new types are generally consistent across schemas, Dart, and JS.
- Source attribution is present on the main new portable record types and on the updated reference configs, which is the right direction for the “Structure + Semantics + Provenance” model.
- The remaining issues are narrower than in earlier passes: one correctness issue in `Certification.isCurrentlyValid()`, one portability/provenance gap in `Attachment`, and two naming/docs issues worth tightening.

## Important

### 1. Certification.isCurrentlyValid() can mark a future-issued certification as currently valid
Affected extracted file(s):
- `openqual/schemas/certification.md`
- `openqual/dart/certification.dart`
- `openqual/js/certification.js`

Relevant source file(s):
- No direct source analogue; this is a new standard-level method added in Stage 7.

Issue:
- Confirmed correctness issue. The new method checks only `expiration_date`, so a certification with `certification_date` in the future is still considered currently valid as long as it is unexpired.
- For a method named `isCurrentlyValid`, that is too permissive. A credential that has not yet taken effect should not read as “currently valid.”

Evidence:
- `openqual/schemas/certification.md:18-19` models both `certification_date` and `expiration_date`.
- `openqual/schemas/certification.md:37-43` defines validity solely in terms of `expiration_date`.
- `openqual/dart/certification.dart:55-59` implements the same expiration-only logic.
- `openqual/js/certification.js:56-59` implements the same expiration-only logic.

Recommended fix:
- Update the method contract and both bindings so validity also respects the effective/start side:
- Suggested rule:
  if `certification_date` is non-null and `now < certification_date`, return `false`.
- Then apply the existing expiration logic after that check.
- This keeps the method pure and stylistically aligned with `SignoffPolicy.isEligible()` while making the semantics match the method name.

### 2. Attachment now emphasizes inline portability, but still requires a host-local path even when inline content is sufficient
Affected extracted file(s):
- `openqual/schemas/attachment.md`
- `openqual/dart/attachment.dart`
- `openqual/js/attachment.js`
- `openqual/schemas/certification.md`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/taskbook_attachment_struct.dart`

Issue:
- Confirmed OpenQual Principle issue. Stage 7 improved portability by adding inline `content`, but `Attachment.path` remains required even when `content` is present and fully sufficient to reconstruct the file.
- That over-specifies a host-storage concern in the exact place where the standard is trying to be self-contained and portable.

Evidence:
- `openqual/schemas/attachment.md:12` makes `path` required.
- `openqual/schemas/attachment.md:16-17` says `content` + `content_encoding` can make the attachment self-contained.
- `openqual/schemas/attachment.md:42-48` explicitly encourages inline content for portable exports.
- `openqual/schemas/certification.md:55-58` specifically encourages `cert_document.content` for portable exchange.
- `openqual/dart/attachment.dart:22-27` and `openqual/js/attachment.js:22-29` both require `path` in the binding constructors.

Recommended fix:
- Consider making the attachment-access contract:
  at least one of `path` or `content` must be present.
- If you want to preserve backward compatibility for host-backed records, a good v0.1 compromise would be:
  `path` optional when `content` is present; required otherwise.
- That would better match the “minimum needed to understand and exchange the data independently” test in `schemas/README.md`.

### 3. The new provenance model does not extend cleanly to Attachment, leaving no way to express attachment-specific source attribution
Affected extracted file(s):
- `openqual/schemas/attachment.md`
- `openqual/dart/attachment.dart`
- `openqual/js/attachment.js`
- `openqual/schemas/source.md`
- `openqual/schemas/certification.md`

Relevant source file(s):
- No direct source analogue; this is a standard design consistency issue introduced by the new provenance model.

Issue:
- Confirmed consistency gap. Stage 7 correctly added `source` to the main new certification types and to the updated reference configs, but `Attachment` has no `source`.
- That means a certification can say its embedded `CertType` or `PersonSnapshot` came from a different source than the parent record, but it cannot say the same for `cert_document` or supporting attachments.

Evidence:
- `openqual/schemas/source.md:20-28` says nested types should carry their own `source` when they come from a different source than the parent.
- `openqual/schemas/certification.md:28` explicitly applies provenance inheritance to nested types in `Certification`.
- `openqual/schemas/attachment.md:11-17` defines the attachment shape but includes no `source`.
- `openqual/dart/attachment.dart:20-35` and `openqual/js/attachment.js:17-39` likewise have no provenance field.

Recommended fix:
- Add `source: Source?` to `Attachment` unless there is a deliberate reason attachments should never carry independent provenance.
- If you intentionally want attachment provenance to always inherit from the parent, document that explicitly in `attachment.md` so it does not look like an accidental omission.

## Nice to Have

### 4. `canonical_name` is misleading for a field explicitly defined as a frozen snapshot display label
Affected extracted file(s):
- `openqual/schemas/task_type_config.md`
- `openqual/dart/task_type_config.dart`
- `openqual/js/task_type_config.js`

Relevant source file(s):
- `_sources/taskbook/lib/backend/schema/structs/task_type_config_struct.dart`

Issue:
- Probable naming issue. The reference-config docs say `canonical_name` is a frozen snapshot display name, but “canonical” elsewhere in the standard is tied to provenance identity via `canonical_id` and `canonical_source`.
- That makes `canonical_name` read more authoritative than the schema intends.

Evidence:
- `openqual/schemas/task_type_config.md:49,59,67` defines `canonical_name` as a snapshot display name for taskbook, skillsheet, and cert references.
- `openqual/schemas/task_type_config.md:79-82` says the field follows the snapshot principle, not a catalog-governed canonical identity rule.
- `openqual/schemas/source.md:15-16` reserves the `canonical_*` vocabulary for provenance identifiers.

Recommended fix:
- Consider renaming `canonical_name` to something like `display_name`, `snapshot_name`, or `reference_name`.
- If you keep `canonical_name`, add one sentence clarifying that it is not a catalog-canonical identity field, just a frozen human-readable label.

### 5. Source attribution guidance is mostly strong, but one note contradicts the optional field contract
Affected extracted file(s):
- `openqual/schemas/source.md`
- `openqual/schemas/README.md`

Relevant source file(s):
- No direct source analogue; this is a documentation consistency issue.

Issue:
- Minor docs inconsistency. The `Source` fields are optional and the docs correctly say records should populate them when the origin is known, but one note then says “The standard requires the attribution to be present,” which reads more strongly than the field contract allows.

Evidence:
- `openqual/schemas/source.md:15-16` makes both provenance fields optional.
- `openqual/schemas/source.md:44-47` says standards-compliant records should populate source attribution when the origin is known.
- `openqual/schemas/source.md:48-50` then says the standard requires the attribution to be present.
- `openqual/schemas/README.md:36-41` frames catalog enrichment as optional rather than required for conformance.

Recommended fix:
- Tighten the wording in `source.md` so it consistently says:
  provenance is optional in structure, strongly recommended when known, and not mandatory for catalog interaction.

## Pass 3 Summary

### Verified strengths
- The certification slice is internally coherent across `schemas/`, `dart/`, and `js/`.
- `Certification`, `CertType`, `CertifyingAgency`, `PersonSnapshot`, and the updated task reference configs all carry `source`, which applies the provenance model in the right places.
- `Discipline` and `CertClassification` are consistently defined and used.
- `Certification.isCurrentlyValid()` is stylistically in family with the other pure instance methods in the standard, but its current semantics are too narrow.

### New issues found
- Important:
  `Certification.isCurrentlyValid()` ignores future `certification_date`.
- Important:
  `Attachment` over-specifies `path` even when inline content is sufficient.
- Important:
  `Attachment` cannot carry independent provenance despite the new nested-source model.
- Nice to have:
  `canonical_name` is probably misnamed relative to the rest of the standard’s provenance vocabulary.
- Nice to have:
  `source.md` has one remaining optional-vs-required wording contradiction.

### Recommendation
- The Stage 7 additions are a strong step forward and make the standard feel meaningfully more publishable.
- If you want the cleanest `0.1`, I would prioritize fixing:
  `Certification.isCurrentlyValid()`,
  the attachment portability contract,
  and the attachment provenance gap.

## Review Pass 4 — 2026-04-17

Review scope for this pass:
- Re-read prior review context in `openqual/REVIEW_NOTES.md`.
- Reviewed the updated framing in `openqual/schemas/README.md`, `openqual/README.md`, and `openqual/index.html`.
- Reviewed the org/signoff cluster, schema-versioning, calendar-date semantics, and the two worked examples across `schemas/`, `dart/`, and `js/`.

Overall assessment:
- This is the strongest state OpenQual has been in across the four formal passes.
- The spec now reads like a real public standard rather than a cleaned-up extraction: scope is explicit, the center of gravity is clear, the org/snapshot model is coherent, and the examples materially improve third-party implementability.
- I found two items worth fixing before a `v0.1` release tag. One is a genuine normative contradiction; the other is a provenance gap where the `Taskbook` model lags behind the project’s own principle and example set.
- The two explicitly deferred backlog areas called out in the request do not create a current inconsistency by themselves.

## Release-Blocking

### 1. Schema-versioning and receiver-conformance rules contradict each other on newer MINOR versions
Affected extracted file(s):
- `openqual/schemas/README.md`

Relevant source file(s):
- No direct source analogue; this is a standards-level contract issue.

Issue:
- Confirmed release-blocking normative contradiction. The schema-versioning section says receivers encountering a newer version than they support MUST NOT silently process the record. But the receiver-conformance section then says receivers SHOULD tolerate unknown optional fields and certain unknown enum values when `schema_version` names a newer MINOR of the same MAJOR.
- Those two rules are pulling in opposite directions for the same case.

Evidence:
- `openqual/schemas/README.md:479-483` says a receiver encountering an unknown or newer version MUST NOT silently process the record.
- `openqual/schemas/README.md:497-500` says newer MINOR versions are backward-compatible additions.
- `openqual/schemas/README.md:590-595` says a receiver SHOULD tolerate unknown optional fields and some unknown enum values when `schema_version` names a newer MINOR of the same MAJOR.

Recommended fix:
- Pick one authoritative policy and propagate it consistently:
- Option A:
  strict version gating. Keep the MUST-NOT-process rule for any unsupported newer MINOR and remove/soften the SHOULD-tolerate language.
- Option B:
  semver-forward compatibility within a MAJOR. Allow receivers to process newer MINOR records when they can safely ignore unknown optional fields, and rewrite the receiver-behavior section accordingly.
- My recommendation:
  choose Option B if the project wants semver to mean what readers expect. If you choose Option A, the current MINOR-language should be tightened so it does not imply practical forward compatibility.

### 2. Taskbook still lacks a top-level `source` field even though provenance is now a core principle and the worked example uses one
Affected extracted file(s):
- `openqual/schemas/taskbook.md`
- `openqual/dart/taskbook.dart`
- `openqual/js/taskbook.js`
- `openqual/examples/taskbook_example.md`

Relevant source file(s):
- No direct source analogue; this is a standards-design consistency issue.

Issue:
- Confirmed release-blocking portability/provenance gap. OpenQual now explicitly centers provenance as a first-class part of the standard, and `Certification` has a top-level `source` field. `Taskbook` does not.
- The worked `Taskbook` example already includes a top-level `source`, which means the example has outrun the published model and both reference implementations.

Evidence:
- `openqual/schemas/README.md:49-69` frames provenance as part of the standard’s core identity and scope.
- `openqual/schemas/taskbook.md:11-30` defines the `Taskbook` fields and does not include `source`.
- `openqual/dart/taskbook.dart:33-52` and `openqual/js/taskbook.js:36-57` likewise have no top-level `source`.
- `openqual/examples/taskbook_example.md:532-535` includes a top-level `source` on the example `Taskbook`.

Recommended fix:
- Add `source: Source?` to `Taskbook` in the schema and both bindings.
- This would bring `Taskbook` in line with:
  the project’s stated “Structure + Semantics + Provenance” principle,
  the `Certification` root shape,
  and the already-published worked example.
- If you intentionally do not want `Taskbook` roots to carry provenance, then the example must be corrected and the provenance principle should be phrased more narrowly. I do not recommend that direction.

## Defer Safely

### 3. UTC-only reference implementations are acceptable for v0.1 because the limitation is documented, but this will matter quickly in production
Affected extracted file(s):
- `openqual/schemas/certification.md`
- `openqual/schemas/README.md`
- `openqual/dart/certification.dart`
- `openqual/js/certification.js`

Relevant source file(s):
- No direct source analogue; this is a standard/reference-implementation tradeoff.

Issue:
- Safe to defer for release. The standard now defines a two-step timezone cascade for day-granularity certification validity, but the reference implementations only implement the UTC fallback.
- This is acceptable because the limitation is explicitly documented and the conformance section calls it out. It does, however, mean the reference implementations are examples of conformant fallback behavior, not complete production-grade validity evaluators for issuer-local timezones.

Evidence:
- `openqual/schemas/certification.md:99-132` defines the cascade and explicitly documents the standard-library-only UTC fallback in the reference implementations.
- `openqual/schemas/README.md:617` repeats that UTC-only implementations are conformant for step 2 when they document the limitation.
- `openqual/dart/certification.dart:63-69` and `openqual/js/certification.js:66-75` document the same limitation.

Recommended fix:
- No change required before `v0.1`.
- When you move toward a packaged/reference-consumer story, consider a serialization/adapter layer or companion utilities that can honor `issuing_timezone` with a real timezone library.

### 4. The deferred backlog areas named in the request do not currently create inconsistency
Affected extracted file(s):
- `openqual/schemas/README.md`
- `openqual/schemas/certification.md`
- `openqual/schemas/task_type_config.md`

Relevant source file(s):
- None; this is about deferred scope posture.

Issue:
- No current inconsistency found from deferring:
  cross-credential relationship modeling, or
  equivalent-cert handling in requirements.
- The current spec remains internally coherent without them.

Evidence:
- `openqual/schemas/certification.md` is complete enough to represent a credential, its status, renewal state, and earned-via lineage without needing relationship modeling.
- `TaskTypeCertConfig` still works as a simple single-cert requirement in the current taskbook model.
- No reviewed file assumes reciprocity/equivalency machinery already exists.

Recommended fix:
- Safe to defer as planned.
- If `AcceptedCertType` lands before release, it should be treated as a focused additive change rather than reopening the broader relationship-modeling problem.

## Pass 4 Summary

### Release readiness
- Very close.
- The framing, modeling direction, and documentation quality are now strong enough that the remaining concerns are specific and fixable, not structural.

### Fix before tag
- Resolve the schema-versioning / receiver-conformance contradiction for newer MINOR versions.
- Add top-level `source` to `Taskbook`, or explicitly narrow the provenance model and correct the example. The cleaner path is to add the field.

### Safe to defer
- Production-grade timezone resolution beyond the documented UTC fallback.
- The two explicitly deferred backlog areas named in the request.

### Final impression for this pass
- OpenQual now reads as a thoughtful, usable, and increasingly trustworthy project.
- The center of gravity is much clearer, the org cluster made the model more self-contained, and the worked examples are doing real interoperability work rather than acting as ornamentation.
