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
import 'person_snapshot.dart';
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

  /// Frozen identity of who uploaded the file. Snapshot-shaped like
  /// every other person reference in the standard.
  final PersonSnapshot? uploadedBy;

  final String? content;
  final String? contentEncoding;

  /// Time-limited fetch URL for the file. Convenience for receivers;
  /// treat expired URLs (per [downloadUrlExpiresAt]) as absent.
  final String? downloadUrl;

  /// When [downloadUrl] stops working. Null with a URL present means
  /// unknown/indefinite validity.
  final DateTime? downloadUrlExpiresAt;

  final Source? source;

  const Attachment({
    required this.name,
    this.path,
    required this.mimeType,
    required this.sizeBytes,
    required this.uploadedAt,
    this.uploadedBy,
    this.content,
    this.contentEncoding,
    this.downloadUrl,
    this.downloadUrlExpiresAt,
    this.source,
  });

  /// Reads the wire shape produced by [toMap].
  factory Attachment.fromMap(Map<String, dynamic> m) => Attachment(
        name: m['name'] as String,
        path: m['path'] as String?,
        mimeType: m['mime_type'] as String,
        sizeBytes: (m['size_bytes'] as num).toInt(),
        uploadedAt: readDateTime(m['uploaded_at'])!,
        uploadedBy: m['uploaded_by'] == null
            ? null
            : PersonSnapshot.fromMap(
                (m['uploaded_by'] as Map).cast<String, dynamic>()),
        content: m['content'] as String?,
        contentEncoding: m['content_encoding'] as String?,
        downloadUrl: m['download_url'] as String?,
        downloadUrlExpiresAt: readDateTime(m['download_url_expires_at']),
        source: m['source'] == null
            ? null
            : Source.fromMap((m['source'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'name': name,
        if (path != null) 'path': path,
        'mime_type': mimeType,
        'size_bytes': sizeBytes,
        'uploaded_at': uploadedAt,
        if (uploadedBy != null) 'uploaded_by': uploadedBy!.toMap(),
        if (content != null) 'content': content,
        if (contentEncoding != null) 'content_encoding': contentEncoding,
        if (downloadUrl != null) 'download_url': downloadUrl,
        if (downloadUrlExpiresAt != null)
          'download_url_expires_at': downloadUrlExpiresAt,
        if (source != null) 'source': source!.toMap(),
      };
}
