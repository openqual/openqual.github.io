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
const { neverExpireDate, openqualSchemaVersion } = require('./constants');
const { WorkItemStatus, TaskbookTypes, TaskTypes, EvaluationType, ScoringMode } = require('./enums');
const { signoffsOK } = require('./signoff_policy');
const { TaskbookSection } = require('./taskbook_section');
const { TaskbookTask } = require('./taskbook_task');
const { TaskbookSummary, BookScoringSummary } = require('./taskbook_summary');

const ID_CHARS =
  'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';

function _generateId() {
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return out;
}

class Taskbook {
  constructor({
    schemaVersion = openqualSchemaVersion,
    taskbookType = TaskbookTypes.TASKBOOK,
    title,
    description = null,
    dueDate = null,
    status = WorkItemStatus.NOT_STARTED,
    progress = 0.0,
    completion = new CompletionState(),
    assignment = null,
    sections = [],
    signoffPolicy = [],
    signoffsRequireAll = true,
    signoffPolicyCascades = false,
    attachments = [],
    notes = null,
    evaluationConfig = null,
    startAndEnd = null,
    taskbookSummary = null,
    importStatus = null,
    importNotes = null,
  }) {
    this.schemaVersion = schemaVersion;
    this.taskbookType = taskbookType;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.status = status;
    this.progress = progress;
    this.completion = completion;
    this.assignment = assignment;
    this.sections = Object.freeze([...sections]);
    this.signoffPolicy = Object.freeze([...signoffPolicy]);
    this.signoffsRequireAll = signoffsRequireAll;
    this.signoffPolicyCascades = signoffPolicyCascades;
    this.attachments = Object.freeze([...attachments]);
    this.notes = notes;
    this.evaluationConfig = evaluationConfig;
    this.startAndEnd = startAndEnd;
    this.taskbookSummary = taskbookSummary;
    this.importStatus = importStatus;
    this.importNotes = importNotes;
    Object.freeze(this);
  }

  /** Parses a JSON string (typically from an AI import). Returns a safe error Taskbook on failure. */
  static fromExternalJson(jsonString, { idGenerator = _generateId } = {}) {
    if (!jsonString) return new Taskbook({ title: '' });
    const farFuture = neverExpireDate;
    try {
      const cleaned = String(jsonString).replace(/```json/g, '').replace(/```/g, '');
      const data = JSON.parse(cleaned);

      const sections = [];
      if (Array.isArray(data.sections)) {
        data.sections.forEach((sectionData, si) => {
          const tasks = [];
          if (Array.isArray(sectionData.tasks)) {
            sectionData.tasks.forEach((taskData, ti) => {
              tasks.push(
                new TaskbookTask({
                  id: idGenerator(),
                  order: ti,
                  type: TaskTypes.TASK,
                  title: taskData.title || 'Untitled Task',
                  description: taskData.description || null,
                  dueDate: farFuture,
                }),
              );
            });
          }
          sections.push(
            new TaskbookSection({
              id: idGenerator(),
              order: si,
              title: sectionData.title || 'Untitled Section',
              description: sectionData.description || null,
              dueDate: farFuture,
              tasks,
            }),
          );
        });
      }

      return new Taskbook({
        title: data.title || 'New Task Book',
        description: data.description || null,
        sections,
        importNotes: data.metadata?.extractionNotes || null,
        importStatus: data.metadata?.estimatedCompleteness || null,
      });
    } catch (e) {
      return new Taskbook({
        title: 'Error Parsing Import',
        description: `Details: ${e.message || e}`,
      });
    }
  }

