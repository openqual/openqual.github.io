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

/// Enum wire codecs for the OpenQual published wire form.
///
/// The standard publishes enum values in snake_case
/// (`technical_rescue`, `not_started`, `pass_fail`). Dart enum
/// identifiers are camelCase, so every serializer MUST pass enum
/// values through [wireValue] and every reader through the matching
/// `*FromWire` parser.
///
/// The `*FromWireLenient` family additionally accepts the legacy
/// v0.1 camelCase forms per docs/MIGRATION → Rule 3 (normalize enum
/// wire casing). Use lenient parsers only behind an explicit
/// accept-v0.1 policy; strict parsers are the default.
library;

import 'enums.dart';

/// Published snake_case wire form of a Dart enum identifier
/// (`technicalRescue` → `technical_rescue`).
String wireValue(Enum e) => e.name
    .replaceAllMapped(RegExp('[A-Z]'), (m) => '_${m[0]!.toLowerCase()}');

/// Lower-cases and strips `_` so `technical_rescue`,
/// `technicalRescue`, and `TechnicalRescue` all normalize to
/// `technicalrescue` — the equivalence class MIGRATION Rule 3 defines.
String _norm(String s) => s.toLowerCase().replaceAll('_', '').trim();

T _fromWire<T extends Enum>(List<T> values, String raw, String type) {
  for (final e in values) {
    if (wireValue(e) == raw) return e;
  }
  throw ArgumentError.value(raw, 'raw', 'unknown $type wire value');
}

T _fromWireLenient<T extends Enum>(List<T> values, String raw, String type) {
  final n = _norm(raw);
  for (final e in values) {
    if (_norm(e.name) == n) return e;
  }
  throw ArgumentError.value(raw, 'raw', 'unknown $type value');
}

/// Parses the published wire form (strict).
WorkItemStatus workItemStatusFromWire(String raw) =>
    _fromWire(WorkItemStatus.values, raw, 'WorkItemStatus');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
WorkItemStatus workItemStatusFromWireLenient(String raw) =>
    _fromWireLenient(WorkItemStatus.values, raw, 'WorkItemStatus');

/// Parses the published wire form (strict).
EvaluationOutcome evaluationOutcomeFromWire(String raw) =>
    _fromWire(EvaluationOutcome.values, raw, 'EvaluationOutcome');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
EvaluationOutcome evaluationOutcomeFromWireLenient(String raw) =>
    _fromWireLenient(EvaluationOutcome.values, raw, 'EvaluationOutcome');

/// Parses the published wire form (strict).
SignoffPolicyType signoffPolicyTypeFromWire(String raw) =>
    _fromWire(SignoffPolicyType.values, raw, 'SignoffPolicyType');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
SignoffPolicyType signoffPolicyTypeFromWireLenient(String raw) =>
    _fromWireLenient(SignoffPolicyType.values, raw, 'SignoffPolicyType');

/// Parses the published wire form (strict).
TaskTypes taskTypesFromWire(String raw) =>
    _fromWire(TaskTypes.values, raw, 'TaskTypes');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
TaskTypes taskTypesFromWireLenient(String raw) =>
    _fromWireLenient(TaskTypes.values, raw, 'TaskTypes');

/// Parses the published wire form (strict).
EvaluationType evaluationTypeFromWire(String raw) =>
    _fromWire(EvaluationType.values, raw, 'EvaluationType');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
EvaluationType evaluationTypeFromWireLenient(String raw) =>
    _fromWireLenient(EvaluationType.values, raw, 'EvaluationType');

/// Parses the published wire form (strict).
ScoringMode scoringModeFromWire(String raw) =>
    _fromWire(ScoringMode.values, raw, 'ScoringMode');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
ScoringMode scoringModeFromWireLenient(String raw) =>
    _fromWireLenient(ScoringMode.values, raw, 'ScoringMode');

/// Parses the published wire form (strict).
TaskbookTypes taskbookTypesFromWire(String raw) =>
    _fromWire(TaskbookTypes.values, raw, 'TaskbookTypes');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
