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
const { WorkItemStatus, TaskTypes, EvaluationOutcome, EvaluationType } = require('./enums');
const { signoffsOK } = require('./signoff_policy');
const {
  TaskTypeConfig,
  TaskTypeEvaluationConfig,
} = require('./task_type_config');

class TaskbookTask {
  constructor({
    id,
    order,
    type = TaskTypes.TASK,
    typeConfig = null,
    title,
    description = null,
    dueDate = null,
    status = WorkItemStatus.NOT_STARTED,
    progress = 0.0,
    completion = new CompletionState(),
    subtasks = [],
    signoffPolicyOverride = [],
    signoffsRequireAll = true,
    attachments = [],
    notes = null,
  }) {
    this.id = id;
    this.order = order;
    this.type = type;
    this.typeConfig = typeConfig;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.status = status;
    this.progress = progress;
    this.completion = completion;
    this.subtasks = Object.freeze([...subtasks]);
    this.signoffPolicyOverride = Object.freeze([...signoffPolicyOverride]);
    this.signoffsRequireAll = signoffsRequireAll;
    this.attachments = Object.freeze([...attachments]);
    this.notes = notes;
    Object.freeze(this);
  }

  /** Returns the computed status per schemas/taskbook_task.md waterfall. */
  computeStatus() {
    const isEval = this.type === TaskTypes.EVALUATION;
    const result = this.typeConfig?.evaluationConfig?.result ?? null;
    const outcome = result?.outcome ?? null;
    const hasOutcome =
      outcome === EvaluationOutcome.PASS || outcome === EvaluationOutcome.FAIL;
    const hasEvalResult = isEval && result != null;

    const total = this.subtasks.length;
    const hasSubtasks = total > 0;
    const completedCount = this.subtasks.filter((s) => s.completion.complete)
      .length;
    const subtasksFinished = hasSubtasks && completedCount === total;
    const subtasksSatisfied = !hasSubtasks || subtasksFinished;

    const hasPolicy = this.signoffPolicyOverride.length > 0;
    const sOK = signoffsOK(this.signoffPolicyOverride, this.signoffsRequireAll);
    const signoffInProgress =
      hasPolicy && !sOK && this.signoffPolicyOverride.some((p) => p.completed);
    const signoffsSatisfied = !hasPolicy || sOK;

    const workExists = hasSubtasks || hasPolicy;
    const isComplete = isEval ? hasOutcome : this.completion.complete;
    const isPassingCompletion = isEval
      ? outcome === EvaluationOutcome.PASS
      : true;

    if (isComplete && sOK) {
      return isPassingCompletion
        ? WorkItemStatus.COMPLETE
        : WorkItemStatus.COMPLETE_FAILED;
    }
    if (
      (isComplete && !sOK) ||
      (isEval && this.completion.complete && !hasOutcome)
    ) {
      return WorkItemStatus.PENDING_VALIDATION;
    }
    if (
      !isEval &&
      workExists &&
      subtasksSatisfied &&
      signoffsSatisfied &&
      !isComplete
    ) {
      return WorkItemStatus.OWNER_ACTION_NEEDED;
    }
    if (
      completedCount > 0 ||
      signoffInProgress ||
      (hasEvalResult && !hasOutcome)
    ) {
      return WorkItemStatus.IN_PROGRESS;
    }
    return WorkItemStatus.NOT_STARTED;
  }

  /** Returns a new task with `pointsAwarded` clamped to `pointsPossible`. */
  withClampedPoints() {
    if (this.type !== TaskTypes.EVALUATION) return this;
    const criteria = this.typeConfig?.evaluationConfig?.criteria ?? null;
    const result = this.typeConfig?.evaluationConfig?.result ?? null;
    if (!criteria || !result) return this;
    if (criteria.evaluationType !== EvaluationType.SCORED) return this;
    const possible = criteria.pointsPossible ?? 0;
    const awarded = result.pointsAwarded ?? 0;
    if (awarded <= possible) return this;
    const newResult = result.withClampedPoints(possible);
    const newEvalConfig = new TaskTypeEvaluationConfig({
      criteria,
      result: newResult,
    });
    const newTypeConfig = new TaskTypeConfig({
      evaluationConfig: newEvalConfig,
      taskbookConfig: this.typeConfig.taskbookConfig,
      skillsheetConfig: this.typeConfig.skillsheetConfig,
      certConfig: this.typeConfig.certConfig,
    });
    return this._with({ typeConfig: newTypeConfig });
  }

  _with(overrides) {
    return new TaskbookTask({
      id: this.id,
      order: this.order,
      type: this.type,
      typeConfig: this.typeConfig,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      status: this.status,
      progress: this.progress,
      completion: this.completion,
      subtasks: this.subtasks,
      signoffPolicyOverride: this.signoffPolicyOverride,
      signoffsRequireAll: this.signoffsRequireAll,
      attachments: this.attachments,
      notes: this.notes,
      ...overrides,
    });
  }
}

module.exports = { TaskbookTask };
