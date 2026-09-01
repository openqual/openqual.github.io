# OpenQual — JavaScript reference implementation

Idiomatic JavaScript (CommonJS) classes and functions that conform to
the language-agnostic specs in `../schemas/`. If this code disagrees
with the schema, the schema wins and the code is the bug.

**License:** Apache 2.0
**Copyright:** FireCal LLC

## Scope

Reference implementation, not a published npm package. Copy into your
own project as needed. Every class is a plain value object. No
external dependencies; standard library only.

Target runtime: Node 18+.

## Layout

```
js/
  enums.js                          # all enums (frozen object maps)
  codec.js                          # shared toJSON/fromJSON date helpers
  completion_state.js
  start_and_end_times.js
  signoff_policy.js                 # + SignoffPolicy#isEligible, signoffsOK
  signoff_record.js
  task_type_config.js               # + eval/inspection criteria/results, TimeThreshold, deriveTriage
  source.js
  person_snapshot.js                # + avatarUrl, signatureImage
  attachment.js                     # + inline content, uploadedBy, download URL
  validity_period.js
  organization_snapshot.js
  cert_type.js                      # + authoritative codes, renewal-window derivation
  certification.js                  # + isCurrentlyValid
  training_record.js                # TrainingRecord + TrainingLocation (Tier A)
  taskbook_assignment.js            # + assignee, evaluator, host org
  taskbook_subtask.js
  taskbook_task.js                  # + computeStatus, withClampedPoints
  taskbook_section.js               # + computeStatus, scoring config/summary
  taskbook_evaluation_config.js     # + BookScoringConfig
  taskbook_summary.js               # + BookScoringSummary
  taskbook.js                       # + fromExternalJson, markComplete
  renewal_requirement.js
  renewal_component.js
  renewal_requirements.js
  renewal_requirement_progress.js
  renewal_component_progress.js
  renewal_progress.js               # + computeStatus
  previous_renewal.js
  previous_renewals.js
  certification_progress.js         # calculateCertificationProgress
  test/                             # plain node:test suite (`node --test test/`)
```

## Usage sketch

```js
const { Taskbook } = require('./taskbook');

const book = Taskbook.fromExternalJson(jsonFromAi);

const recomputed = book._with({
  sections: book.sections.map((s) => s.computeStatus()),
});
```

## Purity contract

Every exported function is pure: no I/O, no HTTP, no filesystem. When
a computation needs data from outside the receiver, the caller fetches
it and passes it in as an argument (see `SignoffPolicy#isEligible`
and `calculateCertificationProgress`).

## Immutability

All value objects are `Object.freeze`d at construction time. Use the
`_with(...)` / `withCompletion(...)` / `copyWith(...)` helpers (where
present) to produce modified copies.

## Serialization

Every value object implements `toJSON()` — producing the published
snake_case wire shape with ISO-8601 UTC date strings, so
`JSON.stringify` picks it up automatically — and a static
`fromJSON(obj)` that reads the same shape (dates as ISO strings,
`Date` instances, Firestore-Timestamp-shaped maps with
`_seconds` / `_nanoseconds` or `seconds` / `nanos`, or duck-typed
`toDate()` objects). Optional fields are omitted when null; required
list fields serialize even when empty. Enum properties already hold
the published wire strings, so they pass through unchanged. The
shapes are identical to the Dart binding's `toMap()` / `fromMap()`
output.

## Tests

```
node --test test/
```

No dependencies — the suite uses `node:test` + `node:assert` only.
It mirrors the Dart binding's test tables (triage derivation,
inspection status branches, renewal-window derivation, full-fixture
round-trips) to keep the two bindings in behavioral lockstep.
