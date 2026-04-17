# SignoffRecord

Authoritative portable record of a completed signoff. The `SignoffPolicy`
configures *who may* sign; `SignoffRecord` captures *who did*.

OpenQual compliance requires storing a `SignoffRecord` for each
completed signoff. This record must not be modified after creation —
it is an audit trail.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `signatory` | `PersonSnapshot` | Yes | Frozen identity of the signer at the moment of signing. See `person_snapshot.md`. |
| `signatory_role` | `OrgRoles?` | No | The role that qualified the signer, when applicable. Populated for `org_members` policies with non-empty `allowed_roles`. Null otherwise. |
| `signed_at` | `DateTime` | Yes | Timestamp of the signature. |
| `policy_type` | `SignoffPolicyType` | Yes | The `SignoffPolicy.type` in effect at the moment of signing. |

## Invariants

- All fields are captured at the moment of signing and frozen.
  Implementations MUST NOT mutate the `signatory` snapshot if the
  signer's display name, contact, or memberships change later.
- `signed_at` **must** equal the `completion_timestamp` on the
  corresponding `SignoffPolicy`. See the signing contract in
  `signoff_policy.md`.

## Notes

- `SignoffRecord` is a standalone, frozen audit value. The standard
  deliberately separates it from `SignoffPolicy` so that the
  authorization rules (who may sign) live on the policy and the
  captured identity of who did sign lives on a record that cannot be
  edited.
- The `signatory` field uses `PersonSnapshot`, the same type used for
  holders, instructors, evaluators, and assignees elsewhere in the
  standard. Identity for cross-system reference lives in
  `signatory.source`.
- `signatory_role` is a typed `OrgRoles` value (or null), not a
  free-form string. It records the specific role that satisfied the
  policy's eligibility check at signing time — useful for audit
  readability when a user holds multiple roles.
