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

/// Book-level scoring summary.
class BookScoringSummary {
  final double pointsPossible;
  final double pointsAwarded;
  final double pointsRemaining;
  final double? effectiveThresholdPoints;
  final double? effectiveThresholdPercentage;

  const BookScoringSummary({
    required this.pointsPossible,
    required this.pointsAwarded,
    required this.pointsRemaining,
    this.effectiveThresholdPoints,
    this.effectiveThresholdPercentage,
  });
}

/// Denormalized aggregate counts and scoring totals for a Taskbook.
class TaskbookSummary {
  // Task counts
  final int tasksTotal;
  final int tasksNotStarted;
  final int tasksInProgress;
  final int tasksOwnerActionNeeded;
  final int tasksPendingValidation;
  final int tasksComplete;
  final int tasksCompleteFailed;

  // Section counts
  final int sectionsTotal;
  final int sectionsNotStarted;
  final int sectionsInProgress;
  final int sectionsOwnerActionNeeded;
  final int sectionsPendingValidation;
  final int sectionsComplete;
  final int sectionsCompleteFailed;

  // Book-level flags and signoff totals
  final bool taskbookOwnerActionNeeded;
  final int signoffsRequiredTotal;
  final int signoffsCompletedTotal;

  final BookScoringSummary? scoringSummary;

  final DateTime lastModified;

  const TaskbookSummary({
    this.tasksTotal = 0,
    this.tasksNotStarted = 0,
    this.tasksInProgress = 0,
    this.tasksOwnerActionNeeded = 0,
    this.tasksPendingValidation = 0,
    this.tasksComplete = 0,
    this.tasksCompleteFailed = 0,
    this.sectionsTotal = 0,
    this.sectionsNotStarted = 0,
    this.sectionsInProgress = 0,
    this.sectionsOwnerActionNeeded = 0,
    this.sectionsPendingValidation = 0,
    this.sectionsComplete = 0,
    this.sectionsCompleteFailed = 0,
    this.taskbookOwnerActionNeeded = false,
    this.signoffsRequiredTotal = 0,
    this.signoffsCompletedTotal = 0,
    this.scoringSummary,
    required this.lastModified,
  });
}
