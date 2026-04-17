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
| `display_name` | `String?` | No | Snapshot display name of the referenced taskbook template, frozen at reference time. |
| `source` | `Source?` | No | Source attribution. `canonical_id` identifies the template in the originating system. |
| `require_complete` | `bool` | Yes | When `true`, the referenced taskbook must have `status = complete` for this task to count as done. Defaults to `true`. |

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
| `display_name` | `String?` | No | Snapshot display name of the required certification type. |
| `source` | `Source?` | No | Source attribution. `canonical_id` identifies the cert type. |
| `require_active` | `bool` | Yes | When `true`, the user must hold a currently-valid instance of the cert (see `Certification.isCurrentlyValid`). Defaults to `true`. |

## Notes

- `evaluation_type = pass_fail` omits `points_possible` / `points_awarded`.
- `evaluation_type = scored` requires `points_possible`; a scored
  evaluation with `outcome = fail` still carries `points_awarded` for
  reporting.
- `evaluated_by` is an opaque string ID. Resolution to the referenced
  entity is the host application's responsibility.
- The `display_name` + `source` pattern on reference configs follows
  the same snapshot principle as `SignoffRecord.signatory_name` and
  `PersonSnapshot.display_name`: the name is frozen at reference time
  so the record is meaningful without external lookups.
