import { VISIBLE_ROWS, GRID_SIZE } from "./constants";
import { BOARD_WIDTH, CELL_SIZE, nearestCell } from "./hex";
import { Grid, GridPos } from "./types";

export interface FlightPoint {
  x: number;
  y: number;
}

export interface FlightResult {
  path: FlightPoint[];
  // null = nunca encontró una celda vacía en el camino (la zona por la que
  // pasó ya está llena) — el llamador lo trata como "no hay dónde pegar".
  landing: GridPos | null;
}

const STEP_PX = 4;
// Guarda contra loops infinitos — a este paso, bastante más que cruzar el
// tablero ida y vuelta varias veces.
const MAX_STEPS = 2000;

// Simula un disparo recto desde (originX, originY) con el ángulo dado
// (0 = derecho hacia arriba, positivo = hacia la derecha), rebotando
// contra las paredes izquierda/derecha del tablero, hasta chocar con una
// burbuja ocupada o llegar al techo. Devuelve el camino completo (para
// animar la bolita) y la celda hexagonal donde queda pegada. Pura: no
// toca el estado del juego, solo lee `grid`.
export function simulateFlight(grid: Grid, originX: number, originY: number, angleRad: number, rowPhase: number): FlightResult {
  let x = originX;
  let y = originY;
  let vx = Math.sin(angleRad) * STEP_PX;
  let vy = -Math.cos(angleRad) * STEP_PX;

  const path: FlightPoint[] = [{ x, y }];
  let lastSafeCell: GridPos | null = null;

  for (let i = 0; i < MAX_STEPS; i++) {
    x += vx;
    y += vy;

    if (x < CELL_SIZE / 2) {
      x = CELL_SIZE / 2;
      vx = -vx;
    } else if (x > BOARD_WIDTH - CELL_SIZE / 2) {
      x = BOARD_WIDTH - CELL_SIZE / 2;
      vx = -vx;
    }
    path.push({ x, y });

    const current = nearestCell(x, y, rowPhase);
    const inBounds = current.r >= 0 && current.r < VISIBLE_ROWS && current.c >= 0 && current.c < GRID_SIZE;

    if (y <= CELL_SIZE / 2) {
      const landing = inBounds && grid[current.r][current.c] === null ? current : lastSafeCell;
      return { path, landing };
    }

    if (inBounds) {
      if (grid[current.r][current.c] !== null) {
        return { path, landing: lastSafeCell };
      }
      lastSafeCell = current;
    }
  }

  return { path, landing: lastSafeCell };
}
