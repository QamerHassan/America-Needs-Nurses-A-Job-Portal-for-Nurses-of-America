"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronDown, CheckCircle, AlertCircle, Loader2, Bold, Italic, 
  Underline, Link as LinkIcon, List, Image as ImageIcon, Building, Briefcase
} from "lucide-react";
import dynamic from 'next/dynamic';
import { useDashboard } from "../layout";
import { useAuth } from "../../context/AuthContext";

const LeafletMap = dynamic(() => import('../../components/LeafletMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
    <Loader2 size={24} className="animate-spin mr-2" />
    Loading Map...
  </div>
});

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", 
  "West Virginia", "Wisconsin", "Wyoming"
];

const SimpleRichTextEditor = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML && !editorRef.current.contains(document.activeElement)) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden focus-within:border-[#002868] focus-within:ring-1 focus-within:ring-[#002868] transition-all bg-white flex flex-col">
      <div className="flex items-center gap-1 border-b border-gray-200 px-3 py-2 bg-gray-50/50 flex-wrap">
        <button type="button" onClick={() => executeCommand('bold')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700 font-bold" title="Bold"><Bold size={14} /></button>
        <button type="button" onClick={() => executeCommand('italic')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700 italic" title="Italic"><Italic size={14} /></button>
        <button type="button" onClick={() => executeCommand('underline')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700 underline" title="Underline"><Underline size={14} /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => executeCommand('insertUnorderedList')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Bullet List"><List size={14} /></button>
        <button type="button" onClick={() => executeCommand('insertOrderedList')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700 font-serif font-bold text-xs px-2" title="Numbered List">1.</button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => { const url = prompt("Enter URL:", "https://"); if (url) executeCommand('createLink', url); }} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Insert Link"><LinkIcon size={14} /></button>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="w-full h-32 px-4 py-3 text-[14px] text-gray-700 outline-none overflow-y-auto wysiwyg-content"
        data-placeholder={placeholder}
        style={{ minHeight: "120px" }}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .wysiwyg-content[contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        .wysiwyg-content p { margin-bottom: 0.5rem; }
        .wysiwyg-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 0.5rem; }
        .wysiwyg-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 0.5rem; }
        .wysiwyg-content a { color: #002868; text-decoration: underline; }
        
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
          max-width: none;
        }
      ` }} />
    </div>
  );
};

export default function PostJobPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editJobId = searchParams.get("edit");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [jobCount, setJobCount] = useState<number>(0);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadedBanner, setUploadedBanner] = useState<string | null>(null);

  const { data: dashboardData, employer: dashboardUser, loading: dashboardLoading, refresh: refreshDashboard } = useDashboard();
  const { auth } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const formatUrl = (path: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "", // Maps to Job Summary
    responsibilities: "",
    requirements: "", // Maps to Qualifications
    specialty: "Registered Nurse (RN)",
    jobType: "Full Time",
    jobLevel: "Entry Level",
    experience: "1-2 Years",
    qualificationLevel: "BSN",
    gender: "Any",
    salaryMin: "",
    salaryMax: "",
    startDate: "",
    deadline: "",
    totalOpenings: "01",
    jobFeeType: "Free",
    skills: "",
    permanentAddress: "",
    temporaryAddress: "",
    country: "United States",
    location: "", 
    zipCode: "",
    videoUrl: "",
    latitude: "",
    longitude: "",
    companyId: "",
    imageUrl: "",
    bannerUrl: ""
  });

  // Reset error state on mount
  useEffect(() => {
    setError("");
  }, []);

  useEffect(() => {
    if (dashboardLoading) return;
    
    const syncData = async () => {
      setError(""); 
      
      if (!dashboardUser) {
        setFetchingData(false);
        return;
      }
      
      setUser(dashboardUser);
      setCompanies(dashboardData?.companies || []);
      setJobCount(dashboardData?.stats?.jobsCount || 0);

      const subs = dashboardUser?.Subscription || [];
      const active = subs.some((s: any) => s.status === 'ACTIVE' || s.status === 'PENDING_VERIFICATION');
      setHasActiveSub(!!active);

      try {
        if (editJobId) {
          const jobRes = await fetch(`${API_URL}/jobs/${editJobId}`);
          if (jobRes.ok) {
            const jobData = await jobRes.json();
            setFormData({
              title: jobData.title || "",
              description: jobData.description || "",
              responsibilities: jobData.responsibilities || "",
              requirements: jobData.requirements || "",
              specialty: jobData.specialty || "Registered Nurse (RN)",
              jobType: jobData.jobType || "Full Time",
              jobLevel: jobData.jobLevel || "Entry Level",
              experience: jobData.experience || "1-2 Years",
              qualificationLevel: jobData.qualificationLevel || "BSN",
              gender: jobData.gender || "Any",
              salaryMin: jobData.salaryMin?.toString() || "",
              salaryMax: jobData.salaryMax?.toString() || "",
              startDate: jobData.startDate ? new Date(jobData.startDate).toISOString().split('T')[0] : "",
              deadline: jobData.deadline ? new Date(jobData.deadline).toISOString().split('T')[0] : "",
              totalOpenings: jobData.totalOpenings || "01",
              jobFeeType: jobData.jobFeeType || "Free",
              skills: jobData.skills || "",
              permanentAddress: jobData.permanentAddress || "",
              temporaryAddress: jobData.temporaryAddress || "",
              country: jobData.country || "United States",
              location: jobData.location || "",
              zipCode: jobData.zipCode || "",
              videoUrl: jobData.videoUrl || "",
              latitude: jobData.latitude?.toString() || "",
              longitude: jobData.longitude?.toString() || "",
              companyId: jobData.companyId || "",
              imageUrl: jobData.imageUrl || "",
              bannerUrl: jobData.bannerUrl || ""
            });
            if (jobData.imageUrl) setUploadedLogo(jobData.imageUrl);
            if (jobData.bannerUrl) setUploadedBanner(jobData.bannerUrl);
          }
        } else if (dashboardData?.companies?.length > 0) {
          setFormData(prev => ({ ...prev, companyId: dashboardData.companies[0].id }));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetchingData(false);
      }
    };
    
    syncData();
  }, [dashboardLoading, dashboardUser, dashboardData, editJobId]);

  // Background refresh if potentially blocked (Auto-heal stale sessions)
  useEffect(() => {
    if (!fetchingData && jobCount >= 1 && !hasActiveSub) {
      const timer = setTimeout(() => refreshDashboard(), 2000);
      return () => clearTimeout(timer);
    }
  }, [fetchingData, jobCount, hasActiveSub, refreshDashboard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingLogo(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      try {
        const res = await fetch(`${API_URL}/uploads`, {
          method: 'POST',
          body: formDataUpload,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        setUploadedLogo(data.url);
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        if (formData.companyId) {
          await fetch(`${API_URL}/companies/admin/${formData.companyId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logoUrl: data.url })
          });
        }
      } catch (err) {
        alert("Failed to upload logo.");
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingBanner(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      try {
        const res = await fetch(`${API_URL}/uploads`, {
          method: 'POST',
          body: formDataUpload,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        setUploadedBanner(data.url);
        setFormData(prev => ({ ...prev, bannerUrl: data.url }));
      } catch (err) {
        alert("Failed to upload banner.");
      } finally {
        setIsUploadingBanner(false);
      }
    }
  };

  const handleRepairSession = () => {
    router.push("/employer/login");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!auth?.token) throw new Error("Session token missing. Please log in again.");
      if (!auth?.userId) throw new Error("User ID missing. Please log in again.");
      if (!formData.title.trim()) throw new Error("Job title is required.");

      const effectiveCompanyId = formData.companyId || (companies.length > 0 ? companies[0].id : "");
      if (!effectiveCompanyId) throw new Error("Facility profile required.");

      const payload = {
        ...formData,
        salaryMin: parseInt(formData.salaryMin) || 0,
        salaryMax: parseInt(formData.salaryMax) || 0,
        postedById: auth.userId,
        companyId: effectiveCompanyId,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
      };

      const res = await fetch(editJobId ? `${API_URL}/jobs/${editJobId}` : `${API_URL}/jobs`, {
        method: editJobId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`,
          "x-user-id": auth.userId
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to post job.");
      }

      setSuccess(true);
      setTimeout(() => router.push("/employer/my-jobs"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-10 h-10 border-4 border-[#002868]/10 border-t-[#C8102E] rounded-full animate-spin" />
      <p className="text-xs font-black text-[#002868] uppercase tracking-widest">Loading specialized form...</p>
    </div>
  );

  if (companies.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-100 text-center space-y-6 max-w-2xl mx-auto my-12">
        <div className="w-20 h-20 bg-rose-50 text-[#C8102E] rounded-full flex items-center justify-center mx-auto">
          <Building size={32} />
        </div>
        <div>
          <h4 className="text-xl font-black text-[#002868] mb-2 uppercase">Facility Profile Required</h4>
          <p className="text-sm font-medium text-gray-500 leading-relaxed">Please create a hospital profile first.</p>
        </div>
        <Link href="/employer/profile" className="inline-flex items-center gap-2 bg-[#C8102E] text-white px-10 py-4 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-red-100 uppercase tracking-widest">
           Create Hospital Profile
        </Link>
      </div>
    );
  }

  const SubscriptionWall = () => (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#001f5b]/20 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white/90 border border-white/20 shadow-2xl rounded-[32px] p-10 max-w-lg w-full text-center space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#C8102E] to-[#002868]" />
        <div className="w-20 h-20 bg-[#C8102E]/10 text-[#C8102E] rounded-2xl flex items-center justify-center mx-auto transition-transform duration-500 group-hover:rotate-6">
          <Briefcase size={36} />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-[#001f5b] tracking-tight">Limit Reached!</h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            You've successfully posted your <span className="text-[#C8102E] font-bold">first job for free!</span> To post more jobs, please choose a plan.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 pt-4">
          <button 
            type="button"
            onClick={() => refreshDashboard()}
            className="flex items-center justify-center gap-2 bg-[#001f5b] text-white py-4 px-8 rounded-2xl font-black text-sm hover:translate-y-[-2px] hover:shadow-xl transition-all uppercase tracking-widest border-2 border-transparent"
          >
            Refresh Status
          </button>
          <Link href="/pricing" className="bg-[#C8102E] text-white py-4 px-8 rounded-2xl font-black text-sm hover:translate-y-[-2px] hover:shadow-xl transition-all uppercase tracking-widest text-center">
            View Pricing Plans
          </Link>
          <Link href="/employer/my-jobs" className="bg-white text-[#001f5b] border-2 border-[#001f5b]/10 py-3 px-8 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all uppercase tracking-widest text-center">
            Manage Existing Jobs
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {(jobCount >= 1 && !hasActiveSub) && <SubscriptionWall />}
      
      <div className={`bg-white min-h-[calc(100vh-80px)] p-6 md:p-8 rounded-md font-sans transition-all duration-700 ${(jobCount >= 1 && !hasActiveSub) ? "opacity-40 blur-md pointer-events-none scale-95" : ""}`}>
        <div className="mb-8 font-['DM_Sans',sans-serif]">
          <h1 className="text-[28px] font-black text-[#002868] mb-1">{editJobId ? "Update Nursing Job" : "Post Nursing Job"}</h1>
          <div className="flex items-center text-[13px] text-gray-400 font-bold uppercase tracking-wider">
            <Link href="/employer/dashboard" className="hover:text-[#C8102E] transition-colors">Employer</Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-[#C8102E] italic">{editJobId ? "Update Listing" : "Create New Listing"}</span>
          </div>
        </div>

        {success && <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-bold animate-in zoom-in duration-300"><CheckCircle size={18} /> Job {editJobId ? "updated" : "posted"}! Redirecting...</div>}
        {error && (
          <div className="bg-rose-50 text-rose-600 border border-rose-100 p-4 rounded-xl mb-6 flex items-center justify-between gap-3 text-sm font-bold animate-in shake duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} /> 
              <span>{error}</span>
            </div>
            <button 
              type="button"
              onClick={handleRepairSession}
              className="px-4 py-1.5 bg-[#002868] text-white rounded-lg text-xs hover:bg-[#001d4a] transition-all shadow-md font-black uppercase tracking-widest flex items-center gap-2"
            >
              Re-Login
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10 max-w-[1000px]">
          <div>
            <h2 className="text-[12px] font-black text-[#002868] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#002868] text-white flex items-center justify-center text-[10px]">1</span>
              Basic Recruitment Details
            </h2>
            <div className="h-0.5 bg-gray-50 mb-8" />
            
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#C8102E] transition-all group" onClick={() => document.getElementById('logoUpload')?.click()}>
                  {uploadedLogo ? (
                    <img src={formatUrl(uploadedLogo)} className="w-full h-full object-contain p-2" />
                  ) : (
                    companies[0]?.logoUrl ? (
                      <img src={formatUrl(companies[0].logoUrl)} className="w-full h-full object-contain p-2" />
                    ) : <ImageIcon size={24} className="text-gray-300 group-hover:scale-110 transition-transform" />
                  )}
                  <input type="file" id="logoUpload" accept="image/*" className="hidden" onChange={handleLogoSelect} />
                </div>
                <div>
                  <span className="text-[14px] font-black text-[#002868] block mb-1">Clinic Logo</span>
                  <button type="button" onClick={() => document.getElementById('logoUpload')?.click()} className="text-[10px] font-black text-[#C8102E] uppercase tracking-widest border-b-2 border-transparent hover:border-[#C8102E] transition-all pb-0.5">{isUploadingLogo ? "Uploading..." : "Replace Logo"}</button>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-40 h-24 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#C8102E] group" onClick={() => document.getElementById('bannerUpload')?.click()}>
                  {uploadedBanner ? <img src={formatUrl(uploadedBanner)} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-300 group-hover:scale-110 transition-transform" />}
                  <input type="file" id="bannerUpload" accept="image/*" className="hidden" onChange={handleBannerSelect} />
                </div>
                <div>
                  <span className="text-[14px] font-black text-[#002868] block mb-1">Facility Photo</span>
                  <button type="button" onClick={() => document.getElementById('bannerUpload')?.click()} className="text-[10px] font-black text-[#C8102E] uppercase tracking-widest border-b-2 border-transparent hover:border-[#C8102E] transition-all pb-0.5">{isUploadingBanner ? "Uploading..." : "Replace Banner"}</button>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="group">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-[#002868] transition-colors">Target Position Title</label>
                <input name="title" value={formData.title} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-5 py-4 text-[15px] font-bold text-[#002868] focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/5 outline-none transition-all" placeholder="ex. Senior Registered Nurse (ICU)" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Clinical Specialty</label>
                  <div className="relative">
                    <select name="specialty" value={formData.specialty} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-5 py-4 text-[14px] font-bold text-[#002868] appearance-none focus:border-[#C8102E] outline-none bg-white">
                      {["Registered Nurse (RN)", "Licensed Practical Nurse (LPN)", "Nurse Practitioner (NP)", "Travel Nurse", "ER Nurse", "ICU Nurse", "PIR Nurse", "Surgical Nurse"].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Employment Type</label>
                  <div className="relative">
                    <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-5 py-4 text-[14px] font-bold text-[#002868] appearance-none focus:border-[#C8102E] outline-none bg-white">
                      {["Full Time", "Part Time", "PRN", "Contract", "Travel"].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Job Summary</label>
                <SimpleRichTextEditor value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} placeholder="Outline the core responsibilities and clinical setting..." />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Key Responsibilities</label>
                <SimpleRichTextEditor value={formData.responsibilities} onChange={(val) => setFormData(prev => ({ ...prev, responsibilities: val }))} placeholder="List 3-5 critical nursing tasks..." />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Required Qualifications</label>
                <SimpleRichTextEditor value={formData.requirements} onChange={(val) => setFormData(prev => ({ ...prev, requirements: val }))} placeholder="Certifications, licensure, and education..." />
              </div>

              <div className="pt-6">
                <h2 className="text-[12px] font-black text-[#002868] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#002868] text-white flex items-center justify-center text-[10px]">2</span>
                  Compensation & Logistics
                </h2>
                <div className="h-0.5 bg-gray-50 mb-8" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Min Salary (Annual)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black">$</span>
                            <input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-4 text-[14px] font-bold text-[#002868]" placeholder="75000" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Salary (Annual)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black">$</span>
                            <input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange} className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-4 text-[14px] font-bold text-[#002868]" placeholder="110000" />
                          </div>
                        </div>
                     </div>
                     <div className="space-y-2 relative">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Experience Level</label>
                        <select name="experience" value={formData.experience} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-5 py-4 text-[14px] font-bold text-[#002868] appearance-none focus:border-[#C8102E] outline-none">
                          {["New Grad", "1-2 Years", "3-5 Years", "5+ Years"].map(o => <option key={o}>{o}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-5 bottom-4.5 text-gray-400 pointer-events-none" />
                     </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Location (State)</label>
                      <div className="relative">
                        <select name="location" value={formData.location} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-5 py-4 text-[14px] font-bold text-[#002868] appearance-none">
                          <option value="">Select State</option>
                          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Zip Code</label>
                          <input name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-5 py-4 text-[14px] font-bold text-[#002868]" placeholder="90210" />
                       </div>
                       <div className="space-y-2">
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Openings</label>
                          <input name="totalOpenings" value={formData.totalOpenings} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-5 py-4 text-[14px] font-bold text-[#002868]" placeholder="02" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#002868] text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-[#C8102E] transition-all disabled:opacity-50 shadow-2xl shadow-blue-900/10 hover:shadow-[#C8102E]/20"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 size={20} className="animate-spin" />
                Publishing Listing...
              </div>
            ) : (editJobId ? "Update Professional Listing" : "Publish Professional Listing →")}
          </button>
        </form>

        <div className="mt-16 h-[350px] rounded-[2rem] overflow-hidden border-8 border-gray-50 shadow-inner">
           <LeafletMap lat={parseFloat(formData.latitude) || 37.0902} lng={parseFloat(formData.longitude) || -95.7129} />
        </div>
      </div>
    </div>
  );
}
