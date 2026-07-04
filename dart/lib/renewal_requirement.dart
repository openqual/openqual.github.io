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
import 'enums.dart';
import 'wire.dart';

class RenewalRequirement {
  final String requirementId;
  final int order;
  final String requirementName;
  final String? requirementDisplayName;
  final String? requirementDescription;
  final double requirementQuantity;
  final RequirementUnits requirementUnits;

  /// Subject-matter topics training must cover to count toward this
  /// requirement, as authority-namespaced strings (see "Topic strings"
  /// in schemas/renewal_component.md). Empty means any topic in the
  /// discipline counts.
  final List<String> topics;

  const RenewalRequirement({
    required this.requirementId,
    required this.order,
    required this.requirementName,
    this.requirementDisplayName,
    this.requirementDescription,
    required this.requirementQuantity,
    this.requirementUnits = RequirementUnits.hours,
    this.topics = const [],
  });

  /// Reads the wire shape produced by [toMap].
  factory RenewalRequirement.fromMap(Map<String, dynamic> m) =>
      RenewalRequirement(
        requirementId: m['requirement_id'] as String,
        order: (m['order'] as num).toInt(),
        requirementName: m['requirement_name'] as String,
        requirementDisplayName: m['requirement_display_name'] as String?,
        requirementDescription: m['requirement_description'] as String?,
        requirementQuantity: (m['requirement_quantity'] as num).toDouble(),
        requirementUnits: m['requirement_units'] == null
            ? RequirementUnits.hours
            : requirementUnitsFromWire(m['requirement_units'] as String),
        topics: readStringList(m['topics']),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'requirement_id': requirementId,
        'order': order,
        'requirement_name': requirementName,
        if (requirementDisplayName != null)
          'requirement_display_name': requirementDisplayName,
        if (requirementDescription != null)
          'requirement_description': requirementDescription,
        'requirement_quantity': requirementQuantity,
        'requirement_units': wireValue(requirementUnits),
        'topics': topics,
      };

  String get effectiveDisplayName =>
      requirementDisplayName ?? requirementName;
}
