# Roadmap Next (M14-M18)

Updated: 2026-03-10

## Objective

Move post-`M13` work from "feature present" to "production-defensible":
- close remaining mocked or partially mocked forensic capabilities,
- make triage outputs verifiable against deterministic fixture corpora,
- remove governance drift still documented in `C1` / `C2`,
- improve evidence packaging and provenance for operational use.

## M14: Archive Evidence Safety and Inventory

Goal: make archive handling defensible for real incident-response workflows.
Status: `DONE`

Scope:
1. enforce `zip-slip` path normalization and reject unsafe extraction targets,
2. enforce bounded unzip policy (`maxExpandedBytes`, entry-count, recursion, compression ratio),
3. emit deterministic archive inventory in triage output (entries, sizes, hashes, encrypted flag),
4. remove `zip_slip_and_zip_bomb_safe_unpack_guards` from `mockedCapabilities` only when guards are truly active.

Delivered:
1. local ZIP header inspection in `forensic.basicTriage` with deterministic inventory output,
2. path traversal detection and bounded expansion/entry/compression-ratio guards,
3. ZIP adapter payload now receives archive manifest + guard summary,
4. mocked capability removal is now tied to locally enforced guard success, not remote adapter success.

GitHub issues:
- `#40` `archive-safe-unpack-guards`
- `#35` `archive-inventory-manifest`

## M15: Trust and Signature Verification

Goal: add artifact trust signals before verdict/export layers consume binaries.
Status: `DONE`

Scope:
1. implement Authenticode / X.509 verification baseline for PE-focused triage,
2. expose deterministic trust summary (`signed`, `chainStatus`, `subject`, `issuer`, `timestamp`),
3. remove `authenticode_or_x509_verification` from `mockedCapabilities` only on verified support paths,
4. add negative tests for malformed signatures, detached data, and unsupported formats.

Delivered:
1. PE `WIN_CERTIFICATE` table parsing in `forensic.basicPreTriage`,
2. deterministic embedded X.509 trust summary (`subject`, `issuer`, `serialNumber`, validity window, self-issued flag),
3. support for direct DER certificate blobs and X.509 certificates embedded inside PKCS#7 / Authenticode containers,
4. `forensic.basicTriage` findings/recommendations now consume trust status and clear `authenticode_or_x509_verification` when the PE trust path is analyzed.

GitHub issues:
- `#41` `authenticode-x509-verification`

## M16: Deterministic Triage Corpus and Regression Contracts

Goal: make triage regressions visible through stable sample corpora and expected reports.
Status: `PLANNED`

Scope:
1. add known-good benign/suspicious/malicious fixture corpus with deterministic sanitization,
2. add golden tests for `basicPreTriage` and `basicTriage` on representative samples,
3. extend report-contract coverage for integrations, trust signals, archive inventory, and recommendations,
4. document corpus provenance and redaction policy.

Backlog issues:
- `triage-golden-corpus`
- `triage-contract-regression-expansion`

## M17: C1/C2 Governance Closure

Goal: eliminate remaining plan/governance drift from the C-track.
Status: `PLANNED`

Scope:
1. add periodic workflow and documentation for `misc-uncategorized` reclassification in `C1`,
2. add `C2` parity-plan drift gate so execution board and implementation plan cannot diverge silently,
3. refresh master-plan status fields so `C2` baseline/closure states reflect merged reality,
4. add issue-to-roadmap traceability table for active milestones.

Backlog issues:
- `c1-reclassification-workflow`
- `c2-plan-drift-gate`

## M18: Evidence Packaging and Provenance

Goal: make triage/export outputs easier to hand off, replay, and audit.
Status: `PLANNED`

Scope:
1. add reproducibility/evidence bundle export for triage runs,
2. capture provenance for derived indicators and adapter submissions,
3. add CLI-facing export path for bundle capture,
4. document operational handoff and rollback/update procedures for the new bundle format.

Backlog issues:
- `triage-evidence-bundle`
- `triage-provenance-export`

## Delivery order

1. `M14` first, because archive safety is prerequisite to trustworthy triage on packed evidence.
2. `M15` second, because trust signals affect scoring and handoff quality.
3. `M16` third, because golden fixtures should lock behavior after archive/trust changes land.
4. `M17` fourth, because governance should reflect the newly stabilized implementation surface.
5. `M18` fifth, because packaging/provenance is most useful once upstream signals are stable.

## Progress Snapshot

- `M14` `[DONE]`: archive safety guards + deterministic inventory landed in `forensic.basicTriage`.
- `M15` `[DONE]`: embedded certificate parsing and PE trust summary in pre-triage and triage.
- `M16` `[PLANNED]`: deterministic triage corpus + contract/golden expansion.
- `M17` `[PLANNED]`: `C1` reclassification workflow + `C2` plan drift gate.
- `M18` `[PLANNED]`: evidence bundle and provenance export.
