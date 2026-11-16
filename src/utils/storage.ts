import { Variant } from "../game/types";

const PREFIX = "embocalo_best_";

// `scope` solo lo usa letras (pasa el idioma) — el diccionario cambia por
// completo entre es/en/pt, así que "el mejor puntaje" de una partida en
// español no tiene sentido comparado/mostrado jugando en inglés. Frutas y
// números no son dependientes del idioma, así que siguen sin scope.
function keyFor(variant: Variant, scope?: string): string {
  return PREFIX + variant + (scope ? `_${scope}` : "");
}

export function getBest(variant: Variant, scope?: string): number {
  try {
    return Number(window.localStorage.getItem(keyFor(variant, scope))) || 0;
  } catch {
    return 0;
  }
}

export function setBest(variant: Variant, value: number, scope?: string): void {
  try {
    if (value > getBest(variant, scope)) window.localStorage.setItem(keyFor(variant, scope), String(value));
  } catch {
    /* localStorage no disponible */
  }
}
