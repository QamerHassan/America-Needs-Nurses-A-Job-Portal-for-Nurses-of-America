"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppLogo from "./AppLogo";
import LoginModal from "./LoginModal";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const pathname = usePathname();

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

          <ul className="nav-menu">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/jobs">Jobs</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>


          <div className="nav-actions">
            <button className="btn-signin" onClick={() => setIsLoginOpen(true)}>
              Sign In
            </button>
            <Link href="/register" className="btn-register-today">
              Register Today
            </Link>
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
