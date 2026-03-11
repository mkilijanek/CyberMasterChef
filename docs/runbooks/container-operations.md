# Container Operations Runbook

Updated: 2026-03-11

## Scope

This runbook covers the static workbench container published as
`ghcr.io/mkilijanek/cybermasterchef`.

## Local Operator Flow

1. Start the service:
   - `docker compose up --build -d`
2. Verify health:
   - `curl http://127.0.0.1:8080/healthz`
3. Follow logs when diagnosing runtime issues:
   - `docker compose logs -f cybermasterchef`
4. Stop the service:
   - `docker compose down`

## Image Validation

- build locally with `pnpm docker:build`
- smoke-test locally with `pnpm docker:test`
- confirm the root document, `/healthz`, and built assets respond successfully
- confirm runtime headers match the hardening policy in `docs/security/runtime-hardening.md`

## GHCR Publication

- release tags publish `ghcr.io/mkilijanek/cybermasterchef:<tag>` and `:latest`
- container publication is handled by `.github/workflows/container.yml`
- treat missing GHCR publication as a release blocker for `1.0.0` and later releases

## Incident Response

- for failing startup, inspect `docker compose logs -f cybermasterchef`
- for header drift or asset regressions, re-run `pnpm docker:test`
- for broken published images, stop rollout and execute release rollback

## Rollback

1. Identify the last known-good release tag in GHCR.
2. Pin deployment back to the previous image tag.
3. Re-run smoke validation against the rolled-back image.
4. Follow `docs/release/rollback-and-dry-run.md` if a repo rollback is also required.
