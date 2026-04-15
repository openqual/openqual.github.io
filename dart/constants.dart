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

/// Standard sentinel for "no expiration / far future" dates.
///
/// See schemas/constants.md for the normative definition. Implementations
/// that need such a sentinel must use this value rather than inventing
/// their own. Chosen to avoid quirks observed with `9999-12-31` in some
/// JavaScript `Date` pipelines and backend storage layers.
final DateTime neverExpireDate = DateTime.utc(2199, 12, 31);
