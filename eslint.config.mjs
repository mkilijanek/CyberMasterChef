import js from "@eslint/js";
import tseslint from "typescript-eslint";
export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { "prefer": "type-imports" }
      ]
    }
  },
  {
    files: ["packages/plugins-standard/src/ops/**/*.ts"],
    rules: {
      "no-control-regex": "off",
      "no-useless-escape": "off",
      "no-regex-spaces": "off"
    }
  },
  {
    ignores: [
      "**/dist/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/.vite/**",
      "**/node_modules/**"
    ]
  }
];
