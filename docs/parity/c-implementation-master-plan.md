# C Implementation Master Plan

Updated: 2026-03-11 (M50-M59 roadmap, release sequencing correction, container delivery plan, and GitHub milestone tracking added)

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
  - `[DONE]` CI drift detection for regenerated artifacts.

### C2 Domain Implementation

- Status: `[IN-PROGRESS]`
- Realization (current): `~74%` of tracked CyberChef reference operation coverage by implemented operation count.
- Completed baseline waves:
  - date-time baseline and telemetry parsing helpers
  - data-format baseline (JSON/CSV/YAML/XML/HTML + image/format conversions)
  - compression/archive baseline
  - network IOC baseline (extract, defang/fang)
  - forensic IOC baseline (strings, emails, domains, hash/token/vuln extractors)
  - basic pre-triage baseline (`forensic.basicPreTriage`)
  - basic triage baseline (`forensic.basicTriage`)
- Still missing for C2 baseline completeness:
  - higher-priority crypto/hash/kdf expansion beyond extractor helpers
  - network protocol parsers beyond IOC baselines
  - CI gates for parity-plan drift.

### C3 Compatibility Contracts

- Status: `[DONE]`
- Realization (current): `100%`
- Completed:
  - generated contracts catalog + schema
  - compatibility artifact publication in repo
  - contract-to-test generation path (automated suites from C3 artifacts)
  - CI blocking gate on contract drift and compatibility declarations

## Full Work Breakdown (Complete Plan)

## C0 Governance, Quality, and Security

1. `[DONE]` Make C-artifacts (`c1/c3`) reproducible in CI and fail on drift.
2. `[DONE]` Enforce phase gates: lint, typecheck, tests, parity check, e2e.
3. `[DONE]` Add worker security protocol validation tests (message contract + timeout validation).
4. `[DONE]` Add deployment-level CSP checklist verification (`worker-src`, `connect-src`).
5. `[DONE]` Extend supply-chain hardening policy checks for pnpm in CI.

## C1 Domain Taxonomy and Coverage Governance

1. `[DONE]` Domain taxonomy ruleset and matrix generator.
2. `[DONE]` Domain matrix artifacts publication.
3. `[DONE]` Domain coverage summary.
4. `[DONE]` CI drift gate for regenerated C1 outputs.
5. `[DONE]` Periodic reclassification workflow for `misc-uncategorized`.

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
4. `[DONE]` structured error classes and stable error taxonomy

### Wave C: Compression/Archive Baseline

1. `[DONE]` `compression.gzip`
2. `[DONE]` `compression.gunzip`
3. `[DONE]` browser/node compatibility strategy and deterministic tests
4. `[DEFERRED]` zip/tar/bzip2 full parity (after baseline compatibility proof)

### Wave D: Crypto/Hash/KDF Expansion

1. `[DONE]` hash-related forensic support (extractor level)
2. `[DONE]` operation-level crypto parity expansion (digest/mac/kdf) baseline:
   - `[DONE]` `crypto.hmacSha384`
   - `[DONE]` `crypto.hkdf`
   - `[DONE]` `crypto.scrypt` with bounded cost/memory args
3. `[IN-PROGRESS]` high-cost wasm-heavy algorithms and remaining long-tail parity

### Wave E: Forensic Triage (CSIRT/SOC)

1. `[DONE]` Built-in baseline modules for binary/text sample input:
   - core IOC extraction (domains, URLs, IPs, emails, hashes)
   - SHA-family hashes via WebCrypto + `md5`
   - binary metadata pre-triage (PE sections + VA/offset/size/entropy, plus entropy segments)
2. `[DONE]` deterministic report schema for triage output.
3. `[DONE]` baseline triage verdict module with scored findings and recommendations.
4. `[DONE]` safety constraints baseline (bounded IOC/segment extraction controls).
5. `[DONE]` contract tests + golden fixtures for known malware-like samples.
   - `[DONE]` deterministic corpus fixtures for benign, suspicious, archive, and signed-PE samples
6. `[IN-PROGRESS]` production integrations:
   - `[DONE]` deterministic STIX/MISP export payloads in `forensic.basicTriage`
   - `[DONE]` dynamic sandbox connector (optional CLI runtime profile, allowlist + timeout/retry controls)
   - `[DONE]` ZIP password pipeline
   - `[DONE]` YARA scanning adapter
   - `[DONE]` archive safety guards (`zip-slip` / `zip-bomb`) with verifiable enforcement
   - `[DONE]` Authenticode / X.509 trust verification
