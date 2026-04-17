# Certification — Worked Example

A complete, realistic `Certification` record showing every field in use,
with provenance filled in, a populated renewal cycle mid-progress, an
inline certificate document, and an instructor reference.

Scenario is intentionally normal: a real responder with a real cert at a
real point in her career. This example exists to make the abstract spec
concrete for implementers.

## The scenario

**Sarah Martinez** is a firefighter/EMT at Aurora Fire Rescue in Aurora,
Colorado. She earned her National Registry EMT certification in April
2025 after completing Aurora Fire's in-house EMT training program. Her
training captain, **Michael Chen**, served as her lead instructor and
signed off on her skills verification taskbook.

Today is partway through her first renewal cycle. NREMT's National
Continued Competency Program (NCCP) requires 40 hours of continuing
education over the two-year cycle, structured as three components:
national topic areas, a state/local component, and an individual
component. Sarah has logged 16 hours so far — she is on pace but not
done.

The record below lives in **Aurora Fire's credentialing system**
(`aurora_fire_records`). The cert-type definition was enriched from the
**Colorado EMS catalog** (`colorado_ems_catalog`), which in turn pulls
the issuing agency (NREMT) from NREMT's own public catalog. Sarah and
Michael are both users in Aurora Fire's directory. The taskbook she
completed lives in Aurora Fire's separate taskbook system
(`aurora_fire_taskbooks`).

## The record

