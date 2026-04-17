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
const { Source } = require('./source');

/**
 * Frozen point-in-time identity capture.
 * Reusable for certification holders, instructors, evaluators, etc.
 */
class PersonSnapshot {
  constructor({
    displayName,
    firstName = null,
    lastName = null,
    middleName = null,
    suffix = null,
    email = null,
    memberships = null,
    source = null,
  }) {
    this.displayName = displayName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.middleName = middleName;
    this.suffix = suffix;
    this.email = email;
    this.memberships = memberships == null ? null : Object.freeze([...memberships]);
    this.source = source;
    Object.freeze(this);
  }
}

/**
 * An organization membership captured on a PersonSnapshot.
 * Snapshot-shaped; carries no lifecycle vocabulary. See
 * "Memberships and scope boundary" in schemas/person_snapshot.md.
 */
class OrgMembership {
  constructor({ organization, roles }) {
    this.organization = organization;
    this.roles = Object.freeze([...roles]);
    Object.freeze(this);
  }
}

module.exports = { PersonSnapshot, OrgMembership };
