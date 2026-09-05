# TaskTypeConfig

Polymorphic configuration for a `TaskbookTask`. Exactly one of
`evaluation_config`, `inspection_config`, `taskbook_config`,
`skillsheet_config`, or `cert_config` SHOULD be populated, matching the
task's `type` discriminator.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `evaluation_config` | `TaskTypeEvaluationConfig?` | No | Populated when `type = evaluation`. |
| `inspection_config` | `TaskTypeInspectionConfig?` | No | Populated when `type = inspection`. |
| `taskbook_config` | `TaskTypeTaskbookConfig?` | No | Populated when `type = taskbook`. |
| `skillsheet_config` | `TaskTypeSkillsheetConfig?` | No | Populated when `type = skillsheet`. |
| `cert_config` | `TaskTypeCertConfig?` | No | Populated when `type = cert`. |

## Nested types

### `TaskTypeEvaluationConfig`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `criteria` | `TaskTypeEvaluationCriteria?` | No | Definition of how the evaluation is judged. |
| `result` | `TaskTypeEvaluationResult?` | No | The recorded outcome. Absent until an evaluator records one. |

### `TaskTypeEvaluationCriteria`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `evaluation_type` | `EvaluationType` | Yes | `pass_fail` or `scored`. |
| `points_possible` | `double?` | No | Required when `evaluation_type = scored`. Zero is valid. |
| `min_passing_points` | `double?` | No | Optional task-level passing threshold. Used for UI feedback; the authoritative pass/fail signal is still `result.outcome`. |
| `time_threshold` | `TimeThreshold?` | No | Optional target completion time for timed evaluations. See below. |

Whether a failed result fails the whole book is not a criteria
concern: that is the task-level `critical` flag (`taskbook_task.md` →
"Critical tasks"). The v1.x `autofail` field that lived here is
retired in v2.0.

### `TimeThreshold`

