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

const { OrganizationSnapshot } = require('./organization_snapshot');
const { PersonSnapshot } = require('./person_snapshot');

/**
 * A person captured at the time of assignment, paired with the
 * timestamp of when the assignment was made. Reused for assignee
 * and evaluator slots.
 */
class AssignedPerson {
  constructor({ person, assignedAt = null }) {
    this.person = person;
    this.assignedAt = assignedAt;
    Object.freeze(this);
  }
}

/**
 * An organization captured at the time of assignment, paired with
 * the timestamp of when the assignment was made. Used for the host
 * slot today and reusable for future organization-assignment slots.
 */
class AssignedOrganization {
  constructor({ organization, assignedAt = null }) {
    this.organization = organization;
    this.assignedAt = assignedAt;
    Object.freeze(this);
  }
}

/**
 * The assignment triple for a Taskbook: who is doing it, who will
 * evaluate it, and what organization is hosting it.
 */
class TaskbookAssignment {
  constructor({ assignee = null, evaluator = null, host = null } = {}) {
    this.assignee = assignee;
    this.evaluator = evaluator;
    this.host = host;
    Object.freeze(this);
  }
}

module.exports = {
  TaskbookAssignment,
  AssignedPerson,
  AssignedOrganization,
};
