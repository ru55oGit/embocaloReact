import { describe, expect, it } from "vitest";
import { hexNeighbors, isValidCell, nearestCell } from "./hex";
import { GRID_SIZE } from "./constants";

function has(neighbors: ReturnType<typeof hexNeighbors>, r: number, c: number): boolean {
  return neighbors.some((n) => n.r === r && n.c === c);
}

describe("hexNeighbors", () => {
  it("siempre devuelve 6 vecinos", () => {
    expect(hexNeighbors(3, 3, 0).length).toBe(6);
    expect(hexNeighbors(3, 3, 1).length).toBe(6);
  });

  // Esto es el bug real que se arregló: después de que baja el techo, los
  // índices de fila existentes se corren uno, así que la paridad "cruda"
  // (r%2) ya no refleja la posición física real de cada celda — rowPhase
  // compensa eso. Sin esto, un pop/flood-fill después de una bajada de
  // techo juzgaba como "no conectado" algo que seguía tocándose de verdad
  // (las frutas/letras flotantes que se reportaron).
  it("rowPhase cambia cuáles son los vecinos de abajo de la fila 0", () => {
    const phase0 = hexNeighbors(0, 2, 0);
    const phase1 = hexNeighbors(0, 2, 1);

    // Con rowPhase=0, fila 0 par: vecinos de abajo son (1,1) y (1,2).
    expect(has(phase0, 1, 1)).toBe(true);
    expect(has(phase0, 1, 2)).toBe(true);
    expect(has(phase0, 1, 3)).toBe(false);

    // Con rowPhase=1, la fila 0 pasa a tratarse como "impar": vecinos de
    // abajo son (1,2) y (1,3) en cambio.
    expect(has(phase1, 1, 2)).toBe(true);
    expect(has(phase1, 1, 3)).toBe(true);
    expect(has(phase1, 1, 1)).toBe(false);
  });

  it("rowPhase=2 (una vuelta completa) vuelve a dar la misma tabla que rowPhase=0", () => {
    expect(hexNeighbors(4, 4, 2)).toEqual(hexNeighbors(4, 4, 0));
  });
});

describe("isValidCell", () => {
  it("la última columna es válida en una fila par, pero no en una impar", () => {
    expect(isValidCell(0, GRID_SIZE - 1, 0)).toBe(true);
    expect(isValidCell(1, GRID_SIZE - 1, 0)).toBe(false);
  });

  it("rowPhase invierte cuál fila física es la impar", () => {
    expect(isValidCell(0, GRID_SIZE - 1, 1)).toBe(false);
    expect(isValidCell(1, GRID_SIZE - 1, 1)).toBe(true);
  });
});

describe("nearestCell", () => {
  it("clampea la columna al máximo de una fila par (GRID_SIZE - 1)", () => {
    const { r, c } = nearestCell(10_000, 18, 0);
    expect(r).toBe(0);
    expect(c).toBe(GRID_SIZE - 1);
  });

  it("clampea la columna al máximo de una fila impar (una menos que la par)", () => {
    // rowPhase=1 vuelve "impar" a la fila 0 (ver hexNeighbors.test más
    // arriba) — ahí el máximo tiene que ser una columna menos.
    const { r, c } = nearestCell(10_000, 18, 1);
    expect(r).toBe(0);
    expect(c).toBe(GRID_SIZE - 2);
    expect(isValidCell(r, c, 1)).toBe(true);
  });
});
