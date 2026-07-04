# CertType

Portable definition of a certification type. Describes the kind of
credential — its name, discipline, level, validity, and renewal
requirements — independent of any specific issuance to a person.

A `CertType` embedded in a `Certification` is a snapshot: it captures
the cert-type definition as it existed when the certification was
issued or last refreshed. See the OpenQual Principle in `README.md`
for the design rationale.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `String` | Yes | Canonical name of the certification, e.g. "Emergency Medical Technician", "Industrial Fire Brigade Member". |
| `level` | `String?` | No | Level or specialization within the cert family, e.g. "Basic", "Interior Structural". Null when the cert type has no levels. |
| `abbreviation` | `String?` | No | Commonly used short form, e.g. "EMT-B". Null when no standard abbreviation exists. |
| `display_name` | `String?` | No | Override for the complete display string. When null, implementations compose from `certifying_agency.display_name` + `name` + `level`. |
| `discipline` | `Discipline` | Yes | Primary discipline area. Use `other` when the discipline is not represented by a standard value; populate `discipline_other` accordingly. |
| `discipline_other` | `String?` | No | Required when `discipline = other`. Descriptive string for the non-standard discipline. Ignored when `discipline` is any other value. |
| `classification` | `CertClassification` | Yes | Whether this credential is a certification, license, or other. Use `other` when the classification is not represented; populate `classification_other` accordingly. Defaults to `certification`. |
| `classification_other` | `String?` | No | Required when `classification = other`. Descriptive string for the non-standard classification. |
| `authoritative_codes` | `List<AuthoritativeCode>` | Yes | Authority-issued canonical identifiers for this cert type (e.g. FEMA `IS-00100`, an NREMT level code, an NWCG position code). May be empty. See "Authoritative codes" below. |
| `validity_period` | `ValidityPeriod?` | No | How long a certification of this type remains valid after issuance. Null means validity varies or is indefinite. |
| `renewal_window` | `RenewalWindow?` | No | Optional separation of the training-applicability window from the expiration, with anchoring rules. Null ⇒ single-terminal behavior (window == validity period; expiration == window end). See "Renewal windows" below. |
| `standard_code` | `String?` | No | Reference standard the cert type is built against, e.g. "NFPA 1081". Distinct from `authoritative_codes` — this names the *standard document*, not an authority-issued identifier for the cert type itself. |
| `standard_edition` | `String?` | No | Edition or section of the reference standard, e.g. "2007-7, 2012-7". |
| `renewal_requirements` | `RenewalRequirements?` | No | Versioned renewal criteria for this cert type. Uses the existing `RenewalRequirements` type from the renewal slice. Null when the cert type has no structured renewal requirements (e.g. lifetime certs or certs renewed by re-examination only). |
| `certifying_agency` | `OrganizationSnapshot?` | No | The authority that issues this cert type. Embedded as a snapshot for self-containment. See `organization_snapshot.md`. |
| `source` | `Source?` | No | Source attribution for this cert-type definition. |

## Nested types

### `AuthoritativeCode`

One authority-issued identifier for the cert type — canonical identity
in the way an ISBN identifies a book: two independent parties
referencing `{"authority": "FEMA", "code": "IS-00100"}` provably mean
the same certification type.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `authority` | `String` | Yes | The issuing authority, e.g. `"FEMA"`, `"NREMT"`, `"NWCG"`, `"IFSAC"`, `"Pro Board"`. |
| `code` | `String` | Yes | The authority's identifier for this cert type, verbatim as issued, e.g. `"IS-00100"`. |

### `RenewalWindow`

Derivation config separating the **training-applicability window**
(when training counts toward the current cycle) from the
**expiration** (when the credential lapses). The canonical hard case
is NREMT: a 2-calendar-year window ending Dec 31 of the recert year,
with expiration Mar 31 of the following year — a ~3-month grace where
the holder is still certified but training accrues to the *next*
cycle.

All fields optional so new degrees of freedom stay additive; an empty
object is equivalent to null.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `years` | `int?` | No | Cycle length in years. Falls back to `validity_period` when null. |
| `alignment` | `RenewalWindowAlignment` | Yes | `rolling` (default): the window anchors on the issue / renewal-completion date. `calendar`: the window end snaps to `calendar_end`. |
| `calendar_end` | `String?` | No | `"MM-DD"`; required when `alignment = calendar`, e.g. `"12-31"`. The window ends on this day of `anchor_year + years − 1`. |
| `expiration_offset` | `ExpirationOffset?` | No | Grace gap from window end to expiration. Absent ⇒ expiration == window end. |

### `ExpirationOffset`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `months` | `int?` | No | Calendar months added to the window end (end-of-month clamped). |
| `days` | `int?` | No | Days added after the month arithmetic. |

**Derivation (normative).** Given a cycle anchor (the issue date, or
the completion date of the previous renewal):

- `rolling`: `window = [anchor, anchor + years]`;
  `expiration = window_end + expiration_offset`.
- `calendar`: `window_end = calendar_end of (anchor.year + years − 1)`;
  `window_start = day after calendar_end of (anchor.year − 1)`;
  `expiration = window_end + expiration_offset`.

Training completed between `window_end` and `expiration` belongs to
the **next** cycle, not the current one — this is the correctness
axis the single-terminal model cannot express.

NREMT's four national levels are the validation fixture:
`{years: 2, alignment: "calendar", calendar_end: "12-31",
expiration_offset: {months: 3}}`.

## Authoritative codes

`authoritative_codes` passes the standard's interop test: two
independent implementations must agree on these values to recognize
the same cert type across systems. What the standard defines is the
**shape**; which codes attach to which cert types is catalog
curation.

Deliberately **not** in the standard: free-form aliases, search
terms, or synonym lists. Those are discovery aids — they help a user
find a cert type but carry no cross-system meaning, and they fail
the interop test. Implementations and catalogs MAY maintain them as
value-added data outside the portable record.

## Notes

- `discipline` uses an enum with an `other` escape hatch so the
  standard can grow into new disciplines without breaking existing
  implementations. Catalog operators can analyze `discipline_other`
  values in the field and promote common ones into the enum in future
  versions — `aviation` entered the enum in v1.0 by exactly this
  path.
- The same `other` + string pattern applies to `classification`.
- `renewal_requirements` reuses the `RenewalRequirements` type
  already published in the renewal slice. The existing model was
  built primarily around NREMT-shaped renewals (CE-hour components
  with sub-requirements). Cert types with different renewal shapes
  (e.g. "attend refresher class" or "pass re-examination") may not
  fit cleanly; see `OPEN_ISSUES.md` for community input on extending
  the renewal model.
- `display_name` is an override, not the primary identity. The
  primary identity is `name` + `level` + the embedded
  `certifying_agency`. Implementations can always compose a display
  string; `display_name` lets the source system say "people call it
  this."
