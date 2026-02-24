# C2 Domain Implementation Plan

Generated: 2026-02-24T22:15:37.416Z
Implemented operations in repo: 154

## Priority order

- P1: date-time (coverage 0%, missing ~12)
- P2: forensic-malware-helper (coverage 0%, missing ~6)
- P3: crypto-hash-kdf (coverage 6.19%, missing ~91)
- P4: data-formats (coverage 12.5%, missing ~14)

## Domain summary

### encodings-codecs
- Description: Encodings, binary/text codecs, canonical representation transforms.
- CyberChef total: 48
- Implemented total: 15
- Estimated missing: 33
- Coverage: 31.25%
- Candidate operations (first 20):
  - Alphabet (FromBase58.mjs) [medium]
  - Alphabet (ToBase58.mjs) [medium]
  - Convert (ToHexContent.mjs) [medium]
  - Delimiter (FromBinary.mjs) [medium]
  - Delimiter (FromDecimal.mjs) [medium]
  - Delimiter (FromOctal.mjs) [medium]
  - Delimiter (ToBinary.mjs) [medium]
  - Delimiter (ToDecimal.mjs) [medium]
  - Delimiter (ToOctal.mjs) [medium]
  - DropNthBytes (DropNthBytes.mjs) [medium]

### crypto-hash-kdf
- Description: Cryptographic transforms, digests, MAC/KDF and cipher operations.
- CyberChef total: 97
- Implemented total: 6
- Estimated missing: 91
- Coverage: 6.19%
- Candidate operations (first 20):
  - a (AffineCipherDecode.mjs) [high]
  - a (AffineCipherEncode.mjs) [high]
  - A1Z26CipherDecode (A1Z26CipherDecode.mjs) [high]
  - A1Z26CipherEncode (A1Z26CipherEncode.mjs) [high]
  - Adler32Checksum (Adler32Checksum.mjs) [high]
  - Alphabet (BaconCipherDecode.mjs) [high]
  - Alphabet (BaconCipherEncode.mjs) [high]
  - AnalyseHash (AnalyseHash.mjs) [high]
  - AtbashCipher (AtbashCipher.mjs) [high]
  - BcryptParse (BcryptParse.mjs) [high]

### compression-archive
- Description: Compression/decompression and archive container operations.
- CyberChef total: 23
- Implemented total: 3
- Estimated missing: 20
- Coverage: 13.04%
- Candidate operations (first 20):
  - Bzip2Compress (Bzip2Compress.mjs) [high]
  - Bzip2Decompress (Bzip2Decompress.mjs) [high]
  - Filename (Tar.mjs) [high]
  - Gunzip (Gunzip.mjs) [high]
  - Gzip (Gzip.mjs) [high]
  - Input units (ConvertArea.mjs) [high]
  - LZ4Compress (LZ4Compress.mjs) [high]
  - LZ4Decompress (LZ4Decompress.mjs) [high]
  - LZMACompress (LZMACompress.mjs) [high]
  - LZMADecompress (LZMADecompress.mjs) [high]

### date-time
- Description: Date/time parsing, formatting, conversion and timestamp operations.
- CyberChef total: 12
- Implemented total: 0
- Estimated missing: 12
- Coverage: 0%
- Candidate operations (first 20):
  - Built in formats (DateTimeDelta.mjs) [high]
  - Built in formats (ParseDateTime.mjs) [high]
  - Built in formats (TranslateDateTimeFormat.mjs) [high]
  - Display total (ExtractDates.mjs) [high]
  - GetTime (GetTime.mjs) [high]
  - Input units (UNIXTimestampToWindowsFiletime.mjs) [high]
  - Output units (WindowsFiletimeToUNIXTimestamp.mjs) [high]
  - ParseObjectIDTimestamp (ParseObjectIDTimestamp.mjs) [high]
  - ParseUNIXFilePermissions (ParseUNIXFilePermissions.mjs) [high]
  - Time (ms) (Sleep.mjs) [high]

