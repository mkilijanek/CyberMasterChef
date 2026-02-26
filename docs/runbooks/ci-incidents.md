# CI Incident Runbook

## Trigger

- Any required GitHub Action job fails on `dev` or release PR.

## Triage

1. Identify failing stage (`c1`, `c3`, lint/typecheck/test/build/e2e/perf).
2. Reproduce locally with same command.
3. Classify issue:
   - deterministic code regression,
   - flaky test,
   - infra/tooling/transient dependency issue.

## Response

1. For deterministic regressions: patch code/tests and re-run full pipeline.
2. For flaky tests: capture failing logs, isolate test, add deterministic fix.
3. For transient issues: re-run once; if repeated, pin dependency or add guard.

## Exit criteria

- Two consecutive green runs on target branch.
- Root cause + mitigation captured in PR description.
