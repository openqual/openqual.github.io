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
import 'organization_snapshot.dart';
import 'person_snapshot.dart';

/// The assignment triple for a Taskbook: who is doing it, who will
/// evaluate it, and what organization is hosting it.
class TaskbookAssignment {
  final AssignedPerson? assignee;
  final AssignedPerson? evaluator;
  final AssignedOrganization? host;

  const TaskbookAssignment({this.assignee, this.evaluator, this.host});

  /// Reads the wire shape produced by [toMap].
  factory TaskbookAssignment.fromMap(Map<String, dynamic> m) =>
      TaskbookAssignment(
        assignee: m['assignee'] == null
            ? null
            : AssignedPerson.fromMap(
                (m['assignee'] as Map).cast<String, dynamic>()),
        evaluator: m['evaluator'] == null
            ? null
            : AssignedPerson.fromMap(
                (m['evaluator'] as Map).cast<String, dynamic>()),
        host: m['host'] == null
            ? null
            : AssignedOrganization.fromMap(
                (m['host'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (assignee != null) 'assignee': assignee!.toMap(),
        if (evaluator != null) 'evaluator': evaluator!.toMap(),
        if (host != null) 'host': host!.toMap(),
      };
}

/// A person captured at the time of assignment, paired with the
/// timestamp of when the assignment was made. Reused for assignee
/// and evaluator slots.
class AssignedPerson {
  final PersonSnapshot person;
  final DateTime? assignedAt;

  const AssignedPerson({required this.person, this.assignedAt});

  /// Reads the wire shape produced by [toMap].
  factory AssignedPerson.fromMap(Map<String, dynamic> m) => AssignedPerson(
        person: PersonSnapshot.fromMap(
            (m['person'] as Map).cast<String, dynamic>()),
        assignedAt: readDateTime(m['assigned_at']),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'person': person.toMap(),
        if (assignedAt != null) 'assigned_at': assignedAt,
      };
}

/// An organization captured at the time of assignment, paired with
/// the timestamp of when the assignment was made. Used for the host
/// slot today and reusable for future organization-assignment slots.
class AssignedOrganization {
  final OrganizationSnapshot organization;
  final DateTime? assignedAt;

  const AssignedOrganization({required this.organization, this.assignedAt});

  /// Reads the wire shape produced by [toMap].
  factory AssignedOrganization.fromMap(Map<String, dynamic> m) =>
      AssignedOrganization(
        organization: OrganizationSnapshot.fromMap(
            (m['organization'] as Map).cast<String, dynamic>()),
        assignedAt: readDateTime(m['assigned_at']),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'organization': organization.toMap(),
        if (assignedAt != null) 'assigned_at': assignedAt,
      };
}
