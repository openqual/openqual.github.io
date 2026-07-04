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

const { readDate, dateToIso } = require('./codec');
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

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new AssignedPerson({
      person: PersonSnapshot.fromJSON(m.person),
      assignedAt: readDate(m.assigned_at),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = { person: this.person.toJSON() };
    if (this.assignedAt != null) out.assigned_at = dateToIso(this.assignedAt);
    return out;
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

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new AssignedOrganization({
      organization: OrganizationSnapshot.fromJSON(m.organization),
      assignedAt: readDate(m.assigned_at),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = { organization: this.organization.toJSON() };
    if (this.assignedAt != null) out.assigned_at = dateToIso(this.assignedAt);
    return out;
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

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskbookAssignment({
      assignee: m.assignee == null ? null : AssignedPerson.fromJSON(m.assignee),
      evaluator: m.evaluator == null ? null : AssignedPerson.fromJSON(m.evaluator),
      host: m.host == null ? null : AssignedOrganization.fromJSON(m.host),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.assignee != null) out.assignee = this.assignee.toJSON();
    if (this.evaluator != null) out.evaluator = this.evaluator.toJSON();
    if (this.host != null) out.host = this.host.toJSON();
    return out;
  }
}

module.exports = {
  TaskbookAssignment,
  AssignedPerson,
  AssignedOrganization,
};
