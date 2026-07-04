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

'use strict';

const { readDate, dateToIso } = require('./codec');
const { Source } = require('./source');

/**
 * A file attached to any node in the OpenQual standard.
 *
 * At least one of path or content must be present. Host-stored
 * attachments use path; portable/inline attachments use content +
 * contentEncoding; both may be present.
 */
class Attachment {
  constructor({
    name,
    path = null,
    mimeType,
    sizeBytes,
    uploadedAt,
    uploadedBy = null,
    content = null,
    contentEncoding = null,
    downloadUrl = null,
    downloadUrlExpiresAt = null,
    source = null,
  }) {
    this.name = name;
    this.path = path;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
    this.uploadedAt = uploadedAt;
    // Frozen identity of who uploaded the file. Snapshot-shaped like
    // every other person reference in the standard.
    this.uploadedBy = uploadedBy;
    this.content = content;
    this.contentEncoding = contentEncoding;
    // Time-limited fetch URL for the file. Convenience for receivers;
    // treat expired URLs (per downloadUrlExpiresAt) as absent.
    this.downloadUrl = downloadUrl;
    // When downloadUrl stops working. Null with a URL present means
    // unknown/indefinite validity.
    this.downloadUrlExpiresAt = downloadUrlExpiresAt;
    this.source = source;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    // Lazy require: person_snapshot ↔ attachment reference each other.
    const { PersonSnapshot } = require('./person_snapshot');
    return new Attachment({
      name: m.name,
      path: m.path ?? null,
      mimeType: m.mime_type,
      sizeBytes: m.size_bytes,
      uploadedAt: readDate(m.uploaded_at),
      uploadedBy:
        m.uploaded_by == null ? null : PersonSnapshot.fromJSON(m.uploaded_by),
      content: m.content ?? null,
      contentEncoding: m.content_encoding ?? null,
      downloadUrl: m.download_url ?? null,
      downloadUrlExpiresAt: readDate(m.download_url_expires_at),
      source: m.source == null ? null : Source.fromJSON(m.source),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = { name: this.name };
    if (this.path != null) out.path = this.path;
    out.mime_type = this.mimeType;
    out.size_bytes = this.sizeBytes;
    out.uploaded_at = dateToIso(this.uploadedAt);
    if (this.uploadedBy != null) out.uploaded_by = this.uploadedBy.toJSON();
    if (this.content != null) out.content = this.content;
    if (this.contentEncoding != null) out.content_encoding = this.contentEncoding;
    if (this.downloadUrl != null) out.download_url = this.downloadUrl;
    if (this.downloadUrlExpiresAt != null) {
      out.download_url_expires_at = dateToIso(this.downloadUrlExpiresAt);
    }
    if (this.source != null) out.source = this.source.toJSON();
    return out;
  }
}

module.exports = { Attachment };
