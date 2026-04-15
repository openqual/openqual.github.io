# SignoffRecord

Authoritative portable record of a completed signoff. The `SignoffPolicy`
configures *who may* sign; `SignoffRecord` captures *who did*.

OpenQual compliance requires storing a `SignoffRecord` for each
completed signoff. This record must not be modified after creation —
it is an audit trail.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `signatory_id` | `String` | Yes | Opaque user ID of the signer. |
| `signatory_name` | `String` | Yes | Display name captured at the time of signing. Preserved even if the user later renames or deactivates. |
| `signatory_role` | `String?` | No | Snapshot of the signer's relevant role at the time of signing, when applicable (e.g. `officer` for an `org_members` policy scoped by `allowed_roles`). |
| `signed_at` | `DateTime` | Yes | Timestamp of the signature. |
| `policy_type` | `SignoffPolicyType` | Yes | The `SignoffPolicy.type` in effect at the moment of signing. |

## Invariants

- All fields are captured at the moment of signing and frozen.
  Implementations must not backfill or mutate `signatory_name` if the
  user's display name changes later.
- `signed_at` **must** equal the `completion_timestamp` on the
  corresponding `SignoffPolicy`. See the signing contract in
  `signoff_policy.md`.

## Notes

- `SignoffRecord` is a standalone, frozen audit value. The standard
  deliberately separates it from `SignoffPolicy` so that the
  authorization rules (who may sign) live on the policy and the
  captured identity of who did sign lives on a record that cannot be
  edited.
