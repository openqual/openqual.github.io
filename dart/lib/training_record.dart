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

import 'attachment.dart';
import 'codec.dart';
import 'constants.dart';
import 'enums.dart';
import 'person_snapshot.dart';
import 'source.dart';
import 'start_and_end_times.dart';
import 'wire.dart';

/// A portable record of a training event a person completed — the
/// evidence unit that feeds certification renewal. Sits alongside
/// `Certification` as a root-exchangeable type. See
/// schemas/training_record.md.
///
/// This is the "Tier A" shape: a complete, standalone, round-trippable
/// record with no dependency on any taxonomy catalog. Rosters,
/// enrollment lifecycles, and delivery pipelines are host-application
/// concerns and are deliberately not modeled here.
class TrainingRecord {
  final String schemaVersion;

  /// Display name of the training, e.g. "Pediatric Respiratory
  /// Distress".
  final String title;

  final String? description;

  /// Frozen identity of the person who completed the training.
  final PersonSnapshot holder;

  /// Primary discipline area — the same axis `CertType.discipline`
  /// uses, so training ↔ cert matching needs no new vocabulary.
  final Discipline? discipline;

  /// Required when [discipline] is [Discipline.other].
  final String? disciplineOther;

  /// Delivery modality (lecture, skills, clinical, …). Optional —
  /// many legacy records won't know.
  final TrainingType? trainingType;

  /// Required when [trainingType] is [TrainingType.other].
  final String? trainingTypeOther;

  /// Subject-matter topics this training covered, as
  /// authority-namespaced strings (see "Topic strings" in
  /// schemas/renewal_component.md). May be empty.
  final List<String> topics;

  /// When the training happened; carries the derived duration.
  final StartAndEndTimes? startAndEnd;

  /// Continuing-education credit this training carries, in the units
  /// convention of the crediting authority (typically hours). The
  /// user-entered / issuer-stated value.
  final double? ceUnitsEarned;

  /// Frozen identity of the trainer / instructor.
  final PersonSnapshot? trainer;

  /// Free-form statement of the trainer's qualifications as presented,
  /// e.g. "NREMT-P, CAPCE F5 instructor".
  final String? trainerCredentials;

  final TrainingLocation? location;

  /// Trust classification of the record's origin. Receivers MUST NOT
  /// upgrade this on records from another producer.
  final VerificationProvider? providerType;

  /// External registrar / provider identifier when [providerType]
  /// warrants one (e.g. a CAPCE course number).
  final String? providerId;

  /// The digitized certificate of completion — same first-class role
  /// `Certification.cert_document` plays.
  final Attachment? certDocument;

  /// Supplementary evidence. May be empty.
  final List<Attachment> attachments;

  /// Prior versions of [certDocument] that were replaced, oldest →
  /// newest. May be empty.
  final List<Attachment> attachmentHistory;

  final String? notes;
  final Source? source;

  const TrainingRecord({
    this.schemaVersion = openqualSchemaVersion,
    required this.title,
    this.description,
    required this.holder,
    this.discipline,
    this.disciplineOther,
    this.trainingType,
    this.trainingTypeOther,
    this.topics = const [],
    this.startAndEnd,
    this.ceUnitsEarned,
    this.trainer,
    this.trainerCredentials,
    this.location,
    this.providerType,
    this.providerId,
    this.certDocument,
    this.attachments = const [],
    this.attachmentHistory = const [],
    this.notes,
    this.source,
  });

