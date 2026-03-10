# Observability Baseline

## Pipeline metrics

- CI success rate (`green_runs / total_runs`).
- Median CI duration and p95 duration.
- Failure taxonomy counters:
  - `c1_drift_failure`
  - `c3_contract_failure`
  - `lint_type_failure`
  - `test_failure`
  - `e2e_failure`
  - `perf_budget_failure`
  - `release_readiness_failure`

## Runtime metrics

- Worker pool:
  - `queueDepth`
  - `maxQueueDepthObserved`
  - `queueOverflowCount`
  - retry attempts and retry delay bucket.
- Recipe execution:
  - total duration,
  - slowest step duration,
  - timeout/abort count.

## Reporting artifacts

- Performance report:
  - `docs/perf/latest-benchmark-report.md`
  - `docs/perf/latest-benchmark-report.json`
- Release readiness and parity artifacts in `docs/parity/*`.
