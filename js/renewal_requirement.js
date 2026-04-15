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
  }) {
    this.requirementId = requirementId;
    this.order = order;
    this.requirementName = requirementName;
    this.requirementDisplayName = requirementDisplayName;
    this.requirementDescription = requirementDescription;
    this.requirementQuantity = requirementQuantity;
    this.requirementUnits = requirementUnits;
    Object.freeze(this);
  }

  get effectiveDisplayName() {
    return this.requirementDisplayName || this.requirementName;
  }
}

module.exports = { RenewalRequirement };
