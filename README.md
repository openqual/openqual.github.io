# OpenQual

**An open standard for documenting and exchanging qualification records — the credentials, skills, and demonstrated competencies that prove a person is ready to do the work.**

OpenQual is an open data standard of schemas, data models, and calculation tools that define how qualification data is structured and exchanged in emergency services. It covers individual credentials and certifications, and structured taskbooks and skillsheets that document a responder's competencies as they accumulate over a career.

The standard is free, open, and owned by no single vendor. Any department can adopt it. Any developer can build on it. Any system can implement it.

## Status

OpenQual **v2.0** is the current release: the portable schemas
(certifications + renewals, taskbooks with evaluation and inspection
semantics, training records, snapshots + provenance), a single
conformance level, and reference implementations in Dart and
JavaScript. v2.0 moves the taskbook `critical` flag to the task level
(one field, whatever the task type) and retires the two per-type
spellings it replaces; see [CHANGELOG.md](CHANGELOG.md). Records
written against a MAJOR stay interpretable across that MAJOR. We
welcome contributions, feedback, and discussion from anyone working in
or around emergency services qualification and credentialing.

## What this repo is

This repository hosts the project homepage at [openqual.github.io](https://openqual.github.io). For the data standard itself, see the [OpenQual GitHub organization](https://github.com/openqual).

## Get involved

- **Issues and Discussions** are the best way to engage right now
- See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
- Email us at [hello@openqual.org](mailto:hello@openqual.org)

## License

Apache 2.0 — see [LICENSE](LICENSE) for details.