TaskbookTypes taskbookTypesFromWireLenient(String raw) =>
    _fromWireLenient(TaskbookTypes.values, raw, 'TaskbookTypes');

/// Parses the published wire form (strict).
RenewalStatus renewalStatusFromWire(String raw) =>
    _fromWire(RenewalStatus.values, raw, 'RenewalStatus');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
RenewalStatus renewalStatusFromWireLenient(String raw) =>
    _fromWireLenient(RenewalStatus.values, raw, 'RenewalStatus');

/// Parses the published wire form (strict).
TimeUnit timeUnitFromWire(String raw) =>
    _fromWire(TimeUnit.values, raw, 'TimeUnit');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
TimeUnit timeUnitFromWireLenient(String raw) =>
    _fromWireLenient(TimeUnit.values, raw, 'TimeUnit');

/// Parses the published wire form (strict).
RequirementUnits requirementUnitsFromWire(String raw) =>
    _fromWire(RequirementUnits.values, raw, 'RequirementUnits');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
RequirementUnits requirementUnitsFromWireLenient(String raw) =>
    _fromWireLenient(RequirementUnits.values, raw, 'RequirementUnits');

/// Parses the published wire form (strict).
Discipline disciplineFromWire(String raw) =>
    _fromWire(Discipline.values, raw, 'Discipline');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
Discipline disciplineFromWireLenient(String raw) =>
    _fromWireLenient(Discipline.values, raw, 'Discipline');

/// Parses the published wire form (strict).
CertClassification certClassificationFromWire(String raw) =>
    _fromWire(CertClassification.values, raw, 'CertClassification');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
CertClassification certClassificationFromWireLenient(String raw) =>
    _fromWireLenient(CertClassification.values, raw, 'CertClassification');

/// Parses the published wire form (strict).
CertStatus certStatusFromWire(String raw) =>
    _fromWire(CertStatus.values, raw, 'CertStatus');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
CertStatus certStatusFromWireLenient(String raw) =>
    _fromWireLenient(CertStatus.values, raw, 'CertStatus');

/// Parses the published wire form (strict).
OrgRoles orgRolesFromWire(String raw) =>
    _fromWire(OrgRoles.values, raw, 'OrgRoles');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
OrgRoles orgRolesFromWireLenient(String raw) =>
    _fromWireLenient(OrgRoles.values, raw, 'OrgRoles');

/// Parses the published wire form (strict).
InspectionKind inspectionKindFromWire(String raw) =>
    _fromWire(InspectionKind.values, raw, 'InspectionKind');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
InspectionKind inspectionKindFromWireLenient(String raw) =>
    _fromWireLenient(InspectionKind.values, raw, 'InspectionKind');

/// Parses the published wire form (strict).
InspectionTriage inspectionTriageFromWire(String raw) =>
    _fromWire(InspectionTriage.values, raw, 'InspectionTriage');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
InspectionTriage inspectionTriageFromWireLenient(String raw) =>
    _fromWireLenient(InspectionTriage.values, raw, 'InspectionTriage');

/// Parses the published wire form (strict).
InspectionAction inspectionActionFromWire(String raw) =>
    _fromWire(InspectionAction.values, raw, 'InspectionAction');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
InspectionAction inspectionActionFromWireLenient(String raw) =>
    _fromWireLenient(InspectionAction.values, raw, 'InspectionAction');

/// Parses the published wire form (strict).
TrainingType trainingTypeFromWire(String raw) =>
    _fromWire(TrainingType.values, raw, 'TrainingType');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
TrainingType trainingTypeFromWireLenient(String raw) =>
    _fromWireLenient(TrainingType.values, raw, 'TrainingType');

/// Parses the published wire form (strict).
VerificationProvider verificationProviderFromWire(String raw) =>
    _fromWire(VerificationProvider.values, raw, 'VerificationProvider');

/// Accepts the published wire form plus legacy camelCase (MIGRATION Rule 3).
VerificationProvider verificationProviderFromWireLenient(String raw) =>
    _fromWireLenient(VerificationProvider.values, raw, 'VerificationProvider');
