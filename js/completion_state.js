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

/**
 * Unified completion marker used at every level of the TaskBook hierarchy.
 * If `complete` is false, `completedAt` must be null.
 */
class CompletionState {
  /**
   * @param {{complete?: boolean, completedAt?: Date|null}} [opts]
   */
  constructor({ complete = false, completedAt = null } = {}) {
    this.complete = complete;
    this.completedAt = completedAt;
    Object.freeze(this);
  }

  /** @param {Date} now */
  markComplete(now) {
    return new CompletionState({ complete: true, completedAt: now });
  }

  clear() {
    return new CompletionState();
  }
}

module.exports = { CompletionState };
