import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 70,
        lines: 80
      }
    }
  }
});
