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
import 'enums.dart';
import 'source.dart';
import 'wire.dart';

/// Polymorphic configuration for a TaskbookTask.
class TaskTypeConfig {
  final TaskTypeEvaluationConfig? evaluationConfig;
  final TaskTypeInspectionConfig? inspectionConfig;
  final TaskTypeTaskbookConfig? taskbookConfig;
  final TaskTypeSkillsheetConfig? skillsheetConfig;
  final TaskTypeCertConfig? certConfig;

  const TaskTypeConfig({
    this.evaluationConfig,
    this.inspectionConfig,
    this.taskbookConfig,
    this.skillsheetConfig,
    this.certConfig,
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeConfig.fromMap(Map<String, dynamic> m) => TaskTypeConfig(
        evaluationConfig: m['evaluation_config'] == null
            ? null
            : TaskTypeEvaluationConfig.fromMap(
                (m['evaluation_config'] as Map).cast<String, dynamic>()),
        inspectionConfig: m['inspection_config'] == null
            ? null
            : TaskTypeInspectionConfig.fromMap(
                (m['inspection_config'] as Map).cast<String, dynamic>()),
        taskbookConfig: m['taskbook_config'] == null
            ? null
            : TaskTypeTaskbookConfig.fromMap(
                (m['taskbook_config'] as Map).cast<String, dynamic>()),
        skillsheetConfig: m['skillsheet_config'] == null
            ? null
            : TaskTypeSkillsheetConfig.fromMap(
                (m['skillsheet_config'] as Map).cast<String, dynamic>()),
        certConfig: m['cert_config'] == null
            ? null
            : TaskTypeCertConfig.fromMap(
                (m['cert_config'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (evaluationConfig != null)
          'evaluation_config': evaluationConfig!.toMap(),
        if (inspectionConfig != null)
          'inspection_config': inspectionConfig!.toMap(),
        if (taskbookConfig != null) 'taskbook_config': taskbookConfig!.toMap(),
        if (skillsheetConfig != null)
          'skillsheet_config': skillsheetConfig!.toMap(),
        if (certConfig != null) 'cert_config': certConfig!.toMap(),
      };
}

class TaskTypeEvaluationConfig {
  final TaskTypeEvaluationCriteria? criteria;
  final TaskTypeEvaluationResult? result;

  const TaskTypeEvaluationConfig({this.criteria, this.result});

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeEvaluationConfig.fromMap(Map<String, dynamic> m) =>
      TaskTypeEvaluationConfig(
        criteria: m['criteria'] == null
            ? null
            : TaskTypeEvaluationCriteria.fromMap(
                (m['criteria'] as Map).cast<String, dynamic>()),
        result: m['result'] == null
            ? null
            : TaskTypeEvaluationResult.fromMap(
                (m['result'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (criteria != null) 'criteria': criteria!.toMap(),
        if (result != null) 'result': result!.toMap(),
      };

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
  final EvaluationType evaluationType;
  final bool autofail;
  final double? pointsPossible;
  final double? minPassingPoints;

  /// Optional target completion time for timed evaluations. The
  /// observed duration comes from the work item's
  /// `start_and_end.duration_ms`; see [resolveOutcome].
  final TimeThreshold? timeThreshold;

  const TaskTypeEvaluationCriteria({
    required this.evaluationType,
    this.autofail = false,
    this.pointsPossible,
    this.minPassingPoints,
    this.timeThreshold,
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeEvaluationCriteria.fromMap(Map<String, dynamic> m) =>
      TaskTypeEvaluationCriteria(
        evaluationType: evaluationTypeFromWire(m['evaluation_type'] as String),
        autofail: (m['autofail'] as bool?) ?? false,
        pointsPossible: (m['points_possible'] as num?)?.toDouble(),
        minPassingPoints: (m['min_passing_points'] as num?)?.toDouble(),
        timeThreshold: m['time_threshold'] == null
            ? null
            : TimeThreshold.fromMap(
                (m['time_threshold'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'evaluation_type': wireValue(evaluationType),
        'autofail': autofail,
        if (pointsPossible != null) 'points_possible': pointsPossible,
        if (minPassingPoints != null) 'min_passing_points': minPassingPoints,
        if (timeThreshold != null) 'time_threshold': timeThreshold!.toMap(),
      };

  /// Applies hard-threshold semantics to a determined [outcome]
  /// (worst outcome wins, per schemas/task_type_config.md →
  /// `TimeThreshold`): a `pass` with an observed duration over a hard
  /// threshold resolves to `fail`. Soft thresholds and absent
  /// durations never change the outcome.
  EvaluationOutcome resolveOutcome(
    EvaluationOutcome outcome, {
    int? observedDurationMs,
  }) {
    final t = timeThreshold;
    if (t == null || !t.isHard || observedDurationMs == null) return outcome;
    if (observedDurationMs > t.durationMs) return EvaluationOutcome.fail;
    return outcome;
  }
}

/// Target completion time for a timed evaluation ("must finish within
/// 90 seconds"). The observed duration comes from the work item's
/// `start_and_end.duration_ms`; this is the template-side target it is
/// evaluated against.
class TimeThreshold {
  /// Target time in milliseconds. Must be positive.
  final int durationMs;

  /// `false` (soft, default): display-only, outcome unaffected.
  /// `true` (hard): the outcome fails when the observed duration
  /// exceeds [durationMs] (worst outcome wins).
  final bool isHard;

  const TimeThreshold({
    required this.durationMs,
    this.isHard = false,
  }) : assert(durationMs > 0, 'TimeThreshold.durationMs must be > 0');

  /// Reads the wire shape produced by [toMap].
  factory TimeThreshold.fromMap(Map<String, dynamic> m) => TimeThreshold(
        durationMs: (m['duration_ms'] as num).toInt(),
        isHard: (m['is_hard'] as bool?) ?? false,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'duration_ms': durationMs,
        'is_hard': isHard,
      };

  @override
  bool operator ==(Object other) =>
      other is TimeThreshold &&
      other.durationMs == durationMs &&
      other.isHard == isHard;

  @override
  int get hashCode => Object.hash(durationMs, isHard);
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

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeEvaluationResult.fromMap(Map<String, dynamic> m) =>
      TaskTypeEvaluationResult(
        outcome: m['outcome'] == null
            ? null
            : evaluationOutcomeFromWire(m['outcome'] as String),
        pointsAwarded: (m['points_awarded'] as num?)?.toDouble(),
        evaluatedBy: m['evaluated_by'] as String?,
        evaluatedAt: readDateTime(m['evaluated_at']),
        notes: m['notes'] as String?,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (outcome != null) 'outcome': wireValue(outcome!),
        if (pointsAwarded != null) 'points_awarded': pointsAwarded,
        if (evaluatedBy != null) 'evaluated_by': evaluatedBy,
        if (evaluatedAt != null) 'evaluated_at': evaluatedAt,
        if (notes != null) 'notes': notes,
      };

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

/// Configuration + result for `type = inspection` — a structured
/// observation recorded by a person: a yes/no condition check, a
/// measurement against pass bands, or a count against an expected
/// quantity. See schemas/task_type_config.md → `TaskTypeInspectionConfig`.
class TaskTypeInspectionConfig {
  final TaskTypeInspectionCriteria? criteria;
  final TaskTypeInspectionResult? result;

  const TaskTypeInspectionConfig({this.criteria, this.result});

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeInspectionConfig.fromMap(Map<String, dynamic> m) =>
      TaskTypeInspectionConfig(
        criteria: m['criteria'] == null
            ? null
            : TaskTypeInspectionCriteria.fromMap(
                (m['criteria'] as Map).cast<String, dynamic>()),
        result: m['result'] == null
            ? null
            : TaskTypeInspectionResult.fromMap(
                (m['result'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (criteria != null) 'criteria': criteria!.toMap(),
        if (result != null) 'result': result!.toMap(),
      };

  TaskTypeInspectionConfig copyWith({
    TaskTypeInspectionCriteria? criteria,
    TaskTypeInspectionResult? result,
  }) {
    return TaskTypeInspectionConfig(
      criteria: criteria ?? this.criteria,
      result: result ?? this.result,
    );
  }
}

/// What an inspection checks and what passing looks like.
/// Kind-discriminated: `measurement` uses the band bounds, `count`
/// uses [expectedQuantity], `pass_fail` uses neither.
class TaskTypeInspectionCriteria {
  final InspectionKind kind;

  /// When `true`, a failing observation derives `critical_failure`
  /// triage, which propagates `complete_failed` up to the parent
  /// section (and book) — the inspection counterpart of `autofail`.
  final bool critical;

  /// Display unit for `measurement` / `count` kinds, e.g. `"PSI"`.
  final String? unit;

  /// `measurement` only: inclusive passing band. Null bounds are open.
  final double? passMin;
  final double? passMax;

  /// `measurement` only: inclusive degraded band, consulted when the
  /// value misses the passing band.
  final double? degradedMin;
  final double? degradedMax;

  /// `count` only (required for that kind): the quantity expected.
  final int? expectedQuantity;

  const TaskTypeInspectionCriteria({
    required this.kind,
    this.critical = false,
    this.unit,
    this.passMin,
    this.passMax,
    this.degradedMin,
    this.degradedMax,
    this.expectedQuantity,
  }) : assert(expectedQuantity == null || expectedQuantity >= 0,
            'expectedQuantity must be >= 0');

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeInspectionCriteria.fromMap(Map<String, dynamic> m) =>
      TaskTypeInspectionCriteria(
        kind: inspectionKindFromWire(m['kind'] as String),
        critical: (m['critical'] as bool?) ?? false,
        unit: m['unit'] as String?,
        passMin: (m['pass_min'] as num?)?.toDouble(),
        passMax: (m['pass_max'] as num?)?.toDouble(),
        degradedMin: (m['degraded_min'] as num?)?.toDouble(),
        degradedMax: (m['degraded_max'] as num?)?.toDouble(),
        expectedQuantity: (m['expected_quantity'] as num?)?.toInt(),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'kind': wireValue(kind),
        'critical': critical,
        if (unit != null) 'unit': unit,
        if (passMin != null) 'pass_min': passMin,
        if (passMax != null) 'pass_max': passMax,
        if (degradedMin != null) 'degraded_min': degradedMin,
        if (degradedMax != null) 'degraded_max': degradedMax,
        if (expectedQuantity != null) 'expected_quantity': expectedQuantity,
      };

  /// Pure. Derives the triage for an observed value per the normative
  /// rules in schemas/task_type_config.md → "Triage derivation".
  ///
  /// Pass the observation matching [kind]: [ok] for `pass_fail`,
  /// [measuredValue] for `measurement`, [foundQuantity] for `count`.
  /// Throws [ArgumentError] when the kind's observation is missing.
  InspectionTriage deriveTriage({
    bool? ok,
    double? measuredValue,
    int? foundQuantity,
  }) {
    final worst = critical
        ? InspectionTriage.criticalFailure
        : InspectionTriage.failing;
    switch (kind) {
      case InspectionKind.passFail:
        if (ok == null) {
          throw ArgumentError('pass_fail inspection requires `ok`');
        }
        return ok ? InspectionTriage.pass : worst;
      case InspectionKind.measurement:
        if (measuredValue == null) {
          throw ArgumentError('measurement inspection requires a value');
        }
        bool within(double v, double? lo, double? hi) =>
            (lo == null || v >= lo) && (hi == null || v <= hi);
        if (within(measuredValue, passMin, passMax)) {
          return InspectionTriage.pass;
        }
        final hasDegradedBand = degradedMin != null || degradedMax != null;
        if (hasDegradedBand && within(measuredValue, degradedMin, degradedMax)) {
          return InspectionTriage.degraded;
        }
        return worst;
      case InspectionKind.count:
        if (foundQuantity == null) {
          throw ArgumentError('count inspection requires a quantity');
        }
        final expected = expectedQuantity ?? 0;
        if (foundQuantity >= expected) return InspectionTriage.pass;
        if (foundQuantity > 0) return InspectionTriage.degraded;
        return worst;
    }
  }
}

/// The recorded observation for an inspection task. [triage] is
/// derived at record time via [TaskTypeInspectionCriteria.deriveTriage]
/// and stored so readers don't recompute. The raw observation is
/// recorded **unclamped** — a 4000 PSI reading against a 3000 PSI
/// floor round-trips faithfully.
class TaskTypeInspectionResult {
  final InspectionTriage triage;

  /// `pass_fail` kind: the observed yes/no.
  final bool? ok;

  /// `measurement` kind: the observed value.
  final double? measuredValue;

  /// `count` kind: the observed quantity.
  final int? foundQuantity;

  /// Recommended follow-up: replace, repair, or monitor.
  final InspectionAction? action;

  final String? observedBy;
  final DateTime? observedAt;
  final String? notes;

  const TaskTypeInspectionResult({
    required this.triage,
    this.ok,
    this.measuredValue,
    this.foundQuantity,
    this.action,
    this.observedBy,
    this.observedAt,
    this.notes,
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeInspectionResult.fromMap(Map<String, dynamic> m) =>
      TaskTypeInspectionResult(
        triage: inspectionTriageFromWire(m['triage'] as String),
        ok: m['ok'] as bool?,
        measuredValue: (m['measured_value'] as num?)?.toDouble(),
        foundQuantity: (m['found_quantity'] as num?)?.toInt(),
        action: m['action'] == null
            ? null
            : inspectionActionFromWire(m['action'] as String),
        observedBy: m['observed_by'] as String?,
        observedAt: readDateTime(m['observed_at']),
        notes: m['notes'] as String?,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'triage': wireValue(triage),
        if (ok != null) 'ok': ok,
        if (measuredValue != null) 'measured_value': measuredValue,
        if (foundQuantity != null) 'found_quantity': foundQuantity,
        if (action != null) 'action': wireValue(action!),
        if (observedBy != null) 'observed_by': observedBy,
        if (observedAt != null) 'observed_at': observedAt,
        if (notes != null) 'notes': notes,
      };

  /// `true` when the triage terminates the task in a failed state
  /// (`failing` or `critical_failure`).
  bool get isFailing =>
      triage == InspectionTriage.failing ||
      triage == InspectionTriage.criticalFailure;
}

class TaskTypeTaskbookConfig {
  final String? displayName;
  final Source? source;
  final bool requireComplete;

  const TaskTypeTaskbookConfig({
    this.displayName,
    this.source,
    this.requireComplete = true,
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeTaskbookConfig.fromMap(Map<String, dynamic> m) =>
      TaskTypeTaskbookConfig(
        displayName: m['display_name'] as String?,
        source: m['source'] == null
            ? null
            : Source.fromMap((m['source'] as Map).cast<String, dynamic>()),
        requireComplete: (m['require_complete'] as bool?) ?? true,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (displayName != null) 'display_name': displayName,
        if (source != null) 'source': source!.toMap(),
        'require_complete': requireComplete,
      };
}

class TaskTypeSkillsheetConfig {
  final String? displayName;
  final Source? source;
  final bool requireComplete;

  const TaskTypeSkillsheetConfig({
    this.displayName,
    this.source,
    this.requireComplete = true,
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeSkillsheetConfig.fromMap(Map<String, dynamic> m) =>
      TaskTypeSkillsheetConfig(
        displayName: m['display_name'] as String?,
        source: m['source'] == null
            ? null
            : Source.fromMap((m['source'] as Map).cast<String, dynamic>()),
        requireComplete: (m['require_complete'] as bool?) ?? true,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (displayName != null) 'display_name': displayName,
        if (source != null) 'source': source!.toMap(),
        'require_complete': requireComplete,
      };
}

class TaskTypeCertConfig {
  final List<AcceptedCertType> acceptedCertTypes;
  final bool requireActive;

  const TaskTypeCertConfig({
    required this.acceptedCertTypes,
    this.requireActive = true,
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskTypeCertConfig.fromMap(Map<String, dynamic> m) =>
      TaskTypeCertConfig(
        acceptedCertTypes: readMapList(m['accepted_cert_types'])
            .map(AcceptedCertType.fromMap)
            .toList(),
        requireActive: (m['require_active'] as bool?) ?? true,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'accepted_cert_types':
            acceptedCertTypes.map((t) => t.toMap()).toList(),
        'require_active': requireActive,
      };
}

/// A single entry in [TaskTypeCertConfig.acceptedCertTypes]. Follows the
/// `display_name` + `source` snapshot pattern used by the other
/// reference configs.
class AcceptedCertType {
  final String? displayName;
  final Source? source;

  const AcceptedCertType({this.displayName, this.source});

  /// Reads the wire shape produced by [toMap].
  factory AcceptedCertType.fromMap(Map<String, dynamic> m) =>
      AcceptedCertType(
        displayName: m['display_name'] as String?,
        source: m['source'] == null
            ? null
            : Source.fromMap((m['source'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (displayName != null) 'display_name': displayName,
        if (source != null) 'source': source!.toMap(),
      };
}
