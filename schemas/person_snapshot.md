# PersonSnapshot

Frozen point-in-time identity capture. Reusable for certification holders,
instructors, evaluators, or any role where a person's identity must be
recorded as it was at the moment of an event.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `display_name` | `String` | Yes | Primary identifier for the person. |
| `first_name` | `String?` | No | First name, for disambiguation. |
| `last_name` | `String?` | No | Last name, for disambiguation. |
| `middle_name` | `String?` | No | Middle name, for disambiguation. |
| `suffix` | `String?` | No | Name suffix (e.g. "Jr.", "III"). |
| `email` | `String?` | No | Email address, for disambiguation. |
| `source` | `Source?` | No | Provenance attribution. `canonical_id` serves as the person's identifier in the originating system. |

## Notes

- All fields are captured at a point in time and should not be updated if
  the person's details change later. This follows the same principle as
  `SignoffRecord.signatory_name` — the snapshot preserves the identity as
  it was at the moment of capture.
- `Source.canonical_id` serves as the person's identifier in the
  originating system. No separate `user_id` field is needed; systems that
  require a stable cross-reference should use `source`.
