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

const { CompletionState } = require('./completion_state');
const { WorkItemStatus, TaskTypes } = require('./enums');
const { signoffsOK } = require('./signoff_policy');

class SectionScoringConfig {
  constructor({ minPassingPoints = null, minPassingPercentage = null } = {}) {
    this.minPassingPoints = minPassingPoints;
    this.minPassingPercentage = minPassingPercentage;
    Object.freeze(this);
  }
}

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
}

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
    signoffPolicyOverride = [],
    signoffsRequireAll = true,
    signoffPolicyCascades = false,
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
    this.signoffPolicyOverride = Object.freeze([...signoffPolicyOverride]);
    this.signoffsRequireAll = signoffsRequireAll;
    this.signoffPolicyCascades = signoffPolicyCascades;
    this.scoringConfig = scoringConfig;
    this.scoringSummary = scoringSummary;
    this.attachments = Object.freeze([...attachments]);
    this.notes = notes;
    Object.freeze(this);
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
        t.typeConfig?.evaluationConfig?.criteria?.evaluationType === 'scored',
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

    let effThresholdPoints = null;
    let effThresholdPercentage = null;
    const sc = this.scoringConfig;
    let minPct = sc?.minPassingPercentage ?? null;
    if (minPct != null && minPct > 1.0) minPct = minPct / 100.0;
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

    const hasPolicy = this.signoffPolicyOverride.length > 0;
    const sOK = signoffsOK(this.signoffPolicyOverride, this.signoffsRequireAll);
    const signoffInProgress =
      hasPolicy && !sOK && this.signoffPolicyOverride.some((p) => p.completed);

    const workExists = counts.total > 0 || hasPolicy;
    const isComplete = this.completion.complete;
    const hasAutofailFailure = computedTasks.some(
      (t) =>
        t.status === WorkItemStatus.COMPLETE_FAILED &&
        t.typeConfig?.evaluationConfig?.criteria?.autofail === true,
    );

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

    return new TaskbookSection({
      id: this.id,
      order: this.order,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      status,
      progress,
      completion: this.completion,
      tasks: computedTasks,
      signoffPolicyOverride: this.signoffPolicyOverride,
      signoffsRequireAll: this.signoffsRequireAll,
      signoffPolicyCascades: this.signoffPolicyCascades,
      scoringConfig: this.scoringConfig,
      scoringSummary: new SectionScoringSummary({
        pointsPossible,
        pointsAwarded,
        pointsRemaining,
        effectiveThresholdPoints: effThresholdPoints,
        effectiveThresholdPercentage: effThresholdPercentage,
      }),
      attachments: this.attachments,
      notes: this.notes,
    });
  }
}

module.exports = {
  TaskbookSection,
  SectionScoringConfig,
  SectionScoringSummary,
};
