# Rollback and Dry-Run

## Rollback criteria

- Required gate fails after merge to `main`.
- Security issue detected in release candidate.
- Runtime incident breaches SLO and hotfix is not ready.

## Rollback procedure

1. Identify bad merge commit on `main`.
2. Revert commit with non-interactive git revert.
3. Run full CI (`pnpm ci`, `pnpm perf:check`, `pnpm release:readiness`).
4. Merge revert PR with code owner approval.
5. Communicate rollback reason and impact.

## Dry-run checklist (before release)

1. Re-run all mandatory gates on release PR.
2. Validate generated artifacts (`docs/parity/*`, `docs/perf/*`).
3. Confirm CODEOWNERS approvals for touched domains.
4. Simulate rollback on a temporary branch (`revert` rehearsal).
5. Record dry-run result in PR body.