Target completion time for a timed evaluation ("must finish within 90
seconds"). The observed duration comes from the work item's
`start_and_end.duration_ms`; this is the template-side target it is
evaluated against.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `duration_ms` | `int` | Yes | Target time in milliseconds. Must be positive. |
| `is_hard` | `bool` | Yes | `false` (soft): display-only, outcome unaffected. `true` (hard): the outcome fails when the observed duration exceeds `duration_ms`. Defaults to `false`. |

Hard-threshold semantics apply after the rest of the outcome
determination — worst outcome wins: a `pass` outcome with an observed
duration over a hard threshold is evaluated as `fail`.

### `TaskTypeEvaluationResult`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `outcome` | `EvaluationOutcome?` | No | `pass` or `fail`. Absence means the evaluation has not been finalized. |
| `points_awarded` | `double?` | No | Required when `criteria.evaluation_type = scored` and `outcome` is set. Must not exceed `criteria.points_possible`; implementations clamp. |
| `evaluated_by` | `String?` | No | Opaque evaluator user ID. |
| `evaluated_at` | `DateTime?` | No | Timestamp of the evaluation. |
| `notes` | `String?` | No | Evaluator notes. |

### `TaskTypeInspectionConfig`

Configuration + result for `type = inspection` — a structured
observation recorded by a person: a yes/no condition check, a
measurement against pass bands, or a count against an expected
quantity. Distinct from `evaluation` (a judged assessment of a
person's performance): an inspection records the observed state of
the thing being verified, and the observation value itself is
first-class data, not just a derived outcome.

Scope note: the standard models the **verification record** — who
observed what, with what result. Asset registries, maintenance
histories, and equipment inventories remain out of scope (see
`README.md` → "Out of scope").

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `criteria` | `TaskTypeInspectionCriteria?` | No | What is being checked and what passing looks like. |
| `result` | `TaskTypeInspectionResult?` | No | The recorded observation. Absent until an observer records one. |

### `TaskTypeInspectionCriteria`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `kind` | `InspectionKind` | Yes | `pass_fail`, `measurement`, or `count`. |
| `unit` | `String?` | No | Display unit for `measurement` / `count` kinds, e.g. `"PSI"`, `"batteries"`. |
| `pass_min` | `double?` | No | `measurement` only: inclusive lower bound of the passing band. Null = unbounded below. |
| `pass_max` | `double?` | No | `measurement` only: inclusive upper bound of the passing band. Null = unbounded above. |
| `degraded_min` | `double?` | No | `measurement` only: inclusive lower bound of the degraded band, consulted when the value misses the passing band. |
| `degraded_max` | `double?` | No | `measurement` only: inclusive upper bound of the degraded band. |
| `expected_quantity` | `int?` | No | `count` only (required for that kind): the quantity expected. Must be `>= 0`. |

Whether a failing observation is a critical failure of the book is not
a criteria concern: that is the task-level `critical` flag
(`taskbook_task.md` → "Critical tasks"), which the triage derivation
below reads. The v1.x `critical` field that lived here is retired in
v2.0.

### `TaskTypeInspectionResult`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `triage` | `InspectionTriage` | Yes | Derived severity: `pass`, `degraded`, `failing`, or `critical_failure`. See "Triage derivation" below. |
| `ok` | `bool?` | No | `pass_fail` kind: the observed yes/no. |
| `measured_value` | `double?` | No | `measurement` kind: the observed value, recorded **unclamped** — a 4000 PSI reading against a 3000 PSI floor round-trips faithfully. |
| `found_quantity` | `int?` | No | `count` kind: the observed quantity, unclamped. |
| `action` | `InspectionAction?` | No | Recommended follow-up: `replace`, `repair`, or `monitor`. |
| `observed_by` | `String?` | No | Opaque observer user ID. |
| `observed_at` | `DateTime?` | No | Timestamp of the observation. |
| `notes` | `String?` | No | Observer notes. |

### Triage derivation (normative)

Pure function of the criteria, the owning task's `critical` flag
(`taskbook_task.md` → `critical`), and the observed value. Let `worst`
be `critical_failure` when the task is `critical`, else `failing`:

- `pass_fail`: `ok = true` → `pass`. `ok = false` → `worst`.
- `measurement`: value within `[pass_min, pass_max]` (null bounds are
  open) → `pass`. Else, if a degraded band is defined and the value is
  within it → `degraded`. Else → `worst`.
- `count`: `found_quantity >= expected_quantity` → `pass`.
  `0 < found_quantity < expected_quantity` → `degraded`.
  `found_quantity = 0` → `worst`.

The task flag changes only the failing branch: a `degraded` observation
on a critical task is still `degraded`.

Status contribution (see `taskbook_task.md`): a recorded observation
with triage `pass` or `degraded` behaves as a passing completion;
`failing` or `critical_failure` behaves as a failed completion
(`complete_failed`). Propagation to the parent section and book is
decided by the task's `critical` flag, not by the stored triage:
`critical_failure` is the triage a critical task's failure records,
and the flag is what `TaskbookSection.computeStatus` and
`Taskbook.computeStatus` read ("Critical propagation" in
`taskbook_section.md` and `taskbook.md`).

### `TaskTypeTaskbookConfig`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `display_name` | `String?` | No | Snapshot display name of the referenced taskbook template, frozen at reference time. |
| `source` | `Source?` | No | Source attribution. `canonical_id` identifies the template in the originating system. |
| `require_complete` | `bool` | Yes | When `true`, the referenced taskbook MUST have `status = complete` for this task to count as done. Defaults to `true`. |

### `TaskTypeSkillsheetConfig`

Identical shape to `TaskTypeTaskbookConfig`. The two are published as
separate classes deliberately, for parallelism with their matching
`TaskTypes` values; the wire shapes are unaffected by that choice.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `display_name` | `String?` | No | Snapshot display name of the referenced skillsheet template. |
| `source` | `Source?` | No | Source attribution. `canonical_id` identifies the template. |
| `require_complete` | `bool` | Yes | Defaults to `true`. |

### `TaskTypeCertConfig`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accepted_cert_types` | `List<AcceptedCertType>` | Yes | The cert types that satisfy this task. The task is satisfied when the holder has ANY currently-valid instance (respecting `require_active`) of ANY entry in this list. MUST be non-empty. The one-cert case is a single-entry list. |
| `require_active` | `bool` | Yes | When `true`, the user MUST hold a currently-valid instance (see `Certification.isCurrentlyValid`) of one of the accepted cert types. Defaults to `true`. |

### `AcceptedCertType`

A single entry in a `TaskTypeCertConfig.accepted_cert_types` list.
Follows the same `display_name` + `source` snapshot pattern as the
other reference configs.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `display_name` | `String?` | No | Snapshot display name of the accepted certification type. |
| `source` | `Source?` | No | Source attribution. `canonical_id` identifies the cert type in the originating system or catalog. |

## Notes

- `evaluation_type = pass_fail` omits `points_possible` / `points_awarded`.
- `evaluation_type = scored` requires `points_possible`; a scored
  evaluation with `outcome = fail` still carries `points_awarded` for
  reporting.
- `evaluated_by` / `observed_by` are opaque string IDs. Resolution to
  the referenced entity is the host application's responsibility.
- The `display_name` + `source` pattern on reference configs follows
  the same snapshot principle used throughout the standard (see
  `PersonSnapshot.display_name`, `OrganizationSnapshot.display_name`):
  the name is frozen at reference time so the record is meaningful
  without external lookups. `AcceptedCertType` applies this pattern
  inside the `TaskTypeCertConfig.accepted_cert_types` list.
- `accepted_cert_types` is a list so a single requirement can accept
  several equivalent cert types (e.g. a CPR requirement accepting AHA
  BLS, ARC BLS, or Military Training Network equivalents). The
  standard does not model "equivalence" as its own concept — it
  simply lets a requirement enumerate what it accepts. Catalog-level
  equivalence governance, if needed, remains a host/catalog concern
  upstream of the task configuration.
- **Evaluation vs inspection.** Both produce an outcome, but they
  answer different questions: an evaluation judges a *person's
  performance* (with an evaluator, optionally scored); an inspection
  records the *observed state of a thing* (with an observer, and the
  observation value — reading, count, presence — as first-class data).
  The distinction matters for receivers: inspection results carry the
  measurement unclamped, while scored-evaluation points clamp to
  `points_possible`.
