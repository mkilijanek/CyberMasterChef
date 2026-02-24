# CyberMasterChef

A clean-slate successor to CyberChef: modular, maintainable, and secure data-operation workbench.

## Architecture

```
packages/
  core/               — recipe engine, types, converters, registry
  plugins-standard/   — built-in operations (Base64, Hex, Binary, URL, SHA-256, Reverse)
  workbench/          — React UI + Web Worker sandbox + i18n (PL/EN)
  cli/                — Node.js recipe runner (stdin/file → stdout)
```

### Key design decisions

- **TypeScript strict** throughout — no `any`, full type safety
- **pnpm workspaces** — deduplication, supply-chain controls
- **Plugin model** — operations are isolated packages; `core` has no op-specific code
- **Sandbox execution** — all recipes run inside a Web Worker; network APIs blocked at runtime + CSP
- **i18n baseline** — PL/EN from the start (i18next + react-i18next)
- **a11y baseline** — WCAG 2.2 intent; keyboard navigation, proper ARIA roles

### Roadmap toward CyberChef parity (465 ops)

Operations are grouped by package priority:

| Package | Operations | WASM? |
|---|---|---|
| `ops-codec` | Base64/32/58/85, Hex, URL, Binary, … | No |
| `ops-hash` | SHA-2/3, HMAC, checksums | WebCrypto first |
| `ops-crypto-symmetric` | AES, ChaCha, XOR, … | WebCrypto first |
| `ops-compression` | Gzip, Bzip2, LZ4, LZMA, Zip, … | **WASM (Rust)** — High priority |
| `ops-kdf` | Argon2, Scrypt, PBKDF2, Bcrypt | **WASM** — CPU-intensive |
| `ops-crypto-pk` | RSA, ECDSA, PGP, X.509 | WebCrypto + WASM for parsing |
| `ops-parsing` | ASN.1, Protobuf, TLS, IPv4/6, … | WASM for binary parsers |
| `ops-forensics` | EXIF, File magic, Strings, YARA, … | Low — JS sufficient |
| `ops-flow` | Fork, Jump, Subsection, Register | No |
| `ops-magic` | Auto-detect encoding layers | No (heuristics in TS) |

**WASM high-priority candidates** (31 ops): all compression/decompression + KDF (Argon2, Scrypt, Bcrypt, PBKDF2).

## Current functionality

- Core recipe engine with typed coercion (`string`, `bytes`, `json`, `number`)
- Worker-based sandbox execution for all operations
- Workbench features:
  - operation catalog with search by name/description/ID and visible operation IDs in list
  - explicit empty-state message when search query has no matching operations
  - quick clear-search action in operation catalog
  - recipe editing (add/reorder/remove + arg forms)
  - auto-bake mode (debounced re-run on changes)
  - cancel in-flight execution from the UI
  - keyboard cancel shortcut (`Escape`) while execution is running
  - keyboard run shortcut (`Ctrl+Enter` / `Cmd+Enter`)
  - per-run sandbox timeout protection with configurable timeout (default: 10s)
  - run recipe up to a selected step (pipeline debugging)
  - rerun to selected step directly from trace list
  - deep-link sharing (`#state=` hash with recipe + input)
  - quick input/output copy actions in UI
  - quick trace copy action in UI
  - clear-trace action without resetting recipe/input
  - workspace reset action (recipe + IO + trace)
  - recipe import/export (native JSON and CyberChef-compatible JSON)
  - detailed import warnings for skipped CyberChef steps (step index + operation + reason)
  - local persistence for recipe, input, auto-bake preference and operation search query
- Built-in operations (`@cybermasterchef/plugins-standard`):
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
  - `hash.sha256`
  - `text.reverse`
- CLI compatibility:
  - accepts native recipe JSON
  - falls back to CyberChef recipe import and prints warnings for unsupported steps
  - supports `--timeout-ms` for bounded execution and `--strict-cyberchef` for strict import mode
  - supports `--fail-on-warning` to make imports with warnings fail in CI pipelines
  - supports `--quiet-warnings` to keep stderr clean in scripted runs
  - supports `--print-recipe-source` to audit parser path in automation
  - supports `--show-summary` for lightweight runtime diagnostics in CLI
  - supports `--show-trace` and `--trace-json` for pipeline debugging in terminal
  - supports `--list-ops` to inspect currently registered operations
  - supports `--input-encoding text|hex|base64` for binary-oriented CLI runs
  - supports `--bytes-output hex|base64|utf8` to choose stdout format for byte outputs
  - supports `--max-output-chars` for bounded stdout in scripts/CI
- Quality baseline:
  - golden recipe regression suite for core operation chains in `packages/plugins-standard/test/goldenRecipes.test.ts`

## Getting started

Requirements: Node 20+ and pnpm.

```bash
pnpm install
pnpm dev        # starts workbench at http://localhost:5173
```

## Development

```bash
pnpm typecheck  # TypeScript check (separate from Vite build)
pnpm lint       # ESLint
pnpm test       # Vitest
pnpm build      # full build all packages
pnpm ci         # lint + typecheck + test + build
```

## Security

- Operations run inside a Web Worker (no DOM access)
- Network APIs blocked in worker (defense-in-depth; CSP is the primary control)
- Production hosting: HTTPS + strict CSP (`connect-src 'none'`, `worker-src 'self'`, etc.)
- Supply-chain: pnpm allowlist build scripts + Dependabot + CodeQL

See [SECURITY.md](SECURITY.md) and [docs/architecture.md](docs/architecture.md).

## License

BSD 3-Clause — see [LICENSE](LICENSE).
