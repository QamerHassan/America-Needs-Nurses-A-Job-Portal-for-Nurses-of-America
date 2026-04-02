"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Stethoscope } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "../../context/AuthContext";
import AppLogo from "../../components/AppLogo";

export default function NurseRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, role: "NURSE", phone: formData.phone, status: "ACTIVE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      
      const { user, access_token } = data;
      const tokenValue = access_token || "";
      
      login({
        id: user.id,
        email: user.email,
        role: user.role || "NURSE"
      }, tokenValue);
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-['DM_Sans',sans-serif]">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AppLogo className="h-8 w-auto" />
          </div>
          <h2 className="text-2xl font-black text-[#002868] mb-3">Registration Successful!</h2>
          <p className="text-gray-500 mb-7">Welcome to America Needs Nurses. You can now sign in to browse thousands of nursing jobs.</p>
          <Link href="/sign-in" className="bg-[#C8102E] text-white font-bold px-8 py-3 rounded-xl hover:bg-red-700 transition-all inline-block">Sign In Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['DM_Sans',sans-serif]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C8102E]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#002868]/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <AppLogo className="h-10 w-auto mx-auto" />
          <p className="text-gray-400 text-sm mt-3">Nurse Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-2xl font-black text-[#002868] mb-1">Create Nurse Account</h1>
          <p className="text-gray-500 text-sm mb-7">Join thousands of nurses finding their dream jobs across America</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                <input name="name" type="text" value={formData.name} onChange={update} required placeholder="Jane Smith RN"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Phone Number</label>
                <div className="flex">
                  <span className="border border-r-0 border-gray-200 rounded-l-xl px-3 py-3 text-sm text-gray-500 bg-gray-50">+1</span>
                  <input name="phone" type="tel" value={formData.phone} onChange={update} placeholder="555-000-0000"
                    className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
              <input name="email" type="email" value={formData.email} onChange={update} required placeholder="jane@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all" />
              <p className="text-xs text-gray-400 mt-1">We'll send relevant jobs and updates to this email</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
                <PasswordInput name="password" value={formData.password} onChange={update} required placeholder="Min. 8 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <PasswordInput name="confirmPassword" value={formData.confirmPassword} onChange={update} required placeholder="Repeat password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all" />
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              By registering, you agree to the <Link href="#" className="text-[#002868] font-semibold hover:underline">Terms & Conditions</Link> and <Link href="#" className="text-[#002868] font-semibold hover:underline">Privacy Policy</Link> of AmericaNeedsNurses.com
            </p>

            <button type="submit" disabled={loading}
              className="w-full bg-[#C8102E] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm shadow-lg shadow-red-100">
              {loading ? "Creating Account..." : "Register as Nurse →"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Already have an account? <Link href="/sign-in" className="text-[#002868] font-bold hover:text-[#C8102E]">Sign In</Link>
            </p>
            <p className="text-xs text-gray-400">
              Are you a hospital recruiter? <Link href="/employer/register" className="text-[#002868] font-semibold hover:text-[#C8102E]">Register as Employer →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
