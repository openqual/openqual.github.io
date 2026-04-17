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
import 'person_snapshot.dart';
import 'previous_renewals.dart';
import 'renewal_progress.dart';
import 'source.dart';

/// A portable representation of a person's certification.
class Certification {
  final PersonSnapshot holder;
  final CertType certType;
  final DateTime? certificationDate;
  final DateTime? expirationDate;
  final String? issuedCertId;
  final String? issuingLocality;
  final PersonSnapshot? instructor;
  final Attachment? certDocument;
  final RenewalProgress? renewalProgress;
  final PreviousRenewals? previousRenewals;
  final List<Attachment> attachments;
  final String? notes;
  final Source? source;

  const Certification({
    required this.holder,
    required this.certType,
    this.certificationDate,
    this.expirationDate,
    this.issuedCertId,
    this.issuingLocality,
    this.instructor,
    this.certDocument,
    this.renewalProgress,
    this.previousRenewals,
    this.attachments = const [],
    this.notes,
    this.source,
  });

  /// Pure. Returns `true` iff the certification is valid at [now].
  bool isCurrentlyValid(DateTime now) {
    if (expirationDate == null) return true;
    if (expirationDate == neverExpireDate) return true;
    return now.isBefore(expirationDate!);
  }
}
