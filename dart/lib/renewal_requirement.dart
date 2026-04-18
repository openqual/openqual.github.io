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

import 'enums.dart';

class RenewalRequirement {
  final String requirementId;
  final int order;
  final String requirementName;
  final String? requirementDisplayName;
  final String? requirementDescription;
  final double requirementQuantity;
  final RequirementUnits requirementUnits;

  const RenewalRequirement({
    required this.requirementId,
    required this.order,
    required this.requirementName,
    this.requirementDisplayName,
    this.requirementDescription,
    required this.requirementQuantity,
    this.requirementUnits = RequirementUnits.hours,
  });

  String get effectiveDisplayName =>
      requirementDisplayName ?? requirementName;
}
