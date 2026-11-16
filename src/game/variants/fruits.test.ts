import { describe, expect, it } from "vitest";
import { emptyGrid } from "../grid";
import { fruitsEngine } from "./fruits";

function gridWith(values: Record<string, string>) {
  const grid = emptyGrid();
  for (const key of Object.keys(values)) {
    const [r, c] = key.split(",").map(Number);
    grid[r][c] = values[key];
  }
  return grid;
}

describe("fruitsEngine.resolveLanding", () => {
  it("poppea un grupo de 3 o más iguales conectado a la burbuja nueva", () => {
    const grid = gridWith({ "9,0": "🍎", "9,1": "🍎", "9,2": "🍎" });
    const result = fruitsEngine.resolveLanding(grid, { r: 9, c: 2 }, 0);
    expect(result.popped.length).toBe(3);
    expect(result.points).toBeGreaterThan(0);
  });

  it("no poppea si el grupo conectado queda en menos de 3", () => {
    const grid = gridWith({ "9,0": "🍎", "9,1": "🍎" });
    const result = fruitsEngine.resolveLanding(grid, { r: 9, c: 1 }, 0);
    expect(result.popped.length).toBe(0);
    expect(result.points).toBe(0);
  });

  it("no cuenta frutas distintas, aunque estén tocando", () => {
    const grid = gridWith({ "9,0": "🍎", "9,1": "🍎", "9,2": "🍌" });
    const result = fruitsEngine.resolveLanding(grid, { r: 9, c: 2 }, 0);
    expect(result.popped.length).toBe(0);
  });

  it("no cuenta frutas iguales que no están conectadas a la nueva", () => {
    const grid = gridWith({ "0,0": "🍎", "0,1": "🍎", "9,7": "🍎" });
    const result = fruitsEngine.resolveLanding(grid, { r: 9, c: 7 }, 0);
    expect(result.popped.length).toBe(0);
  });

  it("conecta en diagonal (vecino hexagonal, no el de una grilla cuadrada)", () => {
    const grid = gridWith({ "7,2": "🍊", "8,2": "🍊", "9,2": "🍊" });
    const result = fruitsEngine.resolveLanding(grid, { r: 9, c: 2 }, 0);
    expect(result.popped.length).toBe(3);
  });
});
