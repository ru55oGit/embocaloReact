// Igual que encastraloReact: 8 columnas. El alto visible es más alto que
// ancho a propósito (shooter clásico, la presión viene de arriba).
export const GRID_SIZE = 8;
export const VISIBLE_ROWS = 10;
export const INITIAL_ROWS = 3;

// Cada vez que se completa la barra, toda la grilla baja una fila y se
// inserta una nueva arriba.
export const ROW_DROP_INTERVAL_MS = 30_000;

// Bonus por cada burbuja que cae "flotando" (sin conexión al techo)
// después de un pop — ver dropFloatingCells en grid.ts.
export const FLOATING_DROP_BONUS = 5;

// --- Frutas ---
export const FRUIT_EMOJI = ["🍎", "🍌", "🍇", "🍊", "🍓", "🍍"];
export const MIN_FRUIT_GROUP = 3;

// --- Letras ---
// Mismas en los 3 idiomas (tildes plegadas, ver data/dictionaries.ts) — solo
// el diccionario de palabras válidas cambia entre idiomas, no este set.
export const VOWELS = ["A", "E", "I", "O", "U"];

// --- Números ---
// Mismo modelo de metas que encastraloReact: se arranca pidiendo sumar
// 10, y la ventana habilitada para borrar es siempre {piso, piso+1} — se
// puede sumar el piso (sin subir la meta, por si el tablero no da para
// más) o piso+1 (sube la meta en 1). Nunca cualquier suma del rango.
export const MIN_TARGET_SUM = 10;
export const MIN_PATH_LENGTH_NUMBERS = 2;
export const NUMBER_GOAL_BONUS_PER_SUM = 100;
// Metas que se muestran en la card "METAS" — mismos valores que
// encastraloReact. No tienen techo real: una vez que el piso llega al
// último umbral de la tanda actual, la tanda siguiente (26-40, 41-55...)
// reemplaza a esta en la UI — ver rollingGoalWindow.
export const NUMBER_GOAL_THRESHOLDS = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

// La rotación pasa ni bien `achieved` toca el tope de la tanda actual (no
// recién al superarlo) — si no, hay un instante en que la tanda entera
// queda marcada como cumplida y la card no muestra qué número sigue.
export function rollingGoalWindow(achieved: number, base: number, width: number): number[] {
  const cyclesPassed = Math.max(0, Math.floor((achieved - base - width + 1) / width) + 1);
  const cycleStart = base + cyclesPassed * width;
  return Array.from({ length: width }, (_, i) => cycleStart + i);
}
// Pesos para el sorteo de dígitos 1-9 (favorece los bajos, para que sumar
// la meta sea viable seguido) — índice 0 sin usar. Mismos valores que
// encastraloReact.
export const NUMBER_WEIGHTS = [0, 16, 16, 15, 13, 12, 9, 8, 6, 5];
