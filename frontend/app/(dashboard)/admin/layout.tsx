"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { getDashboardData } from "../../utils/api";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/AppSidebar";
import { Bell, Settings, ShieldCheck, Search } from "lucide-react";
import { useAuth, isAdminRole } from "../../context/AuthContext";

const AdminDashboardContext = createContext<any>(null);
export const useAdminDashboard = () => useContext(AdminDashboardContext);

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { auth, logout, isHydrated } = useAuth();
  const router = useRouter();

  // Auth guard — wait for hydration, then verify admin role
  useEffect(() => {
    if (!isHydrated) return;
    if (!auth || !isAdminRole(auth.role)) {
      console.warn("[Admin layout] Unauthorized or no admin session, redirecting.");
      router.replace("/");
      return;
    }

    getDashboardData(auth.userId)
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch admin data:", err);
        setLoading(false);
      });
  }, [isHydrated, auth]);

  // Prevent layout flash during hydration
  if (!isHydrated) return null;
  if (!auth || !isAdminRole(auth.role)) return null;

  return (
    <AdminDashboardContext.Provider
      value={{
        data: dashboardData,
        loading,
        pendingCompanies: dashboardData?.stats?.pendingCompanies || 0,
        pendingJobs: dashboardData?.stats?.pendingJobs || 0,
      }}
    >
      <SidebarProvider>
        <AppSidebar
          role="admin"
          userData={{
            name: dashboardData?.user?.name,
            location: dashboardData?.user?.role?.replace(/_/g, " ") || "Admin",
            avatarUrl: dashboardData?.user?.image,
            pendingCompanies: dashboardData?.stats?.pendingCompanies || 0,
            pendingJobs: dashboardData?.stats?.pendingJobs || 0,
          }}
        />
        <SidebarInset className="min-h-screen bg-[#f4f7f6] flex flex-col font-['DM_Sans',sans-serif]">
          {/* Admin Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="text-[#002868] hover:bg-slate-100" />
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-[#002868]">
                <ShieldCheck size={16} />
                <span className="text-xs font-black uppercase tracking-wider">Admin Console</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-64">
                <Search size={14} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Global search..."
                  className="bg-transparent border-none outline-none text-[10px] w-full"
                />
              </div>
              <button className="text-gray-400 hover:text-[#002868] transition-colors">
                <Bell size={18} />
              </button>
              <button className="text-gray-400 hover:text-[#002868] transition-colors">
                <Settings size={18} />
              </button>
              <div className="h-6 w-[1px] bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-[#002868] leading-none uppercase">
                    {dashboardData?.user?.name || "Admin User"}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">
                    {dashboardData?.user?.role?.replace(/_/g, " ") || "Root Access"}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#C8102E] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-red-100 overflow-hidden">
                  {dashboardData?.user?.image ? (
                    <img
                      src={dashboardData.user.image}
                      alt={dashboardData?.user?.name || "Admin"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    dashboardData?.user?.name?.[0]?.toUpperCase() || "A"
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 lg:p-12">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AdminDashboardContext.Provider>
  );
}
