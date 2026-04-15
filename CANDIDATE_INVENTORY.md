# OpenQual Stage 2 — Candidate Inventory

Analysis only. No code has been extracted or generated. Human review
determines the final shape of the OpenQual standard before any extraction.

> **Scope note (v0.1 release).** This inventory captured the full
> superset of portable candidates observed in the source apps. The
> v0.1 release publishes a focused subset — the TaskBook core
> hierarchy and the certification renewal slice — plus shared
> constants. Several items listed below as `INCLUDE` were subsequently
> reclassified during scope-finalization review:
>
> - **Reclassified as app concerns (out of standard scope):**
>   notification preference structs (`CertificationsStruct`,
>   `TrainingStruct`, `SharingStruct`, `OrgMembershipStruct`,
>   `ReminderConfigStruct`) and their CloudFunctions analogues
>   (`NotificationTypeSettings`, `SentNotificationStatus`,
>   `NotificationRequest` family, etc.); application-level permissions
>   and preferences (`CertPermissionsStruct`, `PermissionsStruct`,
>   `PreferencesStruct`, `AdvisoryAcknowledgementsStruct`); in-app
>   aggregations and workflow state (`InboxCountStruct`,
>   `ApplyTrainingSelectionStruct`).
> - **Required for v0.1 (design in progress):** the top-level
>   `Certification` class, person/identity primitives
>   (`AddressStruct`, `NameStruct`, `IdentityStruct`), and
>   certifying-agency / cert-type catalog modeling. These are inside
>   the v0.1 scope commitment — v0.1 cannot be released without them.
>   See `schemas/README.md` → "Required for v0.1 (design in progress)"
>   for the authoritative scope statement.
> - **Scoring reclassified as core:** `TaskbookEvaluationConfigStruct`
>   (Stage 2: gray-area), `TaskbookScoringConfigStruct`, and
>   `TaskbookScoringSummaryStruct` (Stage 2: excluded as proprietary)
>   were promoted to core standard types. See the individual rows for
>   their published names in v0.1.
> - **Consolidated enums:** `CertificationDurationUnits` and
>   `ReportExpiringUnits` were superseded by a single unified
>   `TimeUnit` enum in v0.1.
> - **Promoted to constant:** `setNeverExpireDate` became the
>   published sentinel `neverExpireDate`; see
>   `schemas/constants.md`.
>
> The rows below retain their original Stage 2 categorization for
> historical reference.

Source repos (read-only reference material):

- `_sources/certlocker/` @ `7ce3a2bd7f37c29d0415c8bc3d1a8c22ef439099`
- `_sources/taskbook/` @ `c6bb53a74ce5ae4167c983808c5a552687e8b66c`

Categories used below:

- **INCLUDE** — portable class, enum, or pure method belonging in the spec
- **EXCLUDE** — UI, storage-layer wrapper, scoring, notification delivery,
  platform/runtime concern, or app-specific automation
- **GRAY AREA** — portable in shape but with FireCal-specific fields that
  may or may not belong in the public standard
- **REFACTOR CANDIDATE** — sound portable logic currently disqualified by
  an embedded Firestore fetch; pure form is described in Notes
- **💡 OBSERVATION** — architectural improvement worth resolving before
  publishing a public standard

---

## 1. CertLocker — Dart (`_sources/certlocker/lib/`)

Scope covered: `lib/backend/schema/structs/` (48 struct files),
`lib/backend/schema/enums/enums.dart`, `lib/custom_code/actions/` (28
actions), `lib/app_state.dart`, `lib/app_constants.dart`. Firestore record
wrappers (`backend/schema/*_record.dart`) and UI (`lib/pages/`,
`lib/components/`, `lib/flutter_flow/`) are summarized as single rows per
CLAUDE.md.

