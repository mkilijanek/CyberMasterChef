# C Implementation Master Plan

Updated: 2026-02-24

## Sources

- `ref/research-report3.md` (analysis of branch drift, security/testing gaps, C-track governance).
- Existing parity artifacts:
  - `docs/parity/c1-operation-domain-summary.md`
  - `docs/parity/c2-domain-implementation-plan.md`
  - `docs/parity/c2-execution-board.md`
  - `docs/parity/c3-operation-compatibility-contracts.md`

## Objective

Deliver a complete, auditable, and operationally useful C-track:

- `C1`: authoritative domain taxonomy and coverage matrix.
- `C2`: prioritized implementation waves toward CyberChef functional parity.
- `C3`: compatibility contracts, deterministic behavior, and contract-driven tests.

## Scope Markers

- `[DONE]` implemented and validated in `dev`.
- `[IN-PROGRESS]` partially implemented, requires additional waves.
- `[PLANNED]` accepted in plan, not implemented yet.
- `[DEFERRED]` intentionally moved after current C milestone.

## C-Track Status (Execution Scope)

### C1 Domain Matrix

- Status: `[DONE]`
- Realization: `100%`
- Deliverables complete:
  - matrix JSON/CSV
  - domain summary report
  - generation scripts
- Remaining only operational work:
  - `[PLANNED]` CI drift detection for regenerated artifacts.

### C2 Domain Implementation

- Status: `[IN-PROGRESS]`
- Realization (current): `~55%` of planned baseline wave scope for priority domains.
- Completed baseline waves:
  - date-time baseline and telemetry parsing helpers
  - data-format baseline (JSON minify/beautify/sort/extract-keys)
  - network IOC baseline (extract, defang/fang)
  - forensic IOC baseline (strings, emails, domains, hash/token/vuln extractors)
  - basic pre-triage baseline (`forensic.basicPreTriage`)
  - basic triage baseline (`forensic.basicTriage`)
- Still missing for C2 baseline completeness:
  - compression/archive baseline (`gzip`, `gunzip`, and compatibility strategy)
  - structured error taxonomy standardization across new operations
  - higher-priority crypto/hash/kdf expansion beyond extractor helpers
  - CI gates for parity-plan drift.

### C3 Compatibility Contracts

- Status: `[IN-PROGRESS]`
- Realization (current): `~70%`
- Completed:
  - generated contracts catalog + schema
  - compatibility artifact publication in repo
- Missing:
  - `[PLANNED]` contract-to-test generation path (automated suites from C3 artifacts)
  - `[PLANNED]` CI blocking gate on contract drift and deterministic declarations.

## Full Work Breakdown (Complete Plan)

## C0 Governance, Quality, and Security

1. `[PLANNED]` Make C-artifacts (`c1/c2/c3`) reproducible in CI and fail on drift.
2. `[PLANNED]` Enforce phase gates: lint, typecheck, tests, parity check, e2e.
3. `[PLANNED]` Add dedicated worker security contract tests (network API denial + protocol validation).
4. `[PLANNED]` Add deployment-level CSP checklist verification (`worker-src`, `connect-src`).
5. `[PLANNED]` Extend supply-chain hardening policy checks for pnpm in CI.

## C1 Domain Taxonomy and Coverage Governance

1. `[DONE]` Domain taxonomy ruleset and matrix generator.
2. `[DONE]` Domain matrix artifacts publication.
3. `[DONE]` Domain coverage summary.
4. `[PLANNED]` CI drift gate for regenerated C1 outputs.
5. `[PLANNED]` Periodic reclassification workflow for `misc-uncategorized`.

## C2 Functional Implementation Waves

### Wave A: IOC/Telemetry (active)

1. `[DONE]` `forensic.extractStrings`
2. `[DONE]` `forensic.extractEmails`
3. `[DONE]` `forensic.extractDomains`
4. `[DONE]` hash IOC extractors (MD5/SHA-256 baseline)
5. `[DONE]` network IOC extract/defang/fang baseline
6. `[DONE]` date-time baseline and timestamp extraction helpers

### Wave B: Data Format Expansion

1. `[DONE]` JSON minify/beautify
2. `[DONE]` JSON key sorting and key-path extraction
3. `[IN-PROGRESS]` additional JSON analysis/normalization operations
4. `[PLANNED]` structured error classes and stable error taxonomy

### Wave C: Compression/Archive Baseline

1. `[DONE]` `compression.gzip`
2. `[DONE]` `compression.gunzip`
3. `[DONE]` browser/node compatibility strategy and deterministic tests
4. `[DEFERRED]` zip/tar/bzip2 full parity (after baseline compatibility proof)

### Wave D: Crypto/Hash/KDF Expansion

1. `[IN-PROGRESS]` hash-related forensic support (extractor level)
2. `[PLANNED]` operation-level crypto parity expansion (digest/mac/kdf)
3. `[DEFERRED]` high-cost wasm-heavy algorithms after baseline C2 closure

### Wave E: Forensic Triage (CSIRT/SOC)

1. `[DONE]` Built-in baseline modules for binary/text sample input:
   - core IOC extraction (domains, URLs, IPs, emails, hashes)
   - SHA-family hashes via WebCrypto + `md5`; placeholders for `imphash`, `TLSH`, `ssdeep`
   - binary metadata pre-triage (PE sections + VA/offset/size/entropy, plus entropy segments)
2. `[DONE]` deterministic report schema for triage output.
3. `[DONE]` baseline triage verdict module with scored findings and recommendations.
4. `[DONE]` safety constraints baseline (bounded IOC/segment extraction controls).
5. `[IN-PROGRESS]` contract tests + golden fixtures for known malware-like samples.
6. `[IN-PROGRESS]` production integrations currently mocked (ZIP password pipeline, YARA, STIX/MISP, dynamic sandbox connector).
7. `[PLANNED]` advanced triage add-ons: full `imphash`, TLSH/ssdeep adapters, broader binary format support.

## C3 Contract and Determinism Program

1. `[DONE]` contract catalog generator and schema.
2. `[IN-PROGRESS]` deterministic behavior declarations for implemented ops.
3. `[PLANNED]` contract-driven generated tests.
4. `[PLANNED]` CI contract gate (schema + compatibility + determinism assertions).

## Milestones for 100% C-Track Readiness

1. `M1`: C1 stable + CI drift gate enabled.
2. `M2`: C2 baseline waves (IOC/date/data/compression-baseline) completed.
3. `M3`: C3 contracts enforced in CI with generated regression suites.
4. `M4`: Security/quality governance (worker/CSP/supply-chain gates) automated.
5. `M5`: Dev-to-main merge readiness with deterministic parity evidence.

## Current Execution Queue Extension

- Queue tasks `1-20`: completed.
- Forensic Triage (CSIRT/SOC) baseline module.
  - Status: `[DONE]` (baseline)
  - Next: harden with advanced hash adapters and expanded fixture corpus.

## Current Implementation Range

- Achieved now:
  - `C1: 100%`
  - `C2: ~55%`
  - `C3: ~70%`
- Combined C-track completion snapshot: `~65%`
- Active focus for next execution queue:
  - complete compression baseline (`gzip`/`gunzip`) and structured error taxonomy
  - evolve Forensic Triage from baseline to full malware-analysis module (`imphash`/TLSH/ssdeep + richer binary parsing)
