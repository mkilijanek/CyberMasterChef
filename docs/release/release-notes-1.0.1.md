# Release Notes 1.0.1

Updated: 2026-03-12

## Summary

`CyberMasterChef 1.0.1` is a stabilization patch on top of `1.0.0`. It does not change the tracked parity baseline (`472/465`), but it closes several runtime, CI, and release-process defects discovered during manual validation and post-release review.

## Included Fixes

- workbench/browser-safe builtins registry no longer pulls browser-incompatible operations into the UI runtime
- `crypto.randomUUID()` call sites now degrade safely in restricted browser/Node environments
- `WebCrypto.subtle` fallback paths now keep SHA-256 and reproducibility hashing available through `hash-wasm`
- workbench cancellation is task-scoped and worker-pool init is concurrency-safe
- oversized share-state payloads no longer emit unstable URL hashes
- batch CLI errors preserve the underlying read/process failure detail
- release readiness checks and script tests are aligned with the current GHCR-first compose flow
- container/runtime security documentation is aligned with the shipped CSP needed for WASM hashing fallback

## Validation Snapshot

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:scripts`
- `pnpm perf:assets`
- `pnpm perf:check`
- `pnpm release:readiness`
- `pnpm docker:test`
- Playwright regression: `adds SHA-256 step from catalog and runs it`
- GitHub Actions on the release commit: `CI`, `Container`, `CodeQL`

## Artifacts

- image: `ghcr.io/mkilijanek/cybermasterchef:1.0.1`
- image: `ghcr.io/mkilijanek/cybermasterchef:latest`
