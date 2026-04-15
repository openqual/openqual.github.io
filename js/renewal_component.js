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

class RenewalComponent {
  constructor({
    componentId,
    order,
    componentName,
    componentQuantity,
    componentUnits,
    requirements = [],
  }) {
    this.componentId = componentId;
    this.order = order;
    this.componentName = componentName;
    this.componentQuantity = componentQuantity;
    this.componentUnits = componentUnits;
    this.requirements = Object.freeze([...requirements]);
    Object.freeze(this);
  }
}

module.exports = { RenewalComponent };
