import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { basicPreTriage } from "../src/ops/basicPreTriage.js";

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

function makeMinimalPeSample(): Uint8Array {
  const data = new Uint8Array(0x600);
  data[0] = 0x4d;
  data[1] = 0x5a;
  writeU32LE(data, 0x3c, 0x80);

  const peOffset = 0x80;
  data[peOffset] = 0x50;
  data[peOffset + 1] = 0x45;
  data[peOffset + 2] = 0x00;
  data[peOffset + 3] = 0x00;
  writeU16LE(data, peOffset + 4, 0x14c);
  writeU16LE(data, peOffset + 6, 1);
  writeU16LE(data, peOffset + 20, 0xe0);

  const sectionTable = peOffset + 24 + 0xe0;
  const name = ".text";
  for (let i = 0; i < name.length; i++) data[sectionTable + i] = name.charCodeAt(i);
  writeU32LE(data, sectionTable + 8, 0x1000);
  writeU32LE(data, sectionTable + 12, 0x1000);
  writeU32LE(data, sectionTable + 16, 0x200);
  writeU32LE(data, sectionTable + 20, 0x200);
  writeU32LE(data, sectionTable + 36, 0x60000020);

  for (let i = 0; i < 0x200; i++) data[0x200 + i] = (i * 31) & 0xff;
  return data;
}

function writeAscii(data: Uint8Array, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    data[offset + i] = value.charCodeAt(i);
  }
  data[offset + value.length] = 0x00;
}

function base64ToBytes(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64"));
}

