import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyRecipe } from "@cybermasterchef/core";
import { fromBase64Url, isRecipe, loadInitialState, toBase64Url } from "./App";

describe("App helpers", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value)
    });
    vi.stubGlobal("window", {
      location: { hash: "", pathname: "/", search: "", origin: "http://localhost" },
      history: { replaceState: vi.fn() }
    });
  });

  it("validates recipes and base64-url helpers", () => {
    expect(isRecipe({ version: 1, steps: [] })).toBe(true);
    expect(isRecipe({ version: 2, steps: [] })).toBe(false);

    const encoded = toBase64Url("hello");
    expect(fromBase64Url(encoded)).toBe("hello");
  });

  it("loads initial state from hash and localStorage fallback", () => {
    const recipe = { version: 1 as const, steps: [{ opId: "codec.toHex" }] };
    const payload = toBase64Url(JSON.stringify({ recipe, input: "abc" }));
    window.location.hash = `#state=${payload}`;

    expect(loadInitialState()).toEqual({ recipe, input: "abc" });

    window.location.hash = "";
    localStorage.setItem("recipe.v1", JSON.stringify(recipe));
    localStorage.setItem("input.v1", "from-storage");
    expect(loadInitialState()).toEqual({ recipe, input: "from-storage" });

    localStorage.setItem("recipe.v1", "broken");
    expect(loadInitialState()).toEqual({ recipe: emptyRecipe(), input: "from-storage" });
  });

  it("falls back to storage when hash payload is invalid or not a recipe", () => {
    const storedRecipe = { version: 1 as const, steps: [{ opId: "text.reverse" }] };
    localStorage.setItem("recipe.v1", JSON.stringify(storedRecipe));
    localStorage.setItem("input.v1", "storage-input");

    window.location.hash = "#state=%%%";
    expect(loadInitialState()).toEqual({ recipe: storedRecipe, input: "storage-input" });

    window.location.hash = `#state=${toBase64Url(JSON.stringify({ recipe: { version: 2 }, input: 7 }))}`;
    expect(loadInitialState()).toEqual({ recipe: storedRecipe, input: "storage-input" });
  });
});
