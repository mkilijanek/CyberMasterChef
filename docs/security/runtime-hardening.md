# Runtime Hardening

Updated: 2026-03-11

## Static Container Runtime

The production container serves the workbench as static files from nginx. Runtime hardening is
enforced in [docker/nginx/default.conf](../../docker/nginx/default.conf).

## Required Response Headers

- `Content-Security-Policy: default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; worker-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: accelerometer=(), autoplay=(), camera=(), display-capture=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), publickey-credentials-get=(), usb=(), web-share=(), xr-spatial-tracking=()`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

## Method and Caching Policy

- `/` and `/healthz` are `GET`/`HEAD` only and return `Cache-Control: no-store`
- `/assets/` is `GET`/`HEAD` only and returns `Cache-Control: public, max-age=31536000, immutable`
- nginx `server_tokens` is disabled

## Verification

- `pnpm security:csp-check`
- `pnpm docker:build`
- `pnpm docker:test`

`pnpm docker:test` checks the published image surface for:

- successful `/` and `/healthz` responses
- presence of the security headers above
- availability of built assets referenced by `index.html`
