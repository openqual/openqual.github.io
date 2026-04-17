# Taskbook — Worked Example

A complete, realistic `Taskbook` record showing sections, tasks,
subtasks, a populated assignment, mixed signoff policies (including an
`org_members + allowed_roles` policy and task-level `specify_users`
overrides), completed `SignoffRecord`s, a populated `TaskbookSummary`,
and provenance spanning multiple subsystems.

Scenario is a mid-progress skills verification book — the typical
messy-middle state an implementer actually has to reason about, not a
clean empty-or-complete one.

## The scenario

**Jordan Timber** is a new EMT academy graduate at Aurora Fire Rescue,
working through the department's spring 2026 EMT skills verification
taskbook. Their evaluator is **Michael Chen**, the training captain who
runs the academy's skills lab (the same instructor who signed off on
Sarah Martinez's academy book last year — see
`certification_example.md`).

Jordan started the book on April 1, 2026 and is partway through. Today
(2026-04-17):

- **Section 1 — Patient Assessment** is complete. Jordan passed both
  tasks and Michael signed off on the skills demonstration.
- **Section 2 — Airway & Ventilation** is in progress. BVM
  demonstration is done and signed, endotracheal intubation is next,
  and the oropharyngeal airway insertion subtasks are half-complete.
- **Section 3 — Cardiovascular Care** hasn't started.

The book itself requires a final officer sign-off when Jordan
completes everything — that is the book-level `org_members +
allowed_roles: [officer]` policy, not yet completed.

**Subsystem layout** (for the provenance walkthrough):

- The taskbook record lives in `aurora_fire_taskbooks`.
- People (Jordan, Michael) are in `aurora_fire_records:users`.
- Organizations (Aurora Fire itself) are in
  `aurora_fire_records:organizations`.

Different subsystems, so the person and organization snapshots carry
their own `source` values rather than inheriting from the taskbook's
source.

## The record

