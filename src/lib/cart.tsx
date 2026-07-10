import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
  slug: string;
  name: string;
  image: string;
  ml: number;
  price: number;
  qty: number;
}

interface CartCtx {
  items: CartItem[];
  add: (i: CartItem) => void;
  remove: (slug: string, ml: number) => void;
  setQty: (slug: string, ml: number, qty: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "sg-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const s = await AsyncStorage.getItem(KEY);
        if (s) setItems(JSON.parse(s));
      } catch {}
    };
    loadCart();
  }, []);

  const saveCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(newItems));
    } catch {}
  };

  const add = (i: CartItem) => {
    const idx = items.findIndex((p) => p.slug === i.slug && p.ml === i.ml);
    if (idx >= 0) {
      const copy = [...items];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + i.qty };
      saveCart(copy);
    } else {
      saveCart([...items, i]);
    }
  };

  const remove = (slug: string, ml: number) => {
    saveCart(items.filter((x) => !(x.slug === slug && x.ml === ml)));
  };

  const setQty = (slug: string, ml: number, qty: number) => {
    saveCart(
      items.map((x) => (x.slug === slug && x.ml === ml ? { ...x, qty: Math.max(1, qty) } : x))
    );
  };

  const value = useMemo<CartCtx>(
    () => ({
      items,
      add,
      remove,
      setQty,
      clear: () => saveCart([]),
      subtotal: items.reduce((s, i) => s + i.price * i.qty, 0),
      count: items.reduce((s, i) => s + i.qty, 0),
    }),
    [items]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
