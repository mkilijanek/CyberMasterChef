import type { Operation } from "@cybermasterchef/core";

const MORSE_MAP = new Map<string, string>([
  [".-", "A"], ["-...", "B"], ["-.-.", "C"], ["-..", "D"], [".", "E"], ["..-.", "F"],
  ["--.", "G"], ["....", "H"], ["..", "I"], [".---", "J"], ["-.-", "K"], [".-..", "L"],
  ["--", "M"], ["-.", "N"], ["---", "O"], [".--.", "P"], ["--.-", "Q"], [".-.", "R"],
  ["...", "S"], ["-", "T"], ["..-", "U"], ["...-", "V"], [".--", "W"], ["-..-", "X"],
  ["-.--", "Y"], ["--..", "Z"],
  ["-----", "0"], [".----", "1"], ["..---", "2"], ["...--", "3"], ["....-", "4"],
  [".....", "5"], ["-....", "6"], ["--...", "7"], ["---..", "8"], ["----.", "9"],
  [".-.-.-", "."], ["--..--", ","], ["..--..", "?"], ["-.-.--", "!"], ["-..-.", "/"],
  ["-....-", "-"], ["-.--.", "("], ["-.--.-", ")"], [".--.-.", "@"], ["---...", ":"]
]);

export const fromMorseCode: Operation = {
  id: "codec.fromMorseCode",
  name: "From Morse Code",
  description: "Decodes International Morse code using spaces and / between words.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }
    const normalized = input.value.trim();
    if (!normalized) {
      return { type: "string", value: "" };
    }

    const words = normalized.split(/\s*\/\s*/).filter(Boolean);
    const decodedWords = words.map((word) =>
      word.split(/\s+/).map((token) => {
        const decoded = MORSE_MAP.get(token);
        if (!decoded) {
          throw new Error(`Invalid Morse token: ${token}`);
        }
        return decoded;
      }).join("")
    );
    return { type: "string", value: decodedWords.join(" ") };
  }
};