  /**
   * Pure. Returns a new Taskbook with exactly one node's completion
   * marked complete at `now`. Returns the receiver unchanged if the
   * identified node is not found.
   */
  markComplete({ sectionId = null, taskId = null, subtaskId = null, now }) {
    if (!sectionId && !taskId && !subtaskId) {
      return this._with({ completion: this.completion.markComplete(now) });
    }
    if (!sectionId) return this;
    const sIdx = this.sections.findIndex((s) => s.id === sectionId);
    if (sIdx === -1) return this;
    const section = this.sections[sIdx];

    if (!taskId) {
      const updated = _withSection(section, {
        completion: section.completion.markComplete(now),
      });
      return this._with({ sections: _replace(this.sections, sIdx, updated) });
    }
    const tIdx = section.tasks.findIndex((t) => t.id === taskId);
    if (tIdx === -1) return this;
    const task = section.tasks[tIdx];

    if (!subtaskId) {
      const updatedTask = task._with({
        completion: task.completion.markComplete(now),
      });
      const updatedSection = _withSection(section, {
        tasks: _replace(section.tasks, tIdx, updatedTask),
      });
      return this._with({ sections: _replace(this.sections, sIdx, updatedSection) });
    }
    const stIdx = task.subtasks.findIndex((st) => st.id === subtaskId);
    if (stIdx === -1) return this;
    const subtask = task.subtasks[stIdx];
    const updatedSubtask = subtask.withCompletion(subtask.completion.markComplete(now));
    const updatedTask = task._with({
      subtasks: _replace(task.subtasks, stIdx, updatedSubtask),
    });
    const updatedSection = _withSection(section, {
      tasks: _replace(section.tasks, tIdx, updatedTask),
    });
    return this._with({ sections: _replace(this.sections, sIdx, updatedSection) });
  }

