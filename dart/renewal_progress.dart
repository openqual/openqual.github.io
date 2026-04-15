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
import 'renewal_component_progress.dart';

class RenewalProgress {
  final String requirementsVersion;
  final List<RenewalComponentProgress> components;

  const RenewalProgress({
    required this.requirementsVersion,
    this.components = const [],
  });

  /// Pure. Returns the renewal's current status.
  RenewalStatus computeStatus({
    required double ceUnitsRequired,
    required double ceUnitsEarned,
    DateTime? dueDate,
    required DateTime now,
  }) {
    if (ceUnitsEarned >= ceUnitsRequired) return RenewalStatus.complete;
    if (dueDate != null && now.isAfter(dueDate)) return RenewalStatus.overdue;
    if (ceUnitsEarned > 0) return RenewalStatus.inProgress;
    return RenewalStatus.notStarted;
  }
}
