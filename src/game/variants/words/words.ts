import { WORD_SETS } from "../../../data/dictionaries";
import { VOWELS } from "../../constants";
import { SupportedLanguage } from "../../../i18n/translations";
import { buildLetterFrequency } from "./dictionaryIndex";

export const MIN_WORD_LENGTH = 3;

interface LetterPool {
  wordSet: Set<string>;
  vowels: string[];
  consonants: string[];
  frequency: Record<string, number>;
}

// Un pool por idioma, armado perezoso y cacheado — no tiene sentido pagar el
// costo de construir los 3 si el jugador solo usa uno.
const cache = new Map<SupportedLanguage, LetterPool>();

function getPool(lang: SupportedLanguage): LetterPool {
  const cached = cache.get(lang);
  if (cached) return cached;
  const wordSet = WORD_SETS[lang];
  const frequency = buildLetterFrequency(wordSet);
  const allLetters = Object.keys(frequency);
  const pool: LetterPool = {
    wordSet,
    frequency,
    vowels: allLetters.filter((l) => VOWELS.includes(l)),
    consonants: allLetters.filter((l) => !VOWELS.includes(l)),
  };
  cache.set(lang, pool);
  return pool;
}

function weightedPick(letters: string[], weights: Record<string, number>): string {
  const total = letters.reduce((sum, l) => sum + weights[l], 0);
  let x = Math.random() * total;
  for (const letter of letters) {
    x -= weights[letter];
    if (x < 0) return letter;
  }
  return letters[0];
}

// Ponderado por frecuencia real dentro del diccionario, igual que
// randLetter() en encastraloReact — separado en dos funciones porque acá
// hay dos disparadores independientes, uno por pool.
export function randVowel(lang: SupportedLanguage): string {
  const pool = getPool(lang);
  return weightedPick(pool.vowels, pool.frequency);
}

export function randConsonant(lang: SupportedLanguage): string {
  const pool = getPool(lang);
  return weightedPick(pool.consonants, pool.frequency);
}

// Lista COMPLETA (no una muestra al azar) para el carrusel del disparador
// — el jugador tiene que poder llegar a cualquier letra dando vueltas con
// las flechas, no solo a un puñado que haya salido sorteado. randVowel/
// randConsonant (de arriba) siguen siendo para rellenar la grilla sola.
export function getVowelList(lang: SupportedLanguage): string[] {
  return [...getPool(lang).vowels].sort();
}

export function getConsonantList(lang: SupportedLanguage): string[] {
  return [...getPool(lang).consonants].sort();
}

// A diferencia de frutas (que explota sola al formar un grupo), en letras
// el jugador elige qué camino recorrer a mano (ver usePathSelection) —
// esto solo valida si lo que armó es una palabra real del diccionario.
export function isValidWord(word: string, lang: SupportedLanguage): boolean {
  return word.length >= MIN_WORD_LENGTH && getPool(lang).wordSet.has(word);
}

export function scoreForWord(length: number): number {
  return length * 10 + (length - MIN_WORD_LENGTH) * 5;
}
