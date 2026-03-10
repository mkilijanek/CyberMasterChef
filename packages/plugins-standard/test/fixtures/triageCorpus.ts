import type { DataValue } from "@cybermasterchef/core";

function writeU16LE(data: Uint8Array, offset: number, value: number): void {
  data[offset] = value & 0xff;
  data[offset + 1] = (value >>> 8) & 0xff;
}

function writeU32LE(data: Uint8Array, offset: number, value: number): void {
  data[offset] = value & 0xff;
  data[offset + 1] = (value >>> 8) & 0xff;
  data[offset + 2] = (value >>> 16) & 0xff;
  data[offset + 3] = (value >>> 24) & 0xff;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function base64ToBytes(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64"));
}

function makeZipSample(entries: Array<{ name: string; content: Uint8Array; encrypted?: boolean }>): Uint8Array {
  const parts: Uint8Array[] = [];
  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name);
    const header = new Uint8Array(30);
    writeU32LE(header, 0, 0x04034b50);
    writeU16LE(header, 4, 20);
    writeU16LE(header, 6, entry.encrypted ? 1 : 0);
    writeU16LE(header, 8, 0);
    writeU32LE(header, 14, 0);
    writeU32LE(header, 18, entry.content.length);
    writeU32LE(header, 22, entry.content.length);
    writeU16LE(header, 26, nameBytes.length);
    writeU16LE(header, 28, 0);
    parts.push(header, nameBytes, entry.content);
  }
  return concatBytes(parts);
}

const TEST_CERT_DER_BASE64 =
  "MIIDYzCCAkugAwIBAgIUV41IdswKmalK1bU06sej3Ey5bOkwDQYJKoZIhvcNAQELBQAwQTEdMBsGA1UEAwwUQ3liZXJNYXN0ZXJDaGVmIFRlc3QxEzARBgNVBAoMCk9wZW5BSSBEZXYxCzAJBgNVBAYTAlVTMB4XDTI2MDMxMDE3NTEwMFoXDTI3MDMxMDE3NTEwMFowQTEdMBsGA1UEAwwUQ3liZXJNYXN0ZXJDaGVmIFRlc3QxEzARBgNVBAoMCk9wZW5BSSBEZXYxCzAJBgNVBAYTAlVTMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA40PVlX6gduyJZujV5cUtas8LindDdE3v9VEYKoLbx3NoYsZKUsSZ6r3XNwxJ7ZyWUN4ckDpDpX1js1AiY17I/2lgpq+qYyrbGtfjzJhizvFfOLculG53oDqH5hLr7GIgZVZOKTPCXHy7Nm+QmzucwF8l7zrwFHQYf+sQVu4v+mj8QDckfGReobgRNjY9GajyljX51aYMFBEx3sd+NrY04KgGBUXvAz2GyE7elm6+nRxAUD8XExYVk+aHS/ZbmAltVH9IlGhp9Y/ehiMs5+z0q9Ft//m3oa7Bpcbv26oXrhDRPnYQ5+CsIvEr14fyDlLEiPcyvWqnUEPdQe48SQKdswIDAQABo1MwUTAdBgNVHQ4EFgQUPtBAdvrZ+nSZM1MfbwPerFqgb6wwHwYDVR0jBBgwFoAUPtBAdvrZ+nSZM1MfbwPerFqgb6wwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAAHmHqyHADBpWX1vIICgc+m3Ns1YbhnKyVXSTHzevyf3fiF4JahHPf87huIzwkmbmhxeTHtSzF7auXujMeG4iyoumVFLW8RXB6t6A79bi5ttydWs3PwrTeR3RE+iQt6EdjS7ReRLl5uxkTq4YeFyNUIIUMKW5bwk/VHAMEXZKw93FhYZHafov1hGp/p2YDRDVRz80BoZAy4RDebtzngTWpRNftOpZVMMP8Z5syTqls3pzOlfYUXoDY4aKyQLdOywdlF6YHOq+D4CSpYM4Tn85M9hbzmsDsTnInKoeFbTIqdeQZmw/KnoUjLadDFmeQGqopD4bi2UJyAgNc2oyjI/A7w==";

