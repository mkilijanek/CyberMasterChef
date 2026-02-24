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
- [ ] `network.fangIPs` reversal operation.

## Queue extension

- [ ] Task 21: `Basic Pre-Triage (Forensic/Malware Analysis)` module (post Wave 1-20 completion).

## Quality gates

- New operation must include:
  - contract entry (C3 artifacts regenerated)
  - deterministic behavior declaration
  - test coverage (unit and/or golden)
- `pnpm lint && pnpm typecheck && pnpm test` must pass before push.
