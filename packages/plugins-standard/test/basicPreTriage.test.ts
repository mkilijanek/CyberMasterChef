import { describe, expect, it } from "vitest";
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
      hashes: { sha256: string | null; md5: string | null };
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
});
