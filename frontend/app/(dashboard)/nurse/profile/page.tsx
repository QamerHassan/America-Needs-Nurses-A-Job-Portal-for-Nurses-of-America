"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../layout";
import { updateNurseProfile, uploadAvatar } from "../../../utils/api";
import { 
  MapPin, 
  Mail, 
  Briefcase, 
  Phone, 
  DollarSign, 
  Clock,
  CheckCircle,
  FileText,
  Image as ImageIcon
} from "lucide-react";

export default function NurseProfilePage() {
  const { data, loading, refresh } = useDashboard();
  const user = data?.user;

  // Real-time completeness calculation
  const hasEmail = !!user?.email;
  const hasAvatar = !!user?.image;
  const hasResume = !!user?.NurseProfile?.resumeUrl || (Array.isArray(user?.NurseProfile?.documents) && user.NurseProfile.documents.length > 0);
  
  let progress = 70; // Base profile info
  if (hasEmail) progress += 10;
  if (hasResume) progress += 10;
  if (hasAvatar) progress += 10;
  if (progress > 100) progress = 100;

  const circumference = 339.292;
  const offset = circumference - (circumference * progress) / 100;

  const handleCompleteProfileClick = () => {
    if (!hasAvatar) {
      document.getElementById("avatarUpload")?.click();
    } else if (!hasResume) {
      window.location.href = "/nurse/resumes";
    }
  };


  const [fullName, setFullName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  
  // New dynamic fields
  const [age, setAge] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [country, setCountry] = useState("usa");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [googlePlus, setGooglePlus] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || user.NurseProfile?.fullName || "");
      setSpecialization(user.NurseProfile?.specialization || "");
      setBio(user.NurseProfile?.bio || "");
      setPhone(user.NurseProfile?.phone || "");
      setLocation(user.NurseProfile?.location || "");
      
      // Load new dynamic fields
      setAge(user.NurseProfile?.age?.toString() || "");
      setYearsOfExperience(user.NurseProfile?.yearsOfExperience?.toString() || "");
      setLanguages(user.NurseProfile?.languages || "");
      setAddress(user.NurseProfile?.address || "");
      setAddressLine2(user.NurseProfile?.addressLine2 || "");
      setCountry(user.NurseProfile?.country || "usa");
      setState(user.NurseProfile?.state || "");
      setZipCode(user.NurseProfile?.zipCode || "");
      setLatitude(user.NurseProfile?.latitude?.toString() || "");
      setLongitude(user.NurseProfile?.longitude?.toString() || "");
      setTwitter(user.NurseProfile?.twitter || "");
      setInstagram(user.NurseProfile?.instagram || "");
      setLinkedin(user.NurseProfile?.linkedin || "");
      setGooglePlus(user.NurseProfile?.googlePlus || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      await updateNurseProfile(user.id, {
        fullName,
        specialization,
        bio,
        phone,
        location,
        age: age ? parseInt(age) : null,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : 0,
        languages,
        address,
        addressLine2,
        country,
        state,
        zipCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        twitter,
        instagram,
        linkedin,
        googlePlus
      });
      alert("Profile Saved Successfully!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Error saving profile. Please ensure the backend is running.");
    } finally {
      setIsSaving(false);
    }
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
      try {
        setIsUploadingAvatar(true);
        const file = e.target.files[0];
        await uploadAvatar(user.id, file);
        alert("Avatar uploaded successfully!");
        if (refresh) refresh(); 
      } catch (err) {
        console.error("Failed to upload avatar:", err);
        alert("Error: Missing backend functionality or unexpected failure.");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading Profile...</div>;
  }

  return (
    <div className="profile-page-content">
      <div className="content-header">
        <h1 className="page-title">Candidate Profile</h1>
        <div className="breadcrumbs">
          <span>Candidate</span> / <span>Dashboard</span> / <span className="active">Candidate Profile</span>
        </div>
      </div>

      <div className="main-grid">
        {/* Left main content area */}
        <div className="main-column">
          {/* Profile Overview Card */}
          <div className="card-panel profile-overview-card">
            <div className="overview-header">
              <div className="flex flex-col items-center gap-6 shrink-0">
                <div className="avatar-progress-wrap">
                  <svg className="progress-ring" width="120" height="120">
                    <circle className="progress-ring-circle bg" stroke="#edf2f7" strokeWidth="6" fill="transparent" r="54" cx="60" cy="60" />
                    <circle 
                      className="progress-ring-circle val" 
                      stroke="#C8102E" 
                      strokeWidth="6" 
                      fill="transparent" 
                      r="54" 
                      cx="60" 
                      cy="60" 
                      style={{ 
                        strokeDasharray: circumference, 
                        strokeDashoffset: offset,
                        transition: "stroke-dashoffset 0.5s ease-in-out" 
                      }} 
                    /> 
                  </svg>
                  <img 
                    src={user?.image || `https://ui-avatars.com/api/?name=${user?.name || user?.NurseProfile?.fullName || 'User'}&background=C8102E&color=fff`} 
                    alt="Profile" 
                    className="overview-avatar" 
                  />
                  <div className="progress-label">{progress}%</div>
                </div>

                <div className="profile-upload-btn-wrap">
                  <input type="file" id="avatarUpload" accept="image/*" style={{display: 'none'}} onChange={handleAvatarSelect} />
                  <button 
                    className="btn-change-profile"
                    onClick={() => document.getElementById('avatarUpload')?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? "Uploading..." : "Change Profile"}
                  </button>
                </div>
              </div>
              
              <div className="overview-info">
                <div className="name-update-row">
                  <h2 className="profile-name">{user?.name || user?.NurseProfile?.fullName || "New User"}</h2>
                  <span className="last-update">Last Update: Just now</span>
                </div>
                <p className="profile-title">{user?.NurseProfile?.specialization || "Professional Nurse"} {user?.NurseProfile?.company ? `@${user.NurseProfile.company}` : ""}</p>
                <p className="profile-bio">
                  {user?.NurseProfile?.bio || "Please add a professional bio to complete your profile."}
                </p>
                
                <div className="skills-row">
                  {(user?.NurseProfile?.skills || []).length > 0 ? (
                    user.NurseProfile.skills.map((skill: string) => (
                      <span key={skill} className="skill-chip">{skill}</span>
                    ))
                  ) : (
                    <span className="skill-chip">No Skills Added</span>
                  )}
                </div>

                <div className="info-grid">
                  <div className="info-item"><MapPin size={16} /> {user?.NurseProfile?.state || "State"}, {user?.NurseProfile?.country || "USA"}</div>
                  <div className="info-item"><Mail size={16} /> {user?.email || "Email"} <span className="text-red-500 text-xs font-bold ml-1">Verify</span></div>
                  <div className="info-item"><Briefcase size={16} /> {user?.NurseProfile?.yearsOfExperience || "0"} Years</div>
                  <div className="info-item"><Phone size={16} /> {user?.NurseProfile?.phone || "Phone"} <CheckCircle size={14} className="text-[#002868] ml-1" /></div>
                  <div className="info-item"><DollarSign size={16} /> {user?.NurseProfile?.minPay || "0"}/{user?.NurseProfile?.payPeriod || "yr"}</div>
                  <div className="info-item"><Clock size={16} /> Complete Your Profile</div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Detail Form */}
          <div className="card-panel form-card">
            <h3 className="section-title">Basic Detail</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" className="form-control" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" className="form-control" value={specialization} onChange={e => setSpecialization(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" className="form-control" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 28" />
              </div>
              <div className="form-group">
                <label>Experience (Years)</label>
                <input type="number" className="form-control" value={yearsOfExperience} onChange={e => setYearsOfExperience(e.target.value)} placeholder="e.g. 5" />
              </div>
              <div className="form-group full-width">
                <label>Languages</label>
                <input type="text" className="form-control" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="English, Spanish" />
              </div>
              <div className="form-group full-width">
                <label>About Info</label>
                <textarea className="form-control" rows={4} value={bio} onChange={e => setBio(e.target.value)}></textarea>
              </div>
            </div>
          </div>

          {/* Contact Detail Form */}
          <div className="card-panel form-card">
            <h3 className="section-title">Contact Detail</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Your Email</label>
                <input type="email" className="form-control" value={user?.email || ""} readOnly />
              </div>
              <div className="form-group">
                <label>Phone no.</label>
                <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Address 1</label>
                <input type="text" className="form-control" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Nursing Lane" />
              </div>
              <div className="form-group">
                <label>Address 2</label>
                <input type="text" className="form-control" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Apt 4B" />
              </div>
              <div className="form-group">
                <label>Country</label>
                <select className="form-control" value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="usa">United States</option>
                  <option value="canada">Canada</option>
                </select>
              </div>
              <div className="form-group">
                <label>State/City</label>
                <input type="text" className="form-control" value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Louisiana / New Orleans" />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" className="form-control" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="70112" />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input type="text" className="form-control" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="29.9511" />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input type="text" className="form-control" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="-90.0715" />
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
              <div className="form-group">
                <label>Google Plus</label>
                <input type="url" className="form-control" value={googlePlus} onChange={e => setGooglePlus(e.target.value)} placeholder="https://plus.google.com/..." />
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
          {progress < 100 && (
            <div className="card-panel complete-profile-card">
              <div className="task-list">
                <div className={`task-item ${hasEmail ? 'opacity-50' : ''}`}>
                  <div className="task-icon"><Mail size={20} /></div>
                  <div className="task-text">Verify Email</div>
                  <div className="task-score">{hasEmail ? <CheckCircle size={16} className="text-[#002868]" /> : "+ 10%"}</div>
                </div>
                <div className={`task-item ${hasResume ? 'opacity-50' : ''}`}>
                  <div className="task-icon"><FileText size={20} /></div>
                  <div className="task-text">Upload Your Resume</div>
                  <div className="task-score">{hasResume ? <CheckCircle size={16} className="text-[#002868]" /> : "+ 10%"}</div>
                </div>
                <div className={`task-item ${hasAvatar ? 'opacity-50' : ''}`}>
                  <div className="task-icon"><ImageIcon size={20} /></div>
                  <div className="task-text">Upload Profile Image</div>
                  <div className="task-score">{hasAvatar ? <CheckCircle size={16} className="text-[#002868]" /> : "+ 10%"}</div>
                </div>
              </div>
              <button onClick={handleCompleteProfileClick} className="btn-primary w-full mt-6 transition-all hover:bg-[#001a47]">Complete Your Profile</button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-page-content {
          max-width: 1400px;
          margin: 0 auto;
        }
        .content-header {
          margin-bottom: 32px;
        }
        .page-title {
          font-size: 28px;
          margin-bottom: 8px;
          color: #002868;
        }
        .breadcrumbs {
          font-size: 14px;
          color: #718096;
        }
        .breadcrumbs span.active {
          color: #002868;
          font-weight: 600;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }

        .card-panel {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #edf2f7;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          overflow: hidden;
          margin-bottom: 24px;
        }

        /* Profile Overview */
        .profile-overview-card {
          padding: 30px;
        }
        .overview-header {
          display: flex;
          gap: 30px;
        }
        .avatar-progress-wrap {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }
        .progress-ring {
          position: absolute;
          top: 0;
          left: 0;
          transform: rotate(-90deg);
        }
        .overview-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          position: absolute;
          top: 12px;
          left: 12px;
        }
        .progress-label {
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          color: #C8102E;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #edf2f7;
        }

        .overview-info {
          flex: 1;
        }
        .name-update-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .profile-name {
          font-size: 22px;
          font-weight: 800;
          color: #002868;
          margin: 0;
        }
        .last-update {
          font-size: 12px;
          color: #a0aec0;
        }
        .profile-title {
          font-size: 14px;
          color: #4a5568;
          font-weight: 500;
          margin: 0 0 16px 0;
        }
        .profile-title span {
          color: #C8102E;
        }
        .profile-bio {
          font-size: 14px;
          color: #718096;
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        .skills-row {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .skill-chip {
          padding: 4px 12px;
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #4a5568;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #4a5568;
        }
        .info-item :global(svg) {
          color: #a0aec0;
        }

        .overview-footer {
          margin-top: -10px;
          display: flex;
        }
        .btn-change-profile {
          background: #fdf2f2;
          color: #C8102E;
          border: 1px solid #fee2e2;
          padding: 8px 18px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-change-profile:hover {
          background: #C8102E;
          color: #fff;
        }

        /* Complete Profile Card */
        .complete-profile-card {
          background: #fffcf8;
          border: 1px solid #ffedd5;
          padding: 24px;
        }
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .task-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #fff3e0;
        }
        .task-icon {
          width: 36px;
          height: 36px;
          background: #f0f7ff;
          color: #002868;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .task-text {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
        }
        .task-score {
          font-size: 12px;
          font-weight: 700;
          color: #2d3748;
          padding: 4px 8px;
          border: 1px solid #edf2f7;
          border-radius: 4px;
        }
        .btn-primary {
          background: #C8102E;
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #a00d25;
        }

        /* Form Styles */
        .form-card {
          padding: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #002868;
          margin: 0 0 24px 0;
          padding-bottom: 16px;
          border-bottom: 1px solid #edf2f7;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 24px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #4a5568;
        }
        .form-control {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          color: #2d3748;
          transition: border-color 0.2s, box-shadow 0.2s;
          background-color: #f8fafc;
        }
        .form-control:focus {
          outline: none;
          border-color: #002868;
          box-shadow: 0 0 0 3px rgba(0, 40, 104, 0.1);
          background-color: #fff;
        }
        select.form-control {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 40px;
        }
        textarea.form-control {
          resize: vertical;
          min-height: 100px;
        }

        @media (max-width: 1100px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
          .overview-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .name-update-row {
            flex-direction: column;
            gap: 8px;
          }
          .skills-row {
            justify-content: center;
          }
          .info-grid {
            text-align: left;
          }
          .overview-footer {
            margin-top: 20px;
            justify-content: center;
          }
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