```json
{
  "schema_version": "0.1.0",

  "taskbook_type": "taskbook",
  "title": "Aurora Fire EMT Skills Verification — Spring 2026 Cohort",
  "description": "Hands-on skills verification required of all EMT academy graduates at Aurora Fire Rescue. Each skill is evaluated by the academy's training staff. Final book-level sign-off by an officer of the department.",
  "due_date": "2026-05-15T00:00:00Z",
  "status": "in_progress",
  "progress": 0.48,
  "completion": { "complete": false, "completed_at": null },

  "assignment": {
    "assignee": {
      "person": {
        "display_name": "Jordan Timber",
        "first_name": "Jordan",
        "last_name": "Timber",
        "email": "jordan.timber@auroragov.org",
        "source": {
          "canonical_id": "user-jtimber",
          "canonical_source": "aurora_fire_records:users"
        }
      },
      "assigned_at": "2026-04-01T15:00:00Z"
    },
    "evaluator": {
      "person": {
        "display_name": "Michael Chen",
        "first_name": "Michael",
        "last_name": "Chen",
        "suffix": "NREMT-P, I/C",
        "email": "michael.chen@auroragov.org",
        "memberships": [
          {
            "organization": {
              "name": "Aurora Fire Rescue",
              "display_name": "AFR",
              "source": {
                "canonical_id": "org-afr",
                "canonical_source": "aurora_fire_records:organizations"
              }
            },
            "roles": ["officer"]
          }
        ],
        "source": {
          "canonical_id": "user-mchen",
          "canonical_source": "aurora_fire_records:users"
        }
      },
      "assigned_at": "2026-04-01T15:00:00Z"
    },
    "host": {
      "organization": {
        "name": "Aurora Fire Rescue",
        "display_name": "AFR",
        "website": "https://www.auroragov.org/fire",
        "phone": "+1-303-326-8999",
        "source": {
          "canonical_id": "org-afr",
          "canonical_source": "aurora_fire_records:organizations"
        }
      },
      "assigned_at": "2026-04-01T15:00:00Z"
    }
  },

  "sections": [
    {
      "id": "sec-patient-assessment",
      "order": 0,
      "title": "Patient Assessment",
      "description": "Demonstrate systematic patient assessment and scene management.",
      "status": "complete",
      "progress": 1.0,
      "completion": { "complete": true, "completed_at": "2026-04-09T17:30:00Z" },
      "tasks": [
        {
          "id": "t-pa-demo",
          "order": 0,
          "type": "evaluation",
          "type_config": {
            "evaluation_config": {
              "criteria": {
                "evaluation_type": "pass_fail",
                "autofail": false
              },
              "result": {
                "outcome": "pass",
                "evaluated_by": "user-mchen",
                "evaluated_at": "2026-04-08T14:20:00Z",
                "notes": "Solid primary assessment. Identified breathing irregularity quickly. Coach on call-order for vitals next round."
              }
            }
          },
          "title": "Patient Assessment Demonstration",
          "description": "Demonstrate a full primary and secondary patient assessment on a simulated patient.",
          "status": "complete",
          "progress": 1.0,
          "completion": { "complete": true, "completed_at": "2026-04-08T14:20:00Z" },
          "subtasks": [],
          "signoff_policy_override": [
            {
              "id": "so-pa-demo",
              "type": "specify_users",
              "allowed_users": ["user-mchen"],
              "allowed_orgs": [],
              "allowed_roles": [],
              "completed": true,
              "completion_timestamp": "2026-04-08T14:25:00Z",
              "signoff_record": {
                "signatory": {
                  "display_name": "Michael Chen",
                  "first_name": "Michael",
                  "last_name": "Chen",
                  "suffix": "NREMT-P, I/C",
                  "source": {
                    "canonical_id": "user-mchen",
                    "canonical_source": "aurora_fire_records:users"
                  }
                },
                "signed_at": "2026-04-08T14:25:00Z",
                "policy_type": "specify_users"
              }
            }
          ],
          "signoffs_require_all": true,
          "attachments": [],
          "notes": null
        },
        {
          "id": "t-sa-quiz",
          "order": 1,
          "type": "evaluation",
          "type_config": {
            "evaluation_config": {
              "criteria": {
                "evaluation_type": "scored",
                "autofail": false,
                "points_possible": 100,
                "min_passing_points": 70
              },
              "result": {
                "outcome": "pass",
                "points_awarded": 94,
                "evaluated_by": "user-mchen",
                "evaluated_at": "2026-04-09T11:05:00Z",
                "notes": "Missed two items on hazmat scene indicators; review NFPA 704 placarding."
              }
            }
          },
          "title": "Scene Size-up Written Quiz",
          "description": "50-item quiz covering scene safety, mechanism of injury, and initial radio reporting.",
          "status": "complete",
          "progress": 1.0,
          "completion": { "complete": true, "completed_at": "2026-04-09T11:05:00Z" },
          "subtasks": [],
          "signoff_policy_override": [],
          "signoffs_require_all": true,
          "attachments": [],
          "notes": null
        }
      ],
      "signoff_policy_override": [],
      "signoffs_require_all": true,
      "signoff_policy_cascades": false,
      "scoring_config": {
        "min_passing_percentage": 0.7
      },
      "scoring_summary": {
        "points_possible": 100,
        "points_awarded": 94,
        "points_remaining": 0,
        "effective_threshold_points": 70,
        "effective_threshold_percentage": 0.7
      },
      "attachments": [],
      "notes": null
    },

    {
      "id": "sec-airway",
      "order": 1,
      "title": "Airway & Ventilation",
      "description": "Demonstrate airway management across multiple adjunct devices.",
      "status": "in_progress",
      "progress": 0.5,
      "completion": { "complete": false, "completed_at": null },
      "tasks": [
        {
          "id": "t-bvm-demo",
          "order": 0,
          "type": "evaluation",
          "type_config": {
            "evaluation_config": {
              "criteria": {
                "evaluation_type": "pass_fail",
                "autofail": true
              },
              "result": {
                "outcome": "pass",
                "evaluated_by": "user-mchen",
                "evaluated_at": "2026-04-15T10:12:00Z",
                "notes": "Good seal technique. Watch rate — trending a bit fast under stress."
              }
            }
          },
          "title": "Bag-Valve-Mask Ventilation",
          "description": "Demonstrate two-person BVM ventilation on a simulated apneic patient. Mask seal, rate, and tidal volume are evaluated. Autofail on loss of airway during drill.",
          "status": "complete",
          "progress": 1.0,
          "completion": { "complete": true, "completed_at": "2026-04-15T10:12:00Z" },
          "subtasks": [],
          "signoff_policy_override": [
            {
              "id": "so-bvm-demo",
              "type": "specify_users",
              "allowed_users": ["user-mchen"],
              "allowed_orgs": [],
              "allowed_roles": [],
              "completed": true,
              "completion_timestamp": "2026-04-15T10:15:00Z",
              "signoff_record": {
                "signatory": {
                  "display_name": "Michael Chen",
                  "first_name": "Michael",
                  "last_name": "Chen",
                  "suffix": "NREMT-P, I/C",
                  "source": {
                    "canonical_id": "user-mchen",
                    "canonical_source": "aurora_fire_records:users"
                  }
                },
                "signed_at": "2026-04-15T10:15:00Z",
                "policy_type": "specify_users"
              }
            }
          ],
          "signoffs_require_all": true,
          "attachments": [],
          "notes": null
        },
        {
          "id": "t-opa-insert",
          "order": 1,
          "type": "task",
          "title": "Oropharyngeal Airway Insertion",
          "description": "Walk through OPA selection, sizing, and insertion on the training manikin.",
          "status": "in_progress",
          "progress": 0.5,
          "completion": { "complete": false, "completed_at": null },
          "subtasks": [
            {
              "id": "st-opa-size",
              "order": 0,
              "title": "Select appropriately sized OPA",
              "completion": { "complete": true, "completed_at": "2026-04-16T09:40:00Z" },
              "attachments": []
            },
            {
              "id": "st-opa-measure",
              "order": 1,
              "title": "Measure OPA against patient's jaw/earlobe",
              "completion": { "complete": true, "completed_at": "2026-04-16T09:42:00Z" },
              "attachments": []
            },
            {
              "id": "st-opa-insert",
              "order": 2,
              "title": "Insert OPA using proper rotation technique",
              "completion": { "complete": false, "completed_at": null },
              "attachments": []
            },
            {
              "id": "st-opa-verify",
              "order": 3,
              "title": "Verify placement and airway patency",
              "completion": { "complete": false, "completed_at": null },
              "attachments": []
            }
          ],
          "signoff_policy_override": [],
          "signoffs_require_all": true,
          "attachments": [],
          "notes": null
        },
        {
          "id": "t-intub-demo",
          "order": 2,
          "type": "evaluation",
          "type_config": {
            "evaluation_config": {
              "criteria": {
                "evaluation_type": "pass_fail",
                "autofail": true
              },
              "result": null
            }
          },
          "title": "Endotracheal Intubation Demonstration",
          "description": "Demonstrate ET intubation on a training manikin under observation. Autofail on esophageal intubation without rapid recognition.",
          "status": "not_started",
          "progress": 0.0,
          "completion": { "complete": false, "completed_at": null },
          "subtasks": [],
          "signoff_policy_override": [
            {
              "id": "so-intub-demo",
              "type": "specify_users",
              "allowed_users": ["user-mchen"],
              "allowed_orgs": [],
              "allowed_roles": [],
              "completed": false,
              "completion_timestamp": null,
              "signoff_record": null
            }
          ],
          "signoffs_require_all": true,
          "attachments": [],
          "notes": null
        }
      ],
      "signoff_policy_override": [],
      "signoffs_require_all": true,
      "signoff_policy_cascades": false,
      "scoring_config": null,
      "scoring_summary": null,
      "attachments": [],
      "notes": null
    },

    {
      "id": "sec-cardio",
      "order": 2,
      "title": "Cardiovascular Care",
      "description": "Demonstrate AED use and basic cardiovascular emergency management.",
      "status": "not_started",
      "progress": 0.0,
      "completion": { "complete": false, "completed_at": null },
      "tasks": [
        {
          "id": "t-aed-competency",
          "order": 0,
          "type": "evaluation",
          "type_config": {
            "evaluation_config": {
              "criteria": {
                "evaluation_type": "pass_fail",
                "autofail": false
              },
              "result": null
            }
          },
          "title": "AED Competency Demonstration",
          "description": "Demonstrate appropriate AED deployment and use during simulated cardiac arrest.",
          "status": "not_started",
          "progress": 0.0,
          "completion": { "complete": false, "completed_at": null },
          "subtasks": [],
          "signoff_policy_override": [],
          "signoffs_require_all": true,
          "attachments": [],
          "notes": null
        },
        {
          "id": "t-bls-cert-check",
          "order": 1,
          "type": "cert",
          "type_config": {
            "cert_config": {
              "display_name": "AHA Basic Life Support",
              "source": {
                "canonical_id": "ct-aha-bls",
                "canonical_source": "colorado_ems_catalog:cert_types"
              },
              "require_active": true
            }
          },
          "title": "Current BLS Certification on File",
          "description": "Holder MUST have a currently-valid BLS certification recorded in the department's credentialing system.",
          "status": "not_started",
          "progress": 0.0,
          "completion": { "complete": false, "completed_at": null },
          "subtasks": [],
          "signoff_policy_override": [],
          "signoffs_require_all": true,
          "attachments": [],
          "notes": null
        }
      ],
      "signoff_policy_override": [],
      "signoffs_require_all": true,
      "signoff_policy_cascades": false,
      "scoring_config": null,
      "scoring_summary": null,
      "attachments": [],
      "notes": null
    }
  ],

  "signoff_policy": [
    {
      "id": "so-book-officer",
      "type": "org_members",
      "allowed_users": [],
      "allowed_orgs": [
        {
          "name": "Aurora Fire Rescue",
          "display_name": "AFR",
          "source": {
            "canonical_id": "org-afr",
            "canonical_source": "aurora_fire_records:organizations"
          }
        }
      ],
      "allowed_roles": ["officer"],
      "completed": false,
      "completion_timestamp": null,
      "signoff_record": null
    }
  ],
  "signoffs_require_all": true,
  "signoff_policy_cascades": false,

  "attachments": [
    {
      "name": "afr-emt-skills-checklist-2026.pdf",
      "path": "afr-blob:taskbooks/spring-2026/checklist",
      "mime_type": "application/pdf",
      "size_bytes": 142890,
      "uploaded_at": "2026-04-01T15:00:00Z"
    }
  ],
  "notes": "Spring 2026 academy cohort. Same checklist used since 2023; see department training SOP 2.4.",

  "evaluation_config": {
    "scoring_mode": "per_section",
    "scoring_config": null
  },

  "start_and_end": {
    "start_time": "2026-04-01T15:00:00Z",
    "end_time": null,
    "duration_ms": null,
    "duration_display": null
  },

  "taskbook_summary": {
    "tasks_total": 7,
    "tasks_not_started": 3,
    "tasks_in_progress": 1,
    "tasks_owner_action_needed": 0,
    "tasks_pending_validation": 0,
    "tasks_complete": 3,
    "tasks_complete_failed": 0,

    "sections_total": 3,
    "sections_not_started": 1,
    "sections_in_progress": 1,
    "sections_owner_action_needed": 0,
    "sections_pending_validation": 0,
    "sections_complete": 1,
    "sections_complete_failed": 0,

    "taskbook_owner_action_needed": false,
    "signoffs_required_total": 5,
    "signoffs_completed_total": 2,

    "scoring_summary": {
      "points_possible": 100,
      "points_awarded": 94,
      "points_remaining": 0,
      "effective_threshold_points": null,
      "effective_threshold_percentage": null
    },

    "last_modified": "2026-04-16T09:42:00Z"
  },

  "import_status": null,
  "import_notes": null,

  "source": {
    "canonical_id": "tb-afr-emt-2026-spring-jtimber",
    "canonical_source": "aurora_fire_taskbooks"
  }
}
```

