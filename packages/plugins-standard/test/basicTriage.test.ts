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

function makeMinimalZipSample(): Uint8Array {
  const data = new Uint8Array(64);
  data[0] = 0x50;
  data[1] = 0x4b;
  data[2] = 0x03;
  data[3] = 0x04;
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
      integrations: { sandbox: { status: string } };
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
    expect(report.integrations.sandbox.status).toBe("disabled");
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
      };
      expect(report.integrations.sandbox.status).toBe("submitted");
      expect(report.integrations.sandbox.attempted).toBe(true);
      expect(report.integrations.sandbox.submissionId).toBe("sub-123");
      expect(report.integrations.sandbox.responseCode).toBe(202);
      expect(report.mockedCapabilities).not.toContain("dynamic_sandbox_integration_cuckoo");
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
      requestBody = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
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
      expect(requestBody).toMatchObject({
        inputType: "string",
        sizeBytes: 10,
        verdict: expect.any(String),
        riskScoreNorm: expect.any(Number),
        sampleBase64: "cmV0cnktY2FzZQ=="
      });
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
      requestBodies.set(url, JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>);
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
        input: { type: "bytes", value: makeMinimalZipSample() }
      });
      expect(out.output.type).toBe("string");
      if (out.output.type !== "string") return;
      const report = JSON.parse(out.output.value) as {
        mockedCapabilities: string[];
        integrations: {
          zipPasswordPipeline: { status: string; matchedPassword: string | null };
          yara: { status: string; matchCount: number; ruleMatches: string[] };
        };
      };
      expect(report.integrations.zipPasswordPipeline.status).toBe("submitted");
      expect(report.integrations.zipPasswordPipeline.matchedPassword).toBe("infected");
      expect(report.integrations.yara.status).toBe("submitted");
      expect(report.integrations.yara.matchCount).toBe(2);
      expect(requestBodies.get("https://zip.local/submit")).toMatchObject({
        sizeBytes: 64,
        candidates: ["infected", "password", "123456"],
        archiveBase64: expect.any(String)
      });
      expect(requestBodies.get("https://yara.local/scan")).toMatchObject({
        inputType: "bytes",
        sizeBytes: 64,
        profile: "default-malware",
        sampleBase64: expect.any(String),
        heuristics: expect.any(Array)
      });
      expect(report.mockedCapabilities).not.toContain(
        "archive_password_handling_and_zip_unpacking"
      );
      expect(report.mockedCapabilities).toContain("zip_slip_and_zip_bomb_safe_unpack_guards");
      expect(report.mockedCapabilities).not.toContain("yara_or_yara_x_rule_scanning");
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
        input: { type: "bytes", value: makeMinimalZipSample() }
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
      expect(report.mockedCapabilities).toContain("zip_slip_and_zip_bomb_safe_unpack_guards");
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
        input: { type: "bytes", value: makeMinimalZipSample() }
      })
    ).rejects.toThrow("ZIP endpoint host not allowlisted");
  });
});
