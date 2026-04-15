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
| `allowed_roles` | `List<String>` | Yes | Optional role names. Consulted when `type = org_members` to further constrain eligibility to members holding one of the listed roles. May be empty (meaning any org member qualifies). |
| `completed` | `bool` | Yes | `true` once a qualifying user has signed. Defaults to `false`. |
| `completion_timestamp` | `DateTime?` | No | Timestamp the policy transitioned to `completed = true`. Mirrors `SignoffRecord.signed_at`. |
| `signoff_record` | `SignoffRecord?` | No | The authoritative record of who signed. Set at the moment `completed` transitions to `true`. |

## Methods

### `SignoffPolicy.isEligible(user_id: String, taskbook_owner_id: String, org_memberships: Map<String, List<String>>) → bool`

Pure. Returns whether the given user is eligible to sign this policy.

**Arguments:**

- `user_id` — the candidate signer.
- `taskbook_owner_id` — the user ID of the taskbook's owner/assignee;
  used only when `type = this_user`.
- `org_memberships` — a map from organization ID to the list of roles
  the user holds in that organization. For example
  `{"org_abc": ["member", "officer"]}`. Pass an empty map if the user
  has no org memberships. Membership is determined by the host
  application and passed in; this method does not fetch anything.

**Logic by type:**

- `this_user`: returns `user_id == taskbook_owner_id`.
- `specify_users`: returns `user_id in allowed_users`.
- `org_members`: returns `true` iff the user is a member of at least
  one organization in `allowed_orgs`. If `allowed_roles` is non-empty,
  the user's roles in that org must intersect `allowed_roles`.

## Notes

- `org_officers` and `org_admins`, observed in the source eligibility
  function, are **not** first-class policy types in v0.1. A policy that
  restricts signing to officers or admins of an org should use
  `type = org_members` with `allowed_roles = ["officer"]` or
  `allowed_roles = ["admin"]`.
- Eligibility is a necessary but not sufficient condition for a signed
  policy to count as `completed`. The host application is responsible
  for capturing a `SignoffRecord` at the moment of signing and
  updating `completed` / `completion_timestamp`.
