# RenewalRequirements

Versioned definition of what must be completed to renew a certification.
Top-level container for a list of `RenewalComponent`s, each of which
contains one or more `RenewalRequirement`s.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `requirements_version` | `String` | Yes | Opaque version identifier. Changes whenever the requirements definition changes in a non-trivial way. Used by `PreviousRenewal` to pin the version that was satisfied. |
| `components` | `List<RenewalComponent>` | Yes | Ordered by `RenewalComponent.order`. May be empty. |

## Notes

- The `requirements_version` is free-form (dates, semver, hashes — all
  acceptable). The standard only requires that a given version string
  corresponds to exactly one components definition.
