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

class StartAndEndTimes {
  constructor({
    startTime = null,
    endTime = null,
    durationMs = null,
    durationDisplay = null,
  } = {}) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.durationMs = durationMs;
    this.durationDisplay = durationDisplay;
    Object.freeze(this);
  }

  /** Returns duration in milliseconds, or null. */
  get duration() {
    if (this.startTime && this.endTime) {
      return this.endTime.getTime() - this.startTime.getTime();
    }
    return this.durationMs;
  }
}

module.exports = { StartAndEndTimes };
