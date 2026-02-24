import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { basicTriage } from "../src/ops/basicTriage.js";

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
      recommendations: string[];
      preTriage: { iocs: { cves: string[] } };
    };

    expect(report.score.riskScoreNorm).toBeGreaterThan(0);
    expect(["benign", "suspicious", "malicious"]).toContain(report.score.verdict);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.preTriage.iocs.cves).toEqual(["CVE-2024-12345"]);
    expect(report.mockedCapabilities).toContain("md5_digest_generation");
    expect(report.mockedCapabilities).toContain("dynamic_sandbox_integration_cuckoo");
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
});
