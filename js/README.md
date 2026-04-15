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
  completion_state.js
  start_and_end_times.js
  signoff_policy.js                 # + SignoffPolicy#isEligible, signoffsOK
  signoff_record.js
  task_type_config.js               # + eval criteria/result/subconfigs
  taskbook_attachment.js
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

Intentionally not included. The standard does not prescribe a wire
format; host applications supply their own mapping.
