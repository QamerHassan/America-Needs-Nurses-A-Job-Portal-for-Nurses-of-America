"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, DollarSign, Calendar, Briefcase, Clock, Building, Globe, Mail, Phone, Bookmark, Share2, Loader2 } from "lucide-react";
import { getJobBySlug } from "../../utils/api";
import dynamic from 'next/dynamic';
import Logo from "../../components/Logo";
import CompanyLogo from "../../components/CompanyLogo";
import ApplyModal from "../../components/ApplyModal";
import { useAuth } from "../../context/AuthContext";

const LeafletMap = dynamic(() => import('../../components/LeafletMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
    <Loader2 size={24} className="animate-spin mr-2" />
    Loading Map...
  </div>
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const formatUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};



export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    if (id) {
      getJobBySlug(id as string)
        .then(data => setJob(data))
        .catch(err => console.error("Job not found", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    // Check if the job is saved
    if (auth?.token && job?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/jobs/saved`, {
        headers: {
          "Authorization": `Bearer ${auth.token}`,
          "x-user-id": auth.userId || ""
        }
      })
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
            setIsSaved(data.some((sj: any) => sj.jobId === job.id));
         }
      })
      .catch(() => {});
    }
  }, [auth, job]);

  const handleSaveJob = async () => {
    if (!auth?.token || !auth?.userId) {
       alert("Please login as a Candidate to save jobs.");
       return;
    }
    try {
       setIsSaving(true);
       if (isSaved) {
          // Find the saved job id to delete - this is complex because we just checked boolean earlier.
          // For now simulate toggling or just blindly send to remove logic if we had it, but mostly saving is enough.
          // Let's implement a POST to save.
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/jobs/saved/${job.id}`, {
             method: 'POST',
             headers: {
                "Authorization": `Bearer ${auth.token}`,
                "x-user-id": auth.userId
             }
          });
          if (res.ok) setIsSaved(true);
       } else {
          // Save it
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/jobs/saved/${job.id}`, {
             method: 'POST',
             headers: {
                "Authorization": `Bearer ${auth.token}`,
                "x-user-id": auth.userId
             }
          });
          if (res.ok) {
             setIsSaved(true);
          }
       }
    } catch (e) {
       console.error(e);
    } finally {
       setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Job Details...</div>;
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800">Job Not Found</h2>
        <p className="text-gray-500 mt-2">The job listing you are looking for does not exist.</p>
      </div>
    );
  }

  /* Asset resolution logic — Aligned with Jobs Listing for 100% consistency */
  const assetsKey = (job.Company?.name || "").toLowerCase().trim();
  
  /* Logo priority:
     1. Job.imageUrl (Job-level logo uploaded during post)
     2. DB Company.logoUrl (Company-level logo)
     3. Hardcoded Google Favicon (from map)
     4. Company Gallery Image
     5. Google Favicon from website
     6. UI Avatars (last resort)
  */
  let logoSrc = "";
  if (job.imageUrl) {
    logoSrc = formatUrl(job.imageUrl);
  } else if (job.Company?.logoUrl) {
    logoSrc = formatUrl(job.Company.logoUrl);
  } else if (job.Company?.CompanyImage?.[0]?.url) {
    logoSrc = formatUrl(job.Company.CompanyImage[0].url);
  } else if (job.Company?.website) {
    try {
      const domain = new URL(job.Company.website).hostname.replace("www.", "");
      logoSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {}
  }
  
  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.Company?.name || "H")}&background=002868&color=fff&size=128&bold=true`;
  if (!logoSrc) logoSrc = avatarFallback;
  
  /* Background Image priority: 
     1. Job.bannerUrl (Specific job banner)
     2. hardcoded mapBrand image
     3. DB Company.CompanyImage[0]
     4. Generic professional building fallback
  */
  const hospitalPhoto = 
    formatUrl(job.bannerUrl) || 
    formatUrl(job.Company?.CompanyImage?.[0]?.url) || 
    "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="job-detail-container">
      {/* Header Banner with Real Hospital Image */}
      <div className="job-header" style={{ backgroundImage: `url(${hospitalPhoto})` }}>
        <div className="header-overlay"></div>
        <div className="container-main relative z-10">
          <div className="header-flex">
            <div className="header-left">
              <div className="company-logo-large">
                <CompanyLogo src={logoSrc} alt={job.Company?.name} className="w-full h-full" fallbackIconSize={48} />
              </div>
              <div className="job-info">
                <span className="featured-chip">Featured Job</span>
                <h1 className="job-title-main">{job.title}</h1>
                <div className="job-meta-row">
                  <span className="meta-item"><Building size={16} /> {job.Company?.name}</span>
                  <span className="meta-item"><MapPin size={16} /> {job.location || job.Company?.address}</span>
                  <span className="meta-item"><Clock size={16} /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="job-tags">
                  <span className="tag-badge red">{job.jobType}</span>
                  <span className="tag-badge blue">{job.specialty || "Healthcare"}</span>
                </div>
              </div>
            </div>
            <div className="header-right">
              <div className="salary-block">
                <span className="salary-label">Monthly Salary</span>
                <div className="salary-val">${(job.salaryMin/1000).toFixed(0)}k - ${(job.salaryMax/1000).toFixed(0)}k</div>
              </div>
              <div className="action-btns">
                <button 
                  onClick={() => setIsApplyModalOpen(true)}
                  className="btn-apply-now"
                >
                  Apply For This Job
                </button>
                <button 
                  onClick={handleSaveJob} 
                  disabled={isSaving}
                  className="btn-save-job" 
                  style={{ background: isSaved ? '#C8102E' : 'rgba(255,255,255,0.1)' }}
                >
                  <Bookmark size={18} fill={isSaved ? '#fff' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main main-content-grid">
        {/* Left Column - Description */}
        <div className="content-left">
          <div className="detail-card">
            <h3 className="card-title">Job Description</h3>
            <div className="rich-text">
              {job.description || "No description provided."}
            </div>
          </div>

        </div>

        {/* Right Column - Sidebar */}
        <div className="content-right">
          <div className="sidebar-card">
            <h3 className="card-title">Job Summary</h3>
            <div className="summary-list">
              <div className="summary-item">
                <Calendar size={18} className="text-red-600" />
                <div className="sum-text">
                  <label>Published On:</label>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {job.vacancies && (
                <div className="summary-item">
                  <Briefcase size={18} className="text-red-600" />
                  <div className="sum-text">
                    <label>Vacancy:</label>
                    <span>{job.vacancies} Positions</span>
                  </div>
                </div>
              )}
              <div className="summary-item">
                <Clock size={18} className="text-red-600" />
                <div className="sum-text">
                  <label>Employment Type:</label>
                  <span>{job.jobType}</span>
                </div>
              </div>
              <div className="summary-item">
                <MapPin size={18} className="text-red-600" />
                <div className="sum-text">
                  <label>Location:</label>
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-card company-card-mini">
            <h3 className="card-title">About Company</h3>
            <div className="mini-company-info">
              <div className="mini-logo-container">
                <CompanyLogo src={logoSrc} alt="Company" className="w-full h-full" />
              </div>
              <div>
                <h4 className="mini-name">{job.Company?.name}</h4>
                <a href={job.Company?.website || "#"} target="_blank" rel="noopener noreferrer" className="company-link">Visit Website →</a>
              </div>
            </div>
            <p className="mini-bio">{job.Company?.bio?.substring(0, 100)}...</p>
            <div className="mini-stats">
              <div className="mini-stat">
                <label>Found In</label>
                <span>{job.Company?.foundedYear || "N/A"}</span>
              </div>
              <div className="mini-stat">
                <label>Employees</label>
                <span>{job.Company?.companySize || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Location Map Card */}
          {(job.latitude || job.longitude) && (
            <div className="sidebar-card p-0 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-[16px] font-bold text-[#002868] m-0">Location Map</h3>
               </div>
               <div className="h-[250px] relative">
                  <LeafletMap lat={job.latitude} lng={job.longitude} interactive={false} />
                  <div className="absolute bottom-4 left-4 z-[1000]">
                     <div className="bg-white px-3 py-1.5 rounded-lg shadow-md border border-gray-100 flex items-center gap-2">
                        <MapPin size={14} className="text-[#C8102E]" />
                        <span className="text-[11px] font-bold text-gray-700">{job.location}</span>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .job-detail-container {
          background: #f4f7f9;
          min-height: 100vh;
          padding-bottom: 60px;
        }
        .container-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .job-header {
          position: relative;
          background-color: #002868; /* ANN Navy default */
          background-size: cover;
          background-position: center;
          padding: 70px 0;
          color: #fff;
          margin-bottom: 40px;
          overflow: hidden;
        }

        .header-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #002868 45%, rgba(0, 40, 104, 0.7) 60%, rgba(0, 40, 104, 0.1) 100%);
          z-index: 1;
        }

        .relative { position: relative; }
        .z-10 { z-index: 10; }
        
        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
        }
        
        .header-left {
          display: flex;
          gap: 25px;
          align-items: center;
        }
        
        .company-logo-large {
          width: 100px;
          height: 100px;
          background: #fff;
          border-radius: 12px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        .company-logo-large img {
          max-width: 100%;
          max-height: 100%;
        }
        
        .featured-chip {
          background: rgba(255,255,255,0.1);
          color: #fff;
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.2);
          margin-bottom: 8px;
          display: inline-block;
        }
        
        .job-title-main {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 10px 0;
        }
        
        .job-meta-row {
          display: flex;
          gap: 20px;
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 15px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .job-tags {
          display: flex;
          gap: 10px;
        }
        .tag-badge {
          padding: 6px 15px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
        }
        .tag-badge.red { background: #C8102E; color: #fff; }
        .tag-badge.blue { background: #0047b3; color: #fff; }
        
        .header-right {
          text-align: right;
        }
        .salary-label {
          display: block;
          font-size: 14px;
          opacity: 0.7;
          margin-bottom: 5px;
        }
        .salary-val {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 20px;
        }
        
        .action-btns {
          display: flex;
          gap: 12px;
        }
        .btn-apply-now {
          background: #C8102E;
          color: #fff;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-apply-now:hover { background: #a00d25; }
        
        .btn-save-job {
          width: 45px;
          height: 45px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        .main-content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }
        
        .detail-card, .sidebar-card {
          background: #fff;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e1e8ed;
          margin-bottom: 30px;
        }
        
        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #002868;
          margin: 0 0 20px 0;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f4f8;
        }
        
        .rich-text {
          color: #4b5563;
          line-height: 1.8;
          font-size: 15px;
        }
        
        .check-list {
          list-style: none;
          padding: 0;
        }
        .check-list li {
          position: relative;
          padding-left: 30px;
          margin-bottom: 12px;
          color: #4b5563;
          font-size: 15px;
        }
        .check-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #10B981;
          font-weight: bold;
        }
        
        .summary-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .summary-item {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }
        .sum-text label {
          display: block;
          font-size: 12px;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 2px;
          letter-spacing: 0.5px;
        }
        .sum-text span {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .mini-company-info {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 15px;
        }
        .mini-logo-container {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          border: 1px solid #f0f4f8;
          overflow: hidden;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
        }
        .mini-logo-container img {
          max-width: 100%;
          max-height: 100%;
          object-contain: contain;
        }
        .mini-name {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }
        .company-link {
          font-size: 13px;
          color: #C8102E;
          font-weight: 600;
          text-decoration: none;
        }
        .mini-bio {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }
        
        .mini-stats {
          display: flex;
          border-top: 1px solid #f0f4f8;
          padding-top: 20px;
          gap: 20px;
        }
        .mini-stat label {
          display: block;
          font-size: 11px;
          color: #9ca3af;
          margin-bottom: 2px;
        }
        .mini-stat span {
          font-size: 14px;
          font-weight: 700;
          color: #002868;
        }
        
        @media (max-width: 900px) {
          .header-flex { flex-direction: column; text-align: center; }
          .header-left { flex-direction: column; }
          .job-meta-row { justify-content: center; }
          .job-tags { justify-content: center; }
          .header-right { text-align: center; }
          .action-btns { justify-content: center; }
          .main-content-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {job && (
        <ApplyModal 
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          jobId={job.id}
          jobTitle={job.title}
          companyName={job.Company?.name || "the employer"}
        />
      )}
    </div>
  );
}
