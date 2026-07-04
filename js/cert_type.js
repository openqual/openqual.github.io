// Copyright 2026 FireCal LLC
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

'use strict';

const { CertClassification, TimeUnit } = require('./enums');
const { OrganizationSnapshot } = require('./organization_snapshot');
const { RenewalRequirements } = require('./renewal_requirements');
const { Source } = require('./source');
const { ValidityPeriod } = require('./validity_period');

const _DAY_MS = 86400000;

/**
 * Calendar-month addition with end-of-month clamping (Jan 31 + 1
 * month → Feb 28/29), computed on UTC calendar components. `months`
 * must be >= 0.
 *
 * @param {Date} d
 * @param {number} months
 * @returns {Date}
 */
function addMonthsClamped(d, months) {
  if (months < 0) throw new RangeError('months must be >= 0');
  const zeroBased = d.getUTCMonth() + months;
  const y = d.getUTCFullYear() + Math.floor(zeroBased / 12);
  const m = zeroBased % 12;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const day = d.getUTCDate() > lastDay ? lastDay : d.getUTCDate();
  return new Date(
    Date.UTC(y, m, day, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()),
  );
}

/** How a RenewalWindow's training-applicability window is anchored. */
const RenewalWindowAlignment = Object.freeze({
  // Window rolls from the renewal anchor (issue / completion date).
  ROLLING: 'rolling',
  // Window snaps to calendar boundaries (e.g. ends Dec 31).
  CALENDAR: 'calendar',
});

/** Portable definition of a certification type. */
class CertType {
  constructor({
    name,
    level = null,
    abbreviation = null,
    displayName = null,
    discipline,
    disciplineOther = null,
    classification = CertClassification.CERTIFICATION,
    classificationOther = null,
    authoritativeCodes = [],
    validityPeriod = null,
    renewalWindow = null,
    standardCode = null,
    standardEdition = null,
    renewalRequirements = null,
    certifyingAgency = null,
    source = null,
  }) {
    this.name = name;
    this.level = level;
    this.abbreviation = abbreviation;
    this.displayName = displayName;
    this.discipline = discipline;
    this.disciplineOther = disciplineOther;
    this.classification = classification;
    this.classificationOther = classificationOther;
    // Authority-issued canonical identifiers for this cert type (e.g.
    // FEMA `IS-00100`). May be empty. See schemas/cert_type.md →
    // "Authoritative codes".
    this.authoritativeCodes = Object.freeze([...authoritativeCodes]);
    this.validityPeriod = validityPeriod;
    // Optional separation of the training-applicability window from the
    // expiration, with anchoring rules. Null ⇒ single-terminal behavior
    // (window == validity period; expiration == window end).
    this.renewalWindow = renewalWindow;
    this.standardCode = standardCode;
    this.standardEdition = standardEdition;
    this.renewalRequirements = renewalRequirements;
    this.certifyingAgency = certifyingAgency;
    this.source = source;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new CertType({
      name: m.name,
      level: m.level ?? null,
      abbreviation: m.abbreviation ?? null,
      displayName: m.display_name ?? null,
      discipline: m.discipline,
      disciplineOther: m.discipline_other ?? null,
      classification: m.classification ?? CertClassification.CERTIFICATION,
      classificationOther: m.classification_other ?? null,
      authoritativeCodes: (m.authoritative_codes ?? []).map((e) =>
        AuthoritativeCode.fromJSON(e),
      ),
      validityPeriod:
        m.validity_period == null ? null : ValidityPeriod.fromJSON(m.validity_period),
      renewalWindow: RenewalWindow.fromJSON(m.renewal_window),
      standardCode: m.standard_code ?? null,
      standardEdition: m.standard_edition ?? null,
      renewalRequirements:
        m.renewal_requirements == null
          ? null
          : RenewalRequirements.fromJSON(m.renewal_requirements),
      certifyingAgency:
        m.certifying_agency == null
          ? null
          : OrganizationSnapshot.fromJSON(m.certifying_agency),
      source: m.source == null ? null : Source.fromJSON(m.source),
    });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = { name: this.name };
    if (this.level != null) out.level = this.level;
    if (this.abbreviation != null) out.abbreviation = this.abbreviation;
    if (this.displayName != null) out.display_name = this.displayName;
    out.discipline = this.discipline;
    if (this.disciplineOther != null) out.discipline_other = this.disciplineOther;
    out.classification = this.classification;
    if (this.classificationOther != null) {
      out.classification_other = this.classificationOther;
    }
    out.authoritative_codes = this.authoritativeCodes.map((c) => c.toJSON());
    if (this.validityPeriod != null) out.validity_period = this.validityPeriod.toJSON();
    if (this.renewalWindow != null) out.renewal_window = this.renewalWindow.toJSON();
    if (this.standardCode != null) out.standard_code = this.standardCode;
    if (this.standardEdition != null) out.standard_edition = this.standardEdition;
    if (this.renewalRequirements != null) {
      out.renewal_requirements = this.renewalRequirements.toJSON();
    }
    if (this.certifyingAgency != null) {
      out.certifying_agency = this.certifyingAgency.toJSON();
    }
    if (this.source != null) out.source = this.source.toJSON();
    return out;
  }

