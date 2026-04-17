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

import 'attachment.dart';
import 'cert_type.dart';
import 'constants.dart';
import 'enums.dart';
import 'person_snapshot.dart';
import 'previous_renewals.dart';
import 'renewal_progress.dart';
import 'source.dart';

/// A portable representation of a person's certification.
class Certification {
  final String schemaVersion;
  final PersonSnapshot holder;
  final CertType certType;
  final DateTime? certificationDate;
  final DateTime? expirationDate;
  final String? issuedCertId;
  final String? issuingLocality;
  final CertStatus? status;
  final PersonSnapshot? instructor;
  final Attachment? certDocument;
  final RenewalProgress? renewalProgress;
  final PreviousRenewals? previousRenewals;
  final List<Attachment> attachments;
  final String? notes;
  final Source? source;

  const Certification({
    this.schemaVersion = openqualSchemaVersion,
    required this.holder,
    required this.certType,
    this.certificationDate,
    this.expirationDate,
    this.issuedCertId,
    this.issuingLocality,
    this.status,
    this.instructor,
    this.certDocument,
    this.renewalProgress,
    this.previousRenewals,
    this.attachments = const [],
    this.notes,
    this.source,
  });

  /// Pure. Returns `true` iff the certification is valid at [now].
  ///
  /// See schemas/certification.md for the full rule. Summary:
  ///   1. status in {revoked, suspended, expired} -> false
  ///   2. certification_date in future -> false
  ///   3. no expiration or lifetime -> true
  ///   4. now before expiration -> true, else false
  bool isCurrentlyValid(DateTime now) {
    if (status == CertStatus.revoked ||
        status == CertStatus.suspended ||
        status == CertStatus.expired) {
      return false;
    }
    if (certificationDate != null && now.isBefore(certificationDate!)) {
      return false;
    }
    if (expirationDate == null) return true;
    if (expirationDate == neverExpireDate) return true;
    return now.isBefore(expirationDate!);
  }
}
