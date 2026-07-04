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
const { WorkItemStatus, TaskTypes, EvaluationOutcome, EvaluationType } = require('./enums');
const { SignoffPolicy, signoffsOK } = require('./signoff_policy');
const {
  TaskTypeConfig,
  TaskTypeEvaluationConfig,
} = require('./task_type_config');
const { TaskbookSubtask } = require('./taskbook_subtask');

/**
 * A leaf work unit within a TaskbookSection. Polymorphic via `type`
 * and `typeConfig`.
 */
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
    signoffPolicy = [],
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
    // This tier's signoff policies. Authoritative for this tier; no
    // runtime inheritance from the section or book (named
    // `signoff_policy_override` in v0.1 — see MIGRATION Rule 1).
    this.signoffPolicy = Object.freeze([...signoffPolicy]);
    this.signoffsRequireAll = signoffsRequireAll;
    this.attachments = Object.freeze([...attachments]);
    this.notes = notes;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TaskbookTask({
      id: m.id,
      order: m.order,
      type: m.type ?? TaskTypes.TASK,
      typeConfig: m.type_config == null ? null : TaskTypeConfig.fromJSON(m.type_config),
      title: m.title,
      description: m.description ?? null,
      dueDate: readDate(m.due_date),
      status: m.status ?? WorkItemStatus.NOT_STARTED,
      progress: m.progress ?? 0.0,
      completion:
        m.completion == null
          ? new CompletionState()
          : CompletionState.fromJSON(m.completion),
      subtasks: (m.subtasks ?? []).map((s) => TaskbookSubtask.fromJSON(s)),
      signoffPolicy: (m.signoff_policy ?? []).map((p) => SignoffPolicy.fromJSON(p)),
      signoffsRequireAll: m.signoffs_require_all ?? true,
      attachments: (m.attachments ?? []).map((a) => Attachment.fromJSON(a)),
      notes: m.notes ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      id: this.id,
      order: this.order,
      type: this.type,
    };
    if (this.typeConfig != null) out.type_config = this.typeConfig.toJSON();
    out.title = this.title;
    if (this.description != null) out.description = this.description;
    if (this.dueDate != null) out.due_date = dateToIso(this.dueDate);
    out.status = this.status;
    out.progress = this.progress;
    out.completion = this.completion.toJSON();
    out.subtasks = this.subtasks.map((s) => s.toJSON());
    out.signoff_policy = this.signoffPolicy.map((p) => p.toJSON());
    out.signoffs_require_all = this.signoffsRequireAll;
    out.attachments = this.attachments.map((a) => a.toJSON());
    if (this.notes != null) out.notes = this.notes;
    return out;
  }

  /** Returns the computed status per schemas/taskbook_task.md waterfall. */
  computeStatus() {
    const isEval = this.type === TaskTypes.EVALUATION;
    const isInspection = this.type === TaskTypes.INSPECTION;
    const result = this.typeConfig?.evaluationConfig?.result ?? null;
    const outcome = result?.outcome ?? null;
    const hasOutcome = outcome != null;
    const hasEvalResult = isEval && result != null;
    const inspResult = this.typeConfig?.inspectionConfig?.result ?? null;
    const hasInspectionResult = isInspection && inspResult != null;

    const total = this.subtasks.length;
    const hasSubtasks = total > 0;
    const completedCount = this.subtasks.filter((s) => s.completion.complete)
      .length;
    const subtasksFinished = hasSubtasks && completedCount === total;
    const subtasksSatisfied = !hasSubtasks || subtasksFinished;

    const hasPolicy = this.signoffPolicy.length > 0;
    const sOK = signoffsOK(this.signoffPolicy, this.signoffsRequireAll);
    const signoffInProgress =
      hasPolicy && !sOK && this.signoffPolicy.some((p) => p.completed);
    const signoffsSatisfied = !hasPolicy || sOK;

    const workExists = hasSubtasks || hasPolicy;

    // Effective "complete" input: evaluation → outcome recorded;
    // inspection → observation recorded; other types → the owner marker.
    const isComplete = isEval
      ? hasOutcome
      : isInspection
        ? hasInspectionResult
        : this.completion.complete;
    const isPassingCompletion = isEval
      ? outcome === EvaluationOutcome.PASS
      : isInspection
        ? hasInspectionResult && !inspResult.isFailing
        : true;

    // 1. Complete / complete_failed
    if (isComplete && sOK) {
      return isPassingCompletion
        ? WorkItemStatus.COMPLETE
        : WorkItemStatus.COMPLETE_FAILED;
    }
    // 2. Pending validation
    if (
      (isComplete && !sOK) ||
      (isEval && this.completion.complete && !hasOutcome) ||
      (isInspection && this.completion.complete && !hasInspectionResult)
    ) {
      return WorkItemStatus.PENDING_VALIDATION;
    }
    // 3. Owner action needed (plain tasks only)
    if (
      !isEval &&
      !isInspection &&
      workExists &&
      subtasksSatisfied &&
      signoffsSatisfied &&
      !isComplete
    ) {
      return WorkItemStatus.OWNER_ACTION_NEEDED;
    }
    // 4. In progress
    if (
      completedCount > 0 ||
      signoffInProgress ||
      (hasEvalResult && !hasOutcome)
    ) {
      return WorkItemStatus.IN_PROGRESS;
    }
    // 5. Default
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
      inspectionConfig: this.typeConfig.inspectionConfig,
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
      signoffPolicy: this.signoffPolicy,
      signoffsRequireAll: this.signoffsRequireAll,
      attachments: this.attachments,
      notes: this.notes,
      ...overrides,
    });
  }
}

module.exports = { TaskbookTask };
