# Phase A Definition of Done (Parity + Tests)

Status keys:
- `PASS`: requirement is implemented and verified.
- `FAIL`: requirement is missing, broken, or unverifiable.

## Checklist

- `PASS` Golden parity corpus exists and is versioned in repository.
  - Evidence: `packages/plugins-standard/test/goldenRecipes.test.ts`
  - Evidence: `packages/plugins-standard/test/fixtures/parity-corpus.json`

- `PASS` Parity gate command enforces minimum corpus compatibility.
  - Evidence: `pnpm test:parity`
  - Evidence: `scripts/check-parity-coverage.mjs`

- `PASS` Negative/degradation scenarios are covered by automated tests.
  - Evidence: `packages/plugins-standard/test/goldenNegative.test.ts`

- `PASS` Semantic round-trip parity is tested (`native -> cyberchef -> native`).
  - Evidence: `packages/plugins-standard/test/semanticRoundtrip.test.ts`

- `PASS` Determinism is validated for repeated execution (output + trace).
  - Evidence: `packages/plugins-standard/test/determinism.test.ts`

- `PASS` Worker protocol cancellation/timeout/race handling is tested.
  - Evidence: `packages/workbench/src/worker/runtime.test.ts`

- `PASS` Critical user journeys are covered in browser E2E tests.
  - Evidence: `e2e/workbench.spec.ts`

- `PASS` Negative browser E2E journeys are covered.
  - Evidence: `e2e/workbench-negative.spec.ts`

- `PASS` Persistence browser E2E journeys are covered.
  - Evidence: `e2e/workbench-persistence.spec.ts`

- `PASS` Coverage reports and thresholds are available per package.
  - Evidence: `pnpm test:coverage`
  - Evidence: `packages/core/vitest.config.ts`
  - Evidence: `packages/plugins-standard/vitest.config.ts`
  - Evidence: `packages/workbench/vitest.config.ts`

- `PASS` CI workflow executes lint, typecheck, tests, and build on pushes/PRs.
  - Evidence: `.github/workflows/ci.yml`

## Exit criteria

Phase A is complete when all checklist items remain `PASS` on `dev` and on PR validation runs.
