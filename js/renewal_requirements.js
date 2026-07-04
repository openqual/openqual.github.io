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

const { RenewalComponent } = require('./renewal_component');

class RenewalRequirements {
  constructor({ requirementsVersion, components = [] }) {
    this.requirementsVersion = requirementsVersion;
    this.components = Object.freeze([...components]);
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new RenewalRequirements({
      requirementsVersion: m.requirements_version,
      components: (m.components ?? []).map((c) => RenewalComponent.fromJSON(c)),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    return {
      requirements_version: this.requirementsVersion,
      components: this.components.map((c) => c.toJSON()),
    };
  }
}

module.exports = { RenewalRequirements };
