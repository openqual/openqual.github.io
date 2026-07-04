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
import 'renewal_component.dart';

class RenewalRequirements {
  final String requirementsVersion;
  final List<RenewalComponent> components;

  const RenewalRequirements({
    required this.requirementsVersion,
    this.components = const [],
  });

  /// Reads the wire shape produced by [toMap].
  factory RenewalRequirements.fromMap(Map<String, dynamic> m) =>
      RenewalRequirements(
        requirementsVersion: m['requirements_version'] as String,
        components: readMapList(m['components'])
            .map(RenewalComponent.fromMap)
            .toList(),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'requirements_version': requirementsVersion,
        'components': components.map((c) => c.toMap()).toList(),
      };
}
