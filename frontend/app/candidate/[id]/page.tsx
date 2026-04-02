"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  MapPin, DollarSign, Calendar, Download, Bookmark, 
  Mail, Phone, Clock, Briefcase, GraduationCap, FileText, CheckCircle, ArrowUp, User as UserIcon
} from "lucide-react";
import { getNursePublicProfile } from "../../utils/api";
import Footer from "../../components/Footer";

export default function CandidateDetailPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (id) {
      getNursePublicProfile(id as string)
        .then((data: any) => setProfile(data))
        .catch((err: any) => console.error("Failed to load candidate", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center custom-page-bg min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8102E]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center custom-page-bg min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800">Candidate Not Found</h2>
        <p className="text-gray-500 mt-2">The profile you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const { User, documents, experience, education, skills, employmentPref } = profile;
  const docsList = documents || [];
  const expList = experience || [];
  const eduList = education || [];
  const skillsList = skills || [];

  return (
    <div className="custom-page-bg min-h-screen flex flex-col">
      <div className="container-main flex-1 w-full pt-8">
        {/* Header Block */}
        <div className="profile-header-card">
          <div className="ph-left">
            <div className="ph-avatar-wrap" style={{ background: User?.image ? 'transparent' : '#C8102E' }}>
              {User?.image ? (
                <img 
                  src={User.image} 
                  alt={User?.name || "Candidate"} 
                  className="ph-avatar"
                />
              ) : (
                <UserIcon size={56} className="text-white" />
              )}
            </div>
            <div className="ph-info">
              <span className="featured-badge">Featured</span>
              <h1 className="ph-name">{profile.fullName || User?.name || "Anonymous Candidate"}</h1>
              
              <div className="ph-meta-row">
                <span className="ph-meta-item">
                  <Briefcase size={14} /> {profile.specialization || "Registered Nurse"}
                </span>
                <span className="ph-meta-item">
                  <MapPin size={14} /> {profile.location || "Location Not Set"}
                </span>
                <span className="ph-meta-item">
                  <DollarSign size={14} /> {profile.minPay ? `${profile.minPay}/${profile.payPeriod === 'HOURLY' ? 'HR' : 'YR'}` : "Negotiable"}
                </span>
                <span className="ph-meta-item">
                  <Calendar size={14} /> Member since {new Date(profile.createdAt).getFullYear()}
                </span>
              </div>

              <div className="ph-skills">
                {skillsList.map((s: string, i: number) => (
                  <span key={i} className="ph-skill-chip">{s}</span>
                ))}
                {skillsList.length === 0 && <span className="text-gray-500 text-sm italic">No specific skills listed.</span>}
              </div>
            </div>
          </div>
          <div className="ph-right">
            <button className="btn-download-cv">
              Download CV <Download size={16} />
            </button>
            <button className="btn-bookmark">
              <Bookmark size={20} />
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="layout-grid">
          {/* Main Column */}
          <div className="main-col">
            
            {/* About Candidate */}
            <div className="content-card">
              <h3 className="section-title">About Candidate</h3>
              <p className="about-text">
                {profile.bio || "This candidate has not provided a biography yet. They are an active member of the America Needs Nurses platform."}
              </p>
            </div>

            {/* All Information */}
            <div className="content-card">
              <h3 className="section-title">All Information</h3>
              <div className="info-grid">
                <div className="info-box">
                  <div className="info-icon"><Mail size={20} /></div>
                  <div className="info-content">
                    <h4>{User?.email || "Hidden"}</h4>
                    <span>Email Address</span>
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-icon"><Phone size={20} /></div>
                  <div className="info-content">
                    <h4>{profile.phone || "Hidden"}</h4>
                    <span>Phone No.</span>
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-icon"><DollarSign size={20} /></div>
                  <div className="info-content">
                    <h4>{profile.minPay ? `$${profile.minPay}/${profile.payPeriod}` : "Negotiable"}</h4>
                    <span>Expected Salary</span>
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-icon"><Clock size={20} /></div>
                  <div className="info-content">
                    <h4>{profile.yearsOfExperience || 0} Years</h4>
                    <span>Experience</span>
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-icon"><GraduationCap size={20} /></div>
                  <div className="info-content">
                    <h4>{profile.licenseType || "RN"}</h4>
                    <span>Qualification</span>
                  </div>
                </div>
                <div className="info-box">
                  <div className="info-icon"><Briefcase size={20} /></div>
                  <div className="info-content">
                    <h4>{employmentPref?.join(", ") || "Full Time, Rotating"}</h4>
                    <span>Work Type</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumes */}
            {docsList.length > 0 && (
              <div className="content-card">
                <h3 className="section-title">Resumes</h3>
                <div className="resume-list">
                  {docsList.map((doc: any, i: number) => (
                    <div key={i} className="resume-item">
                      <div className="resume-icon">
                        <FileText size={24} className={doc.type === 'PDF' ? 'text-red-500' : 'text-blue-500'} />
                      </div>
                      <div className="resume-info">
                        <h4>{doc.name}</h4>
                        <span>{Math.round(doc.size / 1024)} KB</span>
                      </div>
                      <a href={`http://localhost:3001${doc.url}`} download className="resume-download-btn">
                        Download <Download size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            <div className="content-card">
              <h3 className="section-title">All Experience</h3>
              <div className="timeline-list">
                {expList.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No experience added yet.</p>
                ) : (
                  expList.map((exp: any, i: number) => (
                    <div key={i} className="timeline-item">
                      <div className="tl-logo">
                        <Briefcase size={24} color="#002868" />
                      </div>
                      <div className="tl-content">
                        <div className="tl-header">
                          <h4>{exp.facility} <span>{exp.employmentType || "Full Time"}</span></h4>
                          <p className="tl-role">{exp.title}</p>
                        </div>
                        <p className="tl-meta">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                        <p className="tl-desc">{exp.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Education */}
            <div className="content-card">
              <h3 className="section-title">Educations</h3>
              <div className="timeline-list">
                {eduList.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No education added yet.</p>
                ) : (
                  eduList.map((edu: any, i: number) => (
                    <div key={i} className="timeline-item">
                      <div className="tl-logo" style={{ background: '#fef2f2' }}>
                        <GraduationCap size={24} color="#C8102E" />
                      </div>
                      <div className="tl-content">
                        <div className="tl-header">
                          <h4>{edu.school}</h4>
                          <p className="tl-role">{edu.degree}</p>
                        </div>
                        <p className="tl-meta">Graduated {edu.endYear || edu.startDate}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Candidate Skills Block */}
            <div className="content-card">
              <h3 className="section-title">Candidate Skills</h3>
              <div className="ph-skills">
                {skillsList.map((s: string, i: number) => (
                  <span key={i} className="skill-chip-theme">{s}</span>
                ))}
                {skillsList.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No specific skills listed.</p>
                )}
              </div>
            </div>

            {/* Portfolio */}
            {(profile.portfolioImages || []).length > 0 && (
              <div className="content-card">
                <h3 className="section-title">Portfolio</h3>
                <div className="portfolio-grid">
                  {profile.portfolioImages.map((img: string, i: number) => (
                    <img key={i} src={img} alt={`Portfolio ${i}`} className="portfolio-img" />
                  ))}
                </div>
              </div>
            )}

            {/* Language */}
            <div className="content-card">
              <h3 className="section-title">Language</h3>
              <div className="language-grid">
                {(profile.languages || "English").split(",").map((lang: string, i: number) => (
                  <div key={i} className="language-card">
                    <div className={`lang-icon ${i % 2 === 0 ? 'pl' : 'pl2'}`}>
                      {lang.trim().substring(0, 2).toUpperCase()}
                    </div>
                    <div className="lang-info">
                      <h4>{lang.trim()}</h4>
                      <span>Primary</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
          </div>

          {/* Sidebar Column */}
          <div className="sidebar-col">
            <div className="contact-card mb-6">
              <h3 className="contact-title">Contact {User?.name?.split(" ")[0] || "Candidate"}</h3>
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Your Name" className="contact-input" />
                <input type="email" placeholder="Email Address" className="contact-input" />
                <input type="text" placeholder="Phone." className="contact-input" />
                <input type="text" placeholder="Subject" className="contact-input" />
                <textarea placeholder="Your Message" className="contact-textarea"></textarea>
                <button type="submit" className="btn-send-message">Send Message</button>
              </form>
            </div>

            <div className="contact-card social-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a202c' }}>Share Profile</span>
              <div className="social-icons" style={{ display: 'flex', gap: '8px' }}>
                <a href="#" className="social-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                </a>
                <a href="#" className="social-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                </a>
                <a href="#" className="social-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.54 11.19v2.7h4.08a4.2 4.2 0 01-1.83 2.76 6.33 6.33 0 11.36-9.5l2.1-2.09A9.27 9.27 0 1012.54 21.6v-5.6h5.81a6.83 6.83 0 01-1.74 3.7A6.45 6.45 0 0112.54 21.6 9.3 9.3 0 013.24 12.3a9.3 9.3 0 019.3-9.3 9.22 9.22 0 016.31 2.45l-2.02 2.02a6.34 6.34 0 00-4.29-1.68 6.36 6.36 0 000 12.72 6.32 6.32 0 004.81-2.92h-4.81v-2.43h7.61c.14.73.18 1.48.18 2.2a9.14 9.14 0 01-2.58 6.55 9.1 9.1 0 01-7.22 2.73 9.3 9.3 0 110-18.6z"/><path d="M24 10.5h-2v-2h-1.5v2h-2v1.5h2v2h1.5v-2h2v-1.5z"/></svg>
                </a>
                <a href="#" className="social-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <ArrowUp size={24} strokeWidth={3} />
        </button>
      )}

      <style jsx>{`
        .custom-page-bg {
          background-color: #f4f7fa;
          font-family: 'DM Sans', sans-serif;
        }
        .top-banner-spacer {
          height: 60px;
        }
        .container-main {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Profile Header Card */
        .profile-header-card {
          background: #fff;
          border-radius: 12px;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .ph-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .ph-avatar-wrap {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: #C8102E; /* Solid red behind image */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ph-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #fff;
        }
        .ph-info {
          display: flex;
          flex-direction: column;
        }
        .featured-badge {
          display: inline-block;
          background: #fef2f2;
          color: #C8102E;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 20px;
          align-self: flex-start;
          margin-bottom: 8px;
        }
        .ph-name {
          font-size: 24px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 10px 0;
        }
        .ph-meta-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 14px;
        }
        .ph-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #4a5568;
          font-weight: 500;
        }
        .ph-skills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .ph-skill-chip {
          background: #f1f5f9;
          color: #475569;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 6px;
        }
        .ph-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-download-cv {
          background: #C8102E; /* Official ANN Primary Red */
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-download-cv:hover {
          background: #a00d25;
        }
        .btn-bookmark {
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #002868; /* Blue */
          width: 44px;
          height: 44px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-bookmark:hover {
          background: #f8fafc;
          border-color: #cbd5e0;
        }

        /* Layout Grid */
        .layout-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 30px;
        }

        /* Content Cards */
        .content-card {
          background: #fff;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #edf2f7;
        }
        .about-text {
          font-size: 15px;
          color: #4a5568;
          line-height: 1.7;
          margin: 0;
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .info-box {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .info-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: #f8fafc;
          color: #a0aec0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .info-content h4 {
          font-size: 15px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 4px 0;
        }
        .info-content span {
          font-size: 13px;
          color: #718096;
        }

        /* Resumes */
        .resume-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .resume-item {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          background: #fff;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          transition: border 0.2s;
        }
        .resume-item:hover {
          border-color: #cbd5e0;
        }
        .resume-icon {
          width: 40px; height: 40px;
          background: #f0f7ff; /* Blue tint */
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-right: 16px;
        }
        .resume-info {
          flex: 1;
        }
        .resume-info h4 {
          margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #2d3748;
        }
        .resume-info span {
          font-size: 12px; color: #a0aec0;
        }
        .resume-download-btn {
          background: #e0f2fe; /* Light Blue */
          color: #002868; /* ANN Dark Blue */
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          display: flex; align-items: center; gap: 6px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .resume-download-btn:hover {
          background: #bae6fd;
        }

        /* Timeline (Experience / Education) */
        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .timeline-item {
          display: flex;
          gap: 20px;
        }
        .tl-logo {
          width: 60px; height: 60px;
          border-radius: 12px;
          background: #f0f7ff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .tl-content {
          flex: 1;
          padding-bottom: 24px;
          border-bottom: 1px solid #edf2f7;
        }
        .timeline-item:last-child .tl-content {
          border-bottom: none; padding-bottom: 0;
        }
        .tl-header h4 {
          font-size: 16px; font-weight: 700; color: #2d3748; margin: 0 0 4px 0;
          display: flex; align-items: center; gap: 10px;
        }
        .tl-header h4 span {
          background: #f0f7ff; color: #002868; font-size: 11px; padding: 2px 8px; border-radius: 10px;
        }
        .tl-role {
          font-size: 14px; color: #4a5568; font-weight: 500; margin: 0 0 6px 0;
        }
        .tl-meta {
          font-size: 13px; color: #a0aec0; margin: 0 0 12px 0;
        }
        .tl-desc {
          font-size: 14px; color: #4a5568; line-height: 1.6; margin: 0;
        }

        /* NEW SECTIONS: Skills, Portfolio, Language, Related */
        .skill-chip-theme {
          background: #f0f7ff; /* Brand Blue */
          color: #002868;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 6px;
        }
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .portfolio-img {
          width: 100%;
          border-radius: 8px;
          object-fit: cover;
          height: 140px;
        }
        .language-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .language-card {
          border: 1px solid #edf2f7;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .lang-icon {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: #fef2f2;
          color: #C8102E; /* Red tint */
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px;
        }
        .lang-icon.pl2 { background: #e0f2fe; color: #002868; }
        .lang-info h4 { margin: 0; font-size: 15px; color: #2d3748; }
        .lang-info span { font-size: 13px; color: #a0aec0; }
        
        .related-list {
          display: flex; flex-direction: column; gap: 16px;
        }
        .related-item {
          display: flex; align-items: center; justify-content: space-between;
          border: 1px solid #edf2f7; padding: 16px; border-radius: 8px;
        }
        .related-img {
          width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 16px;
        }
        .related-info { flex: 1; }
        .related-info h4 { margin: 0 0 4px 0; font-size: 15px; color: #2d3748; }
        .related-info p { margin: 0; font-size: 13px; color: #718096; }
        .related-exp { width: 120px; text-align: center; }
        .exp-badge {
          background: #f0f7ff; color: #002868; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .btn-view-detail {
          background: #C8102E; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;
        }

        /* Sidebar Contact Form */
        .contact-card {
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 12px;
          padding: 24px;
        }
        .contact-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 20px 0;
        }
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .contact-input, .contact-textarea {
          width: 100%;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px 14px;
          font-size: 14px;
          color: #4a5568;
          outline: none;
          transition: border 0.2s;
        }
        .contact-input:focus, .contact-textarea:focus {
          border-color: #002868;
        }
        .contact-textarea {
          resize: vertical;
          min-height: 120px;
        }
        .btn-send-message {
          background: #002868; /* Use Blue for contact button to balance red */
          color: #fff;
          border: none;
          padding: 14px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-send-message:hover {
          background: #001a47;
        }
        
        .social-icon {
          width: 36px; height: 36px;
          border-radius: 6px;
          background: #edf2f7;
          color: #4a5568;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .social-icon:hover { background: #e2e8f0; }

        /* Massive Footer Sections */
        .footer-cta-section {
          background: #002868; /* ANN Dark Blue instead of Green */
          padding: 80px 0;
          margin-top: 40px;
        }
        .cta-heading {
          font-size: 42px; font-weight: 700; color: #fff; margin: 0 0 20px 0; line-height: 1.2;
        }
        .cta-subheading {
          font-size: 16px; color: #e2e8f0; max-width: 600px; margin: 0 auto 40px; line-height: 1.6;
        }
        .cta-buttons {
          display: flex; justify-content: center; gap: 16px;
        }
        .cta-btn-dark {
          background: #1a202c; color: #fff; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; border: none; cursor: pointer;
        }
        .cta-btn-light {
          background: #fff; color: #002868; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; border: none; cursor: pointer;
        }

        .stats-subscribe-section {
          background: #fff;
          border-bottom: 1px solid #edf2f7;
          padding: 40px 0;
        }
        .subscribe-flex {
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 40px;
        }
        .subscribe-box {
          display: flex; background: #f8fafc; border-radius: 8px; padding: 8px; flex: 1; max-width: 450px;
        }
        .sub-input {
          border: none; background: transparent; padding: 10px 16px; flex: 1; outline: none; font-size: 15px;
        }
        .sub-btn {
          background: #C8102E; color: #fff; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; cursor: pointer;
        }
        .stats-box {
          display: flex; gap: 40px;
        }
        .stat-item h3 { margin: 0; font-size: 28px; color: #1a202c; font-weight: 700; }
        .stat-item span { font-size: 14px; color: #718096; }

        .main-site-footer {
          background: #fff;
          padding: 60px 0 0 0;
        }
        .footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 60px;
        }
        .footer-logo { font-size: 24px; color: #002868; font-weight: 900; margin: 0 0 16px 0; }
        .footer-logo span { color: #C8102E; }
        .footer-address { font-size: 14px; color: #718096; line-height: 1.8; margin-bottom: 24px; }
        .footer-socials { display: flex; gap: 12px; }
        .fs-icon { width: 36px; height: 36px; border-radius: 50%; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #4a5568; }
        .footer-col h4 { font-size: 16px; font-weight: 700; color: #1a202c; margin: 0 0 24px 0; }
        .footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
        .footer-col a { color: #718096; text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .footer-col a:hover { color: #C8102E; }
        
        .footer-bottom {
          border-top: 1px solid #edf2f7;
          padding: 24px 0;
          text-align: center;
          color: #a0aec0;
          font-size: 14px;
        }

        /* Scroll To Top */
        .scroll-to-top {
          position: fixed;
          bottom: 40px;
          right: 40px;
          width: 44px;
          height: 44px;
          background-color: #C8102E; /* ANN Red */
          color: #fff;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(200, 16, 46, 0.3);
          transition: all 0.3s ease;
          z-index: 1000;
        }
        .scroll-to-top:hover {
          background-color: #a00d25;
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(200, 16, 46, 0.4);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .layout-grid { grid-template-columns: 1fr; }
          .profile-header-card { flex-direction: column; align-items: flex-start; gap: 24px; }
          .ph-right { width: 100%; justify-content: space-between; }
          .info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
