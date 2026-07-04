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

const { Source } = require('./source');

/**
 * Frozen point-in-time capture of an organization's identity and
 * contact details. Reusable across slots where a portable record
 * references an organization (certifying agency, host org, etc.).
 */
class OrganizationSnapshot {
  constructor({
    name,
    displayName = null,
    website = null,
    email = null,
    phone = null,
    source = null,
  }) {
    this.name = name;
    this.displayName = displayName;
    this.website = website;
    this.email = email;
    this.phone = phone;
    this.source = source;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new OrganizationSnapshot({
      name: m.name,
      displayName: m.display_name ?? null,
      website: m.website ?? null,
      email: m.email ?? null,
      phone: m.phone ?? null,
      source: m.source == null ? null : Source.fromJSON(m.source),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = { name: this.name };
    if (this.displayName != null) out.display_name = this.displayName;
    if (this.website != null) out.website = this.website;
    if (this.email != null) out.email = this.email;
    if (this.phone != null) out.phone = this.phone;
    if (this.source != null) out.source = this.source.toJSON();
    return out;
  }
}

module.exports = { OrganizationSnapshot };
