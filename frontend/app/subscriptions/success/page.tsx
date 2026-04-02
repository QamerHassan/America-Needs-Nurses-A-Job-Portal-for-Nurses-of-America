"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Download,
  FileText,
  Upload,
  Loader2,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function SuccessContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  const { auth } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    setMounted(true);
    let attempts = 0;

    const fetchStatus = async () => {
      if (!auth?.userId) return;

      try {
        const subId = searchParams.get('sub_id');
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/subscriptions/latest-success/${auth.userId}`);
        if (sessionId) url.searchParams.append('session_id', sessionId);
        if (subId) url.searchParams.append('sub_id', subId);

        const res = await fetch(url.toString());
        const text = await res.text();

        console.log('RAW RESPONSE:', text);

        let parsedData = null;

        try {
          parsedData = text ? JSON.parse(text) : null;
        } catch (e) {
          console.error("JSON PARSE ERROR", e);
          parsedData = null;
        }

        // 🛡️ MANDATORY DEBUG LOGGING
        console.log('PAYMENT STATUS AUDIT:', parsedData);

        if (parsedData && typeof parsedData === 'object' && parsedData.paymentMethod) {
          setData(parsedData);
          setLoading(false);

          // Stop conditions: Terminal states
          const { subscriptionStatus, transactionStatus } = parsedData;
          const status = transactionStatus || (parsedData.paymentMethod === 'STRIPE' ? 'PAID' : 'PENDING');

          if (subscriptionStatus === 'ACTIVE' ||
            status === 'SUCCESS' ||
            status === 'PAID' ||
            status === 'PENDING' ||
            status === 'FAILED') {
            return true; // Signal to clear interval
          }
        } else {
          // If no data or null, ensure we don't crash and continue polling
          setData(null);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
      return false;
    };

    const interval = setInterval(async () => {
      const shouldStop = await fetchStatus();
      attempts++;

      if (shouldStop || attempts >= 6) {
        clearInterval(interval);
        setLoading(false);
        if (attempts >= 6 && !shouldStop) {
          setTimeoutReached(true);
        }
      }
    }, 2000);

    // Initial fetch
    fetchStatus();

    return () => clearInterval(interval);
  }, [auth?.userId, sessionId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/uploads/receipts`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await res.json();
        if (uploadData.url) {
          setReceiptUrl(uploadData.url);
          setIsUploaded(true);
        }
      } catch (err) {
        alert("Upload failed.");
      }
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptUrl && !transactionId) return alert("Please provide Transaction ID or Upload Receipt.");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/payments/submit-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': auth?.userId || '' },
        body: JSON.stringify({
          subscriptionId: data?.id || auth?.userId,
          transactionId,
          receiptUrl,
          paymentMethod: 'MANUAL'
        }),
      });
      if (res.ok) {
        setLoading(true);
        setShowForm(false);
        window.location.reload(); // Re-trigger flow
      } else {
        const errData = await res.json();
        alert(errData.message || "Submission failed.");
      }
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-[2.5rem] p-16 shadow-2xl border border-gray-100 max-w-md w-full animate-in fade-in zoom-in duration-700">
          <Loader2 className="animate-spin text-[#002868] mx-auto mb-6" size={56} />
          <h2 className="text-2xl font-black text-[#002868] mb-4">Verifying Transaction...</h2>
          <p className="text-gray-500 font-bold mb-10 text-sm italic leading-relaxed">
            "Connecting securely to payment gateway. This usually takes just a few seconds."
          </p>
        </div>
      </div>
    );
  }

  // 1. SAFE FALLBACK UI (IF NO DATA)
  if (!data) {
    const isManualMode = searchParams.get('method') === 'manual';

    if (isManualMode) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-[#002868]">
          <div className="max-w-2xl mx-auto w-full space-y-10">
            <div className="text-center font-black text-4xl">
              ANN <span className="text-[#C8102E]">INSTANT BILLING</span>
            </div>
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-50 flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-500">
               <div className="w-20 h-20 bg-blue-50 text-[#002868] rounded-full flex items-center justify-center shadow-xl">
                  <FileText size={40} />
               </div>
               <div>
                  <h2 className="text-3xl font-black mb-2">Final Step: Proof of Payment</h2>
                  <p className="text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
                    Please download your invoice below and upload the bank transfer receipt to activate your plan instantly.
                  </p>
               </div>
               
               <div className="w-full flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      const btn = e.currentTarget;
                      const originalText = btn.innerHTML;
                      btn.innerHTML = `<span class="flex items-center gap-2"><svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> DOWNLOADING...</span>`;
                      btn.disabled = true;
                      
                      try {
                        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/subscriptions/invoice-latest/${auth?.userId}`;
                        const res = await fetch(url);
                        if (!res.ok) {
                          const err = await res.json();
                          throw new Error(err.message || "Failed to generate invoice");
                        }
                        const blob = await res.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = `ANN-Invoice-${auth?.userId?.substring(0,6) || 'Latest'}.pdf`;
                        a.click();
                        window.URL.revokeObjectURL(blobUrl);
                      } catch (error: any) {
                        alert(error.message);
                      } finally {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                      }
                    }}
                    className="flex-1 bg-[#002868] text-white py-6 rounded-[2rem] font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={20} /> DOWNLOAD INVOICE
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-white border-2 border-[#002868] text-[#002868] py-6 rounded-[2rem] font-black text-sm shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Loader2 className="animate-spin" size={20} /> REFRESH STATUS
                  </button>
               </div>
               
               <div className="w-full h-[2px] bg-gray-50"></div>
               
               <div className="w-full text-left bg-[#f8fafc] p-10 rounded-[2.5rem] border border-gray-100">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[#C8102E] text-white rounded-2xl flex items-center justify-center shadow-lg">
                         <Upload size={24} />
                      </div>
                      <h3 className="text-xl font-black">Upload PDF Form</h3>
                   </div>
                   <label className={`w-full flex flex-col items-center justify-center py-16 border-4 border-dashed ${isUploaded ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-gray-200 text-gray-400'} rounded-[2.5rem] cursor-pointer hover:border-[#C8102E] transition-all`}>
                      {isUploaded ? <CheckCircle size={40} /> : <FileText size={40} />}
                      <p className="text-sm font-black mt-4 uppercase tracking-widest">{isUploaded ? "PDF ATTACHED ✅" : "ATTACH RECEIPT (PDF/IMG)"}</p>
                      <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                   </label>
                   
                   <button 
                      onClick={(e: any) => handleSubmitVerification(e)}
                      disabled={isSubmitting || !receiptUrl}
                      className="w-full mt-8 bg-[#C8102E] text-white py-6 rounded-[2rem] font-black shadow-2xl hover:scale-105 transition-all disabled:opacity-50 text-lg uppercase tracking-widest"
                   >
                      {isSubmitting ? "UPLOADING..." : "SEND TO ADMIN"}
                   </button>
               </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-[2.5rem] p-16 shadow-2xl border border-gray-100 max-w-md w-full animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-[#002868] mb-4">
            {timeoutReached ? "Still processing..." : "Processing Payment"}
          </h2>
          <p className="text-gray-500 font-bold mb-10 text-sm italic leading-relaxed">
            {timeoutReached
              ? '"Verification is taking longer than usual. You can safely refresh or check back in a few minutes."'
              : '"Finalizing your premium recruitment access. This usually takes just a few seconds."'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#002868] text-white px-12 py-5 rounded-2xl font-black hover:bg-[#C8102E] transition-all hover:scale-105 shadow-xl text-xs tracking-widest uppercase"
          >
            REFRESH STATUS
          </button>
        </div>
      </div>
    );
  }

  const {
    paymentMethod,
    subscriptionStatus,
    transactionStatus,
    invoiceUrl,
    amountPaid,
    currency,
    planName,
    invoiceId,
    date,
    adminNote
  } = data;

  console.log('PAYMENT STATE:', {
    paymentMethod,
    transactionStatus,
    subscriptionStatus,
    invoiceUrl
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-[#002868]">
      <style jsx global>{`
        nav, header { display: none !important; }
      `}</style>

      <div className="max-w-2xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight">
            ANN <span className="text-[#C8102E]">SECURE CHECKOUT</span>
          </h1>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-50 space-y-8 relative overflow-hidden">

          {/* 🟢 STRIPE FLOW (INSTANT SUCCESS) */}
          {paymentMethod === 'STRIPE' && (transactionStatus === 'SUCCESS' || transactionStatus === 'PAID') && (
            <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top duration-700">
              <div className="bg-[#f0f9ff] border border-blue-100 rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center mb-6 shadow-2xl ring-8 ring-blue-50">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-black">Payment Successful! 🎉</h2>
                <p className="text-gray-500 font-bold mt-2">Your subscription is now active.</p>

                <div className="grid grid-cols-2 gap-6 w-full mt-10 text-left">
                  <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm">
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">Amount Paid</p>
                    <p className="text-xl font-bold">{currency?.toUpperCase()} {(amountPaid || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm">
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">Plan</p>
                    <p className="text-xl font-bold">{planName || 'Premium Plan'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full mt-4 text-left">
                  <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm overflow-hidden">
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">Invoice ID</p>
                    <p className="text-xs font-bold truncate">#{invoiceId || 'STRIPE_AUTO'}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm">
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm font-bold">{formatDate(date)}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 p-2">
                <a
                  href={invoiceUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-3 bg-[#C8102E] text-white px-8 py-6 rounded-[2rem] font-black text-sm hover:bg-[#002868] transition-all shadow-xl hover:scale-105 ${!invoiceUrl ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  <Download size={22} /> DOWNLOAD RECEIPT
                </a>
                <a
                  href={invoiceUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-3 bg-white text-[#002868] border-2 border-[#002868] px-8 py-6 rounded-[2rem] font-black text-sm hover:bg-gray-50 transition-all shadow-lg hover:scale-105 ${!invoiceUrl ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  <ExternalLink size={20} /> VIEW INVOICE
                </a>

                <Link
                  href="/employer/dashboard"
                  className="flex-1 flex items-center justify-center gap-3 bg-[#002868] text-white px-8 py-6 rounded-[2rem] font-black text-sm hover:bg-[#C8102E] transition-all shadow-xl hover:scale-105"
                >
                  GO TO DASHBOARD
                </Link>
              </div>
            </div>
          )}

          {/* 🟡 MANUAL FLOW (SIMPLIFIED) */}
          {paymentMethod === 'MANUAL' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="bg-[#f0f9ff] border border-blue-100 rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#002868] text-white rounded-full flex items-center justify-center mb-6 shadow-2xl ring-8 ring-blue-50">
                  <FileText size={48} />
                </div>
                <h2 className="text-3xl font-black">Pro-forma Invoice Ready!</h2>
                <p className="text-gray-500 font-bold mt-2 max-w-sm">Please download your invoice below to complete your bank transfer.</p>

                <div className="grid grid-cols-2 gap-6 w-full mt-10 text-left">
                  <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm">
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-xl font-bold">{currency?.toUpperCase()} {(amountPaid || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm">
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-1">Plan</p>
                    <p className="text-xl font-bold">{planName || 'Premium Plan'}</p>
                  </div>
                </div>

                <div className="w-full mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 border-dashed">
                    <p className="text-[11px] text-blue-600 font-black uppercase tracking-widest mb-1">Next Step</p>
                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                      "Once you've made the transfer, our accounts team will verify it. Your premium access will be activated manually."
                    </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 p-2">
                <button
                    onClick={async (e) => {
                      e.preventDefault();
                      const btn = e.currentTarget;
                      const originalText = btn.innerHTML;
                      btn.innerHTML = `<span class="flex items-center gap-2"><svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> DOWNLOADING...</span>`;
                      btn.disabled = true;
                      
                      try {
                        const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/subscriptions/invoice-latest/${auth?.userId}`;
                        const res = await fetch(url);
                        if (!res.ok) {
                          const err = await res.json();
                          throw new Error(err.message || "Failed to generate invoice");
                        }
                        const blob = await res.blob();
                        const blobUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = blobUrl;
                        a.download = `ANN-Invoice-${auth?.userId?.substring(0,6) || 'Latest'}.pdf`;
                        a.click();
                        window.URL.revokeObjectURL(blobUrl);
                      } catch (error: any) {
                        alert(error.message);
                      } finally {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                      }
                    }}
                  className="flex-1 flex items-center justify-center gap-3 bg-[#C8102E] text-white px-8 py-6 rounded-[2rem] font-black text-sm hover:bg-[#002868] transition-all shadow-xl hover:scale-105"
                >
                  <Download size={22} /> DOWNLOAD PDF
                </button>
                
                <Link
                  href="/employer/dashboard"
                  className="flex-1 flex items-center justify-center gap-3 bg-[#002868] text-white px-8 py-6 rounded-[2rem] font-black text-sm hover:bg-[#C8102E] transition-all shadow-xl hover:scale-105"
                >
                  GO TO DASHBOARD
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-[#002868] mx-auto mb-4" size={64} />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">INITIALIZING SECURE SESSION...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
