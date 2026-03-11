# Release 1.0.0 Plan

Updated: 2026-03-11

## Objective

Ship `CyberMasterChef 1.0.0` only after the tracked CyberChef functional surface reaches at least `100%` coverage in repo parity artifacts and all release governance gates are green.

## Entry Criteria

- `M34-M52` completed and documented
- `C1`, `C2`, `C3` artifacts regenerated and committed
- no open blocking security, CI, or release issues
- README/docs index/master plan aligned with shipped scope

## Required Validation

- `pnpm c1:check`
- `pnpm c1:reclassify-check`
- `pnpm c2:check`
- `pnpm c3:check`
- `pnpm security:csp-check`
- `pnpm security:audit`
- `pnpm run ci`
- `pnpm run ci:full`
- `pnpm test:e2e`
- `pnpm perf:assets`
- `pnpm perf:check`
- `pnpm release:readiness`

## Release Cut Procedure

1. Freeze `dev` for release-candidate validation.
2. Regenerate parity and release artifacts.
3. Verify the CyberChef parity target and attach evidence in the release PR.
4. Update changelog/release notes and rollback notes.
5. Merge `dev -> main`.
6. Tag and publish `1.0.0`.
7. Verify post-release CI and operational dashboards.

## Exit Criteria

- release PR approved with no unresolved comments
- all required gates green on the release commit
- tagged `1.0.0` artifact on `main`
- post-release smoke validation complete
