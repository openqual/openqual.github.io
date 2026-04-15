# RenewalRequirement

A concrete atomic requirement under a `RenewalComponent`.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requirement_id` | `String` | Yes | Opaque ID unique within the parent component. |
| `order` | `int` | Yes | Position among sibling requirements. |
| `requirement_name` | `String` | Yes | Internal name (machine-friendly). |
| `requirement_display_name` | `String?` | No | Display name; falls back to `requirement_name` when absent. |
| `requirement_description` | `String?` | No | Prose description. |
| `requirement_quantity` | `double` | Yes | Target quantity. |
| `requirement_units` | `RequirementUnits` | Yes | Unit for the target. |
