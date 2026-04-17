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

/**
 * A file attached to any node in the OpenQual standard.
 *
 * Supports two modes: host-stored (via path) and portable/inline
 * (via content + contentEncoding). When both are present, content
 * is the portable payload and path is the host-local handle.
 */
class Attachment {
  constructor({
    name,
    path,
    mimeType,
    sizeBytes,
    uploadedAt,
    content = null,
    contentEncoding = null,
  }) {
    this.name = name;
    this.path = path;
    this.mimeType = mimeType;
    this.sizeBytes = sizeBytes;
    this.uploadedAt = uploadedAt;
    this.content = content;
    this.contentEncoding = contentEncoding;
    Object.freeze(this);
  }
}

module.exports = { Attachment };
