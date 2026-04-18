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

import 'enums.dart';

/// Book-level scoring threshold.
class BookScoringConfig {
  final double? minPassingPoints;
  final double? minPassingPercentage;

  const BookScoringConfig({this.minPassingPoints, this.minPassingPercentage});
}

/// Book-level scoring configuration.
class TaskbookEvaluationConfig {
  final ScoringMode scoringMode;
  final BookScoringConfig? scoringConfig;

  const TaskbookEvaluationConfig({
    this.scoringMode = ScoringMode.aggregated,
    this.scoringConfig,
  });
}
