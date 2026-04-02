"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Check, MessageSquare, Download, Trash2, 
  MapPin, Calendar, ChevronDown, User, Filter, MoreHorizontal, Loader2, AlertCircle, X, Briefcase, Star, Eye
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const formatUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function ApplicantsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { auth } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    if (!auth?.token || !auth?.userId) { setLoading(false); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/applications/employer`, {
        headers: {
          "Authorization": `Bearer ${auth.token}`,
          "x-user-id": auth.userId
        }
      });
      if (!res.ok) throw new Error("Could not load candidate pool.");
      const data = await res.json();
      setApplications(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    if (!auth?.token || !auth?.userId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/applications/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`,
          "x-user-id": auth.userId
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Status sync failed.");
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplicants = applications.filter(app => {
    const name = app.User?.name || "";
    const title = app.Job?.title || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                          title.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "SHORTLISTED") return matchesSearch && app.status === "SHORTLISTED";
    if (filter === "REJECTED") return matchesSearch && app.status === "REJECTED";
    if (filter === "PENDING") return matchesSearch && app.status === "PENDING";
    return matchesSearch;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-[#002868]/10 border-t-[#C8102E] rounded-full animate-spin" />
      <p className="text-sm font-black text-[#002868] uppercase tracking-widest">Scanning Candidate Pool...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#002868] mb-1 leading-tight">Screening Console</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <Link href="/employer/dashboard" className="hover:text-[#002868]">Employer</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#C8102E] font-bold">Applications Hub</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col lg:flex-row gap-6 items-center">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#002868] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name, job title, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#002868]/10 focus:ring-4 focus:ring-[#002868]/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
          {[
            { id: "all", label: "All" },
            { id: "PENDING", label: "Pending" },
            { id: "SHORTLISTED", label: "Shortlisted" },
            { id: "REJECTED", label: "Rejected" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === tab.id
                  ? "bg-[#002868] text-white shadow-xl shadow-blue-900/10 scale-105"
                  : "text-gray-400 hover:text-[#002868]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applicant List */}
      <div className="space-y-4">
        {filteredApplicants.length > 0 ? (
          filteredApplicants.map((app) => (
            <div key={app.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 group hover:shadow-xl hover:border-blue-50 transition-all relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-gray-50 group-hover:scale-105 transition-transform flex items-center justify-center">
                    {app.User?.image || app.User?.profileImage ? (
                      <img 
                        src={formatUrl(app.User?.image || app.User?.profileImage)} 
                        alt={app.User?.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#f1f5f9] flex items-center justify-center text-[#002868] font-black text-2xl uppercase">
                        {(app.User?.name || "N").charAt(0)}
                      </div>
                    )}
                  </div>
                  {app.status === 'SHORTLISTED' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                      <Star size={12} className="text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center lg:text-left min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1.5">
                    <h3 className="text-lg font-black text-[#002868] leading-tight group-hover:text-[#C8102E] transition-colors truncate">{app.User?.name}</h3>
                    <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      app.status === 'SHORTLISTED' ? 'bg-amber-100 text-amber-600' :
                      app.status === 'REJECTED' ? 'bg-rose-100 text-[#C8102E]' :
                      'bg-blue-100 text-[#002868]'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs font-black text-[#002868]/60 uppercase tracking-widest mb-3 flex items-center justify-center lg:justify-start gap-1.5">
                    <Briefcase size={12} className="text-[#C8102E]" />
                    Apply for: <span className="text-[#002868]">{app.Job?.title}</span>
                  </p>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[11px] font-bold text-gray-400">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#C8102E]" /> {app.Job?.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#002868]" /> Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 min-w-[220px] justify-center lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-50">
                  {updatingId === app.id ? (
                    <div className="p-3 text-[#002868] animate-spin"><Loader2 size={18} /></div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                        disabled={app.status === 'SHORTLISTED'}
                        title={app.status === 'SHORTLISTED' ? "Candidate Shortlisted" : "Shortlist Candidate"}
                        className={`p-3.5 rounded-2xl transition-all shadow-sm ${
                          app.status === 'SHORTLISTED'
                          ? 'bg-amber-50 text-amber-500 shadow-amber-200/20 active:scale-95'
                          : 'bg-blue-50 text-[#002868] hover:bg-[#002868] hover:text-white'
                        }`}
                      >
                        <Star size={18} fill={app.status === 'SHORTLISTED' ? "currentColor" : "none"} strokeWidth={3} />
                      </button>
                      <Link
                        href={`/employer/messages?user=${app.User?.id}`}
                        title="Send Message"
                        className="p-3.5 rounded-2xl bg-blue-50 text-[#002868] hover:bg-[#002868] hover:text-white transition-all shadow-sm"
                      >
                        <MessageSquare size={18} />
                      </Link>
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl.startsWith('http') ? app.resumeUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${app.resumeUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View Resume"
                          className="p-3.5 rounded-2xl bg-blue-50 text-[#002868] hover:bg-[#002868] hover:text-white transition-all shadow-sm"
                        >
                          <Eye size={18} />
                        </a>
                      ) : (
                        <button
                          disabled
                          title="No Resume Uploaded"
                          className="p-3.5 rounded-2xl bg-gray-50 text-gray-300 cursor-not-allowed shadow-none"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                        disabled={app.status === 'REJECTED'}
                        title="Reject Application"
                        className={`p-3.5 rounded-2xl transition-all shadow-sm ${
                          app.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-500 opacity-50 cursor-not-allowed'
                          : 'bg-rose-50 text-[#C8102E] hover:bg-[#C8102E] hover:text-white'
                        }`}
                      >
                        <X size={18} strokeWidth={3} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[40px] border-2 border-dashed border-gray-100 text-center space-y-4">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
              <User size={40} />
            </div>
            <div>
              <h4 className="text-xl font-black text-[#002868]">Queue is empty</h4>
              <p className="text-sm font-medium text-gray-400">No applicants matching your current filters.</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] font-black text-gray-400 pt-8 border-t border-gray-100">
        © 2026 America Needs Nurses - Candidate Screening Division.
      </p>
    </div>
  );
}
