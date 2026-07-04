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
import 'renewal_requirement_progress.dart';

class RenewalComponentProgress {
  final String componentId;
  final int order;
  final String componentName;
  final String componentUnits;
  final double componentQuantity;
  final double componentQuantityCompleted;
  final double effectiveQuantityCompleted;
  final List<RenewalRequirementProgress> requirements;
  final List<String> appliedTrainingIds;
  final double manuallyAddedCredit;

  const RenewalComponentProgress({
    required this.componentId,
    required this.order,
    required this.componentName,
    required this.componentUnits,
    required this.componentQuantity,
    this.componentQuantityCompleted = 0.0,
    this.effectiveQuantityCompleted = 0.0,
    this.requirements = const [],
    this.appliedTrainingIds = const [],
    this.manuallyAddedCredit = 0.0,
  });

  /// Reads the wire shape produced by [toMap].
  factory RenewalComponentProgress.fromMap(Map<String, dynamic> m) =>
      RenewalComponentProgress(
        componentId: m['component_id'] as String,
        order: (m['order'] as num).toInt(),
        componentName: m['component_name'] as String,
        componentUnits: m['component_units'] as String,
        componentQuantity: (m['component_quantity'] as num).toDouble(),
        componentQuantityCompleted:
            (m['component_quantity_completed'] as num?)?.toDouble() ?? 0.0,
        effectiveQuantityCompleted:
            (m['effective_quantity_completed'] as num?)?.toDouble() ?? 0.0,
        requirements: readMapList(m['requirements'])
            .map(RenewalRequirementProgress.fromMap)
            .toList(),
        appliedTrainingIds: readStringList(m['applied_training_ids']),
        manuallyAddedCredit:
            (m['manually_added_credit'] as num?)?.toDouble() ?? 0.0,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'component_id': componentId,
        'order': order,
        'component_name': componentName,
        'component_units': componentUnits,
        'component_quantity': componentQuantity,
        'component_quantity_completed': componentQuantityCompleted,
        'effective_quantity_completed': effectiveQuantityCompleted,
        'requirements': requirements.map((r) => r.toMap()).toList(),
        'applied_training_ids': appliedTrainingIds,
        'manually_added_credit': manuallyAddedCredit,
      };

  RenewalComponentProgress copyWith({
    double? componentQuantityCompleted,
    double? effectiveQuantityCompleted,
    List<RenewalRequirementProgress>? requirements,
  }) {
    return RenewalComponentProgress(
      componentId: componentId,
      order: order,
      componentName: componentName,
      componentUnits: componentUnits,
      componentQuantity: componentQuantity,
      componentQuantityCompleted:
          componentQuantityCompleted ?? this.componentQuantityCompleted,
      effectiveQuantityCompleted:
          effectiveQuantityCompleted ?? this.effectiveQuantityCompleted,
      requirements: requirements ?? this.requirements,
      appliedTrainingIds: appliedTrainingIds,
      manuallyAddedCredit: manuallyAddedCredit,
    );
  }
}
