import { describe, expect, it } from "vitest";
import { randDigit, sumScore } from "./numbers";

describe("randDigit", () => {
  it("siempre devuelve un dígito del 1 al 9", () => {
    for (let i = 0; i < 200; i++) {
      const digit = randDigit();
      expect(digit).toBeGreaterThanOrEqual(1);
      expect(digit).toBeLessThanOrEqual(9);
      expect(Number.isInteger(digit)).toBe(true);
    }
  });
});

describe("sumScore", () => {
  it("da más puntos cuanto más larga la cadena sumada", () => {
    expect(sumScore(3)).toBeGreaterThan(sumScore(2));
    expect(sumScore(4)).toBeGreaterThan(sumScore(3));
  });
});
