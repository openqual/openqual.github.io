// Copyright 2026 FireCal LLC. Apache-2.0.
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

import 'codec.dart';
import 'renewal_progress.dart';

/// Immutable archived snapshot of a completed renewal cycle.
class PreviousRenewal {
  final DateTime archiveDate;
  final String? replacedPdfUrl;
  final double requiredCesAtArchiving;
  final double manuallyLoggedCesAtArchiving;
  final List<String> appliedTrainingIdsAtArchiving;
  final RenewalProgress renewalProgressAtArchiving;

  const PreviousRenewal({
    required this.archiveDate,
    this.replacedPdfUrl,
    required this.requiredCesAtArchiving,
    this.manuallyLoggedCesAtArchiving = 0.0,
    this.appliedTrainingIdsAtArchiving = const [],
    required this.renewalProgressAtArchiving,
  });

  /// Reads the wire shape produced by [toMap].
  factory PreviousRenewal.fromMap(Map<String, dynamic> m) => PreviousRenewal(
        archiveDate: readDateTime(m['archive_date'])!,
        replacedPdfUrl: m['replaced_pdf_url'] as String?,
        requiredCesAtArchiving:
            (m['required_ces_at_archiving'] as num).toDouble(),
        manuallyLoggedCesAtArchiving:
            (m['manually_logged_ces_at_archiving'] as num?)?.toDouble() ?? 0.0,
        appliedTrainingIdsAtArchiving:
            readStringList(m['applied_training_ids_at_archiving']),
        renewalProgressAtArchiving: RenewalProgress.fromMap(
            (m['renewal_progress_at_archiving'] as Map)
                .cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'archive_date': archiveDate,
        if (replacedPdfUrl != null) 'replaced_pdf_url': replacedPdfUrl,
        'required_ces_at_archiving': requiredCesAtArchiving,
        'manually_logged_ces_at_archiving': manuallyLoggedCesAtArchiving,
        'applied_training_ids_at_archiving': appliedTrainingIdsAtArchiving,
        'renewal_progress_at_archiving': renewalProgressAtArchiving.toMap(),
      };
}
