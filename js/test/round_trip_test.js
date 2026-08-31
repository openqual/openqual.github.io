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

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { Attachment, ATTACHMENT_PROVENANCE } = require('../attachment');
const {
  CertType,
  AuthoritativeCode,
  RenewalWindow,
  RenewalWindowAlignment,
  ExpirationOffset,
} = require('../cert_type');
const { Certification, EarnedViaTaskbook } = require('../certification');
const { CompletionState } = require('../completion_state');
const {
  OrgRoles,
  Discipline,
  TimeUnit,
  CertStatus,
  TaskTypes,
  EvaluationType,
  EvaluationOutcome,
  InspectionKind,
  InspectionTriage,
  InspectionAction,
  SignoffPolicyType,
  TrainingType,
  VerificationProvider,
} = require('../enums');
const { OrganizationSnapshot } = require('../organization_snapshot');
const { PersonSnapshot, OrgMembership } = require('../person_snapshot');
const { PreviousRenewal } = require('../previous_renewal');
const { PreviousRenewals } = require('../previous_renewals');
const { RenewalComponent } = require('../renewal_component');
const { RenewalComponentProgress } = require('../renewal_component_progress');
const { RenewalProgress } = require('../renewal_progress');
const { RenewalRequirement } = require('../renewal_requirement');
const { RenewalRequirements } = require('../renewal_requirements');
const { SignoffPolicy } = require('../signoff_policy');
const { SignoffRecord } = require('../signoff_record');
const { Source } = require('../source');
const { StartAndEndTimes } = require('../start_and_end_times');
const {
  TaskTypeConfig,
  TaskTypeEvaluationConfig,
  TaskTypeEvaluationCriteria,
  TimeThreshold,
  TaskTypeEvaluationResult,
  TaskTypeInspectionConfig,
  TaskTypeInspectionCriteria,
  TaskTypeInspectionResult,
} = require('../task_type_config');
const { Taskbook } = require('../taskbook');
const {
  TaskbookAssignment,
  AssignedPerson,
  AssignedOrganization,
} = require('../taskbook_assignment');
const { TaskbookSection, SectionScoringConfig } = require('../taskbook_section');
const { BookScoringConfig } = require('../taskbook_evaluation_config');
const { TaskbookSubtask } = require('../taskbook_subtask');
const { TaskbookTask } = require('../taskbook_task');
const { TrainingRecord, TrainingLocation } = require('../training_record');
const { ValidityPeriod } = require('../validity_period');

/**
 * Round-trip assertion: serialize → JSON encode → decode → fromJSON →
 * serialize again; both portable-JSON forms must be identical.
 */
function expectRoundTrip(value, reparse) {
  const first = JSON.stringify(value.toJSON());
  const reparsed = reparse(JSON.parse(first));
  assert.equal(JSON.stringify(reparsed.toJSON()), first);
}

const person = () =>
  new PersonSnapshot({
    displayName: 'Alex Firefighter',
    firstName: 'Alex',
    lastName: 'Firefighter',
    email: 'alex@example.org',
    avatarUrl: 'https://example.org/a.png',
    memberships: [
      new OrgMembership({
        organization: new OrganizationSnapshot({
          name: 'Hondo VFD',
          source: new Source({ canonicalId: 'org1', canonicalSource: 'example' }),
        }),
        roles: [OrgRoles.MEMBER, OrgRoles.OFFICER],
      }),
    ],
    source: new Source({ canonicalId: 'u1', canonicalSource: 'example' }),
  });

const attachment = () =>
  new Attachment({
    name: 'cert.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 12345,
    uploadedAt: new Date(Date.UTC(2026, 5, 1, 12)),
    uploadedBy: person(),
    content: 'aGVsbG8=',
    contentEncoding: 'base64',
    downloadUrl: 'https://example.org/cert.pdf',
    downloadUrlExpiresAt: new Date(Date.UTC(2026, 11, 31)),
    provenance: ATTACHMENT_PROVENANCE.INHERITED,
  });

