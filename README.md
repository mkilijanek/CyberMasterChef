# CyberMasterChef

CyberMasterChef is a modular, security-focused data transformation workbench inspired by CyberChef.

## Scope

- Typed recipe engine: `@cybermasterchef/core`
- Built-in operation pack: `@cybermasterchef/plugins-standard`
- Browser UI + worker runtime: `@cybermasterchef/workbench`
- Automation-friendly CLI: `@cybermasterchef/cli`

The project targets deterministic behavior, parity tracking, and auditable CI/security governance.

## Current Status

- Milestones `M1-M10`: completed.
- Next roadmap: `M11-M13` (see `docs/parity/roadmap-next-m11-m13.md`).
- C-track snapshot:
  - `C1`: complete domain matrix + drift gate
  - `C2`: baseline complete, high-priority closure in progress
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
```

## Core Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm c1:check
pnpm c2:plan
pnpm c3:check
pnpm perf:check
pnpm release:readiness
```

## CI Gates (Required)

- `c1` drift gate
- `c3` contracts + generated tests + validation
- lint/typecheck/test/build
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
- [Execution board](docs/parity/c2-execution-board.md)
- [C3 contracts](docs/parity/c3-operation-compatibility-contracts.md)
- [Roadmap M11-M13](docs/parity/roadmap-next-m11-m13.md)
- [Development guide](docs/development.md)

## Contribution

- Work on branch `dev`.
- Keep commits scoped and test-backed.
- Update docs in the same PR as behavior changes.
- Run parity/security/perf gates before push.

## License

No license file is currently defined in this repository.
