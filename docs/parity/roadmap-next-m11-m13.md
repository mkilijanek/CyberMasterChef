# Roadmap Next (M11-M13)

Updated: 2026-02-26 (M11-M13 completed)

## M11: C2 High-Priority Parity Closure

Goal: close highest-value missing operations from `crypto-hash-kdf` and `network-protocol-parsers`.
Status: `DONE`

Delivered:
- `hash.sha224`
- `network.groupIPAddresses`
- `network.dnsOverHttps`
- C3 contracts/testgen refreshed (`298` operations validated)
- unit/golden coverage updated for new network/hash ops

Closure checklist:
1. `[DONE]` shortlist finalized from `docs/parity/c2-domain-implementation-plan.md`.
2. `[DONE]` operations implemented with deterministic behavior.
3. `[DONE]` tests added and C3 contracts regenerated.
4. `[DONE]` parity artifacts and execution board updated.

## M12: Workbench Runtime Slimming

Goal: reduce worker bundle size and node-polyfill footprint without regressions.
Status: `DONE`

Delivered:
1. CI asset budget gate: `pnpm perf:assets` + `scripts/perf/check-workbench-assets.mjs`.
2. budget baseline committed: `docs/perf/asset-budgets.json`.
3. release readiness updated to require asset budgets evidence.
4. validated against full quality chain (`lint`, `typecheck`, `test`, `build`, `perf:check`, `release:readiness`).

## M13: Forensic Production Integrations v2

Goal: move remaining triage mocks to concrete integrations.
Status: `DONE`

Delivered:
1. ZIP password pipeline with guards (`zipMaxInputBytes`, ZIP signature checks, allowlist, timeout/retry).
2. YARA adapter (CLI-first) with endpoint/profile validation and structured results.
3. shared retry/timeout submit path for sandbox/ZIP/YARA + integration tests for success, allowlist, retry, timeout.
4. triage report now removes related mocked capabilities after successful adapter submission.
