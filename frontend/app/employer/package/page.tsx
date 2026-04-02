"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, ChevronDown, Package, CheckCircle, XCircle, 
  Clock, Zap, Calendar, ArrowRight, X, Loader2
} from "lucide-react";
import { getAdminPlans } from "@/app/utils/api";

export default function PackagePage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    if (isModalOpen && plans.length === 0) {
      fetchPlans();
    }
  }, [isModalOpen]);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const data = await getAdminPlans();
      // Ensure features are parsed if stored as JSON/string
      const parsedData = data.map((plan: any) => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : [])
      }));
      setPlans(parsedData);
    } catch (err) {
      console.error("Failed to load plans", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#002868] mb-1">My Package</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <Link href="/employer/dashboard" className="hover:text-[#002868]">Employer</Link>
            <span className="text-gray-300">/</span>
            <Link href="/employer/dashboard" className="hover:text-[#002868]">Dashboard</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#C8102E] font-bold">My Package</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex-1 w-full relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search packages..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#002868]/20 focus:ring-4 focus:ring-[#002868]/5 rounded-xl pl-12 pr-4 py-4 text-sm font-medium transition-all outline-none"
            />
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <button className="bg-[#C8102E] text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-[#a00d25] transition-all shadow-lg shadow-red-700/10 min-w-[120px]">
              Search
            </button>
            <div className="relative group min-w-[160px]">
              <button className="w-full flex items-center justify-between bg-white border border-gray-100 px-4 py-3.5 rounded-xl text-xs font-bold text-gray-600 hover:border-[#002868]/20 transition-all">
                Short by (Default)
                <ChevronDown size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Interface */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
            <Package size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-[#002868] mb-3">No Active Package</h3>
          <p className="text-[13px] font-medium text-gray-400 max-w-sm leading-relaxed">
            Your real-time subscription plans linked with the admin will appear here. Please purchase a package to unlock premium recruitment features.
          </p>
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-[#002868] to-[#004e92] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-[#002868]/20">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
            <Zap size={32} />
          </div>
          <div>
            <h4 className="text-xl font-black text-white mb-1">Upgrade Your Hospital Network</h4>
            <p className="text-blue-100 text-xs font-medium max-w-md leading-relaxed">
              Get featured placement and higher post limits for urgent nursing roles by subscribing to a premium admin package.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#C8102E] text-white px-10 py-4 rounded-xl font-black text-sm hover:bg-[#a00d25] transition-all flex items-center gap-3 shrink-0 group shadow-lg shadow-red-900/30"
        >
          View All Packages
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <p className="text-center text-[10px] font-black text-gray-400 pt-8 border-t border-gray-100 uppercase tracking-widest">
        © 2026 America Needs Nurses - Employer Portal. All rights reserved.
      </p>

      {/* PREMIUM PACKAGES MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#00122E]/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-[#f8fafc] w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
            
            <div className="sticky top-0 z-20 bg-[#f8fafc]/90 backdrop-blur-md px-10 py-8 border-b border-gray-200 flex justify-between items-center rounded-t-[2.5rem]">
              <div>
                <h2 className="text-3xl font-black text-[#002868]">Select Premium Access</h2>
                <p className="text-gray-500 font-medium text-sm mt-1">Upgrade your tier to unlock bulk recruitment and visibility features.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-red-50 hover:rotate-90 transition-all shadow-sm border border-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 md:p-12">
              {loadingPlans ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                  <Loader2 className="w-12 h-12 text-[#002868] animate-spin" />
                  <span className="text-[#002868] font-bold tracking-widest uppercase text-xs">Loading Live Tiers...</span>
                </div>
              ) : plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200 p-12">
                  <Package className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-500 mb-2">No Subscription Tiers Found</h3>
                  <p className="text-gray-400 text-sm max-w-md">The platform administrator has not activated any premium subscription tiers yet. Please check back later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {plans.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col relative group">
                      
                      {/* CSS definitions for dynamic headers */}
                      <style jsx>{`
                        .header-basic { background: linear-gradient(135deg, #0d1b3e 0%, #1e3a8a 100%); }
                        .header-red { background: linear-gradient(135deg, #C8102E 0%, #990c23 100%); }
                        .header-navy { background: linear-gradient(135deg, #002868 0%, #001a4d 100%); }
                      `}</style>
                      
                      <div className={`p-10 text-center relative header-${plan.headerStyle || 'basic'}`}>
                        {plan.badge && (
                          <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.15em] border border-white/20">
                            {plan.badge}
                          </div>
                        )}
                        <div className="text-white/60 font-black uppercase tracking-[0.3em] text-[11px] mb-4">{plan.name}</div>
                        <div className="flex items-baseline justify-center gap-1 mb-2">
                          <span className="text-white/40 text-2xl font-bold">$</span>
                          <span className="text-6xl font-black text-white">{plan.price}</span>
                        </div>
                        <div className="text-white/50 font-bold text-xs uppercase tracking-widest text-[10px]">per {plan.billingCycle?.toLowerCase() || 'month'}</div>
                      </div>

                      <div className="p-8 flex-1 flex flex-col">
                        <div className="space-y-4 mb-8 flex-1">
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <div className="w-10 h-10 bg-white text-[#C8102E] rounded-xl flex items-center justify-center shadow-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                              </div>
                              <div>
                                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Usage Limit</div>
                                  <div className="text-[#002868] font-black">{plan.jobsLimit} Active Postings</div>
                              </div>
                          </div>
                          
                          {plan.features?.map((f: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 justify-start text-sm font-bold text-gray-600 pl-2">
                              {/* Custom red check if it's popular, otherwise blue dot */}
                              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${plan.isPopular ? 'bg-[#C8102E]' : 'bg-[#002868] opacity-50'}`} />
                              <span className="leading-snug">{f}</span>
                            </div>
                          ))}
                        </div>

                        <button className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-md group-hover:shadow-xl ${
                          plan.buttonStyle === 'solid' ? 'bg-[#C8102E] text-white hover:bg-[#a00d25]' : 
                          plan.buttonStyle === 'navy-solid' ? 'bg-[#002868] text-white hover:bg-[#001f50]' : 
                          'bg-white text-[#002868] border-2 border-[#002868]/10 hover:border-[#002868] hover:bg-[#f8fafc]'
                        }`}>
                          {plan.buttonLabel || 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
