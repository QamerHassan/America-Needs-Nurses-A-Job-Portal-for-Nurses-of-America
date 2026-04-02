"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, ChevronRight, Search, Tag, ArrowRight, Loader2 } from "lucide-react";
import { getActiveBlogs } from "@/app/utils/api";
import Footer from "@/app/components/Footer";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await getActiveBlogs();
      setBlogs(data);
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin h-12 w-12 text-[#002868]" />
      </div>
    );
  }

  return (
    <div className="blog-list-page bg-white min-h-screen font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 tracking-tight">
            Nurse <span className="text-[#fc5c65]">Insights</span> & Resources
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Stay updated with the latest nursing trends, career advice, and community stories.
          </p>
          <div className="mt-12 max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#002868] transition-colors" size={24} />
            <input
              type="text"
              placeholder="Search articles, tips, or news..."
              className="w-full pl-16 pr-8 py-6 bg-white rounded-3xl shadow-sm border border-gray-100 focus:border-[#fc5c65] outline-none font-semibold text-black"
            />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl font-bold text-black flex items-center gap-4">
              <span className="w-12 h-1.5 bg-[#fc5c65] rounded-full" />
              Recent Articles
            </h2>
            <div className="flex gap-4">
              {["Trending", "Latest", "Popular"].map(t => (
                <button key={t} className="px-6 py-2 bg-gray-50 text-gray-500 rounded-full font-bold text-xs hover:bg-black hover:text-white transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="group flex flex-col h-full bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 hover:border-[#fc5c65] transition-all hover:shadow-lg">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={blog.imageUrl || "https://images.unsplash.com/photo-1576091160550-2173bc39978c?q=80&w=2070"}
                    alt={blog.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-black uppercase tracking-widest border border-white/20">
                    {blog.category}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-6">
                    <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2"><Clock size={14} /> 10 min read</span>
                  </div>
                  <h3 className="text-2xl font-bold text-black leading-tight mb-4 group-hover:text-[#fc5c65] transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-auto line-clamp-3">
                    {blog.excerpt || "No summary available for this post. Click to read more about this topic..."}
                  </p>
                  <div className="pt-8 mt-8 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-sm font-bold text-black group-hover:translate-x-2 transition-transform inline-flex items-center gap-2 group-hover:text-[#fc5c65]">
                      Read More <ArrowRight size={16} />
                    </span>
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#fc5c65] transition-colors">
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {blogs.length === 0 && (
            <div className="text-center py-40 bg-gray-50 rounded-[4rem] border border-gray-100">
              <Loader2 className="h-16 w-16 text-[#002868]/10 mx-auto mb-8" />
              <h3 className="text-3xl font-black text-[#002868] mb-4">No Articles Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto font-medium">Our editors are working hard to bring you the best content. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-[#002868]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-[#C8102E] rounded-[4rem] p-16 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 shadow-2xl">
            <div className="relative z-10 flex-1 text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                Don't Miss Any <br /> Updates.
              </h2>
              <p className="text-white/80 text-lg font-bold max-w-sm">
                Get the latest job alerts and nursing news delivered weekly.
              </p>
            </div>
            <div className="relative z-10 w-full md:w-1/2 lg:w-1/3">
              <div className="flex p-3 bg-white/10 backdrop-blur-xl rounded-[2.5rem] border border-white/20">
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="bg-transparent text-white placeholder:text-white/40 flex-1 px-6 font-bold outline-none border-none"
                />
                <button className="bg-white text-[#C8102E] px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all shadow-xl">
                  Join Now
                </button>
              </div>
              <p className="mt-4 text-[10px] text-white/40 font-bold uppercase tracking-widest text-center md:text-left px-6">
                Join 50k+ nurses already subscribed
              </p>
            </div>
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full -ml-48 -mb-48 blur-3xl" />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
