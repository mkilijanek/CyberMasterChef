# M5 Merge Readiness Report

Generated: 2026-02-25

## Objective

Provide deterministic parity evidence and blocking gates required for safe `dev -> main` merges.

## Evidence

- `C1` drift gate: `pnpm c1:check`.
- `C3` drift + compatibility gate: `pnpm c3:check`.
- Contract-driven regression suite: `packages/plugins-standard/test/generated/c3-contracts.generated.test.ts`.
- Security gates:
  - `pnpm security:csp-check`
  - `pnpm security:audit`
- Release gate: `pnpm release:readiness`.

## Required CI gates

- lint, typecheck, test, build
- C1 drift gate
- C3 contract gate
- CSP checklist gate
- supply-chain audit gate
- release readiness gate

## Decision

When all required checks are green, the repository is merge-ready for `dev -> main` with reproducible parity artifacts and contract evidence.
