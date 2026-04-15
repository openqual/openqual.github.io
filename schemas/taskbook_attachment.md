# TaskbookAttachment

A file attached to any node in the TaskBook hierarchy (book, section,
task, or subtask).

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `String` | Yes | Original filename. |
| `path` | `String` | Yes | Opaque, stable handle that identifies the attachment's backing storage entry. See "Path semantics" below. |
| `mime_type` | `String` | Yes | IANA media type (e.g. `application/pdf`, `image/png`). |
| `size_bytes` | `int` | Yes | File size in bytes. `0` is valid (empty file). |
| `uploaded_at` | `DateTime` | Yes | Time the file was uploaded to backing storage. If the attachment has no backing-storage upload phase (e.g. an inline or externally-hosted file recorded directly against the node), use the time of attachment association — the moment the attachment was attached to its node. |

## Path semantics

`path` is an **opaque, stable handle** assigned by the host
application. Its value is host-defined and meaningful only to the host
that produced it; OpenQual does not prescribe any format.

Normative rules:

- `path` must be stable for the lifetime of the attachment. Rewriting
  it is a data migration, not a routine operation.
- Clients must treat `path` as opaque. They must not parse it, infer
  structure from it, or construct URLs from it.
- `path` is **not** a dereferenceable URL. It must not be used
  directly as a hyperlink target. In particular, short-lived or
  signed download URLs must not be persisted in this field.
- Producing a dereferenceable URL from a `path` (signing, proxying,
  or otherwise resolving) is a separate host-side operation that
  OpenQual does not specify. A conforming implementation may expose
  such an operation; it is outside the scope of the attachment
  record itself.

## Notes

- `mime_type`, `size_bytes`, and `uploaded_at` are required in the
  OpenQual standard even though the source `TaskbookAttachmentStruct`
  does not carry them. The standard defines the complete shape a
  conforming attachment must have; implementations lacking these
  fields have a compliance gap to fix.
