# Certification

A portable representation of a person's certification — the top-level
type that ties together who holds it, what kind of certification it is,
who issued it, when it was earned, and when it expires.

A `Certification` is designed to be **self-contained**: it carries
everything needed to understand the credential without external
lookups. See the OpenQual Principle in `README.md` for the design
rationale.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | `String` | Yes | Version of the OpenQual standard this record was produced against. See `constants.md` → `schemaVersion` and `README.md` → "Schema versioning." |
| `holder` | `PersonSnapshot` | Yes | Frozen identity of the certification holder at the time of issuance or last refresh. |
| `cert_type` | `CertType` | Yes | Embedded snapshot of the cert-type definition — name, discipline, level, validity, renewal requirements, certifying agency. |
| `certification_date` | `DateTime?` | No | When the certification was earned / issued. |
| `expiration_date` | `DateTime?` | No | When the certification expires. May be `neverExpireDate` for lifetime certs. Null means expiration is unknown or not applicable. |
| `issued_cert_id` | `String?` | No | The certificate number or ID printed on the physical credential. |
| `issuing_locality` | `String?` | No | Where the certification was issued, e.g. "Denver, CO" or "State of Colorado". Free-form string. |
| `instructor` | `PersonSnapshot?` | No | Frozen identity of the instructor who conducted the training or examination. |
| `cert_document` | `Attachment?` | No | The digitized certification itself — a PDF, image, or scan of the actual credential. Distinct from supplementary `attachments`. |
| `renewal_progress` | `RenewalProgress?` | No | In-flight progress against the current renewal cycle. Uses the existing `RenewalProgress` type. |
| `previous_renewals` | `PreviousRenewals?` | No | Archived history of completed renewal cycles. |
| `attachments` | `List<Attachment>` | Yes | Supplementary documents — training records, receipts, supporting evidence. May be empty. |
| `notes` | `String?` | No | Free-form notes. |
| `source` | `Source?` | No | Source attribution for this certification record. Per provenance inheritance, nested types (`holder`, `cert_type`, `instructor`) inherit this source unless they carry their own. |

## Methods

### `Certification.isCurrentlyValid(now: DateTime) → bool`

Pure. Returns `true` iff the certification is considered valid at the
given instant.

Logic:
1. If `certification_date` is non-null and `now < certification_date`
   → `false` (cert has not yet taken effect).
2. If `expiration_date` is null → `true` (no expiration known; assume
   valid).
3. If `expiration_date` equals `neverExpireDate` → `true` (lifetime
   cert).
4. If `now < expiration_date` → `true`.
5. Otherwise → `false`.

This method evaluates validity dates only. Suspension, revocation, and
other administrative states are not modeled in v0.1; see
`OPEN_ISSUES.md` for the acknowledged future enhancement.

## Notes

- `cert_document` is a first-class field, not an element of
  `attachments`. The digitized credential is semantically distinct
  from supporting documents. Implementations should use this field
  specifically when the question is "show me the cert."
- When exporting a portable `Certification`, implementations
  **should** populate `cert_document.content` (inline base64) so the
  receiving system gets the actual credential without needing access
  to the originating system's storage. See `attachment.md` → Inline
  content.
- `instructor` reuses `PersonSnapshot` — the same type as `holder`.
  Every person-shaped slot across the standard (holder, instructor,
  assignee, evaluator, signatory) uses `PersonSnapshot`; the parent
  field name carries the role.
