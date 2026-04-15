# TaskbookAttachment

A file attached to any node in the TaskBook hierarchy (book, section,
task, or subtask).

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `String` | Yes | Original filename. |
| `path` | `String` | Yes | Opaque storage path or URL. Host-application-defined; implementations must not parse it. |
| `mime_type` | `String` | Yes | IANA media type (e.g. `application/pdf`, `image/png`). |
| `size_bytes` | `int` | Yes | File size in bytes. `0` is valid (empty file). |
| `uploaded_at` | `DateTime` | Yes | Upload timestamp. |

## Notes

- `mime_type`, `size_bytes`, and `uploaded_at` are required in the
  OpenQual standard even though the source `TaskbookAttachmentStruct`
  does not carry them. The standard defines the complete shape a
  conforming attachment must have; implementations lacking these
  fields have a compliance gap to fix.
