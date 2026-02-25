# C2 Execution Board

Updated: 2026-02-25

## Objective

Translate C2 domain plan into executable implementation waves with measurable outcomes.

## Wave plan

1. Wave 1 (current): forensic-malware-helper + date-time baselines.
2. Wave 2: compression-archive baselines.
3. Wave 3: data-formats baselines.
4. Wave 4: crypto-hash-kdf targeted expansion.

## Wave 1 backlog

- [x] `forensic.extractStrings` operation (bytes/string input).
- [x] `date.isoToUnix` operation.
- [x] `date.unixToIso` operation.
- [x] Unit tests for all Wave 1 operations.
- [x] Golden parity cases for new operations.

## Wave 2 backlog

- [x] `compression.gzip` and `compression.gunzip` baseline.
- [x] Browser/Node compatibility strategy for compression APIs.
- [x] Unit + golden tests.

## Wave 3 backlog

- [x] `format.jsonMinify` and `format.jsonBeautify`.
- [x] Structured error taxonomy for invalid JSON payloads.
- [x] Unit + golden tests.

## Wave 5 backlog

- [x] `network.extractIPs` baseline IOC operation.
- [x] `network.extractUrls` baseline IOC operation.
- [x] `network.defangUrls` safe-sharing operation.
- [x] `network.fangUrls` reversal operation.

## Wave 6 backlog

- [x] `date.unixToWindowsFiletime` operation.
- [x] `date.windowsFiletimeToUnix` operation.
- [x] `date.parseObjectIdTimestamp` operation.
- [x] `date.parseUnixFilePermissions` operation.

## Wave 7 backlog

- [x] `forensic.extractEmails` IOC operation.
- [x] `forensic.extractDomains` IOC operation.

## Wave 8 backlog

- [x] `format.jsonSortKeys` canonicalization operation.
- [x] `format.jsonExtractKeys` inspection operation.

## Wave 9 backlog

- [x] `forensic.extractMd5` hash IOC operation.
- [x] `forensic.extractSha256` hash IOC operation.

## Wave 10 backlog

- [x] `date.extractUnixTimestamps` telemetry parsing operation.
- [x] `date.extractIsoTimestamps` telemetry parsing operation.

## Wave 11 backlog

- [x] `network.extractIPv6` IOC operation.
- [x] `network.defangIPs` safe-sharing operation.
- [x] `network.fangIPs` reversal operation.

## Wave 12 backlog

- [x] `forensic.extractSha1` hash IOC operation.
- [x] `forensic.extractSha512` hash IOC operation.

## Wave 13 backlog

- [x] `forensic.extractJwt` token IOC operation.
- [x] `forensic.extractCves` vulnerability IOC operation.

## Wave 14 backlog

- [x] `format.jsonArrayLength` inspection operation.
- [x] `format.jsonStringValues` extraction operation.
- [x] `format.jsonNumberValues` extraction operation.

## Wave 15 backlog

- [x] `date.isoToDateOnly` normalization operation.
- [x] `date.isoWeekday` classification operation.

## Wave 16 backlog

- [x] `network.extractPorts` network metadata operation.
- [x] `forensic.extractRegistryKeys` host IOC operation.

## Wave 18 backlog

- [x] `compression.gzip` compression baseline operation.
- [x] `compression.gunzip` decompression baseline operation.

## Wave 19 backlog

- [x] `codec.toBase58` and `codec.fromBase58` operations.
- [x] `codec.toCharcode` and `codec.fromCharcode` operations.
- [x] `codec.toDecimal` and `codec.fromDecimal` operations.
- [x] `hash.adler32` checksum operation.
- [x] `hash.analyseHash` hash classification operation.
- [x] `crypto.atbashCipher` substitution cipher operation.
- [x] `crypto.affineCipherEncode` and `crypto.affineCipherDecode` operations.
- [x] `crypto.a1z26CipherEncode` and `crypto.a1z26CipherDecode` operations.
- [x] `crypto.baconCipherEncode` and `crypto.baconCipherDecode` operations.
- [x] `crypto.bcryptParse` parsing operation.
- [x] `forensic.analyseUuid` helper operation.
- [x] `forensic.chiSquare` statistic operation.
- [x] `forensic.detectFileType` magic bytes helper.
- [x] `forensic.elfInfo` header inspection helper.

