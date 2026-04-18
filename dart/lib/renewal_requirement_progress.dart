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