| Name | Source File(s) | Category | Recommendation | Notes |
|------|---------------|----------|----------------|-------|
| `OrgRoles` | `backend/schema/enums/enums.dart:3-9` | Enum | INCLUDE | Admin, Officer, Member, Requested, Invited |
| `RequirementUnits` | `backend/schema/enums/enums.dart:11-13` | Enum | INCLUDE | Currently only Hours; revisit whether CE credits, sessions, etc. should be added |
| `CertificationDurationUnits` | `backend/schema/enums/enums.dart:15-20` | Enum | INCLUDE | Days, Months, Quarters, Years |
| `ReportExpiringUnits` | `backend/schema/enums/enums.dart:22-27` | Enum | INCLUDE | years, months, weeks, days — time-unit for expiration reporting |
| `NotificationTriggerType` | `backend/schema/enums/enums.dart:31-34` | Enum | EXCLUDE | Internal notification dispatch concern |
| `AddressStruct` | `backend/schema/structs/address_struct.dart` | Class | INCLUDE | street, city, state, zipcode, country |
| `NameStruct` | `backend/schema/structs/name_struct.dart` | Class | INCLUDE | prefix, first, middle, last, suffix, display |
| `IdentityStruct` | `backend/schema/structs/identity_struct.dart` | Class | GRAY AREA | Driver's license / SSN / passport fields — decide whether identity belongs in the qualification standard at all |
| `ReminderConfigStruct` | `backend/schema/structs/reminder_config_struct.dart` | Class | INCLUDE | Start + repeat timing for reminders |
| `RenewalRequirementStruct` | `backend/schema/structs/renewal_requirement_struct.dart` | Class | INCLUDE | name, quantity, units, order — atomic renewal requirement |
| `RenewalComponentStruct` | `backend/schema/structs/renewal_component_struct.dart` | Class | INCLUDE | name, quantity, nested requirements |
| `RenewalRequirementsStruct` | `backend/schema/structs/renewal_requirements_struct.dart` | Class | INCLUDE | Versioned collection of renewal requirements |
| `RenewalComponentProgressStruct` | `backend/schema/structs/renewal_component_progress_struct.dart` | Class | INCLUDE | completed + effective quantity (capped) |
| `RenewalRequirementProgressStruct` | `backend/schema/structs/renewal_requirement_progress_struct.dart` | Class | INCLUDE | Tracks applied training + manual credit |
| `RenewalProgressStruct` | `backend/schema/structs/renewal_progress_struct.dart` | Class | INCLUDE | Top-level container for renewal progress |
| `PreviousRenewalStruct` | `backend/schema/structs/previous_renewal_struct.dart` | Class | INCLUDE | Archived snapshot: requirements + progress at archival time |
| `PreviousRenewalsStruct` | `backend/schema/structs/previous_renewals_struct.dart` | Class | INCLUDE | History container for archived renewals |
| `CertificationsStruct` | `backend/schema/structs/certifications_struct.dart` | Class | INCLUDE | Cert-level notification prefs + reminder config |
| `TrainingStruct` | `backend/schema/structs/training_struct.dart` | Class | INCLUDE | Training-level notification prefs + reminder config |
| `SharingStruct` | `backend/schema/structs/sharing_struct.dart` | Class | INCLUDE | Sharing notification channels |
| `OrgMembershipStruct` | `backend/schema/structs/org_membership_struct.dart` | Class | INCLUDE | Org-membership notification channels |
| `CertPermissionsStruct` | `backend/schema/structs/cert_permissions_struct.dart` | Class | INCLUDE | Per-cert permissions (currently `private` boolean) |
| `InboxCountStruct` | `backend/schema/structs/inbox_count_struct.dart` | Class | INCLUDE | category + count aggregator |
| `ApplyTrainingSelectionStruct` | `backend/schema/structs/apply_training_selection_struct.dart` | Class | INCLUDE | Training-to-requirement mapping by IDs |
| `AdvisoryAcknowledgementsStruct` | `backend/schema/structs/advisory_acknowledgements_struct.dart` | Class | GRAY AREA | App-specific terms/advisory acknowledgement dates |
| `OrgSettingsStruct` | `backend/schema/structs/org_settings_struct.dart` | Class | GRAY AREA | Mix of portable policy fields and FireCal product toggles |
| `OrgAdministrationStruct` | `backend/schema/structs/org_administration_struct.dart` | Class | GRAY AREA | Scope depends on whether org lifecycle belongs in the standard |
| `PreferencesStruct` | `backend/schema/structs/preferences_struct.dart` | Class | GRAY AREA | User preferences — may contain app-specific toggles |
| `PermissionsStruct` | `backend/schema/structs/permissions_struct.dart` | Class | GRAY AREA | Page-level permissions feel UI-coupled; audit fields |
| `CertificationsStruct.incrementDefaultReminderDeliveryValue` | `backend/schema/structs/certifications_struct.dart:54-55` | Method | INCLUDE | Pure increment helper |
| `CertificationsStruct.incrementDefaultRepeatRateValue` | `backend/schema/structs/certifications_struct.dart:65-66` | Method | INCLUDE | Pure increment helper |
| `RenewalComponentStruct.updateRequirements` | `backend/schema/structs/renewal_component_struct.dart:65-67` | Method | INCLUDE | Pure list update |
| `RenewalRequirementStruct.incrementRequirementQuantity` | `backend/schema/structs/renewal_requirement_struct.dart:60-61` | Method | INCLUDE | Pure increment helper |
| `TrainingStruct.updateReminderConfig` | `backend/schema/structs/training_struct.dart:118-119` | Method | INCLUDE | Pure nested-struct update |
| `InboxCountStruct.incrementCount` | `backend/schema/structs/inbox_count_struct.dart:30` | Method | INCLUDE | Pure increment |
| `setNeverExpireDate` | `custom_code/actions/set_never_expire_date.dart` | Function | INCLUDE | Returns sentinel `DateTime(9999,12,31)` — belongs as a constant or static helper on the cert class |
| `calculateAppliedTrainingCEUnits` | `custom_code/actions/calculate_applied_training_c_e_units.dart:14-27` | Function | REFACTOR CANDIDATE | Sums `units_earned` across training refs. Pure version would accept `List<double>` or `List<TrainingRecord>` (pre-fetched) and return `double`. Trivial refactor. |
| `calculateCertificationProgress` | `custom_code/actions/calculate_certification_progress.dart:14-103` | Function | REFACTOR CANDIDATE | Component/requirement progress + effective-quantity clamping. Pure version: accept components, required totals, manual credit, and pre-calculated training units → return `{ceUnitsEarned, certificationProgress}`. Straightforward. |
| `updateRequirementProgress` | `custom_code/actions/update_requirement_progress.dart:17-111` | Function | REFACTOR CANDIDATE | Firestore fetch → find requirement → update manual credit → recalc. Pure version: `(RenewalProgressStruct, componentId, requirementId, newManualCredit) → RenewalProgressStruct`. |
| `updateComponentProgress` | `custom_code/actions/update_component_progress.dart` | Function | REFACTOR CANDIDATE | Same pattern as above at component level. Pure version: `(RenewalProgressStruct, componentId, newManualCredit) → RenewalProgressStruct`. |
| `updateCertProgress` | `custom_code/actions/update_cert_progress.dart` | Function | REFACTOR CANDIDATE | Fetch-recalculate-write pattern; extractable pure recalculation over a `RenewalProgressStruct`. |
| `updateComponentAppliedTraining` | `custom_code/actions/update_component_applied_training.dart` | Function | REFACTOR CANDIDATE | Pure version: `(RenewalComponentProgressStruct, List<DocumentReference>) → RenewalComponentProgressStruct`. Note: DocumentReference dependency is itself an observation (see below). |
| `updateRequirementAppliedTraining` | `custom_code/actions/update_requirement_applied_training.dart` | Function | REFACTOR CANDIDATE | Analogous at requirement level. |
| `getInboxSummary` | `custom_code/actions/get_inbox_summary.dart:14-44` | Function | REFACTOR CANDIDATE | Aggregation by category is pure; Firestore fetch is the disqualifier. Pure version: `List<InboxRecord> → List<InboxCountStruct>`. |
| `applyTrainingSelection` | `custom_code/actions/apply_training_selection.dart:14-77` | Function | EXCLUDE | Writes to Firestore subcollection; storage-layer concern |
| `updateAllUserCertReminders` | `custom_code/actions/update_all_user_cert_reminders.dart` | Function | EXCLUDE | Reminder/notification scheduling |
| `updateAllUserTrainingReminders` | `custom_code/actions/update_all_user_training_reminders.dart` | Function | EXCLUDE | Reminder/notification scheduling |
| `getUnacknowledgedAnnouncements` | `custom_code/actions/get_unacknowledged_announcements.dart` | Function | EXCLUDE | Firestore filtering for app announcements |
| `aggregateCertificateUrls` | `custom_code/actions/aggregate_certificate_urls.dart` | Function | EXCLUDE | Sharing presentation concern |
| `parseJsonString` | `custom_code/actions/parse_json_string.dart` | Function | EXCLUDE | Generic JSON utility; not qualification-specific |
| `replaceTemplateWildcard` | `custom_code/actions/replace_template_wildcard.dart` | Function | EXCLUDE | Generic string utility (CertLocker has it, TaskBook has it, CloudFunctions has its own inline variant — see OBSERVATION below) |
| `getAppVersion`, `getFcm`, `getTimezones`, `getUserLocalTimezone`, `downloadPdfFromUrl`, `imageToPdf`, `hideSoftKeyboard`, `fixDeviceOrientationUp`, `setEntitlementVariables`, `trainingDocIdsFromDocRefs` | `custom_code/actions/*.dart` | Function | EXCLUDE | Platform, I/O, entitlement, or UI concerns |
| All `*_record.dart` in `backend/schema/` (`CertsRecord`, `UsersRecord`, `CertTypesRecord`, `TrainingRecord`, `TrainingRecordsRecord`, `OrganizationsRecord`, etc.) | `backend/schema/*_record.dart` | Class | EXCLUDE | Firestore collection wrappers — storage implementation |
| `FFAppState` | `app_state.dart` | Class | EXCLUDE | Flutter runtime app state |
| `FFAppConstants` | `app_constants.dart` | Class | EXCLUDE | App version / environment constants |
| All widgets, screens, and FlutterFlow utilities | `lib/pages/**`, `lib/components/**`, `lib/flutter_flow/**` | Widget/Util | EXCLUDE | UI and framework runtime; per CLAUDE.md, no exceptions |
| All Firestore/schema serialization helpers | `backend/schema/util/*.dart` | Util | EXCLUDE | Database layer |

