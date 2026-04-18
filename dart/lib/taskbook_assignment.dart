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

import 'organization_snapshot.dart';
import 'person_snapshot.dart';

/// The assignment triple for a Taskbook: who is doing it, who will
/// evaluate it, and what organization is hosting it.
class TaskbookAssignment {
  final AssignedPerson? assignee;
  final AssignedPerson? evaluator;
  final AssignedOrganization? host;

  const TaskbookAssignment({this.assignee, this.evaluator, this.host});
}

/// A person captured at the time of assignment, paired with the
/// timestamp of when the assignment was made. Reused for assignee
/// and evaluator slots.
class AssignedPerson {
  final PersonSnapshot person;
  final DateTime? assignedAt;

  const AssignedPerson({required this.person, this.assignedAt});
}

/// An organization captured at the time of assignment, paired with
/// the timestamp of when the assignment was made. Used for the host
/// slot today and reusable for future organization-assignment slots.
class AssignedOrganization {
  final OrganizationSnapshot organization;
  final DateTime? assignedAt;

  const AssignedOrganization({required this.organization, this.assignedAt});
}
