# Release 1.0.0 Plan

Updated: 2026-03-11

## Objective

Ship `CyberMasterChef 1.0.0` only after the tracked CyberChef functional surface reaches at least `100%` coverage in repo parity artifacts and all release governance gates are green.

## Entry Criteria

- `M34-M57` completed and documented; `M58` is in progress with the latest hash and Argon2 parity wave landed in code
- `C1`, `C2`, `C3` artifacts regenerated and committed
- no open blocking security, CI, or release issues
- README/docs index/master plan aligned with shipped scope
- container image, compose setup, and GHCR release pipeline validated on `main`

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
- `pnpm docker:build`
- `pnpm docker:test`
- GitHub Actions `CI`, `Container`, and `CodeQL` workflows must run on `Node 24` and finish without asset-budget regressions

## Container Delivery

- Build a production Docker image from the monorepo using a multi-stage build and ship the workbench as a static runtime artifact.
- Keep a baseline `docker-compose.yml` for local smoke validation and operator onboarding.
- Build and smoke-test the image in GitHub Actions on `main`, pull requests, and release tags.
- Publish versioned and `latest` images to `ghcr.io/mkilijanek/cybermasterchef` for release tags only.
- Treat container build/test/publish failures as release blockers for `1.0.0` and later releases.

## Release Cut Procedure

1. Freeze `dev` for release-candidate validation.
2. Regenerate parity and release artifacts.
3. Verify the CyberChef parity target and attach evidence in the release PR.
4. Update changelog/release notes and rollback notes.
5. Build and smoke-test the Docker image and validate `docker-compose.yml`.
6. Merge `dev -> main`.
7. Tag and publish `1.0.0`, including GHCR images.
8. Verify post-release CI, container publication, and operational dashboards.

## Exit Criteria

- release PR approved with no unresolved comments
- all required gates green on the release commit
- tagged `1.0.0` artifact on `main`
- `ghcr.io/mkilijanek/cybermasterchef` images published and smoke-verified for the release tag
- post-release smoke validation complete