---

## 2. TaskBook — Dart (`_sources/taskbook/lib/`)

Scope covered: `lib/backend/schema/structs/` (~85 struct files),
`lib/backend/schema/enums/enums.dart`, `lib/custom_code/actions/` (~44
actions), `lib/app_constants.dart`. UI, FlutterFlow, and Firestore record
wrappers summarized per CLAUDE.md.

TaskBook is a fork of CertLocker; shared struct and enum definitions (see
Section 1) are **not** repeated below except where they diverge. Rows below
cover the TaskBook-specific additions.

| Name | Source File(s) | Category | Recommendation | Notes |
|------|---------------|----------|----------------|-------|
| `TaskbookStruct` | `backend/schema/structs/taskbook_struct.dart` | Class | INCLUDE | Root portable type: type, title, description, dueDate, progress, status, sections, signoff policies, owner_marked_complete, attachments |
| `TaskbookSectionStruct` | `backend/schema/structs/taskbook_section_struct.dart` | Class | INCLUDE | order, id, title, description, dueDate, progress, tasks, status, owner_marked_complete, signoff overrides |
| `TaskbookTaskStruct` | `backend/schema/structs/taskbook_task_struct.dart` | Class | INCLUDE | order, id, type, title, description, dueDate, subtasks, progress, status, signoff overrides |
| `TaskbookSubtaskStruct` | `backend/schema/structs/taskbook_subtask_struct.dart` | Class | INCLUDE | order, id, title, complete, completeDatetime |
| `TaskbookSignoffPolicyStruct` | `backend/schema/structs/taskbook_signoff_policy_struct.dart` | Class | INCLUDE | id, type (`this_user`/`specify_users`/`org_members`/`org_officers`/`org_admins`), allowedOrgs, allowedRoles, allowedUsers, completed, completionTimestamp |
| `TaskbookAssignmentStruct` | `backend/schema/structs/taskbook_assignment_struct.dart` | Class | INCLUDE | assignee + evaluator + hostOrg |
| `TaskbookAssigneeStruct` | `backend/schema/structs/taskbook_assignee_struct.dart` | Class | INCLUDE | Person identity for the assignee |
| `TaskbookEvaluatorStruct` | `backend/schema/structs/taskbook_evaluator_struct.dart` | Class | INCLUDE | Person identity for the evaluator |
| `TaskbookHostOrgStruct` | `backend/schema/structs/taskbook_host_org_struct.dart` | Class | INCLUDE | Hosting org snapshot |
| `TaskbookSummaryStruct` | `backend/schema/structs/taskbook_summary_struct.dart` | Class | INCLUDE | Count aggregates by status + signoff totals + lastModified |
| `TaskbookAttachmentStruct` | `backend/schema/structs/taskbook_attachment_struct.dart` | Class | GRAY AREA | Confirm fields include enough attachment metadata (mime, size) — see OBSERVATION |
| `StartAndEndTimesStruct` | `backend/schema/structs/start_and_end_times_struct.dart` | Class | INCLUDE | startAt + endAt pair for activities |
| `TaskTypeConfigStruct` | `backend/schema/structs/task_type_config_struct.dart` | Class | INCLUDE | Polymorphic container: evaluationConfig, taskbookConfig, skillsheetConfig, certConfig |
| `TaskTypeEvaluationConfigStruct` | `backend/schema/structs/task_type_evaluation_config_struct.dart` | Class | INCLUDE | Evaluation-specific task config |
| `TaskbookEvaluationConfigStruct` | `backend/schema/structs/taskbook_evaluation_config_struct.dart` | Class | INCLUDE | Stage 2 marked this gray-area pending a scoring decision. Stage 3 resolved scoring as core to the standard — published in v0.1 as `TaskbookEvaluationConfig` (book-level `scoring_mode` + threshold). |
| `TaskbookScoringConfigStruct` | `backend/schema/structs/taskbook_scoring_config_struct.dart` | Class | INCLUDE | Stage 2 excluded as proprietary. Stage 3 reversed: scoring is core. Published as `BookScoringConfig` (nested in `TaskbookEvaluationConfig`) and `SectionScoringConfig` (on `TaskbookSection`). |
| `TaskbookScoringSummaryStruct` | `backend/schema/structs/taskbook_scoring_summary_struct.dart` | Class | INCLUDE | Stage 2 excluded as proprietary. Stage 3 reversed. Published as `BookScoringSummary` (on `TaskbookSummary`) and `SectionScoringSummary` (on `TaskbookSection`), derived by `computeStatus` at each level. |
| `TaskTypes` enum | `backend/schema/enums/enums.dart` | Enum | INCLUDE | task, evaluation, taskbook, skillsheet, cert |
| `TaskbookTypes` enum | `backend/schema/enums/enums.dart` | Enum | INCLUDE | TaskBook, SkillSheet |
| `AppMode` enum | `backend/schema/enums/enums.dart` | Enum | GRAY AREA | view/edit/work — arguably UI state |
| `DetailsToShowOptions` enum | `backend/schema/enums/enums.dart` | Enum | EXCLUDE | UI display hint |
| `quickCheckSignoffEligibility` | `custom_code/actions/quick_check_signoff_eligibility.dart` | Function | INCLUDE | **Prime portable method.** Accepts `TaskbookSignoffPolicyStruct` + user role/org refs → `bool`. Evaluates all 5 signoff types. No Firestore. Should live as a method on `TaskbookSignoffPolicyStruct.isEligible(user, orgMemberships)`. |
| `parseJsonToTaskBook` | `custom_code/actions/parse_json_to_task_book.dart` | Function | INCLUDE | Parses external JSON (AI-generated) into `TaskbookStruct` with initialized defaults and generated IDs. Pure. Belongs as a `TaskbookStruct.fromExternalJson` factory. |
| `calculateCertificationProgress` (TaskBook variant) | `custom_code/actions/calculate_certification_progress.dart` | Function | REFACTOR CANDIDATE | Mirrors CertLocker's. See divergence OBSERVATION below. Pure version: accept components + pre-fetched training unit totals + manual credit → `{ceUnitsEarned, certificationProgress}`. |
| `calculateAppliedTrainingCEUnits` (TaskBook variant) | `custom_code/actions/calculate_applied_training_c_e_units.dart` | Function | REFACTOR CANDIDATE | See CertLocker equivalent; same refactor pattern. |
| `updateRequirementProgress` / `updateComponentProgress` / `updateComponentAppliedTraining` / `updateRequirementAppliedTraining` (TaskBook variants) | `custom_code/actions/*.dart` | Function | REFACTOR CANDIDATE | Same fetch-recalculate-write pattern as CertLocker equivalents; pure versions accept the relevant struct and return an updated struct. Unify with CertLocker variants as a single canonical implementation. |
| `ownerMarkComplete` | `custom_code/actions/owner_mark_complete.dart` | Function | REFACTOR CANDIDATE | Hierarchical completion traversal (subtask → task → section → taskbook). Pure version: `(TaskbookStruct, sectionId?, taskId?, subtaskId?) → TaskbookStruct`. Moderate complexity but all logic is in-memory tree navigation. High-value method for the standard. |
| `updateTaskBookTask` | `custom_code/actions/update_task_book_task.dart` | Function | REFACTOR CANDIDATE | Pure version: `(TaskbookStruct, sectionId, TaskbookTaskStruct, {delete, resetCompletionStatus}) → TaskbookStruct`. Includes ancestor-reset logic when a completed task is edited. |
| `updateTaskBookSection` | `custom_code/actions/update_task_book_section.dart` | Function | REFACTOR CANDIDATE | Analogous section-level variant. |
| `checkVersionCompliance` | `custom_code/actions/check_version_compliance.dart` | Function | EXCLUDE | Firebase Remote Config + app-build gating |
| `applyTrainingSelection` (TaskBook variant) | `custom_code/actions/apply_training_selection.dart` | Function | EXCLUDE | Subcollection write |
| `duplicate_as_task_book`, `duplicate_as_template` | `custom_code/actions/*.dart` | Function | EXCLUDE | Database mutation + app workflow |
| All notification/reminder actions (`update_all_user_*_reminders`, etc.) | `custom_code/actions/*.dart` | Function | EXCLUDE | Reminder scheduling and delivery |
| All widgets, screens, and FlutterFlow utilities | `lib/pages/**`, `lib/components/**`, `lib/flutter_flow/**` | Widget/Util | EXCLUDE | UI and framework runtime |
| All Firestore record wrappers and schema utils | `backend/schema/**/*_record.dart`, `backend/schema/util/*.dart` | Class/Util | EXCLUDE | Storage layer |