```json
{
  "schema_version": "0.1.0",

  "holder": {
    "display_name": "Sarah Martinez",
    "first_name": "Sarah",
    "last_name": "Martinez",
    "email": "sarah.martinez@auroragov.org",
    "memberships": [
      {
        "organization": {
          "name": "Aurora Fire Rescue",
          "display_name": "AFR",
          "website": "https://www.auroragov.org/fire",
          "phone": "+1-303-326-8999"
        },
        "roles": ["member"]
      }
    ]
  },

  "cert_type": {
    "name": "Emergency Medical Technician",
    "level": "Basic",
    "abbreviation": "EMT",
    "display_name": "NREMT EMT",
    "discipline": "ems",
    "classification": "certification",
    "validity_period": { "duration": 2, "units": "years" },
    "standard_code": "NREMT NCCP",
    "standard_edition": "2016 Model",
    "renewal_requirements": {
      "requirements_version": "nccp-2016",
      "components": [
        {
          "component_id": "nccp-national",
          "order": 0,
          "component_name": "National Component",
          "component_quantity": 20,
          "component_units": "hours",
          "requirements": [
            {
              "requirement_id": "nccp-national-airway",
              "order": 0,
              "requirement_name": "airway_respiration_ventilation",
              "requirement_display_name": "Airway, Respiration & Ventilation",
              "requirement_description": "Airway management, ventilation, and respiratory emergencies.",
              "requirement_quantity": 4,
              "requirement_units": "hours"
            },
            {
              "requirement_id": "nccp-national-cardio",
              "order": 1,
              "requirement_name": "cardiovascular",
              "requirement_display_name": "Cardiovascular",
              "requirement_description": "Cardiovascular emergencies including cardiac arrest and ACS.",
              "requirement_quantity": 4,
              "requirement_units": "hours"
            },
            {
              "requirement_id": "nccp-national-trauma",
              "order": 2,
              "requirement_name": "trauma",
              "requirement_display_name": "Trauma",
              "requirement_description": "Trauma assessment and management.",
              "requirement_quantity": 4,
              "requirement_units": "hours"
            },
            {
              "requirement_id": "nccp-national-medical",
              "order": 3,
              "requirement_name": "medical",
              "requirement_display_name": "Medical",
              "requirement_description": "Medical emergencies not covered by other topic areas.",
              "requirement_quantity": 4,
              "requirement_units": "hours"
            },
            {
              "requirement_id": "nccp-national-operations",
              "order": 4,
              "requirement_name": "operations",
              "requirement_display_name": "Operations",
              "requirement_description": "Scene management, MCI, hazmat awareness, and operational topics.",
              "requirement_quantity": 4,
              "requirement_units": "hours"
            }
          ]
        },
        {
          "component_id": "nccp-state",
          "order": 1,
          "component_name": "State/Local Component",
          "component_quantity": 10,
          "component_units": "hours",
          "requirements": []
        },
        {
          "component_id": "nccp-individual",
          "order": 2,
          "component_name": "Individual Component",
          "component_quantity": 10,
          "component_units": "hours",
          "requirements": []
        }
      ]
    },
    "certifying_agency": {
      "name": "National Registry of Emergency Medical Technicians",
      "display_name": "NREMT",
      "website": "https://www.nremt.org",
      "email": "support@nremt.org",
      "phone": "+1-614-888-4484",
      "source": {
        "canonical_id": "org-nremt",
        "canonical_source": "https://catalog.nremt.org/api/orgs"
      }
    },
    "source": {
      "canonical_id": "ct-nremt-emt",
      "canonical_source": "colorado_ems_catalog:cert_types"
    }
  },

  "certification_date": "2025-04-01",
  "expiration_date": "2027-03-31",
  "issued_cert_id": "EMT-R-2025-118432",
  "issuing_locality": "Columbus, OH",
  "issuing_timezone": "America/New_York",
  "status": "active",

  "instructor": {
    "display_name": "Michael Chen",
    "first_name": "Michael",
    "last_name": "Chen",
    "suffix": "NREMT-P, I/C",
    "email": "michael.chen@auroragov.org"
  },

  "cert_document": {
    "name": "nremt-emt-martinez-2025.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 84231,
    "uploaded_at": "2025-04-03T14:22:17Z",
    "content": "JVBERi0xLjQKJcfsj6IKCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSPj4KZW5kb2JqCg[...truncated for display — full record contains the complete base64 of the PDF...]K",
    "content_encoding": "base64"
  },

  "earned_via_taskbook": {
    "taskbook_title": "Aurora Fire EMT Academy — Skills Verification",
    "completed_at": "2025-03-28T11:04:00Z",
    "source": {
      "canonical_id": "tb-afr-emt-2025-martinez",
      "canonical_source": "aurora_fire_taskbooks"
    }
  },

  "renewal_progress": {
    "requirements_version": "nccp-2016",
    "components": [
      {
        "component_id": "nccp-national",
        "order": 0,
        "component_name": "National Component",
        "component_units": "hours",
        "component_quantity": 20,
        "component_quantity_completed": 12,
        "effective_quantity_completed": 12,
        "applied_training_ids": [],
        "manually_added_credit": 0,
        "requirements": [
          {
            "requirement_id": "nccp-national-airway",
            "order": 0,
            "requirement_display_name": "Airway, Respiration & Ventilation",
            "requirement_units": "hours",
            "requirement_quantity": 4,
            "requirement_quantity_completed": 4,
            "effective_quantity_completed": 4,
            "applied_training_ids": ["tr-afr-2025-airway-q3"],
            "manually_added_credit": 0
          },
          {
            "requirement_id": "nccp-national-cardio",
            "order": 1,
            "requirement_display_name": "Cardiovascular",
            "requirement_units": "hours",
            "requirement_quantity": 4,
            "requirement_quantity_completed": 4,
            "effective_quantity_completed": 4,
            "applied_training_ids": ["tr-afr-2025-acls-update"],
            "manually_added_credit": 0
          },
          {
            "requirement_id": "nccp-national-trauma",
            "order": 2,
            "requirement_display_name": "Trauma",
            "requirement_units": "hours",
            "requirement_quantity": 4,
            "requirement_quantity_completed": 2,
            "effective_quantity_completed": 2,
            "applied_training_ids": ["tr-afr-2025-ptc-refresh"],
            "manually_added_credit": 0
          },
          {
            "requirement_id": "nccp-national-medical",
            "order": 3,
            "requirement_display_name": "Medical",
            "requirement_units": "hours",
            "requirement_quantity": 4,
            "requirement_quantity_completed": 2,
            "effective_quantity_completed": 2,
            "applied_training_ids": [],
            "manually_added_credit": 2
          },
          {
            "requirement_id": "nccp-national-operations",
            "order": 4,
            "requirement_display_name": "Operations",
            "requirement_units": "hours",
            "requirement_quantity": 4,
            "requirement_quantity_completed": 0,
            "effective_quantity_completed": 0,
            "applied_training_ids": [],
            "manually_added_credit": 0
          }
        ]
      },
      {
        "component_id": "nccp-state",
        "order": 1,
        "component_name": "State/Local Component",
        "component_units": "hours",
        "component_quantity": 10,
        "component_quantity_completed": 2,
        "effective_quantity_completed": 2,
        "applied_training_ids": ["tr-coems-2025-protocols"],
        "manually_added_credit": 0,
        "requirements": []
      },
      {
        "component_id": "nccp-individual",
        "order": 2,
        "component_name": "Individual Component",
        "component_units": "hours",
        "component_quantity": 10,
        "component_quantity_completed": 2,
        "effective_quantity_completed": 2,
        "applied_training_ids": [],
        "manually_added_credit": 2,
        "requirements": []
      }
    ]
  },

  "previous_renewals": {
    "previous_renewals": []
  },

  "attachments": [
    {
      "name": "nremt-score-report-2025.pdf",
      "path": "afr-blob:certs/sm-2025-04/score-report",
      "mime_type": "application/pdf",
      "size_bytes": 18392,
      "uploaded_at": "2025-04-03T14:23:01Z"
    }
  ],

  "notes": "Initial certification earned via Aurora Fire Rescue's in-house EMT academy. Recertification cycle runs through birth-month 2027.",

  "source": {
    "canonical_id": "cert-sm-nremt-emt-2025",
    "canonical_source": "aurora_fire_records:certifications"
  }
}
```