  /**
   * Pure. Resolves the renewal-date triple for the cycle anchored at
   * `anchor` (the issue date, or the completion date of the previous
   * renewal), per the normative derivation in schemas/cert_type.md →
   * `RenewalWindow`.
   *
   * - **Rolling** (or no renewalWindow): the window rolls from `anchor`
   *   for the cycle length — RenewalWindow.years, falling back to
   *   validityPeriod, falling back to 2 years.
   * - **Calendar:** `anchor`'s year is the FIRST calendar year of the
   *   window; the window ends on `calendar_end` of
   *   `anchor.year + years − 1`; the window starts the day after the
   *   prior `calendar_end`.
   *
   * In both alignments, `expiration = window_end + expiration_offset`.
   * Calendar math happens on UTC components.
   *
   * @param {{anchor: Date}} opts
   * @returns {RenewalDates}
   */
  resolveRenewalDates({ anchor }) {
    const rw = this.renewalWindow;
    if (rw == null || rw.alignment === RenewalWindowAlignment.ROLLING) {
      const windowEnd = this._addCycle(anchor, rw == null ? null : rw.years);
      const expiration =
        rw == null
          ? windowEnd
          : (rw.expirationOffset?.applyTo(windowEnd) ?? windowEnd);
      return new RenewalDates({ windowStart: anchor, windowEnd, expiration });
    }
    const years = rw.years ?? 2;
    const windowEnd = _calendarEndInYear(rw, anchor.getUTCFullYear() + years - 1);
    const windowStart = new Date(
      _calendarEndInYear(rw, anchor.getUTCFullYear() - 1).getTime() + _DAY_MS,
    );
    return new RenewalDates({
      windowStart,
      windowEnd,
      expiration: rw.expirationOffset?.applyTo(windowEnd) ?? windowEnd,
    });
  }

  /**
   * Adds one cycle to `anchor`: `years` when set, else the cert type's
   * validityPeriod, else 2 years.
   */
  _addCycle(anchor, years) {
    if (years != null) return addMonthsClamped(anchor, years * 12);
    const vp = this.validityPeriod;
    if (vp == null) return addMonthsClamped(anchor, 24);
    switch (vp.units) {
      case TimeUnit.MINUTES:
        return new Date(anchor.getTime() + vp.duration * 60000);
      case TimeUnit.HOURS:
        return new Date(anchor.getTime() + vp.duration * 3600000);
      case TimeUnit.DAYS:
        return new Date(anchor.getTime() + vp.duration * _DAY_MS);
      case TimeUnit.WEEKS:
        return new Date(anchor.getTime() + vp.duration * 7 * _DAY_MS);
      case TimeUnit.MONTHS:
        return addMonthsClamped(anchor, vp.duration);
      case TimeUnit.QUARTERS:
        return addMonthsClamped(anchor, vp.duration * 3);
      case TimeUnit.YEARS:
        return addMonthsClamped(anchor, vp.duration * 12);
      default:
        throw new TypeError(`unknown TimeUnit: ${vp.units}`);
    }
  }
}

function _calendarEndInYear(rw, year) {
  const parts = (rw.calendarEnd ?? '12-31').split('-');
  const m = parts.length > 0 ? parseInt(parts[0], 10) || 12 : 12;
  const d = parts.length > 1 ? parseInt(parts[1], 10) || 31 : 31;
  return new Date(Date.UTC(year, m - 1, d));
}

/**
 * One authority-issued identifier for a cert type — canonical identity
 * in the way an ISBN identifies a book: two independent parties
 * referencing `{"authority": "FEMA", "code": "IS-00100"}` provably
 * mean the same certification type.
 */
class AuthoritativeCode {
  constructor({ authority, code }) {
    // The issuing authority, e.g. "FEMA", "NREMT", "NWCG".
    this.authority = authority;
    // The authority's identifier for this cert type, verbatim as issued.
    this.code = code;
    Object.freeze(this);
  }

  /** Reads the wire shape produced by toJSON(). */
  static fromJSON(m) {
    return new AuthoritativeCode({ authority: m.authority, code: m.code });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    return {
      authority: this.authority,
      code: this.code,
    };
  }
}