---

## 3. CertLocker Cloud Functions — JavaScript/TypeScript (`_sources/certlocker/CloudFunctions/`)

TaskBook does not have a CloudFunctions directory (verified). All JS/TS
analysis below is for CertLocker only.

Scope covered: `functions/lib/index.js`, `functions/lib/notifications/`,
`notifications/src/notifications/*.ts`, `notifications/src/reminders/publishReminders.ts`,
topic/service constants.

| Name | Source File(s) | Category | Recommendation | Notes |
|------|---------------|----------|----------------|-------|
| `NotificationTypeSettings` | `notifications/src/notifications/notificationTypeSettings.model.ts:3-21` | Class | INCLUDE | Preference mapper with `notify_me` default logic. Pure. |
| `NotificationDeliveryStatus` | `notifications/src/notifications/sent-notification-status.model.ts:5-13` | Class | INCLUDE | Delivery-state data class with status + reason |
| `SentNotificationStatus` | `notifications/src/notifications/sent-notification-status.model.ts:15-33` | Class | INCLUDE | Multi-channel delivery status tracker; `setStatusForDisabled` is pure |
| `NotificationTypeOptions` | `notifications/src/notifications/notification-types.model.ts:1` | Type | INCLUDE | Discriminated union for channel names |
| `NotificationRequest` + `TextNotificationRequest` / `EmailNotificationRequest` / `PushNotificationRequest` / `InAppNotificationRequest` | `notifications/src/notifications/notificationRequest.model.ts` | Interface | INCLUDE | Pure request data shapes for each channel |
| `Notifications` | `notifications/src/notifications/notifications.model.ts:4-21` | Class | REFACTOR CANDIDATE | Wraps pre-fetched raw preferences object. Pure, but coupled to Firestore-shaped input. Pure version accepts plain map → returns `NotificationTypeSettings` per category. |
| `User` | `notifications/src/notifications/user.model.ts:11-33` | Class | REFACTOR CANDIDATE | Thin Firestore doc wrapper; pure getters (`uid`, `email`, `phoneNumber`, `preferences`) — portable version accepts a plain record. Phone normalization (`+1${...replace(/\D/g, '')}`) is reusable if lifted out. |
| `User.getNotificationSettings` | `notifications/src/notifications/user.model.ts:30-32` | Method | GRAY AREA | Depends on `User` being portable first |
| `UserNotificationSender.send` | `notifications/src/notifications/userNotificationSender.ts:26-69` | Method | REFACTOR CANDIDATE | Channel-selection decision logic is pure; mixed with `FireStoreService.updateStatuses` side effects. Pure version: `(NotificationTypeSettings, NotificationRequest) → List<channel>` plus separated persistence wrapper. |
| `UserNotificationSender.sendText` / `sendEmail` / `sendInAppNotification` / `sendPushNotification` | `notifications/src/notifications/userNotificationSender.ts:71-92` | Method | REFACTOR CANDIDATE | Pure request-construction; currently requires `User` wrapper. Portable variants would accept plain recipient data. |
| `UserNotificationSender.allNotificationsDisabled` | `notifications/src/notifications/userNotificationSender.ts:107-112` | Method | GRAY AREA | Narrow utility; may or may not be worth formalizing |
| `formatLocation` | `notifications/src/reminders/publishReminders.ts:28-33` | Function | GRAY AREA | Pure string join with fallback. Reusable if OpenQual standardizes address formatting. |
| `interpolate` | `notifications/src/reminders/publishReminders.ts:153-159` | Function | GRAY AREA | Pure template interpolator. Mirrors `replaceTemplateWildcard` in both Dart codebases — see OBSERVATION on the inconsistent three-way duplication. |
| `sendNotification` | `notifications/src/notifications/sendNotifications.ts:23-55` | Function | EXCLUDE | Cloud Function trigger; Firestore + Pub/Sub orchestration |
| `getUsersByIds` | `notifications/src/notifications/sendNotifications.ts:17-21` | Function | EXCLUDE | Firestore fetch helper |
| `sendTextMessage`, `sendEmailNotification`, `sendInAppNotifications`, `sendPushNotification` | `notifications/src/notifications/notificationDeliverers.ts` | Function | EXCLUDE | Twilio/SendGrid/Firestore delivery triggers |
| `getUser` | `notifications/src/notifications/notificationDeliverers.ts:146-148` | Function | EXCLUDE | Firestore reference builder |
| `FireStoreService` | `notifications/src/notifications/fireStoreService.ts:9-35` | Class | EXCLUDE | Pure Firestore abstraction — storage concern |
| `publishReminders` | `notifications/src/reminders/publishReminders.ts:9-254` | Function | EXCLUDE | Cloud Scheduler orchestrator; heavy Firestore use |
| `SEND_*` topic constants | `notifications/src/notifications/topics.ts` | Constant | EXCLUDE | Pub/Sub infrastructure |

