# Architecture

## High-level

```
UI (React) ──postMessage──► Web Worker (sandbox)
                                │
                          Core Engine
                          Recipe executor + converters
                                │
                          Operation Registry
                                │
                          Plugin packages (ops-*)
```

## Packages

| Package | Role |
|---|---|
| `@cybermasterchef/core` | Recipe engine, types, converters, registry |
| `@cybermasterchef/plugins-standard` | Built-in operations (Base64/Hex/Binary/URL codecs, SHA-256, Reverse) |
| `@cybermasterchef/workbench` | React UI + Web Worker sandbox |
| `@cybermasterchef/cli` | Node.js CLI runner |

## Data model

`DataValue` is a discriminated union: `string | bytes | json | number`.
The engine automatically coerces between types using the conversion table in `packages/core/src/conversion.ts`.

## Sandboxing

All recipe execution happens inside a Web Worker:
- No DOM access from operations
- Network APIs (`fetch`, `XHR`, `WebSocket`) blocked at runtime — defense-in-depth on top of CSP
- Transferable `ArrayBuffer` for bytes output (no copy)
- Hard abort via `AbortSignal`
- Cancellable runs via worker `cancel` message
- Per-run timeout (default 10s in workbench, user-configurable) wired from UI -> client -> worker -> engine signal

## Workbench UX (current)

- Manual run + optional auto-bake mode
- Cancel button for in-flight execution
- Run-to-step action for partial pipeline execution
- Recipe and input persisted in local storage
- Shareable deep links via URL hash (`#state=` payload)
- Recipe import/export:
  - native CyberMasterChef JSON (`version: 1`)
  - CyberChef-compatible JSON adapter with warnings for unsupported operations
- Catalog-driven operation discovery with argument editing

## Security: CSP for production hosting

```
default-src 'none'
script-src 'self'
style-src 'self'
img-src 'self' data:
worker-src 'self'
connect-src 'none'
base-uri 'none'
object-src 'none'
frame-ancestors 'none'
```

## WASM roadmap

High-priority candidates for WASM (Rust) — CPU-intensive ops:

**Compression** (23 ops): Gzip, Bzip2, LZ4, LZMA, LZNT1, LZString, RawDeflate, Zip, Unzip, Tar, Untar, …

**KDF** (7 ops): Argon2, Scrypt, Bcrypt, PBKDF2, …

**Binary parsers** (13 ops): ASN.1, X.509, Protobuf, TLS, IPv4 header, …

Decision: profile first, WASM only for measured bottlenecks.

## Worker pool (roadmap)

For operations with high concurrency demand:
- Pool of N workers (navigator.hardwareConcurrency / 2)
- Priority queue + AbortSignal cancellation
- Streaming pipeline: chunk size 1–8 MiB for large inputs
