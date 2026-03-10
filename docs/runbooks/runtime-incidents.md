# Runtime Incident Runbook

## Trigger

- Worker execution hangs, batch queue saturation, or abnormal timeout/error spikes.

## Triage checklist

1. Inspect worker stats (`queueDepth`, `inFlight`, `queueOverflowCount`).
2. Validate timeout configuration for affected flow.
3. Verify recent changes in heavy operations (forensic/image/crypto).

## Mitigation

1. Reduce concurrency and queue pressure.
2. Increase timeout only for validated heavy recipes.
3. Apply retry/backoff tuning in worker pool when transient failures dominate.
4. Roll back release if incident breaches SLO and no safe patch exists.

## Exit criteria

- Error rate and queue overflow return to baseline.
- Follow-up issue created with permanent fix and tests.
