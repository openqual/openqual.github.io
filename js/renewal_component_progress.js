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

const { RenewalRequirementProgress } = require('./renewal_requirement_progress');

class RenewalComponentProgress {
  constructor({
    componentId,
    order,
    componentName,
    componentUnits,
    componentQuantity,
    componentQuantityCompleted = 0.0,
    effectiveQuantityCompleted = 0.0,
    requirements = [],
    appliedTrainingIds = [],
    manuallyAddedCredit = 0.0,
  }) {
    this.componentId = componentId;
    this.order = order;
    this.componentName = componentName;
    this.componentUnits = componentUnits;
    this.componentQuantity = componentQuantity;
    this.componentQuantityCompleted = componentQuantityCompleted;
    this.effectiveQuantityCompleted = effectiveQuantityCompleted;
    this.requirements = Object.freeze([...requirements]);
    this.appliedTrainingIds = Object.freeze([...appliedTrainingIds]);
    this.manuallyAddedCredit = manuallyAddedCredit;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new RenewalComponentProgress({
      componentId: m.component_id,
      order: m.order,
      componentName: m.component_name,
      componentUnits: m.component_units,
      componentQuantity: m.component_quantity,
      componentQuantityCompleted: m.component_quantity_completed ?? 0.0,
      effectiveQuantityCompleted: m.effective_quantity_completed ?? 0.0,
      requirements: (m.requirements ?? []).map((r) =>
        RenewalRequirementProgress.fromJSON(r),
      ),
      appliedTrainingIds: m.applied_training_ids ?? [],
      manuallyAddedCredit: m.manually_added_credit ?? 0.0,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    return {
      component_id: this.componentId,
      order: this.order,
      component_name: this.componentName,
      component_units: this.componentUnits,
      component_quantity: this.componentQuantity,
      component_quantity_completed: this.componentQuantityCompleted,
      effective_quantity_completed: this.effectiveQuantityCompleted,
      requirements: this.requirements.map((r) => r.toJSON()),
      applied_training_ids: [...this.appliedTrainingIds],
      manually_added_credit: this.manuallyAddedCredit,
    };
  }

  _with(overrides) {
    return new RenewalComponentProgress({
      componentId: this.componentId,
      order: this.order,
      componentName: this.componentName,
      componentUnits: this.componentUnits,
      componentQuantity: this.componentQuantity,
      componentQuantityCompleted: this.componentQuantityCompleted,
      effectiveQuantityCompleted: this.effectiveQuantityCompleted,
      requirements: this.requirements,
      appliedTrainingIds: this.appliedTrainingIds,
      manuallyAddedCredit: this.manuallyAddedCredit,
      ...overrides,
    });
  }
}

module.exports = { RenewalComponentProgress };
