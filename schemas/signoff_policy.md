# SignoffPolicy

Defines who may sign off on a `Taskbook`, a `TaskbookSection`, or a
`TaskbookTask`. Multiple policies can be attached to a single node;
`signoffs_require_all` at that node controls whether all must be
completed or any one suffices.

This type captures the **configuration** (who may sign). The
**record of who did sign** is `SignoffRecord` — see
[signoff_record.md](signoff_record.md).

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `String` | Yes | Opaque ID unique among sibling policies on the same node. |
| `type` | `SignoffPolicyType` | Yes | One of `this_user`, `specify_users`, `org_members`. |
| `allowed_users` | `List<String>` | Yes | Opaque user IDs. Consulted when `type = specify_users`. May be empty for other types. |
| `allowed_orgs` | `List<String>` | Yes | Opaque organization IDs. Consulted when `type = org_members`. May be empty for other types. |
| `allowed_roles` | `List<OrgRoles>` | Yes | Role constraints. Consulted when `type = org_members` to further constrain eligibility to members holding one of the listed roles. May be empty (meaning any org member qualifies). |
| `completed` | `bool` | Yes | `true` once a qualifying user has signed. Defaults to `false`. |
| `completion_timestamp` | `DateTime?` | No | Timestamp the policy transitioned to `completed = true`. Mirrors `SignoffRecord.signed_at`. |
| `signoff_record` | `SignoffRecord?` | No | The authoritative record of who signed. Set at the moment `completed` transitions to `true`. |

## Methods

### `SignoffPolicy.isEligible(user_id: String, taskbook_owner_id: String, org_memberships: Map<String, List<OrgRoles>>) → bool`

Pure. Returns whether the given user is eligible to sign this policy.

**Arguments:**

- `user_id` — the candidate signer.
- `taskbook_owner_id` — the user ID of the taskbook's owner/assignee;
  used only when `type = this_user`.
- `org_memberships` — a map from organization ID to the list of
  `OrgRoles` the user holds in that organization. For example
  `{"org_abc": [OrgRoles.member, OrgRoles.officer]}`. Pass an empty
  map if the user has no org memberships. Membership is determined by
  the host application and passed in; this method does not fetch
  anything.

**Logic by type:**

- `this_user`: returns `user_id == taskbook_owner_id`.
- `specify_users`: returns `user_id in allowed_users`.
- `org_members`: returns `true` iff the user is a member of at least
  one organization in `allowed_orgs`. If `allowed_roles` is non-empty,
  the user's roles in that org must intersect `allowed_roles`.

### `SignoffPolicy.isValidSigned() → bool`

Pure. Returns `true` iff the policy is in a compliant state:

- When `completed = false`, returns `true` (an unsigned policy is
  compliant).
- When `completed = true`, returns `true` iff `completion_timestamp`
  and `signoff_record` are both non-null AND
  `signoff_record.signed_at` equals `completion_timestamp`.

Returns `false` for the invalid states enumerated in the signing
contract below.

## Signing contract (normative)

A `SignoffPolicy` transitions from unsigned to signed exactly once.
The following three state changes constitute a single logical write
and must be persisted together:

1. `completed` is set to `true`.
2. `completion_timestamp` is set to the moment of signing.
3. `signoff_record` is set to a fully-populated `SignoffRecord`.

**Invariants of a compliant signed policy.** When `completed = true`:

- `completion_timestamp` must be non-null.
- `signoff_record` must be non-null.
- `signoff_record.signed_at` must equal `completion_timestamp`.
- The signer recorded in `signoff_record` must have satisfied
  `isEligible(signoff_record.signatory_id, …)` at the moment of
  signing. Eligibility at read time is not required — users can lose
  membership without invalidating past signatures.

**Invalid states.** Readers must treat the following as non-compliant
and either reject the data or surface it as corrupt:

- `completed = true` with `signoff_record = null`.
- `completed = true` with `completion_timestamp = null`.
- `completed = true` with
  `signoff_record.signed_at != completion_timestamp`.

`SignoffPolicy.isValidSigned` checks these invariants mechanically.

**Unsigning / revocation.** Reverting a signed policy is out of scope
for OpenQual v0.1. `SignoffRecord` is frozen by its own invariants;
applications that need to revoke a signature should model that as a
separate audit event at the application layer.

**Legacy data.** Implementations migrating from pre-OpenQual schemas
may encounter `completed = true` with no `signoff_record`. Such data
is not compliant with v0.1. Migrations should either synthesize a
best-effort `SignoffRecord` from available fields (e.g. the source
apps' `completed_by_name` and the policy's last-modified timestamp)
or mark the policy as unsigned.

## Notes

- `org_officers` and `org_admins`, observed in the source eligibility
  function, are **not** first-class policy types in v0.1. A policy that
  restricts signing to officers or admins of an org should use
  `type = org_members` with `allowed_roles = [OrgRoles.officer]` or
  `allowed_roles = [OrgRoles.admin]`. Values in `allowed_roles` must
  come from the `OrgRoles` enum.
