import { describe, expect, it } from "vitest";
import { dropFloatingCells, emptyGrid } from "./grid";

describe("dropFloatingCells", () => {
  it("no toca nada si todo está conectado al techo", () => {
    const grid = emptyGrid();
    grid[0][0] = "🍎";
    grid[1][0] = "🍎"; // vecino hexagonal válido de (0,0) en fila par
    const result = dropFloatingCells(grid, 0);
    expect(result.dropped.length).toBe(0);
    expect(result.grid[1][0]).toBe("🍎");
  });

  it("hace caer una burbuja aislada sin conexión al techo", () => {
    const grid = emptyGrid();
    grid[0][0] = "🍎"; // esto sí está pegado al techo
    grid[5][5] = "🍌"; // aislada, sin vecinos — debe caer
    const result = dropFloatingCells(grid, 0);
    expect(result.dropped).toEqual([{ r: 5, c: 5 }]);
    expect(result.grid[5][5]).toBeNull();
    expect(result.grid[0][0]).toBe("🍎");
  });

  it("hace caer un grupo entero desconectado, no solo una celda", () => {
    const grid = emptyGrid();
    grid[0][0] = "🍎";
    // Grupo de 3 conectado entre sí pero sin camino hasta la fila 0.
    grid[5][2] = "🍌";
    grid[6][2] = "🍌";
    grid[6][3] = "🍌";
    const result = dropFloatingCells(grid, 0);
    expect(result.dropped.length).toBe(3);
    expect(result.grid[5][2]).toBeNull();
    expect(result.grid[6][2]).toBeNull();
    expect(result.grid[6][3]).toBeNull();
  });
});
