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

    final farFuture = DateTime(9999, 12, 31);

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
