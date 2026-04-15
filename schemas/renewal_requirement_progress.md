# RenewalRequirementProgress

Progress on one `RenewalRequirement`.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requirement_id` | `String` | Yes | Matches `RenewalRequirement.requirement_id`. |
| `order` | `int` | Yes | |
| `requirement_display_name` | `String` | Yes | Snapshot of the display name at the time of progress tracking. |
| `requirement_units` | `String` | Yes | Snapshot of `RenewalRequirement.requirement_units`. |
| `requirement_quantity` | `double` | Yes | Snapshot of `RenewalRequirement.requirement_quantity`. |
| `requirement_quantity_completed` | `double` | Yes | Raw total completed (may exceed `requirement_quantity`). |
| `effective_quantity_completed` | `double` | Yes | Completed quantity clamped to `requirement_quantity`. Contributes to the parent component's `component_quantity_completed`. |
| `applied_training_ids` | `List<String>` | Yes | Opaque IDs of training records applied to this requirement. May be empty. |
| `manually_added_credit` | `double` | Yes | Credit entered by the user without an associated training record. Defaults to `0.0`. |

## Notes

- The source struct stores `List<DocumentReference> appliedTraining`.
  OpenQual replaces this with `List<String> applied_training_ids`.
