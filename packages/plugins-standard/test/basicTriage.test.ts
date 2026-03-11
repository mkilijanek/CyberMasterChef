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

function base64ToBytes(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64"));
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

function parseRequestBody(init?: RequestInit): Record<string, unknown> {
  if (typeof init?.body !== "string") {
    throw new Error("Expected JSON request body");
  }
  return JSON.parse(init.body) as Record<string, unknown>;
}

function expectRequestBody(body: Record<string, unknown> | null): Record<string, unknown> {
  if (body === null) {
    throw new Error("Expected request body");
  }
  return body;
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
      provenance: {
        derivedIndicators: Array<{
          kind: string;
          value: string;
          sourcePath: string;
          exports: { stixIndicatorId: string; mispAttribute: { type: string; value: string } };
        }>;
      };
      evidenceBundle: {
        schemaVersion: number;
        generatedAt: string;
        hashSummary: { sha256: string | null; ssdeep: string | null };
        iocSummary: { urls: number; cves: number };
        exportSummary: { stixObjectCount: number; mispAttributeCount: number };
        provenance: { derivedIndicators: Array<{ value: string }> };
      };
      integrations: { sandbox: { status: string } };
      preTriage: {
        iocs: { urls: string[]; cves: string[] };
        hashes: { sha256: string | null; tlsh: string | null; ssdeep: string | null };
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
    expect(report.integrations.sandbox.status).toBe("disabled");
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(
      report.provenance.derivedIndicators.some(
        (indicator) =>
          indicator.value === "https://example.com" &&
          indicator.sourcePath === "preTriage.iocs.urls" &&
          indicator.exports.mispAttribute.type === "url"
      )
    ).toBe(true);
    expect(report.evidenceBundle.schemaVersion).toBe(1);
    expect(report.evidenceBundle.generatedAt).toBe("1970-01-01T00:00:00.000Z");
    expect(report.evidenceBundle.hashSummary.sha256).toBe(report.preTriage.hashes.sha256);
    expect(report.evidenceBundle.hashSummary.ssdeep).toBe(report.preTriage.hashes.ssdeep);
    expect(report.evidenceBundle.iocSummary.urls).toBe(report.preTriage.iocs.urls.length);
    expect(report.evidenceBundle.iocSummary.cves).toBe(report.preTriage.iocs.cves.length);
    expect(report.evidenceBundle.exportSummary.stixObjectCount).toBe(
      report.exports.stixBundle.objects.length
    );
    expect(report.evidenceBundle.exportSummary.mispAttributeCount).toBe(
      report.exports.mispEvent.Event.Attribute.length
    );
    expect(report.evidenceBundle.provenance.derivedIndicators).toHaveLength(
      report.provenance.derivedIndicators.length
    );
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

  it("reports embedded certificate metadata and removes trust mock for signed PE samples", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicTriage);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicTriage" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "bytes", value: makeSignedPeSample() }
    });

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const report = JSON.parse(out.output.value) as {
      mockedCapabilities: string[];
      findings: Array<{ id: string }>;
      preTriage: {
        trustAnalysis: { status: string; subject: string | null; issuer: string | null };
      };
    };
    expect(report.preTriage.trustAnalysis.status).toBe("signed");
    expect(report.preTriage.trustAnalysis.subject).toContain("CN=CyberMasterChef Test");
    expect(report.preTriage.trustAnalysis.issuer).toContain("O=OpenAI Dev");
    expect(report.findings.some((finding) => finding.id === "embedded-certificate")).toBe(true);
    expect(report.mockedCapabilities).not.toContain("authenticode_or_x509_verification");
  });

  it("submits sandbox payload for CLI profile and removes sandbox mock capability", async () => {
    const prevFetch = globalThis.fetch;
    globalThis.fetch = () =>
      Promise.resolve(new Response(JSON.stringify({ submissionId: "sub-123" }), { status: 202 }));
    try {
      const registry = new InMemoryRegistry();
      registry.register(basicTriage);
      const recipe: Recipe = {
        version: 1,
        steps: [
          {
            opId: "forensic.basicTriage",
            args: {
              enableSandboxSubmit: true,
              sandboxRuntimeProfile: "cli",
              sandboxEndpoint: "https://sandbox.local/submit",
              sandboxAllowHosts: "sandbox.local",
              sandboxTimeoutMs: 1000,
              sandboxRetries: 0
            }
          }
        ]
      };
      const out = await runRecipe({
        registry,
        recipe,
        input: { type: "string", value: "http://example.test ioc" }
      });
      expect(out.output.type).toBe("string");
      if (out.output.type !== "string") return;
      const report = JSON.parse(out.output.value) as {
        mockedCapabilities: string[];
        integrations: {
          sandbox: {
            status: string;
            attempted: boolean;
            submissionId: string | null;
            responseCode: number | null;
          };
        };
        provenance: {
          adapterSubmissions: Array<{
            adapter: string;
            requestSummary: { verdict?: string; inputType?: string };
            responseSummary: { submissionId?: string | null };
          }>;
        };
      };
      expect(report.integrations.sandbox.status).toBe("submitted");
      expect(report.integrations.sandbox.attempted).toBe(true);
      expect(report.integrations.sandbox.submissionId).toBe("sub-123");
      expect(report.integrations.sandbox.responseCode).toBe(202);
      expect(report.mockedCapabilities).not.toContain("dynamic_sandbox_integration_cuckoo");
      const sandboxSubmission = report.provenance.adapterSubmissions.find(
        (submission) => submission.adapter === "sandbox"
      );
      expect(sandboxSubmission?.requestSummary.inputType).toBe("string");
      expect(sandboxSubmission?.responseSummary.submissionId).toBe("sub-123");
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it("rejects sandbox endpoint outside allowlist", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicTriage);
    const recipe: Recipe = {
      version: 1,
      steps: [
        {
          opId: "forensic.basicTriage",
          args: {
            enableSandboxSubmit: true,
            sandboxRuntimeProfile: "cli",
            sandboxEndpoint: "https://sandbox.local/submit",
            sandboxAllowHosts: "allowed.example"
          }
        }
      ]
    };
    await expect(
      runRecipe({
        registry,
        recipe,
        input: { type: "string", value: "sample" }
      })
    ).rejects.toThrow("Sandbox endpoint host not allowlisted");
  });

  it("retries sandbox submission and succeeds on later attempt", async () => {
    const prevFetch = globalThis.fetch;
    let callCount = 0;
    let requestBody: Record<string, unknown> | null = null;
    globalThis.fetch = ((url, init) => {
      callCount += 1;
      expect(url).toBe("https://sandbox.local/submit");
      requestBody = parseRequestBody(init);
      if (callCount === 1) {
        return Promise.resolve(new Response("temporary failure", { status: 500 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ submissionId: "sub-retry-1" }), { status: 202 }));
    }) as typeof fetch;

    try {
      const registry = new InMemoryRegistry();
      registry.register(basicTriage);
      const recipe: Recipe = {
        version: 1,
        steps: [
          {
            opId: "forensic.basicTriage",
            args: {
              enableSandboxSubmit: true,
              sandboxRuntimeProfile: "cli",
              sandboxEndpoint: "https://sandbox.local/submit",
              sandboxAllowHosts: "sandbox.local",
              sandboxTimeoutMs: 300,
              sandboxRetries: 1
            }
          }
        ]
      };
      const out = await runRecipe({
        registry,
        recipe,
        input: { type: "string", value: "retry-case" }
      });
      expect(out.output.type).toBe("string");
      if (out.output.type !== "string") return;
      const report = JSON.parse(out.output.value) as {
        integrations: { sandbox: { status: string; submissionId: string | null; responseCode: number | null } };
      };
      expect(callCount).toBe(2);
      const body = expectRequestBody(requestBody);
      expect(body.inputType).toBe("string");
      expect(body.sizeBytes).toBe(10);
      expect(typeof body.verdict).toBe("string");
      expect(typeof body.riskScoreNorm).toBe("number");
      expect(body.sampleBase64).toBe("cmV0cnktY2FzZQ==");
      expect(report.integrations.sandbox.status).toBe("submitted");
      expect(report.integrations.sandbox.submissionId).toBe("sub-retry-1");
      expect(report.integrations.sandbox.responseCode).toBe(202);
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it("marks sandbox integration as failed on timeout", async () => {
    const prevFetch = globalThis.fetch;
    globalThis.fetch = ((_url, init) => {
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        signal?.addEventListener(
          "abort",
          () => reject(new Error("sandbox-timeout")),
          { once: true }
        );
      });
    }) as typeof fetch;

    try {
      const registry = new InMemoryRegistry();
      registry.register(basicTriage);
      const recipe: Recipe = {
        version: 1,
        steps: [
          {
            opId: "forensic.basicTriage",
            args: {
              enableSandboxSubmit: true,
              sandboxRuntimeProfile: "cli",
              sandboxEndpoint: "https://sandbox.local/submit",
              sandboxAllowHosts: "sandbox.local",
              sandboxTimeoutMs: 100,
              sandboxRetries: 0
            }
          }
        ]
      };
      const out = await runRecipe({
        registry,
        recipe,
        input: { type: "string", value: "timeout-case" }
      });
      expect(out.output.type).toBe("string");
      if (out.output.type !== "string") return;
      const report = JSON.parse(out.output.value) as {
        integrations: { sandbox: { status: string; error: string | null } };
      };
      expect(report.integrations.sandbox.status).toBe("failed");
      expect(report.integrations.sandbox.error).toContain("sandbox-timeout");
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it("submits ZIP and YARA adapters and removes corresponding mocks", async () => {
    const prevFetch = globalThis.fetch;
    const requestBodies = new Map<string, Record<string, unknown>>();
    globalThis.fetch = ((url: string, init?: RequestInit) => {
      requestBodies.set(url, parseRequestBody(init));
      if (url.includes("zip.local")) {
        return Promise.resolve(
          new Response(JSON.stringify({ matchedPassword: "infected" }), { status: 200 })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ ruleMatches: ["MAL_Generic_1", "MAL_Generic_2"] }), {
          status: 200
        })
      );
    }) as typeof fetch;

    try {
      const registry = new InMemoryRegistry();
      registry.register(basicTriage);
      const recipe: Recipe = {
        version: 1,
        steps: [
          {
            opId: "forensic.basicTriage",
            args: {
              enableZipPasswordPipeline: true,
              zipRuntimeProfile: "cli",
              zipEndpoint: "https://zip.local/submit",
              zipAllowHosts: "zip.local",
              zipCandidatePasswords: "infected,password,123456",
              enableYaraScan: true,
              yaraRuntimeProfile: "cli",
              yaraEndpoint: "https://yara.local/scan",
              yaraAllowHosts: "yara.local",
              yaraProfile: "default-malware"
            }
          }
        ]
      };
      const out = await runRecipe({
        registry,
        recipe,
        input: {
          type: "bytes",
          value: makeZipSample([{ name: "docs/readme.txt", content: new TextEncoder().encode("safe") }])
        }
      });
      expect(out.output.type).toBe("string");
      if (out.output.type !== "string") return;
      const report = JSON.parse(out.output.value) as {
        mockedCapabilities: string[];
        archiveAnalysis: {
          format: string;
          entryCount: number;
          suspiciousPaths: string[];
          guards: { safeToSubmit: boolean; enforced: boolean };
        };
        integrations: {
          zipPasswordPipeline: { status: string; matchedPassword: string | null };
          yara: { status: string; matchCount: number; ruleMatches: string[] };
        };
        provenance: {
          adapterSubmissions: Array<{
            adapter: string;
            requestSummary: { archiveSafeToSubmit?: boolean; profile?: string };
            responseSummary: { matchedPassword?: string | null; matchCount?: number };
          }>;
        };
        evidenceBundle: {
          archiveSummary: { format: string; entryCount: number; safeToSubmit: boolean };
        };
      };
      expect(report.integrations.zipPasswordPipeline.status).toBe("submitted");
      expect(report.integrations.zipPasswordPipeline.matchedPassword).toBe("infected");
      expect(report.integrations.yara.status).toBe("submitted");
      expect(report.integrations.yara.matchCount).toBe(2);
      const zipRequest = requestBodies.get("https://zip.local/submit");
      const yaraRequest = requestBodies.get("https://yara.local/scan");
      expect(zipRequest).toBeDefined();
      expect(report.archiveAnalysis).toMatchObject({
        format: "zip",
        entryCount: 1,
        suspiciousPaths: [],
        guards: { safeToSubmit: true, enforced: true }
      });
      expect(zipRequest?.sizeBytes).toBe(49);
      expect(zipRequest?.candidates).toEqual(["infected", "password", "123456"]);
      expect(typeof zipRequest?.archiveBase64).toBe("string");
      expect(zipRequest?.archiveAnalysis).toMatchObject({
        entryCount: 1,
        suspiciousPaths: [],
        guards: { safeToSubmit: true }
      });
      expect(yaraRequest).toBeDefined();
      expect(yaraRequest?.inputType).toBe("bytes");
      expect(yaraRequest?.sizeBytes).toBe(49);
      expect(yaraRequest?.profile).toBe("default-malware");
      expect(typeof yaraRequest?.sampleBase64).toBe("string");
      expect(Array.isArray(yaraRequest?.heuristics)).toBe(true);
      expect(report.mockedCapabilities).not.toContain(
        "archive_password_handling_and_zip_unpacking"
      );
      expect(report.mockedCapabilities).not.toContain("zip_slip_and_zip_bomb_safe_unpack_guards");
      expect(report.mockedCapabilities).not.toContain("yara_or_yara_x_rule_scanning");
      const zipSubmission = report.provenance.adapterSubmissions.find(
        (submission) => submission.adapter === "zipPasswordPipeline"
      );
      const yaraSubmission = report.provenance.adapterSubmissions.find(
        (submission) => submission.adapter === "yara"
      );
      expect(zipSubmission?.requestSummary.archiveSafeToSubmit).toBe(true);
      expect(zipSubmission?.responseSummary.matchedPassword).toBe("infected");
      expect(yaraSubmission?.requestSummary.profile).toBe("default-malware");
      expect(yaraSubmission?.responseSummary.matchCount).toBe(2);
      expect(report.evidenceBundle.archiveSummary).toMatchObject({
        format: "zip",
        entryCount: 1,
        safeToSubmit: true
      });
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it("fails integrations on invalid success bodies", async () => {
    const prevFetch = globalThis.fetch;
    globalThis.fetch = ((url: string) => {
      if (url.includes("sandbox.local")) {
        return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 202 }));
      }
      if (url.includes("zip.local")) {
        return Promise.resolve(new Response("", { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ ruleMatches: ["ok", 2] }), { status: 200 }));
    }) as typeof fetch;

    try {
      const registry = new InMemoryRegistry();
      registry.register(basicTriage);
      const recipe: Recipe = {
        version: 1,
        steps: [
          {
            opId: "forensic.basicTriage",
            args: {
              enableSandboxSubmit: true,
              sandboxRuntimeProfile: "cli",
              sandboxEndpoint: "https://sandbox.local/submit",
              sandboxAllowHosts: "sandbox.local",
              enableZipPasswordPipeline: true,
              zipRuntimeProfile: "cli",
              zipEndpoint: "https://zip.local/submit",
              zipAllowHosts: "zip.local",
              enableYaraScan: true,
              yaraRuntimeProfile: "cli",
              yaraEndpoint: "https://yara.local/scan",
              yaraAllowHosts: "yara.local"
            }
          }
        ]
      };
      const out = await runRecipe({
        registry,
        recipe,
        input: {
          type: "bytes",
          value: makeZipSample([{ name: "docs/readme.txt", content: new TextEncoder().encode("safe") }])
        }
      });
      expect(out.output.type).toBe("string");
      if (out.output.type !== "string") return;
      const report = JSON.parse(out.output.value) as {
        mockedCapabilities: string[];
        integrations: {
          sandbox: { status: string; error: string | null };
          zipPasswordPipeline: { status: string; error: string | null };
          yara: { status: string; error: string | null };
        };
      };
      expect(report.integrations.sandbox).toMatchObject({
        status: "failed",
        error: "sandbox_invalid_response_body"
      });
      expect(report.integrations.zipPasswordPipeline).toMatchObject({
        status: "failed",
        error: "zip_invalid_response_body"
      });
      expect(report.integrations.yara).toMatchObject({
        status: "failed",
        error: "yara_invalid_response_body"
      });
      expect(report.mockedCapabilities).toContain("dynamic_sandbox_integration_cuckoo");
      expect(report.mockedCapabilities).toContain("archive_password_handling_and_zip_unpacking");
      expect(report.mockedCapabilities).not.toContain("zip_slip_and_zip_bomb_safe_unpack_guards");
      expect(report.mockedCapabilities).toContain("yara_or_yara_x_rule_scanning");
    } finally {
      globalThis.fetch = prevFetch;
    }
  });

  it("rejects ZIP endpoint outside allowlist", async () => {
    const registry = new InMemoryRegistry();
    registry.register(basicTriage);
    const recipe: Recipe = {
      version: 1,
      steps: [
        {
          opId: "forensic.basicTriage",
          args: {
            enableZipPasswordPipeline: true,
            zipRuntimeProfile: "cli",
            zipEndpoint: "https://zip.local/submit",
            zipAllowHosts: "allowed.example"
          }
        }
      ]
    };
    await expect(
      runRecipe({
        registry,
        recipe,
        input: {
          type: "bytes",
          value: makeZipSample([{ name: "docs/readme.txt", content: new TextEncoder().encode("safe") }])
        }
      })
    ).rejects.toThrow("ZIP endpoint host not allowlisted");
  });

  it("blocks ZIP pipeline when archive paths are unsafe", async () => {
    const prevFetch = globalThis.fetch;
    let called = false;
    globalThis.fetch = (() => {
      called = true;
      return Promise.resolve(new Response(JSON.stringify({ matchedPassword: "infected" }), { status: 200 }));
    }) as typeof fetch;

    try {
      const registry = new InMemoryRegistry();
      registry.register(basicTriage);
      const recipe: Recipe = {
        version: 1,
        steps: [
          {
            opId: "forensic.basicTriage",
            args: {
              enableZipPasswordPipeline: true,
              zipRuntimeProfile: "cli",
              zipEndpoint: "https://zip.local/submit",
              zipAllowHosts: "zip.local"
            }
          }
        ]
      };
      const out = await runRecipe({
        registry,
        recipe,
        input: {
          type: "bytes",
          value: makeZipSample([{ name: "../evil.exe", content: new TextEncoder().encode("boom") }])
        }
      });
      expect(out.output.type).toBe("string");
      if (out.output.type !== "string") return;
      const report = JSON.parse(out.output.value) as {
        mockedCapabilities: string[];
        archiveAnalysis: {
          suspiciousPaths: string[];
          guards: { pathTraversalSafe: boolean; safeToSubmit: boolean; reasons: string[] };
        };
        integrations: {
          zipPasswordPipeline: { status: string; error: string | null };
        };
      };
      expect(called).toBe(false);
      expect(report.archiveAnalysis.suspiciousPaths).toEqual(["../evil.exe"]);
      expect(report.archiveAnalysis.guards).toMatchObject({
        pathTraversalSafe: false,
        safeToSubmit: false
      });
      expect(report.archiveAnalysis.guards.reasons).toContain("zip_path_traversal_detected");
      expect(report.integrations.zipPasswordPipeline).toMatchObject({
        status: "failed",
        error: "zip_path_traversal_detected"
      });
      expect(report.mockedCapabilities).toContain("zip_slip_and_zip_bomb_safe_unpack_guards");
      expect(report.mockedCapabilities).toContain("archive_password_handling_and_zip_unpacking");
    } finally {
      globalThis.fetch = prevFetch;
    }
  });
});
