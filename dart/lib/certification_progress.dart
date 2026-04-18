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

import 'renewal_component_progress.dart';
import 'renewal_requirement_progress.dart';

/// Result of [calculateCertificationProgress].
class CertificationProgressResult {
  final double ceUnitsEarned;
  final double certificationProgress;
  final List<RenewalComponentProgress> updatedComponents;

  const CertificationProgressResult({
    required this.ceUnitsEarned,
    required this.certificationProgress,
    required this.updatedComponents,
  });
}

/// Pure. Computes CE units earned and renewal progress across components
/// and their requirements.
///
/// This function does NO I/O. All training-unit totals are pre-computed
/// sums passed in by the caller.
///
/// - [components]: the progress entries to compute over.
/// - [ceUnitsRequired]: the total CE units required for the certification.
/// - [certManuallyAddedCredit]: cert-level manual credit.
/// - [certAppliedTrainingUnitTotals]: pre-computed sum of `units_earned`
///   across training records applied at the cert level.
/// - [componentAppliedTrainingUnitTotals]: map keyed by `component_id`
///   giving pre-computed sums at each component level. Missing keys → 0.
/// - [requirementAppliedTrainingUnitTotals]: map keyed by `requirement_id`
///   giving pre-computed sums at each requirement level. Missing keys → 0.
CertificationProgressResult calculateCertificationProgress({
  required List<RenewalComponentProgress> components,
  required double ceUnitsRequired,
  double certManuallyAddedCredit = 0.0,
  double certAppliedTrainingUnitTotals = 0.0,
  Map<String, double> componentAppliedTrainingUnitTotals = const {},
  Map<String, double> requirementAppliedTrainingUnitTotals = const {},
}) {
  double totalEffectiveCEUnits = 0.0;
  final updatedComponents = <RenewalComponentProgress>[];

  for (final comp in components) {
    double componentTotalCompleted = 0.0;
    final updatedReqs = <RenewalRequirementProgress>[];

    for (final req in comp.requirements) {
      final trainingUnits =
          requirementAppliedTrainingUnitTotals[req.requirementId] ?? 0.0;
      final completed = req.manuallyAddedCredit + trainingUnits;
      final effective = completed < req.requirementQuantity
          ? completed
          : req.requirementQuantity;

      updatedReqs.add(req.copyWith(
        requirementQuantityCompleted: completed,
        effectiveQuantityCompleted: effective,
      ));
      componentTotalCompleted += effective;
    }

    final compTrainingUnits =
        componentAppliedTrainingUnitTotals[comp.componentId] ?? 0.0;
    componentTotalCompleted += comp.manuallyAddedCredit + compTrainingUnits;

    final componentEffective = componentTotalCompleted < comp.componentQuantity
        ? componentTotalCompleted
        : comp.componentQuantity;

    updatedComponents.add(comp.copyWith(
      componentQuantityCompleted: componentTotalCompleted,
      effectiveQuantityCompleted: componentEffective,
      requirements: updatedReqs,
    ));
    totalEffectiveCEUnits += componentEffective;
  }

  final ceUnitsEarned = totalEffectiveCEUnits +
      certManuallyAddedCredit +
      certAppliedTrainingUnitTotals;

  final certificationProgress = ceUnitsRequired > 0
      ? (ceUnitsEarned / ceUnitsRequired).clamp(0.0, 1.0)
      : 1.0;

  return CertificationProgressResult(
    ceUnitsEarned: ceUnitsEarned,
    certificationProgress: certificationProgress,
    updatedComponents: updatedComponents,
  );
}
