"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PlusSquare, Search, User, ArrowUp } from "lucide-react";
import Logo from "../components/Logo";
import NotificationDropdown from "../components/NotificationDropdown";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { getDashboardData } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const DashboardContext = React.createContext<{
  data: any;
  loading: boolean;
  refresh: () => Promise<void>;
  employer: any;
  profile: any;
  completeness: number;
} | null>(null);

export const useDashboard = () => {
  const context = React.useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
};

export default function EmployerPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, logout, isHydrated } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const formatUrl = (path: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const fetchDashboardData = async () => {
    if (!auth?.userId) return;
    try {
      const data = await getDashboardData(auth.userId);
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch employer dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auth guard — wait for hydration then check role
  useEffect(() => {
    if (!isHydrated) return;
    if (!auth || auth.role !== "EMPLOYER") {
      router.replace("/employer/login");
      return;
    }
    fetchDashboardData();
  }, [isHydrated, auth]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const employer = dashboardData?.user;
  const profile = employer?.EmployerProfile;
  const company = dashboardData?.companies?.[0] || null;
  const employerName = profile?.companyName || employer?.name || "Member";
  const employerImage = employer?.image || company?.logoUrl || null;
  const companySlug = company?.slug || null;

  const completeness = React.useMemo(() => {
    if (!employer) return 0;
    const fields = [
      profile?.companyName || employer.name,
      profile?.companyCategory,
      profile?.about,
      profile?.phone || employer.phone,
      profile?.location,
      profile?.companySize,
      profile?.foundedYear,
      profile?.revenue,
      profile?.address,
      profile?.state,
      profile?.zipCode,
      profile?.website,
      employer.image,
    ];
    const filled = fields.filter((f) => !!f).length;
    return Math.round((filled / fields.length) * 100);
  }, [employer, profile]);

  // Skip layout for public-facing routes
  const isPublicRoute =
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/employer/detail");

  if (isPublicRoute) return <>{children}</>;

  // Show nothing while hydrating to prevent flash
  if (!isHydrated) return null;
  if (!auth || auth.role !== "EMPLOYER") return null;

  return (
    <DashboardContext.Provider
      value={{
        data: dashboardData,
        loading,
        refresh: fetchDashboardData,
        employer,
        profile,
        completeness,
      }}
    >
      <SidebarProvider>
        <AppSidebar
          role="employer"
          userData={{
            id: employer?.id,
            name: employerName,
            location: [profile?.city, profile?.state].filter(Boolean).join(", "),
            avatarUrl: formatUrl(employerImage),
            completeness: completeness,
            companySlug: companySlug,
          }}
        />
        <SidebarInset className="min-h-screen bg-gray-50 flex flex-col font-['DM_Sans',sans-serif]">
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-[#C8102E] text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-[#a00d25] transition-all transform hover:scale-110"
            >
              <ArrowUp size={20} strokeWidth={3} />
            </button>
          )}

          {/* Top bar */}
          <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="text-[#002868] hover:bg-slate-100" />
              <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 w-full max-w-md transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-[#002868]/10 focus-within:border-[#002868]/20">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates, jobs..."
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-600 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 header-dropdown">
              {employer?.id && (
                <NotificationDropdown userId={employer.id} role="employer" />
              )}

              <div className="relative">
                <Link
                  href={companySlug ? `/company/${companySlug}` : "/employer/profile"}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#002868] hover:bg-gray-100 transition-all border border-gray-100 overflow-hidden hover:ring-2 hover:ring-[#C8102E]/30"
                  title="View Public Profile"
                >
                  {employerImage ? (
                    <img
                      src={formatUrl(employerImage)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const initials = document.createElement("div");
                          initials.className = "flex items-center justify-center w-full h-full text-[#002868] font-bold text-xs";
                          initials.innerText = (employerName?.[0] || "E").toUpperCase();
                          parent.appendChild(initials);
                        }
                      }}
                    />
                  ) : (
                    <User size={18} />
                  )}
                </Link>
              </div>

              <Link
                href="/employer/post_job"
                className="hidden sm:flex bg-[#C8102E] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#a00d25] transition-all items-center gap-2 shadow-sm"
              >
                <PlusSquare size={16} />
                Post Job
              </Link>
            </div>
          </header>

          <main className="p-6 flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardContext.Provider>
  );
}
