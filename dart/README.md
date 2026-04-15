# OpenQual — Dart reference implementation

Idiomatic Dart classes that conform to the language-agnostic specs in
`../schemas/`. If this code disagrees with the schema, the schema wins
and the code is the bug.

**License:** Apache 2.0
**Copyright:** FireCal LLC

## Scope

This is a reference implementation, not a published package. Copy the
files you need into your own Dart or Flutter project. Every class is a
plain value object. The only standard-library imports are
`dart:convert` and `dart:math`, both used by
`Taskbook.fromExternalJson`.

## Layout

```
dart/
  enums.dart                        # all enums
  completion_state.dart
  start_and_end_times.dart
  signoff_policy.dart               # + SignoffPolicy.isEligible, signoffsOK helper
  signoff_record.dart
  task_type_config.dart             # + eval criteria/result/subconfigs
  taskbook_attachment.dart
  taskbook_assignment.dart          # + assignee, evaluator, host org
  taskbook_subtask.dart
  taskbook_task.dart                # + computeStatus, withClampedPoints
  taskbook_section.dart             # + computeStatus, scoring config/summary
  taskbook_evaluation_config.dart   # + BookScoringConfig
  taskbook_summary.dart             # + BookScoringSummary
  taskbook.dart                     # + fromExternalJson, markComplete
  renewal_requirement.dart
  renewal_component.dart
  renewal_requirements.dart
  renewal_requirement_progress.dart
  renewal_component_progress.dart
  renewal_progress.dart             # + computeStatus
  previous_renewal.dart
  previous_renewals.dart
  certification_progress.dart       # calculateCertificationProgress
```

## Usage sketch

```dart
import 'package:<your_pkg>/taskbook.dart';
import 'package:<your_pkg>/taskbook_section.dart';
import 'package:<your_pkg>/enums.dart';

final book = Taskbook.fromExternalJson(jsonFromAi);

// Recompute all section statuses after a state change.
final recomputed = book.copyWith(
  sections: book.sections.map((s) => s.computeStatus()).toList(),
);
```

## Purity contract

Every method in this directory is pure: no I/O, no network, no
platform calls. If a computation needs data that lives outside the
receiver — training records, user memberships, etc. — the caller
fetches it and passes it in as an argument (see
`SignoffPolicy.isEligible` and `calculateCertificationProgress`).

## Serialization

Intentionally not included. The standard does not prescribe a wire
format; host applications supply their own mapping to whatever
storage or transport they use.
