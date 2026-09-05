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

import 'attachment.dart';
import 'codec.dart';
import 'completion_state.dart';
import 'enums.dart';
import 'signoff_policy.dart';
import 'taskbook_task.dart';
import 'wire.dart';

/// Section-level scoring threshold.
///
/// `minPassingPercentage` must be in `[0.0, 1.0]` (a fraction, not a
/// percent value) — see MIGRATION Rule 4.
class SectionScoringConfig {
  final double? minPassingPoints;
  final double? minPassingPercentage;

  const SectionScoringConfig({this.minPassingPoints, this.minPassingPercentage})
      : assert(
            minPassingPercentage == null ||
                (minPassingPercentage >= 0.0 && minPassingPercentage <= 1.0),
            'minPassingPercentage must be in [0.0, 1.0]');

  /// Reads the wire shape produced by [toMap].
  factory SectionScoringConfig.fromMap(Map<String, dynamic> m) =>
      SectionScoringConfig(
        minPassingPoints: (m['min_passing_points'] as num?)?.toDouble(),
        minPassingPercentage:
            (m['min_passing_percentage'] as num?)?.toDouble(),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (minPassingPoints != null) 'min_passing_points': minPassingPoints,
        if (minPassingPercentage != null)
          'min_passing_percentage': minPassingPercentage,
      };
}

/// Denormalized scoring totals for a section.
class SectionScoringSummary {
  final double pointsPossible;
  final double pointsAwarded;
  final double pointsRemaining;
  final double? effectiveThresholdPoints;
  final double? effectiveThresholdPercentage;

  const SectionScoringSummary({
    required this.pointsPossible,
    required this.pointsAwarded,
    required this.pointsRemaining,
    this.effectiveThresholdPoints,
    this.effectiveThresholdPercentage,
  });

