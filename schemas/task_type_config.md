# TaskTypeConfig

Polymorphic configuration for a `TaskbookTask`. Exactly one of
`evaluation_config`, `taskbook_config`, `skillsheet_config`, or
`cert_config` SHOULD be populated, matching the task's `type`
discriminator.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `evaluation_config` | `TaskTypeEvaluationConfig?` | No | Populated when `type = evaluation`. |
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
| `autofail` | `bool` | Yes | When `true`, a failed result on this task propagates `complete_failed` up to the parent section (and book). Defaults to `false`. |
| `points_possible` | `double?` | No | Required when `evaluation_type = scored`. Zero is valid. |
| `min_passing_points` | `double?` | No | Optional task-level passing threshold. Used for UI feedback; the authoritative pass/fail signal is still `result.outcome`. |

### `TaskTypeEvaluationResult`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `outcome` | `EvaluationOutcome?` | No | `pass` or `fail`. Absence means the evaluation has not been finalized. |
| `points_awarded` | `double?` | No | Required when `criteria.evaluation_type = scored` and `outcome` is set. Must not exceed `criteria.points_possible`; implementations clamp. |
| `evaluated_by` | `String?` | No | Opaque evaluator user ID. |
| `evaluated_at` | `DateTime?` | No | Timestamp of the evaluation. |
| `notes` | `String?` | No | Evaluator notes. |

### `TaskTypeTaskbookConfig`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `display_name` | `String?` | No | Snapshot display name of the referenced taskbook template, frozen at reference time. |
| `source` | `Source?` | No | Source attribution. `canonical_id` identifies the template in the originating system. |
| `require_complete` | `bool` | Yes | When `true`, the referenced taskbook MUST have `status = complete` for this task to count as done. Defaults to `true`. |

### `TaskTypeSkillsheetConfig`

Identical shape to `TaskTypeTaskbookConfig`.

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
- `evaluated_by` is an opaque string ID. Resolution to the referenced
  entity is the host application's responsibility.
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
