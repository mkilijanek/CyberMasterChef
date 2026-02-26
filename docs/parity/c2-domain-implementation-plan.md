# C2 Domain Implementation Plan

Generated: 2026-02-26T10:22:50.274Z
Implemented operations in repo: 295

## Priority order

- P1: forensic-malware-helper (coverage 31.25%, missing ~11)
- P2: crypto-hash-kdf (coverage 32.99%, missing ~65)
- P3: network-protocol-parsers (coverage 40%, missing ~15)
- P4: encodings-codecs (coverage 41.38%, missing ~34)

## Domain summary

### encodings-codecs
- Description: Encodings, binary/text codecs, canonical representation transforms.
- CyberChef total: 58
- Implemented total: 24
- Estimated missing: 34
- Coverage: 41.38%
- Candidate operations (first 20):
  - Alphabet (FromBase58.mjs) [medium]
  - Alphabet (ToBase58.mjs) [medium]
  - Convert (ToHexContent.mjs) [medium]
  - Delimiter (FromBinary.mjs) [medium]
  - Delimiter (FromCharcode.mjs) [medium]
  - Delimiter (FromDecimal.mjs) [medium]
  - Delimiter (FromOctal.mjs) [medium]
  - Delimiter (ToBinary.mjs) [medium]
  - Delimiter (ToCharcode.mjs) [medium]
  - Delimiter (ToDecimal.mjs) [medium]

### crypto-hash-kdf
- Description: Cryptographic transforms, digests, MAC/KDF and cipher operations.
- CyberChef total: 97
- Implemented total: 32
- Estimated missing: 65
- Coverage: 32.99%
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
- CyberChef total: 7
- Implemented total: 7
- Estimated missing: 0
- Coverage: 100%
- Candidate operations (first 20):
  - Bzip2Compress (Bzip2Compress.mjs) [high]
  - Bzip2Decompress (Bzip2Decompress.mjs) [high]
  - Filename (Tar.mjs) [high]
  - Gunzip (Gunzip.mjs) [high]
  - Gzip (Gzip.mjs) [high]
  - Unzip (Unzip.mjs) [high]
  - Zip (Zip.mjs) [high]

### date-time
- Description: Date/time parsing, formatting, conversion and timestamp operations.
- CyberChef total: 12
- Implemented total: 12
- Estimated missing: 0
- Coverage: 100%
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
- CyberChef total: 50
- Implemented total: 62
- Estimated missing: 0
- Coverage: 124%
- Candidate operations (first 20):
  - AddTextToImage (AddTextToImage.mjs) [high]
  - AMFDecode (AMFDecode.mjs) [high]
  - AMFEncode (AMFEncode.mjs) [high]
  - AvroToJSON (AvroToJSON.mjs) [high]
  - BlurImage (BlurImage.mjs) [high]
  - BSONSerialise (BSONSerialise.mjs) [high]
  - CBORDecode (CBORDecode.mjs) [high]
  - CBOREncode (CBOREncode.mjs) [high]
  - Cell delimiters (ToTable.mjs) [high]
  - ContainImage (ContainImage.mjs) [high]

### regex-text-advanced
- Description: Regex and advanced text analysis/normalization operations.
- CyberChef total: 51
- Implemented total: 55
- Estimated missing: 0
- Coverage: 107.84%
- Candidate operations (first 20):
  - Attempt to be context aware (ToCamelCase.mjs) [medium]
  - Attempt to be context aware (ToKebabCase.mjs) [medium]
  - Attempt to be context aware (ToSnakeCase.mjs) [medium]
  - Built in regexes (RegularExpression.mjs) [medium]
  - By (Reverse.mjs) [medium]
  - CartesianProduct (CartesianProduct.mjs) [medium]
  - ConvertLeetSpeak (ConvertLeetSpeak.mjs) [medium]
  - ConvertToNATOAlphabet (ConvertToNATOAlphabet.mjs) [medium]
  - Delimiter (Filter.mjs) [medium]
  - Delimiter (Head.mjs) [medium]

### network-protocol-parsers
- Description: Protocol/header/parsing operations for network/web payloads.
- CyberChef total: 25
- Implemented total: 10
- Estimated missing: 15
- Coverage: 40%
- Candidate operations (first 20):
  - CSS selector (CSSSelector.mjs) [high]
  - DechunkHTTPResponse (DechunkHTTPResponse.mjs) [high]
  - DefangIPAddresses (DefangIPAddresses.mjs) [high]
  - DefangURL (DefangURL.mjs) [high]
  - Delimiter (GroupIPAddresses.mjs) [high]
  - DNSOverHTTPS (DNSOverHTTPS.mjs) [high]
  - Encode all special chars (URLEncode.mjs) [high]
  - ExtractIPAddresses (ExtractIPAddresses.mjs) [high]
  - ExtractURLs (ExtractURLs.mjs) [high]
  - FangURL (FangURL.mjs) [high]

### forensic-malware-helper
- Description: IOC extraction, entropy/byte analysis and malware triage helpers.
- CyberChef total: 16
- Implemented total: 5
- Estimated missing: 11
- Coverage: 31.25%
- Candidate operations (first 20):
  - AnalyseUUID (AnalyseUUID.mjs) [high]
  - Bit mode (DisassembleX86.mjs) [high]
  - Bombe (Bombe.mjs) [high]
  - ChiSquare (ChiSquare.mjs) [high]
  - Colossus (Colossus.mjs) [high]
  - CTPH (CTPH.mjs) [high]
  - DetectFileType (DetectFileType.mjs) [high]
  - ELFInfo (ELFInfo.mjs) [high]
  - Enigma (Enigma.mjs) [high]
  - FileTree (FileTree.mjs) [high]

### misc-uncategorized
- Description: Operations that require manual triage or do not fit current taxonomy.
- CyberChef total: 149
- Implemented total: 88
- Estimated missing: 61
- Coverage: 59.06%
- Candidate operations (first 20):
  - AlternatingCaps (AlternatingCaps.mjs) [low]
  - Amount (BitShiftLeft.mjs) [low]
  - Amount (BitShiftRight.mjs) [low]
  - Capacity (Shake.mjs) [low]
  - CaretMdecode (CaretMdecode.mjs) [low]
  - CitrixCTX1Decode (CitrixCTX1Decode.mjs) [low]
  - CitrixCTX1Encode (CitrixCTX1Encode.mjs) [low]
  - Comment (Comment.mjs) [low]
  - Data format (SwapEndianness.mjs) [low]
  - Delimiter (Divide.mjs) [low]

