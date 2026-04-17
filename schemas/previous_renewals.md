# PreviousRenewals

Ordered history of a certification's completed renewal cycles.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `previous_renewals` | `List<PreviousRenewal>` | Yes | Ordered oldest → newest. May be empty. |

## Methods

### `calculateCertificationProgress(components, ce_units_required, cert_manually_added_credit, cert_applied_training_unit_totals, component_applied_training_unit_totals, requirement_applied_training_unit_totals) → { ce_units_earned, certification_progress }`

Pure. This is a standalone function rather than a method on any of the
renewal structs, because it operates across all three nesting levels
simultaneously and updates progress fields on components and
requirements as it goes.

**Arguments:**

- `components` — the list of `RenewalComponentProgress` to compute
  over. The function updates progress fields on these components and
  their nested requirements in place (or, in functional-style
  implementations, returns updated copies).
- `ce_units_required` — the total CE units required for the
  certification.
- `cert_manually_added_credit` — manual credit entered at the
  certification level (not associated with any particular component).
- `cert_applied_training_unit_totals` — a `double` equal to the sum of
  `units_earned` across all training records applied at the
  certification level. **Pre-computed** by the caller; this function
  does **no** I/O.
- `component_applied_training_unit_totals` — a `Map<String, double>`
  keyed by `component_id`, giving the pre-computed sum of
  `units_earned` across training records applied at each component
  level. Missing keys are treated as `0.0`.
- `requirement_applied_training_unit_totals` — a
  `Map<String, double>` keyed by `requirement_id`, giving the
  pre-computed sum for each requirement.

**Algorithm:**

1. For each component in `components`:
   1. For each requirement in the component:
      1. `r.requirement_quantity_completed = r.manually_added_credit + requirement_applied_training_unit_totals[r.requirement_id]`
      2. `r.effective_quantity_completed = min(r.requirement_quantity_completed, r.requirement_quantity)`
      3. Accumulate `r.effective_quantity_completed` into
         `component_total_completed`.
   2. `component_total_completed += c.manually_added_credit + component_applied_training_unit_totals[c.component_id]`
   3. `c.component_quantity_completed = component_total_completed`
   4. `c.effective_quantity_completed = min(component_total_completed, c.component_quantity)`
   5. Accumulate `c.effective_quantity_completed` into
      `total_effective_ce_units`.
2. `ce_units_earned = total_effective_ce_units + cert_manually_added_credit + cert_applied_training_unit_totals`
3. `certification_progress = clamp(ce_units_earned / ce_units_required, 0.0, 1.0)` when `ce_units_required > 0`, else `1.0`.

**Returns:** an object with `ce_units_earned: double` and
`certification_progress: double`.

## Implementation note

The published implementation clamps the final `certification_progress`
to `[0.0, 1.0]`. Callers MAY rely on this invariant.

## Notes

- All three "applied training unit totals" inputs are pre-computed
  sums, not lists of IDs. This keeps the function pure: the caller is
  responsible for resolving training records and summing their units
  before calling `calculateCertificationProgress`.
