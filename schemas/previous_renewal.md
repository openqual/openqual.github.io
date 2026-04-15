# PreviousRenewal

Archived snapshot of a completed renewal cycle. Immutable after
archiving. Captures the requirements version and progress state as they
existed at the moment the renewal cycle closed.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `archive_date` | `DateTime` | Yes | When this renewal cycle was archived. |
| `replaced_pdf_url` | `String?` | No | URL of a prior certification document that this renewal supersedes. |
| `required_ces_at_archiving` | `double` | Yes | The total CE units required by the snapshotted requirements version. |
| `manually_logged_ces_at_archiving` | `double` | Yes | The manually-added-credit total at the moment of archiving. |
| `applied_training_ids_at_archiving` | `List<String>` | Yes | Opaque IDs of training records applied to this renewal. Snapshot at archiving. |
| `renewal_progress_at_archiving` | `RenewalProgress` | Yes | Full snapshot of `RenewalProgress` (components and requirements) at the moment of archiving. |

## Invariants

- A `PreviousRenewal` must not be modified after creation. Subsequent
  renewal cycles add new `PreviousRenewal` entries; they never mutate
  existing ones.
- `renewal_progress_at_archiving.requirements_version` pins the version
  this archived cycle satisfied.

## Notes

- The source struct uses `List<DocumentReference>` for applied training
  at archiving. OpenQual replaces with opaque string IDs.
