"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Search, Settings, User } from "lucide-react";
import Link from "next/link";
import NotificationDropdown from "../../../components/NotificationDropdown";
import { useAuth } from "../../../context/AuthContext";

interface AdminHeaderProps {
  user?: any;
  notifications?: any[];
}

export default function AdminHeader({ user, notifications: initialNotifications }: AdminHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>(initialNotifications || []);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const { logout } = useAuth();
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync with props
  useEffect(() => {
    if (initialNotifications) setNotifs(initialNotifications);
  }, [initialNotifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const markAsRead = async (id: string) => {
    // Optimistic Update
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'x-user-id': user?.id || '' }
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic Update
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: { 'x-user-id': user?.id || '' }
      });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotifClick = async (n: any) => {
    if (!n.isRead) markAsRead(n.id);
    
    setLoadingModal(true);
    setSelectedNotif(n);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${n.id}/detail`, {
        headers: { 'x-user-id': user?.id || '' }
      });
      
      // Safe JSON parsing
      const text = await res.text();
      const detailData = text ? JSON.parse(text) : {};
      
      if (Object.keys(detailData).length > 0) {
        setSelectedNotif({ ...n, details: detailData });
      }
    } catch (err) {
      console.error("Failed to fetch notification detail:", err);
    } finally {
      setLoadingModal(false);
    }
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const getNotifIcon = (type: string) => {
    const icons: Record<string, string> = {
      CONTACT_SUBMISSION: "📬",
      COMPANY_APPROVED: "🏥",
      JOB_APPROVED: "💼",
      NEWSLETTER: "📧",
      COMMUNITY_REPORT: "🚨",
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

  return (
    <header className="admin-top-header">
      <div className="header-left">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search data..." />
        </div>
      </div>

      <div className="header-right">
        <div className="action-icons">
          {/* Unified Notification Dropdown */}
          {user?.id && (
            <NotificationDropdown 
              userId={user.id} 
              role="admin" 
            />
          )}

          {/* Modal for Details */}
          {selectedNotif && (
            <div className="notif-modal-overlay" onClick={() => setSelectedNotif(null)}>
              <div className="notif-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="mh-left">
                    <span className="modal-icon-badge">{getNotifIcon(selectedNotif.type)}</span>
                    <h3>{selectedNotif.title}</h3>
                  </div>
                  <button className="modal-close-x" onClick={() => setSelectedNotif(null)}>×</button>
                </div>
                
                <div className="modal-body shadow-scroll">
                  {loadingModal ? (
                    <div className="modal-loader">
                      <div className="spinner"></div>
                      <p>Resolving details...</p>
                    </div>
                  ) : selectedNotif.details ? (
                    <div className="notif-detail-view anim-fade-up">
                      {/* 📬 Contact Submission Template */}
                      {selectedNotif.type === 'CONTACT_SUBMISSION' && (
                        <div className="contact-details">
                          <div className="detail-info-grid">
                            <div className="inf-card">
                              <label>Sender Full Name</label>
                              <p>{selectedNotif.details.fullName || "ANN User"}</p>
                            </div>
                            <div className="inf-card">
                              <label>Email Address</label>
                              <p>{selectedNotif.details.email || "No email"}</p>
                            </div>
                            <div className="inf-card">
                              <label>Contact Phone</label>
                              <p>{selectedNotif.details.phone || "Not provided"}</p>
                            </div>
                            <div className="inf-card">
                              <label>Subject</label>
                              <p>{selectedNotif.details.serviceType || "General Query"}</p>
                            </div>
                          </div>
                          
                          <div className="modal-msg-box">
                            <label>Detailed Message Contents</label>
                            <div className="msg-bubble">{selectedNotif.details.message}</div>
                          </div>
                          
                          <div className="modal-actions">
                            <a 
                              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedNotif.details.email}&su=Regarding: ${selectedNotif.details.serviceType}&body=Hello ${selectedNotif.details.fullName},%0D%0A%0D%0ARegarding your message: "${selectedNotif.details.message}"%0D%0A%0D%0A`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="reply-btn"
                            >
                              <MessageCircle size={16} /> Reply via Gmail
                            </a>
                          </div>
                        </div>
                      )}

                      {/* 🚨 Issue Report Template */}
                      {selectedNotif.type === 'COMMUNITY_REPORT' && (
                        <div className="report-details">
                          <div className="detail-info-grid">
                            <div className="inf-card error-themed">
                              <label>Reporting Category</label>
                              <p>{selectedNotif.details.category || "General Issue"}</p>
                            </div>
                            <div className="inf-card">
                              <label>Reporter Name</label>
                              <p>{selectedNotif.details.User_IssueReport_reportedByIdToUser?.name || 'Anonymous'}</p>
                            </div>
                            <div className="inf-card">
                              <label>Submission Date</label>
                              <p>{new Date(selectedNotif.details.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="inf-card">
                              <label>Current Status</label>
                              <span className="status-badge">{selectedNotif.details.status}</span>
                            </div>
                          </div>

                          <div className="modal-msg-box report-box">
                            <label>Report Description / Evidence</label>
                            <div className="msg-bubble report-bubble">{selectedNotif.details.message}</div>
                          </div>

                          <div className="modal-actions">
                            <Link href="/admin/reports" className="view-btn" onClick={() => setSelectedNotif(null)}>
                              Manage Full Reports Panel →
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* 🏥 Company Registration Template */}
                      {selectedNotif.type === 'COMPANY_APPROVED' && (
                        <div className="company-details">
                          <div className="detail-info-grid">
                            <div className="inf-card company-themed">
                              <label>Company Name</label>
                              <p>{selectedNotif.details.name}</p>
                            </div>
                            <div className="inf-card">
                              <label>Primary Owner</label>
                              <p>{selectedNotif.details.User?.name || 'New Employer'}</p>
                            </div>
                            <div className="inf-card">
                              <label>Login Email</label>
                              <p>{selectedNotif.details.User?.email}</p>
                            </div>
                          </div>
                          
                          <div className="modal-notice">
                            <strong>Review Required:</strong> This company profile has been submitted and is currently hidden from the public directory until you approve it.
                          </div>

                          <div className="modal-actions">
                            <Link href="/admin/companies" className="view-btn company-btn" onClick={() => setSelectedNotif(null)}>
                              Review & Audit Company →
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Fallback for other types */}
                      {!['CONTACT_SUBMISSION', 'COMMUNITY_REPORT', 'COMPANY_APPROVED'].includes(selectedNotif.type) && (
                        <div className="generic-details">
                           <div className="modal-msg-box">
                            <label>Notification Summary</label>
                            <div className="msg-bubble">{selectedNotif.message}</div>
                          </div>
                          <div className="modal-actions center">
                            <p className="no-meta-info">Full record resolution is not available for this alert type.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="generic-details anim-fade-up">
                      <div className="modal-msg-box">
                        <label>Message Content</label>
                        <div className="msg-bubble">{selectedNotif.message}</div>
                      </div>
                      <div className="modal-actions center">
                        <p className="no-meta-info">These details are from an earlier system version. Please check the relevant dashboard panel for the full history.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Link href="/admin/settings" className="icon-btn-circle header-settings">
            <Settings size={20} color="#64748b" />
          </Link>

          <div className="profile-dropdown-wrap" ref={profileRef}>
            <div className="admin-user-pill" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}>
              <div className="user-icon-circle">
                  <User size={18} color="#002868" />
              </div>
              <span className="admin-name-short">{user?.name?.split(' ')[0] || "Admin"}</span>
            </div>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="pd-header">
                  <p className="pd-name">{user?.name || "Qamer Hassan"}</p>
                  <p className="pd-role">{user?.role || "Super Admin"}</p>
                </div>
                <div className="pd-menu">
                  <Link href="/admin/settings" className="pd-item" onClick={() => setProfileOpen(false)}>
                    <Settings size={16} />
                    <span>Admin Settings</span>
                  </Link>
                  <button className="pd-item logout" onClick={handleLogout}>
                    <User size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-top-header {
          height: 80px;
          background: #fff;
          border-bottom: 1px solid #edf2f7;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          position: sticky;
          top: 0;
          z-index: 1100;
        }
        .search-box {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border-radius: 12px;
          padding: 0 16px;
          width: 280px;
          height: 48px;
          border: 1px solid #f1f5f9;
        }
        .search-icon { color: #94a3b8; margin-right: 12px; }
        .search-box input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #1e293b;
          width: 100%;
          font-weight: 500;
        }
        .header-right {
          display: flex;
          align-items: center;
        }
        .action-icons {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .notif-wrap {
          position: relative;
        }
        .icon-btn-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid #f8fafc;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .icon-btn-circle:hover {
          border-color: #e2e8f0;
          background: #e2e8f0;
        }
        .notif-badge {
          position: absolute;
          top: 0;
          right: 0;
          width: 12px;
          height: 12px;
          background: #C8102E;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .notif-dropdown, .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          border: 1px solid #edf2f7;
          overflow: hidden;
          animation: dropIn 0.2s ease;
          z-index: 1200;
        }
        .notif-dropdown { width: 340px; }
        .profile-dropdown { width: 240px; }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-title, .pd-header {
          padding: 16px 20px;
          background: #002868;
          color: #fff;
        }
        .notif-title { font-weight: 700; font-size: 15px; }
        
        .notif-header-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: #002868;
          color: #fff;
        }
        .mark-all-btn {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .mark-all-btn:hover { background: rgba(255,255,255,0.25); }

        .pd-header { text-align: center; border-bottom: 1px solid #001a45; }
        .pd-name { font-size: 15px; font-weight: 700; margin: 0; }
        .pd-role { font-size: 11px; text-transform: uppercase; font-weight: 600; opacity: 0.8; margin: 4px 0 0 0; }

        .notif-items {
          max-height: 400px;
          overflow-y: auto;
        }
        .notif-item {
          display: flex;
          gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }
        .notif-item:hover { background: #f8fafc; }
        .notif-item.unread { background: #f0f7ff; }
        .notif-item.unread:hover { background: #e6f1ff; }
        
        .unread-dot {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }

        .notif-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }
        .notif-modal {
          background: #fff;
          width: 100%;
          max-width: 650px;
          border-radius: 24px;
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .modal-header {
          padding: 24px 32px;
          background: #002868;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        .mh-left { display: flex; align-items: center; gap: 16px; }
        .modal-icon-badge {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .modal-header h3 { margin: 0; font-size: 19px; font-weight: 800; letter-spacing: -0.02em; }
        .modal-close-x {
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .modal-close-x:hover { background: rgba(255,255,255,0.2); transform: rotate(90deg); }

        .modal-body { 
          padding: 32px; 
          max-height: 70vh; 
          overflow-y: auto; 
          background: #fcfdfe;
        }
        .shadow-scroll::-webkit-scrollbar { width: 6px; }
        .shadow-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .shadow-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        /* Detail Grid */
        .detail-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .inf-card {
          background: #fff;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid #edf2f7;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .inf-card label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 6px;
          letter-spacing: 0.05em;
        }
        .inf-card p {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }
        .inf-card.error-themed { background: #fffcfc; border-color: #fee2e2; }
        .inf-card.error-themed p { color: #C8102E; }
        .inf-card.company-themed { background: #f0f7ff; border-color: #dbeafe; }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .modal-msg-box {
          margin-top: 24px;
        }
        .modal-msg-box label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 10px;
          padding-left: 4px;
        }
        .msg-bubble {
          background: #fff;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          font-size: 14.5px;
          line-height: 1.6;
          color: #334155;
          white-space: pre-wrap;
          font-style: italic;
        }
        .msg-bubble.report-bubble {
          border-left: 4px solid #C8102E;
          background: #fffafa;
        }

        .modal-notice {
          padding: 16px 20px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 12px;
          color: #92400e;
          font-size: 13px;
          line-height: 1.5;
        }

        .modal-actions {
          margin-top: 32px;
          display: flex;
          gap: 16px;
        }
        .modal-actions.center { justify-content: center; }
        .reply-btn, .view-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }
        .reply-btn { background: #C8102E; color: #fff; border: none; }
        .reply-btn:hover { background: #a50d26; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(200,16,46,0.2); }
        .view-btn { background: #f1f5f9; color: #002868; }
        .view-btn:hover { background: #e2e8f0; color: #002868; }
        .view-btn.company-btn { background: #002868; color: #fff; }
        .view-btn.company-btn:hover { background: #001a45; }

        .no-meta-info { color: #94a3b8; font-size: 13px; font-weight: 500; }

        /* Animations */
        .anim-fade-up {
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Loader */
        .modal-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          color: #64748b;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f1f5f9;
          border-top-color: #002868;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) {
          .detail-info-grid { grid-template-columns: 1fr; }
          .modal-actions { flex-direction: column; }
        }
        .ni-icon { font-size: 20px; flex-shrink: 0; }
        .ni-msg { font-size: 13.5px; color: #334155; margin: 0; font-weight: 600; line-height: 1.4; }
        .ni-time { font-size: 11px; color: #94a3b8; margin-top: 4px; display: block; }
        .notif-view-all {
          display: block;
          text-align: center;
          padding: 14px;
          background: #f8fafc;
          color: #002868;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
        }

        .pd-menu { padding: 8px 0; }
        .pd-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          text-decoration: none;
          color: #475569;
          font-size: 14px;
          font-weight: 600;
          border-left: 3px solid transparent;
          transition: all 0.15s;
          width: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }
        .pd-item:hover { background: #f1f5f9; color: #002868; border-left-color: #002868; }
        .pd-item.logout:hover { color: #C8102E; border-left-color: #C8102E; }

        .profile-dropdown-wrap { position: relative; }
        .admin-user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f1f5f9;
          padding: 6px 16px 6px 6px;
          border-radius: 30px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-user-pill:hover { background: #e2e8f0; }

        .user-icon-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
        }
        .admin-name-short { font-size: 14px; font-weight: 700; color: #002868; }

        @media (max-width: 950px) {
          .admin-top-header { padding: 0 20px; }
          .search-box { display: none; }
          .admin-name-short { display: none; }
          .admin-user-pill { padding: 6px; }
        }
      `}</style>
    </header>
  );
}
