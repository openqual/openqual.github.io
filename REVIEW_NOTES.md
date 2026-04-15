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
