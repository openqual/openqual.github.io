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

import 'renewal_requirement.dart';

class RenewalComponent {
  final String componentId;
  final int order;
  final String componentName;
  final double componentQuantity;
  final String componentUnits;
  final List<RenewalRequirement> requirements;

  const RenewalComponent({
    required this.componentId,
    required this.order,
    required this.componentName,
    required this.componentQuantity,
    required this.componentUnits,
    this.requirements = const [],
  });
}
