# Constants

Shared constants published as part of the OpenQual standard.

## `neverExpireDate`

The standard sentinel timestamp used wherever a field requires a
concrete `DateTime` but the conceptual meaning is "no expiration" or
"far future." Implementations that need such a sentinel must use this
value rather than inventing their own.

**Value:** `2199-12-31T00:00:00Z` (UTC).

**Rationale:** chosen to sit far beyond any plausible real-world
expiration while staying inside the safe `Date` range of every
mainstream runtime. The common alternative of `9999-12-31` has been
observed to trigger quirks in some JavaScript `Date` pipelines and
backend storage layers; `2199-12-31` avoids that class of issue.

**Where it appears in the standard:**

- `Taskbook.fromExternalJson` uses it as the placeholder `due_date`
  when the external payload does not provide one.
- Implementations are encouraged to use it anywhere a "never expires"
  or "indefinite" sentinel is required (for example, as a default
  expiration on an open-ended authorization).

**Compliance:** treating a `DateTime` equal to `neverExpireDate` as a
sentinel (rather than a literal calendar date) is expected behavior.
Implementations must not silently round, truncate, or normalize this
value to a different instant.

## `schemaVersion`

The string identifying the version of the OpenQual standard a portable
record was produced against. Every top-level portable record
(`Certification`, `Taskbook`) MUST carry this value in its
`schema_version` field; receiving systems use it to decide whether to
process, reject, or flag a record.

**Value for v0.1:** `"0.1.0"`.

**Format:** `MAJOR.MINOR.PATCH`, as a plain string (semantic
versioning). MAJOR, MINOR, and PATCH are non-negative integers.

**Receiver behavior** is specified in `README.md` → "Schema versioning."
