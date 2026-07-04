// Copyright 2026 FireCal LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const { Attachment } = require('./attachment');
const { openqualSchemaVersion } = require('./constants');
const { PersonSnapshot } = require('./person_snapshot');
const { Source } = require('./source');
const { StartAndEndTimes } = require('./start_and_end_times');

/**
 * A portable record of a training event a person completed — the
 * evidence unit that feeds certification renewal. Sits alongside
 * Certification as a root-exchangeable type. See
 * schemas/training_record.md.
 *
 * This is the "Tier A" shape: a complete, standalone, round-trippable
 * record with no dependency on any taxonomy catalog. Rosters,
 * enrollment lifecycles, and delivery pipelines are host-application
 * concerns and are deliberately not modeled here.
 */
class TrainingRecord {
  constructor({
    schemaVersion = openqualSchemaVersion,
    title,
    description = null,
    holder,
    discipline = null,
    disciplineOther = null,
    trainingType = null,
    trainingTypeOther = null,
    topics = [],
    startAndEnd = null,
    ceUnitsEarned = null,
    trainer = null,
    trainerCredentials = null,
    location = null,
    providerType = null,
    providerId = null,
    certDocument = null,
    attachments = [],
    attachmentHistory = [],
    notes = null,
    source = null,
  }) {
    this.schemaVersion = schemaVersion;
    // Display name of the training, e.g. "Pediatric Respiratory
    // Distress".
    this.title = title;
    this.description = description;
    // Frozen identity of the person who completed the training.
    this.holder = holder;
    // Primary discipline area — the same axis CertType.discipline uses,
    // so training ↔ cert matching needs no new vocabulary.
    this.discipline = discipline;
    // Required when discipline is Discipline.OTHER.
    this.disciplineOther = disciplineOther;
    // Delivery modality (lecture, skills, clinical, …). Optional —
    // many legacy records won't know.
    this.trainingType = trainingType;
    // Required when trainingType is TrainingType.OTHER.
    this.trainingTypeOther = trainingTypeOther;
    // Subject-matter topics this training covered, as
    // authority-namespaced strings (see "Topic strings" in
    // schemas/renewal_component.md). May be empty.
    this.topics = Object.freeze([...topics]);
    // When the training happened; carries the derived duration.
    this.startAndEnd = startAndEnd;
    // Continuing-education credit this training carries, in the units
    // convention of the crediting authority (typically hours). The
    // user-entered / issuer-stated value.
    this.ceUnitsEarned = ceUnitsEarned;
    // Frozen identity of the trainer / instructor.
    this.trainer = trainer;
    // Free-form statement of the trainer's qualifications as presented,
    // e.g. "NREMT-P, CAPCE F5 instructor".
    this.trainerCredentials = trainerCredentials;
    this.location = location;
    // Trust classification of the record's origin. Receivers MUST NOT
    // upgrade this on records from another producer.
    this.providerType = providerType;
    // External registrar / provider identifier when providerType
    // warrants one (e.g. a CAPCE course number).
    this.providerId = providerId;
    // The digitized certificate of completion — same first-class role
    // Certification.cert_document plays.
    this.certDocument = certDocument;
    // Supplementary evidence. May be empty.
    this.attachments = Object.freeze([...attachments]);
    // Prior versions of certDocument that were replaced, oldest →
    // newest. May be empty.
    this.attachmentHistory = Object.freeze([...attachmentHistory]);
    this.notes = notes;
    this.source = source;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TrainingRecord({
      schemaVersion: m.schema_version ?? openqualSchemaVersion,
      title: m.title,
      description: m.description ?? null,
      holder: PersonSnapshot.fromJSON(m.holder),
      discipline: m.discipline ?? null,
      disciplineOther: m.discipline_other ?? null,
      trainingType: m.training_type ?? null,
      trainingTypeOther: m.training_type_other ?? null,
      topics: m.topics ?? [],
      startAndEnd:
        m.start_and_end == null ? null : StartAndEndTimes.fromJSON(m.start_and_end),
      ceUnitsEarned: m.ce_units_earned ?? null,
      trainer: m.trainer == null ? null : PersonSnapshot.fromJSON(m.trainer),
      trainerCredentials: m.trainer_credentials ?? null,
      location: m.location == null ? null : TrainingLocation.fromJSON(m.location),
      providerType: m.provider_type ?? null,
      providerId: m.provider_id ?? null,
      certDocument:
        m.cert_document == null ? null : Attachment.fromJSON(m.cert_document),
      attachments: (m.attachments ?? []).map((a) => Attachment.fromJSON(a)),
      attachmentHistory: (m.attachment_history ?? []).map((a) =>
        Attachment.fromJSON(a),
      ),
      notes: m.notes ?? null,
      source: m.source == null ? null : Source.fromJSON(m.source),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      schema_version: this.schemaVersion,
      title: this.title,
    };
    if (this.description != null) out.description = this.description;
    out.holder = this.holder.toJSON();
    if (this.discipline != null) out.discipline = this.discipline;
    if (this.disciplineOther != null) out.discipline_other = this.disciplineOther;
    if (this.trainingType != null) out.training_type = this.trainingType;
    if (this.trainingTypeOther != null) {
      out.training_type_other = this.trainingTypeOther;
    }
    out.topics = [...this.topics];
    if (this.startAndEnd != null) out.start_and_end = this.startAndEnd.toJSON();
    if (this.ceUnitsEarned != null) out.ce_units_earned = this.ceUnitsEarned;
    if (this.trainer != null) out.trainer = this.trainer.toJSON();
    if (this.trainerCredentials != null) {
      out.trainer_credentials = this.trainerCredentials;
    }
    if (this.location != null) out.location = this.location.toJSON();
    if (this.providerType != null) out.provider_type = this.providerType;
    if (this.providerId != null) out.provider_id = this.providerId;
    if (this.certDocument != null) out.cert_document = this.certDocument.toJSON();
    out.attachments = this.attachments.map((a) => a.toJSON());
    out.attachment_history = this.attachmentHistory.map((a) => a.toJSON());
    if (this.notes != null) out.notes = this.notes;
    if (this.source != null) out.source = this.source.toJSON();
    return out;
  }
}

/** Where a training happened. */
class TrainingLocation {
  constructor({
    venue = null,
    city = null,
    region = null,
    postalCode = null,
    country = null,
  } = {}) {
    // Facility / venue name, e.g. "Station 3 training tower".
    this.venue = venue;
    this.city = city;
    // State / province / region.
    this.region = region;
    this.postalCode = postalCode;
    // ISO 3166-1 alpha-2 code recommended when known.
    this.country = country;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new TrainingLocation({
      venue: m.venue ?? null,
      city: m.city ?? null,
      region: m.region ?? null,
      postalCode: m.postal_code ?? null,
      country: m.country ?? null,
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.venue != null) out.venue = this.venue;
    if (this.city != null) out.city = this.city;
    if (this.region != null) out.region = this.region;
    if (this.postalCode != null) out.postal_code = this.postalCode;
    if (this.country != null) out.country = this.country;
    return out;
  }
}

module.exports = { TrainingRecord, TrainingLocation };
