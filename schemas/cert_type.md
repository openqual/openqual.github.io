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
| `validity_period` | `ValidityPeriod?` | No | How long a certification of this type remains valid after issuance. Null means validity varies or is indefinite. |
| `standard_code` | `String?` | No | Reference standard the cert type is built against, e.g. "NFPA 1081". |
| `standard_edition` | `String?` | No | Edition or section of the reference standard, e.g. "2007-7, 2012-7". |
| `renewal_requirements` | `RenewalRequirements?` | No | Versioned renewal criteria for this cert type. Uses the existing `RenewalRequirements` type from the renewal slice. Null when the cert type has no structured renewal requirements (e.g. lifetime certs or certs renewed by re-examination only). |
| `certifying_agency` | `CertifyingAgency?` | No | The authority that issues this cert type. Embedded as a snapshot for self-containment. |
| `source` | `Source?` | No | Source attribution for this cert-type definition. |

## Notes

- `discipline` uses an enum with an `other` escape hatch so the
  standard can grow into new disciplines without breaking existing
  implementations. Catalog operators can analyze `discipline_other`
  values in the field and promote common ones into the enum in future
  versions.
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
