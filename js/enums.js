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

'use strict';

// Status of any node in the TaskBook hierarchy.
// `complete_failed` at section/taskbook level may result from autofail
// propagation, scoring threshold failure, or evaluation failure — not
// exclusively from evaluation outcome.
const WorkItemStatus = Object.freeze({
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  OWNER_ACTION_NEEDED: 'owner_action_needed',
  PENDING_VALIDATION: 'pending_validation',
  COMPLETE: 'complete',
  COMPLETE_FAILED: 'complete_failed',
});

// Outcome of a scored or pass/fail evaluation.
const EvaluationOutcome = Object.freeze({
  PASS: 'pass',
  FAIL: 'fail',
});

// Who may sign a SignoffPolicy.
// `org_officers` and `org_admins` are expressible as `org_members` with
// specific `allowedRoles` values. They are reserved for a future version
// and should not be implemented.
const SignoffPolicyType = Object.freeze({
  THIS_USER: 'this_user',
  SPECIFY_USERS: 'specify_users',
  ORG_MEMBERS: 'org_members',
});

const TaskTypes = Object.freeze({
  TASK: 'task',
  EVALUATION: 'evaluation',
  TASKBOOK: 'taskbook',
  SKILLSHEET: 'skillsheet',
  CERT: 'cert',
});

// Shape of an evaluation task's pass/fail determination.
const EvaluationType = Object.freeze({
  PASS_FAIL: 'pass_fail',
  SCORED: 'scored',
});

// How a book-level scoring threshold is applied across sections.
const ScoringMode = Object.freeze({
  AGGREGATED: 'aggregated',
  PER_SECTION: 'per_section',
});

const TaskbookTypes = Object.freeze({
  TASKBOOK: 'taskbook',
  SKILLSHEET: 'skillsheet',
});

const RenewalStatus = Object.freeze({
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETE: 'complete',
  OVERDUE: 'overdue',
});

// Unified calendar-time unit. The single standard enum for calendar-time
// quantities (durations, reporting windows, repeat intervals). Distinct
// from `RequirementUnits`, which measures training credit, not time.
const TimeUnit = Object.freeze({
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
  WEEKS: 'weeks',
  MONTHS: 'months',
  QUARTERS: 'quarters',
  YEARS: 'years',
});

// Additional units (CE credits, sessions, contact hours) are planned for a future version.
const RequirementUnits = Object.freeze({
  HOURS: 'hours',
});

// Discipline area for a certification type. Use OTHER when the discipline
// is not represented; populate discipline_other on the parent type.
const Discipline = Object.freeze({
  FIRE: 'fire',
  WILDLAND: 'wildland',
  EMS: 'ems',
  HAZMAT: 'hazmat',
  TECHNICAL_RESCUE: 'technical_rescue',
  LAW_ENFORCEMENT: 'law_enforcement',
  DISPATCH: 'dispatch',
  EMERGENCY_MANAGEMENT: 'emergency_management',
  SAR: 'sar',
  SKI_PATROL: 'ski_patrol',
  OTHER: 'other',
});

// Classification of a credential. Use OTHER when the classification is not
// represented; populate classification_other on the parent type.
const CertClassification = Object.freeze({
  CERTIFICATION: 'certification',
  LICENSE: 'license',
  OTHER: 'other',
});

// Administrative status of a Certification.
//
// Optional on the record. When present and set to REVOKED, SUSPENDED,
// or EXPIRED, isCurrentlyValid returns false regardless of dates. When
// absent or ACTIVE, isCurrentlyValid falls through to date-based
// evaluation — the status field does not override date-based
// expiration.
const CertStatus = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
});

// Authority roles a user may hold in an organization.
//
// These are authority roles only. Pre-membership states (e.g. pending
// invitation, pending join request) are outside the scope of the
// standard; a user who is not an accepted member holds no role.
const OrgRoles = Object.freeze({
  ADMIN: 'admin',
  OFFICER: 'officer',
  MEMBER: 'member',
});

module.exports = {
  WorkItemStatus,
  EvaluationOutcome,
  SignoffPolicyType,
  TaskTypes,
  EvaluationType,
  ScoringMode,
  TaskbookTypes,
  RenewalStatus,
  TimeUnit,
  RequirementUnits,
  Discipline,
  CertClassification,
  CertStatus,
  OrgRoles,
};
