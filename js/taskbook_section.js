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

const { Attachment } = require('./attachment');
const { readDate, dateToIso } = require('./codec');
const { CompletionState } = require('./completion_state');
const {
  WorkItemStatus,
  TaskTypes,
  EvaluationType,
  InspectionTriage,
} = require('./enums');
const { SignoffPolicy, signoffsOK } = require('./signoff_policy');
const { TaskbookTask } = require('./taskbook_task');

/**
 * Section-level scoring threshold.
 *
 * `minPassingPercentage` must be in [0.0, 1.0] (a fraction, not a
 * percent value) — see MIGRATION Rule 4.
 */
class SectionScoringConfig {
  constructor({ minPassingPoints = null, minPassingPercentage = null } = {}) {
    if (
      minPassingPercentage != null &&
      (minPassingPercentage < 0.0 || minPassingPercentage > 1.0)
    ) {
      throw new RangeError('minPassingPercentage must be in [0.0, 1.0]');
    }
    this.minPassingPoints = minPassingPoints;
    this.minPassingPercentage = minPassingPercentage;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new SectionScoringConfig({
      minPassingPoints: m.min_passing_points ?? null,
      minPassingPercentage: m.min_passing_percentage ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.minPassingPoints != null) out.min_passing_points = this.minPassingPoints;
    if (this.minPassingPercentage != null) {
      out.min_passing_percentage = this.minPassingPercentage;
    }
    return out;
  }
}

/** Denormalized scoring totals for a section. */
class SectionScoringSummary {
  constructor({
    pointsPossible,
    pointsAwarded,
    pointsRemaining,
    effectiveThresholdPoints = null,
    effectiveThresholdPercentage = null,
  }) {
    this.pointsPossible = pointsPossible;
    this.pointsAwarded = pointsAwarded;
    this.pointsRemaining = pointsRemaining;
    this.effectiveThresholdPoints = effectiveThresholdPoints;
    this.effectiveThresholdPercentage = effectiveThresholdPercentage;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new SectionScoringSummary({
      pointsPossible: m.points_possible ?? 0.0,
      pointsAwarded: m.points_awarded ?? 0.0,
      pointsRemaining: m.points_remaining ?? 0.0,
      effectiveThresholdPoints: m.effective_threshold_points ?? null,
      effectiveThresholdPercentage: m.effective_threshold_percentage ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      points_possible: this.pointsPossible,
      points_awarded: this.pointsAwarded,
      points_remaining: this.pointsRemaining,
    };
    if (this.effectiveThresholdPoints != null) {
      out.effective_threshold_points = this.effectiveThresholdPoints;
    }
    if (this.effectiveThresholdPercentage != null) {
      out.effective_threshold_percentage = this.effectiveThresholdPercentage;
    }
    return out;
  }
}

/** An ordered group of tasks within a Taskbook. */
class TaskbookSection {
  constructor({
    id,
    order,
    title,
    description = null,
    dueDate = null,
    status = WorkItemStatus.NOT_STARTED,
    progress = 0.0,
    completion = new CompletionState(),
    tasks = [],
    signoffPolicy = [],
    signoffsRequireAll = true,
    scoringConfig = null,
    scoringSummary = null,
    attachments = [],
    notes = null,
  }) {
    this.id = id;
    this.order = order;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.status = status;
    this.progress = progress;
    this.completion = completion;
    this.tasks = Object.freeze([...tasks]);
    // This tier's signoff policies. Authoritative for this tier; no
    // runtime inheritance from the book (named `signoff_policy_override`
    // in v0.1 — see MIGRATION Rule 1).
    this.signoffPolicy = Object.freeze([...signoffPolicy]);
    this.signoffsRequireAll = signoffsRequireAll;
    this.scoringConfig = scoringConfig;
    this.scoringSummary = scoringSummary;
    this.attachments = Object.freeze([...attachments]);
    this.notes = notes;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskbookSection({
      id: m.id,
      order: m.order,
      title: m.title,
      description: m.description ?? null,
      dueDate: readDate(m.due_date),
      status: m.status ?? WorkItemStatus.NOT_STARTED,
      progress: m.progress ?? 0.0,
      completion:
        m.completion == null
          ? new CompletionState()
          : CompletionState.fromJSON(m.completion),
      tasks: (m.tasks ?? []).map((t) => TaskbookTask.fromJSON(t)),
      signoffPolicy: (m.signoff_policy ?? []).map((p) => SignoffPolicy.fromJSON(p)),
      signoffsRequireAll: m.signoffs_require_all ?? true,
      scoringConfig:
        m.scoring_config == null
          ? null
          : SectionScoringConfig.fromJSON(m.scoring_config),
      scoringSummary:
        m.scoring_summary == null
          ? null
          : SectionScoringSummary.fromJSON(m.scoring_summary),
      attachments: (m.attachments ?? []).map((a) => Attachment.fromJSON(a)),
      notes: m.notes ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      id: this.id,
      order: this.order,
      title: this.title,
    };
    if (this.description != null) out.description = this.description;
    if (this.dueDate != null) out.due_date = dateToIso(this.dueDate);
    out.status = this.status;
    out.progress = this.progress;
    out.completion = this.completion.toJSON();
    out.tasks = this.tasks.map((t) => t.toJSON());
    out.signoff_policy = this.signoffPolicy.map((p) => p.toJSON());
    out.signoffs_require_all = this.signoffsRequireAll;
    if (this.scoringConfig != null) out.scoring_config = this.scoringConfig.toJSON();
    if (this.scoringSummary != null) out.scoring_summary = this.scoringSummary.toJSON();
    out.attachments = this.attachments.map((a) => a.toJSON());
    if (this.notes != null) out.notes = this.notes;
    return out;
  }

  /** Returns a new section with its status, progress, tasks, and scoring summary recomputed. */
  computeStatus() {
    // Recompute child tasks.
    const computedTasks = this.tasks.map((t) => {
      const clamped = t.withClampedPoints();
      const status = clamped.computeStatus();
      const progress =
        status === WorkItemStatus.COMPLETE ||
        status === WorkItemStatus.COMPLETE_FAILED
          ? 1.0
          : clamped.subtasks.length === 0
            ? 0.0
            : clamped.subtasks.filter((s) => s.completion.complete).length /
              clamped.subtasks.length;
      return clamped._with({ status, progress });
    });

    // Scoring.
    const scoredTasks = computedTasks.filter(
      (t) =>
        t.type === TaskTypes.EVALUATION &&
        t.typeConfig?.evaluationConfig?.criteria?.evaluationType === EvaluationType.SCORED,
    );

    const pointsPossible = scoredTasks.reduce(
      (sum, t) =>
        sum + (t.typeConfig.evaluationConfig.criteria.pointsPossible || 0),
      0,
    );
    const pointsAwarded = scoredTasks
      .filter((t) => t.typeConfig.evaluationConfig.result != null)
      .reduce(
        (sum, t) =>
          sum + (t.typeConfig.evaluationConfig.result.pointsAwarded || 0),
        0,
      );
    const pointsRemaining = scoredTasks
      .filter((t) => t.typeConfig.evaluationConfig.result == null)
      .reduce(
        (sum, t) =>
          sum + (t.typeConfig.evaluationConfig.criteria.pointsPossible || 0),
        0,
      );

    const maxPossible = pointsAwarded + pointsRemaining;
    const allScoredDone = scoredTasks.length > 0 && pointsRemaining === 0;

    // Thresholds. `minPassingPercentage` is validated to [0.0, 1.0] at
    // construction (MIGRATION Rule 4) — no legacy ÷100 normalization.
    let effThresholdPoints = null;
    let effThresholdPercentage = null;
    const sc = this.scoringConfig;
    const minPct = sc?.minPassingPercentage ?? null;
    if (sc?.minPassingPoints != null) {
      effThresholdPoints = sc.minPassingPoints;
      if (pointsPossible > 0) effThresholdPercentage = sc.minPassingPoints / pointsPossible;
    } else if (minPct != null) {
      effThresholdPercentage = minPct;
      if (pointsPossible > 0) effThresholdPoints = Math.ceil(minPct * pointsPossible);
    }

    const hasThreshold = effThresholdPoints != null;
    const cannotPass = hasThreshold && maxPossible < effThresholdPoints;
    const failedPoints =
      hasThreshold && allScoredDone && pointsAwarded < effThresholdPoints;

    // Counts.
    const counts = {
      total: computedTasks.length,
      complete: computedTasks.filter((t) => t.status === WorkItemStatus.COMPLETE).length,
      completeFailed: computedTasks.filter((t) => t.status === WorkItemStatus.COMPLETE_FAILED).length,
      pending: computedTasks.filter((t) => t.status === WorkItemStatus.PENDING_VALIDATION).length,
      ownerAction: computedTasks.filter((t) => t.status === WorkItemStatus.OWNER_ACTION_NEEDED).length,
      inProgress: computedTasks.filter((t) => t.status === WorkItemStatus.IN_PROGRESS).length,
    };
    const doneCount = counts.complete + counts.completeFailed;
    const allTasksDone = counts.total === 0 || doneCount === counts.total;

    const hasPolicy = this.signoffPolicy.length > 0;
    const sOK = signoffsOK(this.signoffPolicy, this.signoffsRequireAll);
    const signoffInProgress =
      hasPolicy && !sOK && this.signoffPolicy.some((p) => p.completed);

    const workExists = counts.total > 0 || hasPolicy;
    const isComplete = this.completion.complete;

    // Autofail propagation: evaluation autofail + inspection
    // critical_failure (the inspection counterpart — see
    // schemas/taskbook_section.md).
    const hasAutofailFailure = computedTasks.some((t) => {
      if (t.status !== WorkItemStatus.COMPLETE_FAILED) return false;
      if (t.typeConfig?.evaluationConfig?.criteria?.autofail === true) return true;
      return (
        t.typeConfig?.inspectionConfig?.result?.triage ===
        InspectionTriage.CRITICAL_FAILURE
      );
    });

    let status = WorkItemStatus.NOT_STARTED;
    if (hasAutofailFailure) status = WorkItemStatus.COMPLETE_FAILED;
    else if (cannotPass) status = WorkItemStatus.COMPLETE_FAILED;
    else if (failedPoints) status = WorkItemStatus.COMPLETE_FAILED;
    else if (isComplete && sOK) status = WorkItemStatus.COMPLETE;
    else if (isComplete && !sOK) status = WorkItemStatus.PENDING_VALIDATION;
    else if (workExists && allTasksDone && sOK && !isComplete)
      status = WorkItemStatus.OWNER_ACTION_NEEDED;
    else if (
      counts.complete > 0 ||
      counts.completeFailed > 0 ||
      counts.pending > 0 ||
      counts.ownerAction > 0 ||
      counts.inProgress > 0 ||
      signoffInProgress
    )
      status = WorkItemStatus.IN_PROGRESS;

    let progress;
    if (status === WorkItemStatus.COMPLETE || status === WorkItemStatus.COMPLETE_FAILED) {
      progress = 1.0;
    } else if (counts.total > 0) {
      progress = computedTasks.reduce((a, t) => a + (t.progress || 0), 0) / counts.total;
    } else {
      progress = 0.0;
    }

    return this._with({
      status,
      progress,
      tasks: computedTasks,
      scoringSummary: new SectionScoringSummary({
        pointsPossible,
        pointsAwarded,
        pointsRemaining,
        effectiveThresholdPoints: effThresholdPoints,
        effectiveThresholdPercentage: effThresholdPercentage,
      }),
    });
  }

  _with(overrides) {
    return new TaskbookSection({
      id: this.id,
      order: this.order,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      status: this.status,
      progress: this.progress,
      completion: this.completion,
      tasks: this.tasks,
      signoffPolicy: this.signoffPolicy,
      signoffsRequireAll: this.signoffsRequireAll,
      scoringConfig: this.scoringConfig,
      scoringSummary: this.scoringSummary,
      attachments: this.attachments,
      notes: this.notes,
      ...overrides,
    });
  }
}

module.exports = {
  TaskbookSection,
  SectionScoringConfig,
  SectionScoringSummary,
};
