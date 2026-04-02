"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { getAdminBlogs, deleteBlog } from "@/app/utils/api";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getAdminBlogs();
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch blog posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeletePostId(id);
  };

  const confirmDeletePost = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteBlog(id);
      setPosts(posts.filter(p => p.id !== id));
      setDeletePostId(null);
    } catch (error) {
      console.error("Failed to delete post", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "ALL" || post.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-10 w-10 text-[#002868]" />
      </div>
    );
  }

  return (
    <div className="blog-management">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002868]">Content & Resources</h1>
          <p className="text-gray-500 mt-2">Manage your nursing blog, site updates, and educational guides.</p>
        </div>
        <Link 
          href="/admin/blog/new"
          className="bg-[#002868] hover:bg-[#001d4a] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg transform hover:scale-[1.02]"
        >
          <Plus size={20} />
          Create New Article
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#002868]">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-bold text-[#002868]">Article Directory</h2>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-3 bg-[#f8fafc] border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#002868] text-sm font-medium w-full md:w-64"
              />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-2xl outline-none text-sm font-bold text-[#002868]"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredPosts.length === 0 ? (
            <div className="p-20 text-center">
              <FileText size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">No articles found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#f8fafc] border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Article Title</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Created</th>
                  <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                          {post.imageUrl ? (
                            <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileText size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#002868] line-clamp-1">{post.title}</span>
                          <span className="text-xs text-gray-400 font-medium lowercase tracking-tight italic">/{post.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-blue-50 text-[#002868] text-[10px] font-black uppercase tracking-wider rounded-lg">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {post.status === 'PUBLISHED' ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-bold text-[11px]">
                            <CheckCircle2 size={14} /> Published
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[11px]">
                            <Clock size={14} /> Draft
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-semibold text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/blog/${post.slug}`} 
                          target="_blank"
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="View Live"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          href={`/admin/blog/${post.id}/edit`}
                          className="p-2 hover:bg-gray-100 text-[#002868] rounded-lg transition-colors border border-transparent"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .blog-management {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <ConfirmDeleteModal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={() => deletePostId && confirmDeletePost(deletePostId)}
        title="Delete Article?"
        message="This will permanently delete this blog post. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
