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

- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
- 
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
  - recipe step duplication in editor
  - auto-bake mode (debounced re-run on changes)
  - cancel in-flight execution from the UI
  - keyboard cancel shortcut (`Escape`) while execution is running
  - keyboard run shortcut (`Ctrl+Enter` / `Cmd+Enter`)
  - keyboard catalog-focus shortcut (`Ctrl+K` / `Cmd+K`)
  - keyboard trace-filter-focus shortcut (`Ctrl+Shift+K` / `Cmd+Shift+K`)
  - per-run sandbox timeout protection with configurable timeout (default: 10s)
  - run recipe up to a selected step (pipeline debugging)
  - rerun to selected step directly from trace list
  - trace filtering by operation ID and input/output types
  - quick clear action for trace filter
  - visible counter for filtered vs total trace steps
  - deep-link sharing (`#state=` hash with recipe + input)
  - quick input/output copy actions in UI
  - quick trace copy action in UI
  - quick filtered-trace copy action in UI
  - quick recipe JSON copy action in UI
  - clear-trace action without resetting recipe/input
  - clear-trace also clears active trace filter
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
  - `text.length`
  - `text.wordCount`
  - `text.lineCount`
  - `text.firstLine`
  - `text.lastLine`
  - `text.normalizeWhitespace`
  - `text.removeBlankLines`
  - `text.startsWith`
  - `text.replace`
  - `text.slice`
  - `text.repeat`
  - `text.padStart`
  - `text.padEnd`
  - `text.trimStart`
  - `text.trimEnd`
  - `text.trimLines`
  - `text.toSnakeCase`
  - `text.toKebabCase`
  - `text.toCamelCase`
  - `text.toPascalCase`
  - `text.compactLines`
  - `text.reverseWords`
  - `text.sortWords`
  - `text.uniqueWords`
  - `text.removeVowels`
  - `text.keepVowels`
  - `text.normalizeNewlines`
  - `text.swapCase`
  - `text.removeSpaces`
  - `text.keepDigits`
  - `text.removeDigits`
  - `text.keepLetters`
  - `text.removeLetters`
  - `text.keepAlnum`
  - `text.removeAlnum`
  - `text.toTitleCase`
  - `text.reverseLines`
  - `text.sortLines`
  - `text.uniqueLines`
  - `text.endsWith`
  - `text.includes`
  - `text.lowerFirst`
  - `text.upperFirst`
  - `text.removePunctuation`
  - `text.keepPunctuation`
  - `text.collapseDashes`
  - `text.collapseUnderscores`
  - `text.removeTabs`
  - `text.tabsToSpaces`
  - `text.spacesToTabs`
  - `text.trimCommas`
  - `text.trimQuotes`
  - `text.surroundBrackets`
  - `text.surroundQuotes`
  - `text.rot13`
  - `text.maskDigits`
  - `text.removeNonAscii`
  - `text.keepNonAscii`
  - `text.reverseCharsInWords`
  - `text.wordsToLines`
  - `text.linesToWords`
  - `text.linesToCsv`
  - `text.csvToLines`
  - `text.stripAccents`
  - `text.removeDoubleQuotes`
  - `text.removeSingleQuotes`
  - `text.replaceNewlinesWithSpace`
  - `text.replaceSpacesWithNewlines`
  - `text.tabsToSingleSpace`
  - `text.countUppercase`
  - `text.countLowercase`
  - `text.countAscii`
  - `text.countNonAscii`
  - `text.countNonEmptyLines`
  - `text.firstWord`
  - `text.lastWord`
  - `text.removeCommas`
  - `text.removeDots`
  - `text.removeSemicolons`
  - `text.keepHexChars`
  - `text.removeHexChars`
  - `text.onlyPrintableAscii`
  - `text.removeControlChars`
  - `text.collapseMultipleNewlines`
  - `text.trimLeadingDots`
  - `text.trimTrailingDots`
  - `text.linesNumbered`
  - `text.removeColons`
  - `text.removeSlashes`
  - `text.removePipes`
  - `text.removeBackslashes`
  - `text.removeAsterisks`
  - `text.removeHashes`
  - `text.removeAtSigns`
  - `text.removeDollarSigns`
  - `text.removePercents`
  - `text.removeAmpersands`
  - `text.removePluses`
  - `text.removeEquals`
  - `text.removeTildes`
  - `text.removeCarets`
  - `text.removeBackticks`
  - `text.removeQuestionMarks`
  - `text.removeExclamations`
  - `text.removeParentheses`
  - `text.removeBrackets`
  - `text.removeBraces`
  - `text.removeAngles`
  - `text.removeDoubleSpaces`
  - `text.linesTrimRight`
  - `text.linesTrimLeft`
  - `text.removeDigitsAndSpaces`
  - `text.keepDigitsAndDots`
  - `text.removeEmojis`
  - `text.removeUnderscores`
  - `text.removeHyphens`
  - `text.removeSpacesAndTabs`
  - `text.keepWhitespace`
  - `text.countTabs`
  - `text.countSpaces`
  - `text.countCommas`
  - `text.countDots`
  - `text.countColons`
  - `text.countSemicolons`
  - `text.countSlashes`
  - `text.countBackslashes`
  - `text.countPluses`
  - `text.countDashes`
  - `text.countQuestionMarks`
  - `text.countExclamations`
  - `text.countBrackets`
  - `text.countParentheses`
  - `text.countQuotes`
  - `text.countUnderscores`
  - `text.onlyLettersAndSpaces`
  - `text.onlyAlnumAndSpaces`
  - `text.removeCurrencySymbols`
  - `text.removeMathSymbols`
  - `text.normalizeCommas`
  - `hash.sha256`
  - `text.reverse`
