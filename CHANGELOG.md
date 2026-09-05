# Changelog

All notable changes to the OpenQual standard and its reference
implementations. Version numbers follow the "Schema versioning" rules in
`schemas/README.md`: PATCH for clarifications, MINOR for backward-compatible
additions, MAJOR for field removals or breaking semantic changes.

## 2.0.0 (2026-09-04)

**Breaking: `critical` moves to the task.**

- `TaskbookTask` gains `critical` (`bool`, required, default `false`). When
  `true`, a failure of this task is a critical failure of the whole book: a
  failed evaluation result, or an inspection observation that fails its
  criteria, derives `critical_failure` triage where triage applies and
  propagates `complete_failed` to the parent section and the taskbook.
  (`schemas/taskbook_task.md` → "Critical tasks".)
- Retired: `TaskTypeEvaluationCriteria.autofail` and
  `TaskTypeInspectionCriteria.critical`. Both spelled the concept above, one
  per task type. Producers upgrading a 1.x record set
  `task.critical = autofail || criteria.critical` and drop the old keys.
- Triage derivation (`schemas/task_type_config.md`) now takes the owning
  task's `critical` flag as an input instead of reading it from the
  criteria; the reference bindings' `deriveTriage` takes it as a required
  argument. The "Autofail propagation" step of the section and book status
  waterfalls is renamed "Critical propagation" and reads the task flag
  (the stored inspection triage is no longer consulted).
- `schema_version` is `"2.0.0"`. Receivers pinned to 1.x MUST NOT assume
  they can interpret 2.0 records (the newer-MAJOR rule); in practice a 1.x
  receiver would silently lose every critical flag, which is why this is a
  MAJOR bump and not a MINOR one.

Rationale: one concept had two spellings, and the two had already drifted
(propagation was implemented for one and only documented for the other).
Whether a failure fails the book is a fact about the task, not about how
the task is judged, so the task level is the honest shape.

Reference implementations: Dart package `openqual` 2.0.0 (`dart/`), JS
binding (`js/`). Both suites gained `task_critical_test` (wire round-trip,
default, retired keys ignored on read and never re-emitted, propagation
for evaluation and inspection, flag-over-triage).

## 1.0.0 (2026-07-04)

First stable major release: portable schemas (certifications and renewals,
taskbooks with evaluation and inspection semantics, training records,
snapshots and provenance), a single conformance level, and reference
implementations in Dart and JavaScript. See the `v1.0.0` tag.