---

## 4. 💡 Architectural Observations

Ordered by impact on a published standard.

**1. Status fields are untyped strings in TaskBook.**
`TaskbookStruct`, `TaskbookSectionStruct`, and `TaskbookTaskStruct` all
carry a `status: String` (values seen: `not_started`, `in_progress`,
`owner_action_needed`, `pending_validation`, `completed`) but no Dart
`enum`. Other discriminators (`TaskTypes`, `OrgRoles`) are enums. Define a
`TaskStatus` enum and migrate before publishing.

**2. Signoff policy type is also an untyped string.**
`TaskbookSignoffPolicyStruct.type` is a fixed 5-value discriminator
(`this_user`, `specify_users`, `org_members`, `org_officers`,
`org_admins`). It should be a `SignoffPolicyType` enum. Relevant
implementations — including `quickCheckSignoffEligibility` — all branch
on this string and would benefit from exhaustive matching.

**3. Signoff-policy cascade semantics are implicit.**
`signoffPolicyCascades` exists on TaskbookStruct and TaskbookSectionStruct,
but the cascade/override resolution algorithm across Taskbook → Section →
Task is not formalized anywhere in code. A public standard must spell out
exactly how overrides compose.

**4. Owner-completion is modeled inconsistently across the task hierarchy.**
- Taskbook: `owner_marked_complete: bool` + timestamp
- Section: `owner_marked_complete: bool` + timestamp
- Task: `owner_marked_complete: bool` + timestamp
- Subtask: `complete: bool` + `completeDatetime`