function makeImportPeSample(): Uint8Array {
  const data = new Uint8Array(0x800);
  data[0] = 0x4d;
  data[1] = 0x5a;
  writeU32LE(data, 0x3c, 0x80);

  const peOffset = 0x80;
  data[peOffset] = 0x50;
  data[peOffset + 1] = 0x45;
  data[peOffset + 2] = 0x00;
  data[peOffset + 3] = 0x00;
  writeU16LE(data, peOffset + 4, 0x14c);
  writeU16LE(data, peOffset + 6, 1);
  writeU16LE(data, peOffset + 20, 0xe0);

  const optionalHeader = peOffset + 24;
  writeU16LE(data, optionalHeader, 0x10b);
  writeU32LE(data, optionalHeader + 92, 16);
  writeU32LE(data, optionalHeader + 96 + 8, 0x1100);
  writeU32LE(data, optionalHeader + 96 + 12, 40);

  const sectionTable = peOffset + 24 + 0xe0;
  const name = ".rdata";
  for (let i = 0; i < name.length; i++) data[sectionTable + i] = name.charCodeAt(i);
  writeU32LE(data, sectionTable + 8, 0x300);
  writeU32LE(data, sectionTable + 12, 0x1000);
  writeU32LE(data, sectionTable + 16, 0x300);
  writeU32LE(data, sectionTable + 20, 0x200);
  writeU32LE(data, sectionTable + 36, 0x40000040);

  const descriptor = 0x300;
  writeU32LE(data, descriptor, 0x1140);
  writeU32LE(data, descriptor + 12, 0x1120);
  writeU32LE(data, descriptor + 16, 0x1140);

  writeAscii(data, 0x320, "KERNEL32.dll");
  writeU16LE(data, 0x330, 0);
  writeAscii(data, 0x332, "LoadLibraryA");
  writeU32LE(data, 0x340, 0x1130);
  writeU32LE(data, 0x344, 0);

  return data;
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
  data[peOffset + 2] = 0x00;
  data[peOffset + 3] = 0x00;
  writeU16LE(data, peOffset + 4, 0x14c);
  writeU16LE(data, peOffset + 6, 1);
  writeU16LE(data, peOffset + 20, 0xe0);

  const optionalHeader = peOffset + 24;
  writeU16LE(data, optionalHeader, 0x10b);
  writeU32LE(data, optionalHeader + 92, 16);
  writeU32LE(data, optionalHeader + 96 + 4 * 8, certOffset);
  writeU32LE(data, optionalHeader + 96 + 4 * 8 + 4, paddedWinCertLength);

  const sectionTable = peOffset + 24 + 0xe0;
  const name = ".text";
  for (let i = 0; i < name.length; i++) data[sectionTable + i] = name.charCodeAt(i);
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

function makeMinimalElfSample(): Uint8Array {
  const data = new Uint8Array(256);
  data[0] = 0x7f;
  data[1] = 0x45;
  data[2] = 0x4c;
  data[3] = 0x46;
  for (let i = 4; i < data.length; i++) data[i] = i & 0xff;
  return data;
}

function makeMinimalMachOSample(): Uint8Array {
  const data = new Uint8Array(256);
  data[0] = 0xfe;
  data[1] = 0xed;
  data[2] = 0xfa;
  data[3] = 0xcf;
  for (let i = 4; i < data.length; i++) data[i] = (i * 3) & 0xff;
  return data;
}

describe("forensic basic pre-triage", () => {
  it("builds IOC+hash report for text input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicPreTriage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicPreTriage" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value:
          "visit https://example.com path CVE-2024-12345 admin@example.com ip 10.0.0.1"
      }
    });

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const report = JSON.parse(out.output.value) as {
      input: { type: string; seemsBinary: boolean };
      hashes: { sha256: string | null; md5: string | null; tlsh: string | null; ssdeep: string | null };
      iocs: { urls: string[]; emails: string[]; cves: string[]; ipv4: string[] };
      heuristics: Array<{ id: string; matches: string[] }>;
      binaryAnalysis: { format: string };
    };
    expect(report.input.type).toBe("string");
    expect(report.input.seemsBinary).toBe(false);
    expect(report.hashes.sha256).toHaveLength(64);
    expect(report.hashes.md5).toHaveLength(32);
    expect(report.iocs.urls).toEqual(["https://example.com"]);
    expect(report.iocs.emails).toEqual(["admin@example.com"]);
    expect(report.iocs.cves).toEqual(["CVE-2024-12345"]);
    expect(report.iocs.ipv4).toEqual(["10.0.0.1"]);
    expect(report.hashes.ssdeep).not.toBeNull();
    expect(Array.isArray(report.heuristics)).toBe(true);
    expect(report.binaryAnalysis.format).toBe("text");
  });

  it("extracts PE section metadata for binary input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicPreTriage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicPreTriage" }] };
    const sample = makeMinimalPeSample();

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: sample }
    });

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const report = JSON.parse(out.output.value) as {
      input: { type: string; seemsBinary: boolean; sizeBytes: number };
      binaryAnalysis: {
        format: string;
        sections: Array<{ name: string; rawOffset: number; rawSize: number; entropy: number }>;
      };
    };

    expect(report.input.type).toBe("bytes");
    expect(report.input.seemsBinary).toBe(true);
    expect(report.input.sizeBytes).toBe(sample.length);
    expect(report.binaryAnalysis.format).toBe("pe");
    expect(report.binaryAnalysis.sections).toHaveLength(1);
    expect(report.binaryAnalysis.sections[0]?.name).toBe(".text");
    expect(report.binaryAnalysis.sections[0]?.rawOffset).toBe(0x200);
    expect(report.binaryAnalysis.sections[0]?.rawSize).toBe(0x200);
    expect(report.binaryAnalysis.sections[0]?.entropy).toBeGreaterThan(0);
  });

  it("computes PE imphash when import table exists", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicPreTriage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicPreTriage" }] };
    const sample = makeImportPeSample();

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: sample }
    });

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const report = JSON.parse(out.output.value) as {
      hashes: { imphash: string | null };
    };
    const expected = createHash("md5").update("kernel32.loadlibrarya").digest("hex");
    expect(report.hashes.imphash).toBe(expected);
  });

  it("detects ELF and Mach-O formats", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicPreTriage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicPreTriage" }] };

    const elf = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: makeMinimalElfSample() }
    });
    expect(elf.output.type).toBe("string");
    if (elf.output.type !== "string") return;
    const elfReport = JSON.parse(elf.output.value) as { binaryAnalysis: { format: string } };
    expect(elfReport.binaryAnalysis.format).toBe("elf");

    const macho = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: makeMinimalMachOSample() }
    });
    expect(macho.output.type).toBe("string");
    if (macho.output.type !== "string") return;
    const machoReport = JSON.parse(macho.output.value) as { binaryAnalysis: { format: string } };
    expect(machoReport.binaryAnalysis.format).toBe("macho");
  });

  it("handles truncated/corrupted binaries without throwing", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicPreTriage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicPreTriage" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: new Uint8Array([0x4d, 0x5a, 0x00, 0x01, 0x02]) }
    });
    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const report = JSON.parse(out.output.value) as {
      binaryAnalysis: { format: string };
      hashes: { imphash: string | null };
    };
    expect(report.binaryAnalysis.format).toBe("unknown");
    expect(report.hashes.imphash).toBeNull();
  });

  it("extracts embedded PE certificate metadata when present", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicPreTriage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicPreTriage" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: makeSignedPeSample() }
    });

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const report = JSON.parse(out.output.value) as {
      binaryAnalysis: { format: string };
      trustAnalysis: {
        status: string;
        source: string;
        subject: string | null;
        issuer: string | null;
        serialNumber: string | null;
        validFrom: string | null;
        validTo: string | null;
        selfIssued: boolean | null;
      };
    };
    expect(report.binaryAnalysis.format).toBe("pe");
    expect(report.trustAnalysis.status).toBe("signed");
    expect(report.trustAnalysis.source).toBe("raw_x509");
    expect(report.trustAnalysis.subject).toContain("CN=CyberMasterChef Test");
    expect(report.trustAnalysis.issuer).toContain("O=OpenAI Dev");
    expect(report.trustAnalysis.serialNumber).not.toBeNull();
    expect(report.trustAnalysis.validFrom).toBe("2026-03-10T17:51:00Z");
    expect(report.trustAnalysis.validTo).toBe("2027-03-10T17:51:00Z");
    expect(report.trustAnalysis.selfIssued).toBe(true);
  });
});
