import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "./api";
import { request } from "./api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Address {
  label?: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  district: string;
  postcode?: string;
  isDefault?: boolean;
}

export type Provider = "email" | "google" | "facebook";

export interface Profile {
  email: string;
  phone?: string;
  name?: string;
  avatar?: string;
  provider: Provider;
  addresses: Address[];
  createdAt: string;
  role?: "customer" | "admin";
}

interface AuthCtx {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (input: { name: string; email?: string; password?: string; phone: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  upsertAddress: (addr: Address, index?: number) => void;
  removeAddress: (index: number) => void;
  setDefaultAddress: (index: number) => void;
  defaultAddress: () => Address | null;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "sg-auth-user";

const mapUserToProfile = (u: any): Profile => {
  return {
    email: u.email || "",
    phone: u.phone,
    name: u.name,
    provider: "email",
    addresses: u.addresses || [],
    createdAt: u.createdAt,
    role: u.role,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persist = async (p: Profile | null) => {
    setUser(p);
    try {
      if (p) {
        await AsyncStorage.setItem(KEY, JSON.stringify(p));
      } else {
        await AsyncStorage.removeItem(KEY);
        await AsyncStorage.removeItem("sg_auth_token");
      }
    } catch {}
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        try {
          const fetchedUser = await authApi.me();
          if (fetchedUser) {
            await persist(mapUserToProfile(fetchedUser));
            return;
          }
        } catch (err) {
          console.error("Failed to restore session:", err);
        }
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          setUser(JSON.parse(raw));
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    const isPhone = /^(?:\+8801|01)[3-9]\d{8}$/.test(emailOrPhone.trim()) || /^\d+$/.test(emailOrPhone.trim());
    const payload = isPhone
      ? { phone: emailOrPhone.trim(), password }
      : { email: emailOrPhone.trim().toLowerCase(), password };
    const fetchedUser = await authApi.login(payload);
    await persist(mapUserToProfile(fetchedUser));
  };

  const register = async ({ name, email, password, phone }: { name: string; email?: string; password?: string; phone: string }) => {
    const fetchedUser = await authApi.signup({ name, email, password, phone });
    await persist(mapUserToProfile(fetchedUser));
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword = async (email: string, password: string) => {
    await authApi.resetPassword({ token: email, password });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    }
    await persist(null);
  };

  const updateProfile = async (patch: Partial<Profile>) => {
    if (!user) return;
    const bodyPayload = {
      name: patch.name,
      avatarUrl: patch.avatar,
    };
    const updatedUser = await request<any>("/profile", { method: "PATCH", body: bodyPayload });
    await persist(mapUserToProfile(updatedUser));
  };

  const upsertAddress = async (addr: Address, index?: number) => {
    if (!user) return;
    if (typeof index === "number") {
      await request<Address>(`/addresses/${index}`, { method: "PUT", body: addr });
    } else {
      await request<Address>("/addresses", { method: "POST", body: addr });
    }
    const fetchedUser = await authApi.me();
    if (fetchedUser) await persist(mapUserToProfile(fetchedUser));
  };

  const removeAddress = async (index: number) => {
    if (!user) return;
    await request<any>(`/addresses/${index}`, { method: "DELETE" });
    const fetchedUser = await authApi.me();
    if (fetchedUser) await persist(mapUserToProfile(fetchedUser));
  };

  const setDefaultAddress = async (index: number) => {
    if (!user) return;
    await request<any>(`/addresses/${index}/default`, { method: "POST" });
    const fetchedUser = await authApi.me();
    if (fetchedUser) await persist(mapUserToProfile(fetchedUser));
  };

  const defaultAddress = () => user?.addresses.find((a) => a.isDefault) ?? user?.addresses[0] ?? null;

  return (
    <Ctx.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      login, register, forgotPassword, resetPassword,
      logout, updateProfile, upsertAddress, removeAddress, setDefaultAddress, defaultAddress
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
