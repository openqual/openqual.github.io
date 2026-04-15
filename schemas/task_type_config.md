# TaskTypeConfig

Polymorphic configuration for a `TaskbookTask`. Exactly one of
`evaluation_config`, `taskbook_config`, `skillsheet_config`, or
`cert_config` should be populated, matching the task's `type`
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
| `taskbook_template_id` | `String?` | No | Opaque ID of the referenced taskbook template. |
| `require_complete` | `bool` | Yes | When `true`, the referenced taskbook must have `status = complete` for this task to count as done. Defaults to `true`. |

### `TaskTypeSkillsheetConfig`

Identical shape to `TaskTypeTaskbookConfig`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `taskbook_template_id` | `String?` | No | Opaque ID of the referenced skillsheet template. |
| `require_complete` | `bool` | Yes | Defaults to `true`. |

### `TaskTypeCertConfig`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cert_type_id` | `String?` | No | Opaque ID of the required certification type. |
| `require_active` | `bool` | Yes | When `true`, the user must hold a currently-valid instance of the cert. Defaults to `true`. |

## Notes

- `evaluation_type = pass_fail` omits `points_possible` / `points_awarded`.
- `evaluation_type = scored` requires `points_possible`; a scored
  evaluation with `outcome = fail` still carries `points_awarded` for
  reporting.
- `evaluated_by`, `taskbook_template_ref`, and `cert_type_ref` are
  opaque string IDs. Resolution to the referenced entity is the host
  application's responsibility and is not specified by OpenQual.
