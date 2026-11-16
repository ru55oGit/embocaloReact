import { setBest } from "./storage";

export interface WordsRecord {
  score: number;
  wordsFound: number;
  longestWord: string;
  words: string[];
}

const KEY = "embocalo_words_record";

export function getWordsRecord(): WordsRecord | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WordsRecord;
  } catch {
    return null;
  }
}

export function maybeSaveWordsRecord(score: number, words: string[]): void {
  setBest("letters", score);
  try {
    const current = getWordsRecord();
    if (current && current.score >= score) return;
    const longestWord = words.reduce((longest, w) => (w.length > longest.length ? w : longest), "");
    window.localStorage.setItem(KEY, JSON.stringify({ score, wordsFound: words.length, longestWord, words }));
  } catch {
    /* localStorage no disponible */
  }
}
