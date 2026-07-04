// Copyright 2026 FireCal LLC. Apache-2.0.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import 'enums.dart';
import 'organization_snapshot.dart';
import 'renewal_requirements.dart';
import 'source.dart';
import 'validity_period.dart';
import 'wire.dart';

/// Portable definition of a certification type.
class CertType {
  final String name;
  final String? level;
  final String? abbreviation;
  final String? displayName;
  final Discipline discipline;
  final String? disciplineOther;
  final CertClassification classification;
  final String? classificationOther;

  /// Authority-issued canonical identifiers for this cert type (e.g.
  /// FEMA `IS-00100`). May be empty. See schemas/cert_type.md →
  /// "Authoritative codes".
  final List<AuthoritativeCode> authoritativeCodes;

  final ValidityPeriod? validityPeriod;

  /// Optional separation of the training-applicability window from the
  /// expiration, with anchoring rules. Null ⇒ single-terminal behavior
  /// (window == validity period; expiration == window end).
  final RenewalWindow? renewalWindow;

  final String? standardCode;
  final String? standardEdition;
  final RenewalRequirements? renewalRequirements;
  final OrganizationSnapshot? certifyingAgency;
  final Source? source;

  const CertType({
    required this.name,
    this.level,
    this.abbreviation,
    this.displayName,
    required this.discipline,
    this.disciplineOther,
    this.classification = CertClassification.certification,
    this.classificationOther,
    this.authoritativeCodes = const [],
    this.validityPeriod,
    this.renewalWindow,
    this.standardCode,
    this.standardEdition,
    this.renewalRequirements,
    this.certifyingAgency,
    this.source,
  });

