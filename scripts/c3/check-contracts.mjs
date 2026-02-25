import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DOMAIN_ORDER } from "../c1/domain-taxonomy.mjs";
import { loadImplementedOperations } from "../c2/operation-inventory.mjs";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const contractsPath = resolve(repoRoot, "docs", "parity", "c3-operation-compatibility-contracts.json");
const contracts = JSON.parse(readFileSync(contractsPath, "utf-8"));
const implemented = loadImplementedOperations(repoRoot);

if (!Array.isArray(contracts)) {
  throw new Error("C3 contracts must be an array");
}

const implementedById = new Map(implemented.map((op) => [op.id, op]));
const contractIds = new Set();

for (const contract of contracts) {
  if (typeof contract !== "object" || contract === null) {
    throw new Error("Invalid contract entry shape");
  }
  const opId = contract.operationId;
  if (typeof opId !== "string" || opId.length === 0) {
    throw new Error("Contract with missing operationId");
  }
  if (contractIds.has(opId)) {
    throw new Error(`Duplicate contract id: ${opId}`);
  }
  contractIds.add(opId);

  const impl = implementedById.get(opId);
  if (!impl) {
    throw new Error(`Contract references unknown operation: ${opId}`);
  }

  if (!DOMAIN_ORDER.includes(contract.domain)) {
    throw new Error(`Invalid contract domain for ${opId}: ${contract.domain}`);
  }

  if (!Array.isArray(contract.inputTypes) || contract.inputTypes.length === 0) {
    throw new Error(`Invalid inputTypes for ${opId}`);
  }
  if (typeof contract.outputType !== "string" || contract.outputType.length === 0) {
    throw new Error(`Invalid outputType for ${opId}`);
  }
  if (typeof contract.deterministic !== "boolean") {
    throw new Error(`Invalid deterministic flag for ${opId}`);
  }
  if (!Array.isArray(contract.argsSchema)) {
    throw new Error(`Invalid argsSchema for ${opId}`);
  }
  if (typeof contract.errorTaxonomy !== "object" || contract.errorTaxonomy === null) {
    throw new Error(`Invalid errorTaxonomy for ${opId}`);
  }

  if (contract.outputType !== impl.output) {
    throw new Error(`Output mismatch for ${opId}: contract=${contract.outputType}, impl=${impl.output}`);
  }

  const contractInputs = [...contract.inputTypes].sort().join(",");
  const implInputs = [...impl.input].sort().join(",");
  if (contractInputs !== implInputs) {
    throw new Error(`Input mismatch for ${opId}: contract=${contractInputs}, impl=${implInputs}`);
  }
}

for (const op of implemented) {
  if (!contractIds.has(op.id)) {
    throw new Error(`Missing contract for operation: ${op.id}`);
  }
}

process.stdout.write(`[c3] contracts check passed for ${contracts.length} operations\n`);
