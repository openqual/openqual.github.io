# TaskbookEvaluationConfig

Book-level scoring configuration. Controls how point totals across the
taskbook's scored evaluation tasks roll up for pass/fail determination.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scoring_mode` | `String` | Yes | Either `aggregated` or `per_section`. `aggregated` sums all scored-evaluation points across every section; `per_section` leaves thresholds to the individual sections. Defaults to `aggregated`. |
| `scoring_config` | `BookScoringConfig?` | No | Book-level threshold. Only consulted when `scoring_mode = aggregated`. |

## Nested type

### `BookScoringConfig`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `min_passing_points` | `double?` | No | Absolute point threshold. Preferred over percentage when both are set. |
| `min_passing_percentage` | `double?` | No | Fractional threshold in `[0.0, 1.0]`. Values above `1.0` are auto-corrected to percent (e.g. `70` → `0.70`) with a warning. |

## Notes

- The book-level "cannot pass" and "did not pass" branches of the
  taskbook status waterfall consult these fields. Section-level
  thresholds (in `TaskbookSection.scoring_config`) apply independently.
- A book can have `scoring_mode = per_section` with no book-level
  threshold; in that mode `complete_failed` at the book level fires
  only from autofail propagation or from any section reaching its own
  `complete_failed` state.
