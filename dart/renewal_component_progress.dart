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
