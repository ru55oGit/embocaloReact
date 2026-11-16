import React, { createContext, useContext, useEffect, useState } from "react";
import { AVAILABLE_LANGUAGES, SupportedLanguage, TRANSLATIONS, Translation } from "./translations";

const LANGUAGE_STORAGE_KEY = "embocalo_language";

interface LanguageContextValue {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  availableLanguages: typeof AVAILABLE_LANGUAGES;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value === "es" || value === "en" || value === "pt";
}

// Resolución síncrona (sin useEffect) para que el primer render ya salga en
// el idioma correcto — mismo criterio que encastraloReact: ?lang= gana,
// después localStorage, y "es" como default.
function resolveInitialLanguage(): SupportedLanguage {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("lang");
    if (isSupportedLanguage(fromQuery)) return fromQuery;
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch {
    // localStorage/URL no disponibles — seguimos con el default.
  }
  return "es";
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(resolveInitialLanguage);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    } catch {
      /* localStorage no disponible */
    }
  }, [currentLanguage]);

  const value: LanguageContextValue = {
    currentLanguage,
    setLanguage: setCurrentLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
    t: TRANSLATIONS[currentLanguage],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  return ctx;
}
