"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, ShieldCheck } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "../../../app/context/AuthContext";

export default function EmployerDeleteAccountPage() {
  const router = useRouter();
  const { auth, logout } = useAuth();

  const handleDelete = async () => {
    const userId = auth?.userId;
    if (!userId) return;
    
    const confirmed = confirm("Are you sure you want to permanently delete your company account? All job postings, applicant data, and settings will be permanently removed. This action cannot be undone.");
    
    if (!confirmed) return;
    
    try {
      // Use existing delete utility if available, or fetch directly
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth?.token || ''}`,
        }
      });

      if (!res.ok) throw new Error("Deletion failed");

      logout();
      alert("Account deleted successfully. We're sorry to see you go.");
      router.push("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Error deleting account. Please contact support if the issue persists.");
    }
  };

  return (
    <div className="p-8 max-w-4xl space-y-8 font-['DM_Sans',sans-serif]">
      <div className="header-section">
        <h1 className="text-3xl font-black text-[#002868] tracking-tight">Account Management</h1>
        <p className="text-gray-500 font-medium mt-2">Manage your employer profile and account termination settings.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 text-[#C8102E] rounded-xl flex items-center justify-center">
            <Trash2 size={20} />
          </div>
          <h2 className="text-lg font-black text-[#002868]">Delete Employer Account</h2>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
            <AlertTriangle className="text-amber-600 shrink-0" size={24} />
            <div className="space-y-2">
              <p className="text-amber-900 font-black text-sm uppercase tracking-wider">Warning: Permanent Action</p>
              <p className="text-amber-800/80 text-sm font-medium leading-relaxed">
                Deleting your account will permanently remove all your hospital/agency data, active job postings, and applicant history. This data cannot be recovered.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Security Confirmation</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#002868] transition-colors z-10" size={18} />
                <PasswordInput 
                  placeholder="Enter your password to confirm..." 
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-[#002868]/10 transition-all font-semibold text-sm"
                />
              </div>
            </div>

            <button 
              onClick={handleDelete}
              className="w-full bg-[#C8102E] text-white py-5 rounded-2xl font-black text-sm hover:bg-[#b00e28] transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
            >
              PERMANENTLY DELETE MY ACCOUNT
            </button>
            <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-tighter">
              By clicking this button, you acknowledge the permanent loss of all data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
