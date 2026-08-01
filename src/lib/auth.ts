import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "pipeline-match-auth";
const DEMO_EMAIL = "demo@pipelinematch.dev";
const DEMO_PASSWORD = "demo1234";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";

type AuthUser = {
  id: string;
  email: string;
  provider: "supabase" | "demo";
};

function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function setStoredAuthUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearStoredAuthUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function isAdminCredential(email: string, password: string) {
  return email.trim().toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  const stored = getStoredAuthUser();
  if (stored) return stored;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user) {
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email ?? "user@example.com",
        provider: "supabase",
      };
      setStoredAuthUser(user);
      return user;
    }
  } catch {
    // fall back to local auth below
  }

  return null;
}

export async function signInWithEmailPassword(email: string, password: string): Promise<AuthUser> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      const user: AuthUser = {
        id: data.user?.id ?? "supabase-user",
        email: data.user?.email ?? email,
        provider: "supabase",
      };
      setStoredAuthUser(user);
      return user;
    }

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD || isAdminCredential(email, password)) {
      const user: AuthUser = {
        id: isAdminCredential(email, password) ? "admin-user" : "demo-user",
        email: isAdminCredential(email, password) ? ADMIN_USERNAME : email,
        provider: "demo",
      };
      setStoredAuthUser(user);
      return user;
    }

    throw error ?? new Error("Unable to sign in with the supplied credentials.");
  } catch (error) {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD || isAdminCredential(email, password)) {
      const user: AuthUser = {
        id: isAdminCredential(email, password) ? "admin-user" : "demo-user",
        email: isAdminCredential(email, password) ? ADMIN_USERNAME : email,
        provider: "demo",
      };
      setStoredAuthUser(user);
      return user;
    }

    throw error instanceof Error ? error : new Error("Unable to sign in.");
  }
}

export async function signUpWithEmailPassword(email: string, password: string): Promise<AuthUser> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });

    if (!error && data.session) {
      const user: AuthUser = {
        id: data.user?.id ?? "supabase-user",
        email: data.user?.email ?? email,
        provider: "supabase",
      };
      setStoredAuthUser(user);
      return user;
    }
  } catch {
    // fall through to local fallback
  }

  if (email === DEMO_EMAIL && password === DEMO_PASSWORD || isAdminCredential(email, password)) {
    const user: AuthUser = {
      id: isAdminCredential(email, password) ? "admin-user" : "demo-user",
      email: isAdminCredential(email, password) ? ADMIN_USERNAME : email,
      provider: "demo",
    };
    setStoredAuthUser(user);
    return user;
  }

  const user: AuthUser = { id: `local-${email}`, email, provider: "demo" };
  setStoredAuthUser(user);
  return user;
}

export async function signOutAuth() {
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore and continue with local cleanup
  }
  clearStoredAuthUser();
}
