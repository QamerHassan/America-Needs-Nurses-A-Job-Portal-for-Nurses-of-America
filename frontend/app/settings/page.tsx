"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Info, LogOut, ChevronRight, ShieldCheck, Mail, Phone, UserCheck } from "lucide-react";

export default function SettingsPage() {
  const { auth, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    window.location.href = "/";
  };

  const sections = [
    {
      id: "account_type",
      label: "Account type",
      value: "Job seeker",
      action: "Change account type",
      icon: <UserCheck size={20} className="text-[#1B3A6B]" />
    },
    {
      id: "email",
      label: "Email",
      value: auth?.email || "No email set",
      action: "Change email",
      icon: <Mail size={20} className="text-[#1B3A6B]" />
    },
    {
      id: "phone",
      label: "Phone number",
      value: "+92 324 5963808", // Placeholder matching screenshot
      action: "Change phone number",
      icon: <Phone size={20} className="text-[#1B3A6B]" />
    },
    {
      id: "passkey",
      label: "Passkey",
      value: "",
      action: "Create passkey",
      icon: <ShieldCheck size={20} className="text-[#1B3A6B]" />,
      info: "Passkeys allow you to sign in without a password."
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <main className="container mx-auto px-6 py-16 max-w-4xl flex-grow">
        <h1 className="text-3xl font-black text-[#1B3A6B] mb-12">Account settings</h1>

        <div className="space-y-0 border-t border-gray-100">
           {sections.map((section) => (
             <div key={section.id} className="py-10 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-start gap-5">
                   <div className="mt-1">{section.icon}</div>
                   <div>
                      <h3 className="text-sm font-black text-[#1B3A6B] uppercase tracking-widest mb-2">{section.label}</h3>
                      <p className="text-gray-500 font-bold mb-2">{section.value}</p>
                      {section.info && (
                        <p className="flex items-center gap-1.5 text-xs text-blue-500 font-black">
                           <Info size={14} /> {section.info}
                        </p>
                      )}
                   </div>
                </div>
                
                <button className="px-6 py-3 bg-white border-2 border-gray-100 text-[#1B3A6B] rounded-xl font-black text-xs uppercase tracking-widest hover:border-[#CC2229] hover:text-[#CC2229] transition-all flex items-center gap-2">
                   {section.action} <ChevronRight size={14} />
                </button>
             </div>
           ))}

           {/* Sign Out Section */}
           <div className="py-12 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-400">{auth?.email}</p>
              <button 
                onClick={handleSignOut}
                className="px-8 py-4 bg-gray-50 text-[#CC2229] rounded-2xl font-black text-sm hover:bg-red-50 transition-all flex items-center gap-2"
              >
                <LogOut size={20} /> Sign out
              </button>
           </div>
        </div>

        {/* Closing Help */}
        <div className="mt-20 p-10 bg-gray-50 rounded-3xl text-center border border-gray-100">
           <h4 className="text-sm font-black text-[#1B3A6B] mb-2">Need to close your account?</h4>
           <p className="text-xs font-bold text-gray-400 mb-6">Closing your account will delete all your data and access to saved jobs.</p>
           <button className="text-[#CC2229] font-black text-sm hover:underline">Close account</button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
