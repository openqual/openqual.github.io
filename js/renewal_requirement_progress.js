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

class RenewalRequirementProgress {
  constructor({
    requirementId,
    order,
    requirementDisplayName,
    requirementUnits,
    requirementQuantity,
    requirementQuantityCompleted = 0.0,
    effectiveQuantityCompleted = 0.0,
    appliedTrainingIds = [],
    manuallyAddedCredit = 0.0,
  }) {
    this.requirementId = requirementId;
    this.order = order;
    this.requirementDisplayName = requirementDisplayName;
    this.requirementUnits = requirementUnits;
    this.requirementQuantity = requirementQuantity;
    this.requirementQuantityCompleted = requirementQuantityCompleted;
    this.effectiveQuantityCompleted = effectiveQuantityCompleted;
    this.appliedTrainingIds = Object.freeze([...appliedTrainingIds]);
    this.manuallyAddedCredit = manuallyAddedCredit;
    Object.freeze(this);
  }

  _with(overrides) {
    return new RenewalRequirementProgress({
      requirementId: this.requirementId,
      order: this.order,
      requirementDisplayName: this.requirementDisplayName,
      requirementUnits: this.requirementUnits,
      requirementQuantity: this.requirementQuantity,
      requirementQuantityCompleted: this.requirementQuantityCompleted,
      effectiveQuantityCompleted: this.effectiveQuantityCompleted,
      appliedTrainingIds: this.appliedTrainingIds,
      manuallyAddedCredit: this.manuallyAddedCredit,
      ...overrides,
    });
  }
}

module.exports = { RenewalRequirementProgress };
