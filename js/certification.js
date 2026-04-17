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

const { neverExpireDate, openqualSchemaVersion } = require('./constants');
const { CertStatus } = require('./enums');

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
}

module.exports = { Certification, EarnedViaTaskbook };
