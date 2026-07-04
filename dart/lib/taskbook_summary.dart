// Copyright 2026 FireCal LLC. Apache-2.0.
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

import 'codec.dart';

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

  /// Reads the wire shape produced by [toMap].
  factory BookScoringSummary.fromMap(Map<String, dynamic> m) =>
      BookScoringSummary(
        pointsPossible: (m['points_possible'] as num?)?.toDouble() ?? 0.0,
        pointsAwarded: (m['points_awarded'] as num?)?.toDouble() ?? 0.0,
        pointsRemaining: (m['points_remaining'] as num?)?.toDouble() ?? 0.0,
        effectiveThresholdPoints:
            (m['effective_threshold_points'] as num?)?.toDouble(),
        effectiveThresholdPercentage:
            (m['effective_threshold_percentage'] as num?)?.toDouble(),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'points_possible': pointsPossible,
        'points_awarded': pointsAwarded,
        'points_remaining': pointsRemaining,
        if (effectiveThresholdPoints != null)
          'effective_threshold_points': effectiveThresholdPoints,
        if (effectiveThresholdPercentage != null)
          'effective_threshold_percentage': effectiveThresholdPercentage,
      };
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

  /// Reads the wire shape produced by [toMap].
  factory TaskbookSummary.fromMap(Map<String, dynamic> m) => TaskbookSummary(
        tasksTotal: (m['tasks_total'] as num?)?.toInt() ?? 0,
        tasksNotStarted: (m['tasks_not_started'] as num?)?.toInt() ?? 0,
        tasksInProgress: (m['tasks_in_progress'] as num?)?.toInt() ?? 0,
        tasksOwnerActionNeeded:
            (m['tasks_owner_action_needed'] as num?)?.toInt() ?? 0,
        tasksPendingValidation:
            (m['tasks_pending_validation'] as num?)?.toInt() ?? 0,
        tasksComplete: (m['tasks_complete'] as num?)?.toInt() ?? 0,
        tasksCompleteFailed:
            (m['tasks_complete_failed'] as num?)?.toInt() ?? 0,
        sectionsTotal: (m['sections_total'] as num?)?.toInt() ?? 0,
        sectionsNotStarted:
            (m['sections_not_started'] as num?)?.toInt() ?? 0,
        sectionsInProgress:
            (m['sections_in_progress'] as num?)?.toInt() ?? 0,
        sectionsOwnerActionNeeded:
            (m['sections_owner_action_needed'] as num?)?.toInt() ?? 0,
        sectionsPendingValidation:
            (m['sections_pending_validation'] as num?)?.toInt() ?? 0,
        sectionsComplete: (m['sections_complete'] as num?)?.toInt() ?? 0,
        sectionsCompleteFailed:
            (m['sections_complete_failed'] as num?)?.toInt() ?? 0,
        taskbookOwnerActionNeeded:
            (m['taskbook_owner_action_needed'] as bool?) ?? false,
        signoffsRequiredTotal:
            (m['signoffs_required_total'] as num?)?.toInt() ?? 0,
        signoffsCompletedTotal:
            (m['signoffs_completed_total'] as num?)?.toInt() ?? 0,
        scoringSummary: m['scoring_summary'] == null
            ? null
            : BookScoringSummary.fromMap(
                (m['scoring_summary'] as Map).cast<String, dynamic>()),
        lastModified: readDateTime(m['last_modified'])!,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'tasks_total': tasksTotal,
        'tasks_not_started': tasksNotStarted,
        'tasks_in_progress': tasksInProgress,
        'tasks_owner_action_needed': tasksOwnerActionNeeded,
        'tasks_pending_validation': tasksPendingValidation,
        'tasks_complete': tasksComplete,
        'tasks_complete_failed': tasksCompleteFailed,
        'sections_total': sectionsTotal,
        'sections_not_started': sectionsNotStarted,
        'sections_in_progress': sectionsInProgress,
        'sections_owner_action_needed': sectionsOwnerActionNeeded,
        'sections_pending_validation': sectionsPendingValidation,
        'sections_complete': sectionsComplete,
        'sections_complete_failed': sectionsCompleteFailed,
        'taskbook_owner_action_needed': taskbookOwnerActionNeeded,
        'signoffs_required_total': signoffsRequiredTotal,
        'signoffs_completed_total': signoffsCompletedTotal,
        if (scoringSummary != null)
          'scoring_summary': scoringSummary!.toMap(),
        'last_modified': lastModified,
      };
}
