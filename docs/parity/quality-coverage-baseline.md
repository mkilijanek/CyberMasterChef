# Quality Coverage Baseline

Updated: 2026-03-10

## Objective

Capture the current unit-coverage baseline after the M29-M33 quality wave so further work can be targeted against the remaining hotspot files rather than broad package-level guesses.

## Package Coverage Snapshot

| Package | Statements | Branches | Functions | Lines | Command |
| --- | ---: | ---: | ---: | ---: | --- |
| `@cybermasterchef/cli` | `89.97%` | `83.04%` | `94.44%` | `92.78%` | `pnpm --filter @cybermasterchef/cli test:coverage` |
| `@cybermasterchef/workbench` | `90.28%` | `79.52%` | `97.36%` | `92.87%` | `pnpm --filter @cybermasterchef/workbench test:coverage` |

## Delta Since Previous Baseline

- `@cybermasterchef/cli`: `+3.70` statements, `+3.81` branches, `+11.11` functions, `+3.12` lines.
- `@cybermasterchef/workbench`: `+0.33` statements, `+0.26` branches, `+0.65` functions, `+0.37` lines.

## Hotspots

### CLI

- Primary hotspot: `packages/cli/src/main.ts`
- Current state: the file is now close to a fully-defensible unit baseline, but a handful of low-level tails remain.
- Highest-value remaining branches:
  - help/version and process-entry tails around `isMain`,
  - remaining file-output/stdout split edges,
  - a few argument-validation and warning-path branches.

### Workbench

- Primary hotspot: `packages/workbench/src/App.tsx`
- Current state: `App.tsx` still dominates the package’s remaining statement and branch debt even though function coverage is comfortably above threshold.
- Highest-value remaining branches:
  - a small set of UI-state transitions around render-only lines,
  - recipe-editor composition tails,
  - residual warning/error display permutations.

## Threshold State

- `@cybermasterchef/workbench` continues to clear its local `test:coverage` function threshold with `97.36%` functions.
- `@cybermasterchef/cli` still has no package-local threshold gate, but its coverage is now close enough to `workbench` that the next waves can stay narrow and hotspot-driven.

## Validation Used

- `pnpm --filter @cybermasterchef/cli test -- main.unit`
- `pnpm --filter @cybermasterchef/cli test:coverage`
- `pnpm --filter @cybermasterchef/workbench test -- appBehavior`
- `pnpm --filter @cybermasterchef/workbench test:coverage`

## Interpretation

- This wave materially hardened both package entry surfaces without production-code churn.
- The next coverage work should stay focused on a shrinking set of tails in `packages/cli/src/main.ts` and `packages/workbench/src/App.tsx`.
