"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLogo from "./AppLogo";
import { X } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth, UserRole } from "../context/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function redirectByRole(role: string, router: ReturnType<typeof useRouter>, onClose: () => void) {
  onClose();
  if (role === "SUPER_ADMIN" || role === "CONTENT_ADMIN" || role === "SUPPORT_ADMIN") {
    router.push("/admin");
  } else if (role === "EMPLOYER") {
    router.push("/employer/dashboard");
  } else {
    router.push("/jobs");
  }
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogin = async () => {
    if (!email) { setError("Please enter your email"); return; }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      login(
        { id: data.user.id, email: data.user.email, role: data.user.role as UserRole },
        data.access_token
      );
      redirectByRole(data.user.role, router, onClose);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google Login failed");
      login(
        { id: data.user.id, email: data.user.email, role: data.user.role as UserRole },
        data.access_token
      );
      redirectByRole(data.user.role, router, onClose);
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0, 28, 80, 0.55)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000,
        animation: "fadeInOverlay 0.3s ease-out",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: 460,
          borderRadius: 28,
          position: "relative",
          boxShadow: "0 32px 64px -12px rgba(0,28,80,0.28), 0 0 0 1px rgba(0,0,0,0.04)",
          animation: "slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient accent */}
        <div style={{
          height: 4,
          background: "linear-gradient(90deg, #C8102E 0%, #002868 50%, #C8102E 100%)",
        }} />

        <div style={{ padding: "40px 40px 36px" }}>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "#f4f6f8", border: "none",
              width: 34, height: 34, borderRadius: "50%",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#e8ecf0")}
            onMouseOut={e => (e.currentTarget.style.background = "#f4f6f8")}
          >
            <X size={16} color="#555" />
          </button>

          {/* Logo + Headline */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <AppLogo className="h-12 w-auto" />
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26, fontWeight: 900,
              color: "#002868", margin: 0,
            }}>
              Welcome to ANN
            </h2>
            <p style={{ color: "#8a94a6", fontSize: 13, marginTop: 6 }}>
              Sign in to access premium nursing opportunities
            </p>
          </div>

          {/* Social Buttons Row */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {/* Google */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In was unsuccessful.")}
                theme="outline"
                size="large"
                width={380}
                text="signin_with"
                shape="rectangular"
                use_fedcm_for_prompt={false}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "#e8ecf2" }} />
            <span style={{ color: "#b0b8c4", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              or sign in with email
            </span>
            <div style={{ flex: 1, height: 1, background: "#e8ecf2" }} />
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              background: "#fff0f0", border: "1px solid #fecdcd",
              color: "#c53030", padding: "10px 14px",
              borderRadius: 10, fontSize: 13, fontWeight: 500,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Email Input */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "11px 14px",
                border: "1.5px solid #e2e8f0", borderRadius: 10,
                fontSize: 14, outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s",
                fontFamily: "inherit",
              }}
              onFocus={e => (e.target.style.borderColor = "#002868")}
              onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <PasswordInput
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "11px 44px 11px 14px",
                border: "1.5px solid #e2e8f0", borderRadius: 10,
                fontSize: 14, outline: "none", boxSizing: "border-box",
                transition: "border-color 0.2s",
                fontFamily: "inherit",
              }}
              onFocus={e => (e.target.style.borderColor = "#002868")}
              onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Forgot Password */}
          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <a 
              href="/forgot-password" 
              onClick={(e) => { e.preventDefault(); onClose(); router.push('/forgot-password'); }} 
              style={{ fontSize: 12, color: "#C8102E", fontWeight: 600, textDecoration: "none" }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              width: "100%", padding: "13px",
              background: isLoading ? "#8a94a6" : "linear-gradient(135deg, #002868 0%, #001f5b 100%)",
              color: "#fff", border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 800,
              cursor: isLoading ? "not-allowed" : "pointer",
              letterSpacing: "0.04em",
              transition: "all 0.2s",
              boxShadow: "0 4px 14px rgba(0,40,104,0.25)",
              marginBottom: 20,
            }}
            onMouseOver={e => !isLoading && (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseOut={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {isLoading ? "Signing In..." : "Log In"}
          </button>

          {/* Sign Up Link */}
          <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
            Don&apos;t have an account?{" "}
            <a href="/register" onClick={onClose} style={{ color: "#C8102E", fontWeight: 700, textDecoration: "none" }}>
              Sign Up Free
            </a>
          </p>

          {/* Portal Links */}
          <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 16 }}>
            <p style={{ textAlign: "center", fontSize: 11, color: "#b0b8c4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Sign in to a specific portal
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <a
                href="/sign-in"
                onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  border: "1.5px solid #e8ecf2", borderRadius: 10,
                  padding: "10px", fontSize: 12, fontWeight: 700,
                  color: "#444", textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "#C8102E"; e.currentTarget.style.color = "#C8102E"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "#e8ecf2"; e.currentTarget.style.color = "#444"; }}
              >
                🩺 Nurse Login
              </a>
              <a
                href="/employer/login"
                onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  border: "1.5px solid #e8ecf2", borderRadius: 10,
                  padding: "10px", fontSize: 12, fontWeight: 700,
                  color: "#444", textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "#002868"; e.currentTarget.style.color = "#002868"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "#e8ecf2"; e.currentTarget.style.color = "#444"; }}
              >
                🏥 Employer Login
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpModal {
          from { transform: translateY(24px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}