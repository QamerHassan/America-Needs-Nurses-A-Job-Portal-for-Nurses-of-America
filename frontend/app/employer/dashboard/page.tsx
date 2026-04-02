"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase, Bookmark, Eye, Star, Bell, Edit2, Trash2,
  TrendingUp, Users, Building, ChevronRight, MessageSquare, CheckCircle, Clock, AlertCircle,
  MoreHorizontal, PlusCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Redesigned Engagement Overview Chart (Matches Nurse Dashboard Aesthetic)
function EngagementOverview({ analytics }: { analytics: any }) {
  const apps = analytics?.applications || new Array(14).fill(0);
  const shortlisted = analytics?.shortlisted || new Array(14).fill(0);
  const jobs = analytics?.jobs || new Array(14).fill(0);

  // Totals for the summary row
  const totalApps = apps.reduce((a: number, b: number) => a + b, 0);
  const totalShortlisted = shortlisted.reduce((a: number, b: number) => a + b, 0);
  const totalJobs = jobs.reduce((a: number, b: number) => a + b, 0);

  // Real data points generator
  const mapDataToPoints = (data: number[]) => {
    const maxVal = Math.max(...data, 5); // Minimum scale of 5
    const scale = 200 / maxVal;
    
    return data.map((val, i) => ({
      x: 50 + (i * (700 / 13)),
      y: 250 - (val * scale)
    }));
  };

  const appPts = mapDataToPoints(apps);
  const shortPts = mapDataToPoints(shortlisted);
  const jobPts = mapDataToPoints(jobs);

  const toPath = (pts: any[]) => {
    if (pts.length === 0) return "";
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      // Use quadratic curves for some smoothing if there are enough points
      d += ` L${pts[i].x},${pts[i].y}`;
    }
    return d;
  };

  return (
    <div className="chart-container card-panel">
      <div className="panel-header flex items-center justify-between pb-6 border-b border-gray-100 mb-8">
        <div>
          <h3 className="text-sm font-black text-[#002868] uppercase tracking-widest">Recruitment Performance</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Application & Conversion funnel tracking</p>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-black uppercase text-gray-400 tracking-tighter">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-200" />Jobs</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C8102E] shadow-sm shadow-red-200" />Applications</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#002868] shadow-sm shadow-navy-200" />Shortlisted</span>
        </div>
      </div>
      
      <div className="mock-chart h-64 w-full">
         <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible">
           {/* Grid Lines */}
           {[0, 1, 2, 3].map(i => (
             <line key={i} x1="50" y1={50 + i*70} x2="750" y2={50 + i*70} stroke="#edf2f7" strokeWidth="1" />
           ))}
           
           {/* Jobs (Amber) */}
           <path d={toPath(jobPts)} fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5,5" opacity="0.6" />
           
           {/* Shortlisted (Navy) */}
           <path d={toPath(shortPts)} fill="none" stroke="#002868" strokeWidth="3" opacity="0.8" />
           <path d={`${toPath(shortPts)} V250 H50 Z`} fill="#002868" fillOpacity="0.03" />

           {/* Applications (Red) */}
           <path d={toPath(appPts)} fill="none" stroke="#C8102E" strokeWidth="4" />
           <path d={`${toPath(appPts)} V250 H50 Z`} fill="#C8102E" fillOpacity="0.08" />
           
           {/* End Points */}
           <circle cx={appPts[appPts.length - 1].x} cy={appPts[appPts.length - 1].y} r={6} fill="#C8102E" />
         </svg>
      </div>

      <div className="flex items-center justify-around mt-8 pt-6 border-t border-gray-50">
          <div className="text-center">
            <p className="text-lg font-black text-[#002868] leading-none mb-1">{(totalApps / (totalJobs || 1)).toFixed(1)}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Apps/Job Avg</p>
          </div>
          <div className="w-[1px] h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-lg font-black text-[#C8102E] leading-none mb-1">{((totalShortlisted / (totalApps || 1)) * 100).toFixed(0)}%</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Conversion Rate</p>
          </div>
      </div>
    </div>
  );
}

