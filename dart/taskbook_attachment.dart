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

/// A file attached to any node in the TaskBook hierarchy.
class TaskbookAttachment {
  final String name;
  final String path;
  final String mimeType;
  final int sizeBytes;
  final DateTime uploadedAt;

  const TaskbookAttachment({
    required this.name,
    required this.path,
    required this.mimeType,
    required this.sizeBytes,
    required this.uploadedAt,
  });
}
