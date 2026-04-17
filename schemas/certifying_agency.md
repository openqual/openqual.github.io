# CertifyingAgency

Portable representation of an authority that issues certifications.
Carries the agency's authoritative name plus optional short display
name and basic contact information.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `String` | Yes | Authoritative name of the certifying agency, e.g. "National Registry of Emergency Medical Technicians". |
| `display_name` | `String?` | No | Short form for display, e.g. "NREMT". Falls back to `name` when absent. |
| `website` | `String?` | No | Agency website URL. |
| `email` | `String?` | No | Agency contact email. |
| `phone` | `String?` | No | Agency contact phone. |
| `source` | `Source?` | No | Provenance attribution. See `source.md`. |

## Notes

- `display_name` is a convenience for UI contexts where the full
  authoritative name is too long. When absent, implementations should
  fall back to `name`.
- Contact fields (`website`, `email`, `phone`) are optional — they are
  included so a portable record can carry basic contact info without
  requiring a catalog lookup. Richer agency data (accreditations,
  history, governance) belongs in catalogs, not the standard.
