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

import 'source.dart';

/// A file attached to any node in the OpenQual standard.
///
/// At least one of [path] or [content] must be present. Host-stored
/// attachments use [path]; portable/inline attachments use [content]
/// + [contentEncoding]; both may be present.
class Attachment {
  final String name;
  final String? path;
  final String mimeType;
  final int sizeBytes;
  final DateTime uploadedAt;
  final String? content;
  final String? contentEncoding;
  final Source? source;

  const Attachment({
    required this.name,
    this.path,
    required this.mimeType,
    required this.sizeBytes,
    required this.uploadedAt,
    this.content,
    this.contentEncoding,
    this.source,
  });
}
