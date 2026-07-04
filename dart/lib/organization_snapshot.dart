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

import 'source.dart';

/// Frozen point-in-time capture of an organization's identity and
/// contact details. Reusable across slots where a portable record
/// references an organization (certifying agency, host org, etc.).
class OrganizationSnapshot {
  final String name;
  final String? displayName;
  final String? website;
  final String? email;
  final String? phone;
  final Source? source;

  const OrganizationSnapshot({
    required this.name,
    this.displayName,
    this.website,
    this.email,
    this.phone,
    this.source,
  });

  /// Reads the wire shape produced by [toMap].
  factory OrganizationSnapshot.fromMap(Map<String, dynamic> m) =>
      OrganizationSnapshot(
        name: m['name'] as String,
        displayName: m['display_name'] as String?,
        website: m['website'] as String?,
        email: m['email'] as String?,
        phone: m['phone'] as String?,
        source: m['source'] == null
            ? null
            : Source.fromMap((m['source'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'name': name,
        if (displayName != null) 'display_name': displayName,
        if (website != null) 'website': website,
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        if (source != null) 'source': source!.toMap(),
      };
}
