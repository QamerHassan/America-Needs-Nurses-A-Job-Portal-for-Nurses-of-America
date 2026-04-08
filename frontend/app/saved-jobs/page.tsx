"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getSavedJobs, getMyApplications } from "../utils/api";
import { Bookmark, Building, MapPin, ExternalLink, MoreVertical, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState<"saved" | "applied" | "interviews" | "archived">("saved");
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  useEffect(() => {
    if (auth?.userId) {
      fetchData();
    }
  }, [auth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [saved, applied] = await Promise.all([
        getSavedJobs(auth!.userId),
        getMyApplications(auth!.userId)
      ]);
      setSavedJobs(saved || []);
      setAppliedJobs(applied || []);
    } catch (err) {
      console.error("Failed to fetch my jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "saved", label: "Saved", count: savedJobs.length },
    { id: "applied", label: "Applied", count: appliedJobs.length },
    { id: "interviews", label: "Interviews", count: 0 },
    { id: "archived", label: "Archived", count: 0 },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <main className="container mx-auto px-6 py-12 max-w-5xl flex-grow">
        <h1 className="text-3xl font-black text-[#1B3A6B] mb-8">My jobs</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-10 overflow-x-auto scroller-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-6 text-sm font-bold transition-all relative min-w-max ${
                activeTab === tab.id 
                  ? "text-[#1B3A6B]" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-widest mb-1">{tab.count}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#CC2229] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-6">
          {loading ? (
             <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B3A6B]" />
             </div>
          ) : (
            <>
              {activeTab === "saved" && (
                savedJobs.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200">
                    <Bookmark size={40} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">You haven't saved any jobs yet.</p>
                    <Link href="/jobs" className="text-[#CC2229] font-black hover:underline mt-2 inline-block">Browse Jobs</Link>
                  </div>
                ) : (
                  savedJobs.map((item) => (
                    <JobRow key={item.id} job={item.Job} savedDate={item.createdAt} />
                  ))
                )
              )}

              {activeTab === "applied" && (
                appliedJobs.length === 0 ? (
                   <div className="bg-gray-50 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200">
                      <ExternalLink size={40} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-bold">No applications yet.</p>
                      <Link href="/jobs" className="text-[#CC2229] font-black hover:underline mt-2 inline-block">Find a Job</Link>
                   </div>
                ) : (
                  appliedJobs.map((app) => (
                    <JobRow key={app.id} job={app.Job} status={app.status} appliedDate={app.createdAt} />
                  ))
                )
              )}

              {(activeTab === "interviews" || activeTab === "archived") && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                   <p className="text-gray-400 font-bold">Nothing here yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function JobRow({ job, status, savedDate, appliedDate }: any) {
  return (
    <div className="group flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-gray-100 hover:border-blue-100 bg-white hover:bg-blue-50/20 transition-all duration-300 relative">
      {/* Icon/Logo */}
      <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0 group-hover:shadow-sm transition-all">
        {job?.Company?.logo ? (
          <img src={job.Company.logo} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <div className="w-full h-full bg-[#1B3A6B] flex items-center justify-center text-white font-black text-xl">
            {job?.Company?.name?.charAt(0).toUpperCase() || "H"}
          </div>
        )}
      </div>

      <div className="flex-grow min-w-0">
        {status && (
          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider mb-2">
            Application {status.toLowerCase()}
          </span>
        )}
        <Link href={`/jobs/${job?.slug}`} className="block text-xl font-black text-[#1B3A6B] hover:text-[#CC2229] transition-all truncate leading-tight">
          {job?.title}
        </Link>
        <p className="text-sm font-semibold text-gray-500 mt-1">{job?.Company?.name || "Healthcare Facility"}</p>
        <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-400 text-xs font-bold uppercase tracking-wide">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#CC2229]" /> {job?.location}</span>
          <span className="text-gray-300">Saved on {new Date(savedDate || appliedDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
        <Link href={`/jobs/${job?.slug}`} className="bg-[#CC2229] whitespace-nowrap text-white px-6 py-3 rounded-xl font-black tracking-wide text-sm hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2">
          {status ? "View Application" : "Continue application"} <ChevronRight size={16} />
        </Link>
        <div className="flex items-center">
            <button className="p-2.5 text-gray-400 hover:text-[#1B3A6B] transition-colors"><Bookmark size={20} /></button>
            <button className="p-2.5 text-gray-400 hover:text-[#1B3A6B] transition-colors"><MoreVertical size={20} /></button>
        </div>
      </div>
    </div>
  );
}
