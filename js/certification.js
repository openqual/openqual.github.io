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
const { CertType } = require('./cert_type');
const { readDate, dateToIso } = require('./codec');
const { neverExpireDate, openqualSchemaVersion } = require('./constants');
const { CertStatus } = require('./enums');
const { PersonSnapshot } = require('./person_snapshot');
const { PreviousRenewals } = require('./previous_renewals');
const { RenewalProgress } = require('./renewal_progress');
const { Source } = require('./source');

/**
 * Truncates a Date to the start of its UTC calendar day. Used by
 * Certification#isCurrentlyValid for day-granularity comparisons
 * under the cascade's UTC fallback.
 */
function _dayUtc(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

class Certification {
  constructor({
    schemaVersion = openqualSchemaVersion,
    holder,
    certType,
    certificationDate = null,
    expirationDate = null,
    issuedCertId = null,
    issuingLocality = null,
    issuingTimezone = null,
    status = null,
    instructor = null,
    certDocument = null,
    earnedViaTaskbook = null,
    renewalProgress = null,
    previousRenewals = null,
    attachments = [],
    notes = null,
    source = null,
  }) {
    this.schemaVersion = schemaVersion;
    this.holder = holder;
    this.certType = certType;
    this.certificationDate = certificationDate;
    this.expirationDate = expirationDate;
    this.issuedCertId = issuedCertId;
    this.issuingLocality = issuingLocality;
    this.issuingTimezone = issuingTimezone;
    this.status = status;
    this.instructor = instructor;
    this.certDocument = certDocument;
    this.earnedViaTaskbook = earnedViaTaskbook;
    this.renewalProgress = renewalProgress;
    this.previousRenewals = previousRenewals;
    this.attachments = Object.freeze([...attachments]);
    this.notes = notes;
    this.source = source;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new Certification({
      schemaVersion: m.schema_version ?? openqualSchemaVersion,
      holder: PersonSnapshot.fromJSON(m.holder),
      certType: CertType.fromJSON(m.cert_type),
      certificationDate: readDate(m.certification_date),
      expirationDate: readDate(m.expiration_date),
      issuedCertId: m.issued_cert_id ?? null,
      issuingLocality: m.issuing_locality ?? null,
      issuingTimezone: m.issuing_timezone ?? null,
      status: m.status ?? null,
      instructor: m.instructor == null ? null : PersonSnapshot.fromJSON(m.instructor),
      certDocument:
        m.cert_document == null ? null : Attachment.fromJSON(m.cert_document),
      earnedViaTaskbook:
        m.earned_via_taskbook == null
          ? null
          : EarnedViaTaskbook.fromJSON(m.earned_via_taskbook),
      renewalProgress:
        m.renewal_progress == null
          ? null
          : RenewalProgress.fromJSON(m.renewal_progress),
      previousRenewals:
        m.previous_renewals == null
          ? null
          : PreviousRenewals.fromJSON(m.previous_renewals),
      attachments: (m.attachments ?? []).map((a) => Attachment.fromJSON(a)),
      notes: m.notes ?? null,
      source: m.source == null ? null : Source.fromJSON(m.source),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      schema_version: this.schemaVersion,
      holder: this.holder.toJSON(),
      cert_type: this.certType.toJSON(),
    };
    if (this.certificationDate != null) {
      out.certification_date = dateToIso(this.certificationDate);
    }
    if (this.expirationDate != null) {
      out.expiration_date = dateToIso(this.expirationDate);
    }
    if (this.issuedCertId != null) out.issued_cert_id = this.issuedCertId;
    if (this.issuingLocality != null) out.issuing_locality = this.issuingLocality;
    if (this.issuingTimezone != null) out.issuing_timezone = this.issuingTimezone;
    if (this.status != null) out.status = this.status;
    if (this.instructor != null) out.instructor = this.instructor.toJSON();
    if (this.certDocument != null) out.cert_document = this.certDocument.toJSON();
    if (this.earnedViaTaskbook != null) {
      out.earned_via_taskbook = this.earnedViaTaskbook.toJSON();
    }
    if (this.renewalProgress != null) {
      out.renewal_progress = this.renewalProgress.toJSON();
    }
    if (this.previousRenewals != null) {
      out.previous_renewals = this.previousRenewals.toJSON();
    }
    out.attachments = this.attachments.map((a) => a.toJSON());
    if (this.notes != null) out.notes = this.notes;
    if (this.source != null) out.source = this.source.toJSON();
    return out;
  }

  /**
   * Pure. Returns true iff the certification is valid at the given instant.
   *
   * See schemas/certification.md for the full rule. Summary:
   *   1. status in {revoked, suspended, expired} -> false
   *   2. certification_date day in future -> false
   *   3. no expiration or lifetime -> true
   *   4. today <= expiration day -> true, else false
   *
   * Comparisons happen at day granularity. The reference implementation
   * evaluates in UTC (step 2 of the timezone cascade in
   * schemas/certification.md). Implementers with timezone libraries can
   * override to honor issuingTimezone (step 1 of the cascade) when present.
   *
   * @param {Date} now
   * @returns {boolean}
   */
  isCurrentlyValid(now) {
    if (this.status === CertStatus.REVOKED ||
        this.status === CertStatus.SUSPENDED ||
        this.status === CertStatus.EXPIRED) {
      return false;
    }
    // Sentinel check on raw Date before any conversion.
    if (this.expirationDate != null &&
        this.expirationDate.getTime() === neverExpireDate.getTime()) {
      if (this.certificationDate != null &&
          _dayUtc(now) < _dayUtc(this.certificationDate)) {
        return false;
      }
      return true;
    }
    const today = _dayUtc(now);
    if (this.certificationDate != null) {
      if (today < _dayUtc(this.certificationDate)) return false;
    }
    if (this.expirationDate == null) return true;
    const expDay = _dayUtc(this.expirationDate);
    return today <= expDay;
  }
}

/**
 * Snapshot of a specific taskbook completion that earned a Certification.
 * Instance-level — records what happened, not what a cert type is supposed
 * to be earned by. See schemas/certification.md → "Earned-via linkage".
 */
class EarnedViaTaskbook {
  constructor({ taskbookTitle, completedAt, source = null }) {
    this.taskbookTitle = taskbookTitle;
    this.completedAt = completedAt;
    this.source = source;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new EarnedViaTaskbook({
      taskbookTitle: m.taskbook_title,
      completedAt: readDate(m.completed_at),
      source: m.source == null ? null : Source.fromJSON(m.source),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {
      taskbook_title: this.taskbookTitle,
      completed_at: dateToIso(this.completedAt),
    };
    if (this.source != null) out.source = this.source.toJSON();
    return out;
  }
}

module.exports = { Certification, EarnedViaTaskbook };
