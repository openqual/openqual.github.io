# Export packaging — implementation guide

Non-normative. How to hand an OpenQual record to a person or another
system as a **deliverable asset** rather than a text blob.

## Single-document form (recommended default)

One JSON file: the record serialized per the reference wire form, with
attachments carried inline (the self-contained profile —
`content` + `content_encoding` populated on `cert_document` and
evidence attachments; see `../schemas/attachment.md` → "Export
profiles").

- **Filename:** `<type>-<holder-or-title-slug>-<date>.openqual.json`
  (e.g. `certification-jane-smith-emt-b-2026-07-03.openqual.json`).
- **MIME:** `application/json`.

## Container form (for large attachment sets)

A zip archive:

```
record.json          ← lite-profile attachments; each `path` matches
attachments/<path>   ← an entry under attachments/
```

- **Filename:** `<type>-<slug>-<date>.openqual.zip`.

## Never a clipboard blob

Exports are files a receiving system can ingest and a person can
store and forward. A copy-to-clipboard text field is not an export.

## Receiving checklist

1. Inspect `schema_version` (the versioning contract in
   `../schemas/README.md`).
2. Validate required fields per the record's schema.
3. Reconstruct inline `content` before trusting `path`.
4. Treat expired `download_url`s as absent.
