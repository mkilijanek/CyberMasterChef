import { resolve } from "node:path";
import {
  validateDeterministicArtifacts,
  validateReleaseEvidenceDocs,
  validateRequiredFiles
} from "./readiness-lib.mjs";

const repoRoot = resolve(import.meta.dirname, "..", "..");
validateRequiredFiles(repoRoot);
validateDeterministicArtifacts(repoRoot);
validateReleaseEvidenceDocs(repoRoot);

process.stdout.write("[release] readiness checks passed\n");
