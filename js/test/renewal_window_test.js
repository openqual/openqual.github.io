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

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const {
  CertType,
  RenewalWindow,
  RenewalWindowAlignment,
  ExpirationOffset,
  addMonthsClamped,
} = require('../cert_type');
const { Discipline, TimeUnit } = require('../enums');
const { ValidityPeriod } = require('../validity_period');

const utc = (y, m, d) => new Date(Date.UTC(y, m - 1, d));

function certWith({ window = null, validity = null } = {}) {
  return new CertType({
    name: 'NREMT-P',
    discipline: Discipline.EMS,
    validityPeriod: validity,
    renewalWindow: window,
  });
}

describe('NREMT validation fixture (schemas/cert_type.md)', () => {
  // {years: 2, alignment: calendar, calendar_end: "12-31",
  //  expiration_offset: {months: 3}}
  const nremt = new RenewalWindow({
    years: 2,
    alignment: RenewalWindowAlignment.CALENDAR,
    calendarEnd: '12-31',
    expirationOffset: new ExpirationOffset({ months: 3 }),
  });

  test('anchor in 2027 ⇒ window 2027-01-01…2028-12-31, exp 2029-03-31', () => {
    const dates = certWith({ window: nremt }).resolveRenewalDates({
      anchor: utc(2027, 6, 15),
    });
    assert.deepEqual(dates.windowStart, utc(2027, 1, 1));
    assert.deepEqual(dates.windowEnd, utc(2028, 12, 31));
    assert.deepEqual(dates.expiration, utc(2029, 3, 31));
  });

  test('round-trips through the wire shape', () => {
    const m = nremt.toJSON();
    assert.deepEqual(m, {
      years: 2,
      alignment: 'calendar',
      calendar_end: '12-31',
      expiration_offset: { months: 3 },
    });
    const parsed = RenewalWindow.fromJSON(m);
    assert.equal(parsed.years, 2);
    assert.equal(parsed.alignment, RenewalWindowAlignment.CALENDAR);
    assert.equal(parsed.calendarEnd, '12-31');
    assert.equal(parsed.expirationOffset.months, 3);
    assert.equal(parsed.expirationOffset.days, 0);
  });
});

describe('rolling alignment', () => {
  test('window rolls from the anchor for `years`', () => {
    const rolling = new RenewalWindow({ years: 2 });
    const dates = certWith({ window: rolling }).resolveRenewalDates({
      anchor: utc(2027, 6, 15),
    });
    assert.deepEqual(dates.windowStart, utc(2027, 6, 15));
    assert.deepEqual(dates.windowEnd, utc(2029, 6, 15));
    assert.deepEqual(dates.expiration, utc(2029, 6, 15));
  });

  test('null window falls back to validity_period', () => {
    const dates = certWith({
      validity: new ValidityPeriod({ duration: 3, units: TimeUnit.YEARS }),
    }).resolveRenewalDates({ anchor: utc(2027, 6, 15) });
    assert.deepEqual(dates.windowEnd, utc(2030, 6, 15));
    assert.deepEqual(dates.expiration, dates.windowEnd);
  });

  test('null window and no validity_period defaults to 24 months', () => {
    const dates = certWith().resolveRenewalDates({ anchor: utc(2027, 6, 15) });
    assert.deepEqual(dates.windowEnd, utc(2029, 6, 15));
  });

  test('offset applies after the rolling window end', () => {
    const w = new RenewalWindow({
      years: 1,
      expirationOffset: new ExpirationOffset({ months: 1, days: 5 }),
    });
    const dates = certWith({ window: w }).resolveRenewalDates({
      anchor: utc(2027, 1, 10),
    });
    assert.deepEqual(dates.windowEnd, utc(2028, 1, 10));
    assert.deepEqual(dates.expiration, utc(2028, 2, 15));
  });
});

describe('empty-map-reads-null rule', () => {
  test('null, non-object, and empty object all read as null', () => {
    assert.equal(RenewalWindow.fromJSON(null), null);
    assert.equal(RenewalWindow.fromJSON(undefined), null);
    assert.equal(RenewalWindow.fromJSON('x'), null);
    assert.equal(RenewalWindow.fromJSON({}), null);
    assert.equal(RenewalWindow.fromJSON({ alignment: 'rolling' }), null);
  });

  test('any meaningful field makes it non-null', () => {
    assert.notEqual(RenewalWindow.fromJSON({ years: 2 }), null);
    assert.notEqual(RenewalWindow.fromJSON({ alignment: 'calendar' }), null);
    assert.notEqual(
      RenewalWindow.fromJSON({ expiration_offset: { months: 3 } }),
      null,
    );
  });
});

test('addMonthsClamped clamps end-of-month', () => {
  assert.deepEqual(addMonthsClamped(utc(2027, 1, 31), 1), utc(2027, 2, 28));
  assert.deepEqual(addMonthsClamped(utc(2028, 1, 31), 1), utc(2028, 2, 29));
  assert.deepEqual(addMonthsClamped(utc(2027, 3, 31), 1), utc(2027, 4, 30));
});
