"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, Filter, Briefcase, MapPin, Clock, Calendar,
  MoreVertical, Edit2, Trash2, ChevronLeft, ChevronRight, PlusSquare, AlertCircle, Users
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { auth } = useAuth();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const formatUrl = (path: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {
    const fetchJobs = async () => {
      if (!auth?.userId) { setLoading(false); return; }
      try {
        const res = await fetch(`${API_URL}/jobs/employer`, {
          headers: {
            ...(auth.token && { "Authorization": `Bearer ${auth.token}` }),
            "x-user-id": auth.userId
          }
        });
        if (!res.ok) throw new Error("Failed to load your listings.");
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [auth]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "active") return matchesSearch && job.status === "APPROVED";
    if (filter === "expired") return matchesSearch && job.status === "EXPIRED";
    return matchesSearch;
  });

  const handleDelete = (jobId: string) => {
    setDeleteJobId(jobId);
  };

  const confirmDeleteJob = async (jobId: string) => {
    if (!auth?.userId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          ...(auth.token && { "Authorization": `Bearer ${auth.token}` }),
          "x-user-id": auth.userId
        }
      });
      if (!res.ok) throw new Error("Failed to delete the job.");
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setDeleteJobId(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-[#002868]/10 border-t-[#C8102E] rounded-full animate-spin" />
      <p className="text-sm font-black text-[#002868] uppercase tracking-widest">Loading Listings...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#002868] mb-1">Manage Jobs</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <Link href="/employer/dashboard" className="hover:text-[#002868]">Employer</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#C8102E] font-bold">My Jobs</span>
          </div>
        </div>
        <Link href="/employer/post_job"
          className="bg-[#C8102E] text-white text-sm font-black px-6 py-3.5 rounded-xl hover:bg-[#a00d25] transition-all flex items-center gap-2 shadow-lg shadow-red-700/10">
          <PlusSquare size={18} />
          Post New Job
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl w-full lg:w-auto overflow-x-auto scrollbar-hide">
          {["all", "active", "expired"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f 
                  ? "bg-[#002868] text-white shadow-md shadow-blue-900/10" 
                  : "text-gray-400 hover:text-[#002868]"
              }`}
            >
              {f} Jobs
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-transparent rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:bg-white focus:border-[#002868]/20 focus:ring-4 focus:ring-[#002868]/5 transition-all outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-[#002868]/20 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#002868] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl border-2 border-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 p-2 bg-white shadow-sm group-hover:border-[#002868]/10 transition-colors">
                <img 
                  src={formatUrl(job.imageUrl || job.Company?.logoUrl) || "https://www.google.com/s2/favicons?domain=annplatform.org&sz=128"} 
                  alt={job.Company?.name} 
                  className="w-full h-full object-contain" 
                />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-[#C8102E] font-black uppercase tracking-widest">{job.specialty || "General Nursing"}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={10} /> {job.location}
                    </span>
                </div>
                <h4 className="text-lg font-black text-[#002868] truncate mb-2 group-hover:text-[#C8102E] transition-colors">{job.title}</h4>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                      <Clock size={12} className="text-[#002868]" />
                      {job.jobType}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                      <Calendar size={12} className="text-[#002868]" />
                      Posted: {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                      <Users size={12} className="text-[#002868]" />
                      {job._count?.Application || 0} Applicants
                    </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-0">
                {job.status !== "APPROVED" && (
                  <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    job.status === "APPROVED" 
                      ? "bg-blue-50 text-[#002868] border border-blue-100" 
                      : "bg-rose-50 text-[#C8102E] border border-rose-100"
                  }`}>
                    {job.status}
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto md:ml-0">
                  <Link href={`/employer/post_job?edit=${job.id}`} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-[#002868] hover:text-white transition-all shadow-sm">
                    <Edit2 size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(job.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-[#C8102E] hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-gray-100 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
              <Briefcase size={32} />
            </div>
            <div>
              <h4 className="text-lg font-black text-[#002868]">No listings found</h4>
              <p className="text-sm font-medium text-gray-400">Try adjusting your search or filters.</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] font-black text-gray-400 pt-8 border-t border-gray-100 uppercase tracking-widest">
        © 2026 America Needs Nurses · Designed for Healthcare Excellence
      </p>

      <ConfirmDeleteModal
        isOpen={!!deleteJobId}
        onClose={() => setDeleteJobId(null)}
        onConfirm={() => deleteJobId && confirmDeleteJob(deleteJobId)}
        title="Delete Job Listing?"
        message="This will completely remove the job listing and all its applications. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
