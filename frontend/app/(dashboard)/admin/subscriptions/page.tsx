"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, TrendingUp, Users, Search, Filter, MoreVertical, CheckCircle2, XCircle, Clock, Loader2, DollarSign } from "lucide-react";
import { getAdminSubscriptions, getAdminPlans, modifySubscription } from "../../../utils/api";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalActive: 0, revenue: 0, trending: "+0%" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subs, planList] = await Promise.all([
        getAdminSubscriptions(),
        getAdminPlans()
      ]);
      setSubscriptions(subs);
      setPlans(planList);
      
      // Basic stats calculation (demo)
      const activeCount = subs.filter((s: any) => s.status === 'ACTIVE').length;
      setStats({
        totalActive: activeCount,
        revenue: 12450,
        trending: "+12.5%"
      });
    } catch (error) {
      console.error("Failed to fetch subscription data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, rejectionReason?: string) => {
    try {
      await modifySubscription(id, { status: newStatus, ...(rejectionReason ? { rejectionReason } : {}) });
      fetchData();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt("Optional: Enter a rejection reason that will be emailed to the employer:");
    handleStatusChange(id, 'REJECTED', reason || undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-10 w-10 text-[#002868]" />
      </div>
    );
  }

  const pendingCount = subscriptions.filter(s => s.status === 'PENDING_VERIFICATION').length;

  return (
    <div className="subscription-management">
      <div className="header-row mb-10">
        <h1 className="text-3xl font-extrabold text-[#002868]">Subscription Management</h1>
        <p className="text-gray-500 mt-2">Monitor revenue, manage company plans, and track billing health.</p>
        {pendingCount > 0 && (
          <div className="mt-4 flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3 w-fit">
            <Clock size={18} className="text-yellow-600 shrink-0" />
            <p className="text-sm font-bold text-yellow-800">
              <span className="text-yellow-600 font-black">{pendingCount}</span> manual payment{pendingCount > 1 ? 's' : ''} awaiting your verification
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-[#002868] rounded-2xl flex items-center justify-center">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Monthly Revenue</p>
            <h3 className="text-3xl font-black text-[#002868] mt-1">${stats.revenue.toLocaleString()}</h3>
            <span className="text-xs font-bold text-green-500 flex items-center gap-1 mt-1">
              <TrendingUp size={14} /> {stats.trending} from last month
            </span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-red-50 text-[#C8102E] rounded-2xl flex items-center justify-center">
            <Users size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Active Subscriptions</p>
            <h3 className="text-3xl font-black text-[#002868] mt-1">{stats.totalActive}</h3>
            <p className="text-xs font-bold text-gray-400 mt-1">Total across {plans.length} tiers</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center">
            <CreditCard size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Pricing Tiers</p>
            <h3 className="text-3xl font-black text-[#002868] mt-1">{plans.length}</h3>
            <p className="text-xs font-bold text-[#C8102E] mt-1 cursor-pointer hover:underline">Manage Plans →</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
              <Filter size={20} />
            </div>
            <h2 className="text-xl font-bold text-[#002868]">Customer Directory</h2>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search company or email..." 
                className="pl-12 pr-6 py-3 bg-[#f8fafc] border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#002868] text-sm font-medium w-full md:w-72"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {subscriptions.length === 0 ? (
            <div className="p-20 text-center">
              <CreditCard size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">No active subscriptions found.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Company / User</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Plan Tier</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Next Billing</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((sub) => {
                  const isPending = sub.status === 'PENDING_VERIFICATION';
                  return (
                    <tr key={sub.id} className={`transition-colors ${isPending ? 'bg-yellow-50/60 hover:bg-yellow-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#002868]">{sub.User?.name || 'ANN Partners'}</span>
                          <span className="text-xs text-gray-400 font-medium uppercase tracking-tight">{sub.User?.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${sub.SubscriptionPlan?.name === 'PREMIUM' ? 'bg-[#C8102E]' : 'bg-[#002868]'}`}></div>
                          <span className="text-sm font-bold text-gray-700">{sub.SubscriptionPlan?.name || 'Standard Plan'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          sub.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : sub.status === 'PENDING_VERIFICATION'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : sub.status === 'REJECTED'
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          {sub.status === 'PENDING_VERIFICATION' ? '⏳ Pending Review' : sub.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm font-semibold text-gray-500">
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'Manual Renewal'}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(sub.id, 'ACTIVE')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-green-700 transition-colors shadow-sm"
                                title="Approve Payment & activate subscription"
                              >
                                <CheckCircle2 size={14} /> Approve
                              </button>
                              <button
                                onClick={() => handleReject(sub.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-colors shadow-sm"
                                title="Reject Payment"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          ) : sub.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(sub.id, 'CANCELLED')}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                              title="Cancel Subscription"
                            >
                              <XCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(sub.id, 'ACTIVE')}
                              className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors border border-transparent hover:border-green-100"
                              title="Reactivate Subscription"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          )}
                          <button className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg transition-colors border border-transparent">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx>{`
        .subscription-management {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