## Walkthrough

### Schema version

Every top-level portable record carries `schema_version` — here, `"0.1.0"`.
A receiving system inspects this first and decides whether it can
interpret the record (see `README.md` → "Schema versioning").

### Identity and the snapshot pattern

Both `holder` and `instructor` are `PersonSnapshot` values — the same
type used for evaluators, signatories, and any other person reference
across the standard. The struct shape doesn't know what role it fills;
the field name on the parent (`holder`, `instructor`) names the role.

Note that **neither `holder` nor `instructor` carries its own `source`**.
Both inherit from the parent `Certification.source`, which points at
Aurora Fire's records system. That's the provenance-inheritance rule in
action (`source.md` → "Provenance inheritance"): if a nested type came
from the same source as its parent, `source` is omitted.

`holder.memberships` is populated with a single `OrgMembership` showing
Sarah is a member of Aurora Fire Rescue. This is the bounded,
snapshot-shaped membership capture described in `person_snapshot.md` —
no lifecycle vocabulary, no pending/invited states, just what roles she
held at the time of capture.

### Calendar dates and timezone

`certification_date` and `expiration_date` are **calendar dates**,
serialized as `YYYY-MM-DD`. They are not UTC instants — they represent
days in the issuing jurisdiction's timezone, which is named explicitly:

```json
"issuing_timezone": "America/New_York"
```

NREMT is based in Columbus, Ohio. `Certification.isCurrentlyValid(now)`
resolves "today" using the two-step cascade: `issuing_timezone` when
resolvable, UTC otherwise. The cert is valid through the **end** of its
expiration day (2027-03-31) in the issuing jurisdiction — not invalid
the instant 2027-03-31T00:00:00Z rolls around. See
`certification.md` → "Calendar date semantics".

### Status

`"status": "active"` is an explicit affirmation — "checked and currently
in good standing, no administrative hold." The field MAY be omitted for
the same semantic meaning; setting it explicitly is producer preference.
If NREMT were to suspend or revoke Sarah's cert, `status` would become
`"suspended"` or `"revoked"` and `isCurrentlyValid` would return `false`
regardless of the dates (see `certification.md` → "Status and validity").

### Cert type and nested provenance

`cert_type` is an embedded snapshot of the cert-type definition. Several
interesting provenance choices here:

- **`cert_type.source`** points at `colorado_ems_catalog:cert_types` —
  the cert-type definition was enriched from Colorado's state-level
  catalog, not from Aurora Fire's local records. This is an **explicit
  override** of the parent's source.
