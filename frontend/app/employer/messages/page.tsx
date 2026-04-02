"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Send, Paperclip, MoreVertical, Search, 
  Trash2, Phone, Video, Info, User as UserIcon, CheckCircle, MessageSquare, Users, Loader2, SearchX, Check, CheckCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface User {
  id: string;
  name: string;
  image?: string;
  role: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  User: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  updatedAt: string;
  ConversationMember: {
    userId: string;
    User: User;
  }[];
  Message: Message[];
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user");
  const { auth } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = auth?.userId ?? null;
  const token = auth?.token ?? null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Load
  useEffect(() => {
    if (!currentUserId || !token) return;
    
    const initialize = async () => {
      setLoading(true);
      await fetchConversations();
      
      // If we have a target user from the search params, link them
      if (targetUserId) {
        await handleTargetUser(targetUserId);
      }
      
      setLoading(false);
    };

    initialize();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentUserId, targetUserId]);

  // Poll for messages
  useEffect(() => {
    if (activeChat && !loading) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      
      pollingRef.current = setInterval(() => {
        fetchMessages(activeChat.id, true);
      }, 5000); // Poll every 5 seconds
    }
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeChat, loading]);

  const fetchConversations = async () => {
    if (!currentUserId || !token) return [];
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/conversations`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-user-id": currentUserId
        }
      });
      if (!res.ok) throw new Error("Failed to load inbox.");
      const data = await res.json();
      setConversations(data);
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchMessages = async (conversationId: string, isPolling = false) => {
    if (!currentUserId || !token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/conversations/${conversationId}/messages`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-user-id": currentUserId
        }
      });
      if (!res.ok) throw new Error("Failed to sync messages.");
      const data = await res.json();
      if (!isPolling || data.length !== messages.length) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTargetUser = async (uid: string) => {
    if (!currentUserId || !token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/conversations/private`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-user-id": currentUserId
        },
        body: JSON.stringify({ targetUserId: uid })
      });
      if (!res.ok) throw new Error("Could not bridge with applicant.");
      const conversation = await res.json();
      setActiveChat(conversation);
      setMessages(conversation.Message || []);
      await fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    const content = newMessage;
    setNewMessage("");
    setSending(true);

    // Optimistic Update
    const tempMsg: Message = {
      id: Math.random().toString(),
      content,
      senderId: currentUserId!,
      createdAt: new Date().toISOString(),
      User: { id: currentUserId!, name: auth?.email ?? "Me" }
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/conversations/${activeChat.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token ?? ""}`,
          "x-user-id": currentUserId ?? ""
        },
        body: JSON.stringify({ content })
      });
      
      if (!res.ok) throw new Error("Delivery failed.");
      const savedMsg = await res.json();
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? savedMsg : m));
      fetchConversations();
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      alert("Failed to send message. Please check your connection.");
    } finally {
      setSending(false);
    }
  };

  const getOtherMember = (convo: Conversation) => {
    return convo.ConversationMember.find(m => m.userId !== currentUserId)?.User;
  };

  const filteredConversations = conversations.filter(c => {
    const other = getOtherMember(c);
    return other?.name.toLowerCase().includes(search.toLowerCase());
  });

  if (!currentUserId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Users size={48} className="text-gray-200" />
        <p className="text-sm font-black text-[#002868] uppercase tracking-widest">Authentication Required</p>
        <Link href="/employer/login" className="px-6 py-2 bg-[#C8102E] text-white rounded-xl font-bold text-xs">Login as Employer</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#002868] mb-1">Employer Messages</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <Link href="/employer/dashboard" className="hover:text-[#002868]">Employer</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#C8102E] font-bold text-xs uppercase tracking-widest">In-App Chat Hub</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left: Contact List */}
        <div className="w-full lg:w-96 border-r border-gray-50 flex flex-col bg-white">
          <div className="p-6 border-b border-gray-50">
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#002868] transition-colors" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#C8102E]/10 focus:ring-4 focus:ring-[#C8102E]/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading && conversations.length === 0 ? (
               <div className="p-10 text-center space-y-4">
                  <Loader2 className="animate-spin mx-auto text-[#C8102E]" size={24} />
                  <p className="text-[10px] font-black text-[#002868] uppercase tracking-widest">Opening Connections...</p>
               </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((convo) => {
                const other = getOtherMember(convo);
                const lastMsg = convo.Message?.[0];
                const isActive = activeChat?.id === convo.id;

                return (
                  <button
                    key={convo.id}
                    onClick={() => {
                        setActiveChat(convo);
                        fetchMessages(convo.id);
                    }}
                    className={`w-full flex items-center gap-4 px-6 py-5 border-b border-gray-50 transition-all ${
                      isActive 
                        ? "bg-blue-50/50 border-l-4 border-l-[#C8102E]" 
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                        {other?.image ? (
                          <img src={other.image} alt={other.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-black truncate transition-colors ${isActive ? "text-[#002868]" : "text-gray-700"}`}>
                          {other?.name}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400">
                          {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "New"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-400 truncate leading-relaxed">
                        {lastMsg ? lastMsg.content : "Start a conversation..."}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <SearchX size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-sm font-black text-[#002868] mb-1">No matches found</h3>
                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed max-w-[180px]">
                        We couldn't find any conversations matching your search.
                    </p>
                </div>
            )}
          </div>
        </div>

        {/* Right: Chat Window */}
        <div className="flex-1 flex flex-col bg-[#fcfdfe]">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white border-b border-gray-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                    {getOtherMember(activeChat)?.image ? (
                        <img src={getOtherMember(activeChat)?.image} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#002868]">{getOtherMember(activeChat)?.name}</h4>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Now</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-gray-400 hover:text-[#002868] hover:bg-gray-50 rounded-xl transition-all"><Phone size={18} /></button>
                  <button className="p-2.5 text-gray-400 hover:text-[#002868] hover:bg-gray-50 rounded-xl transition-all"><Video size={18} /></button>
                  <button className="p-2.5 text-gray-400 hover:text-[#C8102E] hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[70%] group`}>
                        <div className={`px-5 py-4 rounded-3xl text-sm font-medium leading-relaxed relative ${
                          isMe 
                            ? "bg-[#002868] text-white rounded-tr-none shadow-lg shadow-blue-900/10" 
                            : "bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm"
                        }`}>
                          {msg.content}
                          
                          {isMe && (
                              <div className="absolute -bottom-5 right-0 flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  <CheckCheck size={10} className="text-[#C8102E]" />
                              </div>
                          )}
                          {!isMe && (
                               <span className="absolute -bottom-5 left-0 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                   {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-gray-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                  <button type="button" className="p-3.5 text-gray-400 hover:text-[#002868] hover:bg-gray-50 rounded-2xl transition-all">
                    <Paperclip size={20} />
                  </button>
                  <div className="flex-1 relative group">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message to applicant..."
                      className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#C8102E]/20 focus:ring-4 focus:ring-[#C8102E]/5 rounded-3xl px-6 py-4 text-sm font-bold transition-all outline-none pr-16"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl transition-all shadow-md active:scale-95 ${
                        newMessage.trim() 
                          ? "bg-[#C8102E] text-white hover:bg-[#a80d26]" 
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/20">
              <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center mb-6 animate-pulse">
                <MessageSquare size={40} className="text-[#C8102E]" />
              </div>
              <h3 className="text-xl font-black text-[#002868] mb-2 tracking-tight">Select a conversation</h3>
              <p className="text-[13px] font-medium text-gray-400 text-center max-w-sm leading-relaxed">
                Choose a candidate from the recruitment pool on the left to review applications and start direct messaging.
              </p>
              <div className="mt-8 flex gap-3">
                  <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] font-black text-[#002868] uppercase tracking-widest">Real-time Sync Active</span>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
