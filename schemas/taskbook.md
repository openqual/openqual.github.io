# Taskbook

The root container in the TaskBook hierarchy. Holds an ordered list of
sections, an optional assignment, book-level signoff policy, and optional
book-level evaluation scoring.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | `String` | Yes | Version of the OpenQual standard this record was produced against. See `constants.md` → `schemaVersion` and `README.md` → "Schema versioning." |
| `taskbook_type` | `TaskbookTypes` | Yes | Discriminator. Defaults to `taskbook`. |
| `title` | `String` | Yes | Display name. |
| `description` | `String?` | No | Prose description. |
| `due_date` | `DateTime?` | No | Overall due date. |
| `status` | `WorkItemStatus` | Yes | Computed by the section-/book-level waterfall. Stored denormalized for fast reads. |
| `progress` | `double` | Yes | `0.0`–`1.0`. Computed from child sections. |
| `completion` | `CompletionState` | Yes | Owner completion marker for the book as a whole. |
| `assignment` | `TaskbookAssignment?` | No | Assignee, evaluator, and host. |
| `sections` | `List<TaskbookSection>` | Yes | Ordered by `TaskbookSection.order`. May be empty. |
| `signoff_policy` | `List<SignoffPolicy>` | Yes | Book-level signoff policies. May be empty. |
| `signoffs_require_all` | `bool` | Yes | When `true`, all policies in `signoff_policy` must be completed; when `false`, any one suffices. Defaults to `true`. |
| `signoff_policy_cascades` | `bool` | Yes | When `true`, the book's signoff policy also applies to sections and tasks that have no override. Defaults to `false`. |
| `attachments` | `List<Attachment>` | Yes | May be empty. |
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
- Setting the `neverExpireDate` sentinel as the placeholder `due_date`
  where one is not provided (see `constants.md`).
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
recompute `status` — call `Taskbook.computeStatus` after marking
complete.

### `Taskbook.computeStatus() → Taskbook`

Pure. Computes the book's `status`, `progress`, and `taskbook_summary`.
Returns an updated `Taskbook` with every section also recomputed via
`TaskbookSection.computeStatus()` so the full tree is consistent.

**Priority waterfall:**

1. **Autofail propagation.** If any task anywhere in the book has
   `status = complete_failed` AND its evaluation criteria has
   `autofail = true` → `complete_failed`.
2. **Cannot pass.** If `evaluation_config.scoring_mode = aggregated`
   AND `evaluation_config.scoring_config` has a threshold AND
   `points_awarded + points_remaining < effective_threshold_points`
   → `complete_failed`.
3. **Did not pass.** If `evaluation_config.scoring_mode = aggregated`
   AND `evaluation_config.scoring_config` has a threshold AND all
   scored evaluations in the book have a result AND
   `points_awarded < effective_threshold_points` → `complete_failed`.
4. **Per-section failure propagation.** If
   `evaluation_config.scoring_mode = per_section` AND any section has
   `status = complete_failed` → `complete_failed`.
5. **Complete.** If `completion.complete` AND book-level signoffs are
   OK → `complete`.
6. **Pending validation.** If `completion.complete` AND book-level
   signoffs are not OK → `pending_validation`.
7. **Owner action needed.** If work exists (any sections, or a
   book-level policy), all sections are `complete` or
   `complete_failed`, book signoffs are OK, and `completion.complete`
   is `false` → `owner_action_needed`.
8. **In progress.** If any section has progressed beyond
   `not_started`, or any book-level signoff has been completed
   → `in_progress`.
9. **Default.** → `not_started`.

"Signoffs OK" is defined as in `TaskbookSection.computeStatus`,
applied to the book's `signoff_policy` and `signoffs_require_all`.

### `Taskbook.computeProgress() → double`

Pure. Returns `1.0` when `status` is `complete` or `complete_failed`.
Otherwise returns the arithmetic mean of child sections' `progress`,
or `0.0` when the book has no sections.
