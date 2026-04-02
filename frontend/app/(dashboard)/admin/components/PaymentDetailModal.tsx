"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  CreditCard, 
  User, 
  Building, 
  Calendar, 
  DollarSign, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Image as ImageIcon,
  FileText,
  Loader2,
  Check,
  XCircle
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onVerify: (id: string, note?: string) => void;
  onReject: (id: string, note?: string) => void;
}

export default function PaymentDetailModal({ isOpen, onClose, data, onVerify, onReject }: PaymentDetailModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    if (isOpen && data?.receiptUrl && !data.stripeInvoiceId) {
      fetchSecureImage();
    }
    return () => {
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    };
  }, [isOpen, data]);

  const fetchSecureImage = async () => {
    setIsImageLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/payments/receipt/manual/${data.id}`;
      const res = await fetch(url, {
        headers: { 
          'x-user-id': auth?.userId || '',
          'x-user-role': auth?.role || 'SUPER_ADMIN'
        }
      });
      if (!res.ok) throw new Error("Failed to fetch image");
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      setBlobUrl(objectUrl);
    } catch (err) {
      console.error("Error fetching secure receipt image:", err);
    } finally {
      setIsImageLoading(false);
    }
  };
  
  if (!isOpen || !data) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    await onVerify(data.id, note);
    setIsVerifying(false);
    onClose();
  };

  const handleReject = async () => {
    if (!note) return alert("Please provide a reason for rejection in the note field.");
    setIsRejecting(true);
    await onReject(data.id, note);
    setIsRejecting(false);
    onClose();
  };

  const handleDownloadReceipt = async () => {
    const downloadId = data.transactionId || data.stripeInvoiceId || data.id;
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/payments/receipt/${downloadId}`;
    try {
      const res = await fetch(url, { headers: { 'x-user-id': auth?.userId || '' } });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `receipt-${downloadId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Failed to fetch receipt PDF.");
    }
  };

  const statusColor = data.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                      data.status === 'PAID' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      data.status === 'FAILED' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-amber-100 text-amber-700 border-amber-200';

  const receiptUrlToShow = blobUrl;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#002868]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${statusColor}`}>
                {data.status} Payment
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                TXN: {data.transactionId || (data.stripeInvoiceId ? `#${data.stripeInvoiceId.substring(0, 10)}` : data.id.substring(0, 8))}
              </span>
            </div>
            <h2 className="text-3xl font-black text-[#002868] tracking-tight">
              Transaction Details
            </h2>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left Column: Financial Card */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-gradient-to-br from-[#002868] to-[#001f5b] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Amount</p>
                  <div className="text-4xl font-black mb-6">{data.currency} {Number(data.amount).toFixed(2)}</div>
                  
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold opacity-60 uppercase">Date</span>
                      <span className="text-xs font-black">{new Date(data.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold opacity-60 uppercase">Method</span>
                      <span className="text-xs font-black">{data.stripeInvoiceId ? 'Stripe Card' : 'Manual Transfer'}</span>
                    </div>
                  </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <CreditCard size={120} />
                </div>
              </div>

              <button 
                onClick={handleDownloadReceipt}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-[#f8fafc] border border-gray-100 text-[#002868] font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-sm"
              >
                <Download size={18} /> DOWNLOAD RECEIPT (PDF)
              </button>

              {/* Proof Image Section */}
              {data.receiptUrl && !data.stripeInvoiceId && (
                <div className="space-y-4">
                   <h4 className="text-xs font-black text-[#002868] uppercase tracking-widest">Proof of Payment</h4>
                   <div className="block aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden group relative">
                     {isImageLoading ? (
                       <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="animate-spin text-gray-300" size={32} />
                       </div>
                     ) : receiptUrlToShow ? (
                       <>
                         <img src={receiptUrlToShow} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                         <a 
                           href={receiptUrlToShow} 
                           target="_blank" 
                           className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                         >
                            <ImageIcon className="text-white" size={32} />
                            <span className="text-white text-[10px] font-black uppercase tracking-widest ml-2">Open Full View</span>
                         </a>
                       </>
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <AlertTriangle size={24} className="mb-2" />
                          <p className="text-[10px] font-black uppercase">Image Unavailable</p>
                       </div>
                     )}
                   </div>
                </div>
              )}
            </div>

            {/* Right Column: Entity & Verification */}
            <div className="lg:col-span-2 space-y-8">
               <section className="bg-[#f8fafc] p-8 rounded-[2rem] border border-gray-100">
                  <h4 className="text-xs font-black text-[#002868] uppercase tracking-widest border-b border-gray-200 pb-4 mb-6">Payer Dossier</h4>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-black uppercase">Employer / User</p>
                        <p className="font-black text-[#002868] flex items-center gap-2">
                           <User size={14} className="text-[#C8102E]" />
                           {data.Subscription?.User?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{data.Subscription?.User?.email}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 font-black uppercase">Role</p>
                        <p className="font-black text-[#002868] flex items-center gap-2 text-xs">
                           <Building size={14} className="text-[#C8102E]" />
                           {data.Subscription?.User?.id.startsWith('nurse_') ? 'Nurse Registration' : 'Employer Partnership'}
                        </p>
                     </div>
                     <div className="space-y-1 col-span-2">
                        <p className="text-[10px] text-gray-400 font-black uppercase">Subscription Plan</p>
                        <p className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                           {data.Subscription?.planId?.replace(/_/g, ' ')}
                        </p>
                     </div>
                  </div>
               </section>

               {(data.status === 'PENDING' || data.status === 'PAID') && (
                 <section className="space-y-4">
                    <h4 className="text-xs font-black text-[#002868] uppercase tracking-widest">Verification Workbench</h4>
                    <textarea 
                      placeholder="Add an internal note or a message for the employer (optional)..."
                      className="w-full h-32 p-6 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-[#002868] outline-none text-sm font-medium transition-all"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    
                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                       <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                       <p className="text-[11px] text-amber-700 leading-normal font-bold">
                         Verify that the transaction reference exists in the bank statement or Stripe dashboard. 
                         Approving will instantly activate the employer's subscription and send them an automated confirmation email.
                       </p>
                    </div>
                 </section>
               )}

               {(data.status === 'SUCCESS' || data.status === 'VERIFIED') && (
                 <div className="p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg">
                       <CheckCircle size={24} />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-[#002868]">Payment Verified</h4>
                       <p className="text-xs text-gray-500 font-bold">Verified on {new Date(data.verifiedAt).toLocaleString()} by {data.verifiedBy}</p>
                    </div>
                 </div>
               )}

               {data.status === 'FAILED' && (
                 <div className="p-8 rounded-[2rem] bg-red-50 border border-red-100 flex items-center gap-6">
                    <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg">
                       <XCircle size={24} />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-red-600">Payment Rejected</h4>
                       <p className="text-xs text-gray-500 font-bold">Rejected by Admin. Please check internal notes for details.</p>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end">
          {(data.status === 'PENDING' || data.status === 'PAID') ? (
            <div className="flex gap-4">
              <button 
                onClick={handleReject}
                disabled={isRejecting || isVerifying}
                className="px-8 py-4 rounded-2xl bg-white border border-red-200 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
              >
                {isRejecting ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                {isRejecting ? "REJECTING..." : "REJECT PAYMENT"}
              </button>
              <button 
                onClick={handleVerify}
                disabled={isVerifying || isRejecting}
                className="px-10 py-4 rounded-2xl bg-[#002868] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                {isVerifying ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                {isVerifying ? "VERIFYING..." : "CONFIRM & ACTIVATE"}
              </button>
            </div>
          ) : (
            <button 
              onClick={onClose}
              className="px-10 py-4 rounded-2xl bg-[#002868] text-white font-black text-xs uppercase tracking-widest"
            >
              Close Record
            </button>
          )}
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
