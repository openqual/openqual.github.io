# TaskbookSubtask

A single checklist item under a `TaskbookTask`. Subtasks have no status
of their own beyond `completion`; they contribute to the parent task's
status via `TaskbookTask.computeStatus`.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `String` | Yes | Opaque ID unique within the parent task. |
| `order` | `int` | Yes | Position among sibling subtasks. |
| `title` | `String` | Yes | Display name. |
| `completion` | `CompletionState` | Yes | Owner completion marker. |
| `attachments` | `List<TaskbookAttachment>` | Yes | May be empty. |

## Methods

None beyond the standard `CompletionState` semantics (setting `complete`
to `true` stamps `completed_at`).
