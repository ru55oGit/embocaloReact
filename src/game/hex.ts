import { GRID_SIZE, VISIBLE_ROWS } from "./constants";
import { GridPos } from "./types";

// Grilla "offset" (bubble-shooter real): las filas "impares" están
// corridas media celda a la derecha, así que cada celda tiene 6 vecinos en
// vez de los 8 de una grilla cuadrada. "Impar" acá NO es simplemente
// `r % 2`: cada vez que baja el techo (dropOneRow en grid.ts), TODA la
// grilla se corre un índice de fila, lo que invertiría la paridad de cada
// pieza ya existente si se usara el índice crudo — visualmente se verían
// saltar medio casillero (y la adyacencia real dejaría de coincidir con lo
// dibujado, generando "islas" sueltas que en realidad siguen tocándose).
// `rowPhase` (0 o 1) es cuántas veces bajó el techo, módulo 2: sumarlo a
// `r` antes de mirar la paridad mantiene la identidad física de cada
// celda estable aunque su índice de array se corra.
function isOddRow(r: number, rowPhase: number): boolean {
  return (r + rowPhase) % 2 === 1;
}

export function hexNeighbors(r: number, c: number, rowPhase: number): GridPos[] {
  if (isOddRow(r, rowPhase)) {
    return [
      { r, c: c - 1 }, { r, c: c + 1 },
      { r: r - 1, c }, { r: r - 1, c: c + 1 },
      { r: r + 1, c }, { r: r + 1, c: c + 1 },
    ];
  }
  return [
    { r, c: c - 1 }, { r, c: c + 1 },
    { r: r - 1, c: c - 1 }, { r: r - 1, c },
    { r: r + 1, c: c - 1 }, { r: r + 1, c },
  ];
}

// --- Geometría en píxeles (compartida por Board, AimedShooter y
// trajectory.ts para que el dibujo y la física usen las mismas cuentas). ---
export const CELL_SIZE = 36; // diámetro de cada burbuja
// Filas superpuestas verticalmente: en un empaquetado hexagonal real los
// centros de fila a fila quedan separados sqrt(3)/2 del diámetro, no el
// diámetro entero como en una grilla cuadrada — así las burbujas de una
// fila encajan en los huecos de la fila vecina.
export const ROW_HEIGHT = CELL_SIZE * (Math.sqrt(3) / 2);
export const BOARD_WIDTH = GRID_SIZE * CELL_SIZE + CELL_SIZE / 2;
export const BOARD_HEIGHT = VISIBLE_ROWS * ROW_HEIGHT + CELL_SIZE / 2;

function rowOffsetX(r: number, rowPhase: number): number {
  return isOddRow(r, rowPhase) ? CELL_SIZE / 2 : 0;
}

export function cellCenter(r: number, c: number, rowPhase: number): { x: number; y: number } {
  return {
    x: rowOffsetX(r, rowPhase) + c * CELL_SIZE + CELL_SIZE / 2,
    y: r * ROW_HEIGHT + CELL_SIZE / 2,
  };
}

// Celda más cercana a un punto en píxeles. Aproximado (no es el redondeo
// "cube rounding" perfecto de ejes axiales) pero alcanza para samplear la
// trayectoria del disparo paso a paso en trajectory.ts — con pasos chicos
// no hace falta más precisión que esta. La fila puede devolver cualquier
// entero (incluso negativo, "arriba del techo"); el llamador decide qué
// hacer con eso. La columna sí se clampea al rango válido.
export function nearestCell(x: number, y: number, rowPhase: number): GridPos {
  // El `|| 0` normaliza un -0 que Math.round puede devolver cuando y está
  // justo en el límite de la fila 0 — -0 !== 0 para comparaciones estrictas
  // tipo Object.is (las que usa Vitest en toBe), y acá nos interesa 0 liso.
  const r = Math.round((y - CELL_SIZE / 2) / ROW_HEIGHT) || 0;
  const offset = rowOffsetX(r, rowPhase);
  const c = Math.round((x - offset - CELL_SIZE / 2) / CELL_SIZE) || 0;
  return { r, c: Math.max(0, Math.min(GRID_SIZE - 1, c)) };
}

export function isRowInBounds(r: number): boolean {
  return r >= 0 && r < VISIBLE_ROWS;
}
