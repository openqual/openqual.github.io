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
| `allowed_orgs` | `List<OrganizationSnapshot>` | Yes | Organizations whose members may sign. Each entry is a full portable snapshot with provenance, so the policy is self-contained — a receiving system does not need a catalog lookup to know which orgs the policy authorizes. Consulted when `type = org_members`. May be empty for other types. See "Matching organizations" below for the equality rules. |
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
- `org_memberships` — a map from organization `canonical_id` to the
  list of `OrgRoles` the user holds in that organization. Keys must
  match the `source.canonical_id` of organizations the user is a
  member of; see "Matching organizations" below for the full matching
  contract. For example `{"org_abc": [OrgRoles.member, OrgRoles.officer]}`.
  Pass an empty map if the user has no org memberships. Membership is
  determined by the host application and passed in; this method does
  not fetch anything.

**Logic by type:**

- `this_user`: returns `user_id == taskbook_owner_id`.
- `specify_users`: returns `user_id in allowed_users`.
- `org_members`: for each `OrganizationSnapshot` in `allowed_orgs`,
  reads `source.canonical_id` and looks it up in `org_memberships`.
  Returns `true` if any lookup succeeds and the user's roles in that
  org satisfy `allowed_roles` (empty `allowed_roles` means any
  membership qualifies; non-empty means the user's roles must
  intersect `allowed_roles`). See "Matching organizations" for the
  equality rules and how un-sourced snapshots are handled.

### `SignoffPolicy.isEligibleFor(signer: PersonSnapshot, taskbook_owner: PersonSnapshot) → bool`

Pure. Snapshot-based alternative to `isEligible`. Returns whether the
signer is eligible to sign this policy when both the signer and the
taskbook owner are already available as `PersonSnapshot` values.

**Arguments:**

- `signer` — the candidate signer, as a `PersonSnapshot`. For
  `type = org_members`, the signer's `memberships` field supplies the
  memberships consulted for eligibility.
- `taskbook_owner` — the taskbook's owner/assignee, as a
  `PersonSnapshot`; used only when `type = this_user`.

**Logic by type:**

- `this_user`: returns `true` iff `signer` and `taskbook_owner` refer
  to the same person — their `source.canonical_id` and
  `source.canonical_source` are both non-null and equal. If either
  snapshot lacks full provenance, returns `false`.
- `specify_users`: returns `true` iff the signer's
  `source.canonical_id` is in `allowed_users`. Returns `false` if
  the signer lacks a `canonical_id`.
- `org_members`: iterates `allowed_orgs` and `signer.memberships`,
  matching on full `canonical_id + canonical_source` equality. If a
  matching membership is found and `allowed_roles` is empty OR the
  membership's roles intersect `allowed_roles`, returns `true`.

Un-sourced snapshots never match under any type — see "Matching
organizations" below.

**When to use which form:**

- Use this method when the caller already has `PersonSnapshot` values
  for the signer and owner. It avoids building a string-keyed
  memberships map out of band, and it supports cross-source matching
  via the full source tuple.
- Use the map-based `isEligible` when the host's membership data is
  already shaped as `Map<String, List<OrgRoles>>` under a single
  `canonical_source` convention and the cost of constructing
  `PersonSnapshot` values isn't warranted.

### `SignoffPolicy.isValidSigned() → bool`

Pure. Returns `true` iff the policy is in a compliant state:

- When `completed = false`, returns `true` (an unsigned policy is
  compliant).
- When `completed = true`, returns `true` iff `completion_timestamp`
  and `signoff_record` are both non-null AND
  `signoff_record.signed_at` equals `completion_timestamp`.

Returns `false` for the invalid states enumerated in the signing
contract below.

## Matching organizations (normative)

When `type = org_members`, matching an entry in `allowed_orgs`
against the user's memberships follows these rules:

1. **Identity is the source fields.** Two `OrganizationSnapshot`
   values refer to the same organization iff their
   `source.canonical_id` values are equal AND their
   `source.canonical_source` values are equal. Display fields
   (`name`, `display_name`, contact info) are **not** considered for
   identity. Those capture how the snapshot looked at capture time and
   may legitimately differ across sources or over time.

2. **No provenance means no match.** An `OrganizationSnapshot` whose
   `source` is null, or whose `source.canonical_id` or
   `source.canonical_source` is missing, cannot be globally
   identified. It MUST NOT match any membership. A policy built with
   un-sourced snapshots in `allowed_orgs` is effectively unenforceable
   under `type = org_members` — hosts SHOULD require provenance on
   policy `allowed_orgs`.

3. **Two signatures, two matching strategies.** The standard defines
   two forms of eligibility evaluation (see Methods above):

   - **Map-based `isEligible`** — the `Map<String, List<OrgRoles>>`
     key is the organization's `canonical_id`. This signature assumes
     all snapshots in `allowed_orgs` and all user memberships come
     from a single `canonical_source`; the `canonical_source` equality
     check is implicit in the host using a consistent key convention.
   - **Snapshot-based `isEligibleFor`** — matches on full
     `canonical_id + canonical_source` tuples directly from the
     `OrganizationSnapshot` values in `allowed_orgs` and in
     `signer.memberships`. Use this signature when a record spans
     multiple sources, or when `PersonSnapshot` values are already
     available.

4. **Suspension / revocation / pre-membership states** are outside
   the standard's eligibility model. A user either holds a role in an
   org (present in the memberships map) or does not (absent). See
   "Organizations in the standard" in `README.md`.

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
- The signer recorded in `signoff_record.signatory` must have
  satisfied eligibility at the moment of signing — per either
  `isEligible` or `isEligibleFor`. Eligibility at read time is not
  required — users can lose membership without invalidating past
  signatures.

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
best-effort `SignoffRecord` from available fields (e.g. build the
`signatory` `PersonSnapshot` from the source apps' `completed_by_name`
and `completed_by_ref`, and use the policy's last-modified timestamp
for `signed_at`) or mark the policy as unsigned.

## Notes

- `org_officers` and `org_admins`, observed in the source eligibility
  function, are **not** first-class policy types in v0.1. A policy that
  restricts signing to officers or admins of an org should use
  `type = org_members` with `allowed_roles = [OrgRoles.officer]` or
  `allowed_roles = [OrgRoles.admin]`. Values in `allowed_roles` must
  come from the `OrgRoles` enum.
