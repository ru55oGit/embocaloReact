import { describe, expect, it } from "vitest";
import { VISIBLE_ROWS } from "./constants";
import { emptyGrid } from "./grid";
import { BOARD_WIDTH, cellCenter } from "./hex";
import { simulateFlight } from "./trajectory";

const ORIGIN_Y = VISIBLE_ROWS * 20; // bien abajo del tablero, cualquier valor "debajo de todo" sirve

describe("simulateFlight", () => {
  it("tablero vacío: tiro recto llega hasta pegarse al techo (fila 0)", () => {
    const grid = emptyGrid();
    const { x: originX } = cellCenter(0, 3, 0);
    const result = simulateFlight(grid, originX, ORIGIN_Y, 0, 0);
    expect(result.landing).not.toBeNull();
    expect(result.landing?.r).toBe(0);
  });

  it("se pega justo antes de la primera burbuja que encuentra, no adentro", () => {
    // Filas enteras ocupadas (no una sola columna): en una grilla hexagonal
    // las filas pares/impares están corridas media celda, así que un tiro
    // "derecho" puede pasar de una columna a la vecina al cruzar filas de
    // distinta paridad — llenar la fila completa evita que el test dependa
    // de esa deriva de columna, que es comportamiento esperado, no un bug.
    const grid = emptyGrid();
    for (let r = 0; r < 5; r++) grid[r].fill("🍎");
    const { x: originX } = cellCenter(VISIBLE_ROWS - 1, 3, 0);
    const result = simulateFlight(grid, originX, ORIGIN_Y, 0, 0);
    expect(result.landing).not.toBeNull();
    expect(result.landing?.r).toBe(5);
    expect(grid[result.landing!.r][result.landing!.c]).toBeNull();
  });

  it("no cruza los bordes laterales (rebota en vez de salir del tablero)", () => {
    const grid = emptyGrid();
    const { x: originX } = cellCenter(0, 0, 0);
    // Ángulo bien cerrado hacia la izquierda — sin rebote se iría del tablero.
    const result = simulateFlight(grid, originX, ORIGIN_Y, -1.2, 0);
    for (const point of result.path) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(BOARD_WIDTH);
    }
  });

  it("devuelve landing null si el camino está lleno hasta donde se dispara", () => {
    const grid = emptyGrid();
    for (let r = 0; r < VISIBLE_ROWS; r++) grid[r].fill("🍎");
    const { x: originX } = cellCenter(VISIBLE_ROWS - 1, 3, 0);
    const result = simulateFlight(grid, originX, ORIGIN_Y, 0, 0);
    expect(result.landing).toBeNull();
  });
});
