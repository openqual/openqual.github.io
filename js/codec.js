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
 * Shared codec helpers for the per-type `toJSON()` / `fromJSON()`
 * serialization layer.
 *
 * **Wire format.** Snake-case keys; enum values in the published
 * snake_case wire form (the enums in `enums.js` already store the wire
 * strings, so they pass through serialization unchanged).
 *
 * **Date handling.** `toJSON()` emits ISO-8601 UTC strings (the JS
 * binding is JSON-native). `fromJSON()` accepts ISO-8601 strings,
 * `Date` instances, or any object exposing `toDate() → Date`
 * (duck-typed, so this package needs no storage-SDK dependency).
 *
 * **Null omission.** Optional fields are omitted from output when
 * null — keeps the on-wire shape tight and avoids confusing
 * "present-but-null" distinctions. Required list fields serialize
 * even when empty.
 */

/**
 * Tolerant date reader: accepts a `Date`, an ISO-8601 string, or a
 * duck-typed `toDate()` object (e.g. a Firestore Timestamp). Returns
 * null for null/undefined input; throws `TypeError` on anything else.
 *
 * @param {*} v
 * @returns {Date|null}
 */
function readDate(v) {
  if (v == null) return null;
  if (v instanceof Date) return v;
  if (typeof v === 'string') return new Date(v);
  if (typeof v.toDate === 'function') {
    const d = v.toDate();
    if (d instanceof Date) return d;
  }
  throw new TypeError(`cannot decode as Date: ${v}`);
}

/**
 * ISO-8601 UTC string form of a `Date`, for `toJSON()` output.
 *
 * @param {Date} d
 * @returns {string}
 */
function dateToIso(d) {
  return d.toISOString();
}

module.exports = { readDate, dateToIso };
