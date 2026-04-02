"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Upload, CheckCircle, AlertCircle, Loader2, FileText, Globe, GraduationCap, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export default function ApplyModal({ isOpen, onClose, jobId, jobTitle, companyName }: ApplyModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    authorized: "yes",
    degree: "yes",
    createAlert: true
  });

  useEffect(() => {
    if (auth?.email) {
      setFormData(prev => ({
        ...prev,
        email: auth.email
      }));
    }
  }, [auth, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/uploads`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      setResumeUrl(result.url);
      setResumeName(file.name);
    } catch (err) {
      setError("Failed to upload resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl) {
      setError("Please upload your resume first.");
      return;
    }

    setLoading(true);
    setError("");

    if (!auth?.userId || !auth?.token) {
      setError("You must be logged in to apply.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": auth.userId,
          "Authorization": `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          jobId,
          resumeUrl,
          experience: {
            authorized: formData.authorized,
            degree: formData.degree,
            createAlert: formData.createAlert,
            submittedName: formData.name,
            submittedEmail: formData.email
          }
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit application.");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#001f5b]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Progress Bar (ANN Red) */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#f0f4f8]">
          <div className={`h-full bg-[#C8102E] transition-all duration-500 ${resumeUrl ? "w-full" : "w-1/2"}`} />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        {success ? (
          <div className="p-10 text-center space-y-6 py-16">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#002868] mb-2">Application Sent!</h2>
              <p className="text-gray-500 font-medium leading-relaxed">Your application for <span className="text-[#C8102E] font-bold">{jobTitle}</span> was submitted successfully.</p>
            </div>
            <button 
              onClick={onClose}
              className="w-full bg-[#002868] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#001f5b] transition-all shadow-xl shadow-blue-500/10"
            >
              Back to Job
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 pt-10">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-[#002868] tracking-tight">Ready To Apply?</h2>
              <p className="text-[13px] font-medium text-gray-400 mt-1">Complete your eligibility checklist and get started.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-[13px] font-bold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Inputs */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#002868] uppercase tracking-wider ml-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:bg-white focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/5 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-[#002868] uppercase tracking-wider ml-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="nurse@example.com"
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:bg-white focus:border-[#C8102E] focus:ring-4 focus:ring-[#C8102E]/5 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Resume Upload */}
              <div className="pt-2">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`w-full py-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 shadow-sm ${
                    resumeUrl 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                      : "bg-gray-50/50 border-gray-200 text-gray-500 hover:border-[#002868]/30 hover:bg-white"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-[13px] font-bold">Uploading Resume...</span>
                    </>
                  ) : resumeUrl ? (
                    <>
                      <FileText size={18} />
                      <span className="text-[13px] font-bold truncate max-w-[200px]">{resumeName}</span>
                      <Check size={14} className="ml-auto mr-2" />
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span className="text-[13px] font-bold">Upload Resume (PDF/DOC)</span>
                    </>
                  )
                  }
                </button>
              </div>

              {/* Checklist */}
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-[#C8102E]" />
                    <span className="text-[12px] font-bold text-[#002868]">Authorized to work in the USA?</span>
                  </div>
                  <div className="flex gap-6">
                    {["yes", "no"].map(val => (
                      <label key={val} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="authorized" 
                            checked={formData.authorized === val}
                            onChange={() => setFormData({...formData, authorized: val})}
                            className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-full checked:border-[#C8102E] transition-all"
                          />
                          <div className="absolute w-3 h-3 bg-[#C8102E] rounded-full scale-0 peer-checked:scale-100 transition-all duration-300" />
                        </div>
                        <span className="text-sm font-black text-gray-400 uppercase tracking-tighter group-hover:text-[#002868] transition-colors">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-[#C8102E]" />
                    <span className="text-[12px] font-bold text-[#002868]">Do you have the required degree?</span>
                  </div>
                  <div className="flex gap-6">
                    {["yes", "no"].map(val => (
                      <label key={val} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="degree" 
                            checked={formData.degree === val}
                            onChange={() => setFormData({...formData, degree: val})}
                            className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-full checked:border-[#C8102E] transition-all"
                          />
                          <div className="absolute w-3 h-3 bg-[#C8102E] rounded-full scale-0 peer-checked:scale-100 transition-all duration-300" />
                        </div>
                        <span className="text-sm font-black text-gray-400 uppercase tracking-tighter group-hover:text-[#002868] transition-colors">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 pt-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={formData.createAlert}
                      onChange={() => setFormData({...formData, createAlert: !formData.createAlert})}
                      className="peer appearance-none w-6 h-6 border-2 border-gray-200 rounded-xl checked:bg-[#002868] checked:border-[#002868] transition-all"
                    />
                    <Check size={14} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform duration-300" />
                  </div>
                  <span className="text-[11px] font-black text-gray-400 group-hover:text-[#002868] uppercase tracking-wider transition-colors">Create Job Alert for similar roles</span>
                </label>
              </div>

              {/* Submit */}
              <button 
                type="submit"
                disabled={loading || uploading}
                className="w-full mt-4 bg-[#C8102E] text-white py-5 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#a80d26] hover:translate-y-[-24e-1] active:translate-y-[1px] transition-all disabled:opacity-50 shadow-xl shadow-red-500/20"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Submit Application"
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-[11px] font-bold text-gray-400">
                  Don't have an account yet? <button type="button" className="text-[#002868] hover:text-[#C8102E] transition-colors">Sign Up</button>
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
