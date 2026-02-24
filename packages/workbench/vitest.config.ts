import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@cybermasterchef/core": new URL("../core/src/index.ts", import.meta.url)
        .pathname
    }
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 95,
        lines: 80
      }
    }
  }
});
