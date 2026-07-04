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

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const {
  WorkItemStatus,
  TaskTypes,
  EvaluationType,
  EvaluationOutcome,
  InspectionKind,
  InspectionTriage,
} = require('../enums');
const {
  TaskTypeConfig,
  TaskTypeEvaluationCriteria,
  TimeThreshold,
  TaskTypeInspectionConfig,
  TaskTypeInspectionCriteria,
  TaskTypeInspectionResult,
} = require('../task_type_config');
const { Taskbook } = require('../taskbook');
const { TaskbookSection } = require('../taskbook_section');
const { TaskbookTask } = require('../taskbook_task');

function inspectionTask({ criteria, result = null, id = 't1' }) {
  return new TaskbookTask({
    id,
    order: 0,
    type: TaskTypes.INSPECTION,
    title: 'Inspect',
    typeConfig: new TaskTypeConfig({
      inspectionConfig: new TaskTypeInspectionConfig({ criteria, result }),
    }),
  });
}

describe('deriveTriage (normative table)', () => {
  test('pass_fail', () => {
    const plain = new TaskTypeInspectionCriteria({ kind: InspectionKind.PASS_FAIL });
    const critical = new TaskTypeInspectionCriteria({
      kind: InspectionKind.PASS_FAIL,
      critical: true,
    });
    assert.equal(plain.deriveTriage({ ok: true }), InspectionTriage.PASS);
    assert.equal(plain.deriveTriage({ ok: false }), InspectionTriage.FAILING);
    assert.equal(
      critical.deriveTriage({ ok: false }),
      InspectionTriage.CRITICAL_FAILURE,
    );
    assert.throws(() => plain.deriveTriage(), TypeError);
  });

  test('measurement — air-tank PSI bands', () => {
    const c = new TaskTypeInspectionCriteria({
      kind: InspectionKind.MEASUREMENT,
      unit: 'PSI',
      passMin: 4500,
      degradedMin: 4000,
      degradedMax: 4500,
    });
    assert.equal(c.deriveTriage({ measuredValue: 4700 }), InspectionTriage.PASS);
    assert.equal(c.deriveTriage({ measuredValue: 4200 }), InspectionTriage.DEGRADED);
    assert.equal(c.deriveTriage({ measuredValue: 3800 }), InspectionTriage.FAILING);
    const critical = new TaskTypeInspectionCriteria({
      kind: InspectionKind.MEASUREMENT,
      passMin: 4500,
      critical: true,
    });
    assert.equal(
      critical.deriveTriage({ measuredValue: 3800 }),
      InspectionTriage.CRITICAL_FAILURE,
    );
  });

  test('measurement — no degraded band goes straight to failing', () => {
    const c = new TaskTypeInspectionCriteria({
      kind: InspectionKind.MEASUREMENT,
      passMin: 10,
      passMax: 20,
    });
    assert.equal(c.deriveTriage({ measuredValue: 15 }), InspectionTriage.PASS);
    assert.equal(c.deriveTriage({ measuredValue: 25 }), InspectionTriage.FAILING);
  });

  test('count', () => {
    const c = new TaskTypeInspectionCriteria({
      kind: InspectionKind.COUNT,
      expectedQuantity: 4,
      unit: 'AED pads',
    });
    assert.equal(c.deriveTriage({ foundQuantity: 4 }), InspectionTriage.PASS);
    assert.equal(c.deriveTriage({ foundQuantity: 6 }), InspectionTriage.PASS);
    assert.equal(c.deriveTriage({ foundQuantity: 2 }), InspectionTriage.DEGRADED);
    assert.equal(c.deriveTriage({ foundQuantity: 0 }), InspectionTriage.FAILING);
    const critical = new TaskTypeInspectionCriteria({
      kind: InspectionKind.COUNT,
      expectedQuantity: 4,
      critical: true,
    });
    assert.equal(
      critical.deriveTriage({ foundQuantity: 0 }),
      InspectionTriage.CRITICAL_FAILURE,
    );
    assert.throws(() => c.deriveTriage(), TypeError);
  });
});

