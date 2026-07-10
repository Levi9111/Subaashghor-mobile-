import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, USE_MOCKS } from "./api";
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
const PW_KEY = "sg-auth-pw";

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
        if (!USE_MOCKS) {
          try {
            const fetchedUser = await authApi.me();
            if (fetchedUser) {
              await persist(mapUserToProfile(fetchedUser));
              return;
            }
          } catch (err) {
            console.error("Failed to restore session:", err);
          }
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

  const writeProfile = async (p: Profile) => {
    try {
      await AsyncStorage.setItem(`${KEY}:${p.email || p.phone}`, JSON.stringify(p));
      await persist(p);
    } catch {}
  };

  const login = async (emailOrPhone: string, password: string) => {
    const isPhone = /^(?:\+8801|01)[3-9]\d{8}$/.test(emailOrPhone.trim()) || /^\d+$/.test(emailOrPhone.trim());
    if (!USE_MOCKS) {
      const payload = isPhone
        ? { phone: emailOrPhone.trim(), password }
        : { email: emailOrPhone.trim().toLowerCase(), password };
      const fetchedUser = await authApi.login(payload);
      await persist(mapUserToProfile(fetchedUser));
      return;
    }
    
    // Mock authentication login simulation
    await new Promise((r) => setTimeout(r, 350));
    const stored = await AsyncStorage.getItem(`${PW_KEY}:${emailOrPhone}`);
    if (!stored) throw new Error("No account found for this email/phone.");
    if (stored !== password) throw new Error("Incorrect password.");
    
    const profileRaw = await AsyncStorage.getItem(`${KEY}:${emailOrPhone}`);
    const profile: Profile = profileRaw
      ? JSON.parse(profileRaw)
      : {
          email: isPhone ? "" : emailOrPhone,
          phone: isPhone ? emailOrPhone : undefined,
          provider: "email",
          addresses: [],
          createdAt: new Date().toISOString(),
        };
    await persist(profile);
  };

  const register = async ({ name, email, password, phone }: { name: string; email?: string; password?: string; phone: string }) => {
    const ident = email || phone;
    if (!USE_MOCKS) {
      const fetchedUser = await authApi.signup({ name, email, password, phone });
      await persist(mapUserToProfile(fetchedUser));
      return;
    }
    
    // Mock user signup
    await new Promise((r) => setTimeout(r, 400));
    const existing = await AsyncStorage.getItem(`${PW_KEY}:${ident}`);
    if (existing) throw new Error("Email/Phone already registered.");
    if (password) {
      await AsyncStorage.setItem(`${PW_KEY}:${ident}`, password);
    }
    const profile: Profile = {
      email: email || "",
      name,
      phone,
      provider: "email",
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    await writeProfile(profile);
  };

  const forgotPassword = async (email: string) => {
    if (!USE_MOCKS) {
      await authApi.forgotPassword(email);
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
  };

  const resetPassword = async (email: string, password: string) => {
    if (!USE_MOCKS) {
      await authApi.resetPassword({ token: email, password });
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
    await AsyncStorage.setItem(`${PW_KEY}:${email}`, password);
  };

  const logout = async () => {
    if (!USE_MOCKS) {
      try {
        await authApi.logout();
      } catch (err) {
        console.error("Logout request failed:", err);
      }
    }
    await persist(null);
  };

  const updateProfile = async (patch: Partial<Profile>) => {
    if (!user) return;
    if (!USE_MOCKS) {
      const bodyPayload = {
        name: patch.name,
        avatarUrl: patch.avatar,
      };
      const updatedUser = await request<any>("/profile", { method: "PATCH", body: bodyPayload });
      await persist(mapUserToProfile(updatedUser));
      return;
    }
    await writeProfile({ ...user, ...patch });
  };

  const upsertAddress = async (addr: Address, index?: number) => {
    if (!user) return;
    if (!USE_MOCKS) {
      if (typeof index === "number") {
        await request<Address>(`/addresses/${index}`, { method: "PUT", body: addr });
      } else {
        await request<Address>("/addresses", { method: "POST", body: addr });
      }
      const fetchedUser = await authApi.me();
      if (fetchedUser) await persist(mapUserToProfile(fetchedUser));
      return;
    }
    const list = [...user.addresses];
    if (typeof index === "number") list[index] = addr;
    else list.push(addr);
    if (addr.isDefault) {
      list.forEach((a, i) => {
        a.isDefault = i === (index ?? list.length - 1);
      });
    }
    if (list.length === 1) list[0].isDefault = true;
    await writeProfile({ ...user, addresses: list });
  };

  const removeAddress = async (index: number) => {
    if (!user) return;
    if (!USE_MOCKS) {
      await request<any>(`/addresses/${index}`, { method: "DELETE" });
      const fetchedUser = await authApi.me();
      if (fetchedUser) await persist(mapUserToProfile(fetchedUser));
      return;
    }
    const list = user.addresses.filter((_, i) => i !== index);
    if (list.length && !list.some((a) => a.isDefault)) {
      list[0].isDefault = true;
    }
    await writeProfile({ ...user, addresses: list });
  };

  const setDefaultAddress = async (index: number) => {
    if (!user) return;
    if (!USE_MOCKS) {
      await request<any>(`/addresses/${index}/default`, { method: "POST" });
      const fetchedUser = await authApi.me();
      if (fetchedUser) await persist(mapUserToProfile(fetchedUser));
      return;
    }
    const list = user.addresses.map((a, i) => ({ ...a, isDefault: i === index }));
    await writeProfile({ ...user, addresses: list });
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
