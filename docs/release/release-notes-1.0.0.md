# Release Notes 1.0.0

Released: 2026-03-12

## Summary

`CyberMasterChef 1.0.0` is the first release cut after the tracked CyberChef reference surface passed parity in repo artifacts (`472/465`), with release governance, container delivery, security headers, and parity contract gates enforced in CI.

## Highlights

- tracked reference parity exceeded `100%` with `472/465` implemented operations in `C2`
- `C1`, `C2`, and `C3` parity artifacts are generated, verified, and committed as release evidence
- container delivery is part of the release path with smoke-tested image validation and GHCR publication workflow
- runtime hardening is enforced in nginx with CSP/security checklist gates and smoke validation
- CLI and Workbench ship structured output metadata, image preview support, and expanded recipe/test coverage

## Included In The Final M59 Closure

- new network compatibility operations:
  - `network.defangIpAddresses`
  - `network.defangUrl`
  - `network.extractIpAddresses`
  - `network.fangUrl`
  - `network.parseTcp`
  - `network.parseUdp`
- new text compatibility operations:
  - `text.rot13BruteForce`
  - `text.rot47`
  - `text.rot47BruteForce`
- release parity alias/wrapper operations in `packages/plugins-standard/src/ops/releaseParityAliasOps.ts`

## Validation Snapshot

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm c1:check`
- `pnpm c1:reclassify-check`
- `pnpm c2:check`
- `pnpm c3:check`
- `pnpm perf:assets`
- `pnpm perf:check`
- `pnpm release:readiness`
- `pnpm docker:test`

## Container

- image: `ghcr.io/mkilijanek/cybermasterchef:1.0.0`
- image: `ghcr.io/mkilijanek/cybermasterchef:latest`

## Notes

- Workbench builds still emit upstream Vite/browser externalization warnings from some dependencies; these do not fail the release gates and the production build completes successfully.
