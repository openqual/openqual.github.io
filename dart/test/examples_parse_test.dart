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

/// Parses the repo's worked examples (`../examples/*.md`) against the
/// binding — the executable form of the implementer-checklist step
/// "the worked examples parse against the current shapes."
library;

import 'dart:convert';
import 'dart:io';

import 'package:openqual/certification.dart';
import 'package:openqual/taskbook.dart';
import 'package:openqual/training_record.dart';
import 'package:test/test.dart';

/// Extracts the first fenced ```json block from a markdown file.
Map<String, dynamic> exampleJson(String filename) {
  final text = File('../examples/$filename').readAsStringSync();
  final match =
      RegExp(r'```json\n(.*?)\n```', dotAll: true).firstMatch(text);
  if (match == null) {
    fail('$filename has no ```json block');
  }
  return jsonDecode(match.group(1)!) as Map<String, dynamic>;
}

void main() {
  test('certification_example.md parses and round-trips', () {
    final m = exampleJson('certification_example.md');
    final cert = Certification.fromMap(m);
    expect(cert.schemaVersion, '1.0.0');
    expect(cert.holder.displayName, isNotEmpty);
    // Re-serializing and re-parsing must be stable.
    expect(jsonEncode(Certification.fromMap(cert.toJson()).toJson()),
        jsonEncode(cert.toJson()));
  });

  test('taskbook_example.md parses and round-trips', () {
    final m = exampleJson('taskbook_example.md');
    final book = Taskbook.fromMap(m);
    expect(book.schemaVersion, '1.0.0');
    expect(book.sections, isNotEmpty);
    expect(jsonEncode(Taskbook.fromMap(book.toJson()).toJson()),
        jsonEncode(book.toJson()));
  });

  test('training_record_example.md parses and round-trips', () {
    final m = exampleJson('training_record_example.md');
    final record = TrainingRecord.fromMap(m);
    expect(record.schemaVersion, '1.0.0');
    expect(record.topics, hasLength(2));
    expect(record.providerType, isNotNull);
    expect(jsonEncode(TrainingRecord.fromMap(record.toJson()).toJson()),
        jsonEncode(record.toJson()));
  });
}
