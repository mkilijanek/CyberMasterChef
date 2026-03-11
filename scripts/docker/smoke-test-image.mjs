import { execFileSync } from "node:child_process";
import {
  assertSecurityHeaders,
  extractAssetPaths
} from "./smoke-test-lib.mjs";

const image = process.argv[2];

if (!image) {
  console.error("Usage: node scripts/docker/smoke-test-image.mjs <image>");
  process.exit(1);
}

const containerName = `cybermasterchef-smoke-${Date.now()}`;

function run(command, args, options = {}) {
  return execFileSync(command, args, { stdio: "pipe", encoding: "utf8", ...options }).trim();
}

function fetchStatus(url) {
  return run("curl", [
    "--fail",
    "--silent",
    "--show-error",
    "--output",
    "/dev/null",
    "--write-out",
    "%{http_code}",
    url
  ]);
}

function fetchHeaders(url) {
  return run("curl", [
    "--fail",
    "--silent",
    "--show-error",
    "--head",
    url
  ]);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealthy() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const state = run("docker", [
      "inspect",
      "--format",
      "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}",
      containerName
    ]);
    if (state === "healthy" || state === "running") {
      return;
    }
    await sleep(1000);
  }
  throw new Error("Container did not become healthy in time");
}

async function main() {
  try {
    run("docker", ["run", "-d", "--rm", "--name", containerName, "-p", "18080:80", image]);
    await waitForHealthy();

    const body = run("curl", ["--fail", "--silent", "http://127.0.0.1:18080/"]);
    if (!body.includes("CyberMasterChef")) {
      throw new Error("Workbench index does not contain expected title marker");
    }
    assertSecurityHeaders(fetchHeaders("http://127.0.0.1:18080/"));

    const health = run("curl", ["--fail", "--silent", "http://127.0.0.1:18080/healthz"]);
    if (health.trim() !== "ok") {
      throw new Error("Health endpoint did not return ok");
    }

    const assetPaths = extractAssetPaths(body);
    if (assetPaths.length === 0) {
      throw new Error("No built assets were referenced by index.html");
    }

    for (const assetPath of assetPaths) {
      const status = fetchStatus(`http://127.0.0.1:18080${assetPath}`);
      if (status !== "200") {
        throw new Error(`Asset fetch returned unexpected status ${status} for ${assetPath}`);
      }
    }
  } finally {
    try {
      run("docker", ["rm", "-f", containerName]);
    } catch {
      // Container may already be gone if the run never started.
    }
  }
}

await main();
