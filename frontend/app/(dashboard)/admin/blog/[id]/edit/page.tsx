"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ChevronLeft, Image as ImageIcon, Layout, AlertCircle, Loader2, Send, MessageSquare, Type, FileText } from "lucide-react";
import { getBlogById, updateBlog } from "@/app/utils/api";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    category: "Nursing Tips",
    status: "DRAFT",
    imageUrl: "",
    additionalImages: [""],
    blocks: [] as { id: number; type: 'text' | 'image' | 'heading' | 'quote'; value: string }[]
  });

  const addBlock = (type: 'text' | 'image' | 'heading' | 'quote') => {
    setForm({
      ...form,
      blocks: [...form.blocks, { id: Date.now(), type, value: '' }]
    });
  };

  const updateBlock = (id: number, value: string) => {
    setForm({
      ...form,
      blocks: form.blocks.map(b => b.id === id ? { ...b, value } : b)
    });
  };

  const removeBlock = (id: number) => {
    if (form.blocks.length > 1) {
      setForm({
        ...form,
        blocks: form.blocks.filter(b => b.id !== id)
      });
    }
  };

  const moveBlock = (idx: number, direction: 'up' | 'down') => {
    const newBlocks = [...form.blocks];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx >= 0 && targetIdx < newBlocks.length) {
      [newBlocks[idx], newBlocks[targetIdx]] = [newBlocks[targetIdx], newBlocks[idx]];
      setForm({ ...form, blocks: newBlocks });
    }
  };

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const data = await getBlogById(id);
      let blocks = [];
      try {
        blocks = JSON.parse(data.content);
        if (!Array.isArray(blocks)) throw new Error();
      } catch (e) {
        // Fallback for legacy plain text posts
        blocks = [{ id: Date.now(), type: 'text' as const, value: data.content || "" }];
      }

      setForm({
        title: data.title || "",
        excerpt: data.excerpt || "",
        category: data.category || "Nursing Tips",
        status: data.status || "DRAFT",
        imageUrl: data.imageUrl || "",
        additionalImages: data.additionalImages || [""],
        blocks
      });
    } catch (err) {
      setError("Failed to load blog post.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || form.blocks.every(b => !b.value.trim())) {
      setError("Title and at least some content are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        content: JSON.stringify(form.blocks)
      };
      await updateBlog(id, payload);
      router.push("/admin/blog");
    } catch (err) {
      setError("Failed to update blog post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-10 w-10 text-[#002868]" />
      </div>
    );
  }

  return (
    <div className="edit-blog-page max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-white rounded-xl shadow-sm text-gray-400 hover:text-[#002868] transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-[#002868]">Edit Article</h1>
          <p className="text-gray-500 font-medium">Updating resource for the community.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50">
            <div className="mb-8">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Article Headline</label>
              <input 
                type="text" 
                placeholder="Ex: 10 Essential Tips..." 
                className="w-full text-2xl font-black text-[#002868] bg-transparent border-b-2 border-gray-100 focus:border-[#002868] outline-none py-2 transition-all"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
              />
            </div>

            <div className="mb-8">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Short Excerpt</label>
              <textarea 
                rows={3}
                className="w-full bg-[#f8fafc] rounded-2xl p-6 text-gray-600 font-medium border border-gray-100 outline-none"
                value={form.excerpt}
                onChange={(e) => setForm({...form, excerpt: e.target.value})}
              />
            </div>

            <div className="content-blocks-editor space-y-8">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Article Sections</label>
              
              <div className="space-y-6">
                {form.blocks.map((block, idx) => (
                  <div key={block.id} className="relative group bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 hover:border-blue-100 transition-all">
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                       <button type="button" onClick={() => moveBlock(idx, 'up')} className="p-2 bg-white rounded-lg shadow-md hover:text-blue-600 disabled:opacity-30" disabled={idx === 0}><ChevronLeft className="rotate-90" size={14} /></button>
                       <button type="button" onClick={() => moveBlock(idx, 'down')} className="p-2 bg-white rounded-lg shadow-md hover:text-blue-600 disabled:opacity-30" disabled={idx === form.blocks.length - 1}><ChevronLeft className="-rotate-90" size={14} /></button>
                       <button type="button" onClick={() => removeBlock(block.id)} className="p-2 bg-white rounded-lg shadow-md hover:text-red-600 text-red-400"><Send size={14} /></button>
                    </div>

                    {block.type === 'text' && (
                      <textarea 
                        placeholder="Write article text here..." 
                        rows={6}
                        className="w-full bg-transparent text-gray-700 font-medium leading-relaxed outline-none resize-none font-serif"
                        value={block.value}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                      />
                    )}

                    {block.type === 'heading' && (
                      <input 
                        type="text"
                        placeholder="Section Heading..."
                        className="w-full bg-transparent text-xl font-black text-[#002868] outline-none"
                        value={block.value}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                      />
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-4">
                        <div className="relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Image URL..." 
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-medium outline-none"
                            value={block.value}
                            onChange={(e) => updateBlock(block.id, e.target.value)}
                          />
                        </div>
                        {block.value && (
                          <img src={block.value} className="h-40 w-full object-cover rounded-xl border border-gray-100" />
                        )}
                      </div>
                    )}

                    {block.type === 'quote' && (
                      <textarea 
                        placeholder="Pull quote..." 
                        rows={3}
                        className="w-full bg-transparent text-lg italic font-bold text-[#002868] border-l-4 border-[#C8102E] pl-6 outline-none resize-none"
                        value={block.value}
                        onChange={(e) => updateBlock(block.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-6">
                {[
                  { type: 'text', label: 'Add Text', icon: <FileText size={16} /> },
                  { type: 'heading', label: 'Add Heading', icon: <Type size={16} /> },
                  { type: 'image', label: 'Add Image', icon: <ImageIcon size={16} /> },
                  { type: 'quote', label: 'Add Quote', icon: <MessageSquare size={16} /> }
                ].map(btn => (
                  <button 
                    key={btn.type}
                    type="button"
                    onClick={() => addBlock(btn.type as any)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-[#002868] hover:text-[#002868] transition-all shadow-sm"
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
            <h3 className="text-lg font-black text-[#002868] mb-6 flex items-center gap-2">
              <Layout size={20} /> Article Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Publication Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setForm({...form, status: 'DRAFT'})}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${form.status === 'DRAFT' ? 'bg-[#002868] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    Draft
                  </button>
                  <button 
                    type="button"
                    onClick={() => setForm({...form, status: 'PUBLISHED'})}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${form.status === 'PUBLISHED' ? 'bg-[#C8102E] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    Published
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Category</label>
                <select 
                  className="w-full bg-[#f8fafc] border border-gray-100 p-4 rounded-2xl font-bold text-[#002868] text-sm outline-none"
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                >
                  <option>Nursing Tips</option>
                  <option>Career Advice</option>
                  <option>Industry News</option>
                  <option>Community Spotlight</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Additional Images (Gallery)</label>
                <div className="space-y-3">
                  {form.additionalImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        className="w-full pl-12 pr-12 py-4 bg-[#f8fafc] border border-gray-100 rounded-2xl text-xs font-medium outline-none"
                        value={img}
                        onChange={(e) => {
                          const newImgs = [...form.additionalImages];
                          newImgs[idx] = e.target.value;
                          setForm({...form, additionalImages: newImgs});
                        }}
                      />
                      {form.additionalImages.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => {
                            const newImgs = form.additionalImages.filter((_, i) => i !== idx);
                            setForm({...form, additionalImages: newImgs});
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600"
                        >
                          <Save size={16} /> {/* Using Save as a placeholder for trash icon since I don't see Trash icon imported */}
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => setForm({...form, additionalImages: [...form.additionalImages, ""]})}
                    className="text-[10px] font-black uppercase tracking-widest text-[#002868] hover:underline"
                  >
                    + Add Another Image
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 space-y-3">
              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-[#002868] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Article</>}
              </button>
              
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