- **`cert_type.certifying_agency.source`** points at
  `https://catalog.nremt.org/api/orgs` — NREMT's own public catalog.
  This is a **double override**: the certifying agency came from a
  different source than even `cert_type` did. The `canonical_source`
  value is a full URL, illustrating the "implementers choose their
  granularity" flexibility documented in `source.md`.
- **`cert_type.renewal_requirements`** has no `source` field at all
  (because the type doesn't carry one — renewals belong to the cert type
  and inherit along with it).

### The cert document (inline)

`cert_document` is the actual digitized credential, not a supplementary
attachment. The record includes `content` as base64 so a receiving
system can reconstruct the PDF without resolving `path` — the inline
portability pattern described in `attachment.md` → "Inline content".
The string is truncated in this example for readability; a real record
contains the complete base64 of the file.

`path` is absent here because this record is intended for external
exchange — the inline `content` is sufficient on its own. A
host-resident record might populate both `path` (for efficient local
access) and `content` (for portability).

### Earned via taskbook

`earned_via_taskbook` records the instance-level fact that a specific
taskbook completion produced this cert. It's a snapshot of what happened
— the title frozen at completion time, the completion instant, and a
`source` pointing into Aurora Fire's taskbook system (a different
subsystem than the cert itself, so the source is explicit rather than
inherited).

### Renewal progress (mid-cycle)

Sarah is roughly halfway through her NCCP cycle. The `renewal_progress`
mirrors the cert type's `renewal_requirements` structure but with
progress fields on every component and sub-requirement.

Concrete numbers:

| Component | Required | Completed | Effective |
|---|---|---|---|
| National | 20 | 12 | 12 |
| &nbsp;&nbsp;Airway | 4 | 4 | 4 |
| &nbsp;&nbsp;Cardiovascular | 4 | 4 | 4 |
| &nbsp;&nbsp;Trauma | 4 | 2 | 2 |
| &nbsp;&nbsp;Medical | 4 | 2 | 2 |
| &nbsp;&nbsp;Operations | 4 | 0 | 0 |
| State/Local | 10 | 2 | 2 |
| Individual | 10 | 2 | 2 |
| **Total** | **40** | **16** | **16** |

`effective_quantity_completed` equals `min(completed, required)`, which
clamps any over-credit at the component or requirement level to the
target quantity. See `previous_renewals.md` → `calculateCertificationProgress`
for how these roll up into a single `certification_progress` number.

Note the mix of credit sources: some requirements have
`applied_training_ids` (training records in Aurora Fire's LMS that
counted), others have `manually_added_credit` (hours Sarah logged
directly without a training-record reference). Both contribute.

`previous_renewals.previous_renewals` is an empty list — this is
Sarah's first cycle, so there are no archived prior renewals yet.

## What this example demonstrates

Quick reference — this example exercises:

- `schema_version` on a top-level portable record
- `PersonSnapshot` in the `holder` and `instructor` slots, demonstrating
  that the snapshot type is slot-agnostic
- `PersonSnapshot.memberships` with an `OrgMembership` (the bounded
  snapshot capture)
- `CertType` with embedded `OrganizationSnapshot` (filling the
  certifying-agency slot), `ValidityPeriod`, `RenewalRequirements`, and
  its own `source`
- Provenance inheritance (holder, instructor inherit from parent) and
  explicit override (cert_type, certifying_agency, earned_via_taskbook
  each carry their own source)
- `canonical_source` granularity — simple catalog names, scoped names,
  and full URLs side by side
- Calendar-date serialization (`YYYY-MM-DD`) with `issuing_timezone`
- `CertStatus` as an explicit `"active"` affirmation
- Inline `cert_document.content` for portable exchange
- `EarnedViaTaskbook` linking the cert back to the taskbook that earned
  it
- Populated `RenewalProgress` mid-cycle, showing the full
  components + requirements tree with training-record-derived and
  manually-added credit
- Empty `previous_renewals` for a first-cycle cert

An implementer who can produce or consume this record — including all
its method-side semantics (`isCurrentlyValid` day-granularity evaluation
under the timezone cascade, the `Source`-based inheritance chain) — has
exercised the full v0.1 certification surface.
