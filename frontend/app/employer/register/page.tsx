"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope, Upload, X, Image as ImageIcon } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "../../context/AuthContext";
import AppLogo from "../../components/AppLogo";

export default function EmployerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    hospitalName: "",
    location: "",
    website: "",
    logoUrl: "",
    imageUrl: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const logoRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === "logo") setLogoPreview(result);
      else setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const update = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: "EMPLOYER",
          hospitalName: form.hospitalName,
          location: form.location,
          website: form.website,
          logoUrl: logoPreview || "",
          imageUrl: imagePreview || "",
          status: "ACTIVE",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      
      const { access_token, user } = data;
      const tokenValue = access_token || "";
      
      login({
        id: user.id,
        email: user.email,
        role: user.role || "EMPLOYER",
      }, tokenValue);
      
      router.push("/employer/dashboard");
    } catch (err: any) {
      setError(err.message);
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

      <div className="w-full max-w-2xl relative">
        <div className="text-center mb-8">
          <AppLogo className="h-10 w-auto mx-auto" />
          <p className="text-gray-400 text-sm mt-3">Employer Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-2xl font-black text-[#002868] mb-1">Register Your Hospital</h1>
          <p className="text-gray-500 text-sm mb-7">Create your employer account to start posting nursing jobs</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Account Info */}
            <div>
              <h3 className="text-xs font-black text-[#002868] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#002868] text-white text-[10px] flex items-center justify-center">1</span>
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    name="name" type="text" value={form.name} onChange={update} required
                    placeholder="Dr. Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    name="email" type="email" value={form.email} onChange={update} required
                    placeholder="you@hospital.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
                  <PasswordInput
                    name="password" value={form.password} onChange={update} required
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <PasswordInput
                    name="confirmPassword" value={form.confirmPassword} onChange={update} required
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Hospital Info */}
            <div>
              <h3 className="text-xs font-black text-[#002868] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#002868] text-white text-[10px] flex items-center justify-center">2</span>
                Hospital Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Hospital Name</label>
                  <input
                    name="hospitalName" type="text" value={form.hospitalName} onChange={update} required
                    placeholder="Mayo Clinic"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Location</label>
                  <input
                    name="location" type="text" value={form.location} onChange={update}
                    placeholder="Rochester, MN"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Hospital Website</label>
                  <input
                    name="website" type="url" value={form.website} onChange={update}
                    placeholder="https://www.mayoclinic.org"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002868] focus:ring-2 focus:ring-[#002868]/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Media Info */}
            <div>
              <h3 className="text-xs font-black text-[#002868] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#002868] text-white text-[10px] flex items-center justify-center">3</span>
                Company Branding
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Company Logo</label>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
                  {logoPreview ? (
                    <div className="relative border-2 border-[#002868]/30 rounded-xl overflow-hidden">
                      <img src={logoPreview} alt="Logo Preview" className="w-full h-28 object-contain bg-gray-50 p-2" />
                      <button type="button" onClick={() => { setLogoPreview(null); if (logoRef.current) logoRef.current.value = ''; }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => logoRef.current?.click()}
                      className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#002868] hover:text-[#002868] transition-all cursor-pointer group">
                      <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                        <ImageIcon size={16} />
                      </div>
                      <span className="text-xs font-semibold">Upload Logo</span>
                      <span className="text-[10px] text-gray-300">PNG, JPG, SVG</span>
                    </button>
                  )}
                </div>

                {/* Facility Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Facility / Banner Image</label>
                  <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                  {imagePreview ? (
                    <div className="relative border-2 border-[#002868]/30 rounded-xl overflow-hidden">
                      <img src={imagePreview} alt="Facility Preview" className="w-full h-28 object-cover" />
                      <button type="button" onClick={() => { setImagePreview(null); if (imageRef.current) imageRef.current.value = ''; }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => imageRef.current?.click()}
                      className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#002868] hover:text-[#002868] transition-all cursor-pointer group">
                      <div className="w-9 h-9 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                        <Upload size={16} />
                      </div>
                      <span className="text-xs font-semibold">Upload Facility Photo</span>
                      <span className="text-[10px] text-gray-300">JPG, PNG, WEBP</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8102E] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm tracking-wide shadow-lg shadow-red-100 mt-2"
            >
              {loading ? "Creating Account..." : "Create Employer Account →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an employer account?{" "}
              <Link href="/employer/login" className="text-[#002868] font-bold hover:text-[#C8102E] transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