## Walkthrough

### Schema version

Same pattern as `Certification`. Taskbook is a top-level portable
record, so `schema_version` is required. `"0.1.0"`.

### Assignment — three slots, one pattern

`TaskbookAssignment` fills three slots:

- `assignee` → `AssignedPerson` → wraps `PersonSnapshot(Jordan)` +
  `assigned_at`
- `evaluator` → `AssignedPerson` → wraps `PersonSnapshot(Michael)` +
  `assigned_at`
- `host` → `AssignedOrganization` → wraps `OrganizationSnapshot(AFR)` +
  `assigned_at`

The role comes from the slot name on the parent; the struct shape is
the same `AssignedPerson` / `AssignedOrganization` wrapper the standard
uses everywhere. Notice also that `evaluator.person.memberships`
carries an `OrgMembership` for Michael — he's an officer of Aurora
Fire Rescue. That's the same bounded-snapshot capture used on any
`PersonSnapshot` (see `person_snapshot.md`). It's load-bearing here:
the book's officer sign-off policy (below) evaluates eligibility
against exactly these memberships.

### Signoff policies at three levels

Three distinct signoff patterns appear in this book:

1. **Book-level `org_members` policy** (`so-book-officer`). The final
   sign-off must come from an officer of Aurora Fire Rescue. The
   policy carries a single `OrganizationSnapshot` in `allowed_orgs`
   and `["officer"]` in `allowed_roles`. When Jordan eventually
   finishes the book, any officer of AFR can sign using
   `SignoffPolicy.isEligibleFor` — that method matches on full
   `canonical_id + canonical_source` equality between the policy's
   `allowed_orgs` and the signer's memberships.
