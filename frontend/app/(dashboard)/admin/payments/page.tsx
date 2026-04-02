"use client";

import React, { useEffect, useState } from "react";
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Search,
  Mail,
  Eye,
  ArrowRight,
  Filter,
  DollarSign,
  TrendingUp,
  Clock,
  LayoutGrid
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import PaymentDetailModal from "../components/PaymentDetailModal";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
  
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/payments`);
      if (statusFilter !== "ALL") url.searchParams.append("status", statusFilter.toLowerCase());
      
      const res = await fetch(url.toString(), {
        headers: { 'x-user-id': auth?.userId || '' }
      });
      const result = await res.json();
      setPayments(result.data || []);
      
      // Basic stats calculation
      if (statusFilter === "ALL") {
        const data = result.data || [];
        setStats({
          total: data.length,
          verified: data.filter((p: any) => p.status === 'SUCCESS').length,
          pending: data.filter((p: any) => p.status === 'PENDING').length
        });
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (id: string, note?: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/payments/${id}/verify`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': auth?.userId || '' 
        },
        body: JSON.stringify({ note })
      });
      if (res.ok) {
        fetchPayments(); // Refresh list
      }
    } catch (err) {
      alert("Verification failed");
    }
  };

  const handleRejectPayment = async (id: string, note?: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/admin/payments/${id}/reject`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': auth?.userId || '' 
        },
        body: JSON.stringify({ note })
      });
      if (res.ok) {
        fetchPayments(); // Refresh list
      }
    } catch (err) {
      alert("Rejection failed");
    }
  };

  const filteredPayments = payments.filter(p => {
    const payerName = p.Subscription?.User?.name || "";
    const email = p.Subscription?.User?.email || "";
    return payerName.toLowerCase().includes(search.toLowerCase()) || 
           email.toLowerCase().includes(search.toLowerCase()) ||
           (p.stripeInvoiceId && p.stripeInvoiceId.toLowerCase().includes(search.toLowerCase()));
  });

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "PAID": return "bg-blue-50 text-blue-700 border-blue-100";
      case "FAILED": return "bg-red-50 text-red-700 border-red-100";
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="admin-payments p-8 space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#002868] tracking-tight">Financial Audit</h1>
          <p className="text-gray-400 font-bold mt-1 text-sm">Managing platform transactions and manual verifications.</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 border border-gray-100 shadow-sm">
           {["ALL", "PENDING", "SUCCESS", "FAILED"].map(f => (
              <button 
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                  statusFilter === f ? "bg-[#002868] text-white shadow-lg" : "text-gray-400 hover:text-[#002868]"
                }`}
              >
                {f}
              </button>
           ))}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-[#002868] transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={24} />
               </div>
               <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
            </div>
            <p className="text-2xl font-black text-[#002868]">{stats.total}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Volume</p>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-emerald-500 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle size={24} />
               </div>
            </div>
            <p className="text-2xl font-black text-[#002868]">{stats.verified}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Verified Revenue</p>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:border-amber-500 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Clock size={24} />
               </div>
            </div>
            <p className="text-2xl font-black text-[#002868]">{stats.pending}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Pending Audit</p>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-8 border-b border-gray-50 flex items-center gap-6">
           <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                type="text" 
                placeholder="Search by Employer Name, Email or Invoice ID..." 
                className="w-full pl-16 pr-8 py-5 bg-[#f8fafc] border-none rounded-[2rem] outline-none focus:ring-2 focus:ring-[#002868] font-bold text-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <button className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#002868] transition-all">
              <Filter size={20} />
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8fafc]">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payer Details</th>
                <th className="px-10 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center font-black text-gray-300 tracking-widest text-xs uppercase">SYNCING LEDGER...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-gray-400 font-bold">No transactions found for the current criteria.</td></tr>
              ) : filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-[#002868]/5 text-[#002868] rounded-2xl flex items-center justify-center shadow-inner">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="font-black text-[#002868] break-all max-w-[140px] truncate" title={payment.transactionId || payment.stripeInvoiceId || payment.id}>
                          {payment.transactionId || (payment.stripeInvoiceId ? `#${payment.stripeInvoiceId.substring(0, 10)}` : 'Manual')}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(payment.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 font-black text-sm text-[#002868]">
                       {payment.Subscription?.User?.name || 'ANN Partner'}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 font-bold">
                       <Mail size={12} className="opacity-40" /> {payment.Subscription?.User?.email}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="text-lg font-black text-[#002868]">{payment.currency} {Number(payment.amount).toFixed(2)}</div>
                    <div className="text-[10px] font-black text-emerald-500 uppercase">{payment.Subscription?.planId?.replace(/_/g, ' ')}</div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border tracking-widest ${getStatusStyle(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => { setSelectedPayment(payment); setIsModalOpen(true); }}
                      className="inline-flex items-center gap-2 bg-[#002868] text-white px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest hover:bg-[#C8102E] transition-all hover:scale-105 shadow-lg shadow-blue-900/10"
                    >
                      <Eye size={14} /> REVIEW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <PaymentDetailModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedPayment(null); }}
          data={selectedPayment}
          onVerify={handleVerifyPayment}
          onReject={handleRejectPayment}
        />
      )}
    </div>
  );
}
