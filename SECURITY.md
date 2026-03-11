# Security

## Threat model (summary)

- User input may contain sensitive data (credentials, PII, keys)
- Third-party plugins may be untrusted
- Risks: data exfiltration (network), DoS (infinite loop), XSS in UI, supply-chain compromise

## Mitigations

### Execution isolation

Operations run inside a Web Worker:
- No DOM access
- Network APIs (`fetch`, `XHR`, `WebSocket`) overridden to throw at runtime
- `AbortSignal` + hard worker termination for timeouts/DoS

### CSP (production hosting)

Set these HTTP headers on your server:

```
Content-Security-Policy:
  default-src 'none';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  worker-src 'self';
  connect-src 'none';
  base-uri 'none';
  object-src 'none';
  frame-ancestors 'none'
```

Recommended companion headers for the static workbench runtime:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: accelerometer=(), camera=(), microphone=(), payment=()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

The shipped container image enforces these headers in `docker/nginx/default.conf`, and `pnpm docker:test`
verifies them during image smoke validation.

### Supply chain

- pnpm v10: use `allow-builds` allowlist for trusted native dependencies
- Commit `pnpm-lock.yaml` to the repository
- Dependabot for automated dependency updates
- CodeQL for static analysis (JavaScript/TypeScript)

### No eval

- `eval()` and `new Function()` are forbidden in production code
- ESLint rule `no-eval` enforced
- Dynamic `import()` from user-controlled strings is forbidden

## Reporting vulnerabilities

Open a GitHub issue with label `security` or contact maintainers privately.
Do not publish vulnerability details before a fix is available.
