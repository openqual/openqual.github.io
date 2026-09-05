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

/// Task-level `critical` (v2.0): the flag lives on `TaskbookTask`, not
/// inside either type config, and section/book propagation reads it.
/// Written wire-first so the assertions run against any binding shape;
/// they were red against the v1.x layout (`criteria.autofail` /
/// `criteria.critical`) before the move.
library;

import 'dart:convert';

import 'package:openqual/enums.dart';
import 'package:openqual/taskbook.dart';
import 'package:openqual/taskbook_section.dart';
import 'package:openqual/taskbook_task.dart';
import 'package:test/test.dart';

Map<String, dynamic> evalTaskWire({
  bool? critical,
  String? outcome = 'fail',
  Map<String, dynamic> extraCriteria = const {},
}) =>
    {
      'id': 't-eval',
      'order': 0,
      'type': 'evaluation',
      if (critical != null) 'critical': critical,
      'type_config': {
        'evaluation_config': {
          'criteria': {
            'evaluation_type': 'pass_fail',
            ...extraCriteria,
          },
          if (outcome != null) 'result': {'outcome': outcome},
        },
      },
      'title': 'Eval',
    };

Map<String, dynamic> inspectionTaskWire({
  bool? critical,
  String triage = 'critical_failure',
  Map<String, dynamic> extraCriteria = const {},
}) =>
    {
      'id': 't-insp',
      'order': 0,
      'type': 'inspection',
      if (critical != null) 'critical': critical,
      'type_config': {
        'inspection_config': {
          'criteria': {'kind': 'pass_fail', ...extraCriteria},
          'result': {'triage': triage, 'ok': false},
        },
      },
      'title': 'Inspect',
    };

TaskbookSection sectionOf(Map<String, dynamic> task) =>
    TaskbookSection.fromMap({
      'id': 's1',
      'order': 0,
      'title': 'S',
      'tasks': [task],
    });

Taskbook bookOf(Map<String, dynamic> task) => Taskbook(
      title: 'B',
      sections: [sectionOf(task)],
    ).computeStatus(now: DateTime.utc(2026, 9, 4));

void main() {
  group('wire shape', () {
    test('critical round-trips true at the task level', () {
      final task = TaskbookTask.fromMap(evalTaskWire(critical: true));
      final wire = task.toMap();
      expect(wire['critical'], isTrue);
      final again = TaskbookTask.fromMap(
          jsonDecode(jsonEncode(wire)) as Map<String, dynamic>);
      expect(again.toMap()['critical'], isTrue);
    });

    test('absent critical decodes as false and is always written', () {
      final wire = TaskbookTask.fromMap(evalTaskWire()).toMap();
      expect(wire.containsKey('critical'), isTrue,
          reason: 'critical is a required field: always on the wire');
      expect(wire['critical'], isFalse);
    });

    test('critical: false round-trips as false (not dropped)', () {
      final wire = TaskbookTask.fromMap(evalTaskWire(critical: false)).toMap();
      expect(wire['critical'], isFalse);
    });

    test('retired v1.x spellings are not re-emitted from the type config',
        () {
      final evalWire = TaskbookTask.fromMap(
              evalTaskWire(extraCriteria: {'autofail': true}))
          .toMap();
      final evalCriteria = ((evalWire['type_config'] as Map)['evaluation_config']
          as Map)['criteria'] as Map;
      expect(evalCriteria.containsKey('autofail'), isFalse);

      final inspWire = TaskbookTask.fromMap(
              inspectionTaskWire(extraCriteria: {'critical': true}))
          .toMap();
      final inspCriteria = ((inspWire['type_config'] as Map)['inspection_config']
          as Map)['criteria'] as Map;
      expect(inspCriteria.containsKey('critical'), isFalse);
    });
  });

  group('propagation reads the task flag', () {
    test('critical evaluation that fails takes section and book to '
        'complete_failed', () {
      final wire = evalTaskWire(critical: true);
      expect(sectionOf(wire).computeStatus().status,
          WorkItemStatus.completeFailed);
      expect(bookOf(wire).status, WorkItemStatus.completeFailed);
    });

    test('critical inspection that fails takes section and book to '
        'complete_failed', () {
      final wire = inspectionTaskWire(critical: true);
      expect(sectionOf(wire).computeStatus().status,
          WorkItemStatus.completeFailed);
      expect(bookOf(wire).status, WorkItemStatus.completeFailed);
    });

    test('non-critical evaluation that fails does not propagate', () {
      final wire = evalTaskWire(critical: false);
      final section = sectionOf(wire).computeStatus();
      expect(section.status, isNot(WorkItemStatus.completeFailed));
      expect(bookOf(wire).status, isNot(WorkItemStatus.completeFailed));
    });

    test('non-critical inspection: a stored critical_failure triage alone '
        'does not propagate (the task flag is the authority)', () {
      final wire = inspectionTaskWire(critical: false);
      final section = sectionOf(wire).computeStatus();
      expect(section.status, isNot(WorkItemStatus.completeFailed));
      expect(bookOf(wire).status, isNot(WorkItemStatus.completeFailed));
    });

    test('a critical task that PASSES propagates nothing', () {
      final wire = evalTaskWire(critical: true, outcome: 'pass');
      expect(sectionOf(wire).computeStatus().status,
          isNot(WorkItemStatus.completeFailed));
      expect(bookOf(wire).status, isNot(WorkItemStatus.completeFailed));
    });

    test('a critical task with no result yet propagates nothing', () {
      final wire = evalTaskWire(critical: true, outcome: null);
      expect(sectionOf(wire).computeStatus().status,
          WorkItemStatus.notStarted);
      expect(bookOf(wire).status, WorkItemStatus.notStarted);
    });
  });
}
