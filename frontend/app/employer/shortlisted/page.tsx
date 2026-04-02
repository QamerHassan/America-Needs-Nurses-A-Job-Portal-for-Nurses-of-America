"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Eye, Mail, Trash2, MapPin, 
  ChevronDown, Award, Briefcase, Plus,
  MoreHorizontal, Loader2, User, CheckCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

export default function ShortlistedPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchShortlisted = async () => {
      if (!auth?.token || !auth?.userId) { setLoading(false); return; }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/applications/employer`, {
          headers: {
            "Authorization": `Bearer ${auth.token}`,
            "x-user-id": auth.userId
          }
        });
        if (!res.ok) throw new Error("Failed to load shortlist.");
        const data = await res.json();
        setCandidates(data.filter((app: any) => app.status === 'SHORTLISTED'));
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlisted();
  }, [auth]);

  const handleRemoveFromShortlist = async (id: string) => {
    if (!auth?.token || !auth?.userId) return;
    setIsRemoving(true);
    setUpdatingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/applications/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`,
          "x-user-id": auth.userId
        },
        body: JSON.stringify({ status: 'PENDING' })
      });
      if (!res.ok) throw new Error("Failed to remove from shortlist.");
      setCandidates(prev => prev.filter(app => app.id !== id));
      setRemoveId(null);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setUpdatingId(null);
      setIsRemoving(false);
    }
  };

  const filteredCandidates = candidates.filter(can => {
    const name = can.User?.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-[#002868]/10 border-t-[#C8102E] rounded-full animate-spin" />
      <p className="text-sm font-black text-[#002868] uppercase tracking-widest">Accessing Talent Vault...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#002868] mb-1 leading-tight">Elite Candidate Shortlist</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <Link href="/employer/dashboard" className="hover:text-[#002868]">Employer</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#C8102E] font-bold">Shortlisted Talent</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#002868] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by candidate name or expertise..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#002868]/10 focus:ring-4 focus:ring-[#002868]/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all outline-none"
            />
          </div>
          
          <button className="bg-[#C8102E] text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-[#a00d25] transition-all shadow-xl shadow-red-700/10 whitespace-nowrap">
            Filter Results
          </button>
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-4">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((app) => (
            <div key={app.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 group hover:shadow-2xl hover:border-blue-50 transition-all relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-[32px] border-4 border-white shadow-xl overflow-hidden bg-gray-50 flex items-center justify-center group-hover:rotate-3 transition-transform">
                    {app.User?.profileImage || app.User?.image ? (
                       <img src={app.User?.profileImage || app.User?.image} alt={app.User?.name} className="w-full h-full object-cover" />
                    ) : (
                       <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                    <CheckCircle size={14} className="text-white fill-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center lg:text-left min-w-0">
                  <h3 className="text-xl font-black text-[#002868] group-hover:text-[#C8102E] transition-colors leading-tight mb-2">{app.User?.name}</h3>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1.5 text-gray-500 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                      {app.Job?.specialty || "Nursing Professional"}
                    </span>
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#C8102E]" /> {app.User?.location || "United States"}</span>
                  </div>
                  {/* Skills/Tags Simulation */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    {["ICU Certified", "ACLS", "Bilingual"].map(tag => (
                      <span key={tag} className="text-[9px] bg-blue-50 text-[#002868] px-3 py-1.5 rounded-full font-black uppercase tracking-tighter border border-blue-100/50">
                          {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="flex items-center gap-3 bg-gray-50 text-[#002868] px-6 py-3 rounded-2xl border border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-[#002868] flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <Briefcase size={14} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Experience</p>
                    <p className="text-xs font-black">5+ Years Exp</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 min-w-[160px] justify-center lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-50">
                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl.startsWith('http') ? app.resumeUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${app.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Resume"
                      className="p-4 rounded-2xl bg-gray-50 text-gray-500 hover:bg-[#002868] hover:text-white transition-all shadow-sm"
                    >
                      <Eye size={20} />
                    </a>
                  ) : (
                    <button 
                      disabled
                      title="No Resume Uploaded" 
                      className="p-4 rounded-2xl bg-gray-50 text-gray-300 cursor-not-allowed shadow-none"
                    >
                      <Eye size={20} />
                    </button>
                  )}
                  <Link 
                    href={`/employer/messages?user=${app.User?.id}`}
                    title="Contact Candidate" 
                    className="p-4 rounded-2xl bg-[#C8102E]/5 text-[#C8102E] hover:bg-[#C8102E] hover:text-white transition-all shadow-sm"
                  >
                    <Mail size={20} />
                  </Link>
                  <button 
                    onClick={() => setRemoveId(app.id)}
                    disabled={updatingId === app.id}
                    title="Remove from Shortlist" 
                    className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    {updatingId === app.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-24 rounded-[40px] border-2 border-dashed border-gray-100 text-center space-y-6">
            <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                <Award size={48} />
            </div>
            <div>
                <h4 className="text-2xl font-black text-[#002868]">No shortlisted talent yet</h4>
                <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Shortlist top-tier nursing candidates from your applicant pool to see them here.
                </p>
            </div>
            <Link href="/employer/applicants" className="inline-flex items-center gap-2 bg-[#002868] text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-blue-900/10 uppercase tracking-widest">
                Browse All Applicants
            </Link>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] font-black text-gray-400 pt-8 border-t border-gray-100">
        © 2026 America Needs Nurses - Talent Acquisition Suite.
      </p>

      <ConfirmDeleteModal
        isOpen={!!removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={() => removeId && handleRemoveFromShortlist(removeId)}
        title="Remove from Shortlist?"
        message="This candidate will be moved back to pending status. You can re-shortlist them from the applicants page."
        isLoading={isRemoving}
      />
    </div>
  );
}

function CheckCircleIcon({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