export default function EmployerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { auth } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!auth?.userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/dashboard/${auth.userId}`);
        if (!res.ok) throw new Error("Could not load dashboard data.");
        const d = await res.json();
        setData(d);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [auth]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-[#002868]/10 border-t-[#C8102E] rounded-full animate-spin" />
      <p className="text-sm font-black text-[#002868] uppercase tracking-widest animate-pulse">Initializing Portal...</p>
    </div>
  );

  if (error) return (
    <div className="p-12 text-center max-w-xl mx-auto space-y-4">
      <div className="w-16 h-16 bg-rose-50 text-[#C8102E] rounded-full flex items-center justify-center mx-auto border border-rose-100">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-black text-[#002868]">Sync Error</h3>
      <p className="text-gray-400 font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-[#C8102E] text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-[#a00d25] transition-all">Retry Sync</button>
    </div>
  );

  const stats = data?.stats || {};
  const recentJobs = data?.recentJobs || [];
  const notifications = data?.notifications || [];
  const employer = data?.user || {};
  const hospital = data?.companies?.[0] || {}; 

  const statCards = [
    { icon: Briefcase, label: "Total Jobs", value: stats.jobsCount || 0, color: "#002868", bg: "#f0f7ff", url: "/employer/my-jobs" },
    { icon: Users, label: "Job Applications", value: stats.totalApplicationsCount || 0, color: "#C8102E", bg: "#fff5f5", url: "/employer/applicants" },
    { icon: Star, label: "Shortlisted Applicants", value: stats.shortlistedCount || 0, color: "#f59e0b", bg: "#fffbeb", url: "/employer/shortlisted" },
    { icon: MessageSquare, label: "Active Messages", value: stats.unreadMessagesCount || 0, color: "#06b6d4", bg: "#ecfeff", url: "/employer/messages" },
  ];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#002868] mb-1 tracking-tight">
            Welcome back, <span className="text-[#C8102E]">{hospital.name || employer.name || "Hospital Partner"}</span>
          </h1>
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Employer Console</span>
            <span className="text-gray-300">/</span>
            <span className="text-[#002868] font-black">Real-time Overview</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Link href="/employer/post_job" className="bg-[#002868] hover:bg-blue-900 text-white px-6 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95">
              <PlusCircle size={18} /> Post New Job
           </Link>
           <div className="hidden lg:flex bg-white px-5 py-3 rounded-[2rem] shadow-sm border border-gray-100 items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle size={18} />
              </div>
              <div className="pr-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Security</p>
                <p className="text-xs font-black text-[#002868]">Verified Account</p>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Grid - Redesigned to match Nurse Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <Link href={s.url} key={s.label} className="bg-white rounded-[2.5rem] shadow-sm p-8 flex items-center gap-6 border border-transparent hover:border-gray-100 hover:shadow-xl hover:translate-y-[-4px] transition-all group">
            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm" style={{ backgroundColor: s.bg, color: s.color }}>
              <s.icon size={28} />
            </div>
            <div>
              <p className="text-3xl font-black text-[#002868] tabular-nums leading-none mb-1.5">{s.value.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-sm p-10 border border-gray-50 h-full">
            <EngagementOverview analytics={data?.dailyAnalytics} />
          </div>
        </div>

        {/* Notifications Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#002868] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10">
               <h3 className="text-xl font-black mb-2 leading-none">Activity Feed</h3>
               <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Recent recruitment events</p>
             </div>
             {/* Abstract background element */}
             <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          </div>
          
          <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-50 flex flex-col flex-1 max-h-[400px]">
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 scrollbar-hide">
              {notifications.length > 0 ? notifications.map((n: any) => (
                <div key={n.id} className="flex items-start gap-4 p-6 hover:bg-gray-50 transition-all cursor-pointer group border-l-4 border-transparent hover:border-[#C8102E]">
                  <div className={`w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C8102E]/10 group-hover:text-[#C8102E] transition-all`}>
                    <Bell size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 font-bold leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock size={10} />
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                   <Bell size={40} className="text-gray-100 mb-4" />
                   <p className="text-xs font-black text-gray-300 uppercase tracking-widest italic">No events recorded</p>
                </div>
              )}
            </div>
            <Link href="/employer/messages" className="p-6 text-center text-[10px] font-black text-[#002868] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all border-t border-gray-50 flex items-center justify-center gap-2 group">
              Audit Full Activity
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Managed Jobs Section - Enhancing Aesthetic */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-8 px-2">
           <div>
             <h2 className="text-xl font-black text-[#002868] uppercase tracking-tight">Active Clinical Listings</h2>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your posted clinical roles</p>
           </div>
           <Link href="/employer/my-jobs" className="text-[10px] font-black text-[#C8102E] uppercase tracking-widest hover:underline">Manage All Listings →</Link>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {recentJobs.length > 0 ? recentJobs.map((job: any) => (
            <div key={job.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-8 group hover:shadow-2xl hover:border-blue-50 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C8102E]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Logo Box */}
              <div className="w-20 h-20 rounded-[1.5rem] border-2 border-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 p-3 bg-white group-hover:border-[#002868]/10 transition-colors shadow-sm">
                <img 
                  src={job.Company?.logoUrl || "/placeholder-hospital.png"} 
                  alt={job.Company?.name} 
                  className="w-full h-full object-contain" 
                  onError={(e) => { e.currentTarget.src = "https://www.google.com/s2/favicons?domain=annplatform.org&sz=128" }}
                />
              </div>
              
              {/* Job Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] bg-red-50 text-[#C8102E] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{job.specialty || "Nursing"}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xl font-black text-[#002868] truncate group-hover:text-[#C8102E] transition-colors tracking-tight">{job.title}</h4>
                <div className="flex items-center gap-4 mt-2 text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                   <span className="flex items-center gap-1.5"><Building size={14} className="text-[#002868]" /> {job.location || "On-site"}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                   <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-[#002868]" /> {job.jobType}</span>
                </div>
              </div>

              {/* Applicant Counter */}
              <div className="flex flex-col items-center justify-center px-10 py-6 bg-gray-50 rounded-[1.5rem] border border-gray-100 group-hover:bg-[#002868] group-hover:border-[#002868] transition-all">
                <span className="text-2xl font-black text-[#002868] group-hover:text-white transition-colors">{job._count?.Application || 0}</span>
                <span className="text-[9px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-widest">Applicants</span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-3">
                <Link href={`/employer/my-jobs?edit=${job.id}`} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#002868] text-white hover:bg-blue-800 transition-all shadow-lg active:scale-95">
                  <Edit2 size={18} />
                </Link>
                <Link href={`/jobs/${job.slug}`} target="_blank" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-400 hover:text-[#002868] hover:border-[#002868] transition-all shadow-sm">
                  <Eye size={18} />
                </Link>
              </div>
            </div>
          )) : (
            <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-gray-100 text-center space-y-6">
               <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 shadow-inner">
                  <PlusCircle size={40} />
               </div>
               <div>
                  <h4 className="text-2xl font-black text-[#002868]">Recruitment Pipeline Empty</h4>
                  <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto mt-2 italic">You haven't posted any clinical opportunities yet. Click below to start sourcing nurses.</p>
               </div>
               <Link href="/employer/post_job" className="inline-flex items-center gap-3 bg-[#C8102E] text-white px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-red-200">
                  <Briefcase size={20} /> Create Your First Job Listing
               </Link>
            </div>
          )}
        </div>
      </div>

      <div className="pt-12 text-center">
         <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
            Elite Healthcare Recruitment Dashboard Alpha v2.5
         </p>
      </div>
    </div>
  );
}