7. `[DONE]` advanced triage add-ons baseline:
   - `[DONE]` `imphash` computation for PE import tables
   - `[DONE]` TLSH/ssdeep computation with runtime fallbacks/feature flags (`enableTlsh`, `enableSsdeep`, `maxFuzzyInputBytes`)
   - `[DONE]` broader binary format baseline support (`ELF`/`Mach-O` detection)

## C3 Contract and Determinism Program

1. `[DONE]` contract catalog generator and schema.
2. `[DONE]` deterministic behavior declarations for implemented ops (contract field + validator).
3. `[DONE]` contract-driven generated tests.
4. `[DONE]` CI contract gate (schema + compatibility + determinism assertions).

## Milestones for 100% C-Track Readiness

1. `M1`: C1 stable + CI drift gate enabled. `[DONE]`
2. `M2`: C2 baseline waves (IOC/date/data/compression-baseline) completed. `[DONE]`
3. `M3`: C3 contracts enforced in CI with generated regression suites. `[DONE]`
4. `M4`: Security/quality governance (worker/CSP/supply-chain gates) automated. `[DONE]`
5. `M5`: Dev-to-main merge readiness with deterministic parity evidence. `[DONE]`
6. `M6`: Deterministic STIX/MISP export integration baseline. `[DONE]`
7. `M7`: Advanced malware fingerprinting (`imphash`/TLSH/ssdeep + PE/ELF/Mach-O baseline). `[DONE]`
8. `M8`: Crypto/KDF parity expansion (`hmacSha384`/`hkdf`/`scrypt`). `[DONE]`
9. `M9`: Performance & scale hardening (bench budgets + CI gate + worker retry backoff). `[DONE]`
10. `M10`: Release & operations maturity (runbooks/SLO/CODEOWNERS/rollback workflow). `[DONE]`

## Current Execution Queue Extension

- Queue tasks `1-20`: completed.
- Forensic Triage (CSIRT/SOC) baseline module.
  - Status: `[DONE]` (baseline)
  - Next: harden with advanced hash adapters and expanded fixture corpus.

## Current Implementation Range

- Achieved now:
  - `C1: 100%`
  - `C2: baseline complete`
  - `C3: 100% (contract generation + generated regression + CI gate)`
- Combined C-track completion snapshot for milestone scope: `100% (M1-M10)`
- Active focus for next execution queue:
  - drive C2 from baseline completeness to full tracked CyberChef parity
  - keep coverage baselines auditable after each wave
  - converge release governance and docs toward `1.0.0`

## Next Milestones Roadmap

1. `M34`: hash/checksum parity wave 1.
2. `M35`: hash/KDF/checksum parity wave 2.
3. `M36`: network parser baseline wave 1.
4. `M37`: network parser baseline wave 2.
5. `M38`: encoding/codec parity wave 1.
6. `M39`: encoding/codec parity wave 2.
7. `M40`: JSON/data-format completion. `[DONE]`
8. `M41`: XML/HTML/structured-format completion. `[DONE]`
9. `M42`: archive/container parity completion. `[DONE]`
10. `M43`: forensic helper expansion. `[DONE]`
11. `M44`: malware triage enrichment. `[DONE]`
12. `M45`: image/media safe-parity wave. `[DONE]`
13. `M46`: misc reclassification and gap closure. `[DONE]`
14. `M47`: contract corpus expansion. `[DONE]`
15. `M48`: CLI full-parity UX and reporting. `[DONE]`
16. `M49`: workbench full-parity UX wave. `[DONE]`
17. `M50`: performance and scale 1.0 gates.
18. `M51`: security hardening final wave.
19. `M52`: documentation and operational readiness.
20. `M53`: misc/utility parity wave 1. `[DONE-IN-CODE]`
21. `M54`: misc/utility parity wave 2. `[DONE-IN-CODE]`
22. `M55`: network/forensic parity wave 1.
23. `M56`: network/forensic parity wave 2.
24. `M57`: crypto parity wave 3.
25. `M58`: crypto parity wave 4 and final gap closure.
26. `M59`: release `1.0.0` candidate and cutover.

Detailed stages: `docs/parity/roadmap-next-m50-m59.md`.

### M11-M13 Progress Snapshot

- `M11` `[DONE]`: `hash.sha224`, `network.groupIPAddresses`, `network.dnsOverHttps` + refreshed C3 contracts.
- `M12` `[DONE]`: worker asset budget gate and readiness evidence wired into CI/release checks.
- `M13` `[DONE]`: `forensic.basicTriage` integrations expanded with ZIP password pipeline + YARA adapter (allowlist, timeout, retry, structured result output).