2. **Task-level `specify_users` overrides** (tasks `t-pa-demo`,
   `t-bvm-demo`, `t-intub-demo`). Each of these names Michael's
   `canonical_id` directly — only he can sign these specific skills
   demonstrations. This is tighter than org-level: a different
   officer who wasn't the evaluator cannot sign Jordan's skills.
3. **No policy at all** on plain tasks and on the scored quiz — those
   are gated by completion and outcome alone.

`signoff_policy_cascades = false` at every level means the book's
officer policy stays book-level; it doesn't propagate to sections
or tasks without explicit override.

### Completed signoffs and `SignoffRecord`

Two task-level signoffs are complete, with `SignoffRecord` values
frozen at signing time:

- `t-pa-demo` signed at `2026-04-08T14:25:00Z`
- `t-bvm-demo` signed at `2026-04-15T10:15:00Z`

In both records:

- `signatory` is a `PersonSnapshot` of Michael captured at the moment
  of signing — per the snapshot contract, this value is frozen and
  MUST NOT be updated if Michael's display name or email changes
  later.
- `signed_at` equals the policy's `completion_timestamp` (signing
  contract invariant from `signoff_policy.md`).
- `policy_type` is `"specify_users"` — matches the policy's `type` at
  signing time.

The pending task signoff on `t-intub-demo` shows the opposite shape:
`completed: false`, `completion_timestamp: null`, `signoff_record:
null`.

