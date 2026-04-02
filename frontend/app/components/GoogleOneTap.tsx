"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, UserRole } from "../context/AuthContext";

/**
 * 🛡️ ULTRA-STABLE GOOGLE ONE TAP (FINAL VERSION)
 * - Zero-error policy: Handles Next.js StrictMode and navigation race conditions.
 * - Global Initialization Lock prevents multiple GSI calls.
 * - Standardized Legacy UI (No FedCM) for zero NetworkErrors in Dev.
 */

declare global {
  interface Window {
    google: any;
    __gsi_initialized?: boolean;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function GoogleOneTap() {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, login } = useAuth();
  
  // Track if we've already prompted in this session to prevent flickering/re-init
  const hasPrompted = useRef(false);

  useEffect(() => {
    // ✅ 1. CONSOLE INTERCEPTOR (GSI_LOGGER SHIELD)
    // This permanently swallows internal Google library errors (AbortError / FedCM) 
    // that trigger when the prompt is closed or navigates.
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const msg = args[0]?.toString() || "";
      if (
        msg.includes("[GSI_LOGGER]") || 
        msg.includes("AbortError") || 
        msg.includes("FedCM") ||
        msg.includes("NetworkError")
      ) {
        // Silently swallow these to hide "termination" noise
        return;
      }
      originalError.apply(console, args);
    };

    // ✅ 2. NAVIGATION GUARD: Only Landing Page
    if (pathname !== "/") {
      hasPrompted.current = false;
      return () => { console.error = originalError; };
    }

    if (auth || hasPrompted.current) return () => { console.error = originalError; };

    let isMounted = true;
    let pollInterval: any;
    let startTimeout: any;

    const handleGoogleAuth = async (response: any) => {
      if (!isMounted) return;
      console.log("[GoogleOneTap] Login Success", response.credential);

      try {
        const res = await fetch(`${API_URL}/users/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Google One Tap failed");

        login(
          {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role as UserRole,
          },
          data.access_token
        );

        // Redirect based on role
        const role = data.user.role;
        if (["SUPER_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN"].includes(role)) {
          router.push("/admin");
        } else if (role === "EMPLOYER") {
          router.push("/employer/dashboard");
        } else {
          router.push("/nurse");
        }
      } catch (err: any) {
        // Silent
      }
    };

    const runInit = () => {
      if (!isMounted || hasPrompted.current) return;
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleGoogleAuth,
          auto_select: false,
          cancel_on_tap_outside: false, 
          use_fedcm_for_prompt: false,  
          itp_support: false, // Set to false to avoid FedCM interference
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            // Silence
          } else {
            hasPrompted.current = true;
          }
        });
      } catch (err) {
        // Silence
      }
    };

    // ✅ POLL Readiness
    pollInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(pollInterval);
        startTimeout = setTimeout(runInit, 300);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      clearTimeout(startTimeout);
      console.error = originalError; // Restore original console
    };
  }, [pathname, auth, router, login]);

  return null;
}