### M14-M18 Progress Snapshot

- `M14` `[DONE]`: ZIP archive safety guards and deterministic inventory landed in `forensic.basicTriage`.
- `M15` `[DONE]`: PE certificate table parsing and deterministic embedded X.509 trust summary.
- `M16` `[DONE]`: deterministic triage corpus and regression-contract expansion.
- `M17` `[DONE]`: `C1` reclassification workflow and `C2` drift automation.
- `M18` `[DONE]`: evidence bundle and provenance export maturity.

### M19-M23 Progress Snapshot

- `M19` `[DONE]`: CodeQL regression fixed in workbench test helpers and re-analysis triggered.
- `M20` `[DONE]`: workbench interaction/editor/worker coverage expanded.
- `M21` `[DONE]`: CLI parsing/reporting/output coverage expanded.
- `M22` `[DONE]`: per-package quality coverage baseline documented.
- `M23` `[DONE]`: roadmap and master-plan synchronized with issue traceability.

### M24-M28 Progress Snapshot

- `M24` `[DONE]`: `App.tsx` error, bootstrap, and control-state coverage expanded.
- `M25` `[DONE]`: workbench package now clears its local coverage threshold.
- `M26` `[DONE]`: CLI batch summary/report, empty-output, and bootstrap paths covered.
- `M27` `[DONE]`: coverage baseline refreshed with updated post-wave metrics.
- `M28` `[DONE]`: roadmap/master-plan synchronized for the M24-M28 quality wave.

### M29-M33 Progress Snapshot

- `M29` `[DONE]`: CLI batch skip-empty, read-error, and fail-fast tails covered.
- `M30` `[DONE]`: CLI stdin/stdout executable-entry behavior covered.
- `M31` `[DONE]`: workbench `App.tsx` cancel/control-state coverage expanded.
- `M32` `[DONE]`: coverage baseline refreshed after the latest quality wave.
- `M33` `[DONE]`: roadmap and master-plan synchronized for the M29-M33 wave.

### M50-M59 Planned Track

- `M50-M52`: stabilize performance, security, docs, and operational evidence while parity continues to grow.
- `M53-M54`: close low-risk `misc-uncategorized` and utility gaps with full regression coverage.
- `M55-M56`: close remaining high-value network and forensic gaps needed for tracked parity.
- `M57-M58`: push crypto/reference parity to the `100%+` target with deterministic evidence and contracts.
- `M59`: execute release cutover only after parity, perf, security, docs, and container gates are all green.
- GitHub milestones are being extended through `M59` with issues `#74-#83`.
- Current checkpoint: `hash.crc32`, `hash.ripemd160`, `hash.fletcher8`, `hash.fletcher16`, `hash.fletcher32`, `hash.fletcher64`, `network.parseIPv6Address`, `network.parseIPRange`, `network.stripHttpHeaders`, `network.parseIPv4Header`, `network.parseTcpHeader`, `network.parseUdpHeader`, `network.parseUri`, `network.stripIPv4Header`, `network.stripTcpHeader`, `network.stripUdpHeader`, `codec.toBase32`, `codec.fromBase32`, `codec.toBase45`, `codec.fromBase45`, `codec.toBase62`, `codec.fromBase62`, `codec.toBase85`, `codec.fromBase85`, `codec.toBech32`, `codec.fromBech32`, `codec.toMorseCode`, `codec.fromMorseCode`, `codec.toBase92`, `codec.fromBase92`, `codec.toBraille`, `codec.fromBraille`, `codec.toPunycode`, `codec.fromPunycode`, `codec.toModhex`, `codec.fromModhex`, `bytes.dropBytes`, `bytes.takeBytes`, `bytes.dropNthBytes`, `bytes.takeNthBytes`, `bytes.removeNullBytes`, `bytes.bitShiftLeft`, `bytes.bitShiftRight`, `forensic.entropy`, `forensic.ctph`, `forensic.generateUuid`, `forensic.fileTree`, `forensic.yaraRules`, extended `forensic.detectFileType` media detection, `text.alternatingCaps`, `text.expandAlphabetRange`, `text.escapeString`, `math.sum`, `math.subtract`, `math.multiply`, `math.divide`, `codec.toFloat`, and `codec.fromFloat` are implemented, tested, and reflected in parity artifacts.
