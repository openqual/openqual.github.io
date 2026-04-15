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
}
