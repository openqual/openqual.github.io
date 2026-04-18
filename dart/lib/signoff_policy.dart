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
import 'organization_snapshot.dart';
import 'person_snapshot.dart';
import 'signoff_record.dart';

/// Defines who may sign off on a taskbook, section, or task.
class SignoffPolicy {
  final String id;
  final SignoffPolicyType type;
  final List<String> allowedUsers;
  final List<OrganizationSnapshot> allowedOrgs;
  final List<OrgRoles> allowedRoles;
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
  /// [orgMemberships] maps organization canonical ID (matching
  /// [OrganizationSnapshot.source.canonicalId]) to the list of roles
  /// [userId] holds in that organization. Un-sourced snapshots in
  /// [allowedOrgs] cannot be globally identified and will not match.
  /// See "Matching organizations" in schemas/signoff_policy.md.
  bool isEligible(
    String userId,
    String taskbookOwnerId,
    Map<String, List<OrgRoles>> orgMemberships,
  ) {
    switch (type) {
      case SignoffPolicyType.thisUser:
        return userId == taskbookOwnerId;

      case SignoffPolicyType.specifyUsers:
        return allowedUsers.contains(userId);

      case SignoffPolicyType.orgMembers:
        for (final org in allowedOrgs) {
          final canonicalId = org.source?.canonicalId;
          if (canonicalId == null) continue;
          final roles = orgMemberships[canonicalId];
          if (roles == null) continue;
          if (allowedRoles.isEmpty) return true;
          if (allowedRoles.any(roles.contains)) return true;
        }
        return false;
    }
  }

  /// Snapshot-based alternative to [isEligible]. Returns whether
  /// [signer] is eligible to sign this policy when both the signer and
  /// the taskbook owner are available as [PersonSnapshot] values.
  ///
  /// Matching uses full `canonical_id + canonical_source` equality on
  /// the relevant `source` fields. Un-sourced snapshots never match.
  /// See "Matching organizations" in schemas/signoff_policy.md.
  bool isEligibleFor(PersonSnapshot signer, PersonSnapshot taskbookOwner) {
    switch (type) {
      case SignoffPolicyType.thisUser:
        final s = signer.source;
        final o = taskbookOwner.source;
        if (s == null || o == null) return false;
        if (s.canonicalId == null || o.canonicalId == null) return false;
        if (s.canonicalSource == null || o.canonicalSource == null) return false;
        return s.canonicalId == o.canonicalId &&
            s.canonicalSource == o.canonicalSource;

      case SignoffPolicyType.specifyUsers:
        final id = signer.source?.canonicalId;
        if (id == null) return false;
        return allowedUsers.contains(id);

      case SignoffPolicyType.orgMembers:
        final memberships = signer.memberships ?? const [];
        for (final allowed in allowedOrgs) {
          final a = allowed.source;
          if (a == null || a.canonicalId == null || a.canonicalSource == null) {
            continue;
          }
          for (final membership in memberships) {
            final m = membership.organization.source;
            if (m == null || m.canonicalId == null || m.canonicalSource == null) {
              continue;
            }
            if (a.canonicalId == m.canonicalId &&
                a.canonicalSource == m.canonicalSource) {
              if (allowedRoles.isEmpty) return true;
              if (allowedRoles.any(membership.roles.contains)) return true;
            }
          }
        }
        return false;
    }
  }

  /// Pure. Returns `true` iff the policy is in a compliant state per
  /// the signing contract in schemas/signoff_policy.md.
  ///
  /// - An unsigned policy (`completed = false`) is always compliant.
  /// - A signed policy is compliant iff `completionTimestamp` and
  ///   `signoffRecord` are both set and `signoffRecord.signedAt`
  ///   equals `completionTimestamp`.
  bool isValidSigned() {
    if (!completed) return true;
    if (completionTimestamp == null) return false;
    if (signoffRecord == null) return false;
    return signoffRecord!.signedAt == completionTimestamp;
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
