# OrganizationSnapshot

Frozen point-in-time capture of an organization's identity and contact
details. Reusable in any slot where a portable record references an
organization — the certifying agency that issued a credential, a
hosting org on a taskbook assignment, an org authorized to sign off on
work, and future organization references.

The struct names the *shape*. The parent field name (e.g.
`CertType.certifying_agency`) names the *role* that organization is
playing in the record. This mirrors how `PersonSnapshot` is reused
across holder, instructor, and evaluator slots.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `String` | Yes | Authoritative name of the organization, e.g. "National Registry of Emergency Medical Technicians", "Aurora Fire Department". |
| `display_name` | `String?` | No | Short form for display, e.g. "NREMT". Falls back to `name` when absent. |
| `website` | `String?` | No | Organization website URL. |
| `email` | `String?` | No | Organization contact email. |
| `phone` | `String?` | No | Organization contact phone. |
| `source` | `Source?` | No | Provenance attribution. See `source.md`. |

## Notes

- `OrganizationSnapshot` is deliberately snapshot-shaped: it captures
  identity and contact as they were at the moment of capture, and is
  not updated if the organization's details change later. This follows
  the same principle as `PersonSnapshot`.
- The struct does not model the organization itself — no membership
  lifecycle, no subunits (stations, shifts, crews), no governance or
  policies. A richer `Organization` class with these concerns is
  planned for a future version. See the Roadmap in `README.md`.
- Contact fields (`website`, `email`, `phone`) are optional. They are
  included so a portable record can carry basic contact info without
  requiring a catalog lookup. Richer organization data (accreditations,
  history, staffing, apparatus, station lists) belongs in catalogs or
  specialized types, not the standard.
- **Distinguishing kinds of organizations.** Different slots in the
  standard may be filled by meaningfully different kinds of
  organizations — a certifying agency, an employing department, a
  mutual-aid partner, a professional association. `OrganizationSnapshot`
  intentionally does not enforce a taxonomy. Implementers with catalogs
  that distinguish kinds can encode that distinction in
  `source.canonical_source` — for example,
  `"https://catalog.example.com/api/certifying_agencies"` versus
  `"https://catalog.example.com/api/departments"`. See `source.md` for
  the full range of `canonical_source` forms.
