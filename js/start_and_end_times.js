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

const { readDate, dateToIso } = require('./codec');

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

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new StartAndEndTimes({
      startTime: readDate(m.start_time),
      endTime: readDate(m.end_time),
      durationMs: m.duration_ms ?? null,
      durationDisplay: m.duration_display ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.startTime != null) out.start_time = dateToIso(this.startTime);
    if (this.endTime != null) out.end_time = dateToIso(this.endTime);
    if (this.durationMs != null) out.duration_ms = this.durationMs;
    if (this.durationDisplay != null) out.duration_display = this.durationDisplay;
    return out;
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
