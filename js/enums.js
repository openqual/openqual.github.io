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

const CertificationDurationUnits = Object.freeze({
  DAYS: 'days',
  MONTHS: 'months',
  QUARTERS: 'quarters',
  YEARS: 'years',
});

// Additional units (CE credits, sessions, contact hours) are planned for v0.2.
const RequirementUnits = Object.freeze({
  HOURS: 'hours',
});

const OrgRoles = Object.freeze({
  ADMIN: 'admin',
  OFFICER: 'officer',
  MEMBER: 'member',
  REQUESTED: 'requested',
  INVITED: 'invited',
});

module.exports = {
  WorkItemStatus,
  EvaluationOutcome,
  SignoffPolicyType,
  TaskTypes,
  TaskbookTypes,
  RenewalStatus,
  CertificationDurationUnits,
  RequirementUnits,
  OrgRoles,
};
