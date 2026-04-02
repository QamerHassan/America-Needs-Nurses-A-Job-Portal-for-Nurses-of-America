"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  FileText,
  Bell,
  Bookmark,
  Users,
  MessageSquare,
  Lock,
  Trash2,
  LogOut,
  Send,
  Gauge,
} from "lucide-react";
import Logo from "../../../components/Logo";
import { useAuth } from "../../../context/AuthContext";

export default function DashboardSidebar({ user, stats }: { user?: any; stats?: any }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { name: "User Dashboard", icon: <Gauge size={18} />, path: "/nurse" },
    { name: "My Profile", icon: <User size={18} />, path: "/nurse/profile" },
    { name: "My Resumes", icon: <FileText size={18} />, path: "/nurse/resumes" },
    { name: "Applied jobs", icon: <Send size={18} />, path: "/nurse/applied-jobs" },
    { name: "Alert Jobs", icon: <Bell size={18} />, path: "/nurse/alerts", badge: stats?.alertCount, badgeColor: "#002868" },
    { name: "Shortlist Jobs", icon: <Bookmark size={18} />, path: "/nurse/shortlisted", badge: stats?.savedJobsCount },
    { name: "Following Employers", icon: <Users size={18} />, path: "/nurse/following" },
    { name: "Nurse Community", icon: <Users size={18} />, path: "/nurse/community" },
    { name: "Messages", icon: <MessageSquare size={18} />, path: "/nurse/messages", badge: stats?.unreadMessagesCount, badgeColor: "#C8102E" },
    { name: "Change Password", icon: <Lock size={18} />, path: "/nurse/password" },
    { name: "Delete Account", icon: <Trash2 size={18} />, path: "/nurse/delete" },
    { name: "Log Out", icon: <LogOut size={18} />, path: "/" },
  ];

  return (
    <aside className="w-[280px] min-w-[280px] h-screen bg-white border-r border-[#edf2f7] flex flex-col sticky top-0 overflow-y-auto overflow-x-hidden z-[100]">
      {/* Logo */}
      <div className="p-6 pb-5 border-b border-[#f7fafc] shrink-0">
        <Link href="/">
          <Logo theme="dark" size="xs" />
        </Link>
      </div>

      {/* Profile Section - Centered Vertical (Job Stock Style) */}
      <div className="flex flex-col items-center p-8 pb-6 border-b border-[#f7fafc] shrink-0 bg-white">
        <Link href={user?.id ? `/candidate/${user.id}` : "#"} className="mb-4 block shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#f8fafc] bg-[#f1f5f9] flex items-center justify-center shadow-sm hover:border-[#fef2f2] transition-all">
            {user?.image || user?.NurseProfile?.profilePicture ? (
              <img
                src={user?.image || user?.NurseProfile?.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover block"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={44} color="#9ca3af" />
              </div>
            )}
          </div>
        </Link>

        {user?.id && (
          <div className="text-center w-full">
            <div className="flex items-center justify-center gap-1 mb-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((s) => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24" className="shrink-0">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#C8102E" />
                  </svg>
                ))}
                <svg width="12" height="12" viewBox="0 0 24 24" className="shrink-0">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#E2E8F0" />
                </svg>
              </div>
              <span className="text-[12px] font-bold text-[#2d3748]">4.7</span>
            </div>
            <h3 className="text-[17px] font-bold text-[#2d3748] mb-1 truncate leading-tight">
              {user?.name || user?.NurseProfile?.fullName || "Candidate"}
            </h3>
            <p className="text-[12px] text-[#718096] font-medium truncate">
              {user?.NurseProfile?.specialization || "Professional Nurse"}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="py-6 flex-1">
        <p className="px-8 pb-3 text-[11px] font-extrabold uppercase text-[#a0aec0] tracking-widest">
          Main Navigation
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
                    className="flex flex-row items-center gap-3.5 px-8 py-3.5 text-[15px] font-medium text-[#4a5568] hover:text-[#D32F2F] hover:bg-red-50 transition-all duration-200 w-full text-left border-l-4 border-transparent"
                  >
                    <span className="flex items-center justify-center text-[#718096] group-hover:text-[#D32F2F] transition-colors">{item.icon}</span>
                    <span className="whitespace-nowrap flex-1">{item.name}</span>
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex flex-row items-center gap-3.5 px-8 py-3.5 text-[15px] font-medium transition-all duration-200 border-l-4 ${
                      isActive 
                        ? "bg-[#f0f7ff] text-[#002868] font-semibold border-[#002868]" 
                        : "text-[#4a5568] border-transparent hover:text-[#C8102E] hover:bg-[#fff5f5]"
                    }`}
                  >
                    <span className={`flex items-center justify-center transition-colors ${
                      isActive ? "text-[#002868]" : "text-[#718096] group-hover:text-[#C8102E]"
                    }`}>
                      {item.icon}
                    </span>
                    <span className="whitespace-nowrap flex-1">{item.name}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="text-white text-[10px] font-extrabold min-w-[20px] h-5 px-1.5 rounded-full inline-flex items-center justify-center shrink-0 leading-none" style={{ background: item.badgeColor || "#C8102E" }}>
                        {item.badge}
                      </span>
                    )}
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