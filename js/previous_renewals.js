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

const { PreviousRenewal } = require('./previous_renewal');

class PreviousRenewals {
  constructor({ previousRenewals = [] } = {}) {
    this.previousRenewals = Object.freeze([...previousRenewals]);
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new PreviousRenewals({
      previousRenewals: (m.previous_renewals ?? []).map((r) =>
        PreviousRenewal.fromJSON(r),
      ),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    return {
      previous_renewals: this.previousRenewals.map((r) => r.toJSON()),
    };
  }
}

module.exports = { PreviousRenewals };
