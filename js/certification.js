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

class Certification {
  constructor({
    schemaVersion = openqualSchemaVersion,
    holder,
    certType,
    certificationDate = null,
    expirationDate = null,
    issuedCertId = null,
    issuingLocality = null,
    instructor = null,
    certDocument = null,
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
    this.instructor = instructor;
    this.certDocument = certDocument;
    this.renewalProgress = renewalProgress;
    this.previousRenewals = previousRenewals;
    this.attachments = Object.freeze([...attachments]);
    this.notes = notes;
    this.source = source;
    Object.freeze(this);
  }

  /**
   * Pure. Returns true iff the certification is valid at the given instant.
   * @param {Date} now
   * @returns {boolean}
   */
  isCurrentlyValid(now) {
    if (this.certificationDate != null && now < this.certificationDate) return false;
    if (this.expirationDate == null) return true;
    if (this.expirationDate.getTime() === neverExpireDate.getTime()) return true;
    return now < this.expirationDate;
  }
}

module.exports = { Certification };
