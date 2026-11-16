import { setBest } from "./storage";
import { SupportedLanguage } from "../i18n/translations";

export interface WordsRecord {
  score: number;
  wordsFound: number;
  longestWord: string;
  words: string[];
}

const KEY_PREFIX = "embocalo_words_record_";

// Un récord por idioma — no tiene sentido mostrar palabras en español
// (ni compararlas) jugando en inglés: el diccionario completo cambia.
export function getWordsRecord(lang: SupportedLanguage): WordsRecord | null {
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + lang);
    if (!raw) return null;
    return JSON.parse(raw) as WordsRecord;
  } catch {
    return null;
  }
}

export function maybeSaveWordsRecord(score: number, words: string[], lang: SupportedLanguage): void {
  setBest("letters", score, lang);
  try {
    const current = getWordsRecord(lang);
    if (current && current.score >= score) return;
    const longestWord = words.reduce((longest, w) => (w.length > longest.length ? w : longest), "");
    window.localStorage.setItem(KEY_PREFIX + lang, JSON.stringify({ score, wordsFound: words.length, longestWord, words }));
  } catch {
    /* localStorage no disponible */
  }
}
