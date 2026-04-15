# Taskbook

The root container in the TaskBook hierarchy. Holds an ordered list of
sections, an optional assignment, book-level signoff policy, and optional
book-level evaluation scoring.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `taskbook_type` | `TaskbookTypes` | Yes | Discriminator. Defaults to `taskbook`. |
| `title` | `String` | Yes | Display name. |
| `description` | `String?` | No | Prose description. |
| `due_date` | `DateTime?` | No | Overall due date. |
| `status` | `WorkItemStatus` | Yes | Computed by the section-/book-level waterfall. Stored denormalized for fast reads. |
| `progress` | `double` | Yes | `0.0`–`1.0`. Computed from child sections. |
| `completion` | `CompletionState` | Yes | Owner completion marker for the book as a whole. |
| `assignment` | `TaskbookAssignment?` | No | Assignee / evaluator / host org. |
| `sections` | `List<TaskbookSection>` | Yes | Ordered by `TaskbookSection.order`. May be empty. |
| `signoff_policy` | `List<SignoffPolicy>` | Yes | Book-level signoff policies. May be empty. |
| `signoffs_require_all` | `bool` | Yes | When `true`, all policies in `signoff_policy` must be completed; when `false`, any one suffices. Defaults to `true`. |
| `signoff_policy_cascades` | `bool` | Yes | When `true`, the book's signoff policy also applies to sections and tasks that have no override. Defaults to `false`. |
| `attachments` | `List<TaskbookAttachment>` | Yes | May be empty. |
| `notes` | `String?` | No | Free-form notes. |
| `evaluation_config` | `TaskbookEvaluationConfig?` | No | Book-level scoring mode + threshold. Only meaningful when the book contains scored evaluation tasks. |
| `start_and_end` | `StartAndEndTimes?` | No | Work session times. |
| `taskbook_summary` | `TaskbookSummary?` | No | Denormalized counts for fast display. Recomputed by the status waterfall. |
| `import_status` | `String?` | No | Status from an external-import pipeline (e.g. AI generation). Implementation-defined. |
| `import_notes` | `String?` | No | Notes from an external-import pipeline. |

## Methods

### `Taskbook.fromExternalJson(json: String) → Taskbook`

Factory. Parses a JSON string produced by an external source (for
example, an AI import) into a fully-initialized `Taskbook`. Responsible
for:

- Stripping Markdown code-fences (` ```json ` / ` ``` `) before parsing.
- Generating short opaque IDs for every section, task, and subtask.
- Assigning `order` values from enumeration index.
- Initializing `status` to `not_started`, `progress` to `0.0`,
  `completion.complete` to `false`, and `completion.completed_at` to
  `null` on every node.
- Setting a far-future placeholder `due_date` (year 9999) where one is
  not provided, as a sentinel for "no due date."
- Returning a `Taskbook` with a safe error-shaped payload if parsing
  fails (title `"Error Parsing Import"`, description containing the
  error details).

No I/O. Deterministic given the input and a random seed for ID
generation.

### `Taskbook.markComplete({section_id?, task_id?, subtask_id?}) → Taskbook`

Pure. Returns a new `Taskbook` with the `completion` of exactly one
node updated:

| Arguments | Target |
|-----------|--------|
| all three `null` | the taskbook itself |
| `section_id` only | the named section |
| `section_id` + `task_id` | the named task within the section |
| all three | the named subtask within the task within the section |

Sets `complete = true` and `completed_at` to the current time. Returns
the receiver unchanged if the identified node is not found. Does not
recompute `status` — call `TaskbookTask.computeStatus` and
`TaskbookSection.computeStatus` (or the book-level waterfall) after
marking complete.

## Notes

- The authoritative book-level status computation is not yet published
  (see the v0.1 roadmap). The section-level waterfall (in
  `taskbook_section.md`) covers the same patterns at the book level:
  autofail / cannot-pass / did-not-pass via `evaluation_config`, plus
  owner completion and signoff gating via the fields above.
