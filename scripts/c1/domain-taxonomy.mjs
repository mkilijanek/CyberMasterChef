export const DOMAIN_ORDER = [
  "encodings-codecs",
  "crypto-hash-kdf",
  "compression-archive",
  "date-time",
  "data-formats",
  "regex-text-advanced",
  "network-protocol-parsers",
  "forensic-malware-helper",
  "misc-uncategorized"
];

export const DOMAIN_DESCRIPTIONS = {
  "encodings-codecs": "Encodings, binary/text codecs, canonical representation transforms.",
  "crypto-hash-kdf": "Cryptographic transforms, digests, MAC/KDF and cipher operations.",
  "compression-archive": "Compression/decompression and archive container operations.",
  "date-time": "Date/time parsing, formatting, conversion and timestamp operations.",
  "data-formats": "Structured formats (JSON/XML/CSV/YAML/TOML/HTML and format conversion).",
  "regex-text-advanced": "Regex and advanced text analysis/normalization operations.",
  "network-protocol-parsers": "Protocol/header/parsing operations for network/web payloads.",
  "forensic-malware-helper": "IOC extraction, entropy/byte analysis and malware triage helpers.",
  "misc-uncategorized": "Operations that require manual triage or do not fit current taxonomy."
};

const rules = [
  {
    domain: "crypto-hash-kdf",
    confidence: "high",
    patterns: [
      /aes|des|blowfish|chacha|rc4|rsa|dsa|ecc|ecdh|ecdsa|cipher|decrypt|encrypt|hmac|kdf|pbkdf|scrypt|bcrypt|argon|sha\d|sha-\d|md\d|ripemd|keccak|whirlpool|xxhash|hash|checksum|crc/i
    ]
  },
  {
    domain: "compression-archive",
    confidence: "high",
    patterns: [
      /\bgzip\b|\bgunzip\b|\bdeflate\b|\binflate\b|\bzlib\b|\bbrotli\b|\blz4\b|\blzma\b|\bbzip2?|\bxz\b|\bcompress(ion)?\b|\bdecompress(ion)?\b|\bunzip\b|\bzip\b|\btar\b|\barchive\b/i
    ]
  },
  {
    domain: "date-time",
    confidence: "high",
    patterns: [/date|time|timestamp|epoch|unix|iso\s?8601|utc|timezone|fromnow|moment/i]
  },
  {
    domain: "data-formats",
    confidence: "high",
    patterns: [
      /json|xml|csv|yaml|yml|toml|html|urlencoded|querystring|base\s?64\s?json|protobuf|msgpack|messagepack|bson|cbor|amf|avro|hexdump|table|image|png|jpe?g|gif|bmp|webp|svg|exif/i
    ]
  },
  {
    domain: "network-protocol-parsers",
    confidence: "high",
    patterns: [
      /url|uri|jwt|http|https|dns|defang|refang|cidr|\bipv?4\b|\bipv?6\b|\bip\s*address\b|\bmac\s*address\b|groupip|extractip|asn\.1|\bber\b|\bder\b|x509|certificate|mime|header|cookie|query|css\s*selector/i
    ]
  },
  {
    domain: "forensic-malware-helper",
    confidence: "high",
    patterns: [
      /ioc|indicator|entropy|yara|pe\s?header|elf|shellcode|strings|hex\s?dump|byte\s?histogram|malware|forensic|disassemble|x86|ctph|uuid|bomb|colossus|enigma|lorenz|chi\s?square|detectfiletype|filetree/i
    ]
  },
  {
    domain: "regex-text-advanced",
    confidence: "medium",
    patterns: [
      /regex|replace|extract|match|split|join|token|normalize|unicode|whitespace|case|camel|snake|kebab|reverse|sort|unique|trim|word|line|punctuation|nato|leet|cartesian|head|tail|mean|median|standard\s?deviation|filter|beautify|casing/i
    ]
  },
  {
    domain: "encodings-codecs",
    confidence: "medium",
    patterns: [
      /base\d+|base\s?\d+|bech32|hex|binary|octal|decimal|ascii|utf-?\d+|utf8|utf16|utf32|charcode|braille|percent|url\s?encode|url\s?decode|encode\s*text|decode\s*text|rot\d+|morse|a1z26|punycode|quoted\s?printable|bytes?/i
    ]
  }
];

export function classifyOperation(operationName, fileName) {
  const haystack = `${operationName} ${fileName}`;
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(haystack)) {
        return {
          domain: rule.domain,
          confidence: rule.confidence,
          matchedBy: pattern.toString()
        };
      }
    }
  }
  return {
    domain: "misc-uncategorized",
    confidence: "low",
    matchedBy: "<no-rule-match>"
  };
}
