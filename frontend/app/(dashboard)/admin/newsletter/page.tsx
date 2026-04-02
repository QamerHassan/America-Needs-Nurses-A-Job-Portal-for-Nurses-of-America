"use client";

import React, { useState, useEffect } from "react";
import { Mail, Send, History, Users, Search, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { getAdminSubscribers, sendNewsletter, getNewsletterHistory } from "@/app/utils/api";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'history' | 'subscribers'>('compose');
  
  // Compose State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("WEEKLY_RECAP");
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subs, hist] = await Promise.all([
        getAdminSubscribers(),
        getNewsletterHistory()
      ]);
      setSubscribers(subs);
      setHistory(hist);
    } catch (error) {
      console.error("Failed to fetch newsletter data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !content) {
      setStatusMsg({ type: 'error', text: "Please fill in all fields" });
      return;
    }

    setSending(true);
    setStatusMsg(null);
    try {
      await sendNewsletter({ title, subject, content, type });
      setStatusMsg({ type: 'success', text: "Newsletter sent successfully!" });
      setTitle("");
      setSubject("");
      setContent("");
      fetchData();
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Failed to send newsletter. Please try again." });
    } finally {
      setSending(false);
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
    <div className="newsletter-management">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002868]">Newsletter Center</h1>
          <p className="text-gray-500 mt-2">Communicate with your nursing community and healthcare partners.</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('compose')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'compose' ? 'bg-[#002868] text-white shadow-md' : 'text-gray-500 hover:text-[#002868]'}`}
          >
            Compose
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-[#002868] text-white shadow-md' : 'text-gray-500 hover:text-[#002868]'}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('subscribers')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'subscribers' ? 'bg-[#002868] text-white shadow-md' : 'text-gray-500 hover:text-[#002868]'}`}
          >
            Subscribers
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'compose' && (
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#002868]">
                <Mail size={24} />
              </div>
              <h2 className="text-xl font-bold text-[#002868]">Create New Campaign</h2>
            </div>

            <form onSubmit={handleSend} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Internal Campaign Name</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-[#f8fafc] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#002868] outline-none font-medium"
                    placeholder="e.g. March Weekly Recap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Campaign Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-5 py-4 bg-[#f8fafc] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#002868] outline-none font-medium"
                  >
                    <option value="WEEKLY_RECAP">Weekly Recap</option>
                    <option value="JOB_ALERT">Job Alert</option>
                    <option value="COMMUNITY_UPDATE">Community Update</option>
                    <option value="SYSTEM_NOTICE">System Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email Subject Line</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-5 py-4 bg-[#f8fafc] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#002868] outline-none font-medium text-lg"
                  placeholder="The subject your users will see..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email Content (Markdown Supported)</label>
                <textarea 
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-5 py-4 bg-[#f8fafc] border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#002868] outline-none font-medium resize-none"
                  placeholder="Write your newsletter here..."
                ></textarea>
              </div>

              {statusMsg && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {statusMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <span className="font-bold">{statusMsg.text}</span>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={sending}
                  className="w-full md:w-auto bg-[#C8102E] hover:bg-[#a00d25] text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  {sending ? 'Sending to Community...' : 'Send Newsletter Now'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-bottom border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                  <History size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#002868]">Campaign History</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              {history.length === 0 ? (
                <div className="p-20 text-center">
                  <Mail size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-medium">No newsletters sent yet.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc] border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Date Sent</th>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Campaign Name</th>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Subject Line</th>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5 text-sm font-semibold text-gray-500">
                          {new Date(item.sentAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-[#002868]">{item.title}</td>
                        <td className="px-8 py-5 text-sm font-medium text-gray-600">{item.subject}</td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-green-100">
                            Sent
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
             <div className="p-8 border-bottom border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                  <Users size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#002868]">Community Subscribed</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search subscribers..." 
                  className="pl-12 pr-6 py-3 bg-[#f8fafc] border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#002868] text-sm font-medium"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              {subscribers.length === 0 ? (
                <div className="p-20 text-center">
                  <Users size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-medium">No subscribers yet.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc] border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">User Email</th>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Subscribed Date</th>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest">Preferences</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-[#002868]">{sub.email}</td>
                        <td className="px-8 py-5 text-sm font-semibold text-gray-500">
                          {new Date(sub.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-gray-600">
                          {sub.isActive ? 'Active All Notifications' : 'Restricted'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .newsletter-management {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
