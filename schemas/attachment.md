# Attachment

A file attached to any node in the OpenQual standard — taskbooks,
sections, tasks, certifications, or any other type that carries
attachments.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `String` | Yes | Original filename. |
| `path` | `String?` | No | Opaque, stable handle that identifies the attachment's backing storage entry. Required when `content` is absent. See "Path semantics" below. |
| `mime_type` | `String` | Yes | IANA media type (e.g. `application/pdf`, `image/png`). |
| `size_bytes` | `int` | Yes | File size in bytes. `0` is valid (empty file). |
| `uploaded_at` | `DateTime` | Yes | Time the file was uploaded to backing storage. If the attachment has no backing-storage upload phase (e.g. an inline or externally-hosted file recorded directly against the node), use the time of attachment association — the moment the attachment was attached to its node. |
| `content` | `String?` | No | Base64-encoded file content. When present, the attachment is self-contained and portable — a receiving system can reconstruct the file without resolving `path`. When absent, `path` is the only way to access the file. |
| `content_encoding` | `String?` | No | Encoding of `content`. Required when `content` is set. The only value defined in v0.1 is `base64`; future versions may add others. |
| `source` | `Source?` | No | Source attribution for this attachment, when it originated from a different source than the parent record. |

**Invariant:** at least one of `path` or `content` MUST be present.
A host-stored attachment has `path`; a portable/inline attachment has
`content` + `content_encoding`; an attachment with both is valid and
supports both access modes.

## Path semantics

`path` is an **opaque, stable handle** assigned by the host
application. Its value is host-defined and meaningful only to the host
that produced it; OpenQual does not prescribe any format.

Normative rules:

- `path` MUST be stable for the lifetime of the attachment. Rewriting
  it is a data migration, not a routine operation.
- Clients MUST treat `path` as opaque. They MUST NOT parse it, infer
  structure from it, or construct URLs from it.
- `path` is **not** a dereferenceable URL. It MUST NOT be used
  directly as a hyperlink target. In particular, short-lived or
  signed download URLs MUST NOT be persisted in this field.
- Producing a dereferenceable URL from a `path` (signing, proxying,
  or otherwise resolving) is a separate host-side operation that
  OpenQual does not specify. A conforming implementation MAY expose
  such an operation; it is outside the scope of the attachment
  record itself.

## Inline content

When exporting a portable record (e.g. a `Certification` traveling
between systems), implementations **SHOULD** populate `content` and
`content_encoding` for key attachments so the receiving system can
reconstruct the file without access to the originating host's storage.

Implementations storing records locally MAY omit `content` and rely on
`path` for storage resolution.

## Notes

- Inline content can make records large (a 2 MB PDF → ~2.7 MB
  base64). Future versions of the standard may address size limits
  or alternative encodings. For v0.1, portability takes priority.