### data-formats
- Description: Structured formats (JSON/XML/CSV/YAML/TOML/HTML and format conversion).
- CyberChef total: 16
- Implemented total: 2
- Estimated missing: 14
- Coverage: 12.5%
- Candidate operations (first 20):
  - AvroToJSON (AvroToJSON.mjs) [high]
  - Convert all characters (ToHTMLEntity.mjs) [high]
  - CSVToJSON (CSVToJSON.mjs) [high]
  - FromHTMLEntity (FromHTMLEntity.mjs) [high]
  - HTMLToText (HTMLToText.mjs) [high]
  - Indent string (XMLBeautify.mjs) [high]
  - JsonataQuery (Jsonata.mjs) [high]
  - JSONBeautify (JSONBeautify.mjs) [high]
  - JSONMinify (JSONMinify.mjs) [high]
  - JSONToCSV (JSONToCSV.mjs) [high]

### regex-text-advanced
- Description: Regex and advanced text analysis/normalization operations.
- CyberChef total: 34
- Implemented total: 47
- Estimated missing: 0
- Coverage: 138.24%
- Candidate operations (first 20):
  - Attempt to be context aware (ToCamelCase.mjs) [medium]
  - Attempt to be context aware (ToKebabCase.mjs) [medium]
  - Attempt to be context aware (ToSnakeCase.mjs) [medium]
  - Built in regexes (RegularExpression.mjs) [medium]
  - By (Reverse.mjs) [medium]
  - Delimiter (Sort.mjs) [medium]
  - ExtractDomains (ExtractDomains.mjs) [medium]
  - ExtractEmailAddresses (ExtractEmailAddresses.mjs) [medium]
  - ExtractEXIF (ExtractEXIF.mjs) [medium]
  - ExtractFilePaths (ExtractFilePaths.mjs) [medium]

### network-protocol-parsers
- Description: Protocol/header/parsing operations for network/web payloads.
- CyberChef total: 47
- Implemented total: 9
- Estimated missing: 38
- Coverage: 19.15%
- Candidate operations (first 20):
  - BlurImage (BlurImage.mjs) [high]
  - DechunkHTTPResponse (DechunkHTTPResponse.mjs) [high]
  - DefangIPAddresses (DefangIPAddresses.mjs) [high]
  - DefangURL (DefangURL.mjs) [high]
  - Delimiter (GroupIPAddresses.mjs) [high]
  - Delimiter (Multiply.mjs) [high]
  - DNSOverHTTPS (DNSOverHTTPS.mjs) [high]
  - Encode all special chars (URLEncode.mjs) [high]
  - ExtractIPAddresses (ExtractIPAddresses.mjs) [high]
  - ExtractMACAddresses (ExtractMACAddresses.mjs) [high]

### forensic-malware-helper
- Description: IOC extraction, entropy/byte analysis and malware triage helpers.
- CyberChef total: 6
- Implemented total: 0
- Estimated missing: 6
- Coverage: 0%
- Candidate operations (first 20):
  - ELFInfo (ELFInfo.mjs) [high]
  - FromHexdump (FromHexdump.mjs) [high]
  - Strings (Strings.mjs) [high]
  - Visualisation (Entropy.mjs) [high]
  - Width (ToHexdump.mjs) [high]
  - YARARules (YARARules.mjs) [high]

### misc-uncategorized
- Description: Operations that require manual triage or do not fit current taxonomy.
- CyberChef total: 182
- Implemented total: 72
- Estimated missing: 110
- Coverage: 39.56%
- Candidate operations (first 20):
  - AddTextToImage (AddTextToImage.mjs) [low]
  - AlternatingCaps (AlternatingCaps.mjs) [low]
  - AMFDecode (AMFDecode.mjs) [low]
  - AMFEncode (AMFEncode.mjs) [low]
  - Amount (BitShiftLeft.mjs) [low]
  - Amount (BitShiftRight.mjs) [low]
  - AnalyseUUID (AnalyseUUID.mjs) [low]
  - Bit mode (DisassembleX86.mjs) [low]
  - Bombe (Bombe.mjs) [low]
  - BSONSerialise (BSONSerialise.mjs) [low]

