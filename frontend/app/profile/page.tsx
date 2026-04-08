"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getNursePublicProfile, updateNurseProfile, uploadAvatar, uploadResume } from "../utils/api";
import { 
  User, Mail, Phone, MapPin, Camera, FileText, 
  Plus, Edit2, Check, X, ChevronRight, Briefcase, GraduationCap 
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const { auth, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (auth?.userId) {
      fetchProfile();
    }
  }, [auth]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getNursePublicProfile(auth!.userId);
      setProfile(data);
      setEditData({
        fullName: data.fullName || "",
        location: data.location || "",
        bio: data.bio || "",
        specialization: data.specialization || ""
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth) return;

    try {
      const updatedUser = await uploadAvatar(auth.userId, file);
      // Update auth context with new image
      login({ id: auth.userId, email: auth.email, role: auth.role }, updatedUser.image);
      setProfile((prev: any) => ({ ...prev, User: { ...prev.User, image: updatedUser.image } }));
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file || !auth) return;
     try {
        await uploadResume(auth.userId, file);
        fetchProfile(); // Refresh to show new doc
     } catch (err) {
        console.error("Failed to upload resume:", err);
     }
  };

  const handleSave = async () => {
    try {
      await updateNurseProfile(auth!.userId, editData);
      setProfile((prev: any) => ({ ...prev, ...editData }));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" /></div>;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <main className="container mx-auto px-6 py-12 max-w-4xl flex-grow">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b border-gray-100">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
             <div className="w-32 h-32 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center text-4xl font-black border-4 border-white shadow-xl overflow-hidden">
                {profile?.User?.image ? (
                  <img src={profile.User.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.User?.name?.[0] || auth?.email?.[0] || "U"
                )}
             </div>
             <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>

          <div className="flex-grow text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
               {isEditing ? (
                 <input 
                   type="text" 
                   value={editData.fullName} 
                   onChange={e => setEditData({...editData, fullName: e.target.value})}
                   className="text-3xl font-black text-[#1B3A6B] bg-gray-50 border-none rounded-lg px-3 py-1 focus:ring-2 focus:ring-red-500"
                 />
               ) : (
                 <h1 className="text-4xl font-black text-[#1B3A6B]">{profile.fullName || profile.User?.name || "Professional Nurse"}</h1>
               )}
               <button 
                 onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                 className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-[#1B3A6B] hover:bg-gray-200'}`}
               >
                 {isEditing ? <span className="flex items-center gap-2"><Check size={14} /> Save Profile</span> : <span className="flex items-center gap-2"><Edit2 size={12} /> Edit</span>}
               </button>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-500 font-bold text-sm">
               <span className="flex items-center gap-2"><Mail size={16} className="text-[#CC2229]" /> {profile.User?.email}</span>
               <span className="flex items-center gap-2"><Phone size={16} className="text-[#CC2229]" /> {profile.phone || "Add Phone"}</span>
               <span className="flex items-center gap-2"><MapPin size={16} className="text-[#CC2229]" /> {profile.location || "Add Location"}</span>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-12">
              {/* Resume Section */}
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-[#1B3A6B]">Resume</h2>
                    <button onClick={() => resumeInputRef.current?.click()} className="text-[#CC2229] p-2 hover:bg-red-50 rounded-full transition-colors">
                       <Plus size={24} />
                    </button>
                    <input type="file" ref={resumeInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
                 </div>
                 {profile.documents?.length > 0 ? (
                    <div className="space-y-3">
                       {profile.documents.map((doc: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-100 transition-colors group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-red-600 shadow-sm">
                                   <FileText size={20} />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-[#1B3A6B]">{doc.name}</p>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Added {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <a href={doc.url} target="_blank" className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-600">
                                <ChevronRight size={20} />
                             </a>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                       <FileText size={32} className="mx-auto text-gray-300 mb-4" />
                       <p className="text-sm font-bold text-gray-400 mb-4">No resume uploaded yet.</p>
                       <button onClick={() => resumeInputRef.current?.click()} className="px-6 py-3 bg-[#1B3A6B] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Upload Now</button>
                    </div>
                 )}
              </section>

              {/* Bio/About */}
              <section>
                 <h2 className="text-xl font-black text-[#1B3A6B] mb-6">About Me</h2>
                 {isEditing ? (
                   <textarea 
                     value={editData.bio}
                     onChange={e => setEditData({...editData, bio: e.target.value})}
                     className="w-full h-32 bg-gray-50 border-none rounded-2xl p-6 text-sm font-semibold text-[#1B3A6B] focus:ring-2 focus:ring-red-500"
                     placeholder="Tell employers about your nursing background..."
                   />
                 ) : (
                   <p className="text-gray-500 leading-loose font-medium">
                      {profile.bio || "Write a professional summary to help employers find you."}
                   </p>
                 )}
              </section>
           </div>

           {/* Sidebar Info */}
           <div className="space-y-10">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                 <h3 className="text-sm font-black text-[#1B3A6B] mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={16} className="text-[#CC2229]" /> Qualifications
                 </h3>
                 <div className="space-y-6">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Specialization</p>
                       {isEditing ? (
                          <input 
                            value={editData.specialization}
                            onChange={e => setEditData({...editData, specialization: e.target.value})}
                            className="w-full bg-white border border-gray-100 rounded-lg p-2 text-sm font-bold text-[#1B3A6B]"
                          />
                       ) : (
                          <p className="text-sm font-black text-[#1B3A6B]">{profile.specialization || "General Nursing"}</p>
                       )}
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Skills</p>
                       <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
                          {profile.skills?.length > 0 ? profile.skills.map((s: string) => (
                             <span key={s} className="bg-white border border-gray-100 px-2 py-1 rounded text-red-600">{s}</span>
                          )) : <span className="text-gray-400 italic font-normal">No skills added</span>}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-[#1B3A6B] rounded-3xl p-8 text-white relative overflow-hidden group">
                 <div className="relative z-10">
                    <h3 className="text-sm font-black mb-4 uppercase tracking-widest flex items-center gap-2">
                       <GraduationCap size={16} className="text-red-400" /> Preference
                    </h3>
                    <p className="text-xs font-bold text-white/60 mb-6 leading-relaxed">Let employers know your availability and shift preferences.</p>
                    <button className="w-full py-3 bg-white text-[#1B3A6B] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-400 hover:text-white transition-all shadow-xl">Update</button>
                 </div>
                 <div className="absolute -right-8 -bottom-8 bg-white/5 w-32 h-32 rounded-full group-hover:scale-150 transition-all duration-700 pointer-events-none" />
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
