import { describe, expect, it } from "vitest";
import { hexNeighbors } from "./hex";

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
