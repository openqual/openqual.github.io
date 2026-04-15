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

import 'dart:convert';
import 'dart:math';

import 'completion_state.dart';
import 'constants.dart';
import 'enums.dart';
import 'signoff_policy.dart';
import 'start_and_end_times.dart';
import 'taskbook_assignment.dart';
import 'taskbook_attachment.dart';
import 'taskbook_evaluation_config.dart';
import 'taskbook_section.dart';
import 'taskbook_subtask.dart';
import 'taskbook_summary.dart';
import 'taskbook_task.dart';

/// The root container in the TaskBook hierarchy.
class Taskbook {
  final TaskbookTypes taskbookType;
  final String title;
  final String? description;
  final DateTime? dueDate;
  final WorkItemStatus status;
  final double progress;
  final CompletionState completion;
  final TaskbookAssignment? assignment;
  final List<TaskbookSection> sections;
  final List<SignoffPolicy> signoffPolicy;
  final bool signoffsRequireAll;
  final bool signoffPolicyCascades;
  final List<TaskbookAttachment> attachments;
  final String? notes;
  final TaskbookEvaluationConfig? evaluationConfig;
  final StartAndEndTimes? startAndEnd;
  final TaskbookSummary? taskbookSummary;
  final String? importStatus;
  final String? importNotes;

  const Taskbook({
    this.taskbookType = TaskbookTypes.taskbook,
    required this.title,
    this.description,
    this.dueDate,
    this.status = WorkItemStatus.notStarted,
    this.progress = 0.0,
    this.completion = const CompletionState(),
    this.assignment,
    this.sections = const [],
    this.signoffPolicy = const [],
    this.signoffsRequireAll = true,
    this.signoffPolicyCascades = false,
    this.attachments = const [],
    this.notes,
    this.evaluationConfig,
    this.startAndEnd,
    this.taskbookSummary,
    this.importStatus,
    this.importNotes,
  });

  /// Factory. Parses a JSON string (typically from an AI import) into a
  /// fully-initialized Taskbook. Returns a safe error Taskbook on parse
  /// failure.
  factory Taskbook.fromExternalJson(String? jsonString, {Random? random}) {
    if (jsonString == null || jsonString.isEmpty) {
      return const Taskbook(title: '');
    }
    String generateId() {
      const chars =
          'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
      final rnd = random ?? Random();
      return String.fromCharCodes(Iterable.generate(
          8, (_) => chars.codeUnitAt(rnd.nextInt(chars.length))));
    }

    final farFuture = neverExpireDate;

    try {
      final cleaned = jsonString.replaceAll('```json', '').replaceAll('```', '');
      final data = jsonDecode(cleaned) as Map<String, dynamic>;

      final sections = <TaskbookSection>[];
      final rawSections = data['sections'];
      if (rawSections is List) {
        for (var si = 0; si < rawSections.length; si++) {
          final sectionData = rawSections[si] as Map<String, dynamic>;
          final tasks = <TaskbookTask>[];
          final rawTasks = sectionData['tasks'];
          if (rawTasks is List) {
            for (var ti = 0; ti < rawTasks.length; ti++) {
              final taskData = rawTasks[ti] as Map<String, dynamic>;
              tasks.add(TaskbookTask(
                id: generateId(),
                order: ti,
                type: TaskTypes.task,
                title: taskData['title'] as String? ?? 'Untitled Task',
                description: taskData['description'] as String?,
                dueDate: farFuture,
              ));
            }
          }
          sections.add(TaskbookSection(
            id: generateId(),
            order: si,
            title: sectionData['title'] as String? ?? 'Untitled Section',
            description: sectionData['description'] as String?,
            dueDate: farFuture,
            tasks: tasks,
          ));
        }
      }

      final metadata = data['metadata'] as Map<String, dynamic>?;
      return Taskbook(
        title: data['title'] as String? ?? 'New Task Book',
        description: data['description'] as String?,
        sections: sections,
        importNotes: metadata?['extractionNotes'] as String?,
        importStatus: metadata?['estimatedCompleteness'] as String?,
      );
    } catch (e) {
      return Taskbook(
        title: 'Error Parsing Import',
        description: 'Details: $e',
      );
    }
  }