  /**
   * Pure. Computes the book's status, progress, and taskbook_summary,
   * and returns an updated Taskbook with every section recomputed via
   * TaskbookSection.computeStatus so the full tree is consistent.
   * See schemas/taskbook.md for the full waterfall.
   */
  computeStatus({ now }) {
    const computedSections = this.sections.map((s) => s.computeStatus());

    const allTasks = [];
    for (const s of computedSections) {
      for (const t of s.tasks) allTasks.push(t);
    }

    const scoredTasks = allTasks.filter((t) => {
      const c = t.typeConfig?.evaluationConfig?.criteria;
      return t.type === TaskTypes.EVALUATION && c?.evaluationType === EvaluationType.SCORED;
    });

    const pointsPossible = scoredTasks.reduce(
      (sum, t) => sum + (t.typeConfig?.evaluationConfig?.criteria?.pointsPossible ?? 0),
      0,
    );
    const pointsAwarded = scoredTasks
      .filter((t) => t.typeConfig?.evaluationConfig?.result != null)
      .reduce(
        (sum, t) => sum + (t.typeConfig?.evaluationConfig?.result?.pointsAwarded ?? 0),
        0,
      );
    const pointsRemaining = scoredTasks
      .filter((t) => t.typeConfig?.evaluationConfig?.result == null)
      .reduce(
        (sum, t) => sum + (t.typeConfig?.evaluationConfig?.criteria?.pointsPossible ?? 0),
        0,
      );

    const mode = this.evaluationConfig?.scoringMode ?? ScoringMode.AGGREGATED;
    const isAggregated = mode === ScoringMode.AGGREGATED;
    const isPerSection = mode === ScoringMode.PER_SECTION;

    let effThresholdPoints = null;
    let effThresholdPercentage = null;
    if (isAggregated) {
      const minPts = this.evaluationConfig?.scoringConfig?.minPassingPoints ?? null;
      let minPct = this.evaluationConfig?.scoringConfig?.minPassingPercentage ?? null;
      if (minPct != null && minPct > 1.0) minPct = minPct / 100.0;
      if (minPts != null) {
        effThresholdPoints = minPts;
        if (pointsPossible > 0) effThresholdPercentage = minPts / pointsPossible;
      } else if (minPct != null) {
        effThresholdPercentage = minPct;
        if (pointsPossible > 0) effThresholdPoints = Math.ceil(minPct * pointsPossible);
      }
    }

    const maxPossibleScore = pointsAwarded + pointsRemaining;
    const allScoredEvalsDone = scoredTasks.length > 0 && pointsRemaining === 0;
    const hasThreshold = effThresholdPoints != null;
    const cannotPass = isAggregated && hasThreshold && maxPossibleScore < effThresholdPoints;
    const failedPoints =
      isAggregated && hasThreshold && allScoredEvalsDone && pointsAwarded < effThresholdPoints;

    const hasAutofailFailure = allTasks.some((t) => {
      if (t.status !== WorkItemStatus.COMPLETE_FAILED) return false;
      return t.typeConfig?.evaluationConfig?.criteria?.autofail === true;
    });
    const hasFailedSection = computedSections.some(
      (s) => s.status === WorkItemStatus.COMPLETE_FAILED,
    );

    const hasPolicy = this.signoffPolicy.length > 0;
    const signoffOK = signoffsOK(this.signoffPolicy, this.signoffsRequireAll);
    const signoffInProgress =
      hasPolicy && !signoffOK && this.signoffPolicy.some((p) => p.completed);

    const sectionsTotal = computedSections.length;
    const sectionsDone = computedSections.filter(
      (s) =>
        s.status === WorkItemStatus.COMPLETE ||
        s.status === WorkItemStatus.COMPLETE_FAILED,
    ).length;
    const allSectionsDone = sectionsTotal === 0 || sectionsDone === sectionsTotal;
    const anySectionBeyondNotStarted = computedSections.some(
      (s) => s.status !== WorkItemStatus.NOT_STARTED,
    );

    const workExists = sectionsTotal > 0 || hasPolicy;
    const isComplete = this.completion.complete;

    let newStatus = WorkItemStatus.NOT_STARTED;
    if (hasAutofailFailure) newStatus = WorkItemStatus.COMPLETE_FAILED;
    else if (cannotPass) newStatus = WorkItemStatus.COMPLETE_FAILED;
    else if (failedPoints) newStatus = WorkItemStatus.COMPLETE_FAILED;
    else if (isPerSection && hasFailedSection) newStatus = WorkItemStatus.COMPLETE_FAILED;
    else if (isComplete && signoffOK) newStatus = WorkItemStatus.COMPLETE;
    else if (isComplete && !signoffOK) newStatus = WorkItemStatus.PENDING_VALIDATION;
    else if (workExists && allSectionsDone && signoffOK && !isComplete)
      newStatus = WorkItemStatus.OWNER_ACTION_NEEDED;
    else if (anySectionBeyondNotStarted || signoffInProgress)
      newStatus = WorkItemStatus.IN_PROGRESS;

    let newProgress;
    if (
      newStatus === WorkItemStatus.COMPLETE ||
      newStatus === WorkItemStatus.COMPLETE_FAILED
    ) {
      newProgress = 1.0;
    } else if (sectionsTotal > 0) {
      newProgress =
        computedSections.reduce((a, s) => a + s.progress, 0) / sectionsTotal;
    } else {
      newProgress = 0.0;
    }

    const countTasks = (s) => allTasks.filter((t) => t.status === s).length;
    const countSections = (s) =>
      computedSections.filter((sec) => sec.status === s).length;

    let signoffsRequiredTotal = this.signoffPolicy.length;
    let signoffsCompletedTotal = this.signoffPolicy.filter((p) => p.completed).length;
    for (const s of computedSections) {
      signoffsRequiredTotal += s.signoffPolicyOverride.length;
      signoffsCompletedTotal += s.signoffPolicyOverride.filter((p) => p.completed).length;
      for (const t of s.tasks) {
        signoffsRequiredTotal += t.signoffPolicyOverride.length;
        signoffsCompletedTotal += t.signoffPolicyOverride.filter((p) => p.completed).length;
      }
    }

    const scoringSummary =
      scoredTasks.length === 0
        ? null
        : new BookScoringSummary({
            pointsPossible,
            pointsAwarded,
            pointsRemaining,
            effectiveThresholdPoints,
            effectiveThresholdPercentage,
          });

    const summary = new TaskbookSummary({
      tasksTotal: allTasks.length,
      tasksNotStarted: countTasks(WorkItemStatus.NOT_STARTED),
      tasksInProgress: countTasks(WorkItemStatus.IN_PROGRESS),
      tasksOwnerActionNeeded: countTasks(WorkItemStatus.OWNER_ACTION_NEEDED),
      tasksPendingValidation: countTasks(WorkItemStatus.PENDING_VALIDATION),
      tasksComplete: countTasks(WorkItemStatus.COMPLETE),
      tasksCompleteFailed: countTasks(WorkItemStatus.COMPLETE_FAILED),
      sectionsTotal,
      sectionsNotStarted: countSections(WorkItemStatus.NOT_STARTED),
      sectionsInProgress: countSections(WorkItemStatus.IN_PROGRESS),
      sectionsOwnerActionNeeded: countSections(WorkItemStatus.OWNER_ACTION_NEEDED),
      sectionsPendingValidation: countSections(WorkItemStatus.PENDING_VALIDATION),
      sectionsComplete: countSections(WorkItemStatus.COMPLETE),
      sectionsCompleteFailed: countSections(WorkItemStatus.COMPLETE_FAILED),
      taskbookOwnerActionNeeded: newStatus === WorkItemStatus.OWNER_ACTION_NEEDED,
      signoffsRequiredTotal,
      signoffsCompletedTotal,
      scoringSummary,
      lastModified: now,
    });

    return this._with({
      sections: computedSections,
      status: newStatus,
      progress: newProgress,
      taskbookSummary: summary,
    });
  }

