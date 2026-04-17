# Implementer Checklist

A terse, copy-pasteable checklist for building OpenQual v0.1
conformance into your implementation. Adoption aid only — the
normative authority is the Conformance section in
`schemas/README.md`; when this checklist and the Conformance section
disagree, Conformance wins.

Pick the roles your implementation plays and work through each
checklist. Most apps will be both Producer and Receiver.

## Producer — emitting OpenQual records

### MUST

- [ ] Populate `schema_version` on every top-level portable record
      (`Certification`, `Taskbook`). Current value: `"0.1.0"`.
- [ ] Populate every field marked "Required" in the spec for the
      record types I emit.
- [ ] Restrict enum-typed fields to values published in the
      standard's enums. No arbitrary strings in enum slots.
- [ ] Serialize calendar-date fields (`Certification.certification_date`,
      `Certification.expiration_date`) as `YYYY-MM-DD` or
      `DateTime` fixed to `00:00:00 UTC` on the named day.
- [ ] Write `SignoffRecord` atomically with the corresponding
      `SignoffPolicy` state transition. All of `completed = true`,
      `completion_timestamp`, and `signoff_record` set together,
      and `signoff_record.signed_at == completion_timestamp`.
- [ ] Treat snapshot-shaped fields (`PersonSnapshot`,
      `OrganizationSnapshot`, `SignoffRecord.signatory`,
      `EarnedViaTaskbook`, etc.) as frozen after capture. No
      backfill or mutation.

### SHOULD

- [ ] Populate `source` on portable records when the originating
      system or catalog is known.
- [ ] Populate `Certification.issuing_timezone` when the issuing
      jurisdiction has a known IANA timezone.
- [ ] Populate `Certification.cert_document.content` (inline
      base64) on records intended for external exchange.
- [ ] Populate `Attachment.mime_type` on all attachments.

## Receiver — consuming OpenQual records

### MUST

- [ ] Inspect `schema_version` on every top-level portable record
      I accept. Apply the four-case logic per `schemas/README.md`
      → "Schema versioning" (exact, newer-minor, newer-major,
      older).
- [ ] Reject records where a required field is missing.
- [ ] Reject records where an enum-typed field contains an unknown
      value — with two exceptions (see SHOULD below): `other`-hatch
      enums, and newer-MINOR records within a supported MAJOR.
- [ ] Accept both calendar-date serialization forms (`YYYY-MM-DD`
      and midnight-UTC `DateTime`) and normalize to day for
      comparisons.
- [ ] Do not set, backfill, or mutate snapshot-shaped fields on
      records from another producer — they are frozen audit data.
- [ ] Treat `neverExpireDate` (`2199-12-31T00:00:00Z`) as a
      sentinel for "no expiration," not as a literal calendar date.

### SHOULD

- [ ] When `schema_version` names a newer MINOR of the same MAJOR
      than I support, tolerate unknown optional fields (semver
      forward-compat within a MAJOR).
- [ ] For enums with `other` escape hatches (`Discipline`,
      `CertClassification`), treat unknown values as `other` when
      the record comes from a newer MINOR I don't fully recognize.
- [ ] Preserve the original payload for diagnostics when surfacing
      a validation failure.

## Computed methods — implement when exposed

Implementations are not required to expose every computed method.
For each one I do expose, verify it matches the spec:

- [ ] `Certification.isCurrentlyValid(now)` — per
      `schemas/certification.md` ("Calendar date semantics" +
      "Status and validity"). Reference impls are UTC-only; see
      `timezone_handling.md` for production step-1 handling.
- [ ] `SignoffPolicy.isEligible(user_id, owner_id, memberships)` —
      Map-based; `canonical_id` is the match key.
- [ ] `SignoffPolicy.isEligibleFor(signer, owner)` —
      snapshot-based; full `canonical_id + canonical_source`
      matching.
- [ ] `SignoffPolicy.isValidSigned()` — mechanical invariant check
      per the signing contract.
- [ ] `Taskbook.computeStatus()` — book-level priority waterfall.
- [ ] `TaskbookSection.computeStatus()` — section-level priority
      waterfall.

## Final pre-release check

- [ ] Run my records through the worked examples in `examples/`.
      Shape-equivalent output on the same inputs is a strong
      signal of conformance.
- [ ] Re-read `schemas/README.md` → "Conformance" for the
      authoritative version of what I just ticked. If my
      implementation disagrees with that section, fix the
      implementation (or file an issue if you think the spec is
      wrong).
- [ ] If I'm migrating from an existing non-OpenQual schema,
      maintain my own mapping doc alongside this checklist —
      migration debt is real and deserves explicit tracking.
