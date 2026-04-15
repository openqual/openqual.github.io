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

/// The assignment triple for a Taskbook: who is doing it, who will
/// evaluate it, and what organization is hosting it.
class TaskbookAssignment {
  final TaskbookAssignee? assignee;
  final TaskbookEvaluator? evaluator;
  final TaskbookHostOrg? hostOrg;

  const TaskbookAssignment({this.assignee, this.evaluator, this.hostOrg});
}

class TaskbookAssignee {
  final String userId;
  final String displayName;
  final DateTime? assignedAt;

  const TaskbookAssignee({
    required this.userId,
    required this.displayName,
    this.assignedAt,
  });
}

class TaskbookEvaluator {
  final String userId;
  final String displayName;
  final DateTime? assignedAt;

  const TaskbookEvaluator({
    required this.userId,
    required this.displayName,
    this.assignedAt,
  });
}

class TaskbookHostOrg {
  final String orgId;
  final String displayName;
  final DateTime? assignedAt;

  const TaskbookHostOrg({
    required this.orgId,
    required this.displayName,
    this.assignedAt,
  });
}
