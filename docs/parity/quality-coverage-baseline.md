# Quality Coverage Baseline

Updated: 2026-03-10

## Objective

Capture the current unit-coverage baseline after the M19-M23 quality wave so further work can be tracked against concrete numbers rather than estimates.

## Package Coverage Snapshot

| Package | Statements | Branches | Functions | Lines | Command |
| --- | ---: | ---: | ---: | ---: | --- |
| `@cybermasterchef/cli` | `76.90%` | `71.92%` | `50.00%` | `80.28%` | `pnpm --filter @cybermasterchef/cli test:coverage` |
| `@cybermasterchef/workbench` | `84.01%` | `76.11%` | `88.81%` | `87.20%` | `pnpm --filter @cybermasterchef/workbench test:coverage` |

## Hotspots

### CLI

- Primary hotspot: `packages/cli/src/main.ts`
- Current state: the file holds essentially all CLI behavior, so package function coverage is gated by a single large command surface.
- Highest-value remaining branches:
  - batch summary/report edge combinations,
  - `failEmptyOutput` and stdout/output-file split tails,
  - `isMain` bootstrap path.

### Workbench

- Primary hotspot: `packages/workbench/src/App.tsx`
- Current state: `App.tsx` remains the dominant blocker for the package function threshold.
- Highest-value remaining branches:
  - state/bootstrap fallbacks,
  - output/error branches not hit by current interaction tests,
  - remaining render and search/filter tails around `App` state transitions.

## Threshold State

- `@cybermasterchef/workbench` still fails its local `test:coverage` gate because global function coverage is below the configured `95%` threshold.
- `@cybermasterchef/cli` has no package threshold gate today, but its function coverage remains low enough to justify continued targeted work.

## Validation Used

- `pnpm --filter @cybermasterchef/cli test -- main.unit`
- `pnpm --filter @cybermasterchef/cli test:coverage`
- `pnpm --filter @cybermasterchef/workbench test -- interaction poolClient appBehavior appHelpers`
- `pnpm --filter @cybermasterchef/workbench test:coverage`
- `pnpm --filter @cybermasterchef/workbench typecheck`
- `pnpm --filter @cybermasterchef/cli lint`
- `pnpm --filter @cybermasterchef/workbench lint`

## Interpretation

- The quality wave materially improved confidence in both interactive and CLI surfaces.
- The next coverage work should stay targeted and file-specific rather than trying to brute-force repo-wide percentages blindly.