Pick one name and factor out a shared `CompletionState { complete, completedAt }`
struct so the 4 levels align.

**5. Notification preferences are duplicated across 4 structs.**
`CertificationsStruct`, `TrainingStruct`, `SharingStruct`, and
`OrgMembershipStruct` each redeclare the same channel fields (`appInbox`,
`email`, `push`, `textMessage`, `notifyMe`) with slightly different
defaults. Extract a single `NotificationPreferencesStruct` and compose it.

**6. Reminder configuration is duplicated with `ReminderConfigStruct`.**
`CertificationsStruct` and `TrainingStruct` each redefine their own
`defaultReminderDeliveryValue/Units` + `defaultRepeatRateValue/Units`
alongside an embedded `ReminderConfigStruct`. The config struct should be
the canonical source; remove the duplicated primitives.

**7. Template wildcard interpolation exists in three places with three
shapes.**
- CertLocker Dart: `replaceTemplateWildcard` (single wildcard token)
- TaskBook Dart: `replaceTemplateWildcard` (same)
- Cloud Functions TS: inline switch on fixed tokens + generic `interpolate`

Publish one canonical interpolator (accepts template + map of tokens →
values) and adopt it everywhere.

**8. `calculateCertificationProgress` diverges between CertLocker and
TaskBook.**
Both repos have a function by this name operating on the same struct
shape. Diff and reconcile; publish a single canonical implementation.
Same for `calculateAppliedTrainingCEUnits` and the four `update*` progress
mutators — all appear in both repos.

