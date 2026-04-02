"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/password-input";
import { changePassword } from "../../utils/api";
import { useAuth } from "../../../app/context/AuthContext";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const { auth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.userId) return;
    
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
      await changePassword(auth.userId, oldPassword, newPassword);
      setMessage({ text: "Password updated successfully!", type: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Failed to update password:", err);
      const errMsg = err?.response?.data?.message || "Failed to update password. Please try again.";
      setMessage({ text: errMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-page">
      <div className="content-header">
        <h1 className="page-title">Change Password</h1>
        <div className="breadcrumbs">
          <span>Employer</span> / <span>Dashboard</span> / <span className="active">Change Password</span>
        </div>
      </div>

      <div className="card-panel">
        <div className="form-header">
          <h2>Change Your Password</h2>
        </div>
        
        <form className="form-body" onSubmit={handleSubmit}>
          {message.text && (
            <div className={`p-4 mb-6 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}
          
          <div className="form-row">
            <label className="form-label">Old Password</label>
            <PasswordInput 
              placeholder="*******" 
              className="form-input" 
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-row">
            <label className="form-label">New Password</label>
            <PasswordInput 
              placeholder="*******" 
              className="form-input" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-row mb-0">
            <label className="form-label">Confirm Password</label>
            <PasswordInput 
              placeholder="*******" 
              className="form-input" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-footer" style={{ padding: '30px 0 0 0' }}>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Updating..." : "Change password"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .password-page {
          max-width: 1200px;
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

        .card-panel {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #edf2f7;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          overflow: hidden;
        }

        .form-header {
          padding: 24px 30px;
          border-bottom: 1px solid #edf2f7;
        }
        .form-header h2 {
          font-size: 18px;
          font-weight: 600;
          color: #002868;
          margin: 0;
        }

        .form-body {
          padding: 30px;
        }
        
        .form-row {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
        }
        .form-row.mb-0 {
          margin-bottom: 0;
        }
        .form-label {
          width: 250px;
          font-size: 15px;
          font-weight: 500;
          color: #4a5568;
          flex-shrink: 0;
        }
        .form-input {
          flex: 1;
          padding: 14px 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: #fff;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #002868;
          box-shadow: 0 0 0 3px rgba(0, 40, 104, 0.1);
        }

        .form-footer {
          padding: 0 30px 30px 30px;
        }
        
        .btn-save {
          background: #C8102E; /* ANN Red */
          color: #fff;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-save:hover {
          background: #a00d25;
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .form-label {
            width: 100%;
          }
          .form-input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
