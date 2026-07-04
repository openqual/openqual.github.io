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
import 'task_type_config.dart';
import 'taskbook_subtask.dart';
import 'wire.dart';

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

  /// This tier's signoff policies. Authoritative for this tier; no
  /// runtime inheritance from the section or book (named
  /// `signoff_policy_override` in v0.1 — see MIGRATION Rule 1).
  final List<SignoffPolicy> signoffPolicy;

  final bool signoffsRequireAll;
  final List<Attachment> attachments;
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
    this.signoffPolicy = const [],
    this.signoffsRequireAll = true,
    this.attachments = const [],
    this.notes,
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskbookTask.fromMap(Map<String, dynamic> m) => TaskbookTask(
        id: m['id'] as String,
        order: (m['order'] as num).toInt(),
        type: m['type'] == null
            ? TaskTypes.task
            : taskTypesFromWire(m['type'] as String),
        typeConfig: m['type_config'] == null
            ? null
            : TaskTypeConfig.fromMap(
                (m['type_config'] as Map).cast<String, dynamic>()),
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
        subtasks:
            readMapList(m['subtasks']).map(TaskbookSubtask.fromMap).toList(),
        signoffPolicy: readMapList(m['signoff_policy'])
            .map(SignoffPolicy.fromMap)
            .toList(),
        signoffsRequireAll: (m['signoffs_require_all'] as bool?) ?? true,
        attachments:
            readMapList(m['attachments']).map(Attachment.fromMap).toList(),
        notes: m['notes'] as String?,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'id': id,
        'order': order,
        'type': wireValue(type),
        if (typeConfig != null) 'type_config': typeConfig!.toMap(),
        'title': title,
        if (description != null) 'description': description,
        if (dueDate != null) 'due_date': dueDate,
        'status': wireValue(status),
        'progress': progress,
        'completion': completion.toMap(),
        'subtasks': subtasks.map((s) => s.toMap()).toList(),
        'signoff_policy': signoffPolicy.map((p) => p.toMap()).toList(),
        'signoffs_require_all': signoffsRequireAll,
        'attachments': attachments.map((a) => a.toMap()).toList(),
        if (notes != null) 'notes': notes,
      };

  /// Pure. Computes the task's status given its current fields.
  /// See schemas/taskbook_task.md for the full waterfall.
  WorkItemStatus computeStatus() {
    final isEval = type == TaskTypes.evaluation;
    final isInspection = type == TaskTypes.inspection;
    final result = typeConfig?.evaluationConfig?.result;
    final outcome = result?.outcome;
    final hasOutcome = outcome != null;
    final hasEvalResult = isEval && result != null;
    final inspResult = typeConfig?.inspectionConfig?.result;
    final hasInspectionResult = isInspection && inspResult != null;

    final total = subtasks.length;
    final hasSubtasks = total > 0;
    final completedCount = subtasks.where((s) => s.completion.complete).length;
    final subtasksFinished = hasSubtasks && completedCount == total;
    final subtasksSatisfied = !hasSubtasks || subtasksFinished;

    final hasPolicy = signoffPolicy.isNotEmpty;
    final signoffOK = signoffsOK(signoffPolicy, signoffsRequireAll);
    final signoffInProgress = hasPolicy &&
        !signoffOK &&
        signoffPolicy.any((p) => p.completed);
    final signoffsSatisfied = !hasPolicy || signoffOK;

    final workExists = hasSubtasks || hasPolicy;

    // Effective "complete" input: evaluation → outcome recorded;
    // inspection → observation recorded; other types → the owner marker.
    final isComplete = isEval
        ? hasOutcome
        : isInspection
            ? hasInspectionResult
            : completion.complete;
    final isPassingCompletion = isEval
        ? outcome == EvaluationOutcome.pass
        : isInspection
            ? (hasInspectionResult && !inspResult.isFailing)
            : true;

    // 1. Complete / complete_failed
    if (isComplete && signoffOK) {
      return isPassingCompletion
          ? WorkItemStatus.complete
          : WorkItemStatus.completeFailed;
    }
    // 2. Pending validation
    if ((isComplete && !signoffOK) ||
        (isEval && completion.complete && !hasOutcome) ||
        (isInspection && completion.complete && !hasInspectionResult)) {
      return WorkItemStatus.pendingValidation;
    }
    // 3. Owner action needed (plain tasks only)
    if (!isEval &&
        !isInspection &&
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
    if (criteria.evaluationType != EvaluationType.scored) return this;
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
      signoffPolicy: signoffPolicy,
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
      inspectionConfig: inspectionConfig,
      taskbookConfig: taskbookConfig,
      skillsheetConfig: skillsheetConfig,
      certConfig: certConfig,
    );
  }
}