**9. Progress fields are cached denormalized values with no documented
policy.**
`TaskbookStruct.progress`, `TaskbookSectionStruct.progress`,
`RenewalComponentProgressStruct.effective_quantity_completed`, etc. are
all derived quantities stored on the struct. The standard should say
explicitly: are these computed on read, or cached on write? If cached,
which method(s) are authoritative for recomputing them?

**10. `appliedTraining` is a `List<DocumentReference>` in the portable
structs.**
`RenewalComponentProgressStruct`, `RenewalRequirementProgressStruct`, and
`PreviousRenewalStruct` all store references. This embeds Firestore in the
portable data model. Decide: plain IDs, embedded snapshots, or a portable
`TrainingRef` value object.

**11. No `CompletionStatus` enum for renewals.**
Certification renewals track completed/effective quantities but don't
carry a status (`NotStarted`/`InProgress`/`Complete`/`Overdue`). Third-
party implementers will invent their own — publish one.

**12. Evaluation config carries proprietary scoring by reference.**
`TaskbookEvaluationConfigStruct` nests `TaskbookScoringConfigStruct`
(excluded). Either strip evaluation from the spec, or publish a
scoring-free rubric evaluation subset.

**13. Attachment metadata appears minimal.**
`TaskbookAttachmentStruct` appears to store name/URL. A public standard
should require mime type, size, and upload timestamp.

