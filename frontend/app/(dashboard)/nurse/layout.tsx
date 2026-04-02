"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import Link from "next/link";
import { getDashboardData } from "../../utils/api";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/AppSidebar";
import { User, Search } from "lucide-react";
import NotificationDropdown from "../../components/NotificationDropdown";
import { useAuth } from "../../context/AuthContext";

const DashboardContext = createContext<any>(null);
export const useDashboard = () => useContext(DashboardContext);

export default function NurseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { auth, logout, isHydrated } = useAuth();
  const router = useRouter();

  const fetchDashboardData = async () => {
    if (!auth?.userId) return;
    getDashboardData(auth.userId)
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  };

  // Auth guard — wait for hydration, then check role
  useEffect(() => {
    if (!isHydrated) return;
    if (!auth || auth.role !== "NURSE") {
      router.replace("/");
      return;
    }
    fetchDashboardData();
  }, [isHydrated, auth]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Prevent layout flash during hydration
  if (!isHydrated) return null;
  if (!auth || auth.role !== "NURSE") return null;

  return (
    <DashboardContext.Provider value={{ data: dashboardData, loading, refresh: fetchDashboardData }}>
      <SidebarProvider>
        <AppSidebar
          role="nurse"
          userData={{
            id: dashboardData?.user?.id,
            name: dashboardData?.user?.name,
            location: [dashboardData?.user?.NurseProfile?.state, dashboardData?.user?.NurseProfile?.country]
              .filter(Boolean)
              .join(", "),
            avatarUrl: dashboardData?.user?.image,
          }}
        />
        <SidebarInset className="min-h-screen bg-[#f8fafc] flex flex-col font-['DM_Sans',sans-serif]">
          {/* Header */}
          <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="text-[#002868] hover:bg-slate-100" />
              <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full max-w-sm">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, community..."
                  className="bg-transparent border-none outline-none text-xs w-full text-gray-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {dashboardData?.user?.id && (
                <NotificationDropdown userId={dashboardData.user.id} role="nurse" />
              )}
              <div className="flex items-center gap-3 px-2 py-1 bg-gray-50 rounded-full border border-gray-100">
                {dashboardData?.user?.id ? (
                  <Link href={`/candidate/${dashboardData.user.id}`}>
                    <div className="w-7 h-7 rounded-full bg-[#002868] flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                      {dashboardData?.user?.image ? (
                        <img
                          src={dashboardData.user.image}
                          alt={dashboardData?.user?.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        dashboardData?.user?.name?.[0]?.toUpperCase() || <User size={14} />
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#002868] flex items-center justify-center text-white text-[10px] font-bold overflow-hidden shrink-0">
                    <User size={14} />
                  </div>
                )}
                <span className="text-xs font-bold text-[#002868] hidden sm:block">
                  {dashboardData?.user?.name || "Member"}
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-10">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardContext.Provider>
  );
}
