import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WishCtx {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
}

const Ctx = createContext<WishCtx | null>(null);
const KEY = "sg-wish";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    const loadWish = async () => {
      try {
        const s = await AsyncStorage.getItem(KEY);
        if (s) setSlugs(JSON.parse(s));
      } catch {}
    };
    loadWish();
  }, []);

  const saveWish = async (newSlugs: string[]) => {
    setSlugs(newSlugs);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(newSlugs));
    } catch {}
  };

  const toggle = (slug: string) => {
    if (slugs.includes(slug)) {
      saveWish(slugs.filter((x) => x !== slug));
    } else {
      saveWish([...slugs, slug]);
    }
  };

  const value = useMemo<WishCtx>(
    () => ({
      slugs,
      toggle,
      has: (slug) => slugs.includes(slug),
    }),
    [slugs]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWishlist must be used within WishlistProvider");
  return c;
}
