import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { basicTriage } from "../src/ops/basicTriage.js";

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

function writeAscii(data: Uint8Array, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) data[offset + i] = value.charCodeAt(i);
  data[offset + value.length] = 0x00;
}

function makeImportPeSample(): Uint8Array {
  const data = new Uint8Array(0x800);
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
  return data;
}

describe("forensic basic triage", () => {
  it("builds suspicious or malicious verdict with score and findings", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicTriage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicTriage" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value:
          "powershell -enc AAAA Invoke-Expression https://example.com CVE-2024-12345 admin@example.com"
      }
    });

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const report = JSON.parse(out.output.value) as {
      score: { riskScoreNorm: number; verdict: string; reasons: string[] };
      findings: Array<{ id: string }>;
      mockedCapabilities: string[];
      exports: {
        stixBundle: { type: string; objects: Array<Record<string, unknown>> };
        mispEvent: { Event: { Attribute: Array<{ type: string; value: string }> } };
      };
      recommendations: string[];
      preTriage: {
        iocs: { cves: string[] };
        hashes: { tlsh: string | null; ssdeep: string | null };
      };
    };

    expect(report.score.riskScoreNorm).toBeGreaterThan(0);
    expect(["benign", "suspicious", "malicious"]).toContain(report.score.verdict);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.preTriage.iocs.cves).toEqual(["CVE-2024-12345"]);
    expect(report.mockedCapabilities).not.toContain("md5_digest_generation");
    expect(report.mockedCapabilities).toContain("pe_imphash");
    if (report.preTriage.hashes.tlsh === null) {
      expect(report.mockedCapabilities).toContain("tlsh_fuzzy_hash");
    } else {
      expect(report.mockedCapabilities).not.toContain("tlsh_fuzzy_hash");
    }
    if (report.preTriage.hashes.ssdeep === null) {
      expect(report.mockedCapabilities).toContain("ssdeep_fuzzy_hash");
    } else {
      expect(report.mockedCapabilities).not.toContain("ssdeep_fuzzy_hash");
    }
    expect(report.mockedCapabilities).not.toContain("stix_export");
    expect(report.mockedCapabilities).not.toContain("misp_export");
    expect(report.mockedCapabilities).toContain("dynamic_sandbox_integration_cuckoo");
    expect(report.exports.stixBundle.type).toBe("bundle");
    expect(report.exports.stixBundle.objects.length).toBeGreaterThan(0);
    expect(
      report.exports.mispEvent.Event.Attribute.some(
        (attr) => attr.type === "vulnerability" && attr.value === "CVE-2024-12345"
      )
    ).toBe(true);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  it("allows threshold tuning through args", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicTriage);
    const recipe: Recipe = {
      version: 1,
      steps: [
        {
          opId: "forensic.basicTriage",
          args: { suspiciousThreshold: 5, maliciousThreshold: 10 }
        }
      ]
    };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "CVE-2021-44228 https://evil.example" }
    });

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const report = JSON.parse(out.output.value) as {
      score: { riskScoreNorm: number; verdict: string };
    };
    expect(report.score.riskScoreNorm).toBeGreaterThan(0);
    expect(["suspicious", "malicious"]).toContain(report.score.verdict);
  });

  it("removes pe_imphash from mocked capabilities when imphash is computed", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicTriage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicTriage" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: makeImportPeSample() }
    });

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const report = JSON.parse(out.output.value) as {
      preTriage: { hashes: { imphash: string | null } };
      mockedCapabilities: string[];
    };
    expect(report.preTriage.hashes.imphash).not.toBeNull();
    expect(report.mockedCapabilities).not.toContain("pe_imphash");
  });
});
