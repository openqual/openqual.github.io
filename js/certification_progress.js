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

'use strict';

/**
 * Pure. Computes CE units earned and renewal progress across components
 * and their requirements.
 *
 * This function does NO I/O. All training-unit totals are pre-computed
 * sums passed in by the caller.
 *
 * @param {object} args
 * @param {RenewalComponentProgress[]} args.components
 * @param {number} args.ceUnitsRequired
 * @param {number} [args.certManuallyAddedCredit=0]
 * @param {number} [args.certAppliedTrainingUnitTotals=0]
 * @param {Object<string, number>} [args.componentAppliedTrainingUnitTotals={}]
 * @param {Object<string, number>} [args.requirementAppliedTrainingUnitTotals={}]
 * @returns {{ ceUnitsEarned: number, certificationProgress: number, updatedComponents: RenewalComponentProgress[] }}
 */
function calculateCertificationProgress({
  components,
  ceUnitsRequired,
  certManuallyAddedCredit = 0,
  certAppliedTrainingUnitTotals = 0,
  componentAppliedTrainingUnitTotals = {},
  requirementAppliedTrainingUnitTotals = {},
}) {
  let totalEffectiveCEUnits = 0;
  const updatedComponents = [];

  for (const comp of components) {
    let componentTotalCompleted = 0;
    const updatedReqs = [];

    for (const req of comp.requirements) {
      const trainingUnits =
        requirementAppliedTrainingUnitTotals[req.requirementId] || 0;
      const completed = req.manuallyAddedCredit + trainingUnits;
      const effective =
        completed < req.requirementQuantity
          ? completed
          : req.requirementQuantity;

      updatedReqs.push(
        req._with({
          requirementQuantityCompleted: completed,
          effectiveQuantityCompleted: effective,
        }),
      );
      componentTotalCompleted += effective;
    }

    const compTrainingUnits =
      componentAppliedTrainingUnitTotals[comp.componentId] || 0;
    componentTotalCompleted += comp.manuallyAddedCredit + compTrainingUnits;

    const componentEffective =
      componentTotalCompleted < comp.componentQuantity
        ? componentTotalCompleted
        : comp.componentQuantity;

    updatedComponents.push(
      comp._with({
        componentQuantityCompleted: componentTotalCompleted,
        effectiveQuantityCompleted: componentEffective,
        requirements: updatedReqs,
      }),
    );
    totalEffectiveCEUnits += componentEffective;
  }

  const ceUnitsEarned =
    totalEffectiveCEUnits +
    certManuallyAddedCredit +
    certAppliedTrainingUnitTotals;

  const certificationProgress =
    ceUnitsRequired > 0
      ? Math.max(0, Math.min(1, ceUnitsEarned / ceUnitsRequired))
      : 1.0;

  return {
    ceUnitsEarned,
    certificationProgress,
    updatedComponents,
  };
}

module.exports = { calculateCertificationProgress };
