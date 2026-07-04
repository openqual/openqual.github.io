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

import 'package:openqual/enums.dart';
import 'package:openqual/wire.dart';
import 'package:test/test.dart';

void main() {
  group('wireValue', () {
    test('produces published snake_case forms', () {
      expect(wireValue(WorkItemStatus.notStarted), 'not_started');
      expect(wireValue(WorkItemStatus.ownerActionNeeded),
          'owner_action_needed');
      expect(wireValue(Discipline.technicalRescue), 'technical_rescue');
      expect(wireValue(EvaluationType.passFail), 'pass_fail');
      expect(wireValue(ScoringMode.perSection), 'per_section');
      expect(wireValue(InspectionTriage.criticalFailure),
          'critical_failure');
      expect(wireValue(TrainingType.lectureAndSkills), 'lecture_and_skills');
      expect(wireValue(VerificationProvider.internalLms), 'internal_lms');
      expect(wireValue(TaskTypes.inspection), 'inspection');
      expect(wireValue(Discipline.aviation), 'aviation');
    });
  });

  group('strict parsers', () {
    test('accept the published wire form', () {
      expect(workItemStatusFromWire('not_started'), WorkItemStatus.notStarted);
      expect(disciplineFromWire('technical_rescue'),
          Discipline.technicalRescue);
      expect(inspectionTriageFromWire('critical_failure'),
          InspectionTriage.criticalFailure);
      expect(trainingTypeFromWire('online_async'), TrainingType.onlineAsync);
    });

    test('reject legacy camelCase', () {
      expect(() => workItemStatusFromWire('notStarted'),
          throwsA(isA<ArgumentError>()));
      expect(() => disciplineFromWire('technicalRescue'),
          throwsA(isA<ArgumentError>()));
    });

    test('reject unknown values', () {
      expect(() => workItemStatusFromWire('bogus'),
          throwsA(isA<ArgumentError>()));
    });
  });

  group('lenient parsers (MIGRATION Rule 3)', () {
    test('accept both published and legacy camelCase forms', () {
      expect(workItemStatusFromWireLenient('not_started'),
          WorkItemStatus.notStarted);
      expect(workItemStatusFromWireLenient('notStarted'),
          WorkItemStatus.notStarted);
      expect(disciplineFromWireLenient('TechnicalRescue'),
          Discipline.technicalRescue);
      expect(evaluationTypeFromWireLenient('passFail'),
          EvaluationType.passFail);
      expect(scoringModeFromWireLenient('perSection'),
          ScoringMode.perSection);
    });

    test('reject unknown values', () {
      expect(() => workItemStatusFromWireLenient('bogus'),
          throwsA(isA<ArgumentError>()));
    });
  });

  test('every enum round-trips through its strict parser', () {
    for (final e in WorkItemStatus.values) {
      expect(workItemStatusFromWire(wireValue(e)), e);
    }
    for (final e in EvaluationOutcome.values) {
      expect(evaluationOutcomeFromWire(wireValue(e)), e);
    }
    for (final e in SignoffPolicyType.values) {
      expect(signoffPolicyTypeFromWire(wireValue(e)), e);
    }
    for (final e in TaskTypes.values) {
      expect(taskTypesFromWire(wireValue(e)), e);
    }
    for (final e in EvaluationType.values) {
      expect(evaluationTypeFromWire(wireValue(e)), e);
    }
    for (final e in ScoringMode.values) {
      expect(scoringModeFromWire(wireValue(e)), e);
    }
    for (final e in TaskbookTypes.values) {
      expect(taskbookTypesFromWire(wireValue(e)), e);
    }
    for (final e in RenewalStatus.values) {
      expect(renewalStatusFromWire(wireValue(e)), e);
    }
    for (final e in TimeUnit.values) {
      expect(timeUnitFromWire(wireValue(e)), e);
    }
    for (final e in RequirementUnits.values) {
      expect(requirementUnitsFromWire(wireValue(e)), e);
    }
    for (final e in Discipline.values) {
      expect(disciplineFromWire(wireValue(e)), e);
    }
    for (final e in CertClassification.values) {
      expect(certClassificationFromWire(wireValue(e)), e);
    }
    for (final e in CertStatus.values) {
      expect(certStatusFromWire(wireValue(e)), e);
    }
    for (final e in OrgRoles.values) {
      expect(orgRolesFromWire(wireValue(e)), e);
    }
    for (final e in InspectionKind.values) {
      expect(inspectionKindFromWire(wireValue(e)), e);
    }
    for (final e in InspectionTriage.values) {
      expect(inspectionTriageFromWire(wireValue(e)), e);
    }
    for (final e in InspectionAction.values) {
      expect(inspectionActionFromWire(wireValue(e)), e);
    }
    for (final e in TrainingType.values) {
      expect(trainingTypeFromWire(wireValue(e)), e);
    }
    for (final e in VerificationProvider.values) {
      expect(verificationProviderFromWire(wireValue(e)), e);
    }
  });
}