## Wave 20 backlog

- [x] `format.csvToJson` and `format.jsonToCsv` operations.
- [x] `format.yamlToJson` and `format.jsonToYaml` operations.
- [x] `format.cborEncode` and `format.cborDecode` operations.
- [x] `format.bsonEncode` and `format.bsonDecode` operations.
- [x] `format.avroEncode` and `format.avroDecode` operations.
- [x] `compression.bzip2` and `compression.bzip2Decompress` operations.
- [x] `compression.zip` and `compression.unzip` operations.
- [x] `compression.tar` and `compression.untar` operations.
- [x] `image.addText` overlay operation.
- [x] `image.blur` filter operation.
- [x] `image.contain` resize operation.
- [x] `image.metadata` inspection operation.

## Wave 21 backlog

- [x] `hash.md5` operation.
- [x] `hash.sha1` operation.
- [x] `hash.sha384` operation.
- [x] `hash.sha512` operation.
- [x] `hash.sha3_256` and `hash.sha3_512` operations.
- [x] `hash.blake2b` and `hash.blake2s` operations.
- [x] `crypto.hmacSha1`, `crypto.hmacSha256`, `crypto.hmacSha512` operations.
- [x] `crypto.pbkdf2` operation.
- [x] `codec.toOctal` and `codec.fromOctal` operations.
- [x] `codec.toHexContent` and `codec.fromHexContent` operations.
- [x] `date.parseDateTime` operation.
- [x] `date.dateTimeDelta` operation.
- [x] `date.translateDateTimeFormat` operation.
- [x] `network.dechunkHttpResponse` operation.

## Wave 22 backlog

- [x] `format.amfEncode` and `format.amfDecode` operations.
- [x] `format.avroToJson` operation.
- [x] `format.bsonSerialise` operation.
- [x] `format.toTable` operation.
- [x] `format.toHtmlEntity` and `format.fromHtmlEntity` operations.
- [x] `format.toMessagePack` and `format.fromMessagePack` operations.
- [x] `format.toQuotedPrintable` and `format.fromQuotedPrintable` operations.
- [x] `format.htmlToText` operation.
- [x] `format.jsonataQuery` operation.
- [x] `format.xmlBeautify` and `format.xmlMinify` operations.
- [x] `format.protobufEncode` and `format.protobufDecode` operations.
- [x] `format.stripHtmlTags` operation.
- [x] `format.toHexdump` and `format.fromHexdump` operations.
- [x] `image.convertFormat` operation.
- [x] `image.cover` operation.
- [x] `image.crop` operation.
- [x] `image.dither` operation.
- [x] `image.extractExif` operation.
- [x] `image.flip` operation.
- [x] `image.generate` operation.
- [x] `image.generateQrCode` operation.
- [x] `image.brightnessContrast` operation.
- [x] `image.filter` operation.
- [x] `image.hsl` operation.
- [x] `image.opacity` operation.
- [x] `image.invert` operation.
- [x] `image.normalise` operation.
- [x] `image.removeExif` operation.
- [x] `image.render` operation.
- [x] `image.resize` operation.
- [x] `image.rotate` operation.
- [x] `image.sharpen` operation.

## Queue extension

- [x] Queue tasks `1-20` completed on `dev`.
- [x] Forensic Triage (CSIRT/SOC): baseline modules.
  - implemented as built-in modules: `forensic.basicPreTriage` and `forensic.basicTriage`
  - includes IOC extraction, SHA-family hashes (where WebCrypto supports), binary entropy segments and PE section metadata
  - placeholders (`null`) kept for `imphash`, `TLSH`, `ssdeep` in this baseline
  - triage report includes explicit `mockedCapabilities` list for still-unimplemented production integrations

## Quality gates

- New operation must include:
  - contract entry (C3 artifacts regenerated)
  - deterministic behavior declaration
  - test coverage (unit and/or golden)
- `pnpm lint && pnpm typecheck && pnpm test` must pass before push.
