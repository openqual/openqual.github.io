# Implementation guides

Supporting documentation for OpenQual implementers. These are
practical guides for production adoption, not part of the normative
spec — for normative content see `../schemas/`.

## Contents

- **[implementer_checklist.md](implementer_checklist.md)** — a
  copy-pasteable conformance checklist organized by implementation
  role (Producer, Receiver, method implementer). Terse version of
  the Conformance section in `schemas/README.md`.
- **[timezone_handling.md](timezone_handling.md)** — production
  guidance for timezone-aware evaluation of
  `Certification.isCurrentlyValid`. The reference implementations
  in `dart/` and `js/` are standard-library-only and implement step
  2 (UTC) of the cascade; this document shows what production
  implementations add to honor step 1 (`issuing_timezone`) with a
  real timezone library.

## Where to find other artifacts

- **Normative spec:** `../schemas/`
- **Worked record examples:** `../examples/`
- **Reference implementations:** `../dart/` and `../js/`
