"use client";
import React from "react";
import Link from "next/link";
import { Stethoscope, Building2, ArrowRight } from "lucide-react";
import AppLogo from "../components/AppLogo";

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002868] to-[#001540] flex items-center justify-center p-4 font-['DM_Sans',sans-serif]">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C8102E]/10 rounded-full" />
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="text-center mb-10">
          <AppLogo className="h-12 w-auto mx-auto" />
          <p className="text-blue-200 text-sm mt-4">Choose how you want to register</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nurse Card */}
          <Link href="/register/nurse"
            className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer">
            <div className="w-20 h-20 rounded-2xl bg-[#C8102E] mx-auto mb-5 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-110 transition-transform duration-300">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Register as Nurse</h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              Find top nursing jobs across America's leading hospitals & healthcare facilities
            </p>
            <div className="flex items-center justify-center gap-2 text-[#C8102E] font-bold text-sm bg-white rounded-xl px-4 py-2.5 group-hover:bg-red-50 transition-colors">
              Get Started
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Employer Card */}
          <Link href="/employer/register"
            className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer">
            <div className="w-20 h-20 rounded-2xl bg-[#002868] mx-auto mb-5 flex items-center justify-center shadow-lg shadow-blue-900/30 border border-white/20 group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Register as Employer</h2>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              Post nursing jobs & find qualified candidates for your hospital or healthcare organization
            </p>
            <div className="flex items-center justify-center gap-2 text-[#002868] font-bold text-sm bg-white rounded-xl px-4 py-2.5 group-hover:bg-blue-50 transition-colors">
              Get Started
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        <p className="text-center text-blue-200 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-white font-bold hover:text-[#C8102E] transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
