# TaskbookAssignment

The assignment triple for a `Taskbook`: who is doing it, who will
evaluate it, and what organization is hosting it. Each slot pairs a
frozen identity snapshot with an optional `assigned_at` timestamp
capturing when that assignment was made.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `assignee` | `AssignedPerson?` | No | The user performing the taskbook, paired with when they were assigned. |
| `evaluator` | `AssignedPerson?` | No | The user responsible for evaluating / signing off, paired with when they were assigned. |
| `host` | `AssignedOrganization?` | No | The organization under which this work is happening, paired with when it was designated. |

## Nested types

### `AssignedPerson`

A person captured at the time of assignment, paired with the assignment
timestamp. Used for both assignee and evaluator slots; reusable for
future person-assignment slots.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `person` | `PersonSnapshot` | Yes | Frozen identity of the person at the time of assignment. See `person_snapshot.md`. |
| `assigned_at` | `DateTime?` | No | When the assignment was made. |

### `AssignedOrganization`

An organization captured at the time of assignment, paired with the
assignment timestamp. Used for the host slot today and reusable for
future organization-assignment slots.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `organization` | `OrganizationSnapshot` | Yes | Frozen identity of the organization at the time of assignment. See `organization_snapshot.md`. |
| `assigned_at` | `DateTime?` | No | When the assignment was made. |

## Notes

- The snapshot types (`PersonSnapshot`, `OrganizationSnapshot`) carry
  identity captured at assignment time — display name, optional
  disambiguation fields, and optional `source` provenance. See their
  individual specs.
- `assigned_at` is a property of the *assignment*, not of the person
  or organization. A person's identity was captured at some moment;
  the relationship (this person is assigned to this taskbook) was
  established at possibly a different moment. They may coincide, but
  the model separates them.
- Role is determined by which slot the entry fills (`assignee` vs.
  `evaluator` vs. `host`), not by any field on the entry itself. The
  same `AssignedPerson` shape fills both person slots; the slot name
  in the parent carries the role. This mirrors how `PersonSnapshot`
  and `OrganizationSnapshot` themselves are slot-agnostic.
