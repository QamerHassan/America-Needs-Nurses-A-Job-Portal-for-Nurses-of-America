"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, ExternalLink, MessageSquare, Briefcase, FileText, User, BellOff } from "lucide-react";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../utils/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export default function NotificationDropdown({ userId, role }: { userId: string; role: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const data = await getNotifications(userId);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRead = async (id: string) => {
    try {
      await markNotificationRead(id, userId);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_MESSAGE": return <MessageSquare size={16} className="text-blue-500" />;
      case "NEW_APPLICATION": return <Briefcase size={16} className="text-green-500" />;
      case "APPLICATION_UPDATE": return <FileText size={16} className="text-purple-500" />;
      case "BLOG_PUBLISHED": return <ExternalLink size={16} className="text-red-500" />;
      case "PROFILE_VIEWED": return <User size={16} className="text-orange-500" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  const getHref = (notification: Notification) => {
    const meta = notification.metadata || {};
    switch (notification.type) {
      case "NEW_MESSAGE": return role === "nurse" ? "/nurse/messages" : "/employer/messages";
      case "NEW_APPLICATION": return "/employer/applicants";
      case "APPLICATION_UPDATE": return "/nurse/applied-jobs";
      case "BLOG_PUBLISHED": return `/blog/${meta.blogSlug || ""}`;
      case "PROFILE_VIEWED": return "/nurse/profile";
      default: return "#";
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell size={20} className={unreadCount > 0 ? "text-[#002868]" : "text-slate-400"} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#C8102E] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-[#002868] text-sm uppercase tracking-wider">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleReadAll}
                  className="text-[11px] font-bold text-[#C8102E] hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  <BellOff size={32} className="text-slate-200" />
                  <p className="text-xs font-bold text-slate-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 border-b border-slate-50 relative group transition-colors ${!notif.isRead ? "bg-slate-50/50" : "hover:bg-slate-50"}`}
                  >
                    <Link 
                      href={getHref(notif)}
                      onClick={() => {
                        handleRead(notif.id);
                        setIsOpen(false);
                      }}
                      className="flex gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? "bg-white shadow-sm" : "bg-slate-100"}`}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[13px] leading-tight mb-0.5 ${!notif.isRead ? "font-bold text-[#002868]" : "text-slate-600"}`}>
                          {notif.title}
                        </span>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </Link>
                    {!notif.isRead && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#C8102E] rounded-full shadow-sm shadow-red-500/50"></div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 text-center">
              <Link 
                href={role === "nurse" ? "/nurse" : role === "employer" ? "/employer/dashboard" : "/admin"}
                className="text-[10px] font-black text-[#002868] uppercase tracking-widest hover:text-[#C8102E] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
