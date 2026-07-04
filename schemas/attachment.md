# Attachment

A file attached to any node in the OpenQual standard — taskbooks,
sections, tasks, certifications, training records, or any other type
that carries attachments.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `String` | Yes | Original filename. |
| `path` | `String?` | No | Opaque, stable handle that identifies the attachment's backing storage entry. Required when `content` is absent. See "Path semantics" below. |
| `mime_type` | `String` | Yes | IANA media type (e.g. `application/pdf`, `image/png`). |
| `size_bytes` | `int` | Yes | File size in bytes. `0` is valid (empty file). |
| `uploaded_at` | `DateTime` | Yes | Time the file was uploaded to backing storage. If the attachment has no backing-storage upload phase (e.g. an inline or externally-hosted file recorded directly against the node), use the time of attachment association — the moment the attachment was attached to its node. |
| `uploaded_by` | `PersonSnapshot?` | No | Frozen identity of the person who supplied this file, captured at upload time. Survives the uploader's account deletion and travels across hosts — a receiving system can render "Uploaded by Alice Smith" without the uploader existing in its user directory. Snapshot-frozen like all audit data. |
| `content` | `String?` | No | Base64-encoded file content. When present, the attachment is self-contained and portable — a receiving system can reconstruct the file without resolving `path`. When absent, `path` (or a live `download_url`) is the only way to access the file. |
| `content_encoding` | `String?` | No | Encoding of `content`. Required when `content` is set. The only value defined in v1.0 is `base64`; future versions may add others. |
| `download_url` | `String?` | No | A dereferenceable URL the producing host guarantees fetchable until `download_url_expires_at`. For cross-host "lite" exports only — see "Export profiles" below. Distinct from `path`, whose opacity rules are unchanged. |
| `download_url_expires_at` | `DateTime?` | No | Liveness bound for `download_url`. Required when `download_url` is set. Receivers MUST treat an expired URL as absent. |
| `source` | `Source?` | No | Source attribution for this attachment, when it originated from a different source than the parent record. |

**Invariant:** at least one of `path` or `content` MUST be present.
A host-stored attachment has `path`; a portable/inline attachment has
`content` + `content_encoding`; an attachment with both is valid and
supports both access modes. `download_url` is never sufficient on its
own — it is a time-bounded convenience layered over one of the two
durable access modes.

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
  signed download URLs MUST NOT be persisted in this field — that is
  what `download_url` + `download_url_expires_at` are for.
- Producing a dereferenceable URL from a `path` (signing, proxying,
  or otherwise resolving) is a separate host-side operation that
  OpenQual does not specify. A conforming implementation MAY expose
  such an operation; it is outside the scope of the attachment
  record itself.

## Export profiles

Producers exporting records with attachments choose one of three
profiles per attachment; the field combinations make the profile
self-describing to receivers:

| Profile | Fields populated | Use case |
|---|---|---|
| **Lite** | `path` (+ optionally `download_url` / `download_url_expires_at`) | Same-host or trusted-peer exchange; smallest payload. Cross-host lite exports SHOULD carry a `download_url` with a stated liveness window, since a foreign receiver cannot resolve `path`. |
| **Self-contained** | `content` + `content_encoding` (`path` optional) | Records leaving the originating system's trust boundary; the file travels with the record. RECOMMENDED for `cert_document` and other evidence on externally-exchanged records. |
| **Hybrid** | both `path`/`download_url` and `content` | Receiver picks: fetch-fast when connected to the host, reconstruct-inline as fallback. |

Receiver access order: `content` if present → `download_url` if
present and unexpired → `path` via host-side resolution when the
receiver can reach the originating host.

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
  or alternative encodings. For v1.0, portability takes priority.
- For packaging a record + its attachments as a single deliverable
  file, see the non-normative guide `docs/export_packaging.md`.
