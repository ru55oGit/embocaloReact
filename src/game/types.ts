// Modelo bastante más chico que el de encastraloReact: acá no hay
// piezas/bandeja. Dos formas de jugar bien distintas conviven:
// - Frutas: se dispara y se pega sola, explota sola al formar un grupo
//   (ver ShooterVariantEngine/fruits.ts) — "shooter clásico".
// - Letras/números: disparar solo PEGA la burbuja; el jugador arma a mano
//   qué borrar arrastrando el dedo sobre el tablero (ver
//   hooks/usePathSelection.ts), igual que el resto del hub.

export type Variant = "fruits" | "letters" | "numbers";

// Emoji de fruta | letra A-Z de 1 char | dígito 1-9.
export type CellValue = string | number;

// grid[r][c] = valor de esa celda, o null si está vacía.
export type Grid = (CellValue | null)[][];

export interface GridPos {
  r: number;
  c: number;
}

// Resultado de evaluar la región conectada a partir de la burbuja recién
// pegada en `landedAt` — solo lo usa fruits.ts (el único "shooter clásico"
// que explota solo). `popped` vacío significa que no hubo pop esta vez
// (jugada válida igual, la burbuja se queda pegada).
export interface PopResult {
  popped: GridPos[];
  points: number;
  label?: string;
}

// `rowPhase` (0|1) es cuántas veces bajó el techo, módulo 2 — ver hex.ts.
// Hace falta pasarlo a toda operación de adyacencia (flood-fill, DFS),
// porque la fila de una celda existente se reindexa cada vez que baja el
// techo, y su paridad "cruda" ya no refleja su posición física real.
export interface ShooterVariantEngine {
  id: Variant;
  cellLabel(value: CellValue): string;
  randomValue(): CellValue;
  resolveLanding(grid: Grid, landedAt: GridPos, rowPhase: number): PopResult;
}
