import { Variant } from "../game/types";

const PREFIX = "embocalo_best_";

export function getBest(variant: Variant): number {
  try {
    return Number(window.localStorage.getItem(PREFIX + variant)) || 0;
  } catch {
    return 0;
  }
}

export function setBest(variant: Variant, value: number): void {
  try {
    if (value > getBest(variant)) window.localStorage.setItem(PREFIX + variant, String(value));
  } catch {
    /* localStorage no disponible */
  }
}
