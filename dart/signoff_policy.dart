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
import 'signoff_record.dart';

/// Defines who may sign off on a taskbook, section, or task.
class SignoffPolicy {
  final String id;
  final SignoffPolicyType type;
  final List<String> allowedUsers;
  final List<String> allowedOrgs;
  final List<String> allowedRoles;
  final bool completed;
  final DateTime? completionTimestamp;
  final SignoffRecord? signoffRecord;

  const SignoffPolicy({
    required this.id,
    required this.type,
    this.allowedUsers = const [],
    this.allowedOrgs = const [],
    this.allowedRoles = const [],
    this.completed = false,
    this.completionTimestamp,
    this.signoffRecord,
  });

  /// Returns whether [userId] is eligible to sign this policy.
  ///
  /// [taskbookOwnerId] is used only when [type] is [SignoffPolicyType.thisUser].
  ///
  /// [orgMemberships] maps organization ID to the list of roles [userId]
  /// holds in that organization. Membership is determined by the host
  /// application and passed in; this method does not fetch anything.
  bool isEligible(
    String userId,
    String taskbookOwnerId,
    Map<String, List<String>> orgMemberships,
  ) {
    switch (type) {
      case SignoffPolicyType.thisUser:
        return userId == taskbookOwnerId;

      case SignoffPolicyType.specifyUsers:
        return allowedUsers.contains(userId);

      case SignoffPolicyType.orgMembers:
        for (final orgId in allowedOrgs) {
          final roles = orgMemberships[orgId];
          if (roles == null) continue;
          if (allowedRoles.isEmpty) return true;
          if (allowedRoles.any(roles.contains)) return true;
        }
        return false;
    }
  }

  SignoffPolicy copyWith({
    bool? completed,
    DateTime? completionTimestamp,
    SignoffRecord? signoffRecord,
  }) {
    return SignoffPolicy(
      id: id,
      type: type,
      allowedUsers: allowedUsers,
      allowedOrgs: allowedOrgs,
      allowedRoles: allowedRoles,
      completed: completed ?? this.completed,
      completionTimestamp: completionTimestamp ?? this.completionTimestamp,
      signoffRecord: signoffRecord ?? this.signoffRecord,
    );
  }
}

/// Returns `true` if [policies] is OK given a [requireAll] flag.
/// An empty policy list is always OK.
bool signoffsOK(List<SignoffPolicy> policies, bool requireAll) {
  if (policies.isEmpty) return true;
  return requireAll
      ? policies.every((p) => p.completed)
      : policies.any((p) => p.completed);
}
