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

const { ScoringMode } = require('./enums');

/**
 * Book-level scoring threshold.
 *
 * `minPassingPercentage` must be in [0.0, 1.0] (a fraction, not a
 * percent value) — see MIGRATION Rule 4.
 */
class BookScoringConfig {
  constructor({ minPassingPoints = null, minPassingPercentage = null } = {}) {
    if (
      minPassingPercentage != null &&
      (minPassingPercentage < 0.0 || minPassingPercentage > 1.0)
    ) {
      throw new RangeError('minPassingPercentage must be in [0.0, 1.0]');
    }
    this.minPassingPoints = minPassingPoints;
    this.minPassingPercentage = minPassingPercentage;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new BookScoringConfig({
      minPassingPoints: m.min_passing_points ?? null,
      minPassingPercentage: m.min_passing_percentage ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.minPassingPoints != null) out.min_passing_points = this.minPassingPoints;
    if (this.minPassingPercentage != null) {
      out.min_passing_percentage = this.minPassingPercentage;
    }
    return out;
  }
}

/** Book-level scoring configuration. */
class TaskbookEvaluationConfig {
  constructor({ scoringMode = ScoringMode.AGGREGATED, scoringConfig = null } = {}) {
    this.scoringMode = scoringMode;
    this.scoringConfig = scoringConfig;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskbookEvaluationConfig({
      scoringMode: m.scoring_mode ?? ScoringMode.AGGREGATED,
      scoringConfig:
        m.scoring_config == null ? null : BookScoringConfig.fromJSON(m.scoring_config),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = { scoring_mode: this.scoringMode };
    if (this.scoringConfig != null) out.scoring_config = this.scoringConfig.toJSON();
    return out;
  }
}

module.exports = { TaskbookEvaluationConfig, BookScoringConfig };
