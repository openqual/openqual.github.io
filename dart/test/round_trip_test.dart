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

import 'dart:convert';

import 'package:openqual/attachment.dart';
import 'package:openqual/cert_type.dart';
import 'package:openqual/certification.dart';
import 'package:openqual/completion_state.dart';
import 'package:openqual/enums.dart';
import 'package:openqual/organization_snapshot.dart';
import 'package:openqual/person_snapshot.dart';
import 'package:openqual/previous_renewal.dart';
import 'package:openqual/previous_renewals.dart';
import 'package:openqual/renewal_component.dart';
import 'package:openqual/renewal_component_progress.dart';
import 'package:openqual/renewal_progress.dart';
import 'package:openqual/renewal_requirement.dart';
import 'package:openqual/renewal_requirements.dart';
import 'package:openqual/signoff_policy.dart';
import 'package:openqual/signoff_record.dart';
import 'package:openqual/source.dart';
import 'package:openqual/start_and_end_times.dart';
import 'package:openqual/task_type_config.dart';
import 'package:openqual/taskbook.dart';
import 'package:openqual/taskbook_assignment.dart';
import 'package:openqual/taskbook_section.dart';
import 'package:openqual/taskbook_subtask.dart';
import 'package:openqual/taskbook_task.dart';
import 'package:openqual/training_record.dart';
import 'package:openqual/validity_period.dart';
import 'package:test/test.dart';

/// Round-trip assertion: serialize → JSON encode → decode → fromMap →
/// serialize again; both portable-JSON forms must be identical.
void expectRoundTrip(
  Map<String, dynamic> Function() toJson,
  Map<String, dynamic> Function(Map<String, dynamic>) reparse,
) {
  final first = jsonEncode(toJson());
  final reparsed =
      reparse(jsonDecode(first) as Map<String, dynamic>);
  expect(jsonEncode(reparsed), first);
}

PersonSnapshot person() => const PersonSnapshot(
      displayName: 'Alex Firefighter',
      firstName: 'Alex',
      lastName: 'Firefighter',
      email: 'alex@example.org',
      avatarUrl: 'https://example.org/a.png',
      memberships: [
        OrgMembership(
          organization: OrganizationSnapshot(
            name: 'Hondo VFD',
            source:
                Source(canonicalId: 'org1', canonicalSource: 'example'),
          ),
          roles: [OrgRoles.member, OrgRoles.officer],
        ),
      ],
      source: Source(canonicalId: 'u1', canonicalSource: 'example'),
    );

Attachment attachment() => Attachment(
      name: 'cert.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 12345,
      uploadedAt: DateTime.utc(2026, 6, 1, 12),
      uploadedBy: person(),
      content: 'aGVsbG8=',
      contentEncoding: 'base64',
      downloadUrl: 'https://example.org/cert.pdf',
      downloadUrlExpiresAt: DateTime.utc(2026, 12, 31),
    );

