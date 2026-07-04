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

import 'package:openqual/cert_type.dart';
import 'package:openqual/enums.dart';
import 'package:openqual/validity_period.dart';
import 'package:test/test.dart';

void main() {
  CertType certWith({RenewalWindow? window, ValidityPeriod? validity}) =>
      CertType(
        name: 'NREMT-P',
        discipline: Discipline.ems,
        validityPeriod: validity,
        renewalWindow: window,
      );

  group('NREMT validation fixture (schemas/cert_type.md)', () {
    // {years: 2, alignment: calendar, calendar_end: "12-31",
    //  expiration_offset: {months: 3}}
    const nremt = RenewalWindow(
      years: 2,
      alignment: RenewalWindowAlignment.calendar,
      calendarEnd: '12-31',
      expirationOffset: ExpirationOffset(months: 3),
    );

    test('anchor in 2027 ⇒ window 2027-01-01…2028-12-31, exp 2029-03-31',
        () {
      final dates = certWith(window: nremt)
          .resolveRenewalDates(anchor: DateTime(2027, 6, 15));
      expect(dates.windowStart, DateTime(2027, 1, 1));
      expect(dates.windowEnd, DateTime(2028, 12, 31));
      expect(dates.expiration, DateTime(2029, 3, 31));
    });

    test('round-trips through the wire shape', () {
      final map = nremt.toMap();
      expect(map, {
        'years': 2,
        'alignment': 'calendar',
        'calendar_end': '12-31',
        'expiration_offset': {'months': 3},
      });
      final parsed = RenewalWindow.fromMap(map)!;
      expect(parsed.years, 2);
      expect(parsed.alignment, RenewalWindowAlignment.calendar);
      expect(parsed.calendarEnd, '12-31');
      expect(parsed.expirationOffset!.months, 3);
      expect(parsed.expirationOffset!.days, 0);
    });
  });

  group('rolling alignment', () {
    test('window rolls from the anchor for `years`', () {
      const rolling = RenewalWindow(years: 2);
      final dates = certWith(window: rolling)
          .resolveRenewalDates(anchor: DateTime(2027, 6, 15));
      expect(dates.windowStart, DateTime(2027, 6, 15));
      expect(dates.windowEnd, DateTime(2029, 6, 15));
      expect(dates.expiration, DateTime(2029, 6, 15));
    });

    test('null window falls back to validity_period', () {
      final dates = certWith(
        validity: const ValidityPeriod(duration: 3, units: TimeUnit.years),
      ).resolveRenewalDates(anchor: DateTime(2027, 6, 15));
      expect(dates.windowEnd, DateTime(2030, 6, 15));
      expect(dates.expiration, dates.windowEnd);
    });

    test('offset applies after the rolling window end', () {
      const w = RenewalWindow(
        years: 1,
        expirationOffset: ExpirationOffset(months: 1, days: 5),
      );
      final dates = certWith(window: w)
          .resolveRenewalDates(anchor: DateTime(2027, 1, 10));
      expect(dates.windowEnd, DateTime(2028, 1, 10));
      expect(dates.expiration, DateTime(2028, 2, 15));
    });
  });

  group('empty-map-reads-null rule', () {
    test('null, non-map, and empty map all read as null', () {
      expect(RenewalWindow.fromMap(null), isNull);
      expect(RenewalWindow.fromMap('x'), isNull);
      expect(RenewalWindow.fromMap(const <String, dynamic>{}), isNull);
      expect(
        RenewalWindow.fromMap(const {'alignment': 'rolling'}),
        isNull,
      );
    });

    test('any meaningful field makes it non-null', () {
      expect(RenewalWindow.fromMap(const {'years': 2}), isNotNull);
      expect(
          RenewalWindow.fromMap(const {'alignment': 'calendar'}), isNotNull);
      expect(
        RenewalWindow.fromMap(const {
          'expiration_offset': {'months': 3}
        }),
        isNotNull,
      );
    });
  });

  test('addMonthsClamped clamps end-of-month', () {
    expect(addMonthsClamped(DateTime(2027, 1, 31), 1), DateTime(2027, 2, 28));
    expect(addMonthsClamped(DateTime(2028, 1, 31), 1), DateTime(2028, 2, 29));
    expect(addMonthsClamped(DateTime(2027, 3, 31), 1), DateTime(2027, 4, 30));
  });
}
