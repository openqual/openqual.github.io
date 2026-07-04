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
import 'completion_state.dart';

/// A single checklist item under a TaskbookTask.
class TaskbookSubtask {
  final String id;
  final int order;
  final String title;
  final CompletionState completion;
  final List<Attachment> attachments;

  const TaskbookSubtask({
    required this.id,
    required this.order,
    required this.title,
    this.completion = const CompletionState(),
    this.attachments = const [],
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskbookSubtask.fromMap(Map<String, dynamic> m) => TaskbookSubtask(
        id: m['id'] as String,
        order: (m['order'] as num).toInt(),
        title: m['title'] as String,
        completion: m['completion'] == null
            ? const CompletionState()
            : CompletionState.fromMap(
                (m['completion'] as Map).cast<String, dynamic>()),
        attachments:
            readMapList(m['attachments']).map(Attachment.fromMap).toList(),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'id': id,
        'order': order,
        'title': title,
        'completion': completion.toMap(),
        'attachments': attachments.map((a) => a.toMap()).toList(),
      };

  TaskbookSubtask copyWith({CompletionState? completion}) {
    return TaskbookSubtask(
      id: id,
      order: order,
      title: title,
      completion: completion ?? this.completion,
      attachments: attachments,
    );
  }
}