  /// Pure. Returns a new Taskbook with exactly one node's completion
  /// marked complete at [now]. Returns the receiver unchanged if the
  /// identified node is not found.
  Taskbook markComplete({
    String? sectionId,
    String? taskId,
    String? subtaskId,
    required DateTime now,
  }) {
    if (sectionId == null && taskId == null && subtaskId == null) {
      return copyWith(completion: completion.markComplete(now));
    }
    if (sectionId == null) return this;
    final sIdx = sections.indexWhere((s) => s.id == sectionId);
    if (sIdx == -1) return this;
    final section = sections[sIdx];

    if (taskId == null) {
      final updated = section.copyWith(completion: section.completion.markComplete(now));
      final newSections = List<TaskbookSection>.from(sections);
      newSections[sIdx] = updated;
      return copyWith(sections: newSections);
    }
    final tIdx = section.tasks.indexWhere((t) => t.id == taskId);
    if (tIdx == -1) return this;
    final task = section.tasks[tIdx];

    if (subtaskId == null) {
      final updatedTask = task.copyWith(completion: task.completion.markComplete(now));
      final newTasks = List<TaskbookTask>.from(section.tasks);
      newTasks[tIdx] = updatedTask;
      final newSections = List<TaskbookSection>.from(sections);
      newSections[sIdx] = section.copyWith(tasks: newTasks);
      return copyWith(sections: newSections);
    }
    final stIdx = task.subtasks.indexWhere((st) => st.id == subtaskId);
    if (stIdx == -1) return this;
    final subtask = task.subtasks[stIdx];
    final updatedSubtask = subtask.copyWith(completion: subtask.completion.markComplete(now));
    final newSubtasks = List<TaskbookSubtask>.from(task.subtasks);
    newSubtasks[stIdx] = updatedSubtask;
    final updatedTask = task.copyWith(subtasks: newSubtasks);
    final newTasks = List<TaskbookTask>.from(section.tasks);
    newTasks[tIdx] = updatedTask;
    final newSections = List<TaskbookSection>.from(sections);
    newSections[sIdx] = section.copyWith(tasks: newTasks);
    return copyWith(sections: newSections);
  }

