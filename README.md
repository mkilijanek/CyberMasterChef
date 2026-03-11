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
- Next release objective: `1.0.0` with minimum `100%` functional coverage of the CyberChef reference set tracked in `docs/parity/*`.
- Current execution wave: `M34-M53`, with `M36` completed in code and `M37` in progress.
- Release track also includes container delivery: Docker image, smoke-tested `docker-compose.yml`, and GHCR publication on release tags.
- GitHub milestones `M34-M53` are published and linked to issues `#58-#77`.
- C-track snapshot:
  - `C1`: complete domain matrix + drift gate
  - `C2`: in active parity expansion toward full CyberChef functional coverage
  - `C3`: contract catalog + generated regression tests + CI gate

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
  runbooks/           CI/security/runtime incident procedures
  operations/         observability baseline + SLO/SLA
```

## Quick Start

Requirements:
- Node.js `24.x`
- pnpm `10.x`

```bash
pnpm install
pnpm dev
docker compose up --build -d
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
- `c3` contracts + generated tests + validation
- lint/typecheck/test/build
- Playwright E2E
- CSP checklist + supply-chain audit
- performance budget gate
- release readiness gate

## Implemented Highlights

- Forensic triage modules with deterministic STIX/MISP export
- Advanced fingerprinting: `imphash`, TLSH, ssdeep, PE/ELF/Mach-O baseline detection
- Optional CLI-first sandbox submit adapter with allowlist + timeout/retry controls
- Crypto/KDF expansion: `hmacSha384`, `hkdf`, `scrypt`, `sha224`
- Network expansion: `groupIPAddresses`

## Docs

- [Docs index](docs/index.md)
- [Master plan](docs/parity/c-implementation-master-plan.md)
- [Roadmap M34-M53](docs/parity/roadmap-next-m34-m53.md)
- [Release 1.0.0 Plan](docs/release/release-1.0.0-plan.md)
- [Container Delivery](docs/release/release-1.0.0-plan.md#container-delivery)
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