- CLI compatibility:
  - accepts native recipe JSON
  - accepts `-` as input path to force reading payload from stdin
  - falls back to CyberChef recipe import and prints warnings for unsupported steps
  - supports `--timeout-ms` for bounded execution and `--strict-cyberchef` for strict import mode
  - supports `--dry-run` to validate recipe import/shape without running steps
  - supports `--fail-on-warning` to make imports with warnings fail in CI pipelines
  - supports `--quiet-warnings` to keep stderr clean in scripted runs
  - supports `--print-recipe-source` to audit parser path in automation
  - supports `--show-summary` for lightweight runtime diagnostics in CLI
  - supports `--summary-json` for machine-readable runtime diagnostics in CLI
  - supports `--show-trace` and `--trace-json` for pipeline debugging in terminal
  - supports `--trace-limit` to cap trace verbosity in terminal/CI logs
  - supports `--list-ops` to inspect currently registered operations
  - supports `--list-ops-json` for machine-readable operation discovery
  - supports `--list-ops-filter` to narrow operation listings in both list modes
  - supports `--input-encoding text|hex|base64` for binary-oriented CLI runs
  - supports `--bytes-output hex|base64|utf8` to choose stdout format for byte outputs
  - supports `--hex-uppercase` for uppercase hex rendering
  - supports `--json-indent` for JSON output formatting control
  - supports `--output-file` to write rendered output directly to a file
  - supports `--fail-empty-output` to enforce non-empty pipeline results
  - supports `--no-newline` for exact output framing in pipelines
  - supports `--max-output-chars` for bounded stdout in scripts/CI
- Quality baseline:
  - golden parity corpus covering representative CyberChef-style chains in `packages/plugins-standard/test/goldenRecipes.test.ts`
  - golden negative/degradation suite for malformed inputs in `packages/plugins-standard/test/goldenNegative.test.ts`
  - worker protocol integration suite for cancel/timeout/race in `packages/workbench/src/worker/runtime.test.ts`
  - Playwright suite for import/run-to-step/share-link/timeout UX in `e2e/workbench.spec.ts`
  - extended CyberChef args mapping coverage (`lower/upper/trim/replace`) in `packages/core/test/serde.test.ts`

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
pnpm test:parity # parity coverage gate for golden recipe corpus
pnpm test:e2e   # Playwright critical flows
pnpm build      # full build all packages
pnpm ci         # lint + typecheck + test + build
```

Phase A status:
- Completed baseline parity-and-tests scope (golden parity recipes, worker protocol integration tests, Playwright critical flows).
- Next roadmap focus: runtime scalability (worker pool and streaming/chunking).

## Security

- Operations run inside a Web Worker (no DOM access)
- Network APIs blocked in worker (defense-in-depth; CSP is the primary control)
- Production hosting: HTTPS + strict CSP (`connect-src 'none'`, `worker-src 'self'`, etc.)
- Supply-chain: pnpm allowlist build scripts + Dependabot + CodeQL

See [SECURITY.md](SECURITY.md) and [docs/architecture.md](docs/architecture.md).

## License

BSD 3-Clause — see [LICENSE](LICENSE).
