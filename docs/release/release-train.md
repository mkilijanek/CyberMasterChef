# Release Train

## Cadence

- Weekly release train: every Thursday.
- `T-2d` (Tuesday): feature cutoff on `dev`.
- `T-1d` (Wednesday): stabilization and only bugfix/docs/perf fixes.
- `T` (Thursday): release candidate validation and merge `dev -> main`.

## Freeze and gates

- Freeze starts at `T-1d 12:00 UTC`.
- Required green gates:
  - `pnpm c1:check`
  - `pnpm c3:check`
  - `pnpm lint && pnpm typecheck && pnpm test`
  - `pnpm perf:check`
  - `pnpm release:readiness`

## Approval workflow

- At least one code owner approval required for changed domain.
- No unresolved review comments in release PR.
- Release notes/changelog updated in PR body.

## Hotfix path

- Branch from `main` (`hotfix/*`), minimal scoped patch.
- Run full CI and rollback checklist before merge.
- Back-merge hotfix to `dev` immediately after release.
