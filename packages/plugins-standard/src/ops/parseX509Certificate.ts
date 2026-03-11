import type { Operation } from "@cybermasterchef/core";
import { parseX509CertificateBytes, parseX509Input } from "./x509Utils.js";

export const parseX509Certificate: Operation = {
  id: "network.parseX509Certificate",
  name: "Parse X.509 Certificate",
  description: "Parses a DER or PEM X.509 certificate into normalized metadata.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes = parseX509Input(
      input.type === "bytes" ? input.value : input.value,
      "CERTIFICATE"
    );
    return { type: "json", value: parseX509CertificateBytes(bytes) };
  }
};