describe('task computeStatus inspection branch', () => {
  const criteria = new TaskTypeInspectionCriteria({ kind: InspectionKind.PASS_FAIL });

  test('no observation → not_started', () => {
    const t = inspectionTask({ criteria });
    assert.equal(t.computeStatus(), WorkItemStatus.NOT_STARTED);
  });

  test('pass triage → complete', () => {
    const t = inspectionTask({
      criteria,
      result: new TaskTypeInspectionResult({
        triage: InspectionTriage.PASS,
        ok: true,
      }),
    });
    assert.equal(t.computeStatus(), WorkItemStatus.COMPLETE);
  });

  test('degraded triage behaves as passing completion', () => {
    const t = inspectionTask({
      criteria: new TaskTypeInspectionCriteria({
        kind: InspectionKind.COUNT,
        expectedQuantity: 4,
      }),
      result: new TaskTypeInspectionResult({
        triage: InspectionTriage.DEGRADED,
        foundQuantity: 2,
      }),
    });
    assert.equal(t.computeStatus(), WorkItemStatus.COMPLETE);
  });

  test('failing triage → complete_failed', () => {
    const t = inspectionTask({
      criteria,
      result: new TaskTypeInspectionResult({
        triage: InspectionTriage.FAILING,
        ok: false,
      }),
    });
    assert.equal(t.computeStatus(), WorkItemStatus.COMPLETE_FAILED);
  });
});

describe('section/book propagation', () => {
  const sectionWith = (t) =>
    new TaskbookSection({ id: 's1', order: 0, title: 'S', tasks: [t] });

  test('critical_failure propagates complete_failed to section + book', () => {
    const t = inspectionTask({
      criteria: new TaskTypeInspectionCriteria({
        kind: InspectionKind.PASS_FAIL,
        critical: true,
      }),
      result: new TaskTypeInspectionResult({
        triage: InspectionTriage.CRITICAL_FAILURE,
        ok: false,
      }),
    });
    const section = sectionWith(t).computeStatus();
    assert.equal(section.status, WorkItemStatus.COMPLETE_FAILED);

    const book = new Taskbook({ title: 'B', sections: [sectionWith(t)] })
      .computeStatus({ now: new Date(Date.UTC(2026, 6, 3)) });
    assert.equal(book.status, WorkItemStatus.COMPLETE_FAILED);
  });

  test('plain failing does NOT autofail the section', () => {
    const t = inspectionTask({
      criteria: new TaskTypeInspectionCriteria({ kind: InspectionKind.PASS_FAIL }),
      result: new TaskTypeInspectionResult({
        triage: InspectionTriage.FAILING,
        ok: false,
      }),
    });
    const section = sectionWith(t).computeStatus();
    assert.notEqual(section.status, WorkItemStatus.COMPLETE_FAILED);
    // The failed task still counts as done work.
    assert.equal(section.status, WorkItemStatus.OWNER_ACTION_NEEDED);
  });
});

describe('TimeThreshold', () => {
  test('hard threshold flips pass to fail (worst outcome wins)', () => {
    const c = new TaskTypeEvaluationCriteria({
      evaluationType: EvaluationType.PASS_FAIL,
      timeThreshold: new TimeThreshold({ durationMs: 90000, isHard: true }),
    });
    assert.equal(
      c.resolveOutcome(EvaluationOutcome.PASS, { observedDurationMs: 95000 }),
      EvaluationOutcome.FAIL,
    );
    assert.equal(
      c.resolveOutcome(EvaluationOutcome.PASS, { observedDurationMs: 85000 }),
      EvaluationOutcome.PASS,
    );
  });

  test('soft threshold never changes the outcome', () => {
    const c = new TaskTypeEvaluationCriteria({
      evaluationType: EvaluationType.PASS_FAIL,
      timeThreshold: new TimeThreshold({ durationMs: 90000 }),
    });
    assert.equal(
      c.resolveOutcome(EvaluationOutcome.PASS, { observedDurationMs: 95000 }),
      EvaluationOutcome.PASS,
    );
  });

  test('absent duration never changes the outcome', () => {
    const c = new TaskTypeEvaluationCriteria({
      evaluationType: EvaluationType.PASS_FAIL,
      timeThreshold: new TimeThreshold({ durationMs: 90000, isHard: true }),
    });
    assert.equal(c.resolveOutcome(EvaluationOutcome.PASS), EvaluationOutcome.PASS);
  });

  test('non-positive durationMs throws RangeError', () => {
    assert.throws(() => new TimeThreshold({ durationMs: 0 }), RangeError);
    assert.throws(() => new TimeThreshold({ durationMs: -1 }), RangeError);
  });
});