test('Taskbook round-trips (all task types, signoffs, scoring)', () => {
  const book = new Taskbook({
    title: 'Engine Operator Taskbook',
    description: 'Full-fixture book',
    dueDate: new Date(Date.UTC(2027, 0, 1)),
    assignment: new TaskbookAssignment({
      assignee: new AssignedPerson({
        person: person(),
        assignedAt: new Date(Date.UTC(2026, 4, 1)),
      }),
      host: new AssignedOrganization({
        organization: new OrganizationSnapshot({ name: 'Hondo VFD' }),
      }),
    }),
    signoffPolicy: [
      new SignoffPolicy({
        id: 'p1',
        type: SignoffPolicyType.ORG_MEMBERS,
        allowedRoles: [OrgRoles.OFFICER],
        completed: true,
        completionTimestamp: new Date(Date.UTC(2026, 5, 2)),
        signoffRecord: new SignoffRecord({
          signatory: person(),
          signatoryRole: OrgRoles.OFFICER,
          signedAt: new Date(Date.UTC(2026, 5, 2)),
          policyType: SignoffPolicyType.ORG_MEMBERS,
        }),
      }),
    ],
    startAndEnd: new StartAndEndTimes({
      startTime: new Date(Date.UTC(2026, 5, 1, 9)),
      endTime: new Date(Date.UTC(2026, 5, 1, 10, 30)),
      durationMs: 5400000,
    }),
    sections: [
      new TaskbookSection({
        id: 's1',
        order: 0,
        title: 'Daily checks',
        scoringConfig: new SectionScoringConfig({ minPassingPercentage: 0.7 }),
        tasks: [
          new TaskbookTask({
            id: 't1',
            order: 0,
            title: 'Plain task',
            completion: new CompletionState({
              complete: true,
              completedAt: new Date(Date.UTC(2026, 5, 1)),
            }),
            subtasks: [
              new TaskbookSubtask({ id: 'st1', order: 0, title: 'Check A' }),
            ],
            attachments: [attachment()],
          }),
          new TaskbookTask({
            id: 't2',
            order: 1,
            type: TaskTypes.EVALUATION,
            title: 'Timed pump eval',
            typeConfig: new TaskTypeConfig({
              evaluationConfig: new TaskTypeEvaluationConfig({
                criteria: new TaskTypeEvaluationCriteria({
                  evaluationType: EvaluationType.SCORED,
                  autofail: true,
                  pointsPossible: 10,
                  timeThreshold: new TimeThreshold({
                    durationMs: 90000,
                    isHard: true,
                  }),
                }),
                result: new TaskTypeEvaluationResult({
                  outcome: EvaluationOutcome.PASS,
                  pointsAwarded: 9,
                  evaluatedBy: 'u2',
                }),
              }),
            }),
          }),
          new TaskbookTask({
            id: 't3',
            order: 2,
            type: TaskTypes.INSPECTION,
            title: 'Air-tank PSI',
            typeConfig: new TaskTypeConfig({
              inspectionConfig: new TaskTypeInspectionConfig({
                criteria: new TaskTypeInspectionCriteria({
                  kind: InspectionKind.MEASUREMENT,
                  critical: true,
                  unit: 'PSI',
                  passMin: 4500,
                  degradedMin: 4000,
                  degradedMax: 4500,
                }),
                result: new TaskTypeInspectionResult({
                  triage: InspectionTriage.DEGRADED,
                  measuredValue: 4200,
                  action: InspectionAction.MONITOR,
                  observedBy: 'u3',
                  notes: 'Top off next shift',
                }),
              }),
            }),
          }),
        ],
      }),
    ],
  }).computeStatus({ now: new Date(Date.UTC(2026, 6, 3)) });

  expectRoundTrip(book, (m) => Taskbook.fromJSON(m));
});

test('Attachment defaults missing provenance to direct', () => {
  const attachment = Attachment.fromJSON({
    name: 'photo.jpg',
    path: 'users/u1/taskbooks/book-1/book/photo.jpg',
    mime_type: 'image/jpeg',
    size_bytes: 42,
    uploaded_at: '2026-08-31T00:00:00.000Z',
  });
  assert.equal(attachment.provenance, ATTACHMENT_PROVENANCE.DIRECT);
  assert.equal(attachment.toJSON().provenance, ATTACHMENT_PROVENANCE.DIRECT);
});

test('Certification round-trips (renewal window, codes, progress)', () => {
  const cert = new Certification({
    holder: person(),
    certType: new CertType({
      name: 'Paramedic',
      level: 'NRP',
      discipline: Discipline.EMS,
      authoritativeCodes: [
        new AuthoritativeCode({ authority: 'NREMT', code: 'NRP' }),
      ],
      validityPeriod: new ValidityPeriod({ duration: 2, units: TimeUnit.YEARS }),
      renewalWindow: new RenewalWindow({
        years: 2,
        alignment: RenewalWindowAlignment.CALENDAR,
        calendarEnd: '12-31',
        expirationOffset: new ExpirationOffset({ months: 3 }),
      }),
      renewalRequirements: new RenewalRequirements({
        requirementsVersion: '2026',
        components: [
          new RenewalComponent({
            componentId: 'c1',
            order: 0,
            componentName: 'National',
            componentQuantity: 30,
            componentUnits: 'hours',
            topics: ['NREMT: Airway'],
            requirements: [
              new RenewalRequirement({
                requirementId: 'r1',
                order: 0,
                requirementName: 'Airway',
                requirementQuantity: 5,
                topics: ['NREMT: Airway'],
              }),
            ],
          }),
        ],
      }),
      certifyingAgency: new OrganizationSnapshot({ name: 'NREMT' }),
    }),
    certificationDate: new Date(Date.UTC(2026, 0, 15)),
    expirationDate: new Date(Date.UTC(2029, 2, 31)),
    status: CertStatus.ACTIVE,
    certDocument: attachment(),
    earnedViaTaskbook: new EarnedViaTaskbook({
      taskbookTitle: 'Paramedic Program',
      completedAt: new Date(Date.UTC(2026, 0, 10)),
    }),
    renewalProgress: new RenewalProgress({
      requirementsVersion: '2026',
      components: [
        new RenewalComponentProgress({
          componentId: 'c1',
          order: 0,
          componentName: 'National',
          componentUnits: 'hours',
          componentQuantity: 30,
          componentQuantityCompleted: 12,
          effectiveQuantityCompleted: 12,
          appliedTrainingIds: ['tr1', 'tr2'],
          manuallyAddedCredit: 2,
        }),
      ],
    }),
    previousRenewals: new PreviousRenewals({
      previousRenewals: [
        new PreviousRenewal({
          archiveDate: new Date(Date.UTC(2024, 3, 1)),
          requiredCesAtArchiving: 30,
          renewalProgressAtArchiving: new RenewalProgress({
            requirementsVersion: '2024',
          }),
        }),
      ],
    }),
    attachments: [attachment()],
    notes: 'Full fixture',
  });

  expectRoundTrip(cert, (m) => Certification.fromJSON(m));
});

