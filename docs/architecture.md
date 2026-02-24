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
| `@cybermasterchef/plugins-standard` | Built-in operations (Base64, Hex, SHA-256, …) |
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
- Hard abort via `AbortSignal` + worker termination for timeouts

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