  /// Reads the wire shape produced by [toMap].
  factory TrainingRecord.fromMap(Map<String, dynamic> m) => TrainingRecord(
        schemaVersion:
            (m['schema_version'] as String?) ?? openqualSchemaVersion,
        title: m['title'] as String,
        description: m['description'] as String?,
        holder: PersonSnapshot.fromMap(
            (m['holder'] as Map).cast<String, dynamic>()),
        discipline: m['discipline'] == null
            ? null
            : disciplineFromWire(m['discipline'] as String),
        disciplineOther: m['discipline_other'] as String?,
        trainingType: m['training_type'] == null
            ? null
            : trainingTypeFromWire(m['training_type'] as String),
        trainingTypeOther: m['training_type_other'] as String?,
        topics: readStringList(m['topics']),
        startAndEnd: m['start_and_end'] == null
            ? null
            : StartAndEndTimes.fromMap(
                (m['start_and_end'] as Map).cast<String, dynamic>()),
        ceUnitsEarned: (m['ce_units_earned'] as num?)?.toDouble(),
        trainer: m['trainer'] == null
            ? null
            : PersonSnapshot.fromMap(
                (m['trainer'] as Map).cast<String, dynamic>()),
        trainerCredentials: m['trainer_credentials'] as String?,
        location: m['location'] == null
            ? null
            : TrainingLocation.fromMap(
                (m['location'] as Map).cast<String, dynamic>()),
        providerType: m['provider_type'] == null
            ? null
            : verificationProviderFromWire(m['provider_type'] as String),
        providerId: m['provider_id'] as String?,
        certDocument: m['cert_document'] == null
            ? null
            : Attachment.fromMap(
                (m['cert_document'] as Map).cast<String, dynamic>()),
        attachments:
            readMapList(m['attachments']).map(Attachment.fromMap).toList(),
        attachmentHistory: readMapList(m['attachment_history'])
            .map(Attachment.fromMap)
            .toList(),
        notes: m['notes'] as String?,
        source: m['source'] == null
            ? null
            : Source.fromMap((m['source'] as Map).cast<String, dynamic>()),
      );

  /// Serializes to the snake-case wire shape with raw [DateTime]
  /// values (see `codec.dart`). Use [toJson] for portable JSON.
  Map<String, dynamic> toMap() => {
        'schema_version': schemaVersion,
        'title': title,
        if (description != null) 'description': description,
        'holder': holder.toMap(),
        if (discipline != null) 'discipline': wireValue(discipline!),
        if (disciplineOther != null) 'discipline_other': disciplineOther,
        if (trainingType != null) 'training_type': wireValue(trainingType!),
        if (trainingTypeOther != null)
          'training_type_other': trainingTypeOther,
        'topics': topics,
        if (startAndEnd != null) 'start_and_end': startAndEnd!.toMap(),
        if (ceUnitsEarned != null) 'ce_units_earned': ceUnitsEarned,
        if (trainer != null) 'trainer': trainer!.toMap(),
        if (trainerCredentials != null)
          'trainer_credentials': trainerCredentials,
        if (location != null) 'location': location!.toMap(),
        if (providerType != null) 'provider_type': wireValue(providerType!),
        if (providerId != null) 'provider_id': providerId,
        if (certDocument != null) 'cert_document': certDocument!.toMap(),
        'attachments': attachments.map((a) => a.toMap()).toList(),
        'attachment_history':
            attachmentHistory.map((a) => a.toMap()).toList(),
        if (notes != null) 'notes': notes,
        if (source != null) 'source': source!.toMap(),
      };

  /// Portable JSON form: [toMap] with every [DateTime] converted to
  /// ISO-8601 UTC strings.
  Map<String, dynamic> toJson() => datesToIso(toMap());
}

/// Where a training happened.
class TrainingLocation {
  /// Facility / venue name, e.g. "Station 3 training tower".
  final String? venue;

  final String? city;

  /// State / province / region.
  final String? region;

  final String? postalCode;

  /// ISO 3166-1 alpha-2 code recommended when known.
  final String? country;

  const TrainingLocation({
    this.venue,
    this.city,
    this.region,
    this.postalCode,
    this.country,
  });

  /// Reads the wire shape produced by [toMap].
  factory TrainingLocation.fromMap(Map<String, dynamic> m) =>
      TrainingLocation(
        venue: m['venue'] as String?,
        city: m['city'] as String?,
        region: m['region'] as String?,
        postalCode: m['postal_code'] as String?,
        country: m['country'] as String?,
      );

  /// Serializes to the snake-case wire shape (see `codec.dart`).
  Map<String, dynamic> toMap() => {
        if (venue != null) 'venue': venue,
        if (city != null) 'city': city,
        if (region != null) 'region': region,
        if (postalCode != null) 'postal_code': postalCode,
        if (country != null) 'country': country,
      };
}
