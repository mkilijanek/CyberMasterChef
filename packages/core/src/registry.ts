import type { Operation, OperationRegistry } from "./types.js";

export class InMemoryRegistry implements OperationRegistry {
  private readonly ops = new Map<string, Operation>();

  register(op: Operation): void {
    if (this.ops.has(op.id)) {
      throw new Error(`Duplicate operation id: ${op.id}`);
    }
    this.ops.set(op.id, op);
  }

  get(id: string): Operation | undefined {
    return this.ops.get(id);
  }

  list(): Operation[] {
    return [...this.ops.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
}
