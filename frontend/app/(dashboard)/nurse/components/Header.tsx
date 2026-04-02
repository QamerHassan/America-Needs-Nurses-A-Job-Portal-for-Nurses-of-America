"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, MessageSquare, ChevronDown, Plus, LayoutDashboard, User, FileText, Bookmark, Lock, Trash2, LogOut, UploadCloud, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uploadResume } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";

export default function DashboardHeader({ 
  user, 
  stats, 
  notifications,
  isAdmin = false
}: { 
  user?: any; 
  stats?: any; 
  notifications?: any[];
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { logout } = useAuth();
  
  // Upload State
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [skills, setSkills] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifCount = notifications?.length || 0;
  const msgCount = stats?.applicationsCount || 0;

  const getNotifIcon = (type: string) => {
    const icons: Record<string, string> = {
      APPLICATION_UPDATE: "📋",
      NEW_MESSAGE: "💬",
      JOB_APPROVED: "✅",
      JOB_EXPIRED: "⏰",
      COMPANY_APPROVED: "🏥",
      NEWSLETTER: "📧",
    };
    return icons[type] || "🔔";
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setUploadError("Only PDF, Word, PNG, and JPEG files are allowed.");
      setSelectedFile(null);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File must be smaller than 50MB.");
      setSelectedFile(null);
      return;
    }
    setUploadError("");
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !user) return;
    try {
      setIsUploading(true);
      setUploadError("");
      await uploadResume(user.id, selectedFile);
      // Optional: If skills tracking is needed, we could hit another endpoint here
      setUploadModalOpen(false);
      setSelectedFile(null);
      setSkills("");
      router.push("/nurse/resumes"); // Redirect to resumes page to see the new file
    } catch (err: any) {
      console.error("Upload failed", err);
      setUploadError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <header className="dashboard-header">
      {!isAdmin && (
        <div className="header-search">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search for jobs, companies..." className="search-input" />
        </div>
      )}

      <div className="header-actions">
        <div className="action-icons">
          {/* Notifications / Messages Icon */}
          {!isAdmin && (
            <div className="header-circle-btn" ref={notifRef} onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
              <MessageCircle size={20} color="#4b5563" fill="none" strokeWidth={2} />
              {notifCount > 0 && <span className="icon-badge pink"></span>}

              {notifOpen && (
                <div className="dropdown-panel notif-panel">
                  <div className="dropdown-header-title">Notifications</div>
                  <div className="notif-list">
                    {(!notifications || notifications.length === 0) ? (
                      <div className="notif-empty">No new notifications</div>
                    ) : (
                      notifications.slice(0, 5).map((n: any) => (
                        <div key={n.id} className="notif-item">
                          <span className="notif-icon">{getNotifIcon(n.type)}</span>
                          <div className="notif-body">
                            <p className="notif-msg">{n.message || n.type}</p>
                            <span className="notif-time">{getTimeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/nurse/alerts" className="notif-view-all" onClick={() => setNotifOpen(false)}>
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="user-dropdown-wrap" ref={profileRef}>
            <div className="header-circle-btn p-1" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}>
              {user?.image || user?.NurseProfile?.profilePicture ? (
                <img
                  src={user?.image || user?.NurseProfile?.profilePicture}
                  alt="User"
                  className="header-avatar"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-50 rounded-full">
                  <User size={20} />
                </div>
              )}
            </div>

          {profileOpen && (
            <div className="dropdown-panel profile-panel">
              <div className="profile-panel-top">
                <span className="profile-hi">Hi, {(user?.name || user?.NurseProfile?.fullName || "User").split(" ")[0]}</span>
                <button className="btn-logout" onClick={() => { logout(); router.push("/"); setProfileOpen(false); }}>
                  <LogOut size={14} /> Logout
                </button>
              </div>

              <div className="profile-menu">
                {[
                  { href: "/nurse", icon: <LayoutDashboard size={16}/>, label: "Dashboard", badge: stats?.applicationsCount },
                  { href: "/nurse/profile", icon: <User size={16}/>, label: "My Profile" },
                  { href: "/nurse/resumes", icon: <FileText size={16}/>, label: "My Resume" },
                  { href: "/nurse/shortlisted", icon: <Bookmark size={16}/>, label: "Shortlisted Jobs", badge: stats?.savedJobsCount },
                  { href: "/nurse/messages", icon: <MessageSquare size={16}/>, label: "Messages", badge: msgCount > 0 ? msgCount : null },
                  { href: "/nurse/password", icon: <Lock size={16}/>, label: "Change Password" },
                  { href: "/nurse/delete", icon: <Trash2 size={16}/>, label: "Delete Account", danger: true },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`profile-menu-item${item.danger ? " danger" : ""}`}
                    onClick={() => setProfileOpen(false)}
                  >
                    <span className="pm-icon">{item.icon}</span>
                    <span className="pm-label">{item.label}</span>
                    {item.badge ? <span className="pm-badge">{item.badge}</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>

        {!isAdmin && (
          <button className="btn-upload-resume" onClick={() => setUploadModalOpen(true)}>
            <Plus size={16} />
            <span>Upload Resume</span>
          </button>
        )}
      </div>

      {/* Upload Modal Overlay */}
      {uploadModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget && !isUploading) setUploadModalOpen(false);
        }}>
          <div className="upload-modal">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Upload Files</h2>
                <p className="modal-subtitle">Select and upload the files of your choice</p>
              </div>
              <button 
                className="btn-close-modal" 
                onClick={() => setUploadModalOpen(false)}
                disabled={isUploading}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div 
                className={`drag-drop-zone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                />
                
                {selectedFile ? (
                  <div className="selected-file-view">
                    <FileText size={40} className="text-blue-600 mb-2" />
                    <span className="file-name-preview">{selectedFile.name}</span>
                    <span className="file-size-preview">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button 
                      className="btn-remove-selected" 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      disabled={isUploading}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon-circle">
                      <UploadCloud size={24} color="#002868" />
                    </div>
                    <p className="drag-text">Drag & Drop your resume here or click to upload</p>
                    <p className="drag-subtext">JPEG, PNG, PDF, and DOC Format, up to 5MB</p>
                  </>
                )}
              </div>

              {uploadError && <p className="upload-error-text">{uploadError}</p>}

              <div className="skills-section">
                <label className="skills-label">Highlight Your Skills</label>
                <textarea 
                  className="skills-textarea" 
                  placeholder="Write a few key skills..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  disabled={isUploading}
                ></textarea>
                
                <div className="suggested-skills">
                  {["ICU/Critical Care", "ER/Trauma", "Pediatrics", "Oncology", "Telemetry", "NICU", "BLS/ACLS", "Med-Surg"].map(skill => (
                    <span 
                      key={skill} 
                      className="skill-pill"
                      onClick={() => !isUploading && setSkills(prev => prev ? prev + ', ' + skill : skill)}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-save-draft" 
                onClick={() => setUploadModalOpen(false)}
                disabled={isUploading}
              >
                Close
              </button>
              <button 
                className="btn-upload-now" 
                onClick={handleUploadSubmit}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                   <><span className="spinner-small"></span> Uploading...</>
                ) : 'Upload Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard-header {
          height: 80px;
          background: #fff;
          border-bottom: 1px solid #edf2f7;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          position: sticky;
          top: 0;
          z-index: 900;
        }
        .header-search {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 10px;
          padding: 0 16px;
          width: 380px;
          height: 44px;
        }
        .search-icon { color: #a0aec0; margin-right: 12px; }
        .search-input {
          background: transparent;
          border: none;
          font-size: 14px;
          color: #2d3748;
          width: 100%;
          outline: none;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .action-icons {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .header-circle-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 4px solid #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .header-circle-btn:hover {
          border-color: #e2e8f0;
          background: #e2e8f0;
        }
        .header-circle-btn.p-0 {
          padding: 0;
          overflow: hidden;
        }
        .icon-badge {
          position: absolute;
          top: 0;
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .icon-badge.pink { background: #ef4444; }

        /* Dropdown shared */
        .dropdown-panel {
          position: absolute;
          top: calc(100% + 16px);
          right: 0;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.14);
          z-index: 9999;
          min-width: 280px;
          border: 1px solid #edf2f7;
          overflow: hidden;
          animation: dropIn 0.18s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dropdown-header-title {
          background: #002868;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          padding: 16px 20px;
        }

        /* Notifications */
        .notif-panel { min-width: 320px; }
        .notif-list { max-height: 300px; overflow-y: auto; }
        .notif-empty { padding: 20px; text-align: center; color: #a0aec0; font-size: 13px; }
        .notif-item {
          display: flex;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid #f0f4f8;
          transition: background 0.15s;
          cursor: pointer;
        }
        .notif-item:hover { background: #f8fafc; }
        .notif-icon { font-size: 22px; flex-shrink: 0; }
        .notif-body { display: flex; flex-direction: column; gap: 4px; }
        .notif-msg { font-size: 13px; color: #2d3748; margin: 0; line-height: 1.4; }
        .notif-time { font-size: 11px; color: #a0aec0; }
        .notif-view-all {
          display: block;
          text-align: center;
          padding: 14px;
          font-size: 13px;
          font-weight: 600;
          color: #002868;
          text-decoration: none;
          border-top: 1px solid #edf2f7;
          transition: background 0.15s;
        }
        .notif-view-all:hover { background: #f8fafc; color: #C8102E; }

        /* Profile dropdown */
        .user-dropdown-wrap { position: relative; }
        .header-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .header-user-name { font-size: 14px; font-weight: 600; color: #2d3748; }

        .profile-panel { min-width: 300px; }
        .profile-panel-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #002868;
        }
        .profile-hi { color: #fff; font-size: 16px; font-weight: 700; }
        .btn-logout {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          color: #002868;
          border: none;
          padding: 7px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-logout:hover { background: #C8102E; color: #fff; }

        .profile-menu { padding: 8px 0; }
        .profile-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          font-size: 14px;
          color: #4a5568;
          text-decoration: none;
          transition: all 0.15s;
          border-left: 3px solid transparent;
        }
        .profile-menu-item:hover {
          background: #f0f7ff;
          color: #002868;
          border-left-color: #002868;
        }
        .profile-menu-item.danger { color: #ef4444; }
        .profile-menu-item.danger:hover { background: #fee2e2; border-left-color: #ef4444; color: #ef4444; }
        .pm-icon { color: inherit; flex-shrink: 0; }
        .pm-label { flex: 1; font-weight: 500; }
        .pm-badge {
          background: #C8102E;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
        }

        .btn-upload-resume {
          background: #002868; 
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .btn-upload-resume:hover { background: #001a45; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .upload-modal {
          background: #fff;
          width: 100%;
          max-width: 550px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 30px 16px;
        }
        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 4px 0;
        }
        .modal-subtitle {
          font-size: 14px;
          color: #718096;
          margin: 0;
        }
        .btn-close-modal {
          background: #f8fafc;
          border: none;
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a5568;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-close-modal:hover { background: #edf2f7; color: #1a202c; }

        .modal-body {
          padding: 0 30px;
        }
        .drag-drop-zone {
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
        }
        .drag-drop-zone:hover, .drag-drop-zone.drag-over {
          border-color: #002868;
          background: #f0f7ff;
        }
        .drag-drop-zone.has-file {
          border-style: solid;
          background: #fff;
          cursor: default;
        }
        .upload-icon-circle {
          width: 48px; height: 48px;
          border: 2px solid #002868;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .drag-text {
          font-size: 15px;
          font-weight: 600;
          color: #002868;
          margin: 0 0 8px 0;
        }
        .drag-subtext {
          font-size: 12px;
          color: #a0aec0;
          margin: 0;
        }
        .selected-file-view {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .file-name-preview { font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 4px;}
        .file-size-preview { font-size: 12px; color: #718096; margin-bottom: 12px; }
        .btn-remove-selected {
          background: #fee2e2; color: #ef4444; border: none; padding: 6px 16px; border-radius: 6px;
          font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s;
        }
        .btn-remove-selected:hover { background: #fecaca; }

        .upload-error-text {
          color: #ef4444; font-size: 13px; margin: 8px 0 0 0; text-align: center;
        }

        .skills-section {
          margin-top: 24px;
        }
        .skills-label {
          display: block; font-size: 14px; font-weight: 600; color: #2d3748; margin-bottom: 8px;
        }
        .skills-textarea {
          width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;
          font-size: 14px; color: #4a5568; outline: none; transition: border 0.2s;
          resize: vertical; min-height: 80px;
        }
        .skills-textarea:focus { border-color: #002868; }
        .suggested-skills {
          display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;
        }
        .skill-pill {
          background: #f0f7ff; color: #002868; padding: 6px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s;
          border: 1px solid #e2efff;
        }
        .skill-pill:hover { background: #e2efff; }

        .modal-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 30px;
          border-top: 1px solid #edf2f7;
          margin-top: 24px;
        }
        .btn-save-draft {
          background: #fff; border: 1px solid #e2e8f0; color: #4a5568;
          padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-save-draft:hover { background: #f8fafc; border-color: #cbd5e0; color: #2d3748; }
        .btn-upload-now {
          background: #002868; border: none; color: #fff;
          padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;
          cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 8px;
        }
        .btn-upload-now:hover:not(:disabled) { background: #001a45; }
        .btn-upload-now:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner-small {
          width: 14px; height: 14px; border: 2px solid #fff; border-top-color: transparent;
          border-radius: 50%; display: inline-block; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .header-search { display: none; }
          .dashboard-header { padding: 0 20px; }
          .btn-upload-resume span { display: none; }
        }
      `}</style>
    </header>
  );
}