void main() {
  test('Taskbook round-trips (all task types, signoffs, scoring)', () {
    final book = Taskbook(
      title: 'Engine Operator Taskbook',
      description: 'Full-fixture book',
      dueDate: DateTime.utc(2027, 1, 1),
      assignment: TaskbookAssignment(
        assignee: AssignedPerson(
            person: person(), assignedAt: DateTime.utc(2026, 5, 1)),
        host: const AssignedOrganization(
            organization: OrganizationSnapshot(name: 'Hondo VFD')),
      ),
      signoffPolicy: [
        SignoffPolicy(
          id: 'p1',
          type: SignoffPolicyType.orgMembers,
          allowedRoles: const [OrgRoles.officer],
          completed: true,
          completionTimestamp: DateTime.utc(2026, 6, 2),
          signoffRecord: SignoffRecord(
            signatory: person(),
            signatoryRole: OrgRoles.officer,
            signedAt: DateTime.utc(2026, 6, 2),
            policyType: SignoffPolicyType.orgMembers,
          ),
        ),
      ],
      startAndEnd: StartAndEndTimes(
        startTime: DateTime.utc(2026, 6, 1, 9),
        endTime: DateTime.utc(2026, 6, 1, 10, 30),
        durationMs: 5400000,
      ),
      sections: [
        TaskbookSection(
          id: 's1',
          order: 0,
          title: 'Daily checks',
          scoringConfig:
              const SectionScoringConfig(minPassingPercentage: 0.7),
          tasks: [
            TaskbookTask(
              id: 't1',
              order: 0,
              title: 'Plain task',
              completion:
                  CompletionState(complete: true, completedAt: DateTime.utc(2026, 6, 1)),
              subtasks: const [
                TaskbookSubtask(id: 'st1', order: 0, title: 'Check A'),
              ],
              attachments: [attachment()],
            ),
            const TaskbookTask(
              id: 't2',
              order: 1,
              type: TaskTypes.evaluation,
              title: 'Timed pump eval',
              typeConfig: TaskTypeConfig(
                evaluationConfig: TaskTypeEvaluationConfig(
                  criteria: TaskTypeEvaluationCriteria(
                    evaluationType: EvaluationType.scored,
                    autofail: true,
                    pointsPossible: 10,
                    timeThreshold:
                        TimeThreshold(durationMs: 90000, isHard: true),
                  ),
                  result: TaskTypeEvaluationResult(
                    outcome: EvaluationOutcome.pass,
                    pointsAwarded: 9,
                    evaluatedBy: 'u2',
                  ),
                ),
              ),
            ),
            const TaskbookTask(
              id: 't3',
              order: 2,
              type: TaskTypes.inspection,
              title: 'Air-tank PSI',
              typeConfig: TaskTypeConfig(
                inspectionConfig: TaskTypeInspectionConfig(
                  criteria: TaskTypeInspectionCriteria(
                    kind: InspectionKind.measurement,
                    critical: true,
                    unit: 'PSI',
                    passMin: 4500,
                    degradedMin: 4000,
                    degradedMax: 4500,
                  ),
                  result: TaskTypeInspectionResult(
                    triage: InspectionTriage.degraded,
                    measuredValue: 4200,
                    action: InspectionAction.monitor,
                    observedBy: 'u3',
                    notes: 'Top off next shift',
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    ).computeStatus(now: DateTime.utc(2026, 7, 3));

    expectRoundTrip(
        book.toJson, (m) => Taskbook.fromMap(m).toJson());
  });

  test('Certification round-trips (renewal window, codes, progress)', () {
    final cert = Certification(
      holder: person(),
      certType: const CertType(
        name: 'Paramedic',
        level: 'NRP',
        discipline: Discipline.ems,
        authoritativeCodes: [
          AuthoritativeCode(authority: 'NREMT', code: 'NRP'),
        ],
        validityPeriod: ValidityPeriod(duration: 2, units: TimeUnit.years),
        renewalWindow: RenewalWindow(
          years: 2,
          alignment: RenewalWindowAlignment.calendar,
          calendarEnd: '12-31',
          expirationOffset: ExpirationOffset(months: 3),
        ),
        renewalRequirements: RenewalRequirements(
          requirementsVersion: '2026',
          components: [
            RenewalComponent(
              componentId: 'c1',
              order: 0,
              componentName: 'National',
              componentQuantity: 30,
              componentUnits: 'hours',
              topics: ['NREMT: Airway'],
              requirements: [
                RenewalRequirement(
                  requirementId: 'r1',
                  order: 0,
                  requirementName: 'Airway',
                  requirementQuantity: 5,
                  topics: ['NREMT: Airway'],
                ),
              ],
            ),
          ],
        ),
        certifyingAgency: OrganizationSnapshot(name: 'NREMT'),
      ),
      certificationDate: DateTime.utc(2026, 1, 15),
      expirationDate: DateTime.utc(2029, 3, 31),
      status: CertStatus.active,
      certDocument: attachment(),
      earnedViaTaskbook: EarnedViaTaskbook(
        taskbookTitle: 'Paramedic Program',
        completedAt: DateTime.utc(2026, 1, 10),
      ),
      renewalProgress: const RenewalProgress(
        requirementsVersion: '2026',
        components: [
          RenewalComponentProgress(
            componentId: 'c1',
            order: 0,
            componentName: 'National',
            componentUnits: 'hours',
            componentQuantity: 30,
            componentQuantityCompleted: 12,
            effectiveQuantityCompleted: 12,
            appliedTrainingIds: ['tr1', 'tr2'],
            manuallyAddedCredit: 2,
          ),
        ],
      ),
      previousRenewals: PreviousRenewals(previousRenewals: [
        PreviousRenewal(
          archiveDate: DateTime.utc(2024, 4, 1),
          requiredCesAtArchiving: 30,
          renewalProgressAtArchiving:
              const RenewalProgress(requirementsVersion: '2024'),
        ),
      ]),
      attachments: [attachment()],
      notes: 'Full fixture',
    );

    expectRoundTrip(
        cert.toJson, (m) => Certification.fromMap(m).toJson());
  });

  test('TrainingRecord round-trips (full Tier A shape)', () {
    final record = TrainingRecord(
      title: 'Pediatric Respiratory Distress',
      description: 'Two-topic CE lecture',
      holder: person(),
      discipline: Discipline.ems,
      trainingType: TrainingType.lecture,
      topics: const ['NREMT: Pediatric', 'NREMT: Airway'],
      startAndEnd: StartAndEndTimes(
        startTime: DateTime.utc(2026, 6, 10, 18),
        endTime: DateTime.utc(2026, 6, 10, 20),
      ),
      ceUnitsEarned: 2.0,
      trainer: person(),
      trainerCredentials: 'NREMT-P, CAPCE F5 instructor',
      location: const TrainingLocation(
        venue: 'Station 3 training tower',
        city: 'Hondo',
        region: 'TX',
        country: 'US',
      ),
      providerType: VerificationProvider.capce,
      providerId: 'CAPCE-12345',
      certDocument: attachment(),
      attachmentHistory: [attachment()],
      notes: 'Full fixture',
      source: const Source(canonicalId: 'tr1', canonicalSource: 'example'),
    );

    expectRoundTrip(
        record.toJson, (m) => TrainingRecord.fromMap(m).toJson());
  });

  test('training_type = other carries training_type_other', () {
    final record = TrainingRecord(
      title: 'Ropes refresher',
      holder: person(),
      trainingType: TrainingType.other,
      trainingTypeOther: 'peer drill',
    );
    final m = record.toJson();
    expect(m['training_type'], 'other');
    expect(m['training_type_other'], 'peer drill');
    expect(TrainingRecord.fromMap(m).trainingTypeOther, 'peer drill');
  });

  test('B1: task/section wire key is signoff_policy (no cascade flag)', () {
    final book = Taskbook(
      title: 'B',
      sections: const [
        TaskbookSection(id: 's1', order: 0, title: 'S', tasks: [
          TaskbookTask(id: 't1', order: 0, title: 'T'),
        ]),
      ],
    );
    final m = book.toJson();
    expect(m.containsKey('signoff_policy_cascades'), isFalse);
    final section = (m['sections'] as List).first as Map<String, dynamic>;
    expect(section.containsKey('signoff_policy'), isTrue);
    expect(section.containsKey('signoff_policy_override'), isFalse);
    expect(section.containsKey('signoff_policy_cascades'), isFalse);
    final task = (section['tasks'] as List).first as Map<String, dynamic>;
    expect(task.containsKey('signoff_policy'), isTrue);
    expect(task.containsKey('signoff_policy_override'), isFalse);
  });

  test('B3: out-of-range min_passing_percentage asserts', () {
    expect(() => SectionScoringConfig(minPassingPercentage: 70),
        throwsA(isA<AssertionError>()));
  });

  test('schema_version serializes as 1.0.0', () {
    expect(Taskbook(title: 'B').toJson()['schema_version'], '1.0.0');
    expect(
        TrainingRecord(title: 'T', holder: person())
            .toJson()['schema_version'],
        '1.0.0');
  });
}
