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
import 'renewal_requirement.dart';

class RenewalComponent {
  final String componentId;
  final int order;
  final String componentName;
  final double componentQuantity;
  final String componentUnits;
  final List<RenewalRequirement> requirements;

  /// Subject-matter topics training must cover to count toward this
  /// component, as authority-namespaced strings (see "Topic strings"
  /// in schemas/renewal_component.md). Empty means any topic in the
  /// discipline counts.
  final List<String> topics;

  const RenewalComponent({
    required this.componentId,
    required this.order,
    required this.componentName,
    required this.componentQuantity,
    required this.componentUnits,
    this.requirements = const [],
    this.topics = const [],
  });

  /// Reads the wire shape produced by [toMap].
  factory RenewalComponent.fromMap(Map<String, dynamic> m) =>
      RenewalComponent(
        componentId: m['component_id'] as String,
        order: (m['order'] as num).toInt(),
        componentName: m['component_name'] as String,
        componentQuantity: (m['component_quantity'] as num).toDouble(),
        componentUnits: m['component_units'] as String,
        requirements: readMapList(m['requirements'])
            .map(RenewalRequirement.fromMap)
            .toList(),
        topics: readStringList(m['topics']),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'component_id': componentId,
        'order': order,
        'component_name': componentName,
        'component_quantity': componentQuantity,
        'component_units': componentUnits,
        'requirements': requirements.map((r) => r.toMap()).toList(),
        'topics': topics,
      };
}
