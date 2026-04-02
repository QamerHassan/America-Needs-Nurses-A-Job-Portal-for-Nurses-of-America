"use client";

import React, { useState } from "react";
import { useAdminDashboard } from "../layout";
import { changePassword } from "../../../utils/api";
import { User, Lock, ShieldCheck, Mail, Save } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

export default function AdminSettingsPage() {
  const { data } = useAdminDashboard();
  const user = data?.user;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters long", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      await changePassword(user.id, newPassword);
      setMessage({ text: "Password updated successfully!", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Failed to update password:", error);
      setMessage({ text: "Failed to update password. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="title">Account Settings</h1>
        <p className="subtitle">Manage your administrator profile and security preferences</p>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card">
          <div className="card-header">
            <User size={20} className="header-icon" />
            <h2>Profile Information</h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <div className="info-label">Full Name</div>
              <div className="info-value">{user?.name || "Qamer Hassan"}</div>
            </div>
            <div className="info-row">
                <div className="info-label">Email Address</div>
                <div className="info-value">{user?.email || "qamerhassan455@gmail.com"}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Access Role</div>
              <div className="info-value role-badge">
                <ShieldCheck size={14} />
                {user?.role || "SUPER_ADMIN"}
              </div>
            </div>
            <p className="info-note">Contact the system developer to modify core profile details.</p>
          </div>
        </div>

        {/* Password Card */}
        <div className="settings-card">
          <div className="card-header">
            <Lock size={20} className="header-icon" />
            <h2>Security & Password</h2>
          </div>
          <form className="card-body" onSubmit={handlePasswordSubmit}>
            {message.text && (
              <div className={`status-msg ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="input-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <PasswordInput 
                   placeholder="Minimum 6 characters" 
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   required
                   style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <PasswordInput 
                   placeholder="Repeat new password" 
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   required
                   style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <button type="submit" className="save-btn" disabled={loading}>
              <Save size={18} />
              {loading ? "Saving..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .settings-header {
          margin-bottom: 40px;
        }
        .title {
          font-size: 32px;
          font-weight: 800;
          color: #002868;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .settings-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #edf2f7;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          overflow: hidden;
        }
        
        .card-header {
          padding: 24px 30px;
          background: #f8fafc;
          border-bottom: 1px solid #edf2f7;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .card-header h2 {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }
        .header-icon { color: #002868; }

        .card-body {
          padding: 30px;
        }

        .info-row {
          margin-bottom: 20px;
        }
        .info-label {
          font-size: 13px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }
        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          color: #002868;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          text-transform: uppercase;
          margin-top: 4px;
          border: 1px solid #e2e8f0;
        }
        .info-note {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 24px;
          font-style: italic;
        }

        .input-group {
          margin-bottom: 20px;
        }
        .input-group label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
        }
        .input-wrapper input {
          width: 100%;
          padding: 12px 12px 12px 42px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .input-wrapper input:focus {
          border-color: #002868;
          box-shadow: 0 0 0 4px rgba(0, 40, 104, 0.05);
        }

        .save-btn {
          width: 100%;
          background: #002868;
          color: #fff;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }
        .save-btn:hover { background: #001a45; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .status-msg {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .status-msg.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
        .status-msg.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        @media (max-width: 850px) {
          .settings-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