  /**
   * Pure. Returns 1.0 when status is complete or complete_failed;
   * otherwise the arithmetic mean of child sections' progress, or 0.0
   * when the book has no sections.
   */
  computeProgress() {
    if (
      this.status === WorkItemStatus.COMPLETE ||
      this.status === WorkItemStatus.COMPLETE_FAILED
    ) {
      return 1.0;
    }
    if (this.sections.length === 0) return 0.0;
    return (
      this.sections.reduce((a, s) => a + s.progress, 0) / this.sections.length
    );
  }

  _with(overrides) {
    return new Taskbook({
      taskbookType: this.taskbookType,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      status: this.status,
      progress: this.progress,
      completion: this.completion,
      assignment: this.assignment,
      sections: this.sections,
      signoffPolicy: this.signoffPolicy,
      signoffsRequireAll: this.signoffsRequireAll,
      signoffPolicyCascades: this.signoffPolicyCascades,
      attachments: this.attachments,
      notes: this.notes,
      evaluationConfig: this.evaluationConfig,
      startAndEnd: this.startAndEnd,
      taskbookSummary: this.taskbookSummary,
      importStatus: this.importStatus,
      importNotes: this.importNotes,
      ...overrides,
    });
  }
}

function _replace(arr, idx, value) {
  const out = [...arr];
  out[idx] = value;
  return out;
}

function _withSection(section, overrides) {
  return new TaskbookSection({
    id: section.id,
    order: section.order,
    title: section.title,
    description: section.description,
    dueDate: section.dueDate,
    status: section.status,
    progress: section.progress,
    completion: section.completion,
    tasks: section.tasks,
    signoffPolicyOverride: section.signoffPolicyOverride,
    signoffsRequireAll: section.signoffsRequireAll,
    signoffPolicyCascades: section.signoffPolicyCascades,
    scoringConfig: section.scoringConfig,
    scoringSummary: section.scoringSummary,
    attachments: section.attachments,
    notes: section.notes,
    ...overrides,
  });
}

module.exports = { Taskbook };
