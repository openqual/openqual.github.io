# RenewalProgress

In-flight progress against a `RenewalRequirements` definition. Mirrors
the shape of `RenewalRequirements` but with progress fields on every
node.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requirements_version` | `String` | Yes | Pinned version of the renewal requirements this progress is tracked against. |
| `components` | `List<RenewalComponentProgress>` | Yes | One progress entry per component in the pinned requirements version. |

## Methods

### `RenewalProgress.computeStatus(ce_units_required: double, ce_units_earned: double, due_date: DateTime?, now: DateTime) → RenewalStatus`

Pure.

1. If `ce_units_earned >= ce_units_required` → `complete`.
2. Else if `due_date` is set and `now > due_date` → `overdue`.
3. Else if `ce_units_earned > 0` → `in_progress`.
4. Else → `not_started`.

## Notes

- "CE units earned" is computed by `calculateCertificationProgress` —
  see [previous_renewals.md](previous_renewals.md) for its spec.
- `RenewalStatus` is deliberately small (four values) — renewals don't
  have the signoff/evaluation structure that `WorkItemStatus` captures.