### Evaluation tasks: pass/fail and scored

Four tasks are evaluation-typed:

- **`t-pa-demo`** (pass/fail, autofail off) — `result.outcome = "pass"`
  with evaluator notes.
- **`t-sa-quiz`** (scored, 100 points possible) —
  `result.outcome = "pass"` with `points_awarded = 94`. Section 1's
  `scoring_config.min_passing_percentage = 0.7`, so 94/100 comfortably
  clears the section-level threshold.
- **`t-bvm-demo`** (pass/fail, **autofail on**) — `result.outcome =
  "pass"`. Had this failed, `autofail = true` would have propagated
  `complete_failed` up to the section, and in turn to the book's
  status waterfall (see `TaskbookSection.computeStatus` → Autofail
  propagation).
- **`t-intub-demo`** (pass/fail, autofail on) — `result: null`. Not
  yet performed.

`t-bls-cert-check` is a fifth evaluation-*shaped* task but with
`type = cert` — it's a credential check rather than a hands-on
demonstration. Jordan hasn't presented his BLS card yet, so the task
is `not_started`.

### Subtasks and progress rollup

`t-opa-insert` has four subtasks modeling the physical steps. Two are
complete (`selected` and `measured`), two are not (`inserted` and
`verified`). `TaskbookTask.computeProgress` returns
`completed_subtasks / total_subtasks = 2/4 = 0.5`, and because the
task is not yet complete, `status = in_progress`.

That partial-progress task, combined with `t-bvm-demo` complete and
`t-intub-demo` not started, gives section 2 its mix of statuses.

### Book-level status waterfall

Running `Taskbook.computeStatus` on this data:

- **Autofail propagation** — no task has
  `status = complete_failed` with `autofail = true`. Skip.
- **Cannot pass / did not pass** — `scoring_mode = per_section`, so
  the book's aggregated threshold branches don't fire. Skip.
