import { describe, expect, it } from "vitest";

describe("C1 domain taxonomy", () => {
  it("reclassifies image, structured, network, and forensic misc gaps", async () => {
    const moduleUrl = new URL("../../../scripts/c1/domain-taxonomy.mjs", import.meta.url);
    const { classifyOperation } = (await import(moduleUrl.href)) as {
      classifyOperation: (operationName: string, fileName: string) => { domain: string };
    };
    expect(classifyOperation("ParseQRCode", "ParseQRCode.mjs").domain).toBe("data-formats");
    expect(classifyOperation("RenderMarkdown", "RenderMarkdown.mjs").domain).toBe("data-formats");
    expect(classifyOperation("JA3Fingerprint", "JA3Fingerprint.mjs").domain).toBe(
      "network-protocol-parsers"
    );
    expect(classifyOperation("SSDEEP", "SSDEEP.mjs").domain).toBe("forensic-malware-helper");
  });
});
