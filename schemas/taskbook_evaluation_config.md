# TaskbookEvaluationConfig

Book-level scoring configuration. Controls how point totals across the
taskbook's scored evaluation tasks roll up for pass/fail determination.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scoring_mode` | `ScoringMode` | Yes | `aggregated` sums all scored-evaluation points across every section; `per_section` leaves thresholds to the individual sections. Defaults to `aggregated`. |
| `scoring_config` | `BookScoringConfig?` | No | Book-level threshold. Only consulted when `scoring_mode = aggregated`. |

## Nested type

### `BookScoringConfig`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `min_passing_points` | `double?` | No | Absolute point threshold. Preferred over percentage when both are set. |
| `min_passing_percentage` | `double?` | No | Fractional threshold in `[0.0, 1.0]`. Values outside that range are invalid: producers MUST NOT emit them and receivers MUST reject them. |

## Notes

- The book-level "cannot pass" and "did not pass" branches of the
  `Taskbook.computeStatus` waterfall consult these fields only when
  `scoring_mode = aggregated`. Section-level thresholds (in
  `TaskbookSection.scoring_config`) apply independently.
- `TaskbookSummary.scoring_summary` is populated whenever the book
  contains scored evaluation tasks, regardless of `scoring_mode`:
  - `aggregated`: `effective_threshold_points` and
    `effective_threshold_percentage` are derived from `scoring_config`
    (absolute `min_passing_points` preferred; otherwise
    `ceil(min_passing_percentage * points_possible)`).
  - `per_section`: `points_possible`, `points_awarded`, and
    `points_remaining` are still reported for display, but the two
    threshold fields are `null` because no book-level threshold
    applies. `Taskbook.computeStatus` enters `complete_failed` only
    via autofail propagation or a `complete_failed` section.
- `min_passing_percentage` outside `[0.0, 1.0]` is invalid at both the
  book and section levels. (v0.1 auto-corrected `70` → `0.70` with a
  warning; v1.0 removes the guard — see the migration notes in the
  release.)
