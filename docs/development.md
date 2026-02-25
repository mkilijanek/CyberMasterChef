# Development Guide

## Setup

```bash
node --version   # 24+
pnpm --version   # 10+
pnpm install
pnpm dev         # starts workbench at http://localhost:5173
```

## Key commands

```bash
pnpm typecheck   # TypeScript check (Vite is transpile-only!)
pnpm lint        # ESLint across all packages
pnpm test        # Vitest
pnpm test:coverage # Vitest coverage reports + thresholds
pnpm test:parity # parity coverage gate vs reference corpus
pnpm test:e2e    # Playwright critical flows (workbench)
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
- Coverage: `pnpm test:coverage` (V8 provider; reports: text/json-summary/lcov)
- Coverage thresholds:
  - `core`: statements/lines `>= 80%`, branches `>= 70%`, functions `>= 70%`
  - `plugins-standard`: statements `>= 45%`, branches `>= 15%`, functions `>= 30%`, lines `>= 55%`
  - `workbench`: statements/lines `>= 80%`, branches `>= 70%`, functions `>= 95%`
- Current suites:
  - `packages/core/test/conversion.test.ts`
  - `packages/core/test/engine.test.ts`
  - `packages/core/test/serde.test.ts` (includes CyberChef import/export round-trip checks)
  - `packages/plugins-standard/test/standardPlugin.test.ts`
  - `packages/plugins-standard/test/goldenRecipes.test.ts` (expanded parity corpus from references)
- `packages/plugins-standard/test/goldenNegative.test.ts` (malformed input and degradation coverage)
- `packages/plugins-standard/test/semanticRoundtrip.test.ts` (semantic parity for recipe round-trips)
- `packages/plugins-standard/test/determinism.test.ts` (repeatability of outputs and traces)
- `packages/plugins-standard/test/basicPreTriage.test.ts` (baseline forensic pre-triage report)
- `packages/plugins-standard/test/basicTriage.test.ts` (risk score/verdict + mocked capability transparency)
- `packages/plugins-standard/test/compressionOps.test.ts` (gzip/gunzip round-trip + deterministic bytes + invalid input path)
- CLI integration tests run `src/main.ts` via `node --import tsx` to avoid IPC restrictions in sandboxed environments.
- `packages/workbench/src/worker/runtime.test.ts` (worker protocol cancel/timeout/race)
- `packages/workbench/src/worker/poolClient.test.ts` (pool queueing, worker assignment, priority)
- E2E Playwright:
  - `e2e/workbench.spec.ts` (import, run-to-step, share link, timeout config persistence)
  - `e2e/workbench-negative.spec.ts` (invalid import, no-compatible-import, empty-search states)
  - `e2e/workbench-persistence.spec.ts` (recipe/input/toggles/search restore after reload)
  - `e2e/workbench-repro.spec.ts` (run metadata visibility: run id + recipe/input hash)
  - `e2e/workbench-pool-settings.spec.ts` (pool size and max queue persistence)
- CI now enforces Playwright E2E (`pnpm test:e2e`) in `.github/workflows/ci.yml`.
- `engine` tests include abort/cancel behavior coverage (`AbortSignal` path).
- Golden recipes: regression tests against CyberChef-compatible recipe JSON (actively extended).
- Reproducibility helpers in core:
  - `hashRecipe(recipe)` and `hashDataValue(input)` in `packages/core/src/reproducibility.ts`
- Engine trace metadata:
  - per-step `durationMs`
  - run-level `meta` with `startedAt`, `endedAt`, `durationMs`
  - summary fields: `stepDurationTotalMs`, `stepDurationAvgMs`, `slowestStep`

## Roadmap status

- Phase A (parity + tests) is now complete in baseline scope:
  - expanded golden parity recipe chains in `plugins-standard`,
  - worker protocol integration coverage for cancel/timeout/race,
  - Playwright critical flow coverage for import, run-to-step, share-link and timeout persistence.
- Next focus shifts to Phase B (runtime scalability: worker pool + streaming/chunking).
- Phase C (CSIRT/SOC triage pipeline) is planned:
  - server/CLI-first ingest for password-protected ZIP evidence with safe unpacking limits,
  - archive-first artifact inventory (EML/MIME, Office macros, scripts, PE/ELF),
  - IOC extraction + provenance, YARA/YARA-X scanning, optional sandbox hook,
  - export paths for STIX/MISP and reproducibility bundle capture.
- C1 drift gate is enforced in CI via `pnpm c1:check` (regenerates matrix + fails on drift).
- Acceptance checklist is tracked in `docs/phase-a-definition-of-done.md`.

## Recipe formats

- Native format: `Recipe` (`version: 1`, `steps[]`)
- Native parser validates each step shape (`opId` non-empty string, optional `args` object, step must be object).
- Compatibility helpers in `@cybermasterchef/core`:
  - `importCyberChefRecipe(json)` -> `{ recipe, warnings }`
  - `exportCyberChefRecipe(recipe)` -> CyberChef-compatible JSON
- Import behavior:
  - unsupported CyberChef steps are skipped and reported as warnings
  - args mapping covers text transforms for `To Lower case`, `To Upper case`, `Trim`, `Find / Replace`
  - import fails if no compatible operations remain (covered by serde tests)
- Workbench import UX:
  - shows warning summary and per-step warning details (`step`, `op`, `reason`)
  - warning `step` values preserve original CyberChef recipe indexes

CLI behavior:
- `packages/cli` accepts native JSON directly.
- positional input path can be `-` to read from stdin explicitly.
- If native parsing fails, it falls back to `importCyberChefRecipe`.
- Unsupported CyberChef steps are reported on stderr as warnings.
- `--timeout-ms <n>` bounds execution time in milliseconds.
- `--strict-cyberchef` fails if CyberChef import would skip unsupported steps.
- `--dry-run` validates recipe parsing/import and exits before execution.
- `--fail-on-warning` fails execution when any import warning is emitted.
- `--quiet-warnings` suppresses warning lines from import fallback.
- `--print-recipe-source` prints whether recipe was parsed as `native` or `cyberchef`.
- `--show-summary` prints execution summary (`outputType`, `traceSteps`, `durationMs`).
- `--summary-json` prints the same summary in JSON format on stderr.
- `--version` prints CLI package version.
- `--show-trace` prints execution trace (step/op/input->output types) on stderr.
- `--trace-json` prints execution trace as JSON on stderr.
- `--trace-limit <n>` limits how many trace rows are printed for trace outputs.
- `--show-trace-summary` prints aggregate trace timing summary on stderr.
- `--trace-summary-json` prints aggregate trace timing summary as JSON on stderr.
- `--show-repro` prints compact reproducibility metadata on stderr.
- `--repro-json` prints reproducibility bundle as JSON on stderr.
- `--repro-file <path>` writes reproducibility bundle as JSON to file.
- `--batch-input-dir <path>` executes recipe for each file in directory and prints JSON report.
- `--batch-ext <list>` filters batch inputs by extension list.
- `--batch-summary-json` prints aggregate batch metrics JSON on stderr.
- `--batch-report-file <path>` writes full batch JSON report to a file.
- `--batch-output-dir <path>` writes per-input rendered outputs to files.
- `--batch-output-format <fmt>` sets output artifact format (`text|json|jsonl`).
- `--batch-max-files <n>` limits number of processed files.
- `--batch-concurrency <n>` enables bounded parallel batch execution.
- `--batch-skip-empty` skips empty files as successful no-op entries.
- `--batch-fail-empty` treats empty input files as explicit per-file errors.
- `--batch-fail-fast` stops processing on first failed file.
- `--batch-continue-on-error` keeps processing despite per-file failures.
- `--list-ops` prints available operation IDs/names and exits.
- `--list-ops-json` prints full operation metadata as JSON and exits.
- `--list-ops-filter <query>` filters both list outputs by ID/name/description.
- `--input-encoding text|hex|base64` controls how CLI input is parsed before recipe execution.
- `--bytes-output hex|base64|utf8` controls how bytes outputs are rendered on stdout.
- `--hex-uppercase` renders hex byte output using uppercase letters.
- `--json-indent <n>` controls indentation for JSON output rendering.
- `--output-file <path>` writes rendered output to a file.
- `--fail-empty-output` fails if rendered output is empty.
- `--no-newline` disables automatic trailing newline in output.
- `--help` prints CLI usage and option reference.
- `--max-output-chars <n>` truncates stdout payload for safer automation/logging.

## Phase acceptance

- Phase A checklist: `docs/phase-a-definition-of-done.md`
- Phase B checklist: `docs/phase-b-definition-of-done.md`

## C1 domain matrix

- Generate operation-domain matrix from CyberChef reference list:
  - `pnpm c1:domain-matrix`
- Artifacts:
  - `docs/parity/c1-operation-domain-matrix.json`
  - `docs/parity/c1-operation-domain-matrix.csv`
  - `docs/parity/c1-operation-domain-summary.md`

## C2 domain implementation plan

Wave 1 implemented so far:
- `date.isoToUnix`
- `date.unixToIso`
- `format.jsonMinify`
- `format.jsonBeautify`
- `forensic.extractStrings`
- Wave 5 kickoff: `network.extractIPs`
- Wave 5 expansion: `network.extractUrls`
- Wave 5 safe-sharing: `network.defangUrls`
- Wave 5 reversal: `network.fangUrls`
- Wave 6 date-time: `date.unixToWindowsFiletime`
- Wave 6 date-time: `date.windowsFiletimeToUnix`
- Wave 6 date-time: `date.parseObjectIdTimestamp`
- Wave 6 date-time: `date.parseUnixFilePermissions`
- Wave 7 forensic: `forensic.extractEmails`
- Wave 7 forensic: `forensic.extractDomains`
- Wave 8 data-format: `format.jsonSortKeys`
- Wave 8 data-format: `format.jsonExtractKeys`
- Wave 9 forensic hash: `forensic.extractMd5`
- Wave 9 forensic hash: `forensic.extractSha256`
- Wave 10 date-time parsing: `date.extractUnixTimestamps`
- Wave 10 date-time parsing: `date.extractIsoTimestamps`
- Wave 11 network: `network.extractIPv6`
- Wave 11 network: `network.defangIPs`
- Wave 11 network: `network.fangIPs`
- Wave 12 forensic hash: `forensic.extractSha1`
- Wave 12 forensic hash: `forensic.extractSha512`
- Wave 13 forensic token: `forensic.extractJwt`
- Wave 13 forensic vuln IOC: `forensic.extractCves`
- Wave 20 data formats: `format.csvToJson`
- Wave 20 data formats: `format.jsonToCsv`
- Wave 20 data formats: `format.yamlToJson`
- Wave 20 data formats: `format.jsonToYaml`
- Wave 20 data formats: `format.cborEncode`
- Wave 20 data formats: `format.cborDecode`
- Wave 20 data formats: `format.bsonEncode`
- Wave 20 data formats: `format.bsonDecode`
- Wave 20 data formats: `format.avroEncode`
- Wave 20 data formats: `format.avroDecode`
- Wave 20 compression: `compression.bzip2`
- Wave 20 compression: `compression.bzip2Decompress`
- Wave 20 compression: `compression.zip`
- Wave 20 compression: `compression.unzip`
- Wave 20 compression: `compression.tar`
- Wave 20 compression: `compression.untar`
- Wave 20 image: `image.addText`
- Wave 20 image: `image.blur`
- Wave 20 image: `image.contain`
- Wave 20 image: `image.metadata`
- Wave 21 hash: `hash.md5`
- Wave 21 hash: `hash.sha1`
- Wave 21 hash: `hash.sha384`
- Wave 21 hash: `hash.sha512`
- Wave 21 hash: `hash.sha3_256`
- Wave 21 hash: `hash.sha3_512`
- Wave 21 hash: `hash.blake2b`
- Wave 21 hash: `hash.blake2s`
- Wave 21 crypto: `crypto.hmacSha1`
- Wave 21 crypto: `crypto.hmacSha256`
- Wave 21 crypto: `crypto.hmacSha512`
- Wave 21 crypto: `crypto.pbkdf2`
- Wave 21 encodings: `codec.toOctal`
- Wave 21 encodings: `codec.fromOctal`
- Wave 21 encodings: `codec.toHexContent`
- Wave 21 encodings: `codec.fromHexContent`
- Wave 21 date: `date.parseDateTime`
- Wave 21 date: `date.dateTimeDelta`
- Wave 21 date: `date.translateDateTimeFormat`
- Wave 21 network: `network.dechunkHttpResponse`
- Wave 14 data-format: `format.jsonArrayLength`
- Wave 14 data-format: `format.jsonStringValues`
- Wave 14 data-format: `format.jsonNumberValues`
- Wave 15 date-time normalization: `date.isoToDateOnly`
- Wave 15 date-time classification: `date.isoWeekday`
- Wave 16 network metadata: `network.extractPorts`
- Wave 16 host IOC: `forensic.extractRegistryKeys`
- Wave 17 baseline triage: `forensic.basicPreTriage`
- Wave 17 baseline triage: `forensic.basicTriage`
- Wave 18 compression baseline: `compression.gzip`
- Wave 18 compression baseline: `compression.gunzip`
- Wave 19 encodings: `codec.toBase58`, `codec.fromBase58`
- Wave 19 encodings: `codec.toCharcode`, `codec.fromCharcode`
- Wave 19 encodings: `codec.toDecimal`, `codec.fromDecimal`
- Wave 19 crypto: `hash.adler32`, `hash.analyseHash`
- Wave 19 crypto: `crypto.atbashCipher`, `crypto.affineCipherEncode`, `crypto.affineCipherDecode`
- Wave 19 crypto: `crypto.a1z26CipherEncode`, `crypto.a1z26CipherDecode`
- Wave 19 crypto: `crypto.baconCipherEncode`, `crypto.baconCipherDecode`
- Wave 19 crypto: `crypto.bcryptParse`
- Wave 19 forensic helpers: `forensic.analyseUuid`, `forensic.chiSquare`, `forensic.detectFileType`, `forensic.elfInfo`
- golden parity case for date round-trip
- golden parity case for JSON format round-trip

- Generate domain implementation gap/coverage plan:
  - `pnpm c2:plan`
- Artifacts:
  - `docs/parity/c2-domain-implementation-plan.json`
  - `docs/parity/c2-domain-implementation-plan.md`

## C3 compatibility contracts

- Generate operation compatibility contract catalog:
  - `pnpm c3:contracts`
- Artifacts:
  - `docs/parity/c3-operation-compatibility-contracts.json`
  - `docs/parity/c3-operation-compatibility-contracts.md`
  - `docs/parity/c3-contract-schema.md`

## Error taxonomy (JSON ops)

- For invalid JSON payloads, JSON-format operations should throw `OperationJsonParseError`.
- `OperationJsonParseError` uses `code: JSON_PARSE_ERROR` and preserves the original parse message in `detail`.
- The engine passes through `EngineError` instances without wrapping them, preserving error codes.

## Compression compatibility

- `compression.gzip` and `compression.gunzip` use `CompressionStream`/`DecompressionStream` when available.
- Node fallback uses `node:zlib`; gzip is invoked with `mtime: 0` to keep deterministic output.

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
- conversion tests include invalid `string -> number` failure path.
