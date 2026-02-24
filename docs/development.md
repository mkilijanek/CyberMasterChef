# Development Guide

## Setup

```bash
node --version   # 20+
pnpm --version   # 10+
pnpm install
pnpm dev         # starts workbench at http://localhost:5173
```

## Key commands

```bash
pnpm typecheck   # TypeScript check (Vite is transpile-only!)
pnpm lint        # ESLint across all packages
pnpm test        # Vitest
pnpm build       # full build
pnpm ci          # lint + typecheck + test + build
```

## Supply chain (pnpm v10)

Consider enabling in `.npmrc`:
- `allow-builds` / allowlist for trusted native deps
- `minimumReleaseAge` to delay freshly published packages
- `trustPolicy` for workspace packages

Commit `pnpm-lock.yaml` to the repo for reproducible builds.

## TypeScript notes

- `strict: true` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`
- No `any` in production code; use `unknown` and narrow
- Type imports: use `import type { Foo }` for type-only imports (ESLint rule enforced)

## Testing

- Unit: Vitest (`pnpm test`)
- Current suites:
  - `packages/core/test/engine.test.ts`
  - `packages/plugins-standard/test/standardPlugin.test.ts`
- E2E: Playwright (roadmap)
- Golden recipes: regression tests against CyberChef-compatible recipe JSON (roadmap)

## Adding a new operation

1. Create `packages/plugins-standard/src/ops/myOp.ts`
2. Export from `packages/plugins-standard/src/index.ts`
3. Add unit tests
4. Run `pnpm lint && pnpm typecheck && pnpm test`

Example operation IDs in use:
- `codec.toBase64`, `codec.fromBase64`
- `codec.toHex`, `codec.fromHex`
- `codec.toBinary`, `codec.fromBinary`
- `codec.urlEncode`, `codec.urlDecode`
- `hash.sha256`
- `text.reverse`
