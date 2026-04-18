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

/// Unified completion marker used at every level of the TaskBook hierarchy
/// (taskbook, section, task, subtask).
///
/// If [complete] is `false`, [completedAt] must be `null`.
class CompletionState {
  final bool complete;
  final DateTime? completedAt;

  const CompletionState({
    this.complete = false,
    this.completedAt,
  });

  /// Returns a new [CompletionState] with [complete] set to `true` and
  /// [completedAt] stamped to [now].
  CompletionState markComplete(DateTime now) =>
      CompletionState(complete: true, completedAt: now);

  /// Returns a new [CompletionState] with [complete] cleared.
  CompletionState clear() => const CompletionState();

  CompletionState copyWith({bool? complete, DateTime? completedAt}) {
    return CompletionState(
      complete: complete ?? this.complete,
      completedAt: completedAt ?? this.completedAt,
    );
  }
}