/**
 * Derivation config separating the **training-applicability window**
 * (when training counts toward the current cycle) from the
 * **expiration** (when the credential lapses). The canonical hard case
 * is NREMT: `{years: 2, alignment: calendar, calendar_end: "12-31",
 * expiration_offset: {months: 3}}`.
 *
 * All fields optional so new degrees of freedom stay additive; an
 * empty object is equivalent to null (fromJSON enforces this).
 */
class RenewalWindow {
  constructor({
    years = null,
    alignment = RenewalWindowAlignment.ROLLING,
    calendarEnd = null,
    expirationOffset = null,
  } = {}) {
    // Cycle length in years; falls back to the cert type's
    // validity_period when null.
    this.years = years;
    // Rolling (default) vs calendar anchoring.
    this.alignment = alignment;
    // For calendar alignment: the window end as "MM-DD" (e.g. "12-31").
    // Defaults to 12-31 when null.
    this.calendarEnd = calendarEnd;
    // Grace gap from window end to expiration. Absent ⇒ expiration ==
    // window end.
    this.expirationOffset = expirationOffset;
    Object.freeze(this);
  }

  /**
   * Parses from a wire object; returns null for absent OR fully-empty
   * objects (so an empty `{}` reads as "no config" — the schema's
   * empty-object-equals-null rule).
   *
   * @param {*} raw
   * @returns {RenewalWindow|null}
   */
  static fromJSON(raw) {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const years = raw.years ?? null;
    const alignment =
      raw.alignment === 'calendar'
        ? RenewalWindowAlignment.CALENDAR
        : RenewalWindowAlignment.ROLLING;
    const rawCalendarEnd =
      typeof raw.calendar_end === 'string' ? raw.calendar_end.trim() : null;
    const calendarEnd = rawCalendarEnd ? rawCalendarEnd : null;
    const offset = ExpirationOffset.fromJSON(raw.expiration_offset);
    const empty =
      years == null &&
      calendarEnd == null &&
      offset == null &&
      alignment === RenewalWindowAlignment.ROLLING;
    if (empty) return null;
    return new RenewalWindow({
      years,
      alignment,
      calendarEnd,
      expirationOffset: offset,
    });
  }

  /**
   * Serializes to the snake-case wire shape; omits defaults so the
   * stored object stays minimal. Round-trips through fromJSON.
   */
  toJSON() {
    const out = {};
    if (this.years != null) out.years = this.years;
    out.alignment = this.alignment;
    if (this.calendarEnd != null) out.calendar_end = this.calendarEnd;
    if (this.expirationOffset != null) {
      out.expiration_offset = this.expirationOffset.toJSON();
    }
    return out;
  }
}

/** Grace gap from a renewal window's end to the credential expiration. */
class ExpirationOffset {
  constructor({ months = 0, days = 0 } = {}) {
    // Calendar months added to the window end (end-of-month clamped).
    this.months = months;
    // Days added after the month arithmetic.
    this.days = days;
    Object.freeze(this);
  }

  /**
   * Parses from a wire object; returns null for absent or all-zero
   * objects.
   *
   * @param {*} raw
   * @returns {ExpirationOffset|null}
   */
  static fromJSON(raw) {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const months = raw.months ?? 0;
    const days = raw.days ?? 0;
    if (months === 0 && days === 0) return null;
    return new ExpirationOffset({ months, days });
  }

  /** Serializes to the snake-case wire shape (see `codec.js`). */
  toJSON() {
    const out = {};
    if (this.months !== 0) out.months = this.months;
    if (this.days !== 0) out.days = this.days;
    return out;
  }

  /**
   * Applies this offset to `windowEnd`: month arithmetic first
   * (end-of-month clamped), then days.
   *
   * @param {Date} windowEnd
   * @returns {Date}
   */
  applyTo(windowEnd) {
    let r = addMonthsClamped(windowEnd, this.months);
    if (this.days !== 0) r = new Date(r.getTime() + this.days * _DAY_MS);
    return r;
  }
}

/**
 * The three resolved renewal dates for a cycle — the training
 * applicability window plus the expiration (which may fall after the
 * window end by the grace offset). Produced by
 * CertType#resolveRenewalDates. Derived, not a wire type.
 */
class RenewalDates {
  constructor({ windowStart, windowEnd, expiration }) {
    // First day training counts toward the cycle (inclusive).
    this.windowStart = windowStart;
    // Last day training counts toward the cycle (inclusive) — the
    // training cutoff.
    this.windowEnd = windowEnd;
    // When the credential lapses; == windowEnd unless a grace offset
    // pushes it later.
    this.expiration = expiration;
    Object.freeze(this);
  }
}

module.exports = {
  CertType,
  AuthoritativeCode,
  RenewalWindowAlignment,
  RenewalWindow,
  ExpirationOffset,
  RenewalDates,
  addMonthsClamped,
};
