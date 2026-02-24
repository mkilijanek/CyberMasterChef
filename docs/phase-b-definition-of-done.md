# Phase B - Definition of Done

Status date: 2026-02-24
Scope owner: runtime scalability and batch execution

## Objective

Phase B is complete when workbench runtime scaling and CLI batch execution are production-ready for moderate workloads, with deterministic controls, observability, and verified regression coverage.

## Acceptance checklist

### B1. Worker pool core
- [x] Pool size is configurable and persisted in workbench.
- [x] Max queue size is configurable and persisted in workbench.
- [x] Queue overflow is rejected with explicit, user-visible error.

### B2. Scheduling and control
- [x] Manual execution has higher priority than autobake.
- [x] Active and queued jobs can be canceled.
- [x] Retry policy is bounded (`maxAttempts`) and guarded by `shouldRetry`.

### B3. Observability
- [x] Run metadata exposes queue wait, worker id, and attempt number.
- [x] Queue diagnostics expose enqueue/start depths, in-flight, and overflow count.
- [x] Workbench header surfaces live queue stats and saturation warning.

### B4. CLI batch MVP
- [x] Directory batch mode with extension filters and max-file guard.
- [x] Batch report export to stdout and file.
- [x] Output artifact export with configurable format (`text|json|jsonl`).
- [x] Empty-file policy controls (`skip` / `fail`).
- [x] Failure strategy controls (`fail-fast` / `continue-on-error`).
- [x] Bounded parallelism via `--batch-concurrency`.
- [x] Batch integration tests with fixtures and expected snapshot assertions.

### B5. Quality gates
- [x] Unit/integration suites pass for worker pool and CLI batch paths.
- [x] E2E coverage includes persisted pool settings and saturation warning UX.
- [x] CI does not pin conflicting pnpm versions and passes lint/typecheck/test.

## Exit criteria

Phase B is considered done when all checklist items remain green on `main`, and no open P1/P2 defects target worker pool or batch execution paths.
