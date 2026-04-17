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
| `issuing_locality` | `String?` | No | Where the certification was issued, e.g. "Denver, CO" or "State of Colorado". Free-form display string. |
| `issuing_timezone` | `String?` | No | IANA timezone identifier for the issuing jurisdiction, e.g. `"America/Denver"`. Used by `isCurrentlyValid` to anchor day-granularity comparisons. See "Calendar date semantics" below. |
| `status` | `CertStatus?` | No | Administrative status. When set to `revoked`, `suspended`, or `expired`, the certification is not currently valid regardless of dates. Omit or set to `active` when no administrative invalidity applies. See "Status and validity" below. |
| `instructor` | `PersonSnapshot?` | No | Frozen identity of the instructor who conducted the training or examination. |
| `cert_document` | `Attachment?` | No | The digitized certification itself — a PDF, image, or scan of the actual credential. Distinct from supplementary `attachments`. |
| `earned_via_taskbook` | `EarnedViaTaskbook?` | No | Snapshot of the taskbook completion that earned this certification, when applicable. Optional — a certification may have been earned by other paths (external exam, classroom-only program, grandfathered credit) that v0.1 does not model. See "Earned-via linkage" below and the `EarnedViaTaskbook` nested type. |
| `renewal_progress` | `RenewalProgress?` | No | In-flight progress against the current renewal cycle. Uses the existing `RenewalProgress` type. |
| `previous_renewals` | `PreviousRenewals?` | No | Archived history of completed renewal cycles. |
| `attachments` | `List<Attachment>` | Yes | Supplementary documents — training records, receipts, supporting evidence. May be empty. |
| `notes` | `String?` | No | Free-form notes. |
| `source` | `Source?` | No | Source attribution for this certification record. Per provenance inheritance, nested types (`holder`, `cert_type`, `instructor`) inherit this source unless they carry their own. |

## Nested types

### `EarnedViaTaskbook`

Snapshot of a specific taskbook completion that earned this
certification. Instance-level — it records what happened, not what a
cert type is *supposed* to be earned by.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `taskbook_title` | `String` | Yes | Title of the taskbook at the moment of completion. Frozen snapshot. |
| `completed_at` | `DateTime` | Yes | Instant the taskbook was completed (all required signoffs present and the owner marked it complete). |
| `source` | `Source?` | No | Provenance pointer to the taskbook instance in its originating system. When null, inherits from the parent `Certification.source` per the provenance inheritance rule (see `source.md`). |

## Methods

### `Certification.isCurrentlyValid(now: DateTime) → bool`

Pure. Returns `true` iff the certification is considered valid at the
given instant.

Comparisons for `certification_date` and `expiration_date` happen at
**day granularity** in the jurisdictional timezone resolved by the
cascade in "Calendar date semantics" below. Let `today` denote the
calendar date of `now` in that timezone; let `cert_day` and `exp_day`
denote the calendar dates of `certification_date` and `expiration_date`
in the same timezone.

Logic:
1. If `status` is `revoked`, `suspended`, or `expired` → `false`
   (administrative or explicit invalidity overrides date logic).
2. If `certification_date` is non-null and `today < cert_day` → `false`
   (cert has not yet taken effect).
3. If `expiration_date` is null → `true` (no expiration known; assume
   valid).
4. If `expiration_date` equals `neverExpireDate` → `true` (lifetime
   cert). Sentinel equality is checked on the raw `DateTime` before
   any timezone conversion.
5. If `today <= exp_day` → `true` (valid through end of the
   expiration day).
6. Otherwise → `false` (date-based expiration).

`status = active` and `status = null` behave identically: both fall
through to the date-based evaluation. `status = active` is an
explicit affirmation, but it does not override a past
`expiration_date`.

## Calendar date semantics (normative)

`certification_date` and `expiration_date` are **calendar dates**
tied to an issuing jurisdiction, not UTC instants. A certification
with `expiration_date` of March 15 is valid through the entire day of
March 15 in that jurisdiction — not invalid the instant 2026-03-15
UTC rolls around.

**Serialization.** These fields MAY be written either as:

- An ISO 8601 date string: `"2026-03-15"`.
- A full `DateTime` fixed to `00:00:00 UTC` on the named day:
  `"2026-03-15T00:00:00Z"`.

Receivers MUST accept both forms and normalize to the day for
comparison purposes. Producers SHOULD prefer the ISO date string
when their serialization format supports it.

**Timezone resolution — the cascade.** `isCurrentlyValid` converts
`now` to the jurisdictional calendar day using this ordered cascade:

1. If `issuing_timezone` is present and resolvable to an IANA
   timezone, use it.
2. Otherwise, use UTC.

The cascade is deterministic: every standards-compliant
implementation evaluating `isCurrentlyValid` against the same record
at the same instant MUST produce the same result. This is the
load-bearing property for interoperability — receivers cannot
diverge on whether a given cert is currently valid.

**Comparison rule.** `expiration_date` represents the last valid day,
inclusive. The cert is valid when `today <= exp_day`. Similarly,
`certification_date` represents the first effective day, inclusive —
the cert is not yet effective when `today < cert_day`.

**Implementer flexibility beyond the cascade.** Implementers MAY
offer additional timezone-resolution strategies as UX conveniences
(viewer's device timezone, tenant default, automatic resolution from
`issuing_locality` via a geocoding table, etc.). These MUST be
labeled as presentation-layer choices; the **standard's
authoritative** `isCurrentlyValid` always uses the two-step cascade
above. This allows richer UX without compromising cross-implementation
agreement on validity.

**Reference implementations.** The reference `dart/` and `js/`
implementations are standard-library-only and do not perform
arbitrary IANA timezone conversion. They implement step 2 of the
cascade (UTC) correctly and fall back to UTC when `issuing_timezone`
is present but cannot be resolved without external dependencies.
Implementers deploying into production SHOULD add timezone handling
(e.g., via a runtime timezone library) to honor step 1 of the
cascade. See [`docs/timezone_handling.md`](../docs/timezone_handling.md)
for production guidance, per-language library pointers, and a Dart
override sketch.

## Earned-via linkage

`earned_via_taskbook` captures the instance-level fact that a
specific taskbook completion produced this specific certification.
It is a snapshot, consistent with how the rest of the standard handles
portable identity — the title is frozen, the completion instant is
frozen, and `source` provides a lookup path back to the taskbook in
its originating system.

**Why instance-side only in v0.1.** The "earns" relationship is
fundamentally an instance-level fact: when a specific cert is
produced, the system knows the specific taskbook it came from.
Type-level claims ("this cert type IS earned by template X") are
governance statements that vary across jurisdictions, can involve
multiple earning paths (taskbook + exam + CE hours), and are
better maintained in catalogs than frozen into each cert type. A
future version may add a catalog-side type-linkage mechanism; for
v0.1, only the instance-side snapshot is standardized.

**Non-taskbook earning paths.** Certifications earned by external
exam, classroom-only programs, grandfathered credit, or other
paths outside a taskbook flow simply leave `earned_via_taskbook`
null. Modeling those paths is deferred to a future version.

## Status and validity (normative)

`status` and the date fields (`certification_date`, `expiration_date`)
are independent signals that both feed `isCurrentlyValid`. The rules
for how they interact:

- **`status` is optional.** A producer may omit it entirely; the
  record is fully interpretable from dates alone.
- **When `status` is set to `revoked`, `suspended`, or `expired`, the
  certification is not currently valid** regardless of dates. These
  are administrative or explicit signals that override date-based
  inference.
- **When `status` is `active` or absent, validity is determined by
  dates.** `active` is an explicit affirmation ("the status has been
  checked and nothing administrative applies") but it does not
  override a past `expiration_date`.
- **Producer-set vs. receiver-inferred.** Producers SHOULD set
  `status` when they have authoritative knowledge of an
  administrative state (revocation, suspension, explicit expiration
  marking). Receivers MUST NOT set or backfill `status` on a record
  from another producer — it is part of the record's audit trail.
  Receivers MAY compute their own view of validity via
  `isCurrentlyValid`, which combines `status` and date signals per
  the logic above.
- **Disagreement handling.** `active` + past `expiration_date` is not
  a contradiction — the cert is expired by dates, and the status
  field records that no administrative invalidation applies. A future
  version may introduce finer-grained administrative states (e.g.
  probation); those will slot into the same pattern.

## Notes

- `cert_document` is a first-class field, not an element of
  `attachments`. The digitized credential is semantically distinct
  from supporting documents. Implementations SHOULD use this field
  specifically when the question is "show me the cert."
- When exporting a portable `Certification`, implementations SHOULD
  populate `cert_document.content` (inline base64) so the receiving
  system gets the actual credential without needing access to the
  originating system's storage. See `attachment.md` → Inline content.
- `instructor` reuses `PersonSnapshot` — the same type as `holder`.
  Every person-shaped slot across the standard (holder, instructor,
  assignee, evaluator, signatory) uses `PersonSnapshot`; the parent
  field name carries the role.
