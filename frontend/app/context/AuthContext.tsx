"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "NURSE"
  | "EMPLOYER"
  | "SUPER_ADMIN"
  | "CONTENT_ADMIN"
  | "SUPPORT_ADMIN";

export interface AuthSession {
  token: string;
  role: UserRole;
  email: string;
  userId: string;
  sessionId: string;
  image?: string;
}

interface AuthContextValue {
  auth: AuthSession | null;
  login: (userData: { id: string; email: string; role: UserRole; image?: string }, token: string) => void;
  logout: () => void;
  isHydrated: boolean;
}

// ─── Storage Key ──────────────────────────────────────────────────────────────

const SESSION_KEY = "ann_session";

// ─── Helpers (usable outside React components, e.g. Axios interceptor) ───────

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from sessionStorage on mount (fixes refresh issues)
  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      setAuth(stored);
    }
    setIsHydrated(true);
  }, []);

  const login = useCallback(
    (userData: { id: string; email: string; role: UserRole; image?: string }, token: string) => {
      const session: AuthSession = {
        token,
        role: userData.role,
        email: userData.email,
        userId: userData.id,
        sessionId: crypto.randomUUID(),
        image: userData.image,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setAuth(session);
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Role Guards ──────────────────────────────────────────────────────────────

export function isAdminRole(role: string | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "CONTENT_ADMIN" || role === "SUPPORT_ADMIN";
}
