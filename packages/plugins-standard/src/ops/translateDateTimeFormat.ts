import type { Operation } from "@cybermasterchef/core";
import { formatDateTime, parseDateTime } from "./dateTimeUtils.js";

export const translateDateTimeFormat: Operation = {
  id: "date.translateDateTimeFormat",
  name: "Translate Date Time Format",
  description: "Parses a datetime string with one format and renders another.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "fromFormat",
      label: "From Format",
      type: "string",
      defaultValue: ""
    },
    {
      key: "toFormat",
      label: "To Format",
      type: "string",
      defaultValue: "YYYY-MM-DDTHH:mm:ss.SSSZ"
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const fromFormat = typeof args.fromFormat === "string" ? args.fromFormat : "";
    if (!fromFormat) throw new Error("From format argument is required");
    const toFormat = typeof args.toFormat === "string" ? args.toFormat : "";
    if (!toFormat) throw new Error("To format argument is required");

    const date = parseDateTime(input.value, fromFormat);
    return { type: "string", value: formatDateTime(date, toFormat) };
  }
};
