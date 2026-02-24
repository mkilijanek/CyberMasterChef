import { InMemoryRegistry } from "@cybermasterchef/core";
import { standardPlugin } from "@cybermasterchef/plugins-standard";

export function createRegistryWithBuiltins(): InMemoryRegistry {
  const registry = new InMemoryRegistry();
  standardPlugin.register(registry);
  return registry;
}
