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

const { readDate, dateToIso } = require('./codec');
const {
  EvaluationOutcome,
  InspectionKind,
  InspectionTriage,
} = require('./enums');
const { Source } = require('./source');

/**
 * How an evaluation is judged. Whether a failure here fails the whole
 * book is NOT a criteria concern: that is the task-level
 * `TaskbookTask.critical` flag (the v1.x `autofail` field retired in
 * v2.0).
 */
class TaskTypeEvaluationCriteria {
  constructor({
    evaluationType,
    pointsPossible = null,
    minPassingPoints = null,
    timeThreshold = null,
  }) {
    this.evaluationType = evaluationType; // EvaluationType enum value
    this.pointsPossible = pointsPossible;
    this.minPassingPoints = minPassingPoints;
    // Optional target completion time for timed evaluations. The
    // observed duration comes from the work item's
    // `start_and_end.duration_ms`; see resolveOutcome().
    this.timeThreshold = timeThreshold;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeEvaluationCriteria({
      evaluationType: m.evaluation_type,
      pointsPossible: m.points_possible ?? null,
      minPassingPoints: m.min_passing_points ?? null,
      timeThreshold:
        m.time_threshold == null ? null : TimeThreshold.fromJSON(m.time_threshold),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      evaluation_type: this.evaluationType,
    };
    if (this.pointsPossible != null) out.points_possible = this.pointsPossible;
    if (this.minPassingPoints != null) out.min_passing_points = this.minPassingPoints;
    if (this.timeThreshold != null) out.time_threshold = this.timeThreshold.toJSON();
    return out;
  }

  /**
   * Applies hard-threshold semantics to a determined outcome (worst
   * outcome wins, per schemas/task_type_config.md → `TimeThreshold`):
   * a `pass` with an observed duration over a hard threshold resolves
   * to `fail`. Soft thresholds and absent durations never change the
   * outcome.
   *
   * @param {string} outcome EvaluationOutcome enum value
   * @param {{observedDurationMs?: number|null}} [opts]
   * @returns {string} EvaluationOutcome enum value
   */
  resolveOutcome(outcome, { observedDurationMs = null } = {}) {
    const t = this.timeThreshold;
    if (t == null || !t.isHard || observedDurationMs == null) return outcome;
    if (observedDurationMs > t.durationMs) return EvaluationOutcome.FAIL;
    return outcome;
  }
}

/**
 * Target completion time for a timed evaluation ("must finish within
 * 90 seconds"). The observed duration comes from the work item's
 * `start_and_end.duration_ms`; this is the template-side target it is
 * evaluated against.
 */
class TimeThreshold {
  /**
   * @param {{durationMs: number, isHard?: boolean}} opts
   *   `durationMs` — target time in milliseconds. Must be positive.
   *   `isHard` — false (soft, default): display-only, outcome
   *   unaffected. true (hard): the outcome fails when the observed
   *   duration exceeds `durationMs` (worst outcome wins).
   */
  constructor({ durationMs, isHard = false }) {
    if (!(durationMs > 0)) {
      throw new RangeError('TimeThreshold.durationMs must be > 0');
    }
    this.durationMs = durationMs;
    this.isHard = isHard;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TimeThreshold({
      durationMs: m.duration_ms,
      isHard: m.is_hard ?? false,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    return {
      duration_ms: this.durationMs,
      is_hard: this.isHard,
    };
  }
}

class TaskTypeEvaluationResult {
  constructor({
    outcome = null,
    pointsAwarded = null,
    evaluatedBy = null,
    evaluatedAt = null,
    notes = null,
  } = {}) {
    this.outcome = outcome;
    this.pointsAwarded = pointsAwarded;
    this.evaluatedBy = evaluatedBy;
    this.evaluatedAt = evaluatedAt;
    this.notes = notes;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeEvaluationResult({
      outcome: m.outcome ?? null,
      pointsAwarded: m.points_awarded ?? null,
      evaluatedBy: m.evaluated_by ?? null,
      evaluatedAt: readDate(m.evaluated_at),
      notes: m.notes ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.outcome != null) out.outcome = this.outcome;
    if (this.pointsAwarded != null) out.points_awarded = this.pointsAwarded;
    if (this.evaluatedBy != null) out.evaluated_by = this.evaluatedBy;
    if (this.evaluatedAt != null) out.evaluated_at = dateToIso(this.evaluatedAt);
    if (this.notes != null) out.notes = this.notes;
    return out;
  }

  withClampedPoints(possible) {
    if (this.pointsAwarded == null || this.pointsAwarded <= possible) return this;
    return new TaskTypeEvaluationResult({
      outcome: this.outcome,
      pointsAwarded: possible,
      evaluatedBy: this.evaluatedBy,
      evaluatedAt: this.evaluatedAt,
      notes: this.notes,
    });
  }
}

class TaskTypeEvaluationConfig {
  constructor({ criteria = null, result = null } = {}) {
    this.criteria = criteria;
    this.result = result;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeEvaluationConfig({
      criteria:
        m.criteria == null ? null : TaskTypeEvaluationCriteria.fromJSON(m.criteria),
      result:
        m.result == null ? null : TaskTypeEvaluationResult.fromJSON(m.result),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.criteria != null) out.criteria = this.criteria.toJSON();
    if (this.result != null) out.result = this.result.toJSON();
    return out;
  }
}

/**
 * Configuration + result for `type = inspection` — a structured
 * observation recorded by a person: a yes/no condition check, a
 * measurement against pass bands, or a count against an expected
 * quantity. See schemas/task_type_config.md → `TaskTypeInspectionConfig`.
 */
class TaskTypeInspectionConfig {
  constructor({ criteria = null, result = null } = {}) {
    this.criteria = criteria;
    this.result = result;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeInspectionConfig({
      criteria:
        m.criteria == null ? null : TaskTypeInspectionCriteria.fromJSON(m.criteria),
      result:
        m.result == null ? null : TaskTypeInspectionResult.fromJSON(m.result),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.criteria != null) out.criteria = this.criteria.toJSON();
    if (this.result != null) out.result = this.result.toJSON();
    return out;
  }
}

/**
 * What an inspection checks and what passing looks like.
 * Kind-discriminated: `measurement` uses the band bounds, `count`
 * uses expectedQuantity, `pass_fail` uses neither. Whether a failing
 * observation is a critical failure of the book is NOT a criteria
 * concern: that is the task-level `TaskbookTask.critical` flag (the
 * v1.x `criteria.critical` field retired in v2.0), passed into
 * deriveTriage().
 */
class TaskTypeInspectionCriteria {
  /**
   * @param {object} opts
   *   `kind` — InspectionKind enum value.
   *   `unit` — display unit for `measurement` / `count` kinds, e.g. "PSI".
   *   `passMin`/`passMax` — `measurement` only: inclusive passing band;
   *   null bounds are open.
   *   `degradedMin`/`degradedMax` — `measurement` only: inclusive
   *   degraded band, consulted when the value misses the passing band.
   *   `expectedQuantity` — `count` only (required for that kind): the
   *   quantity expected.
   */
  constructor({
    kind,
    unit = null,
    passMin = null,
    passMax = null,
    degradedMin = null,
    degradedMax = null,
    expectedQuantity = null,
  }) {
    if (expectedQuantity != null && expectedQuantity < 0) {
      throw new RangeError('expectedQuantity must be >= 0');
    }
    this.kind = kind;
    this.unit = unit;
    this.passMin = passMin;
    this.passMax = passMax;
    this.degradedMin = degradedMin;
    this.degradedMax = degradedMax;
    this.expectedQuantity = expectedQuantity;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeInspectionCriteria({
      kind: m.kind,
      unit: m.unit ?? null,
      passMin: m.pass_min ?? null,
      passMax: m.pass_max ?? null,
      degradedMin: m.degraded_min ?? null,
      degradedMax: m.degraded_max ?? null,
      expectedQuantity: m.expected_quantity ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      kind: this.kind,
    };
    if (this.unit != null) out.unit = this.unit;
    if (this.passMin != null) out.pass_min = this.passMin;
    if (this.passMax != null) out.pass_max = this.passMax;
    if (this.degradedMin != null) out.degraded_min = this.degradedMin;
    if (this.degradedMax != null) out.degraded_max = this.degradedMax;
    if (this.expectedQuantity != null) out.expected_quantity = this.expectedQuantity;
    return out;
  }

  /**
   * Pure. Derives the triage for an observed value per the normative
   * rules in schemas/task_type_config.md → "Triage derivation".
   *
   * `critical` is the owning task's `TaskbookTask.critical` flag
   * (required): a failing observation on a critical task derives
   * `critical_failure`, otherwise `failing`. Pass the observation
   * matching `kind`: `ok` for `pass_fail`, `measuredValue` for
   * `measurement`, `foundQuantity` for `count`. Throws TypeError when
   * `critical` is not a boolean or the kind's observation is missing.
   *
   * @param {{critical: boolean, ok?: boolean|null, measuredValue?: number|null, foundQuantity?: number|null}} opts
   * @returns {string} InspectionTriage enum value
   */
  deriveTriage({ critical, ok = null, measuredValue = null, foundQuantity = null } = {}) {
    if (typeof critical !== 'boolean') {
      throw new TypeError('deriveTriage requires the task-level `critical` flag');
    }
    const worst = critical
      ? InspectionTriage.CRITICAL_FAILURE
      : InspectionTriage.FAILING;
    switch (this.kind) {
      case InspectionKind.PASS_FAIL:
        if (ok == null) {
          throw new TypeError('pass_fail inspection requires `ok`');
        }
        return ok ? InspectionTriage.PASS : worst;
      case InspectionKind.MEASUREMENT: {
        if (measuredValue == null) {
          throw new TypeError('measurement inspection requires a value');
        }
        const within = (v, lo, hi) =>
          (lo == null || v >= lo) && (hi == null || v <= hi);
        if (within(measuredValue, this.passMin, this.passMax)) {
          return InspectionTriage.PASS;
        }
        const hasDegradedBand = this.degradedMin != null || this.degradedMax != null;
        if (
          hasDegradedBand &&
          within(measuredValue, this.degradedMin, this.degradedMax)
        ) {
          return InspectionTriage.DEGRADED;
        }
        return worst;
      }
      case InspectionKind.COUNT: {
        if (foundQuantity == null) {
          throw new TypeError('count inspection requires a quantity');
        }
        const expected = this.expectedQuantity ?? 0;
        if (foundQuantity >= expected) return InspectionTriage.PASS;
        if (foundQuantity > 0) return InspectionTriage.DEGRADED;
        return worst;
      }
      default:
        throw new TypeError(`unknown inspection kind: ${this.kind}`);
    }
  }
}

/**
 * The recorded observation for an inspection task. `triage` is derived
 * at record time via TaskTypeInspectionCriteria#deriveTriage and stored
 * so readers don't recompute. The raw observation is recorded
 * **unclamped** — a 4000 PSI reading against a 3000 PSI floor
 * round-trips faithfully.
 */
class TaskTypeInspectionResult {
  /**
   * @param {object} opts
   *   `triage` — InspectionTriage enum value.
   *   `ok` — `pass_fail` kind: the observed yes/no.
   *   `measuredValue` — `measurement` kind: the observed value.
   *   `foundQuantity` — `count` kind: the observed quantity.
   *   `action` — recommended follow-up: replace, repair, or monitor.
   */
  constructor({
    triage,
    ok = null,
    measuredValue = null,
    foundQuantity = null,
    action = null,
    observedBy = null,
    observedAt = null,
    notes = null,
  }) {
    this.triage = triage;
    this.ok = ok;
    this.measuredValue = measuredValue;
    this.foundQuantity = foundQuantity;
    this.action = action;
    this.observedBy = observedBy;
    this.observedAt = observedAt;
    this.notes = notes;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeInspectionResult({
      triage: m.triage,
      ok: m.ok ?? null,
      measuredValue: m.measured_value ?? null,
      foundQuantity: m.found_quantity ?? null,
      action: m.action ?? null,
      observedBy: m.observed_by ?? null,
      observedAt: readDate(m.observed_at),
      notes: m.notes ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = { triage: this.triage };
    if (this.ok != null) out.ok = this.ok;
    if (this.measuredValue != null) out.measured_value = this.measuredValue;
    if (this.foundQuantity != null) out.found_quantity = this.foundQuantity;
    if (this.action != null) out.action = this.action;
    if (this.observedBy != null) out.observed_by = this.observedBy;
    if (this.observedAt != null) out.observed_at = dateToIso(this.observedAt);
    if (this.notes != null) out.notes = this.notes;
    return out;
  }

  /**
   * True when the triage terminates the task in a failed state
   * (`failing` or `critical_failure`).
   */
  get isFailing() {
    return (
      this.triage === InspectionTriage.FAILING ||
      this.triage === InspectionTriage.CRITICAL_FAILURE
    );
  }
}

class TaskTypeTaskbookConfig {
  constructor({ displayName = null, source = null, requireComplete = true } = {}) {
    this.displayName = displayName;
    this.source = source;
    this.requireComplete = requireComplete;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeTaskbookConfig({
      displayName: m.display_name ?? null,
      source: m.source == null ? null : Source.fromJSON(m.source),
      requireComplete: m.require_complete ?? true,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.displayName != null) out.display_name = this.displayName;
    if (this.source != null) out.source = this.source.toJSON();
    out.require_complete = this.requireComplete;
    return out;
  }
}

class TaskTypeSkillsheetConfig {
  constructor({ displayName = null, source = null, requireComplete = true } = {}) {
    this.displayName = displayName;
    this.source = source;
    this.requireComplete = requireComplete;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeSkillsheetConfig({
      displayName: m.display_name ?? null,
      source: m.source == null ? null : Source.fromJSON(m.source),
      requireComplete: m.require_complete ?? true,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.displayName != null) out.display_name = this.displayName;
    if (this.source != null) out.source = this.source.toJSON();
    out.require_complete = this.requireComplete;
    return out;
  }
}

class TaskTypeCertConfig {
  constructor({ acceptedCertTypes, requireActive = true }) {
    this.acceptedCertTypes = Object.freeze([...acceptedCertTypes]);
    this.requireActive = requireActive;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeCertConfig({
      acceptedCertTypes: (m.accepted_cert_types ?? []).map((e) =>
        AcceptedCertType.fromJSON(e),
      ),
      requireActive: m.require_active ?? true,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    return {
      accepted_cert_types: this.acceptedCertTypes.map((t) => t.toJSON()),
      require_active: this.requireActive,
    };
  }
}

/**
 * A single entry in TaskTypeCertConfig.acceptedCertTypes. Follows the
 * display_name + source snapshot pattern used by the other reference
 * configs.
 */
class AcceptedCertType {
  constructor({ displayName = null, source = null } = {}) {
    this.displayName = displayName;
    this.source = source;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new AcceptedCertType({
      displayName: m.display_name ?? null,
      source: m.source == null ? null : Source.fromJSON(m.source),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.displayName != null) out.display_name = this.displayName;
    if (this.source != null) out.source = this.source.toJSON();
    return out;
  }
}

/** Polymorphic configuration for a TaskbookTask. */
class TaskTypeConfig {
  constructor({
    evaluationConfig = null,
    inspectionConfig = null,
    taskbookConfig = null,
    skillsheetConfig = null,
    certConfig = null,
  } = {}) {
    this.evaluationConfig = evaluationConfig;
    this.inspectionConfig = inspectionConfig;
    this.taskbookConfig = taskbookConfig;
    this.skillsheetConfig = skillsheetConfig;
    this.certConfig = certConfig;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskTypeConfig({
      evaluationConfig:
        m.evaluation_config == null
          ? null
          : TaskTypeEvaluationConfig.fromJSON(m.evaluation_config),
      inspectionConfig:
        m.inspection_config == null
          ? null
          : TaskTypeInspectionConfig.fromJSON(m.inspection_config),
      taskbookConfig:
        m.taskbook_config == null
          ? null
          : TaskTypeTaskbookConfig.fromJSON(m.taskbook_config),
      skillsheetConfig:
        m.skillsheet_config == null
          ? null
          : TaskTypeSkillsheetConfig.fromJSON(m.skillsheet_config),
      certConfig:
        m.cert_config == null ? null : TaskTypeCertConfig.fromJSON(m.cert_config),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.evaluationConfig != null) out.evaluation_config = this.evaluationConfig.toJSON();
    if (this.inspectionConfig != null) out.inspection_config = this.inspectionConfig.toJSON();
    if (this.taskbookConfig != null) out.taskbook_config = this.taskbookConfig.toJSON();
    if (this.skillsheetConfig != null) out.skillsheet_config = this.skillsheetConfig.toJSON();
    if (this.certConfig != null) out.cert_config = this.certConfig.toJSON();
    return out;
  }
}

module.exports = {
  TaskTypeConfig,
  TaskTypeEvaluationConfig,
  TaskTypeEvaluationCriteria,
  TimeThreshold,
  TaskTypeEvaluationResult,
  TaskTypeInspectionConfig,
  TaskTypeInspectionCriteria,
  TaskTypeInspectionResult,
  TaskTypeTaskbookConfig,
  TaskTypeSkillsheetConfig,
  TaskTypeCertConfig,
  AcceptedCertType,
};
