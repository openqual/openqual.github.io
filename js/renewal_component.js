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

const { RenewalRequirement } = require('./renewal_requirement');

class RenewalComponent {
  constructor({
    componentId,
    order,
    componentName,
    componentQuantity,
    componentUnits,
    requirements = [],
    topics = [],
  }) {
    this.componentId = componentId;
    this.order = order;
    this.componentName = componentName;
    this.componentQuantity = componentQuantity;
    this.componentUnits = componentUnits;
    this.requirements = Object.freeze([...requirements]);
    // Subject-matter topics training must cover to count toward this
    // component, as authority-namespaced strings (see "Topic strings"
    // in schemas/renewal_component.md). Empty means any topic in the
    // discipline counts.
    this.topics = Object.freeze([...topics]);
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new RenewalComponent({
      componentId: m.component_id,
      order: m.order,
      componentName: m.component_name,
      componentQuantity: m.component_quantity,
      componentUnits: m.component_units,
      requirements: (m.requirements ?? []).map((r) =>
        RenewalRequirement.fromJSON(r),
      ),
      topics: m.topics ?? [],
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    return {
      component_id: this.componentId,
      order: this.order,
      component_name: this.componentName,
      component_quantity: this.componentQuantity,
      component_units: this.componentUnits,
      requirements: this.requirements.map((r) => r.toJSON()),
      topics: [...this.topics],
    };
  }
}

module.exports = { RenewalComponent };
