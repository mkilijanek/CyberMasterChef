# Roadmap Next (M11-M13)

Updated: 2026-02-26 (M11 in progress)

## M11: C2 High-Priority Parity Closure

Goal: close highest-value missing operations from `crypto-hash-kdf` and `network-protocol-parsers`.
Status: `IN-PROGRESS`

Progress snapshot:
- implemented `hash.sha224`
- implemented `network.groupIPAddresses`

Stages:
1. Finalize prioritized missing-op shortlist from `docs/parity/c2-domain-implementation-plan.md`.
2. Implement selected operations with deterministic behavior declarations.
3. Add unit + golden tests and regenerate C3 contracts.
4. Close C2 plan drift by updating parity artifacts and execution board.

## M12: Workbench Runtime Slimming

Goal: reduce worker bundle size and node-polyfill footprint without regressions.
Status: `PLANNED`

Stages:
1. Identify largest chunks and polyfill-heavy dependencies in workbench build output.
2. Refactor expensive operations behind optional runtime profiles/lazy loading.
3. Tune manual chunks and validate budget impact via `pnpm perf:check`.
4. Add acceptance thresholds for worker artifact size in CI documentation.

## M13: Forensic Production Integrations v2

Goal: move remaining triage mocks to concrete integrations.
Status: `PLANNED`

Stages:
1. Implement ZIP password pipeline with bounded safety controls.
2. Add YARA profile adapter (CLI-first, allowlist/config validated).
3. Extend integration tests for error handling, retries, and deterministic outputs.
4. Update STIX/MISP/sandbox mapping docs and final readiness evidence.
