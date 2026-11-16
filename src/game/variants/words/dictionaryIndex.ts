// Builders puros a partir de un conjunto de palabras (en mayúsculas, sin
// tildes) — ver src/data/dictionaries.ts para cómo se arma ese conjunto
// unificado por idioma (el mismo que usan los demás juegos del hub).

// Frecuencia real de cada letra dentro del diccionario — así el tablero
// nunca saca una letra que no sirva para ninguna palabra, y las letras
// más comunes (A, E...) salen más seguido que las raras (de forma
// proporcional a cuánto se usan de verdad).
export function buildLetterFrequency(words: Iterable<string>): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const word of words) {
    for (const letter of word) freq[letter] = (freq[letter] ?? 0) + 1;
  }
  return freq;
}
