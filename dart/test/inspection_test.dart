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
import 'package:openqual/task_type_config.dart';
import 'package:openqual/taskbook.dart';
import 'package:openqual/taskbook_section.dart';
import 'package:openqual/taskbook_task.dart';
import 'package:test/test.dart';

TaskbookTask inspectionTask({
  required TaskTypeInspectionCriteria criteria,
  TaskTypeInspectionResult? result,
  String id = 't1',
  bool critical = false,
}) =>
    TaskbookTask(
      id: id,
      order: 0,
      type: TaskTypes.inspection,
      critical: critical,
      title: 'Inspect',
      typeConfig: TaskTypeConfig(
        inspectionConfig:
            TaskTypeInspectionConfig(criteria: criteria, result: result),
      ),
    );

void main() {
  group('deriveTriage (normative table)', () {
    // `critical` is the owning task's flag, passed in: the criteria no
    // longer carry it (v2.0).
    test('pass_fail', () {
      const c = TaskTypeInspectionCriteria(kind: InspectionKind.passFail);
      expect(c.deriveTriage(critical: false, ok: true), InspectionTriage.pass);
      expect(c.deriveTriage(critical: false, ok: false),
          InspectionTriage.failing);
      expect(c.deriveTriage(critical: true, ok: true), InspectionTriage.pass);
      expect(c.deriveTriage(critical: true, ok: false),
          InspectionTriage.criticalFailure);
      expect(() => c.deriveTriage(critical: false),
          throwsA(isA<ArgumentError>()));
    });

    test('measurement — air-tank PSI bands', () {
      const c = TaskTypeInspectionCriteria(
        kind: InspectionKind.measurement,
        unit: 'PSI',
        passMin: 4500,
        degradedMin: 4000,
        degradedMax: 4500,
      );
      expect(c.deriveTriage(critical: false, measuredValue: 4700),
          InspectionTriage.pass);
      expect(c.deriveTriage(critical: false, measuredValue: 4200),
          InspectionTriage.degraded);
      expect(c.deriveTriage(critical: false, measuredValue: 3800),
          InspectionTriage.failing);
      // The task flag changes only the failing branch: a degraded reading
      // on a critical task is still degraded.
      expect(c.deriveTriage(critical: true, measuredValue: 4200),
          InspectionTriage.degraded);
      expect(c.deriveTriage(critical: true, measuredValue: 3800),
          InspectionTriage.criticalFailure);
    });

    test('measurement — no degraded band goes straight to failing', () {
      const c = TaskTypeInspectionCriteria(
        kind: InspectionKind.measurement,
        passMin: 10,
        passMax: 20,
      );
      expect(c.deriveTriage(critical: false, measuredValue: 15),
          InspectionTriage.pass);
      expect(c.deriveTriage(critical: false, measuredValue: 25),
          InspectionTriage.failing);
    });

    test('count', () {
      const c = TaskTypeInspectionCriteria(
        kind: InspectionKind.count,
        expectedQuantity: 4,
        unit: 'AED pads',
      );
      expect(c.deriveTriage(critical: false, foundQuantity: 4),
          InspectionTriage.pass);
      expect(c.deriveTriage(critical: false, foundQuantity: 6),
          InspectionTriage.pass);
      expect(c.deriveTriage(critical: false, foundQuantity: 2),
          InspectionTriage.degraded);
      expect(c.deriveTriage(critical: false, foundQuantity: 0),
          InspectionTriage.failing);
      expect(c.deriveTriage(critical: true, foundQuantity: 2),
          InspectionTriage.degraded);
      expect(c.deriveTriage(critical: true, foundQuantity: 0),
          InspectionTriage.criticalFailure);
    });
  });

  group('task computeStatus inspection branch', () {
    const criteria =
        TaskTypeInspectionCriteria(kind: InspectionKind.passFail);

    test('no observation → not_started', () {
      final t = inspectionTask(criteria: criteria);
      expect(t.computeStatus(), WorkItemStatus.notStarted);
    });

    test('pass triage → complete', () {
      final t = inspectionTask(
        criteria: criteria,
        result: const TaskTypeInspectionResult(
            triage: InspectionTriage.pass, ok: true),
      );
      expect(t.computeStatus(), WorkItemStatus.complete);
    });

    test('degraded triage behaves as passing completion', () {
      final t = inspectionTask(
        criteria: const TaskTypeInspectionCriteria(
            kind: InspectionKind.count, expectedQuantity: 4),
        result: const TaskTypeInspectionResult(
            triage: InspectionTriage.degraded, foundQuantity: 2),
      );
      expect(t.computeStatus(), WorkItemStatus.complete);
    });

    test('failing triage → complete_failed', () {
      final t = inspectionTask(
        criteria: criteria,
        result: const TaskTypeInspectionResult(
            triage: InspectionTriage.failing, ok: false),
      );
      expect(t.computeStatus(), WorkItemStatus.completeFailed);
    });
  });

  group('section/book propagation', () {
    TaskbookSection sectionWith(TaskbookTask t) =>
        TaskbookSection(id: 's1', order: 0, title: 'S', tasks: [t]);

    test('critical task failing propagates complete_failed to section + book',
        () {
      final t = inspectionTask(
        critical: true,
        criteria:
            const TaskTypeInspectionCriteria(kind: InspectionKind.passFail),
        result: const TaskTypeInspectionResult(
            triage: InspectionTriage.criticalFailure, ok: false),
      );
      final section = sectionWith(t).computeStatus();
      expect(section.status, WorkItemStatus.completeFailed);

      final book = Taskbook(title: 'B', sections: [sectionWith(t)])
          .computeStatus(now: DateTime.utc(2026, 7, 3));
      expect(book.status, WorkItemStatus.completeFailed);
    });

    test('plain failing on a non-critical task does NOT fail the section', () {
      final t = inspectionTask(
        criteria:
            const TaskTypeInspectionCriteria(kind: InspectionKind.passFail),
        result: const TaskTypeInspectionResult(
            triage: InspectionTriage.failing, ok: false),
      );
      final section = sectionWith(t).computeStatus();
      expect(section.status, isNot(WorkItemStatus.completeFailed));
      // The failed task still counts as done work.
      expect(section.status, WorkItemStatus.ownerActionNeeded);
    });
  });

  group('TimeThreshold', () {
    test('hard threshold flips pass to fail (worst outcome wins)', () {
      const c = TaskTypeEvaluationCriteria(
        evaluationType: EvaluationType.passFail,
        timeThreshold: TimeThreshold(durationMs: 90000, isHard: true),
      );
      expect(
        c.resolveOutcome(EvaluationOutcome.pass, observedDurationMs: 95000),
        EvaluationOutcome.fail,
      );
      expect(
        c.resolveOutcome(EvaluationOutcome.pass, observedDurationMs: 85000),
        EvaluationOutcome.pass,
      );
    });

    test('soft threshold never changes the outcome', () {
      const c = TaskTypeEvaluationCriteria(
        evaluationType: EvaluationType.passFail,
        timeThreshold: TimeThreshold(durationMs: 90000),
      );
      expect(
        c.resolveOutcome(EvaluationOutcome.pass, observedDurationMs: 95000),
        EvaluationOutcome.pass,
      );
    });

    test('absent duration never changes the outcome', () {
      const c = TaskTypeEvaluationCriteria(
        evaluationType: EvaluationType.passFail,
        timeThreshold: TimeThreshold(durationMs: 90000, isHard: true),
      );
      expect(c.resolveOutcome(EvaluationOutcome.pass), EvaluationOutcome.pass);
    });
  });
}
