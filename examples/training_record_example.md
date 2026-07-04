# TrainingRecord — Worked Example

A complete, realistic `TrainingRecord` showing every field in use, with
provenance filled in, an inline certificate of completion, a trainer
reference, and authority-namespaced topics that make the record
creditable against a renewal cycle.

Continues the scenario from `certification_example.md` — this is one of
the training events behind Sarah's 16 logged CE hours.

## The scenario

**Sarah Martinez** (firefighter/EMT, Aurora Fire Rescue) attended
"Pediatric Respiratory Emergencies," a two-hour evening session at
Aurora Fire's Station 8 training room on 2026-03-12. Her training
captain, **Michael Chen**, delivered it as a mixed lecture + skills
session — airway anatomy review, then hands-on BVM and suction
technique on pediatric manikins.

The session is CAPCE-accredited through Aurora Fire's learning
management integration, so the record carries a `capce` provider type
and the CAPCE activity number. It covers two NREMT National Continued
Competency Program topic areas at once — pediatric respiratory content
credits both the airway and pediatrics national topics — which is why
`topics` is a list.

The record below lives in **Aurora Fire's credentialing system**
(`aurora_fire_records`), the same host that holds Sarah's certification
record. When Sarah applies this training toward her NREMT renewal, the
certification's `renewal_progress` references this record by its
opaque ID (`applied_training_ids: ["tr-2026-0312-pedresp-martinez"]`) —
the linkage lives on the certification side, never here (a
`TrainingRecord` is application-agnostic evidence).

## The record

```json
{
  "schema_version": "1.0.0",

  "title": "Pediatric Respiratory Emergencies",
  "description": "Recognition and management of respiratory distress and failure in pediatric patients: anatomy review, assessment triangle, BVM technique, and suction skills practice on pediatric manikins.",

  "holder": {
    "display_name": "Sarah Martinez",
    "first_name": "Sarah",
    "last_name": "Martinez",
    "email": "sarah.martinez@auroragov.org",
    "source": {
      "canonical_id": "user-sm-4481",
      "canonical_source": "aurora_fire_records"
    }
  },

  "discipline": "ems",
  "training_type": "lecture_and_skills",

  "topics": [
    "NREMT: Airway, Respiration & Ventilation",
    "NREMT: Pediatrics"
  ],

  "start_and_end": {
    "start_time": "2026-03-12T18:00:00Z",
    "end_time": "2026-03-12T20:00:00Z",
    "duration_ms": 7200000,
    "duration_display": "2h"
  },

  "ce_units_earned": 2.0,

  "trainer": {
    "display_name": "Michael Chen",
    "first_name": "Michael",
    "last_name": "Chen",
    "email": "michael.chen@auroragov.org",
    "source": {
      "canonical_id": "user-mc-1094",
      "canonical_source": "aurora_fire_records"
    }
  },
  "trainer_credentials": "NREMT-P, CAPCE F5 instructor, AFR Training Captain",

  "location": {
    "venue": "Aurora Fire Station 8 training room",
    "city": "Aurora",
    "region": "CO",
    "postal_code": "80017",
    "country": "US"
  },

  "provider_type": "capce",
  "provider_id": "26-AFRX-F3-0412",

  "cert_document": {
    "name": "certificate-of-completion.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 48211,
    "uploaded_at": "2026-03-13T02:10:44Z",
    "uploaded_by": {
      "display_name": "Aurora Fire LMS",
      "source": {
        "canonical_id": "svc-lms",
        "canonical_source": "aurora_fire_records"
      }
    },
    "content": "JVBERi0xLjcKJeLjz9MK... (base64 elided for the example)",
    "content_encoding": "base64"
  },

  "attachments": [],
  "attachment_history": [],

  "notes": "Session ran 10 minutes over on the skills rotation; all attendees completed both stations.",

  "source": {
    "canonical_id": "tr-2026-0312-pedresp-martinez",
    "canonical_source": "aurora_fire_records"
  }
}
```

## Reading notes

- **`topics` do the renewal matching.** The two authority-namespaced
  strings intersect the `topics` lists on the NREMT renewal
  requirements in the certification example — that intersection (plus
  the matching `discipline`) is what makes this record a *candidate*
  for those requirements. Actual crediting is a host/user decision;
  see "Matching semantics" in `schemas/training_record.md`.
- **`provider_type` is a trust signal, frozen at issue.** A
  CAPCE-accredited record is stronger evidence than a self-reported
  one. A receiving system MUST NOT upgrade it.
- **`ce_units_earned` is issuer-stated credit**, not derived from the
  duration — a 2-hour session could carry 1.5 or 2.0 units depending
  on the crediting authority's convention. There is deliberately no
  `manually_added_credit` here; bolt-on credit is a
  certification-side concept.
- **The inline `cert_document`** makes the record self-contained for
  exchange (`content` + `content_encoding`), per the single-document
  packaging profile in `docs/export_packaging.md`.
- **No roster, no enrollment, no delivery pipeline.** Michael's session
  had eleven attendees; that produced eleven independent
  `TrainingRecord`s, each holder-scoped. The session administration
  that produced them is host-application territory.
