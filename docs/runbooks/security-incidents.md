# Security Incident Runbook

## Trigger

- High/Critical finding in `pnpm audit`, CodeQL alert, or reported vulnerability.

## Immediate actions

1. Create security issue and assign owner.
2. Assess exposure scope (`core`, `plugins`, `cli`, `workbench`).
3. If exploitability is high, pause release train and start hotfix branch.

## Mitigation

1. Patch vulnerable dependency/code path.
2. Regenerate lockfile and run full CI.
3. Re-check:
   - `pnpm security:audit`
   - CodeQL workflow
   - runtime security controls (`pnpm security:csp-check`).

## Communication

- Keep details private until fix is merged.
- Publish advisory summary after release when needed.
