import React from 'react';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-700 hover:rotate-12">
          <XCircle size={48} />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-[#001f5b] tracking-tight">Payment Cancelled</h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            No worries! Your payment process was cancelled and you haven't been charged. If you have any questions, feel free to reach out to our support team.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-4">
          <Link href="/pricing" className="bg-[#C8102E] text-white py-4 px-8 rounded-2xl font-black text-sm hover:translate-y-[-2px] hover:shadow-xl transition-all uppercase tracking-widest text-center">
            Try Again
          </Link>
          <Link href="/employer/dashboard" className="bg-white text-[#001f5b] border-2 border-[#001f5b]/10 py-4 px-8 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all uppercase tracking-widest text-center">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
