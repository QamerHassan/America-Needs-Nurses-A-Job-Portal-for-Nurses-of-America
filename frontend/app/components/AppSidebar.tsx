"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppLogo from "./AppLogo";
import {
  Home,
  Briefcase,
  Users,
  LayoutDashboard,
  MessageSquare,
  FileSearch,
  PlusCircle,
  Settings,
  Star as StarIcon,
  BookOpen,
  Mail,
  HelpCircle,
  Building2,
  ChevronRight,
  LogOut,
  User,
  History,
  Lock,
  Gauge,
  FileText,
  Bell,
  Trash2,
  Bookmark,
  Layers,
  ShieldCheck,
  Package,
  PlusSquare,
  Box,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "../context/AuthContext";

const SidebarStyles = () => (
  <style jsx global>{`
    /* THE PREMIUM SIDEBAR SLIDER */
    .custom-sidebar-slider::-webkit-scrollbar {
      width: 5px;
    }
    .custom-sidebar-slider::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-sidebar-slider::-webkit-scrollbar-thumb {
      background: rgba(0, 40, 104, 0.1);
      border-radius: 10px;
      transition: all 0.3s ease;
    }
    .custom-sidebar-slider:hover::-webkit-scrollbar-thumb {
      background: rgba(0, 40, 104, 0.3);
    }
    
    /* SMOOTH SLIDE ANIMATIONS FOR NAVIGATION */
    .sidebar-slide-item {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .sidebar-slide-item:hover {
      transform: translateX(8px);
    }
    .sidebar-slide-item.active-item {
      transform: translateX(4px);
    }
  `}</style>
);

const UserAvatar = ({ url, name, size = "md" }: { url?: string; name?: string; size?: "sm" | "md" | "lg" }) => {
  const [hasError, setHasError] = React.useState(false);
  
  // RESET ERROR STATE ON URL CHANGE
  React.useEffect(() => {
    setHasError(false);
  }, [url]);

  const initials = (name?.[0] || "U").toUpperCase();
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-24 h-24 text-3xl"
  };

  if (!url || hasError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-slate-50 flex items-center justify-center text-[#002868] font-black border border-white shadow-sm overflow-hidden`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden border-2 border-white`}>
      <img 
        src={url} 
        alt={name || "User"} 
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export function AppSidebar({
  role: forcedRole,
  userData,
}: {
  role?: "nurse" | "employer" | "admin" | "guest";
  userData?: { id?: string; name?: string; location?: string; avatarUrl?: string; completeness?: number; pendingCompanies?: number; pendingJobs?: number; companySlug?: string };
}) {
  const pathname = usePathname();
  const { auth, logout } = useAuth();
  const [role, setRole] = React.useState<"nurse" | "employer" | "admin" | "guest">("guest");
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const { setOpen } = useSidebar();

  React.useEffect(() => {
    if (forcedRole) {
      setRole(forcedRole);
      return;
    }
    
    if (auth?.role === "NURSE") setRole("nurse");
    else if (auth?.role === "EMPLOYER") setRole("employer");
    else if (auth?.role && ["SUPER_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN"].includes(auth.role)) setRole("admin");
    else setRole("guest");
  }, [pathname, forcedRole, auth]);

  // Fetch real unread message count
  React.useEffect(() => {
    const fetchUnread = async () => {
      const userId = auth?.userId;
      if (!userId) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/conversations/unread-count`, {
          headers: { "x-user-id": userId },
        });
        if (res.ok) {
          const count = await res.json();
          setUnreadMessages(typeof count === "number" ? count : 0);
        }
      } catch {
        // silently fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [auth]);

  const publicLinks = [
    { title: "Home", url: "/", icon: Home },
    { title: "Jobs", url: "/jobs", icon: Briefcase },
    { title: "Companies", url: "/companies", icon: Building2 },
    { title: "Blog", url: "/blog", icon: BookOpen },
    { title: "Pricing", url: "/pricing", icon: ShieldCheck },
  ];

  const nurseLinks = [
    { title: "User Dashboard", url: "/nurse", icon: Gauge },
    { title: "My Profile", url: "/nurse/profile", icon: User },
    { title: "My Resumes", url: "/nurse/resumes", icon: FileText },
    { title: "Applied Jobs", url: "/nurse/applied-jobs", icon: Briefcase },
    { title: "Saved Jobs", url: "/nurse/shortlisted", icon: Bookmark },
    { title: "Messages", url: "/nurse/messages", icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : undefined },
    { title: "Change Password", url: "/nurse/password", icon: Lock },
    { title: "Delete Account", url: "/nurse/delete", icon: Trash2 },
  ];

  const employerLinks = [
    { title: "User Dashboard", url: "/employer/dashboard", icon: Gauge },
    { title: "User Profile", url: "/employer/profile", icon: User },
    { title: "My Jobs", url: "/employer/my-jobs", icon: Briefcase },
    { title: "Post Job", url: "/employer/post_job", icon: PlusSquare },
    { title: "Applicants Jobs", url: "/employer/applicants", icon: Users },
    { title: "Shortlisted Candidates", url: "/employer/shortlisted", icon: StarIcon },
    { title: "Package", url: "/employer/package", icon: Box },
    { title: "Messages", url: "/employer/messages", icon: MessageSquare },
    { title: "Change Password", url: "/employer/change-password", icon: Lock },
  ];

  const adminLinks = [
    { title: "Admin Overview", url: "/admin", icon: LayoutDashboard },
    { title: "Manage Companies", url: "/admin/companies", icon: Building2, badge: userData?.pendingCompanies && userData.pendingCompanies > 0 ? userData.pendingCompanies : undefined },
    { title: "Blog & Resources", url: "/admin/blog", icon: FileText },
    { title: "Newsletter Center", url: "/admin/newsletter", icon: Mail },
    { title: "Subscription Tiers", url: "/admin/subscriptions/plans", icon: Layers },
    { title: "Admin Access", url: "/admin/admins", icon: ShieldCheck },
  ];

  const isActive = (url: string) => pathname === url;

  return (
    <>
    <SidebarStyles />
    <Sidebar 
      collapsible="icon" 
      className="border-r border-gray-100 bg-white shadow-xl"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <SidebarHeader className="h-16 flex items-center border-b border-gray-50 px-4 group-data-[collapsible=icon]:p-2">
        <div className="w-full flex justify-start group-data-[collapsible=icon]:hidden">
          <AppLogo className="h-8 w-auto" />
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex w-full h-8 shrink-0 items-center justify-center overflow-hidden">
          <AppLogo className="h-8 w-8" width={32} height={32} />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 overflow-y-auto custom-sidebar-slider space-y-1">
        {/* PROFILE HEADER (FOR DASHBOARD USERS) */}
        {role !== "guest" && (
          <div className="flex flex-col items-center py-8 px-4 group-data-[collapsible=icon]:hidden">
            <div className="relative mb-4 hover:scale-105 transition-transform duration-200">
              <Link href={role === "nurse" && userData?.id ? `/candidate/${userData.id}` : (userData?.companySlug ? `/company/${userData.companySlug}` : "/employer/profile")}>
                <UserAvatar url={userData?.avatarUrl} name={userData?.name} size="lg" />
              </Link>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#22c55e] text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg border-2 border-white uppercase tracking-widest pointer-events-none">
                Active
              </div>
            </div>
            <h3 className="text-lg font-black text-[#002868] mt-2 mb-0.5 tracking-tight text-center truncate max-w-full px-2">
              {userData?.name || "User"}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter text-center">
              {userData?.location || "Update Your Profile"}
            </p>

            {role === "employer" && userData?.completeness !== undefined && (
              <div className="w-full mt-4 px-2">
                <div className="flex justify-between text-[10px] font-bold text-[#002868] mb-1 uppercase tracking-wider">
                  <span>Profile Completion</span>
                  <span>{userData.completeness}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#C8102E] transition-all duration-500 ease-out" 
                    style={{ width: `${userData.completeness}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ROLE-SPECIFIC PORTAL NAVIGATION (DEDICATED) */}
        {role !== "guest" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-3">
              MAIN NAVIGATION
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {(role === "nurse" ? nurseLinks : role === "employer" ? employerLinks : adminLinks).map((item: any) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className={`h-12 transition-all rounded-xl sidebar-slide-item ${
                        isActive(item.url) 
                          ? 'bg-[#002868] text-white font-black shadow-xl shadow-blue-900/30 active-item scale-[1.02]' 
                          : item.isCritical 
                            ? 'text-[#C8102E] hover:bg-red-50 font-black'
                            : 'text-slate-600 hover:bg-slate-50 font-bold'
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 ${isActive(item.url) ? 'text-white' : item.isCritical ? 'text-red-500' : 'text-slate-400'}`} />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {(item as any).badge && (
                      <SidebarMenuBadge className="bg-[#C8102E] text-white font-bold rounded-full h-5 min-w-5 flex items-center justify-center text-[10px]">
                        {(item as any).badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* PUBLIC NAVIGATION (ONLY FOR GUESTS) */}
        {role === "guest" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-3">
              Public View
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {publicLinks.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className={`h-11 transition-all ${isActive(item.url) ? 'bg-[#002868]/5 text-[#002868] font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <Link href={item.url}>
                        <item.icon className={`h-4 w-4 ${isActive(item.url) ? 'text-[#C8102E]' : 'text-slate-400'}`} />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>

      <SidebarFooter className="border-t border-slate-50 p-3 bg-slate-50/50">
        <SidebarMenu>
          <SidebarMenuItem>
             <div className="flex items-center gap-3 px-2 py-1 group-data-[collapsible=icon]:px-1">
               <UserAvatar url={userData?.avatarUrl} name={userData?.name} size="sm" />
               <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                 <span className="text-[11px] font-black text-[#002868] truncate leading-none mb-0.5">{userData?.name || (role === "guest" ? "Guest User" : "Member")}</span>
                 <span className="text-[9px] font-bold text-slate-400 truncate uppercase tracking-tighter">{role} Access</span>
               </div>
             </div>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-2">
            <SidebarMenuButton 
              asChild 
              className="text-red-500 hover:bg-red-50 hover:text-red-600 font-bold transition-all"
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
            >
              <button className="flex items-center gap-3 px-2 w-full">
                <LogOut size={16} />
                <span className="text-sm group-data-[collapsible=icon]:hidden">Log Out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    </>
  );
}
