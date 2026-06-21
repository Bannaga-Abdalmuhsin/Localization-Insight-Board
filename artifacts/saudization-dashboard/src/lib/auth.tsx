import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface AppUser {
  id: string;
  username: string;
  is_admin: boolean;
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  users: AppUser[];
  addUser: (username: string, password: string, isAdmin: boolean) => Promise<{ ok: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ ok: boolean; error?: string }>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => ({ ok: false }),
  logout: () => {},
  users: [],
  addUser: async () => ({ ok: false }),
  deleteUser: async () => ({ ok: false }),
  refreshUsers: async () => {},
});

const SESSION_KEY = "aces_session";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  async function refreshUsers() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from("app_users")
      .select("id, username, is_admin")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setUsers(data as AppUser[]);
    }
  }

  async function login(username: string, password: string) {
    if (!isSupabaseConfigured) {
      return { ok: false, error: "Database not configured" };
    }
    try {
      const hash = await hashPassword(password);
      const { data, error } = await supabase
        .from("app_users")
        .select("id, username, is_admin, password_hash")
        .ilike("username", username)
        .single();

      if (error || !data) {
        return { ok: false, error: "Invalid credentials" };
      }
      if (data.password_hash !== hash) {
        return { ok: false, error: "Invalid credentials" };
      }

      const sessionUser: AppUser = {
        id: data.id,
        username: data.username,
        is_admin: data.is_admin,
      };
      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }

  async function addUser(username: string, password: string, isAdmin: boolean) {
    if (!isSupabaseConfigured) return { ok: false, error: "Database not configured" };
    try {
      const hash = await hashPassword(password);
      const { error } = await supabase.from("app_users").insert({
        username: username.trim(),
        password_hash: hash,
        is_admin: isAdmin,
      });
      if (error) return { ok: false, error: error.message };
      await refreshUsers();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  async function deleteUser(id: string) {
    if (!isSupabaseConfigured) return { ok: false, error: "Database not configured" };
    try {
      const { error } = await supabase.from("app_users").delete().eq("id", id);
      if (error) return { ok: false, error: error.message };
      await refreshUsers();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, users, addUser, deleteUser, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
