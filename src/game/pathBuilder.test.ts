import { describe, expect, it } from "vitest";
import { stepPath } from "./pathBuilder";

describe("stepPath", () => {
  it("arranca el camino con la primera celda", () => {
    expect(stepPath([], { r: 0, c: 0 }, 0)).toEqual([{ r: 0, c: 0 }]);
  });

  it("agrega una vecina hexagonal válida", () => {
    // Vecinos hexagonales de (0,2) en fila par incluyen (1,1) y (1,2).
    const path = stepPath([{ r: 0, c: 2 }], { r: 1, c: 2 }, 0);
    expect(path).toEqual([{ r: 0, c: 2 }, { r: 1, c: 2 }]);
  });

  it("no agrega una celda que no es vecina", () => {
    const path = stepPath([{ r: 0, c: 0 }], { r: 5, c: 5 }, 0);
    expect(path).toEqual([{ r: 0, c: 0 }]);
  });

  it("retrocede un paso si se vuelve a la anteúltima celda", () => {
    const start = [{ r: 0, c: 2 }, { r: 1, c: 2 }];
    const path = stepPath(start, { r: 0, c: 2 }, 0);
    expect(path).toEqual([{ r: 0, c: 2 }]);
  });

  it("no repite una celda que ya está en el camino (y no es un retroceso)", () => {
    const start = [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 0, c: 3 }];
    // (1,2) es vecina de la última celda (0,3), pero ya está en el camino
    // (y no es la anteúltima, así que no cuenta como retroceso).
    const path = stepPath(start, { r: 1, c: 2 }, 0);
    expect(path).toEqual(start);
  });

  it("no cambia nada si se toca la misma celda actual de nuevo", () => {
    const start = [{ r: 0, c: 0 }];
    expect(stepPath(start, { r: 0, c: 0 }, 0)).toBe(start);
  });
});
