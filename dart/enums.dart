// Copyright 2026 FireCal LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/// Status of any node in the TaskBook hierarchy (task, section, or taskbook).
///
/// `completeFailed` at section/taskbook level may result from autofail
/// propagation, scoring threshold failure, or evaluation failure — not
/// exclusively from evaluation outcome.
enum WorkItemStatus {
  notStarted,
  inProgress,
  ownerActionNeeded,
  pendingValidation,
  complete,
  completeFailed,
}

/// Outcome of a scored or pass/fail evaluation. Lives on
/// `TaskTypeEvaluationConfig.result.outcome`.
///
/// At the task level, `status = completeFailed` is always accompanied by
/// `outcome = fail`, but `completeFailed` at section/taskbook level has
/// additional causes unrelated to evaluation outcome.
enum EvaluationOutcome { pass, fail }

/// Who may sign a [SignoffPolicy].
///
/// `org_officers` and `org_admins` are expressible as `orgMembers` with
/// specific `allowedRoles` values. They are reserved for a future version
/// and should not be implemented.
enum SignoffPolicyType { thisUser, specifyUsers, orgMembers }

/// Polymorphic discriminator for [TaskbookTask.type].
enum TaskTypes { task, evaluation, taskbook, skillsheet, cert }

/// Polymorphic discriminator for [Taskbook.taskbookType].
enum TaskbookTypes { taskbook, skillsheet }

/// Computed status of a certification renewal cycle.
enum RenewalStatus { notStarted, inProgress, complete, overdue }

/// Unit for a certification's validity period.
enum CertificationDurationUnits { days, months, quarters, years }

/// Unit for a [RenewalRequirement]'s target quantity.
///
/// Additional units (CE credits, sessions, contact hours) are planned for
/// v0.2.
enum RequirementUnits { hours }

/// Organization roles.
enum OrgRoles { admin, officer, member, requested, invited }
