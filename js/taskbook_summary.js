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
}

module.exports = { TaskbookSummary, BookScoringSummary };