test('TrainingRecord round-trips (full Tier A shape)', () => {
  const record = new TrainingRecord({
    title: 'Pediatric Respiratory Distress',
    description: 'Two-topic CE lecture',
    holder: person(),
    discipline: Discipline.EMS,
    trainingType: TrainingType.LECTURE,
    topics: ['NREMT: Pediatric', 'NREMT: Airway'],
    startAndEnd: new StartAndEndTimes({
      startTime: new Date(Date.UTC(2026, 5, 10, 18)),
      endTime: new Date(Date.UTC(2026, 5, 10, 20)),
    }),
    ceUnitsEarned: 2.0,
    trainer: person(),
    trainerCredentials: 'NREMT-P, CAPCE F5 instructor',
    location: new TrainingLocation({
      venue: 'Station 3 training tower',
      city: 'Hondo',
      region: 'TX',
      country: 'US',
    }),
    providerType: VerificationProvider.CAPCE,
    providerId: 'CAPCE-12345',
    certDocument: attachment(),
    attachmentHistory: [attachment()],
    notes: 'Full fixture',
    source: new Source({ canonicalId: 'tr1', canonicalSource: 'example' }),
  });

  expectRoundTrip(record, (m) => TrainingRecord.fromJSON(m));
});

test('training_type = other carries training_type_other', () => {
  const record = new TrainingRecord({
    title: 'Ropes refresher',
    holder: person(),
    trainingType: TrainingType.OTHER,
    trainingTypeOther: 'peer drill',
  });
  const m = record.toJSON();
  assert.equal(m.training_type, 'other');
  assert.equal(m.training_type_other, 'peer drill');
  assert.equal(TrainingRecord.fromJSON(m).trainingTypeOther, 'peer drill');
});

test('B1: task/section wire key is signoff_policy (no cascade flag)', () => {
  const book = new Taskbook({
    title: 'B',
    sections: [
      new TaskbookSection({
        id: 's1',
        order: 0,
        title: 'S',
        tasks: [new TaskbookTask({ id: 't1', order: 0, title: 'T' })],
      }),
    ],
  });
  const m = book.toJSON();
  assert.equal('signoff_policy' in m, true);
  assert.equal('signoff_policy_cascades' in m, false);
  const section = m.sections[0];
  assert.equal('signoff_policy' in section, true);
  assert.equal('signoff_policy_override' in section, false);
  assert.equal('signoff_policy_cascades' in section, false);
  const task = section.tasks[0];
  assert.equal('signoff_policy' in task, true);
  assert.equal('signoff_policy_override' in task, false);
});

test('B3: out-of-range min_passing_percentage throws RangeError', () => {
  assert.throws(
    () => new SectionScoringConfig({ minPassingPercentage: 70 }),
    RangeError,
  );
  assert.throws(
    () => new BookScoringConfig({ minPassingPercentage: 70 }),
    RangeError,
  );
  // In-range fractions are fine.
  assert.equal(
    new SectionScoringConfig({ minPassingPercentage: 0.7 }).minPassingPercentage,
    0.7,
  );
  assert.equal(
    new BookScoringConfig({ minPassingPercentage: 1.0 }).minPassingPercentage,
    1.0,
  );
});

test('schema_version serializes as 1.0.0', () => {
  assert.equal(new Taskbook({ title: 'B' }).toJSON().schema_version, '1.0.0');
  assert.equal(
    new TrainingRecord({ title: 'T', holder: person() }).toJSON().schema_version,
    '1.0.0',
  );
});
