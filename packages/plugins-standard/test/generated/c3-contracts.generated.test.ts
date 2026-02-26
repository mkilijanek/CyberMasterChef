import { describe, expect, it } from "vitest";
import { InMemoryRegistry } from "@cybermasterchef/core";
import { standardPlugin } from "../../src/index.js";

const CONTRACTS = [
  {
    "operationId": "codec.fromBase58",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "codec.fromBase64",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "codec.fromBinary",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "codec.fromCharcode",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "codec.fromDecimal",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "codec.fromHex",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "codec.fromHexContent",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "codec.fromOctal",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "codec.toBase58",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "codec.toBase64",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "codec.toBinary",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "delimiter"
    ]
  },
  {
    "operationId": "codec.toCharcode",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "delimiter"
    ]
  },
  {
    "operationId": "codec.toDecimal",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "delimiter"
    ]
  },
  {
    "operationId": "codec.toHex",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "codec.toHexContent",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "codec.toOctal",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "codec.urlDecode",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "codec.urlEncode",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "compression.bzip2",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "compression.bzip2Decompress",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "compression.gunzip",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "compression.gzip",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "compression.tar",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "bytes",
    "argKeys": [
      "filename"
    ]
  },
  {
    "operationId": "compression.untar",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "compression.unzip",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "compression.zip",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "bytes",
    "argKeys": [
      "filename",
      "compression",
      "level"
    ]
  },
  {
    "operationId": "crypto.a1z26CipherDecode",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "crypto.a1z26CipherEncode",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "delimiter"
    ]
  },
  {
    "operationId": "crypto.affineCipherDecode",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "a",
      "b"
    ]
  },
  {
    "operationId": "crypto.affineCipherEncode",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "a",
      "b"
    ]
  },
  {
    "operationId": "crypto.atbashCipher",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "crypto.baconCipherDecode",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "crypto.baconCipherEncode",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "delimiter"
    ]
  },
  {
    "operationId": "crypto.bcryptParse",
    "inputTypes": [
      "string"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "crypto.hkdf",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "salt",
      "saltEncoding",
      "info",
      "infoEncoding",
      "length",
      "hash"
    ]
  },
  {
    "operationId": "crypto.hmacSha1",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "key",
      "keyEncoding"
    ]
  },
  {
    "operationId": "crypto.hmacSha256",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "key",
      "keyEncoding"
    ]
  },
  {
    "operationId": "crypto.hmacSha384",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "key",
      "keyEncoding"
    ]
  },
  {
    "operationId": "crypto.hmacSha512",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "key",
      "keyEncoding"
    ]
  },
  {
    "operationId": "crypto.pbkdf2",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "salt",
      "saltEncoding",
      "iterations",
      "length",
      "hash"
    ]
  },
  {
    "operationId": "crypto.scrypt",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "salt",
      "saltEncoding",
      "length",
      "costN",
      "blockSizeR",
      "parallelizationP",
      "maxmem"
    ]
  },
  {
    "operationId": "date.dateTimeDelta",
    "inputTypes": [
      "string"
    ],
    "outputType": "json",
    "argKeys": [
      "base",
      "format"
    ]
  },
  {
    "operationId": "date.extractIsoTimestamps",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "date.extractUnixTimestamps",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "date.isoToDateOnly",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "date.isoToUnix",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "date.isoWeekday",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "numeric"
    ]
  },
  {
    "operationId": "date.parseDateTime",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "format"
    ]
  },
  {
    "operationId": "date.parseObjectIdTimestamp",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "date.parseUnixFilePermissions",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "includeNumeric"
    ]
  },
  {
    "operationId": "date.translateDateTimeFormat",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "fromFormat",
      "toFormat"
    ]
  },
  {
    "operationId": "date.unixToIso",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "seconds"
    ]
  },
  {
    "operationId": "date.unixToWindowsFiletime",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "seconds"
    ]
  },
  {
    "operationId": "date.windowsFiletimeToUnix",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "seconds"
    ]
  },
  {
    "operationId": "forensic.analyseUuid",
    "inputTypes": [
      "string"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "forensic.basicPreTriage",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "maxMatches",
      "segmentWindow",
      "segmentLimit",
      "maxHeuristicMatches",
      "enableImphash",
      "enableTlsh",
      "enableSsdeep",
      "maxFuzzyInputBytes"
    ]
  },
  {
    "operationId": "forensic.basicTriage",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "suspiciousThreshold",
      "maliciousThreshold"
    ]
  },
  {
    "operationId": "forensic.chiSquare",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.detectFileType",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.elfInfo",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractCves",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractDomains",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractEmails",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractJwt",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractMd5",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractRegistryKeys",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractSha1",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractSha256",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractSha512",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "forensic.extractStrings",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "minLength"
    ]
  },
  {
    "operationId": "format.amfDecode",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": [
      "version"
    ]
  },
  {
    "operationId": "format.amfEncode",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "bytes",
    "argKeys": [
      "version"
    ]
  },
  {
    "operationId": "format.avroDecode",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": [
      "schema"
    ]
  },
  {
    "operationId": "format.avroEncode",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "bytes",
    "argKeys": [
      "schema"
    ]
  },
  {
    "operationId": "format.avroToJson",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": [
      "schema"
    ]
  },
  {
    "operationId": "format.bsonDecode",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "format.bsonEncode",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "format.bsonSerialise",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "format.cborDecode",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "format.cborEncode",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "format.csvToJson",
    "inputTypes": [
      "string"
    ],
    "outputType": "json",
    "argKeys": [
      "delimiter",
      "header",
      "skipEmptyLines"
    ]
  },
  {
    "operationId": "format.fromHexdump",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "format.fromHtmlEntity",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.fromMessagePack",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "format.fromQuotedPrintable",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.htmlToText",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.jsonArrayLength",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "string",
    "argKeys": [
      "path"
    ]
  },
  {
    "operationId": "format.jsonataQuery",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "json",
    "argKeys": [
      "expression"
    ]
  },
  {
    "operationId": "format.jsonBeautify",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "indent"
    ]
  },
  {
    "operationId": "format.jsonExtractKeys",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.jsonMinify",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.jsonNumberValues",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.jsonSortKeys",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.jsonStringValues",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.jsonToCsv",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "string",
    "argKeys": [
      "delimiter",
      "header"
    ]
  },
  {
    "operationId": "format.jsonToYaml",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.protobufDecode",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": [
      "schema",
      "messageType"
    ]
  },
  {
    "operationId": "format.protobufEncode",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "bytes",
    "argKeys": [
      "schema",
      "messageType"
    ]
  },
  {
    "operationId": "format.stripHtmlTags",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.toHexdump",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "width"
    ]
  },
  {
    "operationId": "format.toHtmlEntity",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "encodeEverything"
    ]
  },
  {
    "operationId": "format.toMessagePack",
    "inputTypes": [
      "string",
      "json"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "format.toQuotedPrintable",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "format.toTable",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "delimiter",
      "header"
    ]
  },
  {
    "operationId": "format.xmlBeautify",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "indent"
    ]
  },
  {
    "operationId": "format.xmlMinify",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "preserveComments"
    ]
  },
  {
    "operationId": "format.yamlToJson",
    "inputTypes": [
      "string"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "hash.adler32",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "hash.analyseHash",
    "inputTypes": [
      "string"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "hash.blake2b",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "hash.blake2s",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "hash.md5",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "hash.sha1",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "hash.sha256",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "hash.sha3_256",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "hash.sha3_512",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "hash.sha384",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "hash.sha512",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "image.addText",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "text",
      "color",
      "fontSize"
    ]
  },
  {
    "operationId": "image.blur",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "sigma"
    ]
  },
  {
    "operationId": "image.brightnessContrast",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "brightness",
      "contrast"
    ]
  },
  {
    "operationId": "image.contain",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "width",
      "height",
      "background"
    ]
  },
  {
    "operationId": "image.convertFormat",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "format"
    ]
  },
  {
    "operationId": "image.cover",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "width",
      "height"
    ]
  },
  {
    "operationId": "image.crop",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "left",
      "top",
      "width",
      "height"
    ]
  },
  {
    "operationId": "image.dither",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "threshold"
    ]
  },
  {
    "operationId": "image.extractExif",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "image.filter",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "filter"
    ]
  },
  {
    "operationId": "image.flip",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "horizontal",
      "vertical"
    ]
  },
  {
    "operationId": "image.generate",
    "inputTypes": [
      "string",
      "json",
      "number"
    ],
    "outputType": "bytes",
    "argKeys": [
      "width",
      "height",
      "color",
      "format"
    ]
  },
  {
    "operationId": "image.generateQrCode",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": [
      "scale",
      "margin"
    ]
  },
  {
    "operationId": "image.hsl",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "hue",
      "saturation",
      "lightness"
    ]
  },
  {
    "operationId": "image.invert",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "image.metadata",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "json",
    "argKeys": []
  },
  {
    "operationId": "image.normalise",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "image.opacity",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "opacity"
    ]
  },
  {
    "operationId": "image.removeExif",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "image.render",
    "inputTypes": [
      "string"
    ],
    "outputType": "bytes",
    "argKeys": [
      "format"
    ]
  },
  {
    "operationId": "image.resize",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "width",
      "height"
    ]
  },
  {
    "operationId": "image.rotate",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "angle"
    ]
  },
  {
    "operationId": "image.sharpen",
    "inputTypes": [
      "bytes"
    ],
    "outputType": "bytes",
    "argKeys": [
      "sigma"
    ]
  },
  {
    "operationId": "network.dechunkHttpResponse",
    "inputTypes": [
      "bytes",
      "string"
    ],
    "outputType": "bytes",
    "argKeys": []
  },
  {
    "operationId": "network.defangIPs",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "network.defangUrls",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "network.extractIPs",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "network.extractIPv6",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "network.extractPorts",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "network.extractUrls",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "network.fangIPs",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "network.fangUrls",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.append",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "value"
    ]
  },
  {
    "operationId": "text.collapseDashes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.collapseMultipleNewlines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.collapseUnderscores",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.compactLines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.countAscii",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countBackslashes",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countBrackets",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countColons",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countCommas",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countDashes",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countDots",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countExclamations",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countLowercase",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countNonAscii",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countNonEmptyLines",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countParentheses",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countPluses",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countQuestionMarks",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countQuotes",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countSemicolons",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countSlashes",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countSpaces",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countTabs",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countUnderscores",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.countUppercase",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.csvToLines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.endsWith",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": [
      "value"
    ]
  },
  {
    "operationId": "text.firstLine",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.firstWord",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.includes",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": [
      "value"
    ]
  },
  {
    "operationId": "text.keepAlnum",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.keepDigits",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.keepDigitsAndDots",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.keepHexChars",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.keepLetters",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.keepNonAscii",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.keepPunctuation",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.keepVowels",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.keepWhitespace",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.lastLine",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.lastWord",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.length",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.lineCount",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.linesNumbered",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.linesToCsv",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.linesToWords",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.linesTrimLeft",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.linesTrimRight",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.lowercase",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.lowerFirst",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.maskDigits",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.normalizeCommas",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.normalizeNewlines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.normalizeWhitespace",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.onlyAlnumAndSpaces",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.onlyLettersAndSpaces",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.onlyPrintableAscii",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.padEnd",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "length",
      "fill"
    ]
  },
  {
    "operationId": "text.padStart",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "length",
      "fill"
    ]
  },
  {
    "operationId": "text.prepend",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "value"
    ]
  },
  {
    "operationId": "text.removeAlnum",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeAmpersands",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeAngles",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeAsterisks",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeAtSigns",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeBackslashes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeBackticks",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeBlankLines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeBraces",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeBrackets",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeCarets",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeColons",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeCommas",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeControlChars",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeCurrencySymbols",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeDigits",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeDigitsAndSpaces",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeDollarSigns",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeDots",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeDoubleQuotes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeDoubleSpaces",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeEmojis",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeEquals",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeExclamations",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeHashes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeHexChars",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeHyphens",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeLetters",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeMathSymbols",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeNonAscii",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeParentheses",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removePercents",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removePipes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removePluses",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removePunctuation",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeQuestionMarks",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeSemicolons",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeSingleQuotes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeSlashes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeSpaces",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeSpacesAndTabs",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeTabs",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeTildes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeUnderscores",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.removeVowels",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.repeat",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "count"
    ]
  },
  {
    "operationId": "text.replace",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "find",
      "replace",
      "all"
    ]
  },
  {
    "operationId": "text.replaceNewlinesWithSpace",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.replaceSpacesWithNewlines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.reverse",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.reverseCharsInWords",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.reverseLines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.reverseWords",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.rot13",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.slice",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": [
      "start",
      "end"
    ]
  },
  {
    "operationId": "text.sortLines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.sortWords",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.spacesToTabs",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.startsWith",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": [
      "value"
    ]
  },
  {
    "operationId": "text.stripAccents",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.surroundBrackets",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.surroundQuotes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.swapCase",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.tabsToSingleSpace",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.tabsToSpaces",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.toCamelCase",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.toKebabCase",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.toPascalCase",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.toSnakeCase",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.toTitleCase",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.trim",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.trimCommas",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.trimEnd",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.trimLeadingDots",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.trimLines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.trimQuotes",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.trimStart",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.trimTrailingDots",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.uniqueLines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.uniqueWords",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.uppercase",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.upperFirst",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  },
  {
    "operationId": "text.wordCount",
    "inputTypes": [
      "string"
    ],
    "outputType": "number",
    "argKeys": []
  },
  {
    "operationId": "text.wordsToLines",
    "inputTypes": [
      "string"
    ],
    "outputType": "string",
    "argKeys": []
  }
] as const;

describe("c3 generated contracts", () => {
  it("keeps operation registry aligned with generated contracts", () => {
    const registry = new InMemoryRegistry();
    standardPlugin.register(registry);

    for (const contract of CONTRACTS) {
      const op = registry.get(contract.operationId);
      expect(op, `missing operation ${contract.operationId}`).toBeDefined();
      if (!op) continue;

      expect([...op.input].sort()).toEqual([...contract.inputTypes].sort());
      expect(op.output).toBe(contract.outputType);
      expect(op.args.map((arg) => arg.key).sort()).toEqual([...contract.argKeys].sort());
    }
  });
});

