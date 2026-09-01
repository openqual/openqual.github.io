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

/// Shared codec helpers for the per-type `toMap()` / `fromMap()`
/// serialization layer.
///
/// **Wire format.** Snake-case keys; enum values in the published
/// snake_case wire form (see `wire.dart`).
///
/// **DateTime handling.** Serializers produce maps with raw [DateTime]
/// values — storage SDKs that auto-convert (e.g. Firestore → Timestamp)
/// take them as-is. For portable JSON, pass the top-level map through
/// [datesToIso]. Deserializers accept [DateTime], ISO-8601 [String],
/// Firestore-Timestamp-shaped maps (`_seconds` / `_nanoseconds` or
/// `seconds` / `nanos`, numbers or numeric strings), or any object
/// exposing `toDate() → DateTime` (duck-typed, so this package needs no
/// storage-SDK dependency).
///
/// **Null omission.** Optional fields are omitted from output when
/// null — keeps the on-wire shape tight and avoids confusing
/// "present-but-null" distinctions. Required list fields serialize
/// even when empty.
library;

/// Recursively convert every [DateTime] value in [m] to its UTC
/// ISO-8601 string form. Use at the top of the tree when producing
/// portable JSON. Returns a new map; does not mutate the input.
Map<String, dynamic> datesToIso(Map<String, dynamic> m) =>
    _datesToIso(m) as Map<String, dynamic>;

Object? _datesToIso(Object? v) {
  if (v is DateTime) return v.toUtc().toIso8601String();
  if (v is Map) {
    return v.map<String, dynamic>(
      (k, val) => MapEntry(k as String, _datesToIso(val)),
    );
  }
  if (v is List) return v.map(_datesToIso).toList();
  return v;
}

/// Tolerant date reader: accepts [DateTime], ISO-8601 [String], a
/// Firestore-Timestamp-shaped map (`_seconds` / `_nanoseconds` or
/// `seconds` / `nanos`), or a duck-typed `toDate()` object (e.g. a
/// Firestore Timestamp). Returns null for null input; throws
/// [ArgumentError] on anything else.
DateTime? readDateTime(Object? v) {
  if (v == null) return null;
  if (v is DateTime) return v;
  if (v is String) return DateTime.parse(v);
  final mapped = _readTimestampMap(v);
  if (mapped != null) return mapped;
  try {
    final d = (v as dynamic).toDate();
    if (d is DateTime) return d;
  } on NoSuchMethodError {
    // fall through
  }
  throw ArgumentError.value(v, 'v', 'cannot decode as DateTime');
}

DateTime? _readTimestampMap(Object? v) {
  if (v is! Map) return null;
  final seconds = _readTimestampInt(v['_seconds'] ?? v['seconds']);
  if (seconds == null) return null;
  final nanos = _readTimestampInt(v['_nanoseconds'] ?? v['nanos']) ?? 0;
  final micros = seconds * Duration.microsecondsPerSecond + (nanos ~/ 1000);
  return DateTime.fromMicrosecondsSinceEpoch(micros, isUtc: true);
}

int? _readTimestampInt(Object? v) {
  if (v is int) return v;
  if (v is String) return int.tryParse(v);
  return null;
}

/// Casts a raw wire value to a `Map<String, dynamic>`; null passes
/// through.
Map<String, dynamic>? readMap(Object? v) =>
    v == null ? null : (v as Map).cast<String, dynamic>();

/// Casts a raw wire list of maps; null or absent reads as empty.
List<Map<String, dynamic>> readMapList(Object? v) => v == null
    ? const []
    : (v as List).map((e) => (e as Map).cast<String, dynamic>()).toList();

/// Casts a raw wire list of strings; null or absent reads as empty.
List<String> readStringList(Object? v) =>
    v == null ? const [] : (v as List).cast<String>();
