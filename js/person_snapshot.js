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
    avatarUrl = null,
    signatureImage = null,
    memberships = null,
    source = null,
  }) {
    this.displayName = displayName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.middleName = middleName;
    this.suffix = suffix;
    this.email = email;
    // Profile-image URL as it was at capture time. Display convenience,
    // not identity — may dangle after the host prunes storage.
    this.avatarUrl = avatarUrl;
    // The person's signature image, attachment-shaped so it can travel
    // inline (`content`) on exchanged records.
    this.signatureImage = signatureImage;
    this.memberships = memberships == null ? null : Object.freeze([...memberships]);
    this.source = source;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    // Lazy require: person_snapshot ↔ attachment reference each other.
    const { Attachment } = require('./attachment');
    return new PersonSnapshot({
      displayName: m.display_name,
      firstName: m.first_name ?? null,
      lastName: m.last_name ?? null,
      middleName: m.middle_name ?? null,
      suffix: m.suffix ?? null,
      email: m.email ?? null,
      avatarUrl: m.avatar_url ?? null,
      signatureImage:
        m.signature_image == null ? null : Attachment.fromJSON(m.signature_image),
      memberships:
        m.memberships == null
          ? null
          : m.memberships.map((om) => OrgMembership.fromJSON(om)),
      source: m.source == null ? null : Source.fromJSON(m.source),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = { display_name: this.displayName };
    if (this.firstName != null) out.first_name = this.firstName;
    if (this.lastName != null) out.last_name = this.lastName;
    if (this.middleName != null) out.middle_name = this.middleName;
    if (this.suffix != null) out.suffix = this.suffix;
    if (this.email != null) out.email = this.email;
    if (this.avatarUrl != null) out.avatar_url = this.avatarUrl;
    if (this.signatureImage != null) out.signature_image = this.signatureImage.toJSON();
    if (this.memberships != null) {
      out.memberships = this.memberships.map((om) => om.toJSON());
    }
    if (this.source != null) out.source = this.source.toJSON();
    return out;
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

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new OrgMembership({
      organization: OrganizationSnapshot.fromJSON(m.organization),
      roles: m.roles ?? [],
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    return {
      organization: this.organization.toJSON(),
      roles: [...this.roles],
    };
  }
}

module.exports = { PersonSnapshot, OrgMembership };
