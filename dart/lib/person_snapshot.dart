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

import 'attachment.dart';
import 'codec.dart';
import 'enums.dart';
import 'organization_snapshot.dart';
import 'source.dart';
import 'wire.dart';

/// Frozen point-in-time identity capture.
///
/// Reusable for certification holders, instructors, evaluators, or any
/// role where a person's identity must be recorded as it was at the
/// moment of an event.
class PersonSnapshot {
  final String displayName;
  final String? firstName;
  final String? lastName;
  final String? middleName;
  final String? suffix;
  final String? email;

  /// Profile-image URL as it was at capture time. Display convenience,
  /// not identity — may dangle after the host prunes storage.
  final String? avatarUrl;

  /// The person's signature image, attachment-shaped so it can travel
  /// inline (`content`) on exchanged records.
  final Attachment? signatureImage;

  final List<OrgMembership>? memberships;
  final Source? source;

  const PersonSnapshot({
    required this.displayName,
    this.firstName,
    this.lastName,
    this.middleName,
    this.suffix,
    this.email,
    this.avatarUrl,
    this.signatureImage,
    this.memberships,
    this.source,
  });

  /// Reads the wire shape produced by [toMap].
  factory PersonSnapshot.fromMap(Map<String, dynamic> m) => PersonSnapshot(
        displayName: m['display_name'] as String,
        firstName: m['first_name'] as String?,
        lastName: m['last_name'] as String?,
        middleName: m['middle_name'] as String?,
        suffix: m['suffix'] as String?,
        email: m['email'] as String?,
        avatarUrl: m['avatar_url'] as String?,
        signatureImage: m['signature_image'] == null
            ? null
            : Attachment.fromMap(
                (m['signature_image'] as Map).cast<String, dynamic>()),
        memberships: m['memberships'] == null
            ? null
            : readMapList(m['memberships'])
                .map(OrgMembership.fromMap)
                .toList(),
        source: m['source'] == null
            ? null
            : Source.fromMap((m['source'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'display_name': displayName,
        if (firstName != null) 'first_name': firstName,
        if (lastName != null) 'last_name': lastName,
        if (middleName != null) 'middle_name': middleName,
        if (suffix != null) 'suffix': suffix,
        if (email != null) 'email': email,
        if (avatarUrl != null) 'avatar_url': avatarUrl,
        if (signatureImage != null)
          'signature_image': signatureImage!.toMap(),
        if (memberships != null)
          'memberships': memberships!.map((om) => om.toMap()).toList(),
        if (source != null) 'source': source!.toMap(),
      };
}

/// An organization membership captured on a [PersonSnapshot].
/// Snapshot-shaped; carries no lifecycle vocabulary. See
/// "Memberships and scope boundary" in schemas/person_snapshot.md.
class OrgMembership {
  final OrganizationSnapshot organization;
  final List<OrgRoles> roles;

  const OrgMembership({required this.organization, required this.roles});

  /// Reads the wire shape produced by [toMap].
  factory OrgMembership.fromMap(Map<String, dynamic> m) => OrgMembership(
        organization: OrganizationSnapshot.fromMap(
            (m['organization'] as Map).cast<String, dynamic>()),
        roles: readStringList(m['roles']).map(orgRolesFromWire).toList(),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'organization': organization.toMap(),
        'roles': roles.map(wireValue).toList(),
      };
}
