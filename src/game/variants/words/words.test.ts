import { describe, expect, it } from "vitest";
import { isValidWord } from "./words";

describe("isValidWord", () => {
  it("acepta una palabra real del diccionario", () => {
    expect(isValidWord("SOL", "es")).toBe(true);
  });

  it("rechaza algo que no es palabra", () => {
    expect(isValidWord("XQZ", "es")).toBe(false);
  });

  it("rechaza palabras de menos de 3 letras, aunque existan", () => {
    expect(isValidWord("YO", "es")).toBe(false);
  });

  it("usa el diccionario del idioma correcto", () => {
    expect(isValidWord("DOG", "en")).toBe(true);
    expect(isValidWord("DOG", "es")).toBe(false);
  });
});
