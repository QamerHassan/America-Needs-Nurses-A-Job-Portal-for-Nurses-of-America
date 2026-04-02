"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAdminRole } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Wraps a page/section and enforces role-based access.
 * - Not logged in → redirect to redirectTo (default: "/")
 * - Wrong role    → redirect to redirectTo
 * - Correct role  → render children
 *
 * Uses isHydrated to avoid a flash redirect on page refresh while
 * sessionStorage is being read.
 */
export default function ProtectedRoute({
  allowedRoles,
  redirectTo = "/",
  children,
}: ProtectedRouteProps) {
  const { auth, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    if (!auth) {
      router.replace(redirectTo);
      return;
    }

    if (!allowedRoles.includes(auth.role)) {
      router.replace(redirectTo);
    }
  }, [auth, isHydrated, allowedRoles, redirectTo, router]);

  // While hydrating, render nothing to prevent layout flash
  if (!isHydrated) return null;

  // Not authenticated or wrong role — render nothing while redirect fires
  if (!auth || !allowedRoles.includes(auth.role)) return null;

  return <>{children}</>;
}
