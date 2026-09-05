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
const { neverExpireDate, openqualSchemaVersion } = require('./constants');
const {
  WorkItemStatus,
  TaskbookTypes,
  TaskTypes,
  EvaluationType,
  ScoringMode,
} = require('./enums');
const { SignoffPolicy, signoffsOK } = require('./signoff_policy');
const { Source } = require('./source');
const { StartAndEndTimes } = require('./start_and_end_times');
const { TaskbookAssignment } = require('./taskbook_assignment');
const { TaskbookEvaluationConfig } = require('./taskbook_evaluation_config');
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

/** The root container in the TaskBook hierarchy. */
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
    attachments = [],
    notes = null,
    evaluationConfig = null,
    startAndEnd = null,
    taskbookSummary = null,
    importStatus = null,
    importNotes = null,
    source = null,
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
    this.attachments = Object.freeze([...attachments]);
    this.notes = notes;
    this.evaluationConfig = evaluationConfig;
    this.startAndEnd = startAndEnd;
    this.taskbookSummary = taskbookSummary;
    this.importStatus = importStatus;
    this.importNotes = importNotes;
    this.source = source;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new Taskbook({
      schemaVersion: m.schema_version ?? openqualSchemaVersion,
      taskbookType: m.taskbook_type ?? TaskbookTypes.TASKBOOK,
      title: m.title,
      description: m.description ?? null,
      dueDate: readDate(m.due_date),
      status: m.status ?? WorkItemStatus.NOT_STARTED,
      progress: m.progress ?? 0.0,
      completion:
        m.completion == null
          ? new CompletionState()
          : CompletionState.fromJSON(m.completion),
      assignment:
        m.assignment == null ? null : TaskbookAssignment.fromJSON(m.assignment),
      sections: (m.sections ?? []).map((s) => TaskbookSection.fromJSON(s)),
      signoffPolicy: (m.signoff_policy ?? []).map((p) => SignoffPolicy.fromJSON(p)),
      signoffsRequireAll: m.signoffs_require_all ?? true,
      attachments: (m.attachments ?? []).map((a) => Attachment.fromJSON(a)),
      notes: m.notes ?? null,
      evaluationConfig:
        m.evaluation_config == null
          ? null
          : TaskbookEvaluationConfig.fromJSON(m.evaluation_config),
      startAndEnd:
        m.start_and_end == null ? null : StartAndEndTimes.fromJSON(m.start_and_end),
      taskbookSummary:
        m.taskbook_summary == null
          ? null
          : TaskbookSummary.fromJSON(m.taskbook_summary),
      importStatus: m.import_status ?? null,
      importNotes: m.import_notes ?? null,
      source: m.source == null ? null : Source.fromJSON(m.source),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      schema_version: this.schemaVersion,
      taskbook_type: this.taskbookType,
      title: this.title,
    };
    if (this.description != null) out.description = this.description;
    if (this.dueDate != null) out.due_date = dateToIso(this.dueDate);
    out.status = this.status;
    out.progress = this.progress;
    out.completion = this.completion.toJSON();
    if (this.assignment != null) out.assignment = this.assignment.toJSON();
    out.sections = this.sections.map((s) => s.toJSON());
    out.signoff_policy = this.signoffPolicy.map((p) => p.toJSON());
    out.signoffs_require_all = this.signoffsRequireAll;
    out.attachments = this.attachments.map((a) => a.toJSON());
    if (this.notes != null) out.notes = this.notes;
    if (this.evaluationConfig != null) {
      out.evaluation_config = this.evaluationConfig.toJSON();
    }
    if (this.startAndEnd != null) out.start_and_end = this.startAndEnd.toJSON();
    if (this.taskbookSummary != null) {
      out.taskbook_summary = this.taskbookSummary.toJSON();
    }
    if (this.importStatus != null) out.import_status = this.importStatus;
    if (this.importNotes != null) out.import_notes = this.importNotes;
    if (this.source != null) out.source = this.source.toJSON();
    return out;
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
      const updated = section._with({
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
      const updatedSection = section._with({
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
    const updatedSection = section._with({
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

    // Book-level threshold (aggregated mode only). `minPassingPercentage`
    // is validated to [0.0, 1.0] at construction (MIGRATION Rule 4) — no
    // legacy ÷100 normalization.
    let effThresholdPoints = null;
    let effThresholdPercentage = null;
    if (isAggregated) {
      const minPts = this.evaluationConfig?.scoringConfig?.minPassingPoints ?? null;
      const minPct = this.evaluationConfig?.scoringConfig?.minPassingPercentage ?? null;
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

    // Critical propagation: a failed task flagged `critical` fails the
    // whole tier, whatever its type (see schemas/taskbook.md). The task-level
    // flag is the authority; a stored inspection triage is derived from
    // it and is not consulted here.
    const hasCriticalFailure = allTasks.some(
      (t) => t.critical && t.status === WorkItemStatus.COMPLETE_FAILED,
    );
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
    if (hasCriticalFailure) newStatus = WorkItemStatus.COMPLETE_FAILED;
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

    // Signoff totals across book, sections, and tasks.
    let signoffsRequiredTotal = this.signoffPolicy.length;
    let signoffsCompletedTotal = this.signoffPolicy.filter((p) => p.completed).length;
    for (const s of computedSections) {
      signoffsRequiredTotal += s.signoffPolicy.length;
      signoffsCompletedTotal += s.signoffPolicy.filter((p) => p.completed).length;
      for (const t of s.tasks) {
        signoffsRequiredTotal += t.signoffPolicy.length;
        signoffsCompletedTotal += t.signoffPolicy.filter((p) => p.completed).length;
      }
    }

    const scoringSummary =
      scoredTasks.length === 0
        ? null
        : new BookScoringSummary({
            pointsPossible,
            pointsAwarded,
            pointsRemaining,
            effectiveThresholdPoints: effThresholdPoints,
            effectiveThresholdPercentage: effThresholdPercentage,
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
      schemaVersion: this.schemaVersion,
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
      attachments: this.attachments,
      notes: this.notes,
      evaluationConfig: this.evaluationConfig,
      startAndEnd: this.startAndEnd,
      taskbookSummary: this.taskbookSummary,
      importStatus: this.importStatus,
      importNotes: this.importNotes,
      source: this.source,
      ...overrides,
    });
  }
}

function _replace(arr, idx, value) {
  const out = [...arr];
  out[idx] = value;
  return out;
}

module.exports = { Taskbook };
