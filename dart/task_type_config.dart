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

import 'enums.dart';

/// Polymorphic configuration for a TaskbookTask.
class TaskTypeConfig {
  final TaskTypeEvaluationConfig? evaluationConfig;
  final TaskTypeTaskbookConfig? taskbookConfig;
  final TaskTypeSkillsheetConfig? skillsheetConfig;
  final TaskTypeCertConfig? certConfig;

  const TaskTypeConfig({
    this.evaluationConfig,
    this.taskbookConfig,
    this.skillsheetConfig,
    this.certConfig,
  });
}

class TaskTypeEvaluationConfig {
  final TaskTypeEvaluationCriteria? criteria;
  final TaskTypeEvaluationResult? result;

  const TaskTypeEvaluationConfig({this.criteria, this.result});

  TaskTypeEvaluationConfig copyWith({
    TaskTypeEvaluationCriteria? criteria,
    TaskTypeEvaluationResult? result,
  }) {
    return TaskTypeEvaluationConfig(
      criteria: criteria ?? this.criteria,
      result: result ?? this.result,
    );
  }
}

class TaskTypeEvaluationCriteria {
  /// Either `"pass_fail"` or `"scored"`.
  final String evaluationType;
  final bool autofail;
  final double? pointsPossible;
  final double? minPassingPoints;

  const TaskTypeEvaluationCriteria({
    required this.evaluationType,
    this.autofail = false,
    this.pointsPossible,
    this.minPassingPoints,
  });
}

class TaskTypeEvaluationResult {
  final EvaluationOutcome? outcome;
  final double? pointsAwarded;
  final String? evaluatedBy;
  final DateTime? evaluatedAt;
  final String? notes;

  const TaskTypeEvaluationResult({
    this.outcome,
    this.pointsAwarded,
    this.evaluatedBy,
    this.evaluatedAt,
    this.notes,
  });

  TaskTypeEvaluationResult copyWith({double? pointsAwarded}) {
    return TaskTypeEvaluationResult(
      outcome: outcome,
      pointsAwarded: pointsAwarded ?? this.pointsAwarded,
      evaluatedBy: evaluatedBy,
      evaluatedAt: evaluatedAt,
      notes: notes,
    );
  }
}

class TaskTypeTaskbookConfig {
  final String? taskbookTemplateId;
  final bool requireComplete;

  const TaskTypeTaskbookConfig({
    this.taskbookTemplateId,
    this.requireComplete = true,
  });
}

class TaskTypeSkillsheetConfig {
  final String? taskbookTemplateId;
  final bool requireComplete;

  const TaskTypeSkillsheetConfig({
    this.taskbookTemplateId,
    this.requireComplete = true,
  });
}

class TaskTypeCertConfig {
  final String? certTypeId;
  final bool requireActive;

  const TaskTypeCertConfig({
    this.certTypeId,
    this.requireActive = true,
  });
}
