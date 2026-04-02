"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth, UserRole } from "../../context/AuthContext";
import AppLogo from "../../components/AppLogo";

export default function EmployerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      login(
        { id: data.user.id, email: data.user.email, role: data.user.role as UserRole },
        data.access_token
      );
      router.push("/employer/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/google-login`, {
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
      router.push("/employer/dashboard");
    } catch (err: any) {
      setError(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['DM_Sans',sans-serif]">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C8102E]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#002868]/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <AppLogo className="h-10 w-auto mx-auto" />
          <p className="text-gray-400 text-sm mt-3">Employer Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-2xl font-black text-[#002868] mb-1">Welcome Back</h1>
          <p className="text-gray-500 text-sm mb-7">Sign in to manage your nursing job listings</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@hospital.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all"
              />
            </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 pr-12 focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all font-semibold"
                />
              </div>
              <div className="text-right mt-1.5">
                <Link href="/forgot-password" className="text-xs text-[#C8102E] hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8102E] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm tracking-wide shadow-lg shadow-red-100"
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Sign-In was unsuccessful.")}
              theme="outline"
              size="large"
              width="100%"
              text="signin_with"
              shape="pill"
              use_fedcm_for_prompt={false}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/employer/register" className="text-[#002868] font-bold hover:text-[#C8102E] transition-colors">
                Register your Hospital
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/sign-in" className="text-xs text-gray-400 hover:text-gray-600">
              Looking to sign in as a Nurse? →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
