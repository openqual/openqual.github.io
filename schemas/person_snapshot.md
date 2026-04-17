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
| `memberships` | `List<OrgMembership>?` | No | Frozen snapshot of the organization memberships the person held at the moment of capture. Optional — omit when unknown, when the consuming use case does not need them, or when the person has no memberships worth capturing. See "Memberships and scope boundary" below. |
| `source` | `Source?` | No | Provenance attribution. `canonical_id` serves as the person's identifier in the originating system. |

## Nested types

### `OrgMembership`

An organization the person was a member of, paired with the roles they
held at the time of capture.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `organization` | `OrganizationSnapshot` | Yes | The organization in which the person held a role. See `organization_snapshot.md`. |
| `roles` | `List<OrgRoles>` | Yes | Roles the person held in the organization at the moment of capture. Typically non-empty. |

## Memberships and scope boundary

`PersonSnapshot.memberships` and the `OrgMembership` type are
deliberately **bounded** by the OpenQual Principle. They exist for one
concrete reason: a portable `PersonSnapshot` should travel with enough
structural information for eligibility checks
(`SignoffPolicy.isEligibleFor`) without requiring the receiving system
to build a separate memberships map out of band.

The scope is intentionally narrow:

- Memberships are **snapshot-shaped** — a frozen capture of
  roles-in-orgs at a moment in time. They are not updated if the
  person's actual memberships change later.
- Memberships carry **no lifecycle vocabulary** — no "invited,"
  "pending," "requested," "accepted," or "suspended" states. A person
  either held a role at the moment of capture (present in `roles`) or
  did not (absent). See `README.md` → "Organizations in the standard"
  for the wider scope boundary.
- `OrgMembership` is **not the canonical member-of-org model** for
  OpenQual. It is a convenience capture on a person snapshot. A
  richer membership model — with lifecycle, subunits, employment
  relationships, etc. — is planned for a future version. See the
  Roadmap in `README.md`.

## Notes

- All fields are captured at a point in time and MUST NOT be updated
  if the person's details change later. The snapshot preserves the
  identity as it was at the moment of capture. `SignoffRecord.signatory`
  follows the same principle — once written, it is frozen.
- `Source.canonical_id` serves as the person's identifier in the
  originating system. No separate `user_id` field is needed; systems
  that require a stable cross-reference SHOULD use `source`.
