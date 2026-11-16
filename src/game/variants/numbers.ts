import { MIN_PATH_LENGTH_NUMBERS, NUMBER_WEIGHTS } from "../constants";

// Igual que letras: disparar solo pega el número, no hay auto-pop (ver
// types.ts) — el jugador arma a mano qué camino sumar y borrar (ver
// useEmbocaloGame.clearNumberPath + hooks/usePathSelection).

export function randDigit(): number {
  const total = NUMBER_WEIGHTS.reduce((sum, weight) => sum + weight, 0);
  let x = Math.random() * total;
  for (let digit = 1; digit <= 9; digit++) {
    x -= NUMBER_WEIGHTS[digit];
    if (x < 0) return digit;
  }
  return 1;
}

export function numberCellLabel(value: number): string {
  return String(value);
}

export function sumScore(length: number): number {
  return length * 10 + (length - MIN_PATH_LENGTH_NUMBERS) * 5;
}
