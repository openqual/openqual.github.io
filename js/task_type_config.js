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

class TaskTypeEvaluationCriteria {
  constructor({
    evaluationType,
    autofail = false,
    pointsPossible = null,
    minPassingPoints = null,
  }) {
    this.evaluationType = evaluationType; // EvaluationType enum value
    this.autofail = autofail;
    this.pointsPossible = pointsPossible;
    this.minPassingPoints = minPassingPoints;
    Object.freeze(this);
  }
}

class TaskTypeEvaluationResult {
  constructor({
    outcome = null,
    pointsAwarded = null,
    evaluatedBy = null,
    evaluatedAt = null,
    notes = null,
  } = {}) {
    this.outcome = outcome;
    this.pointsAwarded = pointsAwarded;
    this.evaluatedBy = evaluatedBy;
    this.evaluatedAt = evaluatedAt;
    this.notes = notes;
    Object.freeze(this);
  }

  withClampedPoints(possible) {
    if (this.pointsAwarded == null || this.pointsAwarded <= possible) return this;
    return new TaskTypeEvaluationResult({
      outcome: this.outcome,
      pointsAwarded: possible,
      evaluatedBy: this.evaluatedBy,
      evaluatedAt: this.evaluatedAt,
      notes: this.notes,
    });
  }
}

class TaskTypeEvaluationConfig {
  constructor({ criteria = null, result = null } = {}) {
    this.criteria = criteria;
    this.result = result;
    Object.freeze(this);
  }
}

class TaskTypeTaskbookConfig {
  constructor({ displayName = null, source = null, requireComplete = true } = {}) {
    this.displayName = displayName;
    this.source = source;
    this.requireComplete = requireComplete;
    Object.freeze(this);
  }
}

class TaskTypeSkillsheetConfig {
  constructor({ displayName = null, source = null, requireComplete = true } = {}) {
    this.displayName = displayName;
    this.source = source;
    this.requireComplete = requireComplete;
    Object.freeze(this);
  }
}

class TaskTypeCertConfig {
  constructor({ displayName = null, source = null, requireActive = true } = {}) {
    this.displayName = displayName;
    this.source = source;
    this.requireActive = requireActive;
    Object.freeze(this);
  }
}

class TaskTypeConfig {
  constructor({
    evaluationConfig = null,
    taskbookConfig = null,
    skillsheetConfig = null,
    certConfig = null,
  } = {}) {
    this.evaluationConfig = evaluationConfig;
    this.taskbookConfig = taskbookConfig;
    this.skillsheetConfig = skillsheetConfig;
    this.certConfig = certConfig;
    Object.freeze(this);
  }
}

module.exports = {
  TaskTypeConfig,
  TaskTypeEvaluationConfig,
  TaskTypeEvaluationCriteria,
  TaskTypeEvaluationResult,
  TaskTypeTaskbookConfig,
  TaskTypeSkillsheetConfig,
  TaskTypeCertConfig,
};
