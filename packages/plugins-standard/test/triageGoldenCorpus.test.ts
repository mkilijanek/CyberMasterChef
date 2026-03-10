import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { basicPreTriage } from "../src/ops/basicPreTriage.js";
import { basicTriage } from "../src/ops/basicTriage.js";
import { TRIAGE_CORPUS } from "./fixtures/triageCorpus.js";

describe("triage golden corpus", () => {
  const registry = new InMemoryRegistry();
  registry.register(basicPreTriage);
  registry.register(basicTriage);

  for (const fixture of TRIAGE_CORPUS) {
    it(`keeps pre-triage and triage stable for ${fixture.id}`, async () => {
      const preRecipe: Recipe = { version: 1, steps: [{ opId: "forensic.basicPreTriage" }] };
      const triageRecipe: Recipe = {
        version: 1,
        steps: [{ opId: "forensic.basicTriage", args: fixture.triageArgs ?? {} }]
      };

      const preOut = await runRecipe({ registry, recipe: preRecipe, input: fixture.input });
      const triageOut = await runRecipe({ registry, recipe: triageRecipe, input: fixture.input });

      expect(preOut.output.type).toBe("string");
      expect(triageOut.output.type).toBe("string");
      if (preOut.output.type !== "string" || triageOut.output.type !== "string") return;

      const pre = JSON.parse(preOut.output.value) as {
        binaryAnalysis: { format: string };
        trustAnalysis: { status: string };
      };
      const triage = JSON.parse(triageOut.output.value) as {
        score: { verdict: string };
        findings: Array<{ id: string }>;
        mockedCapabilities: string[];
        archiveAnalysis: { format: string };
        preTriage: {
          binaryAnalysis: { format: string };
          trustAnalysis: { status: string };
        };
      };

      const effectiveFormat =
        triage.archiveAnalysis.format === "zip"
          ? "zip"
          : (pre.binaryAnalysis.format as "text" | "pe" | "elf" | "macho" | "unknown");

      expect(effectiveFormat).toBe(fixture.expected.preFormat);
      expect(pre.trustAnalysis.status).toBe(fixture.expected.trustStatus);
      expect(triage.preTriage.trustAnalysis.status).toBe(fixture.expected.trustStatus);
      expect(triage.score.verdict).toBe(fixture.expected.verdict);

      const findingIds = triage.findings.map((finding) => finding.id);
      for (const expectedId of fixture.expected.findingIds) {
        expect(findingIds).toContain(expectedId);
      }
      for (const expectedId of fixture.expected.mockedPresent) {
        expect(triage.mockedCapabilities).toContain(expectedId);
      }
      for (const expectedId of fixture.expected.mockedAbsent) {
        expect(triage.mockedCapabilities).not.toContain(expectedId);
      }
    });
  }
});
