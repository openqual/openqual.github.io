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

class RenewalRequirementProgress {
  final String requirementId;
  final int order;
  final String requirementDisplayName;
  final String requirementUnits;
  final double requirementQuantity;
  final double requirementQuantityCompleted;
  final double effectiveQuantityCompleted;
  final List<String> appliedTrainingIds;
  final double manuallyAddedCredit;

  const RenewalRequirementProgress({
    required this.requirementId,
    required this.order,
    required this.requirementDisplayName,
    required this.requirementUnits,
    required this.requirementQuantity,
    this.requirementQuantityCompleted = 0.0,
    this.effectiveQuantityCompleted = 0.0,
    this.appliedTrainingIds = const [],
    this.manuallyAddedCredit = 0.0,
  });

  /// Reads the wire shape produced by [toMap].
  factory RenewalRequirementProgress.fromMap(Map<String, dynamic> m) =>
      RenewalRequirementProgress(
        requirementId: m['requirement_id'] as String,
        order: (m['order'] as num).toInt(),
        requirementDisplayName: m['requirement_display_name'] as String,
        requirementUnits: m['requirement_units'] as String,
        requirementQuantity: (m['requirement_quantity'] as num).toDouble(),
        requirementQuantityCompleted:
            (m['requirement_quantity_completed'] as num?)?.toDouble() ?? 0.0,
        effectiveQuantityCompleted:
            (m['effective_quantity_completed'] as num?)?.toDouble() ?? 0.0,
        appliedTrainingIds: readStringList(m['applied_training_ids']),
        manuallyAddedCredit:
            (m['manually_added_credit'] as num?)?.toDouble() ?? 0.0,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'requirement_id': requirementId,
        'order': order,
        'requirement_display_name': requirementDisplayName,
        'requirement_units': requirementUnits,
        'requirement_quantity': requirementQuantity,
        'requirement_quantity_completed': requirementQuantityCompleted,
        'effective_quantity_completed': effectiveQuantityCompleted,
        'applied_training_ids': appliedTrainingIds,
        'manually_added_credit': manuallyAddedCredit,
      };

  RenewalRequirementProgress copyWith({
    double? requirementQuantityCompleted,
    double? effectiveQuantityCompleted,
  }) {
    return RenewalRequirementProgress(
      requirementId: requirementId,
      order: order,
      requirementDisplayName: requirementDisplayName,
      requirementUnits: requirementUnits,
      requirementQuantity: requirementQuantity,
      requirementQuantityCompleted:
          requirementQuantityCompleted ?? this.requirementQuantityCompleted,
      effectiveQuantityCompleted:
          effectiveQuantityCompleted ?? this.effectiveQuantityCompleted,
      appliedTrainingIds: appliedTrainingIds,
      manuallyAddedCredit: manuallyAddedCredit,
    );
  }
}
