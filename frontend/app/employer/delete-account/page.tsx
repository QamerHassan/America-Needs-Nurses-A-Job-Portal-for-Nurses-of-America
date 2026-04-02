"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "../../../app/context/AuthContext";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { auth, logout } = useAuth();

  const handleDeleteConfirmed = async () => {
    const token = auth?.token;
    const userId = auth?.userId;
    if (!token || !userId) {
      alert("Session expired. Please log in again.");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to delete account. Please verify your session.");

      logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="delete-account-page">
      <div className="content-header">
        <h1 className="page-title">Delete Account</h1>
        <div className="breadcrumbs">
          <span>Employer</span> / <span>Dashboard</span> / <span className="active">Delete Account</span>
        </div>
      </div>

      <div className="card-panel">
        <div className="form-header">
          <h2>Delete Account</h2>
        </div>
        
        <div className="form-body">
          <p className="form-instruction">Enter your password To Delete Account</p>
          <div className="form-row">
            <PasswordInput 
              placeholder="*******" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            className="btn-delete" 
            onClick={() => {
              if (!auth?.token || !auth?.userId) {
                alert("Session expired. Please log in again.");
                return;
              }
              if (!password) {
                alert("Please enter your password to confirm.");
                return;
              }
              setIsConfirmOpen(true);
            }}
          >
            Delete Account
          </button>
        </div>
      </div>

      <style jsx>{`
        .delete-account-page {
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
          font-size: 16px;
          font-weight: 600;
          color: #002868;
          margin: 0;
        }

        .form-body {
          padding: 30px;
        }
        .form-instruction {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 16px;
          margin-top: 0;
        }
        
        .form-row {
          max-width: 800px;
          margin-bottom: 24px;
        }
        .form-input {
          width: 100%;
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
        
        .btn-delete {
          background: #dc3545; /* Red matching ANN theme delete buttons */
          color: #fff;
          border: none;
          padding: 14px 28px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-delete:hover {
          background: #c82333;
        }
      `}</style>

      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Permanently Delete Account?"
        message="All job postings, applicants, and company data will be permanently erased. This action CANNOT be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
