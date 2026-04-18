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
  final String? issuingTimezone;
  final CertStatus? status;
  final PersonSnapshot? instructor;
  final Attachment? certDocument;
  final EarnedViaTaskbook? earnedViaTaskbook;
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
    this.issuingTimezone,
    this.status,
    this.instructor,
    this.certDocument,
    this.earnedViaTaskbook,
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
  ///   2. certification_date day in future -> false
  ///   3. no expiration or lifetime -> true
  ///   4. today <= expiration day -> true, else false
  ///
  /// Comparisons happen at day granularity. The reference implementation
  /// evaluates in UTC (step 2 of the timezone cascade in
  /// schemas/certification.md). Implementers with timezone libraries
  /// can override this method to honor [issuingTimezone] (step 1 of
  /// the cascade) when present.
  bool isCurrentlyValid(DateTime now) {
    if (status == CertStatus.revoked ||
        status == CertStatus.suspended ||
        status == CertStatus.expired) {
      return false;
    }
    // Sentinel check on raw DateTime before any conversion.
    if (expirationDate != null && expirationDate == neverExpireDate) {
      // Lifetime cert — skip date comparison, but still honor pre-effective.
      if (certificationDate != null &&
          _dayUtc(now).isBefore(_dayUtc(certificationDate!))) {
        return false;
      }
      return true;
    }
    final today = _dayUtc(now);
    if (certificationDate != null) {
      if (today.isBefore(_dayUtc(certificationDate!))) return false;
    }
    if (expirationDate == null) return true;
    final expDay = _dayUtc(expirationDate!);
    return !today.isAfter(expDay); // today <= expDay
  }

  /// Truncates [dt] to the start of its UTC calendar day. Used by
  /// [isCurrentlyValid] for day-granularity comparisons under the
  /// cascade's UTC fallback.
  DateTime _dayUtc(DateTime dt) {
    final u = dt.toUtc();
    return DateTime.utc(u.year, u.month, u.day);
  }
}

/// Snapshot of a specific taskbook completion that earned a
/// [Certification]. Instance-level — records what happened, not what
/// a cert type is supposed to be earned by. See
/// schemas/certification.md → "Earned-via linkage".
class EarnedViaTaskbook {
  final String taskbookTitle;
  final DateTime completedAt;
  final Source? source;

  const EarnedViaTaskbook({
    required this.taskbookTitle,
    required this.completedAt,
    this.source,
  });
}
