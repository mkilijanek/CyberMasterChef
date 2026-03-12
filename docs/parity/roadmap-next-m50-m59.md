# Roadmap Next (M50-M59)

Updated: 2026-03-11

## Objective

Close the remaining parity gap from `381/465` tracked CyberChef reference operations to at least `100%` while keeping release-quality governance, security, performance, and documentation gates green for `1.0.0`.

```mermaid
flowchart TD
  M50["M50 Performance and Scale 1.0 Gates"] --> M51["M51 Security Hardening Final Wave"]
  M51 --> M52["M52 Documentation and Operational Readiness"]
  M52 --> M53["M53 Misc/Utility Parity Wave 1"]
  M53 --> M54["M54 Misc/Utility Parity Wave 2"]
  M54 --> M55["M55 Network/Forensic Parity Wave 1"]
  M55 --> M56["M56 Network/Forensic Parity Wave 2"]
  M56 --> M57["M57 Crypto Parity Wave 3"]
  M57 --> M58["M58 Crypto Parity Wave 4"]
  M58 --> M59["M59 Release 1.0.0 Candidate and Cutover"]
```

## Milestones

1. `M50`: performance and scale 1.0 gates
   - Status: `DONE-IN-CODE`
   - Issue: `#74`
   - stabilized benchmark, asset, and CI perf gates against current build output; asset baselines refreshed to `1050000` bytes for `sandbox.worker.js` and `1110000` bytes for `vendor.js`, Actions forced onto `Node 24`, and perf helpers moved behind targeted script tests with full changed-file coverage
2. `M51`: security hardening final wave
   - Status: `DONE-IN-CODE`
   - Issue: `#75`
   - completed runtime/container/security-policy hardening with enforced nginx security headers, cache/method restrictions, smoke-test header validation, and aligned CSP/runtime evidence
3. `M52`: documentation and operational readiness
   - Status: `DONE-IN-CODE`
   - Issue: `#76`
   - aligned README, release docs, runbooks, container/operator docs, release evidence checklist, and release-readiness gating with the shipped runtime/container model
4. `M53`: misc/utility parity wave 1
   - Status: `DONE-IN-CODE`
   - Issue: `#78`
   - landed `text.alternatingCaps`, `math.sum`, `math.subtract`, `math.multiply`, and `math.divide` with full targeted coverage and refreshed `C2/C3`
5. `M54`: misc/utility parity wave 2
   - Status: `DONE-IN-CODE`
   - Issue: `#79`
   - landed `bytes.bitShiftLeft`, `bytes.bitShiftRight`, `text.expandAlphabetRange`, `text.escapeString`, `codec.toFloat`, and `codec.fromFloat` with full targeted coverage and refreshed `C2/C3`
6. `M55`: network/forensic parity wave 1
   - Status: `DONE-IN-CODE`
   - Issue: `#80`
   - landed `network.changeIpFormat`, `network.extractMacAddresses`, and `network.parseUserAgent` with full targeted coverage and refreshed `C2/C3`
7. `M56`: network/forensic parity wave 2
   - Status: `DONE-IN-CODE`
   - Issue: `#81`
   - landed `network.ipv6TransitionAddresses`, `network.parseTlsRecord`, `network.parseX509Certificate`, and `network.parseX509Crl` with full targeted coverage and refreshed `C2/C3`
8. `M57`: crypto parity wave 3
   - Status: `DONE-IN-CODE`
   - Issue: `#82`
   - landed `hash.md4`, `hash.blake3`, `hash.keccak`, and `hash.whirlpool` with full targeted coverage and refreshed `C2/C3`
9. `M58`: crypto parity wave 4 and final gap closure
   - Status: `IN-PROGRESS`
   - Issue: `#83`
   - landed `hash.crc64`, `hash.sm3`, `hash.xxhash32`, `hash.xxhash64`, `hash.xxhash3`, `hash.xxhash128`, `hash.xorChecksum`, `hash.tcpIpChecksum`, `hash.luhnChecksum`, `hash.murmurHash3`, `hash.generateAllChecksums`, `crypto.argon2d`, `crypto.argon2i`, `crypto.argon2id`, `crypto.argon2Verify`, `crypto.bcryptVerify`, `crypto.hmacSha224`, `crypto.hmacMd5`, `crypto.hmacRipemd160`, and `crypto.hmacWhirlpool`; final parity closure remains open behind further crypto/security waves
10. `M59`: release `1.0.0` candidate and cutover
    - Status: `PLANNED`
    - Issue: `#77`
    - run the full release chain, freeze, tag, publish, validate GHCR images, and verify post-release status

## Current Progress Snapshot

- Baseline parity checkpoint in the current repo state: `386/465` tracked operations implemented.
- Highest remaining parity pressure domains:
  - `crypto-hash-kdf`: `64/100`
  - `network-protocol-parsers`: `28/39`
  - `forensic-malware-helper`: `10/17`
  - `misc-uncategorized`: `96/117`
- Release blockers entering this wave:
  - release sequencing must move behind the remaining parity closure, not ahead of it
  - performance/security/docs evidence needs to stay current with each parity wave, even after `M50` closed in code
  - GitHub milestone/issue tracking must expand from `M53` to `M59`

## Exit Criteria

- tracked reference parity at or above `100%`
- `pnpm c1:check`, `pnpm c1:reclassify-check`, `pnpm c2:check`, `pnpm c3:check` green on the release commit
- `pnpm run ci`, `pnpm run ci:full`, `pnpm test:e2e`, `pnpm perf:assets`, `pnpm perf:check`, and `pnpm release:readiness` green
- Docker image built, smoke-tested, and published to `ghcr.io/mkilijanek/cybermasterchef`
- README, docs index, roadmap, runbooks, release notes, and diagrams aligned with shipped behavior
