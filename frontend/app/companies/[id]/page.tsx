"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Globe, Mail, Phone, Users, Calendar, Briefcase, Star, Info } from "lucide-react";
import axios from "axios";
import Footer from "@/app/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const formatUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function CompanyDetailPage() {
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios.get(`${API_URL}/companies/${id}`)
        .then(res => setCompany(res.data))
        .catch(err => console.error("Company not found", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Company Profile...</div>;
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800">Company Not Found</h2>
        <p className="text-gray-500 mt-2">The company you are looking for does not exist.</p>
      </div>
    );
  }

  const companyLogo = formatUrl(company.logoUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name || 'C')}&background=002868&color=fff`;
  const companyBanner = formatUrl(company.bannerUrl);

  return (
    <div className="company-detail-container">
      {/* Top Banner */}
      {/* Top Banner */}
      <div className="profile-banner" style={companyBanner ? { backgroundImage: `url(${companyBanner})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' } : {}}>
        {companyBanner && <div className="absolute inset-0 bg-[#002868]/60 backdrop-blur-sm z-0"></div>}
        <div className="container-main relative z-10">
          <div className="banner-content">
            <div className="company-logo-badge">
              <img src={companyLogo} alt={company.name} />
            </div>
            <div className="company-header-info">
              <div className="name-verify">
                <h1 className="company-name-title" style={companyBanner ? { color: '#fff' } : {}}>{company.name}</h1>
                <span className="verify-badge">Verified</span>
              </div>
              <p className="company-category" style={companyBanner ? { color: 'rgba(255,255,255,0.8)' } : {}}>{company.category || "Healthcare Services"}</p>
              <div className="company-header-meta">
                <span style={companyBanner ? { color: 'rgba(255,255,255,0.6)' } : {}}><MapPin size={16} /> {company.address}</span>
                <span style={companyBanner ? { color: 'rgba(255,255,255,0.6)' } : {}}><Globe size={16} /> {company.website || "No website"}</span>
                <span style={companyBanner ? { color: 'rgba(255,255,255,0.6)' } : {}}><Users size={16} /> 500-1000 Employees</span>
              </div>
            </div>
            <div className="banner-actions">
              <button className="btn-follow">Follow Company</button>
              <button className="btn-msg">Send Message</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main content-grid">
        {/* Left Column */}
        <div className="main-info">
          <div className="about-card">
            <h3>About Company</h3>
            <p className="description-text">
              {company.bio || "No description provided for this company."}
            </p>
          </div>

          <div className="jobs-card">
            <h3>Active Jobs ({company.Job?.length || 0})</h3>
            <div className="jobs-mini-list">
              {company.Job?.length > 0 ? (
                company.Job.map((job: any) => (
                  <div key={job.id} className="mini-job-row">
                    <div className="mini-job-info">
                      <h4 className="mini-job-title">{job.title}</h4>
                      <p className="mini-job-meta">{job.employmentType} • {job.location}</p>
                    </div>
                    <button className="btn-view-job-mini">View Job</button>
                  </div>
                ))
              ) : (
                <p className="no-jobs">No active jobs at the moment.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="sidebar-info">
          <div className="contact-card">
            <h3>Contact Info</h3>
            <div className="contact-list">
              <div className="contact-item">
                <Mail size={18} className="text-red-600" />
                <div>
                  <label>Email Address</label>
                  <span>{company.email || "contact@company.com"}</span>
                </div>
              </div>
              <div className="contact-item">
                <Phone size={18} className="text-red-600" />
                <div>
                  <label>Phone Number</label>
                  <span>{company.phone || "+1 234 567 890"}</span>
                </div>
              </div>
              <div className="contact-item">
                <MapPin size={18} className="text-red-600" />
                <div>
                  <label>Our Location</label>
                  <span>{company.address}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="social-card">
             <h3>Follow Us</h3>
             <div className="social-icons-row">
                {["FB", "TW", "IG", "LN"].map(s => (
                  <div key={s} className="social-icon-box">{s}</div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .company-detail-container {
          background: #f8fafc;
          min-height: 100vh;
          padding-bottom: 60px;
        }
        .container-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .profile-banner {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          padding: 40px 0;
          margin-bottom: 40px;
        }
        
        .banner-content {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        
        .company-logo-badge {
          width: 120px;
          height: 120px;
          border-radius: 16px;
          padding: 12px;
          border: 1px solid #eef2f6;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          background: #fff;
        }
        .company-logo-badge img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .company-header-info {
          flex: 1;
        }
        .name-verify {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }
        .company-name-title {
          font-size: 28px;
          font-weight: 800;
          color: #002868;
          margin: 0;
        }
        .verify-badge {
          background: #dcfce7;
          color: #166534;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        
        .company-category {
          color: #64748b;
          font-size: 16px;
          margin-bottom: 15px;
        }
        
        .company-header-meta {
          display: flex;
          gap: 20px;
          color: #64748b;
          font-size: 14px;
        }
        .company-header-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .banner-actions {
          display: flex;
          gap: 12px;
        }
        .btn-follow {
          background: #C8102E;
          color: #fff;
          border: none;
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-msg {
          background: #f1f5f9;
          color: #002868;
          border: 1px solid #e2e8f0;
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }
        
        .about-card, .jobs-card, .contact-card, .social-card {
          background: #fff;
          border-radius: 12px;
          padding: 30px;
          border: 1px solid #e2e8f0;
          margin-bottom: 30px;
        }
        
        h3 {
          font-size: 18px;
          font-weight: 700;
          color: #002868;
          margin: 0 0 25px 0;
          padding-bottom: 15px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .description-text {
          color: #475569;
          line-height: 1.8;
          font-size: 15px;
        }
        
        .jobs-mini-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .mini-job-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
        }
        .mini-job-title {
          font-size: 15px;
          font-weight: 700;
          color: #002868;
          margin: 0 0 4px 0;
        }
        .mini-job-meta {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .btn-view-job-mini {
          background: #fff;
          border: 1px solid #cbd5e1;
          color: #002868;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 15px;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .contact-item {
          display: flex;
          gap: 15px;
        }
        .contact-item label {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .contact-item span {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .social-icons-row {
          display: flex;
          gap: 10px;
        }
        .social-icon-box {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
        }
        
        @media (max-width: 900px) {
          .banner-content { flex-direction: column; text-align: center; }
          .company-header-meta { justify-content: center; }
          .content-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <Footer />
    </div>
  );
}
