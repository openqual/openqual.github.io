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

import 'enums.dart';
import 'wire.dart';

/// Book-level scoring threshold.
///
/// `minPassingPercentage` must be in `[0.0, 1.0]` (a fraction, not a
/// percent value) — see MIGRATION Rule 4.
class BookScoringConfig {
  final double? minPassingPoints;
  final double? minPassingPercentage;

  const BookScoringConfig({this.minPassingPoints, this.minPassingPercentage})
      : assert(
            minPassingPercentage == null ||
                (minPassingPercentage >= 0.0 && minPassingPercentage <= 1.0),
            'minPassingPercentage must be in [0.0, 1.0]');

  /// Reads the wire shape produced by [toMap].
  factory BookScoringConfig.fromMap(Map<String, dynamic> m) =>
      BookScoringConfig(
        minPassingPoints: (m['min_passing_points'] as num?)?.toDouble(),
        minPassingPercentage:
            (m['min_passing_percentage'] as num?)?.toDouble(),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (minPassingPoints != null) 'min_passing_points': minPassingPoints,
        if (minPassingPercentage != null)
          'min_passing_percentage': minPassingPercentage,
      };
}

/// Book-level scoring configuration.
class TaskbookEvaluationConfig {
  final ScoringMode scoringMode;
  final BookScoringConfig? scoringConfig;

  const TaskbookEvaluationConfig({
    this.scoringMode = ScoringMode.aggregated,
    this.scoringConfig,
  });

  /// Reads the wire shape produced by [toMap].
  factory TaskbookEvaluationConfig.fromMap(Map<String, dynamic> m) =>
      TaskbookEvaluationConfig(
        scoringMode: m['scoring_mode'] == null
            ? ScoringMode.aggregated
            : scoringModeFromWire(m['scoring_mode'] as String),
        scoringConfig: m['scoring_config'] == null
            ? null
            : BookScoringConfig.fromMap(
                (m['scoring_config'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'scoring_mode': wireValue(scoringMode),
        if (scoringConfig != null) 'scoring_config': scoringConfig!.toMap(),
      };
}
