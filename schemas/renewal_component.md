# RenewalComponent

One of the top-level buckets of a cert renewal (for example, "Continuing
Education Hours" or "Skill Verifications"). A component has its own
quantity target and may contain one or more `RenewalRequirement`s that
further sub-divide that target.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `component_id` | `String` | Yes | Opaque ID unique within the parent `RenewalRequirements`. |
| `order` | `int` | Yes | Position among sibling components. |
| `component_name` | `String` | Yes | Display name. |
| `component_quantity` | `double` | Yes | Total quantity required to satisfy this component. |
| `component_units` | `String` | Yes | Unit label (e.g. `"hours"`). Free-form; typically matches a `RequirementUnits` value but the standard does not enforce this at the component level. |
| `requirements` | `List<RenewalRequirement>` | Yes | Sub-requirements. May be empty for components that are satisfied directly (no further subdivision). |

## Notes

- If `requirements` is empty, progress against this component is
  tracked purely by the component-level applied training + manual
  credit; see `RenewalComponentProgress`.
