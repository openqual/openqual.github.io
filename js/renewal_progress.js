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

const { RenewalStatus } = require('./enums');

class RenewalProgress {
  constructor({ requirementsVersion, components = [] }) {
    this.requirementsVersion = requirementsVersion;
    this.components = Object.freeze([...components]);
    Object.freeze(this);
  }

  /** Pure. Computes the renewal's current status. */
  computeStatus({ ceUnitsRequired, ceUnitsEarned, dueDate = null, now }) {
    if (ceUnitsEarned >= ceUnitsRequired) return RenewalStatus.COMPLETE;
    if (dueDate && now > dueDate) return RenewalStatus.OVERDUE;
    if (ceUnitsEarned > 0) return RenewalStatus.IN_PROGRESS;
    return RenewalStatus.NOT_STARTED;
  }
}

module.exports = { RenewalProgress };
