# StartAndEndTimes

A pair of timestamps for a bounded activity, with a derived duration.
Primarily used on assignments and on start/end of evaluation sessions.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `start_time` | `DateTime?` | No | Inclusive start. |
| `end_time` | `DateTime?` | No | Inclusive end. Must not precede `start_time` when both are set. |
| `duration_ms` | `int?` | No | Duration in milliseconds. Derivable from `end_time - start_time`; included for display/query convenience. |
| `duration_display` | `String?` | No | Human-readable duration for display only. Not authoritative — implementations may recompute from `duration_ms`. |

## Invariants

- When both `start_time` and `end_time` are present, `end_time >= start_time`.
- `duration_ms`, when present, should equal `end_time - start_time` in
  milliseconds.
