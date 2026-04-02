"use client";

import React, { useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Send, Loader2, Clock, User, 
  AlignLeft, ShieldAlert, Type, AlertCircle
} from "lucide-react";
import { createBlog, uploadFile } from "@/app/utils/api"; 
import ImageUpload from "@/app/components/ImageUpload";

// 1. TypeScript interface for Quill
interface QuillProps {
  ref?: any; 
  theme?: string;
  value?: string;
  onChange?: (content: string) => void;
  modules?: any;
  placeholder?: string;
}

// 2. Dynamic Import for Editor
const ReactQuill = dynamic<QuillProps>(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return RQ as any;
  },
  { 
    ssr: false,
    loading: () => <div className="h-60 w-full bg-gray-50 animate-pulse rounded-3xl border border-gray-100 flex items-center justify-center text-gray-300 font-bold">Initializing Editor...</div>
  }
);

import "react-quill-new/dist/quill.snow.css";

export default function NewBlogPage() {
  const router = useRouter();
  const quillRef = useRef<any>(null);

  // FIX: Loading yahan false hona chahiye default mein
  const [loading, setLoading] = useState(false); 
  const [isUploading, setIsUploading] = useState(false); 
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    title: "",
    author: "", 
    excerpt: "",
    category: "Nursing Tips",
    status: "DRAFT",
    imageUrl: "", 
    content: "", 
  });

  // Calculate stats
  const stats = useMemo(() => {
    const text = form.content.replace(/<[^>]*>/g, ""); 
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { time: Math.ceil(words / 200) || 1 };
  }, [form.content]);

  // Image Handler for Editor
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await uploadFile(formData); 
          const url = response.url;
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection();
          editor.insertEmbed(range.index, 'image', url);
        } catch (err) {
          setError("Image upload failed.");
        } finally {
          setIsUploading(false);
        }
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: { image: imageHandler }
    }
  }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    if (!form.title || !form.content || !form.imageUrl) {
      setError("Headline, Cover Image, and Body Content are required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = { 
        title: form.title,
        author: form.author,
        excerpt: form.excerpt,
        category: form.category,
        status: form.status,
        imageUrl: form.imageUrl,
        content: form.content
      };

      await createBlog(payload);
      router.push("/admin/blog");
    } catch (err: any) {
      setError("Failed to publish story.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto p-4 md:p-10 pb-32 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-5">
          <button onClick={() => router.back()} className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#C8102E] transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-[#002868]">Compose Story</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1 italic">Professional Content Studio</p>
          </div>
        </div>
        
        <button 
          onClick={handleSubmit} 
          disabled={loading || isUploading}
          className="bg-[#002868] text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-[#C8102E] transition-all shadow-xl flex items-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Publish Story</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          
          {isUploading && (
            <div className="bg-[#fcf2f2] border border-[#C8102E]/20 p-5 rounded-[2rem] flex items-center gap-4 text-[#002868] font-bold animate-pulse">
               <ShieldAlert className="text-[#C8102E]" size={24} />
               <p className="text-sm">Processing image... Editor locked.</p>
            </div>
          )}

          <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-50 overflow-hidden">
            <div className="p-1 border-b border-gray-50 bg-[#f8fafc]">
               <ImageUpload value={form.imageUrl} onChange={(url) => setForm({...form, imageUrl: url})} label="Upload Main Background" />
            </div>

            <div className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#C8102E]">Headline</label>
                  <input placeholder="Enter title..." className="w-full text-2xl font-black text-[#002868] border-b-2 border-gray-100 outline-none py-2 transition-all" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Written By</label>
                  <div className="flex items-center gap-3 border-b-2 border-gray-100 py-2">
                    <User size={18} className="text-gray-300" />
                    <input placeholder="Author Name" className="w-full font-bold text-[#002868] outline-none" value={form.author} onChange={(e) => setForm({...form, author: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teaser Summary</label>
                <textarea className="w-full bg-[#f8fafc] border border-gray-100 p-6 rounded-[2rem] text-gray-600 font-medium italic outline-none focus:ring-2 focus:ring-[#002868]" rows={2} placeholder="Brief summary of the article..." value={form.excerpt} onChange={(e) => setForm({...form, excerpt: e.target.value})} />
              </div>

              <div className={`space-y-4 ${isUploading ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#002868]">Body Content</label>
                <div className="rounded-[2rem] border border-gray-100 overflow-hidden shadow-inner bg-white">
                  <ReactQuill ref={quillRef} theme="snow" value={form.content} onChange={(content: string) => setForm({...form, content})} modules={modules} placeholder="Start typing your story..." />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 sticky top-10">
            <h3 className="text-xs font-black text-[#002868] uppercase tracking-[0.2em] mb-8 border-l-4 border-[#C8102E] pl-4">Settings</h3>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Category</label>
                <select className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl font-bold text-[#002868] outline-none" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                  <option>Nursing Tips</option>
                  <option>Career Advice</option>
                  <option>Healthcare News</option>
                </select>
              </div>
              <div className="flex items-center gap-3 text-[#002868] font-black text-sm bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                <Clock size={18} className="text-[#C8102E]" /> {stats.time} Minutes Read
              </div>
              <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                <button onClick={() => setForm({...form, status: 'DRAFT'})} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase ${form.status === 'DRAFT' ? 'bg-[#002868] text-white shadow-lg' : 'text-gray-400'}`}>Draft</button>
                <button onClick={() => setForm({...form, status: 'PUBLISHED'})} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase ${form.status === 'PUBLISHED' ? 'bg-[#C8102E] text-white shadow-lg' : 'text-gray-400'}`}>Live</button>
              </div>
            </div>
            {error && <div className="mt-8 p-4 bg-red-50 text-[#C8102E] rounded-2xl text-[10px] font-bold flex items-center gap-2 border border-red-100"><AlertCircle size={16}/> {error}</div>}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .ql-container { border: none !important; font-size: 18px; min-height: 400px; }
        .ql-toolbar { background: #fdfdfd; border: none !important; border-bottom: 1px solid #f1f5f9 !important; padding: 15px !important; }
        .ql-editor { min-height: 400px; padding: 30px !important; line-height: 1.8; color: #334155; }
      `}</style>
    </div>
  );
}