import type { DataValue, Recipe } from "@cybermasterchef/core";

export type WorkerRequest =
  | { type: "init" }
  | { type: "bake"; id: string; recipe: Recipe; input: DataValue };

export type WorkerResponse =
  | { type: "ready" }
  | {
      type: "result";
      id: string;
      output: DataValue;
      trace: Array<{ step: number; opId: string }>;
    }
  | { type: "error"; id: string; message: string };
