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

const { RequirementUnits } = require('./enums');

class RenewalRequirement {
  constructor({
    requirementId,
    order,
    requirementName,
    requirementDisplayName = null,
    requirementDescription = null,
    requirementQuantity,
    requirementUnits = RequirementUnits.HOURS,
    topics = [],
  }) {
    this.requirementId = requirementId;
    this.order = order;
    this.requirementName = requirementName;
    this.requirementDisplayName = requirementDisplayName;
    this.requirementDescription = requirementDescription;
    this.requirementQuantity = requirementQuantity;
    this.requirementUnits = requirementUnits;
    // Subject-matter topics training must cover to count toward this
    // requirement, as authority-namespaced strings (see "Topic strings"
    // in schemas/renewal_component.md). Empty means any topic in the
    // discipline counts.
    this.topics = Object.freeze([...topics]);
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new RenewalRequirement({
      requirementId: m.requirement_id,
      order: m.order,
      requirementName: m.requirement_name,
      requirementDisplayName: m.requirement_display_name ?? null,
      requirementDescription: m.requirement_description ?? null,
      requirementQuantity: m.requirement_quantity,
      requirementUnits: m.requirement_units ?? RequirementUnits.HOURS,
      topics: m.topics ?? [],
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      requirement_id: this.requirementId,
      order: this.order,
      requirement_name: this.requirementName,
    };
    if (this.requirementDisplayName != null) {
      out.requirement_display_name = this.requirementDisplayName;
    }
    if (this.requirementDescription != null) {
      out.requirement_description = this.requirementDescription;
    }
    out.requirement_quantity = this.requirementQuantity;
    out.requirement_units = this.requirementUnits;
    out.topics = [...this.topics];
    return out;
  }

  get effectiveDisplayName() {
    return this.requirementDisplayName || this.requirementName;
  }
}

module.exports = { RenewalRequirement };
