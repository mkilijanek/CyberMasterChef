# Quality Coverage Baseline

Updated: 2026-03-10

## Objective

Capture the current unit-coverage baseline after the M24-M28 quality wave so the repo tracks measurable improvement rather than qualitative claims.

## Package Coverage Snapshot

| Package | Statements | Branches | Functions | Lines | Command |
| --- | ---: | ---: | ---: | ---: | --- |
| `@cybermasterchef/cli` | `86.27%` | `79.23%` | `83.33%` | `89.66%` | `pnpm --filter @cybermasterchef/cli test:coverage` |
| `@cybermasterchef/workbench` | `89.95%` | `79.26%` | `96.71%` | `92.50%` | `pnpm --filter @cybermasterchef/workbench test:coverage` |

## Delta Since Previous Baseline

- `@cybermasterchef/cli`: `+9.37` statements, `+7.31` branches, `+33.33` functions, `+9.38` lines.
- `@cybermasterchef/workbench`: `+5.94` statements, `+3.15` branches, `+7.90` functions, `+5.30` lines.

## Hotspots

### CLI

- Primary hotspot: `packages/cli/src/main.ts`
- Current state: most remaining uncovered logic is still concentrated in a single command-entry file.
- Highest-value remaining branches:
  - batch error/fail-fast combinations around `runBatchWithConcurrency`,
  - non-batch stdout/output-file tails,
  - bootstrap and process-entry tails near `isMain`.

### Workbench

- Primary hotspot: `packages/workbench/src/App.tsx`
- Current state: the package now clears the local function threshold, but `App.tsx` still carries most remaining statement and branch debt.
- Highest-value remaining branches:
  - late render tails around recipe insertion and trace/result rendering,
  - a few bootstrap and control-state branches,
  - residual worker/runtime error display branches.

## Threshold State

- `@cybermasterchef/workbench` now clears its local `test:coverage` function threshold with `96.71%` functions.
- `@cybermasterchef/cli` still has no local coverage gate, but the package is now in a materially healthier state and no longer sits at a function-coverage floor.

## Validation Used

- `pnpm --filter @cybermasterchef/cli test -- main.unit`
- `pnpm --filter @cybermasterchef/cli test:coverage`
- `pnpm --filter @cybermasterchef/workbench test -- appBehavior appHelpers`
- `pnpm --filter @cybermasterchef/workbench test:coverage`

## Interpretation

- The quality wave materially reduced risk in both interactive and CLI entry surfaces.
- Remaining coverage work should continue to focus on `packages/cli/src/main.ts` and `packages/workbench/src/App.tsx`, because repo-level percentages are still dominated by those two files.
