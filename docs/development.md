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
  - `packages/core/test/conversion.test.ts`
  - `packages/core/test/engine.test.ts`
  - `packages/core/test/serde.test.ts` (includes CyberChef import/export round-trip checks)
  - `packages/plugins-standard/test/standardPlugin.test.ts`
  - `packages/plugins-standard/test/goldenRecipes.test.ts` (golden regression baseline)
- `engine` tests include abort/cancel behavior coverage (`AbortSignal` path).
- E2E: Playwright (roadmap)
- Golden recipes: regression tests against CyberChef-compatible recipe JSON (roadmap)

## Recipe formats

- Native format: `Recipe` (`version: 1`, `steps[]`)
- Native parser validates each step shape (`opId` non-empty string, optional `args` object, step must be object).
- Compatibility helpers in `@cybermasterchef/core`:
  - `importCyberChefRecipe(json)` -> `{ recipe, warnings }`
  - `exportCyberChefRecipe(recipe)` -> CyberChef-compatible JSON
- Import behavior:
  - unsupported CyberChef steps are skipped and reported as warnings
  - import fails if no compatible operations remain (covered by serde tests)
- Workbench import UX:
  - shows warning summary and per-step warning details (`step`, `op`, `reason`)
  - warning `step` values preserve original CyberChef recipe indexes

CLI behavior:
- `packages/cli` accepts native JSON directly.
- If native parsing fails, it falls back to `importCyberChefRecipe`.
- Unsupported CyberChef steps are reported on stderr as warnings.
- `--timeout-ms <n>` bounds execution time in milliseconds.
- `--strict-cyberchef` fails if CyberChef import would skip unsupported steps.
- `--fail-on-warning` fails execution when any import warning is emitted.
- `--quiet-warnings` suppresses warning lines from import fallback.
- `--print-recipe-source` prints whether recipe was parsed as `native` or `cyberchef`.
- `--show-summary` prints execution summary (`outputType`, `traceSteps`, `durationMs`).
- `--summary-json` prints the same summary in JSON format on stderr.
- `--version` prints CLI package version.
- `--show-trace` prints execution trace (step/op/input->output types) on stderr.
- `--trace-json` prints execution trace as JSON on stderr.
- `--trace-limit <n>` limits how many trace rows are printed for trace outputs.
- `--list-ops` prints available operation IDs/names and exits.
- `--list-ops-json` prints full operation metadata as JSON and exits.
- `--list-ops-filter <query>` filters both list outputs by ID/name/description.
- `--input-encoding text|hex|base64` controls how CLI input is parsed before recipe execution.
- `--bytes-output hex|base64|utf8` controls how bytes outputs are rendered on stdout.
- `--help` prints CLI usage and option reference.
- `--max-output-chars <n>` truncates stdout payload for safer automation/logging.

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
- `text.lowercase`
- `text.trim`
- `text.uppercase`
- `text.prepend`
- `text.append`
- `text.replace`
- `text.slice`
- `text.repeat`
- `text.padStart`
- `text.padEnd`
- `hash.sha256`
- `text.reverse`
- conversion tests include invalid `string -> number` failure path.
