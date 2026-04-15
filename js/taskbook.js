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
const { WorkItemStatus, TaskbookTypes, TaskTypes } = require('./enums');
const { TaskbookSection } = require('./taskbook_section');
const { TaskbookTask } = require('./taskbook_task');

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
    const farFuture = new Date(Date.UTC(9999, 11, 31));
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
