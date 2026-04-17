# Timezone handling — production guidance

Companion note for implementers who need production-grade timezone
resolution beyond what the reference implementations provide. This
is not part of the normative spec; the normative contract lives in
`schemas/certification.md` → "Calendar date semantics."

## Context

`Certification.isCurrentlyValid(now)` evaluates day-granularity
validity — the cert is valid through the last day of its expiration,
inclusive, in the issuing jurisdiction. The timezone cascade defines
how "today" is derived from a UTC `now`:

1. Use `Certification.issuing_timezone` (an IANA tz name) when the
   implementation can resolve it.
2. Otherwise, fall back to UTC.

The reference implementations in `dart/` and `js/` are
standard-library-only and implement step 2 (UTC) fully. Step 1
requires a timezone library the standard does not prescribe.

This note describes what a production implementation adds.

## Why step 2 is not good enough for production

A cert issued in Denver (`America/Denver`) expires on March 31. In
UTC, `2026-03-31T00:00:00Z` is `2026-03-30T17:00:00-07:00` in
Denver — still mid-day on the 30th locally. If a receiver evaluates
`isCurrentlyValid` at 6pm local Denver time on March 31:

- **UTC fallback:** `today` derived from `now.toUtc()` lands on
  April 1; `exp_day` derived the same way lands on March 31;
  `today > exp_day` → returns `false` (reports expired).
- **Step 1 (America/Denver):** `today` is March 31 in Denver;
  `exp_day` is March 31; `today <= exp_day` → returns `true`
  (correctly valid).

The UTC fallback under-reports validity by up to one day for any
cert whose `issuing_timezone` is west of UTC. East-of-UTC
jurisdictions see the inverse — over-reporting. Production adopters
with certs in non-UTC jurisdictions notice this immediately.

## What production implementations add

Three changes:

1. **Resolve `issuing_timezone` to a tz-aware offset at the given
   instant.** IANA tz names (e.g. `America/Denver`) require a
   library because they encode DST rules that transition at
   different dates per zone.
2. **Derive "today" in that timezone** — compute the calendar date
   of `now` as it reads in the target zone.
3. **Derive the expiration day the same way.** Same convention on
   both sides; the comparison stays apples-to-apples.

Every major language has a tz-capable library. Pointers:

- **Dart:** the [`timezone` package](https://pub.dev/packages/timezone).
  Initialize once at startup; convert with
  `TZDateTime.from(now, location)`.
- **JavaScript / Node:** `Intl.DateTimeFormat` with a `timeZone`
  option is standard-library and sufficient for extracting
  calendar-date parts. Ergonomic wrappers include
  [`luxon`](https://moment.github.io/luxon/) and
  [`date-fns-tz`](https://github.com/marnusw/date-fns-tz).
- **Python:** `zoneinfo` (stdlib, 3.9+) or `pytz`.
- **Java / Kotlin:** `java.time.ZoneId` + `ZonedDateTime`.
- **Go:** `time.LoadLocation` + `Time.In`.

## Example — Dart override using the `timezone` package

The reference `Certification.isCurrentlyValid` uses a private
`_dayUtc(dt)` helper that truncates a `DateTime` to its UTC
calendar day. A production override replaces that helper with a
tz-aware equivalent. The rest of the method logic stays identical.

Sketch:

```dart
import 'package:timezone/timezone.dart' as tz;

/// Truncates [dt] to the calendar day of [ianaName]. Falls back to
/// UTC when [ianaName] is null or unresolvable.
DateTime dayInTimezone(DateTime dt, String? ianaName) {
  if (ianaName == null) {
    final u = dt.toUtc();
    return DateTime.utc(u.year, u.month, u.day);
  }
  try {
    final loc = tz.getLocation(ianaName);
    final local = tz.TZDateTime.from(dt, loc);
    return DateTime.utc(local.year, local.month, local.day);
  } catch (_) {
    // Unresolvable tz name — fall back to UTC.
    final u = dt.toUtc();
    return DateTime.utc(u.year, u.month, u.day);
  }
}

/// Tz-aware variant of [Certification.isCurrentlyValid].
bool isCurrentlyValidTz(Certification cert, DateTime now) {
  if (cert.status == CertStatus.revoked ||
      cert.status == CertStatus.suspended ||
      cert.status == CertStatus.expired) {
    return false;
  }
  if (cert.expirationDate != null &&
      cert.expirationDate == neverExpireDate) {
    if (cert.certificationDate != null &&
        dayInTimezone(now, cert.issuingTimezone)
            .isBefore(dayInTimezone(
                cert.certificationDate!, cert.issuingTimezone))) {
      return false;
    }
    return true;
  }
  final today = dayInTimezone(now, cert.issuingTimezone);
  if (cert.certificationDate != null) {
    if (today.isBefore(
        dayInTimezone(cert.certificationDate!, cert.issuingTimezone))) {
      return false;
    }
  }
  if (cert.expirationDate == null) return true;
  final expDay = dayInTimezone(cert.expirationDate!, cert.issuingTimezone);
  return !today.isAfter(expDay);
}
```

The JavaScript equivalent follows the same shape — swap the helper
for an `Intl.DateTimeFormat`-based or `luxon`-based truncation.

## Edge cases to test

- **DST transitions.** A cert whose expiration day includes a DST
  boundary must still evaluate correctly on both sides of the
  transition. Test `America/New_York` certs expiring in early
  March (spring forward) and early November (fall back).
- **Unresolvable tz name.** The field is a free-form string; if it
  cannot be resolved (typo, or a newly-created tz name the library
  does not recognize), fall back to UTC rather than erroring, and
  log the fallback so operators can audit the data.
- **Null `issuing_timezone`.** UTC fallback; this is the standard's
  defined behavior for step 2 of the cascade.
- **Cross-jurisdiction mutual aid** (acknowledged as out of scope
  for v0.1). A cert valid in one jurisdiction's timezone may
  evaluate differently in another. The cascade always uses the
  *issuing* jurisdiction's tz; evaluating in a viewer's timezone
  is an explicit presentation-layer choice (see
  `certification.md` → "Implementer flexibility beyond the
  cascade"). Production implementations that offer viewer-local
  UX for validity MUST label those as UX, not as the standard's
  authoritative answer.

## Relation to the spec

The two-step cascade itself is normative — it defines how
`isCurrentlyValid` derives "today" from a UTC `now`. What the
cascade does **not** guarantee is that every conformant
implementation produces the same answer for every record:

- **On certs where `issuing_timezone` is null** — all conformant
  implementations agree, because every implementation falls back
  to step 2 (UTC).
- **On certs where `issuing_timezone` is populated** — a
  step-1-capable implementation produces the authoritative answer
  per the cascade. A step-2-only implementation is still
  conformant for the documented fallback case, but its answer may
  differ from the authoritative answer by up to one day at day
  boundaries.

In other words, the cascade is deterministic, but conformance
below step 1 is a hedged conformance: fine for day-to-day
evaluation of records with null `issuing_timezone`, explicitly
acceptable for reference implementations in constrained
environments, and materially wrong for production use on records
that do carry a timezone.

Two practical implications:

- **Reference implementations are honest fallbacks, not drop-in
  production evaluators.** `dart/` and `js/` implement step 2
  correctly; they document the step-1 gap; that is the extent of
  their conformance claim.
- **Production adopters with non-UTC certs should treat step-1
  absence as a correctness bug in their deployment.** Adding a
  timezone library and honoring `issuing_timezone` is the path to
  the authoritative answer.
