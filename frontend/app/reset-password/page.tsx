"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import AppLogo from "../components/AppLogo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 relative overflow-hidden">
        
        {/* Animated Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#002868]/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="flex justify-center mb-4">
            <AppLogo className="h-10 w-auto" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Reset Password</h1>
          <p className="text-gray-500 font-medium text-sm mt-2">
            Enter your new password below to regain access to your account.
          </p>
        </div>

        {isSuccess ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50/50">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-black text-green-800 mb-2">Password Reset Successful</h3>
              <p className="text-sm font-medium text-green-700 leading-relaxed mb-6">
                Your password has been changed successfully. You will be redirected to the login page momentarily.
              </p>
              <Link 
                href="/login" 
                className="w-full py-3.5 px-4 bg-white border border-green-200 text-green-700 font-bold rounded-xl shadow-sm hover:bg-green-50 transition-all flex items-center justify-center gap-2"
              >
                Go to Login <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-[#002868]/20 focus:ring-4 focus:ring-[#002868]/5 transition-all outline-none"
                  placeholder="New Password"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-[#002868]/20 focus:ring-4 focus:ring-[#002868]/5 transition-all outline-none"
                  placeholder="Confirm New Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword || !!error && !token}
              className="w-full py-3.5 bg-[#002868] text-white font-black text-sm rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 focus:ring-4 focus:ring-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[52px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
