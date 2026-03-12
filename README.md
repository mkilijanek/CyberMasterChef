# CyberMasterChef

CyberMasterChef is a modular, security-focused data transformation workbench inspired by CyberChef.

## Scope

- Typed recipe engine: `@cybermasterchef/core`
- Built-in operation pack: `@cybermasterchef/plugins-standard`
- Browser UI + worker runtime: `@cybermasterchef/workbench`
- Automation-friendly CLI: `@cybermasterchef/cli`

The project targets deterministic behavior, parity tracking, and auditable CI/security governance.

## Current Status

- Milestones `M1-M33`: completed.
- Latest closure report: `docs/parity/roadmap-next-m29-m33.md`.
- Latest release: `1.0.1`, a patch stabilization cut on top of the `1.0.0` parity baseline and release train.
- Current parity checkpoint remains `472/465`, with the latest patch line focused on runtime/browser fallback hardening, release gate alignment, and CI stability.
- Release track also includes container delivery: Docker image, smoke-tested `docker-compose.yml`, and GHCR publication on release tags.
- `M51` runtime hardening is enforced in the shipped nginx config and verified during `pnpm docker:test`.
- Workbench share links now drop oversized URL-hash state instead of emitting unstable links for very large recipe/input payloads.
- GitHub milestones are extended through `M59` so release cutover stays behind parity evidence, container publication, and final governance checks.
- `M50` performance gates are enforced through tested helper libraries behind `pnpm perf:assets`, `pnpm perf:check`, and `pnpm test:scripts`.
- C-track snapshot:
  - `C1`: complete domain matrix + drift gate
  - `C2`: `472` tracked operations implemented, exceeding the tracked CyberChef reference set (`472/465`)
  - `C3`: contract catalog + generated regression tests + CI gate for the current declared contract set

## Repository Layout

```text
packages/
  core/               recipe engine, types, registry, converters
  plugins-standard/   built-in operations
  workbench/          React UI + worker runtime
  cli/                Node CLI runner
scripts/
  c1/ c2/ c3/         parity generators/checks
  perf/               performance budget checks
  release/            release-readiness checks
  security/           CSP checklist verification
docs/
  parity/             plans, contracts, execution board
  perf/               budgets and latest benchmark reports
  release/            release train, rollback, final audit
  runbooks/           CI/security/runtime/container procedures
  operations/         observability baseline + SLO/SLA
```

## Quick Start

Requirements:
- Node.js `24.x`
- pnpm `10.x`

```bash
pnpm install
pnpm dev
docker compose up -d
# or build locally:
docker compose --profile local up --build -d
```

## Core Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm run ci
pnpm run ci:full
pnpm test:e2e
pnpm c1:check
pnpm c1:reclassify-check
pnpm c2:plan
pnpm c2:check
pnpm c3:check
pnpm perf:check
pnpm release:readiness
pnpm docker:build
pnpm docker:test
```

## CI Gates (Required)

- `c1` drift gate
- `c1` reclassification gate
- `c3` contracts + generated tests + validation
- lint/typecheck/test/build
- Playwright E2E
- CSP checklist + supply-chain audit
- container runtime header validation in the image smoke test
- performance budget gate
- release readiness gate

## Implemented Highlights

- Forensic triage modules with deterministic STIX/MISP export
- Advanced fingerprinting: `imphash`, TLSH, ssdeep, PE/ELF/Mach-O baseline detection
- New utility parity wave: `text.alternatingCaps`, `math.sum`, `math.subtract`, `math.multiply`, `math.divide`, `bytes.bitShiftLeft`, `bytes.bitShiftRight`, `text.expandAlphabetRange`, `text.escapeString`, `codec.toFloat`, `codec.fromFloat`
- Forensic helper expansion: `Entropy`, `CTPH`, `Generate UUID`, `File Tree`, and deterministic `YARA Rules`
- Extended media/file detection: `forensic.detectFileType` now recognizes `png`, `jpeg`, `gif`, `bmp`, `webp`, `avif`, `tiff`, and `svg`
- Parity corpus expansion: golden corpus now covers image/media and deterministic forensic helper recipes at `30/30`
- CLI/workbench reporting wave: structured output metadata in CLI artifacts and image preview + output metadata in Workbench
- Optional CLI-first sandbox submit adapter with allowlist + timeout/retry controls
- Crypto/KDF expansion: `hmacSha384`, `hkdf`, `scrypt`, `sha224`
- Crypto checksum wave: `hash.xorChecksum`, `hash.tcpIpChecksum`, `hash.luhnChecksum`
- Crypto checksum wave 2: `hash.murmurHash3`, `hash.generateAllChecksums`
- Network expansion: `groupIPAddresses`
- Network parity wave: `changeIpFormat`, `extractMacAddresses`, `parseUserAgent`
- Release-parity wave: `network.defangIpAddresses`, `network.defangUrl`, `network.extractIpAddresses`, `network.fangUrl`, `network.parseTcp`, `network.parseUdp`, `text.rot13BruteForce`, `text.rot47`, `text.rot47BruteForce`

## Docs

- [Docs index](docs/index.md)
- [Master plan](docs/parity/c-implementation-master-plan.md)
- [Roadmap M34-M53](docs/parity/roadmap-next-m34-m53.md)
- [Roadmap M50-M59](docs/parity/roadmap-next-m50-m59.md)
- [Release 1.0.0 Plan](docs/release/release-1.0.0-plan.md)
- [Release Notes 1.0.1](docs/release/release-notes-1.0.1.md)
- [Release Notes 1.0.0](docs/release/release-notes-1.0.0.md)
- [Release Evidence Checklist](docs/release/release-evidence-checklist.md)
- [Container Delivery](docs/release/release-1.0.0-plan.md#container-delivery)
- [Runtime Hardening](docs/security/runtime-hardening.md)
- [Container Operations Runbook](docs/runbooks/container-operations.md)
- [Execution board](docs/parity/c2-execution-board.md)
- [C3 contracts](docs/parity/c3-operation-compatibility-contracts.md)
- [Triage corpus](docs/parity/triage-corpus.md)
- [Triage evidence bundle](docs/parity/triage-evidence-bundle.md)
- [C1 reclassification workflow](docs/parity/c1-misc-reclassification.md)
- [Roadmap M14-M18](docs/parity/roadmap-next-m14-m18.md)
- [Roadmap M11-M13](docs/parity/roadmap-next-m11-m13.md)
- [Development guide](docs/development.md)

## Contribution

- Work on branch `dev`.
- Keep commits scoped and test-backed.
- Update docs in the same PR as behavior changes.
- Before every push, make sure README/docs/roadmap/parity artifacts for the changed scope are already committed.
- Run parity/security/perf gates before push.

## License

This repository is licensed under the BSD 3-Clause License.
See `LICENSE`.
