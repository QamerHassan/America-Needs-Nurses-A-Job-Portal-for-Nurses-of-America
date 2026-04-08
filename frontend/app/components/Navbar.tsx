"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppLogo from "./AppLogo";
import LoginModal from "./LoginModal";
import { useAuth } from "../context/AuthContext";
import { Bookmark, MessageCircle, Bell, User, Settings, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const { auth, logout } = useAuth();

  // Fetch counts when auth is ready
  useEffect(() => {
    if (auth?.userId) {
      const fetchCounts = async () => {
        try {
          const { getSavedJobs, getConversations, getNotifications } = await import("../utils/api");
          const [saved, convs, notifs] = await Promise.all([
            getSavedJobs(auth.userId),
            getConversations(auth.userId),
            getNotifications(auth.userId)
          ]);
          setSavedCount(saved?.length || 0);
          setMessageCount(convs?.filter((c: any) => c.unreadCount > 0).length || 0);
          setNotifCount(notifs?.filter((n: any) => !n.isRead).length || 0);
        } catch (err) {
          console.error("Failed to fetch counts:", err);
        }
      };
      fetchCounts();
    }
  }, [auth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide the main navbar if we are in dashboards or public profile pages
  if (
    pathname?.startsWith("/nurse") || 
    pathname?.startsWith("/admin") || 
    pathname?.startsWith("/employer") ||
    pathname?.startsWith("/company/") ||
    pathname?.startsWith("/candidate/")
  ) {
    return null;
  }

  return (
    <>
      <nav className="ann-navbar">
        <div className="nav-container">
          <AppLogo className="h-10 w-auto" />

          {(!auth || auth.role !== 'NURSE') && (
            <ul className="nav-menu">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/jobs">Jobs</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          )}

          <div className="nav-actions">
            {auth && auth.role === 'NURSE' ? (
              <div className="flex items-center gap-6">
                {/* Saved Jobs */}
                <Link 
                  href="/saved-jobs" 
                  onClick={() => setSavedCount(0)}
                  className="relative text-[#002868] hover:text-[#C8102E] transition-colors"
                >
                  <Bookmark size={22} />
                  {savedCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#C8102E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {savedCount}
                    </span>
                  )}
                </Link>

                {/* Messages */}
                <Link 
                  href="/messages" 
                  onClick={() => setMessageCount(0)}
                  className="relative text-[#002868] hover:text-[#C8102E] transition-colors"
                >
                  <MessageCircle size={22} />
                  {messageCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#C8102E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {messageCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <Link 
                  href="/notifications" 
                  onClick={() => setNotifCount(0)}
                  className="relative text-[#002868] hover:text-[#C8102E] transition-colors mr-2"
                >
                  <Bell size={22} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#C8102E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {notifCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#002868] text-white flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                      {auth.image ? (
                        <img src={auth.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden">
                      <Link 
                        href="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#002868] hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} className="text-gray-400" /> My Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#002868] hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={16} className="text-gray-400" /> Settings
                      </Link>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button 
                        onClick={() => { setIsDropdownOpen(false); logout(); window.location.href = '/'; }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#C8102E] hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button className="btn-signin" onClick={() => setIsLoginOpen(true)}>
                  Sign In
                </button>
                <Link href="/register" className="btn-register-today">
                  Register Today
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <style jsx>{`
        .ann-navbar {
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 40, 104, 0.08);
          height: 72px;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 0 5%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .nav-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-logo-link {
          display: flex;
          align-items: center;
          transition: opacity 0.2s;
        }
        .nav-logo-link:hover {
          opacity: 0.85;
        }
        .nav-menu {
          display: flex;
          list-style: none;
          gap: 32px;
          margin: 0;
          padding: 0;
        }
        .nav-menu a {
          text-decoration: none;
          color: #002868;
          font-weight: 600;
          font-size: 14.5px;
          font-family: 'Inter', system-ui, sans-serif;
          transition: color 0.2s;
        }
        .nav-menu a:hover {
          color: #C8102E;
        }
        .nav-actions {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .btn-signin {
          background: transparent;
          border: 1.5px solid #002868;
          color: #002868;
          padding: 9px 22px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-signin:hover {
          background: #f1f4f9;
        }
        .btn-register-today {
          background: #C8102E !important;
          color: #ffffff !important;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none !important;
          display: inline-block;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(200, 16, 46, 0.25);
          border: none;
          cursor: pointer;
        }
        .btn-register-today:hover {
          background: #a00d25 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(200, 16, 46, 0.35);
        }

        @media (max-width: 1100px) {
          .nav-menu { gap: 20px; }
        }
        @media (max-width: 950px) {
          .nav-menu { display: none; }
          .ann-navbar { padding: 0 24px; height: 64px; }
        }
      `}</style>
    </>
  );
}
