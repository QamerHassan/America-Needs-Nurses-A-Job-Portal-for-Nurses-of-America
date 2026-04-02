"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Building2,
  Briefcase,
  Layers,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Mail,
  FileText,
  DollarSign,
} from "lucide-react";
import Logo from "../../../components/Logo";
import { useAuth } from "../../../context/AuthContext";

export default function AdminSidebar({ user }: { user?: any }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: "Admin Overview", icon: <LayoutDashboard size={18} />, path: "/admin", allowedRoles: ["SUPER_ADMIN", "SUPPORT_ADMIN", "CONTENT_ADMIN"] },
    { name: "Manage Companies", icon: <Building2 size={18} />, path: "/admin/companies", allowedRoles: ["SUPER_ADMIN", "SUPPORT_ADMIN"] },
    { name: "Financial Audit", icon: <DollarSign size={18} />, path: "/admin/payments", allowedRoles: ["SUPER_ADMIN", "SUPPORT_ADMIN"] },
    { name: "Blog & Resources", icon: <FileText size={18} />, path: "/admin/blog", allowedRoles: ["SUPER_ADMIN", "CONTENT_ADMIN"] },
    { name: "Newsletter Center", icon: <Mail size={18} />, path: "/admin/newsletter", allowedRoles: ["SUPER_ADMIN", "CONTENT_ADMIN"] },
    { name: "Subscription Tiers", icon: <Layers size={18} />, path: "/admin/subscriptions/plans", allowedRoles: ["SUPER_ADMIN", "SUPPORT_ADMIN"] },
    { name: "Administrative Access", icon: <ShieldCheck size={18} />, path: "/admin/admins", allowedRoles: ["SUPER_ADMIN"] },
    { name: "Log Out", icon: <LogOut size={18} />, path: "/", allowedRoles: ["SUPER_ADMIN", "SUPPORT_ADMIN", "CONTENT_ADMIN"] },
  ].filter(item => {
    if (!user || !user.role) return item.allowedRoles.includes("SUPER_ADMIN"); // Safe fallback
    if (user.role === "SUPER_ADMIN") return true;
    return item.allowedRoles.includes(user.role);
  });

  return (
    <aside className="w-[280px] min-w-[280px] h-screen bg-white border-r border-[#edf2f7] flex flex-col sticky top-0 overflow-y-auto overflow-x-hidden z-[1000]">
      {/* Logo */}
      <div className="p-6 pb-5 border-b border-[#f7fafc] shrink-0">
        <Link href="/">
          <Logo theme="dark" size="xs" />
        </Link>
      </div>

      {/* Admin Profile Section - Now in one row */}
      <div className="flex flex-row items-center p-6 gap-4 border-b border-[#f7fafc] shrink-0 bg-white group transition-all duration-300">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border-4 border-[#f8fafc] bg-[#f1f5f9] flex items-center justify-center shadow-sm shrink-0 group-hover:border-[#eff6ff] transition-all">
          <div className="w-full h-full flex items-center justify-center">
            <ShieldCheck size={28} color="#002868" />
          </div>
        </div>
        
        <div className="flex flex-col min-w-0 gap-0.5">
          <span className="text-[10px] font-extrabold text-[#002868] uppercase tracking-wider">Admin</span>
          <h3 className="text-[15px] font-bold text-[#002868] truncate leading-tight">
            {user?.name || "Qamer Hassan"}
          </h3>
          <p className="text-[10px] text-[#C8102E] font-bold uppercase tracking-tight">
            {user?.role === "SUPER_ADMIN" ? "Super Administrator" : 
             user?.role === "SUPPORT_ADMIN" ? "Support Administrator" : 
             user?.role === "CONTENT_ADMIN" ? "Content Administrator" : "Administrator"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="py-6 flex-1">
        <p className="px-8 pb-3 text-[11px] font-extrabold uppercase text-[#a0aec0] tracking-widest">
          Management Console
        </p>
        <ul className="list-none m-0 p-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const isLogout = item.name === "Log Out";

            return (
              <li key={item.name} className="mb-0.5 group">
                {isLogout ? (
                  <button
                    onClick={() => { logout(); window.location.href = "/"; }}
                    className="flex flex-row items-center gap-3.5 px-8 py-3.5 text-[14px] font-semibold text-[#4a5568] hover:text-[#D32F2F] hover:bg-red-50 transition-all duration-200 w-full text-left border-l-4 border-transparent"
                  >
                    <span className="flex items-center justify-center text-[#718096] group-hover:text-[#D32F2F] transition-colors">{item.icon}</span>
                    <span className="whitespace-nowrap">{item.name}</span>
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex flex-row items-center gap-3.5 px-8 py-3.5 text-[14px] font-semibold transition-all duration-200 border-l-4 ${
                      isActive 
                        ? "bg-[#f0f7ff] text-[#002868] border-[#002868]" 
                        : "text-[#4a5568] border-transparent hover:text-[#C8102E] hover:bg-[#fff5f5]"
                    }`}
                  >
                    <span className={`flex items-center justify-center transition-colors ${
                      isActive ? "text-[#002868]" : "text-[#718096] group-hover:text-[#C8102E]"
                    }`}>
                      {item.icon}
                    </span>
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
