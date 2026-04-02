"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Eye, MapPin } from "lucide-react";
import { getMyApplications, deleteApplication } from "../../../utils/api";
import { useDashboard } from "../layout";
import Link from "next/link";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const formatUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function NurseAppliedJobsPage() {
  const { data, loading: dashboardLoading } = useDashboard();
  const user = data?.user;

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApplications = async () => {
    if (!user) return;
    try {
      const apps = await getMyApplications(user.id);
      setJobs(apps);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchApplications();
  }, [user]);

  const handleDelete = (applicationId: string) => {
    setDeleteAppId(applicationId);
  };

  const confirmDelete = async (applicationId: string) => {
    setIsDeleting(true);
    try {
      if (user) {
        await deleteApplication(user.id, applicationId);
        setJobs(jobs.filter(j => j.id !== applicationId));
        setDeleteAppId(null);
      }
    } catch (error) {
      console.error("Failed to delete application:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getJobColor = (type: string) => {
    switch(type?.toLowerCase()) {
      case "full time": return { bg: "#e6f4ea", color: "#1e8e3e" };
      case "contract": return { bg: "#feefe3", color: "#f57c00" };
      case "part time": return { bg: "#e8f0fe", color: "#1a73e8" };
      default: return { bg: "#f3f4f6", color: "#4b5563" };
    }
  };

  if (dashboardLoading || loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading Applications...</div>;
  }

  return (
    <div className="applied-jobs-page">
      <div className="content-header">
        <h1 className="page-title">Applied Jobs</h1>
        <div className="breadcrumbs">
          <span>Candidate</span> / <span>Dashboard</span> / <span className="active">Applied Jobs</span>
        </div>
      </div>

      <div className="card-panel">
        <div className="filter-header">
          <div className="search-group">
            <input type="text" placeholder="Job title, Keywords etc." className="search-input" />
            <button className="btn-search">Search</button>
          </div>
          <div className="sort-group">
            <select className="sort-select" defaultValue="default">
              <option value="default">Short by (Default)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="jobs-list">
          {jobs.length === 0 ? (
            <div className="text-gray-500 p-4">No applications found.</div>
          ) : (
            jobs.map(app => {
              const jobColor = getJobColor(app.Job?.employmentType || "Full Time");
              const safeJobTitle = app.Job?.title || "Unknown Job";
              const safeCompany = app.Job?.Company?.name || "Unknown Company";
              const safeLogo = formatUrl(app.Job?.Company?.logoUrl) || `https://ui-avatars.com/api/?name=${safeCompany.substring(0, 2)}&background=0D8ABC&color=fff`;
              const safeLocation = app.Job?.location || "Remote";
              
              return (
              <div key={app.id} className="job-card">
                <div className="job-logo-wrapper">
                  <img src={safeLogo} alt={safeCompany} className="job-logo" />
                  <div className="status-dot"></div>
                </div>

                <div className="job-details">
                  <span className="job-type-badge" style={{ backgroundColor: jobColor.bg, color: jobColor.color }}>
                    {app.Job?.employmentType || "Full Time"}
                  </span>
                  <h3 className="job-title">{safeJobTitle}</h3>
                  <div className="job-meta">
                    <span className="company-name">{safeCompany}.</span>
                    <span className="location-info">
                      <MapPin size={12} className="meta-icon" /> {safeLocation}
                    </span>
                    <span className="date-info">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="job-date-center">
                  <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>

                <div className="job-status-col">
                  <span className={`status-badge ${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>

                <div className="job-actions">
                  <button className="btn-action btn-delete" onClick={() => handleDelete(app.id)} title="Withdraw Application">
                    <X size={14} />
                  </button>
                  <Link href={`/jobs/${app.Job?.id}`}>
                    <button className="btn-action btn-view" title="View Job">
                      <Eye size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            )})
          )}
        </div>
      </div>

      <style jsx>{`
        .applied-jobs-page {
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

        /* Filter Header */
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 30px;
          border-bottom: 1px solid #edf2f7;
          gap: 20px;
          flex-wrap: wrap;
        }
        .search-group {
          display: flex;
          gap: 12px;
          flex: 1;
          max-width: 600px;
        }
        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          color: #2d3748;
          background: #f8fafc;
          transition: all 0.2s;
        }
        .search-input:focus {
          outline: none;
          border-color: #002868;
          background: #fff;
        }
        .btn-search {
          background: #C8102E; 
          color: #fff;
          border: none;
          padding: 0 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-search:hover {
          background: #a00d25;
        }

        .sort-group {
          width: 200px;
        }
        .sort-select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          color: #4a5568;
          background-color: #fff;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          cursor: pointer;
        }

        /* Jobs List */
        .jobs-list {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .job-card {
          display: flex;
          align-items: center;
          padding: 24px;
          border: 1px solid #edf2f7;
          border-radius: 12px;
          transition: all 0.2s;
          background: #fff;
          gap: 24px;
        }
        .job-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .job-logo-wrapper {
          position: relative;
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          border-radius: 12px;
          padding: 8px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
        }
        .job-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .status-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 16px;
          height: 16px;
          background: #C8102E;
          border: 3px solid #fff;
          border-radius: 50%;
        }

        .job-details {
          flex: 2;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .job-type-badge {
          align-self: flex-start;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 4px;
          text-transform: capitalize;
        }
        .job-title {
          font-size: 18px;
          font-weight: 700;
          color: #002868;
          margin: 0;
        }
        .job-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: #718096;
          flex-wrap: wrap;
        }
        .company-name {
          font-weight: 600;
          color: #4a5568;
        }
        .location-info {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .meta-icon {
          color: #a0aec0;
        }
        .date-info {
          display: none; /* Hidden on desktop, shown on mobile */
        }

        .job-date-center {
          flex: 1;
          font-size: 14px;
          color: #718096;
          text-align: center;
          font-weight: 500;
        }

        .job-status-col {
          width: 120px;
          display: flex;
          justify-content: center;
        }
        .status-badge {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
        }
        .status-badge.approved {
          background: #002868;
          color: #fff;
        }
        .status-badge.pending {
          background: #f59e0b;
          color: #fff;
        }

        .job-actions {
          display: flex;
          gap: 10px;
        }
        .btn-action {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-delete {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
        }
        .btn-delete:hover {
          background: #ef4444;
          color: #fff;
        }
        .btn-view {
          background: #f0f7ff;
          color: #002868;
          border: 1px solid #e2efff;
        }
        .btn-view:hover {
          background: #002868;
          color: #fff;
        }

        @media (max-width: 900px) {
          .job-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .job-date-center {
            display: none;
          }
          .date-info {
            display: block; /* Show date in meta on mobile */
            color: #002868;
            font-weight: 600;
          }
          .job-logo-wrapper {
            width: 48px;
            height: 48px;
          }
          .status-dot {
            width: 12px;
            height: 12px;
          }
        }
      `}</style>

      <ConfirmDeleteModal
        isOpen={!!deleteAppId}
        onClose={() => setDeleteAppId(null)}
        onConfirm={() => deleteAppId && confirmDelete(deleteAppId)}
        title="Withdraw Application?"
        message="This will withdraw your application from this job. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
