# Contributing

## Operation rules

Every operation must:
- Have unit tests covering at least one happy path and one edge case
- Be deterministic (same input + args → same output)
- Not perform network I/O
- Not mutate global state
- Declare its input types and output type

## How to add an operation

1. Create a file in `packages/plugins-standard/src/ops/`
2. Export it from `packages/plugins-standard/src/index.ts`
3. Add tests
4. Run the full check: `pnpm lint && pnpm typecheck && pnpm test`

## Code standards

- TypeScript strict — no `any`
- Public API functions have JSDoc
- UI components: keyboard-accessible, correct ARIA roles where needed
- Use `import type { Foo }` for type-only imports

## Pull requests

- Target: `main`
- CI must pass (lint + typecheck + test + build)
- One logical change per PR
