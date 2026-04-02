"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Do you really want to delete this? This action cannot be undone.",
  isLoading = false,
}: ConfirmDeleteModalProps) {
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#002868]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header content with Icon */}
        <div className="p-8 pb-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 ring-8 ring-red-50/50">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          
          <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">
            {title}
          </h2>
          
          <p className="text-sm font-medium text-gray-500 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer buttons */}
        <div className="p-6 pt-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              console.log("DELETE CONFIRMED");
              onConfirm();
            }}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 border border-red-600 text-white font-bold text-sm shadow-md shadow-red-600/20 hover:bg-red-700 transition-all hover:ring-2 hover:ring-red-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 size={18} /> Delete
              </>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
}
