# ValidityPeriod

A duration expressed as an integer quantity and a calendar-time unit.
Used on `CertType` to specify how long a certification remains valid
after issuance.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `duration` | `int` | Yes | Number of time units. Must be positive. |
| `units` | `TimeUnit` | Yes | Calendar-time unit for the duration. |

## Notes

- When `ValidityPeriod` is present on a `CertType`, it represents
  the standard validity window for all issuances of that type. Real-
  world exceptions (emergency extensions, jurisdictional overrides)
  are not modeled in v0.1; see `OPEN_ISSUES.md` for community input
  on edge cases.