- **Per-section failure propagation** — no section has
  `status = complete_failed`. Skip.
- **Complete** — `completion.complete = false`, so not complete.
- **Pending validation** — not applicable.
- **Owner action needed** — not all sections are `complete` (only
  section 1 is). Skip.
- **In progress** — section 2 has progressed beyond `not_started` and
  section 1 has completed work. ✓

→ `status = in_progress`.

### `TaskbookSummary` recomputation

The summary is a pure function of the computed tree. Every value
shown in the `taskbook_summary` block above can be re-derived from
the sections:

- **Task status histogram**: 3 complete + 1 in_progress + 3 not_started
  = 7 total. Matches `tasks_total: 7`.
- **Section status histogram**: 1 complete + 1 in_progress + 1
  not_started = 3 total.
- **Signoff totals**: 1 book-level policy + 0 section-level + 4
  task-level = 5 `signoffs_required_total`. Two of those have
  `completed = true`, so `signoffs_completed_total = 2`.
- **Scoring**: only section 1 has scored evaluations. Book-level
  `scoring_summary` rolls up `points_possible = 100`, `points_awarded
  = 94`, `points_remaining = 0`. Because `scoring_mode =
  per_section`, the book-level threshold fields are `null` (no
  aggregated threshold applies at the book level — sections handle
  their own).

`taskbook_owner_action_needed: false` matches the computed book
`status` (which is `in_progress`, not `owner_action_needed`).

### Provenance — multiple subsystems in one record

The record touches four distinct catalog sources:

| Value | canonical_source |
|---|---|
| Taskbook record itself | `aurora_fire_taskbooks` |
| People (Jordan, Michael) | `aurora_fire_records:users` |
| Organization (Aurora Fire) | `aurora_fire_records:organizations` |
| BLS cert-type reference | `colorado_ems_catalog:cert_types` |

All three non-taskbook sources are *different* from the parent
taskbook's source, so each PersonSnapshot and OrganizationSnapshot
carries its own `source` rather than inheriting. This is the
pedagogically interesting mirror-image of the certification example
— there, holder and instructor inherited because they shared a
source with the parent cert; here, they don't.

The BLS cert-type reference on `t-bls-cert-check` shows the
snapshot+Source pattern applied to reference configs (see
`task_type_config.md` → `TaskTypeCertConfig`). A receiver who wants
to verify Jordan actually holds a current BLS can combine
`display_name` (frozen label) with `source` (lookup pointer into
the Colorado EMS catalog).

## What this example demonstrates

Quick reference — this example exercises:

- `schema_version` on a top-level portable record
- `TaskbookAssignment` with all three slots filled, showing the
  `AssignedPerson` / `AssignedOrganization` wrapper pattern and the
  `assigned_at` timestamp
- `PersonSnapshot.memberships` populated with an `OrgMembership` that
  the book's officer-sign-off policy matches against
- Three signoff-policy shapes in one record: `org_members +
  allowed_roles` at book level, `specify_users` at task level,
  no-policy on plain tasks
- Completed `SignoffRecord` with full `PersonSnapshot(signatory)`,
  `signed_at = completion_timestamp`, and `policy_type` — per the
  signing-contract invariants in `signoff_policy.md`
- Pending (unsigned) policy showing `completed: false` +
  `signoff_record: null` — the opposite shape
- Evaluation tasks across all four variations: pass/fail passed,
  pass/fail with autofail, scored with points, and unevaluated
  (result null)
- Plain task with subtasks at mid-progress (`t-opa-insert`, 2 of 4
  subtasks complete) demonstrating the progress rollup
- `TaskTypeCertConfig` reference to a cert type in a different
  catalog
- Section-level `scoring_config` with `min_passing_percentage = 0.7`
  and its corresponding `scoring_summary`
- Book-level `evaluation_config.scoring_mode = per_section`, showing
  the summary rollup without book-level thresholds
- Fully computed `TaskbookSummary` whose every value can be derived
  from the tree
- Provenance spanning four distinct subsystems in one record —
  taskbook, users, organizations, and an external cert-type catalog —
  with explicit `source` on every nested snapshot that differs from
  the parent

Between this example and `certification_example.md`, the v0.1 surface
of the standard has been exercised end-to-end by a standards-compliant
implementer.
