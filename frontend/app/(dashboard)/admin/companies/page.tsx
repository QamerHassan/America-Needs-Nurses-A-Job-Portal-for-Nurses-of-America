"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminCompanies, getAdminCompanyDetails, updateCompanyStatus, toggleCompanyFeatured, deleteAdminCompany } from "../../../utils/api"
import AdminReviewModal from "../components/AdminReviewModal";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import CompanyLogo from "../../../components/CompanyLogo";
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Search,
  Star,
  Mail,
  Phone,
  Trash2,
  Eye,
  ExternalLink
} from "lucide-react";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  
  // Modal State
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCompanyId, setDeleteCompanyId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await getAdminCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompanyDetail = async (company: any) => {
    try {
      const details = await getAdminCompanyDetails(company.id);
      setSelectedCompany(details || company); // fallback to list company if details fail
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch company details:", err);
      setSelectedCompany(company);
      setIsModalOpen(true);
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      await updateCompanyStatus(id, newStatus);
      setCompanies(companies.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleCompanyFeatured(id);
      setCompanies(companies.map(c => c.id === id ? { ...c, isFeatured: !c.isFeatured } : c));
    } catch (err) {
      alert("Failed to toggle featured status");
    }
  };

  const handleDeleteCompany = (id: string) => {
    setDeleteCompanyId(id);
  };

  const confirmDeleteCompany = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteAdminCompany(id);
      setCompanies(companies.filter(c => c.id !== id));
      setDeleteCompanyId(null);
    } catch (err) {
      alert("Failed to delete company");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCompanies = companies.filter(c => {
    const name = c.name || "";
    const email = c.User?.email || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                          email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      case "SUSPENDED": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="admin-companies p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002868]">Manage Companies</h1>
          <p className="text-gray-500 mt-1 font-medium italic opacity-70">Review and verify healthcare provider registrations.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        {/* Search and Filters */}
        <div className="p-8 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#002868] outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f ? "bg-[#002868] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-8 py-5 text-left text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Company</th>
                <th className="px-8 py-5 text-left text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-5 text-center text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Featured</th>
                <th className="px-8 py-5 text-left text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[11px] font-extrabold text-[#64748b] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center font-bold text-gray-400">LOADING DATA...</td></tr>
              ) : filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                        {company.logoUrl ? <CompanyLogo src={company.logoUrl} className="w-full h-full object-contain p-1" fallbackIconSize={20} /> : <Building2 size={20} className="text-gray-400" />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{company.name}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-tighter">{company.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="text-sm text-gray-700 flex items-center gap-2 font-medium"><Mail size={12} className="opacity-40"/> {company.User?.email}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2"><Phone size={12} className="opacity-40"/> {company.phone || "N/A"}</div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <button onClick={() => handleToggleFeatured(company.id)} className={`${company.isFeatured ? 'text-yellow-500' : 'text-gray-200 hover:text-yellow-400'}`}>
                      <Star size={20} fill={company.isFeatured ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(company.status)}`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                       
                      {/* REVIEW BUTTON */}
                      <button 
                        onClick={() => handleOpenCompanyDetail(company)}
                        className="p-2 rounded-lg bg-[#002868] text-white hover:bg-blue-900 transition-all border border-[#002868] flex items-center gap-2 px-3 h-[38px] group"
                      >
                        <Eye size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Detail</span>
                      </button>

                      <div className="w-[1px] h-6 bg-gray-100 mx-1" />
                      
                      {/* APPROVE BUTTON: Green if not approved, Gray/Disabled if already approved */}
                      <button 
                        disabled={company.status === "APPROVED"}
                        onClick={() => handleStatusUpdate(company.id, "APPROVED")}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all shadow-sm ${
                          company.status === "APPROVED" ? "bg-gray-300 cursor-not-allowed opacity-50" : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        <CheckCircle size={14} /> Approve
                      </button>

                      {/* REJECT BUTTON */}
                      <button 
                        disabled={company.status === "REJECTED"}
                        onClick={() => handleStatusUpdate(company.id, "REJECTED")}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          company.status === "REJECTED" 
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                            : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                        }`}
                      >
                        <XCircle size={14} /> Reject
                      </button>

                      {/* VIEW ICON */}
                      <Link href={`/companies/${company.slug}`} target="_blank" className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-[#002868] border border-gray-100">
                        <ExternalLink size={18} />
                      </Link>

                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => handleDeleteCompany(company.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100"
                        title="Delete Company"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminReviewModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCompany(null); }}
        type="COMPANY"
        data={selectedCompany}
        onApprove={(id) => {
          handleStatusUpdate(id, "APPROVED");
          setIsModalOpen(false);
          setSelectedCompany(null);
        }}
        onReject={(id) => {
          handleStatusUpdate(id, "REJECTED");
          setIsModalOpen(false);
          setSelectedCompany(null);
        }}
      />
      
      <ConfirmDeleteModal
        isOpen={!!deleteCompanyId}
        onClose={() => setDeleteCompanyId(null)}
        onConfirm={() => deleteCompanyId && confirmDeleteCompany(deleteCompanyId)}
        title="Delete Company?"
        message="This will completely remove the company, all its jobs, and applications. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}