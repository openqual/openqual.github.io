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

class BookScoringSummary {
  constructor({
    pointsPossible,
    pointsAwarded,
    pointsRemaining,
    effectiveThresholdPoints = null,
    effectiveThresholdPercentage = null,
  }) {
    this.pointsPossible = pointsPossible;
    this.pointsAwarded = pointsAwarded;
    this.pointsRemaining = pointsRemaining;
    this.effectiveThresholdPoints = effectiveThresholdPoints;
    this.effectiveThresholdPercentage = effectiveThresholdPercentage;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new BookScoringSummary({
      pointsPossible: m.points_possible ?? 0.0,
      pointsAwarded: m.points_awarded ?? 0.0,
      pointsRemaining: m.points_remaining ?? 0.0,
      effectiveThresholdPoints: m.effective_threshold_points ?? null,
      effectiveThresholdPercentage: m.effective_threshold_percentage ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      points_possible: this.pointsPossible,
      points_awarded: this.pointsAwarded,
      points_remaining: this.pointsRemaining,
    };
    if (this.effectiveThresholdPoints != null) {
      out.effective_threshold_points = this.effectiveThresholdPoints;
    }
    if (this.effectiveThresholdPercentage != null) {
      out.effective_threshold_percentage = this.effectiveThresholdPercentage;
    }
    return out;
  }
}

class TaskbookSummary {
  constructor({
    tasksTotal = 0,
    tasksNotStarted = 0,
    tasksInProgress = 0,
    tasksOwnerActionNeeded = 0,
    tasksPendingValidation = 0,
    tasksComplete = 0,
    tasksCompleteFailed = 0,
    sectionsTotal = 0,
    sectionsNotStarted = 0,
    sectionsInProgress = 0,
    sectionsOwnerActionNeeded = 0,
    sectionsPendingValidation = 0,
    sectionsComplete = 0,
    sectionsCompleteFailed = 0,
    taskbookOwnerActionNeeded = false,
    signoffsRequiredTotal = 0,
    signoffsCompletedTotal = 0,
    scoringSummary = null,
    lastModified,
  }) {
    Object.assign(this, {
      tasksTotal,
      tasksNotStarted,
      tasksInProgress,
      tasksOwnerActionNeeded,
      tasksPendingValidation,
      tasksComplete,
      tasksCompleteFailed,
      sectionsTotal,
      sectionsNotStarted,
      sectionsInProgress,
      sectionsOwnerActionNeeded,
      sectionsPendingValidation,
      sectionsComplete,
      sectionsCompleteFailed,
      taskbookOwnerActionNeeded,
      signoffsRequiredTotal,
      signoffsCompletedTotal,
      scoringSummary,
      lastModified,
    });
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskbookSummary({
      tasksTotal: m.tasks_total ?? 0,
      tasksNotStarted: m.tasks_not_started ?? 0,
      tasksInProgress: m.tasks_in_progress ?? 0,
      tasksOwnerActionNeeded: m.tasks_owner_action_needed ?? 0,
      tasksPendingValidation: m.tasks_pending_validation ?? 0,
      tasksComplete: m.tasks_complete ?? 0,
      tasksCompleteFailed: m.tasks_complete_failed ?? 0,
      sectionsTotal: m.sections_total ?? 0,
      sectionsNotStarted: m.sections_not_started ?? 0,
      sectionsInProgress: m.sections_in_progress ?? 0,
      sectionsOwnerActionNeeded: m.sections_owner_action_needed ?? 0,
      sectionsPendingValidation: m.sections_pending_validation ?? 0,
      sectionsComplete: m.sections_complete ?? 0,
      sectionsCompleteFailed: m.sections_complete_failed ?? 0,
      taskbookOwnerActionNeeded: m.taskbook_owner_action_needed ?? false,
      signoffsRequiredTotal: m.signoffs_required_total ?? 0,
      signoffsCompletedTotal: m.signoffs_completed_total ?? 0,
      scoringSummary:
        m.scoring_summary == null
          ? null
          : BookScoringSummary.fromJSON(m.scoring_summary),
      lastModified: readDate(m.last_modified),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      tasks_total: this.tasksTotal,
      tasks_not_started: this.tasksNotStarted,
      tasks_in_progress: this.tasksInProgress,
      tasks_owner_action_needed: this.tasksOwnerActionNeeded,
      tasks_pending_validation: this.tasksPendingValidation,
      tasks_complete: this.tasksComplete,
      tasks_complete_failed: this.tasksCompleteFailed,
      sections_total: this.sectionsTotal,
      sections_not_started: this.sectionsNotStarted,
      sections_in_progress: this.sectionsInProgress,
      sections_owner_action_needed: this.sectionsOwnerActionNeeded,
      sections_pending_validation: this.sectionsPendingValidation,
      sections_complete: this.sectionsComplete,
      sections_complete_failed: this.sectionsCompleteFailed,
      taskbook_owner_action_needed: this.taskbookOwnerActionNeeded,
      signoffs_required_total: this.signoffsRequiredTotal,
      signoffs_completed_total: this.signoffsCompletedTotal,
    };
    if (this.scoringSummary != null) out.scoring_summary = this.scoringSummary.toJSON();
    out.last_modified = dateToIso(this.lastModified);
    return out;
  }
}

module.exports = { TaskbookSummary, BookScoringSummary };
