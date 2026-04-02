"use client";

import React from "react";
import { 
  X, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Building, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Users,
  Briefcase,
  Clock
} from "lucide-react";
import Link from "next/link";
import CompanyLogo from "../../../components/CompanyLogo";

interface AdminReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'COMPANY' | 'JOB';
  data: any;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function AdminReviewModal({ isOpen, onClose, type, data, onApprove, onReject }: AdminReviewModalProps) {
  if (!isOpen) return null;
  
  if (!data) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002868]/40 backdrop-blur-sm">
         <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl">
            <div className="animate-spin text-[#002868] mb-4">
              <AlertTriangle size={32} className="opacity-0" />
            </div>
            <h3 className="text-xl font-bold text-[#002868]">Loading company details...</h3>
         </div>
      </div>
    );
  }

  console.log("COMPANY DATA:", data);

  const isCompany = type === 'COMPANY';
  
  // Determine missing data for the 'Incomplete Profile' badge
  const isMissingData = isCompany && (!data.logoUrl || !data.description || !data.staffCount);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002868]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                type === 'COMPANY' ? 'bg-blue-50 text-[#002868] border-blue-100' : 'bg-red-50 text-[#C8102E] border-red-100'
              }`}>
                {type} Review
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {data.id?.substring(0, 8)}...</span>
              
              {isMissingData && (
                <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                   <AlertTriangle size={12} /> Incomplete Profile
                </span>
              )}
            </div>
            <h2 className="text-3xl font-black text-[#002868] tracking-tight">
              {type === 'COMPANY' ? data.name : data.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left Column: Visuals & Core Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="aspect-square bg-gray-50 rounded-[32px] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative">
                {type === 'COMPANY' ? (
                  <CompanyLogo src={data.logoUrl} alt="Company Logo" className="w-full h-full p-6" fallbackIconSize={48} />
                ) : (
                  data.Company?.logoUrl ? <CompanyLogo src={data.Company.logoUrl} alt="Logo" className="w-full h-full p-6" fallbackIconSize={48} /> : <Briefcase size={64} className="text-gray-200" />
                )}
                {isCompany && !data.logoUrl && (
                  <div className="absolute top-2 right-2 bg-amber-100 p-1 rounded-full text-amber-600 shadow-sm border border-amber-200" title="Missing Logo">
                    <AlertTriangle size={16} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-black text-[#002868] uppercase tracking-widest">Quick Stats</h4>
                 <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    {type === 'COMPANY' ? (
                      <>
                        <div className={`flex items-center gap-3 text-sm font-bold ${!data.staffCount ? "text-amber-600" : "text-gray-500"}`}>
                          <Users size={16} className={!data.staffCount ? "text-amber-600" : "text-[#002868]"} /> 
                          <span>{data.staffCount ?? 0} Staff</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                          <DollarSign size={16} className="text-[#002868]" /> <span>{data.revenue || "Standard"} Revenue</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                          <Calendar size={16} className="text-[#002868]" /> <span>Est. {data.foundedYear || "N/A"}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                          <DollarSign size={16} className="text-[#002868]" /> <span>{data.salary || "Competitive"} Pay</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                          <Users size={16} className="text-[#002868]" /> <span>{data._count?.Application || 0} Applications</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                          <Clock size={16} className="text-[#002868]" /> <span>{data.jobType || "Full-time"}</span>
                        </div>
                      </>
                    )}
                 </div>
              </div>
            </div>

            {/* Right Column: Detailed Feed */}
            <div className="lg:col-span-2 space-y-8">
               <section>
                  <h4 className="text-xs font-black text-[#002868] uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Description / About</h4>
                  <p className={`text-sm leading-relaxed font-medium ${isCompany && !data.description ? "text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100" : "text-gray-600"}`}>
                    {type === 'COMPANY' ? (data.description || "No description provided.") : (data.description || "No job description provided.")}
                  </p>
               </section>

               <section>
                  <h4 className="text-xs font-black text-[#002868] uppercase tracking-widest border-b border-gray-100 pb-4 mb-4">Institutional Dossier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                        <MapPin size={16} className="text-[#C8102E]" /> {data.location || data.address || "No location set"}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                        <Globe size={16} className="text-[#C8102E]" /> {data.website || "No website"}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                        <Phone size={16} className="text-[#C8102E]" /> {data.phone || "No phone provided"}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                        <Mail size={16} className="text-[#C8102E]" /> {type === 'COMPANY' ? (data.email || "N/A") : (data.Company?.User?.email || "N/A")}
                      </div>
                    </div>
                  </div>
               </section>

               <div className="p-8 rounded-[2rem] bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-3 mb-3 text-amber-800">
                    <AlertTriangle size={20} />
                    <h5 className="font-black text-sm uppercase tracking-widest leading-none">Security Advisory</h5>
                  </div>
                  <p className="text-xs text-amber-700 leading-normal font-medium">
                    Ensure all healthcare credentials and location data are verified against official medical registries before granting platform-wide approval. 
                    Approved entities can immediately begin recruiting nurses.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex gap-4">
            <Link 
              href={type === 'COMPANY' ? `/companies/${data.slug}` : `/jobs/${data.slug}`} 
              target="_blank"
              className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <ExternalLink size={16} /> Open Public View
            </Link>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => onReject(data.id)}
              className="px-8 py-4 rounded-2xl bg-white border border-red-100 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
            >
              Reject Entity
            </button>
            <button 
              onClick={() => onApprove(data.id)}
              className="px-8 py-4 rounded-2xl bg-[#002868] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-105 transition-all"
            >
              Approve Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
