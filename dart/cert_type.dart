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

import 'certifying_agency.dart';
import 'enums.dart';
import 'renewal_requirements.dart';
import 'source.dart';
import 'validity_period.dart';

/// Portable definition of a certification type.
class CertType {
  final String name;
  final String? level;
  final String? abbreviation;
  final String? displayName;
  final Discipline discipline;
  final String? disciplineOther;
  final CertClassification classification;
  final String? classificationOther;
  final ValidityPeriod? validityPeriod;
  final String? standardCode;
  final String? standardEdition;
  final RenewalRequirements? renewalRequirements;
  final CertifyingAgency? certifyingAgency;
  final Source? source;

  const CertType({
    required this.name,
    this.level,
    this.abbreviation,
    this.displayName,
    required this.discipline,
    this.disciplineOther,
    this.classification = CertClassification.certification,
    this.classificationOther,
    this.validityPeriod,
    this.standardCode,
    this.standardEdition,
    this.renewalRequirements,
    this.certifyingAgency,
    this.source,
  });
}
