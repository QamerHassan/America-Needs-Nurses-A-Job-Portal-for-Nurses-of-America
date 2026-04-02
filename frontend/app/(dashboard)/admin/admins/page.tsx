"use client";

import React, { useState, useEffect } from "react";
import { Shield, UserCog, UserPlus, Search, Filter, Mail, CheckCircle2, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { getAdminUsers, updateUserRole, updateUserStatus, deleteUser } from "@/app/utils/api";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getAdminUsers();
      setAdmins(data);
    } catch (error) {
      console.error("Failed to fetch admins", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      setStatusMsg(null);
      await updateUserRole(userId, newRole);
      setStatusMsg({ type: 'success', text: "Admin role updated successfully." });
      fetchData();
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to update role." });
    }
  };

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      setStatusMsg(null);
      await updateUserStatus(userId, newStatus);
      setStatusMsg({ type: 'success', text: `Admin status changed to ${newStatus}.` });
      fetchData();
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to update status." });
    }
  };

  const confirmDeleteAdmin = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteUser(id);
      setAdmins(admins.filter(a => a.id !== id));
      setDeleteAdminId(null);
      setStatusMsg({ type: 'success', text: "Admin user deleted successfully." });
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to delete admin." });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-10 w-10 text-[#002868]" />
      </div>
    );
  }

  return (
    <div className="admin-management">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002868]">Administrative Access</h1>
          <p className="text-gray-500 mt-2">Manage your internal team, assign permissions, and audit access logs.</p>
        </div>
        <button className="bg-[#002868] hover:bg-[#001d4a] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg transform hover:scale-[1.02]">
          <UserPlus size={20} />
          Invite Admin
        </button>
      </div>

      {statusMsg && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm">{statusMsg.text}</span>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#002868]">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-bold text-[#002868]">Authorized Personnel</h2>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-[#f8fafc] border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#002868] text-sm font-medium w-full md:w-72"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredAdmins.length === 0 ? (
            <div className="p-20 text-center">
              <UserCog size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">No administrators found matching your search.</p>
            </div>
          ) : (
            <table className="w-full text-left ">
              <thead className="bg-[#f8fafc] border-b border-gray-100 pl-5">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Administrator</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Active Role</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Joined Date</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#002868] to-[#00122e] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {admin.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#002868]">{admin.name}</span>
                          <span className="text-xs text-gray-400 font-medium lowercase tracking-tight">{admin.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={admin.role}
                        onChange={(e) => handleRoleUpdate(admin.id, e.target.value)}
                        className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl outline-none cursor-pointer border transition-all ${
                          admin.role === 'SUPER_ADMIN' 
                            ? 'bg-red-50 text-[#C8102E] border-red-100' 
                            : admin.role === 'CONTENT_ADMIN' 
                              ? 'bg-blue-50 text-[#002868] border-blue-100' 
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="CONTENT_ADMIN">Content Admin</option>
                        <option value="SUPPORT_ADMIN">Support Admin</option>
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => handleStatusUpdate(admin.id, admin.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          admin.status === 'ACTIVE' 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}
                      >
                        {admin.status}
                      </button>
                    </td>
                    <td className="px-8 py-6 text-sm font-semibold text-gray-500">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setDeleteAdminId(admin.id)}
                        className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-management {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <ConfirmDeleteModal
        isOpen={!!deleteAdminId}
        onClose={() => setDeleteAdminId(null)}
        onConfirm={() => deleteAdminId && confirmDeleteAdmin(deleteAdminId)}
        title="Remove Admin Access?"
        message="This will permanently delete this admin user account. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
