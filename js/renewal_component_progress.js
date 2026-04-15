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
