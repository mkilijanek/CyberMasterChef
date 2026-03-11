# CSP Checklist

This checklist defines minimum policy directives required for production deployment.

## Required directives

- `default-src 'none'`
- `script-src 'self'`
- `style-src 'self'`
- `img-src 'self' data:`
- `connect-src 'none'`
- `worker-src 'self'`
- `object-src 'none'`
- `base-uri 'none'`
- `frame-ancestors 'none'`

## Verification

1. Confirm the deployed response includes all required directives.
2. Confirm no wildcard (`*`) is used for `script-src`, `style-src`, or `worker-src`.
3. Run `pnpm security:csp-check` after any runtime header or deployment config change.
4. Validate the production image with `pnpm docker:test` before push/release.
