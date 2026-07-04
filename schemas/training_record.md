# TrainingRecord

A portable record of a training event a person completed — the evidence
unit that feeds certification renewal. Sits alongside `Certification` as
a root-exchangeable type: a responder's training history travels with
them the same way their credentials do.

This is the "Tier A" shape: a complete, standalone, round-trippable
record with no dependency on any taxonomy catalog. A training record is
useful before any renewal linkage exists — it documents what training
happened, who delivered it, and what credit it carries.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schema_version` | `String` | Yes | Version of the OpenQual standard this record was produced against. See `constants.md` and `README.md` → "Schema versioning." |
| `title` | `String` | Yes | Display name of the training, e.g. "Pediatric Respiratory Distress". |
| `description` | `String?` | No | Prose description. |
| `holder` | `PersonSnapshot` | Yes | Frozen identity of the person who completed the training. |
| `discipline` | `Discipline?` | No | Primary discipline area. Reuses the standard `Discipline` enum — the same axis `CertType.discipline` uses, so training ↔ cert matching needs no new vocabulary. Use `other` + `discipline_other`. |
| `discipline_other` | `String?` | No | Required when `discipline = other`. |
| `training_type` | `TrainingType?` | No | Delivery modality (lecture, skills, clinical, …). See the `TrainingType` enum in `README.md`. Optional — many legacy records won't know. |
| `training_type_other` | `String?` | No | Required when `training_type = other`; descriptive modality string. Same escape-hatch pattern as `discipline_other`. |
| `topics` | `List<String>` | Yes | Subject-matter topics this training covered, as authority-namespaced strings (see "Topic strings" in `renewal_component.md`). May be empty. One session often covers several (a pediatric respiratory lecture covers both `"NREMT: Pediatric"` and `"NREMT: Airway"`). |
| `start_and_end` | `StartAndEndTimes?` | No | When the training happened; carries the derived duration. |
| `ce_units_earned` | `double?` | No | Continuing-education credit this training carries, in the units convention of the crediting authority (typically hours). This is the user-entered / issuer-stated value — a `TrainingRecord` deliberately has **no** `manually_added_credit` field; bolt-on credit is a certification-level concept (see `renewal_component_progress.md`). |
| `trainer` | `PersonSnapshot?` | No | Frozen identity of the trainer / instructor. `PersonSnapshot.email` and `source` carry contact + provenance; credentials prose goes in `trainer_credentials`. |
| `trainer_credentials` | `String?` | No | Free-form statement of the trainer's qualifications as presented, e.g. "NREMT-P, CAPCE F5 instructor". |
| `location` | `TrainingLocation?` | No | Where the training happened. |
| `provider_type` | `VerificationProvider?` | No | Trust classification of the record's origin. See the `VerificationProvider` enum in `README.md`. |
| `provider_id` | `String?` | No | External registrar / provider identifier when `provider_type` warrants one (e.g. a CAPCE course number). |
| `cert_document` | `Attachment?` | No | The digitized certificate of completion — same first-class role `Certification.cert_document` plays. Populate `content` (inline base64) on records intended for exchange. |
| `attachments` | `List<Attachment>` | Yes | Supplementary evidence. May be empty. |
| `attachment_history` | `List<Attachment>` | Yes | Prior versions of `cert_document` that were replaced, oldest → newest. May be empty. Compliance exports are stronger when the replacement trail travels with the record. |
| `notes` | `String?` | No | Free-form notes. |
| `source` | `Source?` | No | Source attribution. Nested types inherit per the provenance rule in `source.md`. |

## Nested types

### `TrainingLocation`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `venue` | `String?` | No | Facility / venue name, e.g. "Station 3 training tower". |
| `city` | `String?` | No | |
| `region` | `String?` | No | State / province / region. |
| `postal_code` | `String?` | No | |
| `country` | `String?` | No | ISO 3166-1 alpha-2 code recommended when known. |

## What a TrainingRecord is not

- **Not a roster.** Attendance rosters, enrollment lifecycles, and
  session administration are host-application concerns. A
  `TrainingRecord` is one person's completed-training evidence; the
  session that produced it is not modeled here.
- **Not a delivery pipeline.** Certificate-generation status,
  processing errors, and notification plumbing stay host-side.
- **Not renewal progress.** Applying a training record toward a
  renewal requirement is expressed on the certification side
  (`RenewalComponentProgress.applied_training_ids` /
  `RenewalRequirementProgress.applied_training_ids` reference training
  records by opaque ID). The `TrainingRecord` itself stays
  application-agnostic evidence.

## Notes

- **Matching semantics** (training → renewal requirement), for
  implementations that offer credit suggestions: a training is a
  candidate for a requirement when (a) disciplines match (or either
  side is null) AND (b) `training.topics` intersects the requirement's
  `topics` (or the requirement's `topics` is empty, meaning any topic
  in the discipline counts). Actual crediting is always a host/user
  decision; this is a suggestion heuristic, not a conformance rule.
- `provider_type` carries a real trust signal — a CAPCE-accredited
  record is different evidence than a self-reported one. Receivers
  MUST NOT upgrade `provider_type` on records from another producer
  (snapshot-frozen like all audit data).
