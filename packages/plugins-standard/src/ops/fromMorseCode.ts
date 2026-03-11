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
  description: "Decodes International Morse code with configurable delimiters.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "letterDelimiter",
      label: "Letter delimiter",
      type: "string",
      defaultValue: " "
    },
    {
      key: "wordDelimiter",
      label: "Word delimiter",
      type: "string",
      defaultValue: " / "
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }
    const normalized = input.value.trim();
    if (!normalized) {
      return { type: "string", value: "" };
    }

    const wordDelimiter =
      typeof args.wordDelimiter === "string" ? args.wordDelimiter : " / ";
    const letterDelimiter =
      typeof args.letterDelimiter === "string" ? args.letterDelimiter : " ";
    const words =
      wordDelimiter.length > 0
        ? normalized.split(wordDelimiter).map((word) => word.trim()).filter(Boolean)
        : [normalized];
    const decodedWords = words.map((word) =>
      (letterDelimiter.length > 0 ? word.split(letterDelimiter) : [word])
        .map((token) => token.trim())
        .filter(Boolean)
        .map((token) => {
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
