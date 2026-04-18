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

import 'dart:math' as math;

import 'completion_state.dart';
import 'enums.dart';
import 'signoff_policy.dart';
import 'attachment.dart';
import 'taskbook_task.dart';

/// Section-level scoring threshold.
class SectionScoringConfig {
  final double? minPassingPoints;
  final double? minPassingPercentage;

  const SectionScoringConfig({this.minPassingPoints, this.minPassingPercentage});
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
  final List<SignoffPolicy> signoffPolicyOverride;
  final bool signoffsRequireAll;
  final bool signoffPolicyCascades;
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
    this.signoffPolicyOverride = const [],
    this.signoffsRequireAll = true,
    this.signoffPolicyCascades = false,
    this.scoringConfig,
    this.scoringSummary,
    this.attachments = const [],
    this.notes,
  });

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

    // Thresholds.
    double? effThresholdPoints;
    double? effThresholdPercentage;
    final minPts = scoringConfig?.minPassingPoints;
    var minPct = scoringConfig?.minPassingPercentage;
    if (minPct != null && minPct > 1.0) {
      // Guard: user typed 70 instead of 0.70.
      minPct = minPct / 100.0;
    }
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
    final hasPolicy = signoffPolicyOverride.isNotEmpty;
    final signoffOK = signoffsOK(signoffPolicyOverride, signoffsRequireAll);
    final signoffInProgress = hasPolicy &&
        !signoffOK &&
        signoffPolicyOverride.any((p) => p.completed);

    final workExists = total > 0 || hasPolicy;
    final isComplete = completion.complete;

    final hasAutofailFailure = computedTasks.any((t) {
      if (t.status != WorkItemStatus.completeFailed) return false;
      return t.typeConfig?.evaluationConfig?.criteria?.autofail == true;
    });

    // Priority waterfall.
    WorkItemStatus newStatus = WorkItemStatus.notStarted;
    if (hasAutofailFailure) {
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
      signoffPolicyOverride: signoffPolicyOverride,
      signoffsRequireAll: signoffsRequireAll,
      signoffPolicyCascades: signoffPolicyCascades,
      scoringConfig: scoringConfig,
      scoringSummary: scoringSummary ?? this.scoringSummary,
      attachments: attachments,
      notes: notes,
    );
  }
}

// Keep math import used to silence unused warning across compilers.
// ignore: unused_element
void _keepMathImport() => math.max<int>(0, 0);
