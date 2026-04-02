"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Mail, 
  Briefcase, 
  Phone, 
  DollarSign, 
  Clock,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Building,
  Calendar,
} from "lucide-react";
// Social Fallbacks
const Facebook = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const Twitter = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const Instagram = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const LinkedinIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

import { useDashboard } from "../layout";
import { uploadGenericImage } from "@/app/utils/api";
import api from "@/app/utils/api";
import CompanyLogo from "../../components/CompanyLogo";

export default function EmployerProfilePage() {
  const { employer: employerData, profile, data, refresh } = useDashboard();
  const company = data?.companies?.[0] || null;
  const logoUrl = employerData?.image || company?.logoUrl || null;

  // Form State
  const [hospitalName, setHospitalName] = useState("");
  const [companyCategory, setCompanyCategory] = useState("");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [revenue, setRevenue] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [currentLogoUrl, setCurrentLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  
  // Contact & Social
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [country, setCountry] = useState("usa");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [googlePlus, setGooglePlus] = useState("");

  const [website, setWebsite] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const formatUrl = (path: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // Sync Data from API
  useEffect(() => {
    if (employerData) {
      setHospitalName(profile?.companyName || employerData.name || "");
      setCompanyCategory(profile?.companyCategory || "Healthcare");
      setAbout(profile?.about || "");
      setPhone(profile?.phone || employerData.phone || "");
      setLocation(profile?.location || "");
      setCompanySize(profile?.companySize || "");
      setFoundedYear(profile?.foundedYear || "");
      setRevenue(profile?.revenue || "");
      setTags(profile?.tags || []);
      setVideoUrl(profile?.videoUrl || "");
      
      // BANNER PERSISTENCE FIX: Sync from profile (best source) or fallback to company
      const finalBanner = profile?.bannerUrl || company?.bannerUrl || "";
      setBannerUrl(finalBanner);
      
      // PERSISTENCE FIX: Always sync from API even if null
      if (employerData?.image) setCurrentLogoUrl(employerData.image);
      else if (company?.logoUrl) setCurrentLogoUrl(company.logoUrl);
      
      setAddress(profile?.address || "");
      setAddressLine2(profile?.addressLine2 || "");
      setCountry(profile?.country || "usa");
      setState(profile?.state || "");
      setCity(profile?.city || "");
      setZipCode(profile?.zipCode || "");
      setLatitude(profile?.latitude?.toString() || "");
      setLongitude(profile?.longitude?.toString() || "");
      setWebsite(profile?.website || "");
      setTwitter(profile?.twitter || "");
      setInstagram(profile?.instagram || "");
      setLinkedin(profile?.linkedin || "");
      setGooglePlus(profile?.googlePlus || "");
    }
  }, [employerData, profile, company]);

  const completeness = useMemo(() => {
    const fields = [
      hospitalName, companyCategory, about, phone, location, 
      companySize, foundedYear, revenue, address, state, city,
      zipCode, website, currentLogoUrl, bannerUrl
    ];
    const filled = fields.filter(f => !!f).length;
    return Math.round((filled / fields.length) * 100);
  }, [hospitalName, companyCategory, about, phone, location, companySize, foundedYear, revenue, address, state, zipCode, website, currentLogoUrl, bannerUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!employerData?.id) throw new Error("No user session found");

      // Payload create karein
      const payload = {
        hospitalName,
        companyCategory,
        about,
        phone,
        location,
        companySize,
        foundedYear,
        revenue,
        videoUrl,
        tags,
        address,
        addressLine2,
        country,
        state,
        city,
        zipCode,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        twitter,
        instagram,
        linkedin,
        googlePlus,
        website,
        logoUrl: currentLogoUrl,
        bannerUrl: bannerUrl
      };

      const response = await api.patch(`/users/${employerData.id}/employer-profile`, payload);

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to save profile");
      }

      await refresh(); // Dashboard context refresh karein
      
      // Confirm persistence to state
      alert("✅ Banner Persistence Finalized! Your branding is now permanent across all pages.");
    } catch (err: any) {
      console.error("Profile save error:", err);
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingAvatar(true);

      try {
        const res = await uploadGenericImage(file);
        setCurrentLogoUrl(res.url);
        alert("Logo staged! Click 'Save Profile' to apply changes.");
      } catch (err: any) {
        console.error("Avatar upload error:", err);
        alert("Upload failed: " + err.message);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingBanner(true);

      try {
        const res = await uploadGenericImage(file);
        setBannerUrl(res.url);
        alert("Cover photo staged! Click 'Save Profile' to apply changes.");
      } catch (err: any) {
        console.error("Banner upload error:", err);
        alert("Upload failed: " + err.message);
      } finally {
        setIsUploadingBanner(false);
      }
    }
  };

  if (!employerData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-[#002868] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page-content">
      <div className="content-header">
        <h1 className="page-title">Employer Profile</h1>
        <div className="breadcrumbs">
          <Link href="/employer/dashboard" className="hover:text-[#002868]">Employer</Link> / <span>Dashboard</span> / <span className="active">Employer Profile</span>
        </div>
      </div>

      <div className="main-grid">
        {/* Left main content area */}
        <div className="main-column">
          {/* Profile Overview Card */}
          <div className="card-panel profile-overview-card overflow-hidden !p-0 border-0 shadow-lg mb-8">
            <div className="profile-header-accent w-full h-[160px] bg-slate-100 relative group overflow-hidden">
              {bannerUrl ? (
                <img src={formatUrl(bannerUrl)} alt="Banner" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#002868] to-[#001c4a] opacity-90" />
              )}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all" />
              <button 
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-widest uppercase py-2 px-4 rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                onClick={() => document.getElementById('bannerUpload')?.click()}
              >
                <input type="file" id="bannerUpload" className="hidden" onChange={handleBannerSelect} />
                {isUploadingBanner ? "Uploading..." : "Change Cover"}
              </button>
            </div>

            <div className="overview-header p-8 -mt-16 relative z-10 flex flex-col md:flex-row items-end md:items-center gap-8 bg-white rounded-b-xl">
               <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="avatar-progress-wrap bg-white rounded-full">
                  <svg className="progress-ring" width="120" height="120">
                    <circle className="progress-ring-circle bg" stroke="#edf2f7" strokeWidth="6" fill="transparent" r="54" cx="60" cy="60" />
                    <circle className="progress-ring-circle val" stroke="#C8102E" strokeWidth="6" fill="transparent" r="54" cx="60" cy="60" 
                      style={{ 
                        strokeDasharray: '339.292', 
                        strokeDashoffset: `${339.292 - (339.292 * completeness) / 100}`,
                        transition: 'stroke-dashoffset 0.5s ease'
                      }} 
                    /> 
                  </svg>
                  <div className="overview-avatar flex items-center justify-center bg-[#f1f5f9] text-[#002868] font-black text-3xl uppercase overflow-hidden">
                    {currentLogoUrl ? (
                      <CompanyLogo src={currentLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      (hospitalName || "E").charAt(0)
                    )}
                  </div>
                  <div className="progress-label">{completeness}%</div>
                </div>
                <button 
                  className="btn-change-profile shadow-md"
                  onClick={() => document.getElementById('avatarUpload')?.click()}
                >
                  <input type="file" id="avatarUpload" className="hidden" onChange={handleAvatarSelect} />
                  {isUploadingAvatar ? "..." : "Update Logo"}
                </button>
              </div>

              <div className="overview-info pt-12 md:pt-0">
                <h2 className="profile-name">
                    {hospitalName || "Hospital Name"} <CheckCircle size={18} className="inline text-blue-500 fill-blue-500/20 ml-1" />
                </h2>
                <p className="profile-title">{companyCategory}</p>
                <div className="info-grid mt-4">
                  <div className="info-item"><MapPin size={16} /> {city}, {state}</div>
                  <div className="info-item"><Mail size={16} /> {employerData?.email}</div>
                  <div className="info-item"><Phone size={16} /> {phone}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Detail Form */}
          <div className="card-panel form-card">
            <h3 className="section-title">Basic Detail</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Employer Name</label>
                <input type="text" className="form-control" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Company Category</label>
                <select className="form-control" value={companyCategory} onChange={e => setCompanyCategory(e.target.value)}>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Web & Application">Web & Application</option>
                </select>
              </div>
              <div className="form-group">
                <label>Founded Year</label>
                <input type="text" className="form-control" value={foundedYear} onChange={e => setFoundedYear(e.target.value)} placeholder="e.g. 2010" />
              </div>
              <div className="form-group">
                <label>Company Size</label>
                <input type="text" className="form-control" value={companySize} onChange={e => setCompanySize(e.target.value)} placeholder="e.g. 500-1000" />
              </div>
              <div className="form-group">
                <label>Revenue</label>
                <input type="text" className="form-control" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="Standard" />
              </div>
              <div className="form-group">
                <label>Video URL</label>
                <input type="text" className="form-control" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
              </div>
              <div className="form-group full-width">
                <label>About Company</label>
                <textarea className="form-control" rows={4} value={about} onChange={e => setAbout(e.target.value)} placeholder="Describe your company..."></textarea>
              </div>
            </div>
          </div>

          {/* Contact Detail Form */}
          <div className="card-panel form-card">
            <h3 className="section-title">Contact Detail</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Your Email</label>
                <input type="email" className="form-control" value={employerData?.email || ""} readOnly />
              </div>
              <div className="form-group">
                <label>Phone no.</label>
                <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Address 1</label>
                <input type="text" className="form-control" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Corporate Blvd" />
              </div>
              <div className="form-group">
                <label>Address 2</label>
                <input type="text" className="form-control" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Suite 400" />
              </div>
              <div className="form-group">
                <label>Country</label>
                <select className="form-control" value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="usa">United States</option>
                  <option value="canada">Canada</option>
                  <option value="india">India</option>
                </select>
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" className="form-control" value={state} onChange={e => setState(e.target.value)} placeholder="e.g. California" />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" className="form-control" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Los Angeles" />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" className="form-control" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="90001" />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input type="text" className="form-control" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="34.0522" />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input type="text" className="form-control" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="-118.2437" />
              </div>
            </div>
          </div>

          {/* Social Detail Form */}
          <div className="card-panel form-card">
            <h3 className="section-title">Social Detail</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Twitter</label>
                <input type="url" className="form-control" value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="https://twitter.com/..." />
              </div>
              <div className="form-group">
                <label>Instagram</label>
                <input type="url" className="form-control" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div className="form-group">
                <label>Linked In</label>
                <input type="url" className="form-control" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>

            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ padding: '14px 32px', fontSize: '15px' }}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
          
        </div>

        {/* Right sidebar area */}
        <div className="sidebar-column">
          <div className="card-panel complete-profile-card">
            <div className="task-list">
              <div className="task-item">
                <div className={`task-icon ${employerData?.emailVerified ? 'bg-green-50 text-green-600' : ''}`}>
                  {employerData?.emailVerified ? <CheckCircle size={20} /> : <Mail size={20} />}
                </div>
                <div className="task-text">Verify Email</div>
                <div className="task-score">{employerData?.emailVerified ? 'Done' : '+ 10%'}</div>
              </div>
              <div className="task-item">
                <div className={`task-icon ${profile?.companyCategory ? 'bg-green-50 text-green-600' : ''}`}>
                  {profile?.companyCategory ? <CheckCircle size={20} /> : <Building size={20} />}
                </div>
                <div className="task-text">Company Registration</div>
                <div className="task-score">{profile?.companyCategory ? 'Done' : '+ 10%'}</div>
              </div>
              <div className="task-item">
                <div className={`task-icon ${currentLogoUrl ? 'bg-green-50 text-green-600' : ''}`}>
                  {currentLogoUrl ? <CheckCircle size={20} /> : <ImageIcon size={20} />}
                </div>
                <div className="task-text">Upload Company Logo</div>
                <div className="task-score">{currentLogoUrl ? 'Done' : '+ 5%'}</div>
              </div>
            </div>
            <button className="btn-primary w-full mt-6" onClick={handleSave}>
              Save Profile Changes
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-page-content { max-width: 1400px; margin: 0 auto; }
        .content-header { margin-bottom: 32px; }
        .page-title { font-size: 28px; margin-bottom: 8px; color: #002868; font-weight: 800; }
        .breadcrumbs { font-size: 14px; color: #718096; }
        .breadcrumbs .active { color: #002868; font-weight: 700; }
        
        .main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
        .card-panel { background: #fff; border-radius: 16px; border: 1px solid #edf2f7; box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05); margin-bottom: 24px; overflow: hidden; }
        
        .profile-banner-preview { background: #002868; transition: height 0.3s ease; }
        .overview-header { background: #fff; border-radius: 0 0 16px 16px; border-top: 1px solid #f1f5f9; }
        
        .avatar-progress-wrap { position: relative; width: 120px; height: 120px; }
        .overview-avatar { width: 96px; height: 96px; border-radius: 50%; position: absolute; top: 12px; left: 12px; object-fit: cover; border: 4px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .progress-ring-circle { transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .progress-label { position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); background: #fff; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; color: #002868; border: 1px solid #edf2f7; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        
        .profile-name { font-size: 26px; font-weight: 800; color: #002868; display: flex; align-items: center; gap: 8px; }
        .profile-title { color: #C8102E; font-weight: 700; font-size: 15px; margin-top: 2px; }
        
        .info-grid { display: flex; gap: 24px; flex-wrap: wrap; }
        .info-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; font-weight: 600; }
        .info-item :global(svg) { color: #94a3b8; }
        
        .form-card { padding: 40px; }
        .section-title { font-size: 18px; font-weight: 800; color: #002868; margin-bottom: 28px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label { font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; display: block; text-transform: uppercase; letter-spacing: 0.025em; }
        
        .form-control { width: 100%; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; font-size: 14px; font-weight: 500; transition: all 0.2s ease; }
        .form-control:focus { outline: none; border-color: #002868; background: #fff; box-shadow: 0 0 0 4px rgba(0,40,104,0.08); }
        
        .btn-primary { background: #C8102E; color: white; border: none; border-radius: 14px; font-weight: 800; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .btn-primary:hover { background: #a80d26; transform: translateY(-2px); box-shadow: 0 12px 20px -5px rgba(200, 16, 46, 0.4); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .btn-change-profile { font-size: 12px; font-weight: 800; color: #C8102E; background: #fff; border: 1px solid #fee2e2; padding: 8px 16px; border-radius: 10px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .btn-change-profile:hover { background: #fdf2f2; border-color: #fecaca; }
        
        .complete-profile-card { background: linear-gradient(to bottom right, #fff, #f8fafc); border: 1px solid #e2e8f0; padding: 28px; }
        .task-list { display: flex; flex-direction: column; gap: 12px; }
        .task-item { display: flex; align-items: center; gap: 16px; padding: 14px; border: 1px solid #f1f5f9; border-radius: 12px; background: #fff; transition: all 0.2s; }
        .task-item:hover { border-color: #e2e8f0; transform: translateX(4px); }
        .task-icon { width: 40px; height: 40px; display: flex; items-center center; justify-content: center; border-radius: 10px; flex-shrink: 0; }
        .task-text { font-size: 14px; font-weight: 700; flex: 1; color: #334155; }
        
        @media (max-width: 1100px) {
          .main-grid { grid-template-columns: 1fr; }
          .overview-header { flex-direction: column; text-align: center; items: center; }
          .info-grid { justify-content: center; }
          .form-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
