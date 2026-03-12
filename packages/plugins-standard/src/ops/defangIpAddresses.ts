import type { Operation } from "@cybermasterchef/core";
import { defangIPs } from "./defangIPs.js";

export const defangIpAddresses: Operation = {
  id: "network.defangIpAddresses",
  name: "Defang IP Addresses",
  description: "Defangs IPv4 addresses by replacing dots with [.] markers.",
  input: ["string"],
  output: "string",
  args: [],
  run: (ctx) => defangIPs.run(ctx)
};