**14. Requirements-version compatibility is captured but not enforced.**
`PreviousRenewalStruct.requirementsVersion` exists, but nothing on the
current renewal types validates version compatibility. Document (or
publish) the expected versioning contract.

**15. Phone formatting is US-only.**
The Cloud Functions `User` class hardcodes `+1` and a digit-only regex.
OpenQual should standardize on E.164 and accept a locale/country code.

**16. `RequirementUnits` currently has only `Hours`.**
If the standard covers EMS CE, SAR training, etc., this enum will need
additional units (CE credits, sessions). Worth deciding the target set
before publishing so third-party implementations don't invent their own.

**17. `NotificationRequest` shape does not align with `SentNotificationStatus` shape.**
Request uses `recipientIds`/`shortMessage` while status tracks per-channel
delivery state without the same keying. Consider a parent `Notification`
type that ties request + status together deterministically.

---

## 5. Summary counts

CertLocker Dart: ~27 INCLUDE classes/enums, ~6 pure methods, ~7 REFACTOR
CANDIDATES, ~6 GRAY AREA, UI + records EXCLUDED in bulk.

TaskBook Dart (additions beyond CertLocker): ~17 INCLUDE classes, 4
INCLUDE enums, 2 INCLUDE pure functions (`quickCheckSignoffEligibility`,
`parseJsonToTaskBook`), ~8 REFACTOR CANDIDATES, 3 GRAY AREA, scoring
structs EXCLUDED.

Cloud Functions JS/TS: ~10 INCLUDE (mostly interfaces/data classes), ~8
REFACTOR CANDIDATES in the notification-routing layer, rest EXCLUDED as
triggers, delivery, or Firestore abstraction.

Observations: 17 items worth resolving before extraction begins.

No code has been extracted or generated. Next step: human review of this
inventory to decide GRAY AREA dispositions, confirm REFACTOR CANDIDATES
to pursue, and resolve the architectural OBSERVATIONS before Stage 3
extraction.
