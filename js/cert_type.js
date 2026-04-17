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

const { CertClassification } = require('./enums');

class CertType {
  constructor({
    name,
    level = null,
    abbreviation = null,
    displayName = null,
    discipline,
    disciplineOther = null,
    classification = CertClassification.CERTIFICATION,
    classificationOther = null,
    validityPeriod = null,
    standardCode = null,
    standardEdition = null,
    renewalRequirements = null,
    certifyingAgency = null,
    source = null,
  }) {
    this.name = name;
    this.level = level;
    this.abbreviation = abbreviation;
    this.displayName = displayName;
    this.discipline = discipline;
    this.disciplineOther = disciplineOther;
    this.classification = classification;
    this.classificationOther = classificationOther;
    this.validityPeriod = validityPeriod;
    this.standardCode = standardCode;
    this.standardEdition = standardEdition;
    this.renewalRequirements = renewalRequirements;
    this.certifyingAgency = certifyingAgency;
    this.source = source;
    Object.freeze(this);
  }
}

module.exports = { CertType };
