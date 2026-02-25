# CyberMasterChef

CyberMasterChef is a modular, security-oriented data transformation workbench inspired by CyberChef.

It is built for three audiences:
- developers extending operations and runtime behavior,
- users running recipes in UI/CLI,
- administrators operating CI/CD, quality gates, and dependency/security controls.

## What You Get

- Typed recipe engine (`@cybermasterchef/core`) with deterministic trace metadata.
- Standard operation plugin (`@cybermasterchef/plugins-standard`) with codec/text/date/forensic/network/data-format operations.
- Browser workbench (`@cybermasterchef/workbench`) running recipes in a worker sandbox.
- Automation-ready CLI (`@cybermasterchef/cli`) with batch mode and reproducibility metadata.

## Key Design Decisions

- TypeScript strict throughout — no `any`, full type safety
- pnpm workspaces — deduplication, supply-chain controls
- Plugin model — operations are isolated packages; `core` has no op-specific code
- Sandbox execution — all recipes run inside a Web Worker; network APIs blocked at runtime + CSP
- i18n baseline — PL/EN from the start (i18next + react-i18next)
- a11y baseline — WCAG 2.2 intent; keyboard navigation, proper ARIA roles

## Repository Layout

```text
packages/
  core/               recipe engine, types, converters, registry, serde
  plugins-standard/   built-in operations
  workbench/          React UI + Web Worker runtime
  cli/                Node CLI runner
scripts/
  c1/                 domain matrix generation
  c2/                 domain implementation planning
  c3/                 compatibility contract generation
docs/
  parity/             C-program artifacts and plans
```

## Quick Start

Prerequisites:
- Node.js `24.x`
- pnpm `10.x`

```bash
pnpm install
pnpm dev
```

Workbench starts from workspace script (`@cybermasterchef/workbench dev`).

## User Guide

### Workbench

```bash
pnpm dev
```

Main capabilities:
- search/add/reorder/remove recipe steps,
- import/export native and CyberChef-compatible recipes,
- run-to-step debugging and trace filtering,
- timeout and cancellation controls,
- local state persistence and deep-link state sharing.

### CLI

Build and run:

```bash
pnpm build
pnpm --filter @cybermasterchef/cli exec cybermasterchef --help
```

Common examples:

```bash
# run recipe against stdin
pnpm --filter @cybermasterchef/cli exec cybermasterchef recipe.json -

# show summary + reproducibility metadata
pnpm --filter @cybermasterchef/cli exec cybermasterchef recipe.json input.txt --show-summary --show-repro

# batch execution with concurrency
pnpm --filter @cybermasterchef/cli exec cybermasterchef recipe.json --batch-input-dir ./samples --batch-concurrency 4 --batch-summary-json
```

Useful CLI flags:
- parsing/import: `--strict-cyberchef`, `--dry-run`, `--fail-on-warning`
- execution: `--timeout-ms`, `--show-trace`, `--trace-json`, `--show-trace-summary`
- output: `--output-file`, `--bytes-output`, `--json-indent`, `--max-output-chars`
- batch: `--batch-input-dir`, `--batch-ext`, `--batch-concurrency`, `--batch-fail-fast`

## Developer Guide

### Core commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
pnpm ci
```

### C-parity artifact generators

```bash
pnpm c1:domain-matrix
pnpm c2:plan
pnpm c3:contracts
pnpm test:parity
```

### Adding a new operation

1. Add file in `packages/plugins-standard/src/ops`.
2. Register it in `packages/plugins-standard/src/index.ts`.
3. Add unit tests in `packages/plugins-standard/test`.
4. Add/extend golden parity scenario if relevant.
5. Update docs (`README`, `docs/development.md`, `docs/parity/c2-execution-board.md`).

## Administrator Guide

### CI/CD quality gates

Recommended minimum pipeline:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- C1 parity gate: `pnpm c1:check`
- C3 contract gate: `pnpm c3:check`
- security gates: `pnpm security:csp-check` and `pnpm security:audit`
- release readiness gate: `pnpm release:readiness`
- e2e gate (for workbench changes): `pnpm test:e2e`

### Security baseline

- Worker sandbox blocks direct network APIs in runtime.
- Keep strict dependency control via `pnpm` and committed lockfile.
- Use CodeQL + Dependabot for continuous scanning/update workflow.
- Enforce deployment CSP (`worker-src`, `connect-src`) at hosting layer.

## C Program TODO & Milestones

Planning artifacts:
- [C Implementation Master Plan](docs/parity/c-implementation-master-plan.md)
- [C2 Execution Board](docs/parity/c2-execution-board.md)
- [C3 Compatibility Contracts](docs/parity/c3-operation-compatibility-contracts.md)

Milestones:
- [x] M1: C1 taxonomy/matrix complete and published.
- [x] M2: C2 waves `1-20` completed on `dev`.
- [x] M3: Forensic Triage baseline modules implemented (`forensic.basicPreTriage`, `forensic.basicTriage`).
- [x] M4: Compression/archive baseline (`compression.gzip`, `compression.gunzip`) complete.
- [x] M5: C3 contract-driven tests and CI contract gate enabled.
- [ ] M6: Security and integration hardening complete (YARA/STIX/MISP/dynamic sandbox non-mocked).

Module groups checklist:
- [x] Date-time baseline group.
- [x] Data-format baseline group.
- [x] Network IOC baseline group.
- [x] Forensic IOC baseline group.
- [x] Pre-Triage/Triage baseline group.
- [x] Compression/archive group.
- [ ] Crypto/KDF expansion group.
- [ ] Advanced binary triage group (non-PE parsers and signature verification).

Forensic Triage currently mocked capabilities:
- [ ] ZIP password pipeline and production-grade safe unpack engine.
- [ ] imphash / TLSH / ssdeep generation.
- [ ] YARA / YARA-X scanning integration.
- [ ] Authenticode/X509 verification.
- [ ] External dynamic sandbox connector (e.g. Cuckoo).

## Documentation Index

- [Architecture](docs/architecture.md)
- [Plugin API](docs/plugin-api.md)
- [Development Guide](docs/development.md)
- [Docs Index](docs/index.md)
- [Phase A Definition of Done](docs/phase-a-definition-of-done.md)
- [Phase B Definition of Done](docs/phase-b-definition-of-done.md)

## Contribution Workflow

- Branch from `dev` for implementation work.
- Keep commits focused and test-backed.
- Update docs in the same change when behavior/capabilities change.
- Prefer small, reviewable PRs with explicit validation steps.

## License

No license file is defined yet in this repository.
