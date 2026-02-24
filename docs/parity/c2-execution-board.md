# C2 Execution Board

Updated: 2026-02-24

## Objective

Translate C2 domain plan into executable implementation waves with measurable outcomes.

## Wave plan

1. Wave 1 (current): forensic-malware-helper + date-time baselines.
2. Wave 2: compression-archive baselines.
3. Wave 3: data-formats baselines.
4. Wave 4: crypto-hash-kdf targeted expansion.

## Wave 1 backlog

- [x] `forensic.extractStrings` operation (bytes/string input).
- [x] `date.isoToUnix` operation.
- [x] `date.unixToIso` operation.
- [x] Unit tests for all Wave 1 operations.
- [x] Golden parity cases for new operations.

## Wave 2 backlog

- [ ] `compression.gzip` and `compression.gunzip` baseline.
- [ ] Browser/Node compatibility strategy for compression APIs.
- [ ] Unit + golden tests.

## Wave 3 backlog

- [x] `format.jsonMinify` and `format.jsonBeautify`.
- [ ] Structured error taxonomy for invalid JSON payloads.
- [x] Unit + golden tests.

## Wave 5 backlog

- [x] `network.extractIPs` baseline IOC operation.
- [x] `network.extractUrls` baseline IOC operation.
- [x] `network.defangUrls` safe-sharing operation.
- [x] `network.fangUrls` reversal operation.

## Wave 6 backlog

- [x] `date.unixToWindowsFiletime` operation.
- [x] `date.windowsFiletimeToUnix` operation.
- [x] `date.parseObjectIdTimestamp` operation.

## Wave 7 backlog

- [x] `forensic.extractEmails` IOC operation.
- [x] `forensic.extractDomains` IOC operation.

## Wave 8 backlog

- [x] `format.jsonSortKeys` canonicalization operation.
- [x] `format.jsonExtractKeys` inspection operation.

## Wave 9 backlog

- [x] `forensic.extractMd5` hash IOC operation.
- [x] `forensic.extractSha256` hash IOC operation.

## Wave 10 backlog

- [x] `date.extractUnixTimestamps` telemetry parsing operation.
- [x] `date.extractIsoTimestamps` telemetry parsing operation.

## Wave 11 backlog

- [x] `network.extractIPv6` IOC operation.
- [x] `network.defangIPs` safe-sharing operation.
- [x] `network.fangIPs` reversal operation.

## Wave 12 backlog

- [x] `forensic.extractSha1` hash IOC operation.
- [x] `forensic.extractSha512` hash IOC operation.

## Wave 13 backlog

- [x] `forensic.extractJwt` token IOC operation.
- [x] `forensic.extractCves` vulnerability IOC operation.

## Wave 14 backlog

- [x] `format.jsonArrayLength` inspection operation.
- [x] `format.jsonStringValues` extraction operation.
- [x] `format.jsonNumberValues` extraction operation.

## Wave 15 backlog

- [x] `date.isoToDateOnly` normalization operation.
- [x] `date.isoWeekday` classification operation.

## Wave 16 backlog

- [x] `network.extractPorts` network metadata operation.
- [x] `forensic.extractRegistryKeys` host IOC operation.

## Queue extension

- [x] Queue tasks `1-20` completed on `dev`.
- [x] Task 21: `Basic Pre-Triage (Forensic/Malware Analysis)` baseline module.
  - implemented as `forensic.basicPreTriage`
  - includes IOC extraction, SHA-family hashes (where WebCrypto supports), binary entropy segments and PE section metadata
  - placeholders (`null`) kept for `md5`, `imphash`, `TLSH`, `ssdeep` in this baseline

## Quality gates

- New operation must include:
  - contract entry (C3 artifacts regenerated)
  - deterministic behavior declaration
  - test coverage (unit and/or golden)
- `pnpm lint && pnpm typecheck && pnpm test` must pass before push.
