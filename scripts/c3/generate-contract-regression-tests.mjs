import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const contractsPath = resolve(repoRoot, "docs", "parity", "c3-operation-compatibility-contracts.json");
const outPath = resolve(
  repoRoot,
  "packages",
  "plugins-standard",
  "test",
  "generated",
  "c3-contracts.generated.test.ts"
);

const contracts = JSON.parse(readFileSync(contractsPath, "utf-8"));

const payload = contracts.map((contract) => ({
  operationId: contract.operationId,
  inputTypes: contract.inputTypes,
  outputType: contract.outputType,
  argKeys: Array.isArray(contract.argsSchema)
    ? contract.argsSchema.map((arg) => arg.key).filter((key) => typeof key === "string")
    : []
}));

const lines = [
  'import { describe, expect, it } from "vitest";',
  'import { InMemoryRegistry } from "@cybermasterchef/core";',
  'import { standardPlugin } from "../../src/index.js";',
  "",
  `const CONTRACTS = ${JSON.stringify(payload, null, 2)} as const;`,
  "",
  'describe("c3 generated contracts", () => {',
  '  it("keeps operation registry aligned with generated contracts", () => {',
  "    const registry = new InMemoryRegistry();",
  "    standardPlugin.register(registry);",
  "",
  "    for (const contract of CONTRACTS) {",
  "      const op = registry.get(contract.operationId);",
  "      expect(op, `missing operation ${contract.operationId}`).toBeDefined();",
  "      if (!op) continue;",
  "",
  "      expect([...op.input].sort()).toEqual([...contract.inputTypes].sort());",
  "      expect(op.output).toBe(contract.outputType);",
  "      expect(op.args.map((arg) => arg.key).sort()).toEqual([...contract.argKeys].sort());",
  "    }",
  "  });",
  "});",
  ""
];

mkdirSync(resolve(outPath, ".."), { recursive: true });
writeFileSync(outPath, `${lines.join("\n")}\n`, "utf-8");

process.stdout.write(`[c3] generated contract regression test -> ${outPath}\n`);
