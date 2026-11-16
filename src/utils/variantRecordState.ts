import { setBest } from "./storage";

// Foto de la mejor PARTIDA completa (no solo el número de storage.ts) para
// la card de "Récord" del Home — frutas/números comparten esta forma:
// puntaje + un dato destacado (grupo más grande / meta más alta) + cuántas
// veces se borró algo esa partida. Letras usa su propio equivalente, ver
// wordsRecordState.ts.
export interface VariantRunRecord {
  score: number;
  highlight: number;
  clears: number;
}

function key(variant: "fruits" | "numbers"): string {
  return `embocalo_run_record_${variant}`;
}

export function getVariantRecord(variant: "fruits" | "numbers"): VariantRunRecord | null {
  try {
    const raw = window.localStorage.getItem(key(variant));
    if (!raw) return null;
    return JSON.parse(raw) as VariantRunRecord;
  } catch {
    return null;
  }
}

export function maybeSaveVariantRecord(variant: "fruits" | "numbers", score: number, highlight: number, clears: number): void {
  setBest(variant, score);
  try {
    const current = getVariantRecord(variant);
    if (current && current.score >= score) return;
    window.localStorage.setItem(key(variant), JSON.stringify({ score, highlight, clears }));
  } catch {
    /* localStorage no disponible */
  }
}
