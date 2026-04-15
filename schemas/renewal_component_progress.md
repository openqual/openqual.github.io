# RenewalComponentProgress

Progress on one `RenewalComponent`.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `component_id` | `String` | Yes | Matches `RenewalComponent.component_id`. |
| `order` | `int` | Yes | |
| `component_name` | `String` | Yes | Snapshot at the time of progress tracking (matches `RenewalComponent.component_name`). |
| `component_units` | `String` | Yes | Snapshot of `RenewalComponent.component_units`. |
| `component_quantity` | `double` | Yes | Snapshot of `RenewalComponent.component_quantity`. |
| `component_quantity_completed` | `double` | Yes | Raw total completed (may exceed `component_quantity`). |
| `effective_quantity_completed` | `double` | Yes | Completed quantity clamped to `component_quantity`. Used for rollup. |
| `requirements` | `List<RenewalRequirementProgress>` | Yes | One entry per sub-requirement. |
| `applied_training_ids` | `List<String>` | Yes | Opaque IDs of training records applied at the component level (not to any specific sub-requirement). May be empty. |
| `manually_added_credit` | `double` | Yes | Credit entered by the user without an associated training record. Defaults to `0.0`. |

## Notes

- `applied_training_ids` stores opaque string IDs of the training
  records that counted toward this component. Resolution to the
  referenced training records is the host application's
  responsibility.
- `effective_quantity_completed` is always `min(component_quantity,
  component_quantity_completed)` and is the value that contributes to
  book-level CE totals.
