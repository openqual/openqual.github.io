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

import 'completion_state.dart';
import 'enums.dart';
import 'signoff_policy.dart';
import 'task_type_config.dart';
import 'taskbook_attachment.dart';
import 'taskbook_subtask.dart';

/// A leaf work unit within a TaskbookSection. Polymorphic via [type] and
/// [typeConfig].
class TaskbookTask {
  final String id;
  final int order;
  final TaskTypes type;
  final TaskTypeConfig? typeConfig;
  final String title;
  final String? description;
  final DateTime? dueDate;
  final WorkItemStatus status;
  final double progress;
  final CompletionState completion;
  final List<TaskbookSubtask> subtasks;
  final List<SignoffPolicy> signoffPolicyOverride;
  final bool signoffsRequireAll;
  final List<TaskbookAttachment> attachments;
  final String? notes;

  const TaskbookTask({
    required this.id,
    required this.order,
    this.type = TaskTypes.task,
    this.typeConfig,
    required this.title,
    this.description,
    this.dueDate,
    this.status = WorkItemStatus.notStarted,
    this.progress = 0.0,
    this.completion = const CompletionState(),
    this.subtasks = const [],
    this.signoffPolicyOverride = const [],
    this.signoffsRequireAll = true,
    this.attachments = const [],
    this.notes,
  });

  /// Pure. Computes the task's status given its current fields.
  /// See schemas/taskbook_task.md for the full waterfall.
  WorkItemStatus computeStatus() {
    final isEval = type == TaskTypes.evaluation;
    final result = typeConfig?.evaluationConfig?.result;
    final outcome = result?.outcome;
    final hasOutcome = outcome != null;
    final hasEvalResult = isEval && result != null;

    final total = subtasks.length;
    final hasSubtasks = total > 0;
    final completedCount = subtasks.where((s) => s.completion.complete).length;
    final subtasksFinished = hasSubtasks && completedCount == total;
    final subtasksSatisfied = !hasSubtasks || subtasksFinished;

    final hasPolicy = signoffPolicyOverride.isNotEmpty;
    final signoffOK = signoffsOK(signoffPolicyOverride, signoffsRequireAll);
    final signoffInProgress = hasPolicy &&
        !signoffOK &&
        signoffPolicyOverride.any((p) => p.completed);
    final signoffsSatisfied = !hasPolicy || signoffOK;

    final workExists = hasSubtasks || hasPolicy;

    final isComplete = isEval ? hasOutcome : completion.complete;
    final isPassingCompletion =
        isEval ? outcome == EvaluationOutcome.pass : true;

    // 1. Complete / complete_failed
    if (isComplete && signoffOK) {
      return isPassingCompletion
          ? WorkItemStatus.complete
          : WorkItemStatus.completeFailed;
    }
    // 2. Pending validation
    if ((isComplete && !signoffOK) ||
        (isEval && completion.complete && !hasOutcome)) {
      return WorkItemStatus.pendingValidation;
    }
    // 3. Owner action needed (non-eval only)
    if (!isEval &&
        workExists &&
        subtasksSatisfied &&
        signoffsSatisfied &&
        !isComplete) {
      return WorkItemStatus.ownerActionNeeded;
    }
    // 4. In progress
    if (completedCount > 0 ||
        signoffInProgress ||
        (hasEvalResult && !hasOutcome)) {
      return WorkItemStatus.inProgress;
    }
    // 5. Default
    return WorkItemStatus.notStarted;
  }

  /// Pure. Returns 1.0 when [status] is complete/completeFailed, otherwise
  /// the fraction of subtasks complete (0.0 if no subtasks).
  double computeProgress() {
    if (status == WorkItemStatus.complete ||
        status == WorkItemStatus.completeFailed) {
      return 1.0;
    }
    if (subtasks.isEmpty) return 0.0;
    final done = subtasks.where((s) => s.completion.complete).length;
    return done / subtasks.length;
  }

  /// Clamps `pointsAwarded` to `pointsPossible` for scored evaluations.
  /// Returns a new task with the clamped result, or the receiver unchanged.
  TaskbookTask withClampedPoints() {
    if (type != TaskTypes.evaluation) return this;
    final result = typeConfig?.evaluationConfig?.result;
    final criteria = typeConfig?.evaluationConfig?.criteria;
    if (result == null || criteria == null) return this;
    if (criteria.evaluationType != 'scored') return this;
    final possible = criteria.pointsPossible ?? 0.0;
    final awarded = result.pointsAwarded ?? 0.0;
    if (awarded <= possible) return this;
    return copyWith(
      typeConfig: typeConfig!.copyWith(
        evaluationConfig: typeConfig!.evaluationConfig!.copyWith(
          result: result.copyWith(pointsAwarded: possible),
        ),
      ),
    );
  }

  TaskbookTask copyWith({
    WorkItemStatus? status,
    double? progress,
    CompletionState? completion,
    List<TaskbookSubtask>? subtasks,
    TaskTypeConfig? typeConfig,
  }) {
    return TaskbookTask(
      id: id,
      order: order,
      type: type,
      typeConfig: typeConfig ?? this.typeConfig,
      title: title,
      description: description,
      dueDate: dueDate,
      status: status ?? this.status,
      progress: progress ?? this.progress,
      completion: completion ?? this.completion,
      subtasks: subtasks ?? this.subtasks,
      signoffPolicyOverride: signoffPolicyOverride,
      signoffsRequireAll: signoffsRequireAll,
      attachments: attachments,
      notes: notes,
    );
  }
}

extension on TaskTypeConfig {
  TaskTypeConfig copyWith({TaskTypeEvaluationConfig? evaluationConfig}) {
    return TaskTypeConfig(
      evaluationConfig: evaluationConfig ?? this.evaluationConfig,
      taskbookConfig: taskbookConfig,
      skillsheetConfig: skillsheetConfig,
      certConfig: certConfig,
    );
  }
}
