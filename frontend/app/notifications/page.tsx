"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../utils/api";
import { Bell, Briefcase, ChevronRight, Mail, CheckCircle2, UserCheck, MoreHorizontal, LayoutList } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!auth?.token) return;
      try {
        const data = await getNotifications(auth.token);
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [auth]);

  const handleMarkRead = async (id: string) => {
    if (!auth?.token) return;
    try {
      await markNotificationRead(auth.token, id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleReadAll = async () => {
    if (!auth?.token) return;
    try {
      await markAllNotificationsRead(auth.token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const filtered = filter === "unread" ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="container mx-auto px-6 py-12 max-w-4xl flex-grow">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-3xl font-black text-[#1B3A6B]">Notifications</h1>
           <button 
             onClick={handleReadAll}
             className="text-sm font-bold text-[#CC2229] hover:underline"
           >
             Mark all as read
           </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-10">
          <button 
            onClick={() => setFilter("all")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${filter === "all" ? 'bg-[#1B3A6B] text-white shadow-lg shadow-blue-900/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter("unread")}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all relative ${filter === "unread" ? 'bg-[#1B3A6B] text-white shadow-lg shadow-blue-900/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            Unread
            {notifications.some(n => !n.isRead) && (
               <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#CC2229] rounded-full border-2 border-white" />
            )}
          </button>
        </div>

        {/* Notif List */}
        <div className="space-y-4">
           {loading ? (
              <div className="py-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" /></div>
           ) : filtered.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-20 text-center border-2 border-dashed border-gray-100">
                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Bell className="text-gray-200" size={32} />
                 </div>
                 <h2 className="text-xl font-black text-[#1B3A6B] mb-2">No notifications yet</h2>
                 <p className="text-gray-400 font-bold max-w-sm mx-auto">We'll let you know when there's an update on your applications or a new job match.</p>
              </div>
           ) : (
              filtered.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={`group p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-5 relative overflow-hidden ${notif.isRead ? 'border-gray-100 bg-white opacity-80' : 'border-blue-100 bg-blue-50/20 shadow-md'}`}
                >
                  {/* Status Indicator */}
                  {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#CC2229] shadow-lg shadow-red-500/50" />}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${getIconBg(notif.type)}`}>
                     {getIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                     <div className="flex justify-between items-start mb-1">
                        <h3 className={`text-base font-black ${notif.isRead ? 'text-gray-500' : 'text-[#1B3A6B]'}`}>
                          {notif.title || "New Notification"}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                           {getTimeAgo(notif.createdAt)}
                        </span>
                     </div>
                     <p className={`text-sm leading-relaxed mb-4 ${notif.isRead ? 'text-gray-400' : 'text-[#1B3A6B]/80 font-medium'}`}>
                        {notif.message}
                     </p>

                     {/* Optional Action Item (Indeed Style) */}
                     {notif.type === 'JOB_INVITATION' && (
                        <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between hover:border-red-200 transition-colors">
                           <div>
                              <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Matched Role</p>
                              <p className="text-sm font-bold text-[#1B3A6B]">Registered Nurse (ICU)</p>
                           </div>
                           <ChevronRight size={18} className="text-[#CC2229]" />
                        </div>
                     )}
                  </div>

                  <button className="text-gray-300 hover:text-gray-600 transition-colors self-start p-1"><MoreHorizontal size={20}/></button>
                </div>
              ))
           )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case 'JOB_INVITATION': return <Briefcase className="text-white" size={24} />;
    case 'APPLICATION_UPDATE': return <CheckCircle2 className="text-white" size={24} />;
    case 'MESSAGE': return <Mail className="text-white" size={24} />;
    default: return <UserCheck className="text-white" size={24} />;
  }
}

function getIconBg(type: string) {
  switch (type) {
    case 'JOB_INVITATION': return 'bg-[#CC2229]';
    case 'APPLICATION_UPDATE': return 'bg-green-500';
    case 'MESSAGE': return 'bg-[#1B3A6B]';
    default: return 'bg-blue-400';
  }
}

function getTimeAgo(date: string) {
  return "2h ago"; // Simplified for UI
}
