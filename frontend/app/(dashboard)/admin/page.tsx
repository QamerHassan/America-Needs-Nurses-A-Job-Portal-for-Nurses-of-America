"use client";

import React from "react";
import { useAdminDashboard } from "./layout";
import { 
  Building2, 
  Briefcase, 
  Users, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  LayoutDashboard 
} from "lucide-react";
import Link from "next/link";

export default function AdminOverview() {
  const { data, loading } = useAdminDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002868]"></div>
      </div>
    );
  }

  const stats = [
    { label: "Total Companies", value: data?.stats?.companyCount || 0, icon: <Building2 />, color: "#002868", sub: `${data?.stats?.pendingCompanies || 0} Pending Approval` },
    { label: "Total Nurses", value: data?.stats?.nurseCount || 0, icon: <Users />, color: "#C8102E", sub: "Platform Wide" },
    { label: "Pending Subscriptions", value: data?.stats?.pendingSubscriptions || 0, icon: <LayoutDashboard />, color: "#002868", sub: "Action Required" },
  ];

  return (
    <div className="admin-dashboard">
      <div className="header-row mb-8">
        <h1 className="text-3xl font-extrabold text-[#002868]">Platform Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's what's happening across ANN today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}10`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3 className="stat-label uppercase tracking-wider text-[11px] opacity-70">{stat.label}</h3>
              <p className="stat-value text-[#334155]">{stat.value}</p>
              <span className="stat-sub font-semibold" style={{ color: stat.color }}>{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid mt-10">
        {/* Pending Approvals */}
        <div className="content-card col-span-2">
          <div className="card-header">
            <h2 className="card-title text-[#002868]">Needs Your Attention</h2>
            <div className="flex gap-4">
               <Link href="/admin/companies" className="view-all">Companies ({data?.stats?.pendingCompanies || 0})</Link>
            </div>
          </div>
          <div className="card-body">
            {data?.recentPendingCompanies?.length > 0 ? (
              <div className="p-0">
                {/* Companies Section */}
                {data?.recentPendingCompanies?.map((company: any) => (
                  <div key={company.id} className="pending-item flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#002868]">
                        {company.logoUrl ? <img src={company.logoUrl} className="w-full h-full object-contain p-1" /> : <Building2 size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{company.name || "Unnamed Hospital"}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{company.User?.email}</p>
                      </div>
                    </div>
                    <Link href="/admin/companies" className="px-3 py-1.5 bg-[#002868] text-white text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-blue-900 transition-all">Review</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state text-center py-12">
                <CheckCircle2 size={48} className="mx-auto text-green-100 mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">All Clear! No pending tasks.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Center */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title text-[#002868]">Quick Actions</h2>
          </div>
          <div className="card-body p-4">
            <Link href="/admin/companies" className="action-btn w-full">
              <div className="btn-icon bg-blue-50 text-[#002868]"><Building2 size={18} /></div>
              <span>Moderate Companies</span>
            </Link>
            <Link href="/admin/subscriptions" className="action-btn w-full">
              <div className="btn-icon bg-red-50 text-[#C8102E]"><AlertCircle size={18} /></div>
              <span>Manage Subscriptions</span>
            </Link>
            <Link href="/admin/subscriptions/verifications" className="action-btn w-full">
              <div className="btn-icon bg-emerald-50 text-emerald-600"><CheckCircle2 size={18} /></div>
              <span>Payment Verifications</span>
            </Link>
            <Link href="/admin/newsletter" className="action-btn w-full">
              <div className="btn-icon bg-gray-50 text-gray-600"><Clock size={18} /></div>
              <span>Schedule Newsletter</span>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }

        .stat-card {
          background: #ffffff;
          padding: 24px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-label {
          font-weight: 800;
          color: #64748b;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 800;
          line-height: 1.2;
        }

        .stat-sub {
          font-size: 11px;
          display: block;
          margin-top: 4px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .content-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          overflow: hidden;
        }

        .card-header {
          padding: 24px 30px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .view-all {
          font-size: 14px;
          font-weight: 600;
          color: #002868;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 16px;
          transition: all 0.2s;
          text-align: left;
          border: 1px solid transparent;
        }

        .action-btn:hover {
          background: #f8fafc;
          border-color: #f1f5f9;
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn span {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }

        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .col-span-2 {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
