# Release Evidence Checklist

Updated: 2026-03-11

Use this checklist on the `1.0.0` release commit and every later release tag.

## Mandatory Evidence

- `pnpm run ci:full`
- `pnpm test:e2e`
- `pnpm docker:test`
- `CI` / `Container` / `CodeQL` green on the release commit
- container publication visible in `ghcr.io/mkilijanek/cybermasterchef`
- latest perf evidence committed in `docs/perf/latest-benchmark-report.md`

## Artifact Review

- parity artifacts regenerated and committed
- release docs, runbooks, README, and roadmap aligned with shipped behavior
- rollback checklist reviewed in `docs/release/rollback-and-dry-run.md`
- operator guidance reviewed in `docs/runbooks/container-operations.md`

## Sign-off Record

For the release PR, record:

- release commit SHA
- links to the green GitHub Actions runs
- link to the GHCR package version
- note whether any release blockers were found and how they were resolved
