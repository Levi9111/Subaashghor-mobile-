import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Lang = "bn" | "en";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (bn: string, en: string) => string;
}

const Ctx = createContext<LangCtx | null>(null);
const KEY = "sg-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    const loadLang = async () => {
      try {
        const stored = await AsyncStorage.getItem(KEY);
        if (stored === "bn" || stored === "en") setLangState(stored);
      } catch {}
    };
    loadLang();
  }, []);

  const setLang = async (l: Lang) => {
    setLangState(l);
    try {
      await AsyncStorage.setItem(KEY, l);
    } catch {}
  };

  const value: LangCtx = {
    lang,
    setLang,
    toggle: () => setLang(lang === "en" ? "bn" : "en"),
    t: (bn, en) => (lang === "bn" ? bn : en),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLang must be used within LanguageProvider");
  return c;
}
