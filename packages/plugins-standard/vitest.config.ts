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
    include: ["test/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      thresholds: {
        statements: 45,
        branches: 15,
        functions: 30,
        lines: 55
      }
    }
  }
});
