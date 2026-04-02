"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminJobs, updateJobStatus } from "../../../utils/api";
import AdminReviewModal from "../components/AdminReviewModal";
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Search,
  Building,
  Clock,
  Eye
} from "lucide-react";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  
  // Modal State
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getAdminJobs();
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch admin jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateJobStatus(id, newStatus);
      setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredJobs = jobs.filter(j => {
    const title = j.title || "";
    const company = j.Company?.name || "";
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                          company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || j.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "EXPIRED": return "bg-gray-100 text-gray-500 border-gray-200";
      case "CLOSED": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="admin-jobs p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002868]">Manage Job Listings</h1>
          <p className="text-gray-500 mt-1 font-medium italic opacity-70">Moderate and approve clinical opportunities across the platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Search and Filters */}
        <div className="p-8 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by job title or company..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#002868] outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {["ALL", "PENDING", "APPROVED", "CLOSED", "EXPIRED"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f ? "bg-[#002868] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-8 py-5 text-left text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Opportunity</th>
                <th className="px-8 py-4 text-center text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Apps</th>
                <th className="px-8 py-5 text-left text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Posted On</th>
                <th className="px-8 py-5 text-left text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center font-bold text-gray-400 uppercase tracking-widest">Syncing clinical postings...</td></tr>
              ) : filteredJobs.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center font-bold text-gray-400 uppercase tracking-widest">No listings found matching criteria</td></tr>
              ) : filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 text-[#002868]">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{job.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-tighter">
                          <Building size={12} /> {job.Company?.name || "Independent Poster"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-black">
                      {job._count?.Application || 0}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="text-[10px] font-bold text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                      <Clock size={12} className="opacity-40" /> {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {/* DETAIL BUTTON */}
                      <button 
                        onClick={() => { setSelectedJob(job); setIsModalOpen(true); }}
                        className="p-2 rounded-lg bg-[#002868] text-white hover:bg-blue-900 transition-all border border-[#002868] flex items-center gap-2 px-3 h-[38px] group"
                      >
                        <Eye size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Detail</span>
                      </button>

                      <div className="w-[1px] h-6 bg-gray-100 mx-1" />

                      <button 
                        disabled={job.status === "APPROVED"}
                        onClick={() => handleStatusUpdate(job.id, "APPROVED")}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all shadow-sm ${
                          job.status === "APPROVED" ? "bg-gray-300 cursor-not-allowed opacity-50" : "bg-green-600 hover:bg-green-700 border-green-600"
                        }`}
                      >
                        <CheckCircle size={14} /> Approve
                      </button>

                      <button 
                        disabled={job.status === "CLOSED"}
                        onClick={() => handleStatusUpdate(job.id, "CLOSED")}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          job.status === "CLOSED" 
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                            : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                        }`}
                      >
                        <XCircle size={14} /> Close
                      </button>

                      <Link href={`/jobs/${job.slug}`} target="_blank" className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-[#002868] border border-gray-100">
                        <ExternalLink size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminReviewModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedJob(null); }}
        type="JOB"
        data={selectedJob}
        onApprove={(id) => {
          handleStatusUpdate(id, "APPROVED");
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
        onReject={(id) => {
          handleStatusUpdate(id, "CLOSED");
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
}
