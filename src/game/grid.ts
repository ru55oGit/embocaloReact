import { GRID_SIZE, VISIBLE_ROWS } from "./constants";
import { hexNeighbors } from "./hex";
import { CellValue, Grid, GridPos } from "./types";

// Grilla de tamaño FIJO (VISIBLE_ROWS x GRID_SIZE), como el tablero 8x8 de
// encastraloReact — en vez de crecer sin límite, "bajar el techo" es
// correr todo un índice de fila hacia el disparador (ver dropOneRow).
export function emptyGrid(): Grid {
  return Array.from({ length: VISIBLE_ROWS }, () => Array<CellValue | null>(GRID_SIZE).fill(null));
}

export function initialGrid(randomValue: () => CellValue, initialRows: number): Grid {
  return Array.from({ length: VISIBLE_ROWS }, (_, r) =>
    Array.from({ length: GRID_SIZE }, () => (r < initialRows ? randomValue() : null)),
  );
}

export interface DropResult {
  grid: Grid;
  gameOver: boolean;
}

// Clásico "el techo baja": se inserta una fila nueva arriba y todo lo
// demás corre una posición hacia el disparador. Si la fila más pegada al
// disparador ya tenía algo ocupado, no hay dónde correrla — ahí termina
// la partida (se devuelve la grilla sin tocar).
export function dropOneRow(grid: Grid, randomValue: () => CellValue): DropResult {
  const bottomRow = grid[VISIBLE_ROWS - 1];
  if (bottomRow.some((cell) => cell !== null)) {
    return { grid, gameOver: true };
  }
  const newTopRow: (CellValue | null)[] = Array.from({ length: GRID_SIZE }, () => randomValue());
  return { grid: [newTopRow, ...grid.slice(0, VISIBLE_ROWS - 1)], gameOver: false };
}

export interface FloatingDropResult {
  grid: Grid;
  dropped: GridPos[];
}

// Después de un pop, cualquier burbuja que haya quedado sin conexión (por
// vecinos hexagonales) hasta la fila 0 (el "techo") también cae — mismo
// comportamiento que cualquier bubble-shooter real: evita que queden islas
// sueltas flotando en el medio de la nada. Se corre con flood-fill desde
// todo lo que ya está pegado al techo; lo que ese flood-fill no alcanza,
// se limpia.
export function dropFloatingCells(grid: Grid, rowPhase: number): FloatingDropResult {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const key = (r: number, c: number) => r * cols + c;
  const anchored = new Set<number>();
  const stack: GridPos[] = [];

  for (let c = 0; c < cols; c++) {
    if (grid[0][c] !== null) {
      anchored.add(key(0, c));
      stack.push({ r: 0, c });
    }
  }

  while (stack.length > 0) {
    const cell = stack.pop()!;
    for (const { r: nr, c: nc } of hexNeighbors(cell.r, cell.c, rowPhase)) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const k = key(nr, nc);
      if (anchored.has(k) || grid[nr][nc] === null) continue;
      anchored.add(k);
      stack.push({ r: nr, c: nc });
    }
  }

  const dropped: GridPos[] = [];
  const nextGrid = grid.map((row, r) =>
    row.map((cell, c) => {
      if (cell !== null && !anchored.has(key(r, c))) {
        dropped.push({ r, c });
        return null;
      }
      return cell;
    }),
  );

  return { grid: nextGrid, dropped };
}
