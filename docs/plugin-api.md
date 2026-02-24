# Plugin API

## Operation contract

```ts
interface Operation {
  id: string;           // unique, namespaced: "codec.toBase64"
  name: string;         // human-readable
  description: string;
  input: ValueType[];   // accepted input types
  output: ValueType;    // output type
  args: ArgSpec[];      // declared arguments
  run(ctx: OperationContext): Promise<DataValue> | DataValue;
}
```

## Rules for operations

1. **Pure**: no global state mutation, no I/O except the input value.
2. **No network**: no `fetch`, no `XHR`, no WebSocket.
3. **No eval / dynamic import from user data**.
4. **Deterministic** for the same (input, args) → same output.
5. **Declare input types**: coercion is automatic, but narrowing input helps UX.

## Registering a plugin

```ts
const myPlugin: Plugin = {
  pluginId: "my-plugin",
  version: "1.0.0",
  register(registry) {
    registry.register(myOperation);
  }
};
```

## Adding to built-ins

Edit `packages/plugins-standard/src/index.ts` to include new operations.
For new operation groups, create a separate package (e.g. `packages/ops-crypto`).

## ArgSpec types

| type | UI control |
|---|---|
| `string` | text input |
| `number` | number input |
| `boolean` | checkbox |
| `select` | dropdown (requires `options`) |