function makeSignedPeSample(): Uint8Array {
  const certBytes = base64ToBytes(TEST_CERT_DER_BASE64);
  const winCertLength = 8 + certBytes.length;
  const paddedWinCertLength = (winCertLength + 7) & ~7;
  const certOffset = 0x400;
  const data = new Uint8Array(certOffset + paddedWinCertLength);
  data[0] = 0x4d;
  data[1] = 0x5a;
  writeU32LE(data, 0x3c, 0x80);
  const peOffset = 0x80;
  data[peOffset] = 0x50;
  data[peOffset + 1] = 0x45;
  writeU16LE(data, peOffset + 4, 0x14c);
  writeU16LE(data, peOffset + 6, 1);
  writeU16LE(data, peOffset + 20, 0xe0);
  const optionalHeader = peOffset + 24;
  writeU16LE(data, optionalHeader, 0x10b);
  writeU32LE(data, optionalHeader + 92, 16);
  writeU32LE(data, optionalHeader + 96 + 4 * 8, certOffset);
  writeU32LE(data, optionalHeader + 96 + 4 * 8 + 4, paddedWinCertLength);
  const sectionTable = peOffset + 24 + 0xe0;
  for (const [index, char] of [...".text"].entries()) data[sectionTable + index] = char.charCodeAt(0);
  writeU32LE(data, sectionTable + 8, 0x200);
  writeU32LE(data, sectionTable + 12, 0x1000);
  writeU32LE(data, sectionTable + 16, 0x200);
  writeU32LE(data, sectionTable + 20, 0x200);
  writeU32LE(data, sectionTable + 36, 0x60000020);
  writeU32LE(data, certOffset, winCertLength);
  writeU16LE(data, certOffset + 4, 0x0200);
  writeU16LE(data, certOffset + 6, 0x0001);
  data.set(certBytes, certOffset + 8);
  return data;
}

export type TriageCorpusCase = {
  id: string;
  input: DataValue;
  triageArgs?: Record<string, unknown>;
  expected: {
    preFormat: "text" | "pe" | "zip";
    trustStatus: "not_applicable" | "unsigned" | "signed";
    verdict: "benign" | "suspicious" | "malicious";
    findingIds: string[];
    mockedPresent: string[];
    mockedAbsent: string[];
  };
};

export const TRIAGE_CORPUS: TriageCorpusCase[] = [
  {
    id: "benign_text",
    input: {
      type: "string",
      value: "internal note: quarterly report draft and contact alias ops@example.org"
    },
    expected: {
      preFormat: "text",
      trustStatus: "not_applicable",
      verdict: "benign",
      findingIds: ["ioc-density"],
      mockedPresent: ["authenticode_or_x509_verification"],
      mockedAbsent: []
    }
  },
  {
    id: "suspicious_text",
    input: {
      type: "string",
      value: "CVE-2024-12345 admin@example.com https://evil.example/a"
    },
    triageArgs: { suspiciousThreshold: 10, maliciousThreshold: 30 },
    expected: {
      preFormat: "text",
      trustStatus: "not_applicable",
      verdict: "suspicious",
      findingIds: ["ioc-density", "cve-reference"],
      mockedPresent: ["authenticode_or_x509_verification"],
      mockedAbsent: []
    }
  },
  {
    id: "safe_zip_archive",
    input: {
      type: "bytes",
      value: makeZipSample([{ name: "docs/readme.txt", content: new TextEncoder().encode("safe") }])
    },
    expected: {
      preFormat: "zip",
      trustStatus: "not_applicable",
      verdict: "benign",
      findingIds: [],
      mockedPresent: ["archive_password_handling_and_zip_unpacking"],
      mockedAbsent: ["zip_slip_and_zip_bomb_safe_unpack_guards"]
    }
  },
  {
    id: "signed_pe",
    input: {
      type: "bytes",
      value: makeSignedPeSample()
    },
    expected: {
      preFormat: "pe",
      trustStatus: "signed",
      verdict: "benign",
      findingIds: ["embedded-certificate"],
      mockedPresent: [],
      mockedAbsent: ["authenticode_or_x509_verification"]
    }
  }
];