  /// Reads the wire shape produced by [toMap].
  factory CertType.fromMap(Map<String, dynamic> m) => CertType(
        name: m['name'] as String,
        level: m['level'] as String?,
        abbreviation: m['abbreviation'] as String?,
        displayName: m['display_name'] as String?,
        discipline: disciplineFromWire(m['discipline'] as String),
        disciplineOther: m['discipline_other'] as String?,
        classification: m['classification'] == null
            ? CertClassification.certification
            : certClassificationFromWire(m['classification'] as String),
        classificationOther: m['classification_other'] as String?,
        authoritativeCodes: m['authoritative_codes'] == null
            ? const []
            : (m['authoritative_codes'] as List)
                .map((e) => AuthoritativeCode.fromMap(
                    (e as Map).cast<String, dynamic>()))
                .toList(),
        validityPeriod: m['validity_period'] == null
            ? null
            : ValidityPeriod.fromMap(
                (m['validity_period'] as Map).cast<String, dynamic>()),
        renewalWindow: RenewalWindow.fromMap(m['renewal_window']),
        standardCode: m['standard_code'] as String?,
        standardEdition: m['standard_edition'] as String?,
        renewalRequirements: m['renewal_requirements'] == null
            ? null
            : RenewalRequirements.fromMap(
                (m['renewal_requirements'] as Map).cast<String, dynamic>()),
        certifyingAgency: m['certifying_agency'] == null
            ? null
            : OrganizationSnapshot.fromMap(
                (m['certifying_agency'] as Map).cast<String, dynamic>()),
        source: m['source'] == null
            ? null
            : Source.fromMap((m['source'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'name': name,
        if (level != null) 'level': level,
        if (abbreviation != null) 'abbreviation': abbreviation,
        if (displayName != null) 'display_name': displayName,
        'discipline': wireValue(discipline),
        if (disciplineOther != null) 'discipline_other': disciplineOther,
        'classification': wireValue(classification),
        if (classificationOther != null)
          'classification_other': classificationOther,
        'authoritative_codes':
            authoritativeCodes.map((c) => c.toMap()).toList(),
        if (validityPeriod != null)
          'validity_period': validityPeriod!.toMap(),
        if (renewalWindow != null) 'renewal_window': renewalWindow!.toMap(),
        if (standardCode != null) 'standard_code': standardCode,
        if (standardEdition != null) 'standard_edition': standardEdition,
        if (renewalRequirements != null)
          'renewal_requirements': renewalRequirements!.toMap(),
        if (certifyingAgency != null)
          'certifying_agency': certifyingAgency!.toMap(),
        if (source != null) 'source': source!.toMap(),
      };

  /// Pure. Resolves the renewal-date triple for the cycle anchored at
  /// [anchor] (the issue date, or the completion date of the previous
  /// renewal), per the normative derivation in schemas/cert_type.md →
  /// `RenewalWindow`.
  ///
  /// - **Rolling** (or no [renewalWindow]): the window rolls from
  ///   [anchor] for the cycle length — [RenewalWindow.years], falling
  ///   back to [validityPeriod], falling back to 2 years.
  /// - **Calendar:** [anchor]'s year is the FIRST calendar year of the
  ///   window; the window ends on `calendar_end` of
  ///   `anchor.year + years − 1`; the window starts the day after the
  ///   prior `calendar_end`.
  ///
  /// In both alignments, `expiration = window_end + expiration_offset`.
  RenewalDates resolveRenewalDates({required DateTime anchor}) {
    final rw = renewalWindow;
    if (rw == null || rw.alignment == RenewalWindowAlignment.rolling) {
      final windowEnd = _addCycle(anchor, rw?.years);
      final expiration =
          rw == null ? windowEnd : (rw.expirationOffset?.applyTo(windowEnd) ?? windowEnd);
      return RenewalDates(
        windowStart: anchor,
        windowEnd: windowEnd,
        expiration: expiration,
      );
    }
    final years = rw.years ?? 2;
    final windowEnd = _calendarEndInYear(rw, anchor.year + years - 1);
    final windowStart =
        _calendarEndInYear(rw, anchor.year - 1).add(const Duration(days: 1));
    return RenewalDates(
      windowStart: windowStart,
      windowEnd: windowEnd,
      expiration: rw.expirationOffset?.applyTo(windowEnd) ?? windowEnd,
    );
  }

  /// Adds one cycle to [anchor]: [years] when set, else the cert
  /// type's [validityPeriod], else 2 years.
  DateTime _addCycle(DateTime anchor, int? years) {
    if (years != null) return addMonthsClamped(anchor, years * 12);
    final vp = validityPeriod;
    if (vp == null) return addMonthsClamped(anchor, 24);
    switch (vp.units) {
      case TimeUnit.minutes:
        return anchor.add(Duration(minutes: vp.duration));
      case TimeUnit.hours:
        return anchor.add(Duration(hours: vp.duration));
      case TimeUnit.days:
        return anchor.add(Duration(days: vp.duration));
      case TimeUnit.weeks:
        return anchor.add(Duration(days: vp.duration * 7));
      case TimeUnit.months:
        return addMonthsClamped(anchor, vp.duration);
      case TimeUnit.quarters:
        return addMonthsClamped(anchor, vp.duration * 3);
      case TimeUnit.years:
        return addMonthsClamped(anchor, vp.duration * 12);
    }
  }

  static DateTime _calendarEndInYear(RenewalWindow rw, int year) {
    final parts = (rw.calendarEnd ?? '12-31').split('-');
    final m = parts.isNotEmpty ? (int.tryParse(parts[0]) ?? 12) : 12;
    final d = parts.length > 1 ? (int.tryParse(parts[1]) ?? 31) : 31;
    return DateTime(year, m, d);
  }
}

/// One authority-issued identifier for a cert type — canonical identity
/// in the way an ISBN identifies a book: two independent parties
/// referencing `{"authority": "FEMA", "code": "IS-00100"}` provably
/// mean the same certification type.
class AuthoritativeCode {
  /// The issuing authority, e.g. `"FEMA"`, `"NREMT"`, `"NWCG"`.
  final String authority;

  /// The authority's identifier for this cert type, verbatim as issued.
  final String code;

  const AuthoritativeCode({required this.authority, required this.code});

  /// Reads the wire shape produced by [toMap].
  factory AuthoritativeCode.fromMap(Map<String, dynamic> m) =>
      AuthoritativeCode(
        authority: m['authority'] as String,
        code: m['code'] as String,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        'authority': authority,
        'code': code,
      };
}

/// How a [RenewalWindow]'s training-applicability window is anchored.
enum RenewalWindowAlignment {
  /// Window rolls from the renewal anchor (issue / completion date).
  rolling,

  /// Window snaps to calendar boundaries (e.g. ends Dec 31).
  calendar,
}

/// Derivation config separating the **training-applicability window**
/// (when training counts toward the current cycle) from the
/// **expiration** (when the credential lapses). The canonical hard
/// case is NREMT: `{years: 2, alignment: calendar, calendar_end:
/// "12-31", expiration_offset: {months: 3}}`.
///
/// All fields optional so new degrees of freedom stay additive; an
/// empty object is equivalent to null ([fromMap] enforces this).
class RenewalWindow {
  /// Cycle length in years; falls back to the cert type's
  /// `validity_period` when null.
  final int? years;

  /// Rolling (default) vs calendar anchoring.
  final RenewalWindowAlignment alignment;

  /// For [RenewalWindowAlignment.calendar]: the window end as `"MM-DD"`
  /// (e.g. `"12-31"`). Defaults to `12-31` when null.
  final String? calendarEnd;

  /// Grace gap from window end to expiration. Absent ⇒ expiration ==
  /// window end.
  final ExpirationOffset? expirationOffset;

  const RenewalWindow({
    this.years,
    this.alignment = RenewalWindowAlignment.rolling,
    this.calendarEnd,
    this.expirationOffset,
  });

  /// Parses from a wire map; returns null for absent OR fully-empty
  /// maps (so an empty `{}` reads as "no config" — the schema's
  /// empty-object-equals-null rule).
  static RenewalWindow? fromMap(Object? raw) {
    if (raw is! Map) return null;
    final map = raw.cast<String, dynamic>();
    final years = (map['years'] as num?)?.toInt();
    final alignment = (map['alignment'] as String?) == 'calendar'
        ? RenewalWindowAlignment.calendar
        : RenewalWindowAlignment.rolling;
    final rawCalendarEnd = (map['calendar_end'] as String?)?.trim();
    final calendarEnd =
        (rawCalendarEnd == null || rawCalendarEnd.isEmpty) ? null : rawCalendarEnd;
    final offset = ExpirationOffset.fromMap(map['expiration_offset']);
    final empty = years == null &&
        calendarEnd == null &&
        offset == null &&
        alignment == RenewalWindowAlignment.rolling;
    if (empty) return null;
    return RenewalWindow(
      years: years,
      alignment: alignment,
      calendarEnd: calendarEnd,
      expirationOffset: offset,
    );
  }

  /// Serializes to the snake-case wire shape; omits defaults so the
  /// stored map stays minimal. Round-trips through [fromMap].
  Map<String, dynamic> toMap() => {
        if (years != null) 'years': years,
        'alignment': wireValue(alignment),
        if (calendarEnd != null) 'calendar_end': calendarEnd,
        if (expirationOffset != null)
          'expiration_offset': expirationOffset!.toMap(),
      };
}

/// Grace gap from a renewal window's end to the credential expiration.
class ExpirationOffset {
  /// Calendar months added to the window end (end-of-month clamped).
  final int months;

  /// Days added after the month arithmetic.
  final int days;

  const ExpirationOffset({this.months = 0, this.days = 0});

  /// Parses from a wire map; returns null for absent or all-zero maps.
  static ExpirationOffset? fromMap(Object? raw) {
    if (raw is! Map) return null;
    final months = (raw['months'] as num?)?.toInt() ?? 0;
    final days = (raw['days'] as num?)?.toInt() ?? 0;
    if (months == 0 && days == 0) return null;
    return ExpirationOffset(months: months, days: days);
  }

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (months != 0) 'months': months,
        if (days != 0) 'days': days,
      };

  /// Applies this offset to [windowEnd]: month arithmetic first
  /// (end-of-month clamped), then days.
  DateTime applyTo(DateTime windowEnd) {
    var r = addMonthsClamped(windowEnd, months);
    if (days != 0) r = r.add(Duration(days: days));
    return r;
  }
}

/// The three resolved renewal dates for a cycle — the training
/// applicability window plus the expiration (which may fall after the
/// window end by the grace offset). Produced by
/// [CertType.resolveRenewalDates].
class RenewalDates {
  const RenewalDates({
    required this.windowStart,
    required this.windowEnd,
    required this.expiration,
  });

  /// First day training counts toward the cycle (inclusive).
  final DateTime windowStart;

  /// Last day training counts toward the cycle (inclusive) — the
  /// training cutoff.
  final DateTime windowEnd;

  /// When the credential lapses; == [windowEnd] unless a grace offset
  /// pushes it later.
  final DateTime expiration;
}

/// Calendar-month addition with end-of-month clamping (Jan 31 + 1
/// month → Feb 28/29). [months] must be `>= 0`.
DateTime addMonthsClamped(DateTime d, int months) {
  assert(months >= 0, 'months must be >= 0');
  final zeroBased = d.month - 1 + months;
  final y = d.year + zeroBased ~/ 12;
  final m = zeroBased % 12 + 1;
  final lastDay = DateTime(y, m + 1, 0).day;
  final day = d.day > lastDay ? lastDay : d.day;
  return d.isUtc
      ? DateTime.utc(y, m, day, d.hour, d.minute, d.second)
      : DateTime(y, m, day, d.hour, d.minute, d.second);
}
