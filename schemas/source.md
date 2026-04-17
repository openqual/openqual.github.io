# Source

Source attribution for a piece of data in the OpenQual standard.
Identifies where a value originated and how a receiving system can
reference it in the originating system or catalog.

Used throughout the standard on any type that may travel between
systems. See the OpenQual Principle in `README.md` for the design
rationale.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `canonical_id` | `String?` | No | Opaque identifier of this record in the source system or catalog. |
| `canonical_source` | `String?` | No | Opaque identifier of the source system or catalog itself. See below for the range of forms this string can take. |

## The `canonical_source` string

`canonical_source` is deliberately a free-form string. The standard
does not prescribe a format. Implementers choose the level of
granularity that makes sense for their catalog, including encoding
type or collection distinctions directly in the string.

Examples of valid `canonical_source` values:

- `"firecal_catalog"` — a simple identifier naming the source system.
- `"firecal_catalog:certifying_agencies"` — a scoped identifier
  distinguishing collections within a single source system.
- `"https://catalog.example.com/api/certifying_agencies"` — a
  resource-scoped URL. A receiving system that knows this catalog can
  combine `canonical_source` + `canonical_id` to resolve the record.
- `"https://catalog.example.com/api/departments"` — a different
  collection in the same catalog. Two `OrganizationSnapshot` values
  with these two `canonical_source` strings come from meaningfully
  different kinds of organizations, even though the snapshot struct
  is the same shape.

This flexibility lets implementers distinguish meaningfully different
kinds of records (e.g. a certifying agency vs. an employing
department) without requiring separate OpenQual types for each kind.
The struct names the shape; `canonical_source` names the catalog-side
kind when it matters.

## Provenance inheritance

When an entire record came from one source, `source` is set on the
parent and inherited by its nested types. A nested type only needs
its own `source` when the specific piece of data came from a
*different* source than the parent.

For example, a `Certification` whose `source` points to System A
does not need `source` repeated on its embedded `CertType` or
`OrganizationSnapshot` — unless those were enriched from a different
catalog.

## Multi-source modification (v0.1 behavioral guideline)

When a portable record carrying provenance from one source is
modified by another party, implementations **should** preserve the
original `canonical_id` and `canonical_source` rather than
overwriting them. If modifications are made, record them alongside
the original provenance rather than replacing it.

Formal audit trail mechanisms (append-only logs, chain of custody,
versioning) are acknowledged as a future enhancement. No specific
version commitment is made.

## Notes

- Both fields are optional because a record may have no known
  origin (e.g. manually entered data with no catalog binding).
  Standards-compliant portable records **should** populate source
  attribution when the origin is known, but omitting it is not a
  conformance violation.
- What a receiving application does with source attribution —
  verify it, enrich from it, or ignore it — is entirely optional.
  The standard encourages attribution to be present when possible;
  it does not require any particular action on it.
