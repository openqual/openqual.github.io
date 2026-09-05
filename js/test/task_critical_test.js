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

'use strict';

// Task-level `critical` (v2.0): the flag lives on TaskbookTask, not
// inside either type config, and section/book propagation reads it.
// Written wire-first so the assertions run against any binding shape;
// they were red against the v1.x layout (`criteria.autofail` /
// `criteria.critical`) before the move. Mirrors the Dart binding's
// task_critical_test.dart.

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const { WorkItemStatus } = require('../enums');
const { Taskbook } = require('../taskbook');
const { TaskbookSection } = require('../taskbook_section');
const { TaskbookTask } = require('../taskbook_task');

function evalTaskWire({ critical, outcome = 'fail', extraCriteria = {} } = {}) {
  const evaluationConfig = {
    criteria: { evaluation_type: 'pass_fail', ...extraCriteria },
  };
  if (outcome !== null) evaluationConfig.result = { outcome };
  const out = { id: 't-eval', order: 0, type: 'evaluation' };
  if (critical !== undefined) out.critical = critical;
  out.type_config = { evaluation_config: evaluationConfig };
  out.title = 'Eval';
  return out;
}

function inspectionTaskWire({
  critical,
  triage = 'critical_failure',
  extraCriteria = {},
} = {}) {
  const out = { id: 't-insp', order: 0, type: 'inspection' };
  if (critical !== undefined) out.critical = critical;
  out.type_config = {
    inspection_config: {
      criteria: { kind: 'pass_fail', ...extraCriteria },
      result: { triage, ok: false },
    },
  };
  out.title = 'Inspect';
  return out;
}

const sectionOf = (task) =>
  TaskbookSection.fromJSON({ id: 's1', order: 0, title: 'S', tasks: [task] });

const bookOf = (task) =>
  new Taskbook({ title: 'B', sections: [sectionOf(task)] }).computeStatus({
    now: new Date(Date.UTC(2026, 8, 4)),
  });

describe('wire shape', () => {
  test('critical round-trips true at the task level', () => {
    const wire = TaskbookTask.fromJSON(evalTaskWire({ critical: true })).toJSON();
    assert.equal(wire.critical, true);
    const again = TaskbookTask.fromJSON(JSON.parse(JSON.stringify(wire)));
    assert.equal(again.toJSON().critical, true);
  });

  test('absent critical decodes as false and is always written', () => {
    const wire = TaskbookTask.fromJSON(evalTaskWire()).toJSON();
    assert.ok(
      Object.prototype.hasOwnProperty.call(wire, 'critical'),
      'critical is a required field: always on the wire',
    );
    assert.equal(wire.critical, false);
  });

  test('critical: false round-trips as false (not dropped)', () => {
    const wire = TaskbookTask.fromJSON(evalTaskWire({ critical: false })).toJSON();
    assert.equal(wire.critical, false);
  });

  test('retired v1.x spellings are not re-emitted from the type config', () => {
    const evalWire = TaskbookTask.fromJSON(
      evalTaskWire({ extraCriteria: { autofail: true } }),
    ).toJSON();
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        evalWire.type_config.evaluation_config.criteria,
        'autofail',
      ),
      false,
    );

    const inspWire = TaskbookTask.fromJSON(
      inspectionTaskWire({ extraCriteria: { critical: true } }),
    ).toJSON();
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        inspWire.type_config.inspection_config.criteria,
        'critical',
      ),
      false,
    );
  });
});

describe('propagation reads the task flag', () => {
  test('critical evaluation that fails takes section and book to complete_failed', () => {
    const wire = evalTaskWire({ critical: true });
    assert.equal(sectionOf(wire).computeStatus().status, WorkItemStatus.COMPLETE_FAILED);
    assert.equal(bookOf(wire).status, WorkItemStatus.COMPLETE_FAILED);
  });

  test('critical inspection that fails takes section and book to complete_failed', () => {
    const wire = inspectionTaskWire({ critical: true });
    assert.equal(sectionOf(wire).computeStatus().status, WorkItemStatus.COMPLETE_FAILED);
    assert.equal(bookOf(wire).status, WorkItemStatus.COMPLETE_FAILED);
  });

  test('non-critical evaluation that fails does not propagate', () => {
    const wire = evalTaskWire({ critical: false });
    assert.notEqual(sectionOf(wire).computeStatus().status, WorkItemStatus.COMPLETE_FAILED);
    assert.notEqual(bookOf(wire).status, WorkItemStatus.COMPLETE_FAILED);
  });

  test('non-critical inspection: a stored critical_failure triage alone does not propagate (the task flag is the authority)', () => {
    const wire = inspectionTaskWire({ critical: false });
    assert.notEqual(sectionOf(wire).computeStatus().status, WorkItemStatus.COMPLETE_FAILED);
    assert.notEqual(bookOf(wire).status, WorkItemStatus.COMPLETE_FAILED);
  });

  test('a critical task that PASSES propagates nothing', () => {
    const wire = evalTaskWire({ critical: true, outcome: 'pass' });
    assert.notEqual(sectionOf(wire).computeStatus().status, WorkItemStatus.COMPLETE_FAILED);
    assert.notEqual(bookOf(wire).status, WorkItemStatus.COMPLETE_FAILED);
  });

  test('a critical task with no result yet propagates nothing', () => {
    const wire = evalTaskWire({ critical: true, outcome: null });
    assert.equal(sectionOf(wire).computeStatus().status, WorkItemStatus.NOT_STARTED);
    assert.equal(bookOf(wire).status, WorkItemStatus.NOT_STARTED);
  });
});