  /// Reads the wire shape produced by [toMap].
  factory SectionScoringSummary.fromMap(Map<String, dynamic> m) =>
      SectionScoringSummary(
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

/// An ordered group of tasks within a Taskbook.
class TaskbookSection {
  final String id;
  final int order;
  final String title;
  final String? description;
  final DateTime? dueDate;
  final WorkItemStatus status;
  final double progress;
  final CompletionState completion;
  final List<TaskbookTask> tasks;

  /// This tier's signoff policies. Authoritative for this tier; no
  /// runtime inheritance from the book (named `signoff_policy_override`
  /// in v0.1 — see MIGRATION Rule 1).
  final List<SignoffPolicy> signoffPolicy;

  final bool signoffsRequireAll;
  final SectionScoringConfig? scoringConfig;
  final SectionScoringSummary? scoringSummary;
  final List<Attachment> attachments;
  final String? notes;

  const TaskbookSection({
    required this.id,
    required this.order,
    required this.title,
    this.description,
    this.dueDate,
    this.status = WorkItemStatus.notStarted,
    this.progress = 0.0,
    this.completion = const CompletionState(),
    this.tasks = const [],
    this.signoffPolicy = const [],
    this.signoffsRequireAll = true,
    this.scoringConfig,
    this.scoringSummary,
    this.attachments = const [],
    this.notes,
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskbookSection.fromMap(Map<String, dynamic> m) => TaskbookSection(
        id: m['id'] as String,
        order: (m['order'] as num).toInt(),
        title: m['title'] as String,
        description: m['description'] as String?,
        dueDate: readDateTime(m['due_date']),
        status: m['status'] == null
            ? WorkItemStatus.notStarted
            : workItemStatusFromWire(m['status'] as String),
        progress: (m['progress'] as num?)?.toDouble() ?? 0.0,
        completion: m['completion'] == null
            ? const CompletionState()
            : CompletionState.fromMap(
                (m['completion'] as Map).cast<String, dynamic>()),
        tasks: readMapList(m['tasks']).map(TaskbookTask.fromMap).toList(),
        signoffPolicy: readMapList(m['signoff_policy'])
            .map(SignoffPolicy.fromMap)
            .toList(),
        signoffsRequireAll: (m['signoffs_require_all'] as bool?) ?? true,
        scoringConfig: m['scoring_config'] == null
            ? null
            : SectionScoringConfig.fromMap(
                (m['scoring_config'] as Map).cast<String, dynamic>()),
        scoringSummary: m['scoring_summary'] == null
            ? null
            : SectionScoringSummary.fromMap(
                (m['scoring_summary'] as Map).cast<String, dynamic>()),
        attachments:
            readMapList(m['attachments']).map(Attachment.fromMap).toList(),
        notes: m['notes'] as String?,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'id': id,
        'order': order,
        'title': title,
        if (description != null) 'description': description,
        if (dueDate != null) 'due_date': dueDate,
        'status': wireValue(status),
        'progress': progress,
        'completion': completion.toMap(),
        'tasks': tasks.map((t) => t.toMap()).toList(),
        'signoff_policy': signoffPolicy.map((p) => p.toMap()).toList(),
        'signoffs_require_all': signoffsRequireAll,
        if (scoringConfig != null) 'scoring_config': scoringConfig!.toMap(),
        if (scoringSummary != null)
          'scoring_summary': scoringSummary!.toMap(),
        'attachments': attachments.map((a) => a.toMap()).toList(),
        if (notes != null) 'notes': notes,
      };

  /// Pure. Computes the section's status + scoring summary and returns an
  /// updated section.
  TaskbookSection computeStatus() {
    // Ensure child task statuses are current.
    final computedTasks = tasks.map((t) {
      final clamped = t.withClampedPoints();
      final s = clamped.computeStatus();
      return clamped.copyWith(status: s, progress: _taskProgressFor(clamped, s));
    }).toList();

    // Scoring aggregation over scored evaluations.
    final scoredTasks = computedTasks.where((t) {
      final c = t.typeConfig?.evaluationConfig?.criteria;
      return t.type == TaskTypes.evaluation &&
          c?.evaluationType == EvaluationType.scored;
    }).toList();

    final pointsPossible = scoredTasks.fold<double>(
        0.0,
        (sum, t) =>
            sum +
            (t.typeConfig?.evaluationConfig?.criteria?.pointsPossible ?? 0.0));

    final pointsAwarded = scoredTasks
        .where((t) => t.typeConfig?.evaluationConfig?.result != null)
        .fold<double>(
            0.0,
            (sum, t) =>
                sum +
                (t.typeConfig?.evaluationConfig?.result?.pointsAwarded ?? 0.0));

    final pointsRemaining = scoredTasks
        .where((t) => t.typeConfig?.evaluationConfig?.result == null)
        .fold<double>(
            0.0,
            (sum, t) =>
                sum +
                (t.typeConfig?.evaluationConfig?.criteria?.pointsPossible ??
                    0.0));

    final maxPossibleScore = pointsAwarded + pointsRemaining;
    final allScoredEvalsDone = scoredTasks.isNotEmpty && pointsRemaining == 0.0;

    // Thresholds. `minPassingPercentage` is validated to [0.0, 1.0] at
    // construction (MIGRATION Rule 4) — no legacy ÷100 normalization.
    double? effThresholdPoints;
    double? effThresholdPercentage;
    final minPts = scoringConfig?.minPassingPoints;
    final minPct = scoringConfig?.minPassingPercentage;
    if (minPts != null) {
      effThresholdPoints = minPts;
      if (pointsPossible > 0) effThresholdPercentage = minPts / pointsPossible;
    } else if (minPct != null) {
      effThresholdPercentage = minPct;
      if (pointsPossible > 0) {
        effThresholdPoints = (minPct * pointsPossible).ceilToDouble();
      }
    }
    final hasThreshold = effThresholdPoints != null;
    final cannotPass =
        hasThreshold && maxPossibleScore < effThresholdPoints;
    final failedPoints = hasThreshold &&
        allScoredEvalsDone &&
        pointsAwarded < effThresholdPoints;

    // Counts.
    final completeCount = computedTasks
        .where((t) => t.status == WorkItemStatus.complete)
        .length;
    final completeFailedCount = computedTasks
        .where((t) => t.status == WorkItemStatus.completeFailed)
        .length;
    final pendingCount = computedTasks
        .where((t) => t.status == WorkItemStatus.pendingValidation)
        .length;
    final ownerActionCount = computedTasks
        .where((t) => t.status == WorkItemStatus.ownerActionNeeded)
        .length;
    final inProgressCount = computedTasks
        .where((t) => t.status == WorkItemStatus.inProgress)
        .length;

    final total = computedTasks.length;
    final doneCount = completeCount + completeFailedCount;
    final allTasksDone = total == 0 || doneCount == total;

    // Signoffs.
    final hasPolicy = signoffPolicy.isNotEmpty;
    final signoffOK = signoffsOK(signoffPolicy, signoffsRequireAll);
    final signoffInProgress = hasPolicy &&
        !signoffOK &&
        signoffPolicy.any((p) => p.completed);

    final workExists = total > 0 || hasPolicy;
    final isComplete = completion.complete;

    // Critical propagation: a failed task flagged `critical` fails the
    // whole tier, whatever its type (see schemas/taskbook_section.md). The task-level
    // flag is the authority; a stored inspection triage is derived from
    // it and is not consulted here.
    final hasCriticalFailure = computedTasks.any(
        (t) => t.critical && t.status == WorkItemStatus.completeFailed);

    // Priority waterfall.
    WorkItemStatus newStatus = WorkItemStatus.notStarted;
    if (hasCriticalFailure) {
      newStatus = WorkItemStatus.completeFailed;
    } else if (cannotPass) {
      newStatus = WorkItemStatus.completeFailed;
    } else if (failedPoints) {
      newStatus = WorkItemStatus.completeFailed;
    } else if (isComplete && signoffOK) {
      newStatus = WorkItemStatus.complete;
    } else if (isComplete && !signoffOK) {
      newStatus = WorkItemStatus.pendingValidation;
    } else if (workExists && allTasksDone && signoffOK && !isComplete) {
      newStatus = WorkItemStatus.ownerActionNeeded;
    } else if (completeCount > 0 ||
        completeFailedCount > 0 ||
        pendingCount > 0 ||
        ownerActionCount > 0 ||
        inProgressCount > 0 ||
        signoffInProgress) {
      newStatus = WorkItemStatus.inProgress;
    }

    // Progress.
    double newProgress;
    if (newStatus == WorkItemStatus.complete ||
        newStatus == WorkItemStatus.completeFailed) {
      newProgress = 1.0;
    } else if (total > 0) {
      newProgress = computedTasks.fold<double>(0.0, (a, t) => a + t.progress) /
          total;
    } else {
      newProgress = 0.0;
    }

    return copyWith(
      status: newStatus,
      progress: newProgress,
      tasks: computedTasks,
      scoringSummary: SectionScoringSummary(
        pointsPossible: pointsPossible,
        pointsAwarded: pointsAwarded,
        pointsRemaining: pointsRemaining,
        effectiveThresholdPoints: effThresholdPoints,
        effectiveThresholdPercentage: effThresholdPercentage,
      ),
    );
  }

  double _taskProgressFor(TaskbookTask t, WorkItemStatus s) {
    if (s == WorkItemStatus.complete || s == WorkItemStatus.completeFailed) {
      return 1.0;
    }
    if (t.subtasks.isEmpty) return 0.0;
    final done = t.subtasks.where((st) => st.completion.complete).length;
    return done / t.subtasks.length;
  }

  TaskbookSection copyWith({
    WorkItemStatus? status,
    double? progress,
    List<TaskbookTask>? tasks,
    SectionScoringSummary? scoringSummary,
    CompletionState? completion,
  }) {
    return TaskbookSection(
      id: id,
      order: order,
      title: title,
      description: description,
      dueDate: dueDate,
      status: status ?? this.status,
      progress: progress ?? this.progress,
      completion: completion ?? this.completion,
      tasks: tasks ?? this.tasks,
      signoffPolicy: signoffPolicy,
      signoffsRequireAll: signoffsRequireAll,
      scoringConfig: scoringConfig,
      scoringSummary: scoringSummary ?? this.scoringSummary,
      attachments: attachments,
      notes: notes,
    );
  }
}
