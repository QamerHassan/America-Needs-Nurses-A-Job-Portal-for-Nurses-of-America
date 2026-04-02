"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Share2, Bookmark, User } from "lucide-react";
import { getBlogBySlug, getActiveBlogs } from "@/app/utils/api";
import Footer from "@/app/components/Footer";

/* ─── Social Icons ─── */
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<any>(null);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FIXED: Image URL formatter
  const formatUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `http://localhost:3001${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blogData, allBlogs] = await Promise.all([
        getBlogBySlug(slug),
        getActiveBlogs()
      ]);
      setBlog(blogData);
      setRecentBlogs(allBlogs.filter((b: any) => b.slug !== slug).slice(0, 6));
    } catch (err) {
      console.error("Failed to fetch blog post", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-[#C8102E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-black text-[#002868] mb-4">Post Not Found</h1>
        <Link href="/blog" className="px-10 py-4 bg-[#C8102E] text-white rounded-2xl font-bold">
          Back to Blog
        </Link>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const sidebarTags: string[] = [
    "Travel Nursing", "ICU", "Emergency", "Pediatrics",
    "Labor & Delivery", "OR", "Oncology", "Med-Surg",
    "Telemetry", "NICU", "Hospice", "Psych"
  ];

  /* ─── Sidebar Card ─── */
  const RecentPostCard = ({ post }: { post: any }) => (
    <Link
      href={`/blog/${post.slug}`}
      className="flex items-start gap-3 p-4 group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <h4 className="text-gray-900 font-semibold text-sm leading-snug mb-2 group-hover:text-[#C8102E] transition-colors line-clamp-3">
          {post.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={11} />{formatDate(post.createdAt)}
        </div>
      </div>
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img src={formatUrl(post.imageUrl)} className="w-full h-full object-cover" alt="" />
      </div>
    </Link>
  );

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      {/* ── Breadcrumb ── */}
      <div className="bg-white pt-28 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between px-12">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <span className="bg-[#C8102E] text-white px-3 py-1 rounded-full text-xs font-semibold">
              {blog.category || "Homecare"}
            </span>
            <button onClick={() => router.push("/blog")} className="hover:text-black font-bold">
              Back to all posts
            </button>
          </div>
          <div className="hidden md:flex items-center gap-4 text-gray-400">
            <Share2 size={16} className="hover:text-[#C8102E] cursor-pointer" />
            <Bookmark size={16} className="hover:text-[#C8102E] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="pt-10 pb-24 px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* ════ ARTICLE — FIXED WIDTH & WRAPPING ════ */}
          <article className="w-full lg:w-[68%] min-w-0 overflow-hidden break-words">
            <h1 className="text-[2.2rem] md:text-[2.8rem] font-bold text-black leading-[1.15] mb-6 tracking-tight">
              {blog.title}
            </h1>

            <p className="text-[1.1rem] text-gray-600 leading-relaxed mb-6">
              {blog.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-10 text-sm text-gray-500 pb-5 border-b border-gray-100">
              <span className="flex items-center gap-1.5"><Calendar size={14} />{formatDate(blog.createdAt)}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} />{blog.readTime || '12 min'}</span>
              <span className="flex items-center gap-1.5"><User size={14} />By {blog.author || "ANN Team"}</span>
            </div>

            <div className="mb-12 overflow-hidden rounded-2xl shadow-sm border border-gray-100">
              <img src={formatUrl(blog.imageUrl)} className="w-full h-auto max-h-[500px] object-cover" alt="" />
            </div>

            {/* Content Logic with Forced Constraints */}
            <div className="blog-content-body w-full max-w-full overflow-hidden">
              {(() => {
                try {
                  const blocks = JSON.parse(blog.content);
                  if (!Array.isArray(blocks)) throw new Error();
                  return blocks.map((block: any, i: number) => (
                    <div key={i} className="w-full">
                      {block.type === "heading" && <h2 className="text-[1.8rem] font-bold text-black mb-4 mt-10">{block.value}</h2>}
                      {block.type === "text" && <p className="text-gray-600 leading-[1.9] text-[1.05rem] mb-6 whitespace-normal">{block.value}</p>}
                      {block.type === "image" && (
                        <div className="my-10 overflow-hidden rounded-2xl border border-gray-100 shadow-md">
                          <img src={formatUrl(block.value)} className="w-full h-auto" alt="" />
                        </div>
                      )}
                      {block.type === "quote" && (
                        <div className="my-10 bg-gray-50 p-8 rounded-2xl border-l-[6px] border-[#C8102E]">
                          <p className="text-gray-800 italic text-[1.1rem] font-medium">{block.value}</p>
                        </div>
                      )}
                    </div>
                  ));
                } catch {
                  return (
                    <div 
                      className="prose prose-lg max-w-full break-words text-gray-600" 
                      dangerouslySetInnerHTML={{ 
                        __html: blog.content.replace(/src="\/uploads\//g, 'src="http://localhost:3001/uploads/') 
                      }} 
                    />
                  );
                }
              })()}
            </div>

            <div className="mt-16 pt-10 border-t border-gray-100">
              <h3 className="text-[1.6rem] font-bold text-[#002868] mb-4">Take Control of Your Career</h3>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                Join the nation's premier healthcare community and discover opportunities that match your passion.
              </p>
              <Link href="/" className="inline-block px-8 py-4 bg-[#C8102E] text-white rounded-xl font-bold hover:bg-[#002868] transition-all">
                Find Your Next Job
              </Link>
            </div>
          </article>

          {/* ════ SIDEBAR — 30% ════ */}
          <aside className="w-full lg:w-[32%] lg:sticky lg:top-28 self-start space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Get Started</h3>
              <div className="flex flex-wrap gap-2">
                {sidebarTags.map((tag) => (
                  <span key={tag} className="px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-full hover:bg-[#C8102E] hover:text-white transition-all cursor-pointer border border-gray-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-[#C8102E] px-6 py-5"><h3 className="font-bold text-white uppercase tracking-wider text-sm">Latest Blogs</h3></div>
              <div className="bg-white">{recentBlogs.slice(0, 3).map((post) => <RecentPostCard key={post.id} post={post} />)}</div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-[#002868] px-6 py-5"><h3 className="font-bold text-white uppercase tracking-wider text-sm">Trending News</h3></div>
              <div className="bg-white">{recentBlogs.slice(3, 6).map((post) => <RecentPostCard key={post.id} post={post} />)}</div>
            </div>

            <div className="bg-[#f8fafc] p-8 rounded-3xl border border-gray-100 text-center">
              <h3 className="font-bold text-[#002868] mb-6">Follow Us</h3>
              <div className="flex justify-center gap-4">
                <button className="p-4 bg-white rounded-full shadow-sm hover:text-[#C8102E] transition-all"><InstagramIcon /></button>
                <button className="p-4 bg-white rounded-full shadow-sm hover:text-[#C8102E] transition-all"><LinkedinIcon /></button>
              </div>
            </div>
          </aside>

        </div>
      </div>
      <Footer />
    </div>
  );
}