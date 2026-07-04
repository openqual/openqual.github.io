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

const { readDate, dateToIso } = require('./codec');
const { RenewalProgress } = require('./renewal_progress');

class PreviousRenewal {
  constructor({
    archiveDate,
    replacedPdfUrl = null,
    requiredCesAtArchiving,
    manuallyLoggedCesAtArchiving = 0.0,
    appliedTrainingIdsAtArchiving = [],
    renewalProgressAtArchiving,
  }) {
    this.archiveDate = archiveDate;
    this.replacedPdfUrl = replacedPdfUrl;
    this.requiredCesAtArchiving = requiredCesAtArchiving;
    this.manuallyLoggedCesAtArchiving = manuallyLoggedCesAtArchiving;
    this.appliedTrainingIdsAtArchiving = Object.freeze([
      ...appliedTrainingIdsAtArchiving,
    ]);
    this.renewalProgressAtArchiving = renewalProgressAtArchiving;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new PreviousRenewal({
      archiveDate: readDate(m.archive_date),
      replacedPdfUrl: m.replaced_pdf_url ?? null,
      requiredCesAtArchiving: m.required_ces_at_archiving,
      manuallyLoggedCesAtArchiving: m.manually_logged_ces_at_archiving ?? 0.0,
      appliedTrainingIdsAtArchiving: m.applied_training_ids_at_archiving ?? [],
      renewalProgressAtArchiving: RenewalProgress.fromJSON(
        m.renewal_progress_at_archiving,
      ),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = { archive_date: dateToIso(this.archiveDate) };
    if (this.replacedPdfUrl != null) out.replaced_pdf_url = this.replacedPdfUrl;
    out.required_ces_at_archiving = this.requiredCesAtArchiving;
    out.manually_logged_ces_at_archiving = this.manuallyLoggedCesAtArchiving;
    out.applied_training_ids_at_archiving = [...this.appliedTrainingIdsAtArchiving];
    out.renewal_progress_at_archiving = this.renewalProgressAtArchiving.toJSON();
    return out;
  }
}

module.exports = { PreviousRenewal };
