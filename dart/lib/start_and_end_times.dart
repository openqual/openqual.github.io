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

/// A pair of timestamps for a bounded activity, with a derived duration.
class StartAndEndTimes {
  final DateTime? startTime;
  final DateTime? endTime;
  final int? durationMs;
  final String? durationDisplay;

  const StartAndEndTimes({
    this.startTime,
    this.endTime,
    this.durationMs,
    this.durationDisplay,
  });

  /// Reads the wire shape produced by [toMap].
  factory StartAndEndTimes.fromMap(Map<String, dynamic> m) =>
      StartAndEndTimes(
        startTime: readDateTime(m['start_time']),
        endTime: readDateTime(m['end_time']),
        durationMs: m['duration_ms'] as int?,
        durationDisplay: m['duration_display'] as String?,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (startTime != null) 'start_time': startTime,
        if (endTime != null) 'end_time': endTime,
        if (durationMs != null) 'duration_ms': durationMs,
        if (durationDisplay != null) 'duration_display': durationDisplay,
      };

  /// Duration derived from [startTime] and [endTime] when both are set,
  /// falling back to [durationMs].
  Duration? get duration {
    if (startTime != null && endTime != null) {
      return endTime!.difference(startTime!);
    }
    if (durationMs != null) return Duration(milliseconds: durationMs!);
    return null;
  }
}