  /// Pure. Computes the book's status, progress, and taskbook_summary,
  /// and returns an updated Taskbook with every section recomputed via
  /// [TaskbookSection.computeStatus] so the full tree is consistent.
  /// See schemas/taskbook.md for the full waterfall.
  Taskbook computeStatus({required DateTime now}) {
    final computedSections =
        sections.map((s) => s.computeStatus()).toList();

    final allTasks = <TaskbookTask>[];
    for (final s in computedSections) {
      allTasks.addAll(s.tasks);
    }

    // Scoring aggregation over all scored evaluation tasks in the book.
    final scoredTasks = allTasks.where((t) {
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
                (t.typeConfig?.evaluationConfig?.result?.pointsAwarded ??
                    0.0));
    final pointsRemaining = scoredTasks
        .where((t) => t.typeConfig?.evaluationConfig?.result == null)
        .fold<double>(
            0.0,
            (sum, t) =>
                sum +
                (t.typeConfig?.evaluationConfig?.criteria?.pointsPossible ??
                    0.0));

    final mode = evaluationConfig?.scoringMode ?? ScoringMode.aggregated;
    final isAggregated = mode == ScoringMode.aggregated;
    final isPerSection = mode == ScoringMode.perSection;

    // Book-level threshold (aggregated mode only).
    double? effThresholdPoints;
    double? effThresholdPercentage;
    if (isAggregated) {
      final minPts = evaluationConfig?.scoringConfig?.minPassingPoints;
      var minPct = evaluationConfig?.scoringConfig?.minPassingPercentage;
      if (minPct != null && minPct > 1.0) {
        minPct = minPct / 100.0;
      }
      if (minPts != null) {
        effThresholdPoints = minPts;
        if (pointsPossible > 0) {
          effThresholdPercentage = minPts / pointsPossible;
        }
      } else if (minPct != null) {
        effThresholdPercentage = minPct;
        if (pointsPossible > 0) {
          effThresholdPoints = (minPct * pointsPossible).ceilToDouble();
        }
      }
    }

    final maxPossibleScore = pointsAwarded + pointsRemaining;
    final allScoredEvalsDone =
        scoredTasks.isNotEmpty && pointsRemaining == 0.0;
    final hasThreshold = effThresholdPoints != null;
    final cannotPass =
        isAggregated && hasThreshold && maxPossibleScore < effThresholdPoints;
    final failedPoints = isAggregated &&
        hasThreshold &&
        allScoredEvalsDone &&
        pointsAwarded < effThresholdPoints;

    final hasAutofailFailure = allTasks.any((t) {
      if (t.status != WorkItemStatus.completeFailed) return false;
      return t.typeConfig?.evaluationConfig?.criteria?.autofail == true;
    });
    final hasFailedSection = computedSections
        .any((s) => s.status == WorkItemStatus.completeFailed);

    // Signoffs at the book level.
    final hasPolicy = signoffPolicy.isNotEmpty;
    final signoffOK = signoffsOK(signoffPolicy, signoffsRequireAll);
    final signoffInProgress = hasPolicy &&
        !signoffOK &&
        signoffPolicy.any((p) => p.completed);

    final sectionsTotal = computedSections.length;
    final sectionsDone = computedSections
        .where((s) =>
            s.status == WorkItemStatus.complete ||
            s.status == WorkItemStatus.completeFailed)
        .length;
    final allSectionsDone =
        sectionsTotal == 0 || sectionsDone == sectionsTotal;
    final anySectionBeyondNotStarted = computedSections
        .any((s) => s.status != WorkItemStatus.notStarted);

    final workExists = sectionsTotal > 0 || hasPolicy;
    final isComplete = completion.complete;

    // Priority waterfall.
    WorkItemStatus newStatus = WorkItemStatus.notStarted;
    if (hasAutofailFailure) {
      newStatus = WorkItemStatus.completeFailed;
    } else if (cannotPass) {
      newStatus = WorkItemStatus.completeFailed;
    } else if (failedPoints) {
      newStatus = WorkItemStatus.completeFailed;
    } else if (isPerSection && hasFailedSection) {
      newStatus = WorkItemStatus.completeFailed;
    } else if (isComplete && signoffOK) {
      newStatus = WorkItemStatus.complete;
    } else if (isComplete && !signoffOK) {
      newStatus = WorkItemStatus.pendingValidation;
    } else if (workExists && allSectionsDone && signoffOK && !isComplete) {
      newStatus = WorkItemStatus.ownerActionNeeded;
    } else if (anySectionBeyondNotStarted || signoffInProgress) {
      newStatus = WorkItemStatus.inProgress;
    }

    // Progress.
    double newProgress;
    if (newStatus == WorkItemStatus.complete ||
        newStatus == WorkItemStatus.completeFailed) {
      newProgress = 1.0;
    } else if (sectionsTotal > 0) {
      newProgress =
          computedSections.fold<double>(0.0, (a, s) => a + s.progress) /
              sectionsTotal;
    } else {
      newProgress = 0.0;
    }

    // Histograms.
    int countTasks(WorkItemStatus s) =>
        allTasks.where((t) => t.status == s).length;
    int countSections(WorkItemStatus s) =>
        computedSections.where((sec) => sec.status == s).length;

    // Signoff totals across book, sections, and tasks.
    var signoffsRequiredTotal = signoffPolicy.length;
    var signoffsCompletedTotal =
        signoffPolicy.where((p) => p.completed).length;
    for (final s in computedSections) {
      signoffsRequiredTotal += s.signoffPolicyOverride.length;
      signoffsCompletedTotal +=
          s.signoffPolicyOverride.where((p) => p.completed).length;
      for (final t in s.tasks) {
        signoffsRequiredTotal += t.signoffPolicyOverride.length;
        signoffsCompletedTotal +=
            t.signoffPolicyOverride.where((p) => p.completed).length;
      }
    }

    final bookScoringSummary = scoredTasks.isEmpty
        ? null
        : BookScoringSummary(
            pointsPossible: pointsPossible,
            pointsAwarded: pointsAwarded,
            pointsRemaining: pointsRemaining,
            effectiveThresholdPoints: effThresholdPoints,
            effectiveThresholdPercentage: effThresholdPercentage,
          );

    final summary = TaskbookSummary(
      tasksTotal: allTasks.length,
      tasksNotStarted: countTasks(WorkItemStatus.notStarted),
      tasksInProgress: countTasks(WorkItemStatus.inProgress),
      tasksOwnerActionNeeded: countTasks(WorkItemStatus.ownerActionNeeded),
      tasksPendingValidation: countTasks(WorkItemStatus.pendingValidation),
      tasksComplete: countTasks(WorkItemStatus.complete),
      tasksCompleteFailed: countTasks(WorkItemStatus.completeFailed),
      sectionsTotal: sectionsTotal,
      sectionsNotStarted: countSections(WorkItemStatus.notStarted),
      sectionsInProgress: countSections(WorkItemStatus.inProgress),
      sectionsOwnerActionNeeded:
          countSections(WorkItemStatus.ownerActionNeeded),
      sectionsPendingValidation:
          countSections(WorkItemStatus.pendingValidation),
      sectionsComplete: countSections(WorkItemStatus.complete),
      sectionsCompleteFailed: countSections(WorkItemStatus.completeFailed),
      taskbookOwnerActionNeeded:
          newStatus == WorkItemStatus.ownerActionNeeded,
      signoffsRequiredTotal: signoffsRequiredTotal,
      signoffsCompletedTotal: signoffsCompletedTotal,
      scoringSummary: bookScoringSummary,
      lastModified: now,
    );

    return copyWith(
      sections: computedSections,
      status: newStatus,
      progress: newProgress,
      taskbookSummary: summary,
    );
  }

  /// Pure. Returns `1.0` when status is complete or complete_failed;
  /// otherwise the arithmetic mean of child sections' progress, or
  /// `0.0` when the book has no sections.
  double computeProgress() {
    if (status == WorkItemStatus.complete ||
        status == WorkItemStatus.completeFailed) {
      return 1.0;
    }
    if (sections.isEmpty) return 0.0;
    return sections.fold<double>(0.0, (a, s) => a + s.progress) /
        sections.length;
  }

  Taskbook copyWith({
    CompletionState? completion,
    List<TaskbookSection>? sections,
    WorkItemStatus? status,
    double? progress,
    TaskbookSummary? taskbookSummary,
  }) {
    return Taskbook(
      taskbookType: taskbookType,
      title: title,
      description: description,
      dueDate: dueDate,
      status: status ?? this.status,
      progress: progress ?? this.progress,
      completion: completion ?? this.completion,
      assignment: assignment,
      sections: sections ?? this.sections,
      signoffPolicy: signoffPolicy,
      signoffsRequireAll: signoffsRequireAll,
      signoffPolicyCascades: signoffPolicyCascades,
      attachments: attachments,
      notes: notes,
      evaluationConfig: evaluationConfig,
      startAndEnd: startAndEnd,
      taskbookSummary: taskbookSummary ?? this.taskbookSummary,
      importStatus: importStatus,
      importNotes: importNotes,
    );
  }
}
