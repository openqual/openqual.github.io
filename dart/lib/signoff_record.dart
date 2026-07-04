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
import 'person_snapshot.dart';
import 'wire.dart';

/// Authoritative portable record of a completed signoff.
///
/// Immutable after creation. The [SignoffPolicy] configures who may sign;
/// this record captures who did sign.
class SignoffRecord {
  final PersonSnapshot signatory;
  final OrgRoles? signatoryRole;
  final DateTime signedAt;
  final SignoffPolicyType policyType;

  const SignoffRecord({
    required this.signatory,
    this.signatoryRole,
    required this.signedAt,
    required this.policyType,
  });

  /// Reads the wire shape produced by [toMap].
  factory SignoffRecord.fromMap(Map<String, dynamic> m) => SignoffRecord(
        signatory: PersonSnapshot.fromMap(
            (m['signatory'] as Map).cast<String, dynamic>()),
        signatoryRole: m['signatory_role'] == null
            ? null
            : orgRolesFromWire(m['signatory_role'] as String),
        signedAt: readDateTime(m['signed_at'])!,
        policyType: signoffPolicyTypeFromWire(m['policy_type'] as String),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'signatory': signatory.toMap(),
        if (signatoryRole != null) 'signatory_role': wireValue(signatoryRole!),
        'signed_at': signedAt,
        'policy_type': wireValue(policyType),
      };
}
