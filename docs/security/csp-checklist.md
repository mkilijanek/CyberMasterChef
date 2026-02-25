# CSP Checklist

This checklist defines minimum policy directives required for production deployment.

## Required directives

- `default-src 'self'`
- `script-src 'self'`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: blob:`
- `connect-src 'self'`
- `worker-src 'self' blob:`
- `object-src 'none'`
- `base-uri 'none'`
- `frame-ancestors 'none'`

## Verification

1. Confirm the deployed response includes all required directives.
2. Confirm no wildcard (`*`) is used for `script-src` and `worker-src`.
3. Re-run this check when deployment config changes.
