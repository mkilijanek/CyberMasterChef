# SLO / SLA

## Build/Test/Release SLO

- CI pass rate on `dev`: **>= 95%** rolling 14 days.
- Median CI duration: **<= 20 min**.
- p95 CI duration: **<= 30 min**.
- Release readiness gate pass before merge to `main`: **100%**.

## Runtime SLO

- Worker queue overflow events in normal load: **0 per run**.
- Recipe timeout aborts for standard recipes: **< 1%**.

## SLA (team response)

- Broken `main` CI: acknowledge within **1h**, fix/rollback within **4h**.
- Security High/Critical: acknowledge within **1h**, mitigation plan within **24h**.
- Release blocker in freeze window: decision (fix vs rollback) within **2h**.
