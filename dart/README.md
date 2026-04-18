# OpenQual — Dart reference implementation

Idiomatic Dart classes that conform to the language-agnostic specs in
`../schemas/`. If this code disagrees with the schema, the schema wins
and the code is the bug.

**License:** Apache 2.0
**Copyright:** FireCal LLC

## Scope

A reference implementation of the OpenQual v0.1 spec. The Dart code
conforms to the schemas in `../schemas/` — if the code disagrees
with the schema, the schema wins and the code is the bug.

Two supported usage patterns:

- **Path dependency.** The code is package-shaped (name `openqual`,
  version tracks the spec). Add it as a `path:` dependency in your
  `pubspec.yaml`:

  ```yaml
  dependencies:
    openqual:
      path: ../path/to/openqual/dart
  ```

  Not published to pub.dev yet (`publish_to: 'none'`) — the package
  is real but the public-release story is deferred until the spec
  is past v0.1.
- **Copy the files.** Every class is a plain value object and the
  only standard-library imports are `dart:convert` and `dart:math`,
  both used only by `Taskbook.fromExternalJson`. Vendoring the
  files into your project remains a valid option for callers who
  prefer it over a path dependency.

## Layout

```
dart/
  enums.dart                        # all enums
  completion_state.dart
  start_and_end_times.dart
  signoff_policy.dart               # + SignoffPolicy.isEligible, signoffsOK helper
  signoff_record.dart
  task_type_config.dart             # + eval criteria/result/subconfigs
  source.dart
  person_snapshot.dart
  attachment.dart                   # + inline content for portability
  validity_period.dart
  organization_snapshot.dart
  cert_type.dart
  certification.dart                # + isCurrentlyValid
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
import 'package:openqual/taskbook.dart';
import 'package:openqual/taskbook_section.dart';
import 'package:openqual/enums.dart';

final book = Taskbook.fromExternalJson(jsonFromAi);

// Recompute all section statuses after a state change.
final recomputed = book.copyWith(
  sections: book.sections.map((s) => s.computeStatus()).toList(),
);
```

(Callers using the copy-the-files option replace `package:openqual/`
with their own package name.)

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
