"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getConversations, getMessages, sendMessage } from "../utils/api";
import { Send, Search, MoreHorizontal, User, MessageSquare, Image as ImageIcon, Paperclip } from "lucide-react";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  useEffect(() => {
    if (auth?.userId) {
      fetchConversations();
    }
  }, [auth]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
    }
  }, [selectedConv]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await getConversations(auth!.userId);
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const data = await getMessages(auth!.userId, convId);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    try {
      const sent = await sendMessage(auth!.userId, selectedConv.id, newMessage);
      setMessages(prev => [...prev, sent]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F3F2F1]">
      <main className="flex-grow flex overflow-hidden container mx-auto px-6 py-8 max-w-[1440px]">
        {/* Sidebar */}
        <div className="w-full md:w-[380px] bg-white rounded-l-2xl border-r border-gray-100 flex flex-col shadow-xl shadow-black/5 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-white">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-black text-[#1B3A6B]">Messages</h2>
               <div className="flex items-center gap-2">
                 <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Online</span>
               </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Inbox" 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CC2229] transition-all text-sm font-semibold"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto no-scrollbar">
            {loading ? (
               <div className="p-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" /></div>
            ) : conversations.length === 0 ? (
               <div className="p-10 text-center text-gray-400 font-bold text-sm">No messages yet.</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full p-5 flex items-center gap-4 transition-all hover:bg-gray-50 border-b border-gray-50 text-left ${selectedConv?.id === conv.id ? 'bg-red-50/50 border-l-4 border-l-[#CC2229]' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center font-bold shadow-sm">
                    {conv.otherUser?.name?.[0] || 'U'}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-black text-[#1B3A6B] truncate">{conv.otherUser?.name || "System Message"}</span>
                      <span className="text-[10px] font-bold text-gray-400">12:45 PM</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate italic">"Found a great match for your resume..."</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Pane */}
        <div className="flex-grow bg-white rounded-r-2xl flex flex-col items-center justify-center shadow-xl shadow-black/5 relative overflow-hidden">
          {selectedConv ? (
            <div className="w-full h-full flex flex-col bg-white">
               {/* Chat Header */}
               <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1B3A6B] text-white flex items-center justify-center font-bold">
                       {selectedConv.otherUser?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h3 className="font-black text-[#1B3A6B] leading-none mb-1">{selectedConv.otherUser?.name}</h3>
                      <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active Now</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                     <button className="hover:text-[#CC2229] transition-colors"><Search size={20}/></button>
                     <button className="hover:text-[#CC2229] transition-colors"><MoreHorizontal size={20}/></button>
                  </div>
               </div>

               {/* Messages Window */}
               <div className="flex-grow p-8 overflow-y-auto bg-gray-50/50 space-y-6 flex flex-col no-scrollbar">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`max-w-[70%] flex flex-col ${msg.userId === auth?.userId ? 'self-end items-end' : 'self-start items-start'}`}>
                       <div className={`px-5 py-3 rounded-2xl text-sm font-semibold shadow-sm ${msg.userId === auth?.userId ? 'bg-[#CC2229] text-white rounded-tr-none' : 'bg-white text-[#1B3A6B] rounded-tl-none border border-gray-100'}`}>
                          {msg.content}
                       </div>
                       <span className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-tighter">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  ))}
               </div>

               {/* Composer */}
               <div className="p-6 bg-white border-t border-gray-100">
                  <form onSubmit={handleSend} className="flex items-center gap-4">
                     <div className="flex items-center gap-2 text-gray-400">
                        <button type="button" className="p-2 hover:text-[#CC2229] transition-colors"><Paperclip size={20}/></button>
                        <button type="button" className="p-2 hover:text-[#CC2229] transition-colors"><ImageIcon size={20}/></button>
                     </div>
                     <input 
                       type="text" 
                       value={newMessage}
                       onChange={(e) => setNewMessage(e.target.value)}
                       placeholder="Type your message here..." 
                       className="flex-grow bg-gray-50 border border-gray-100 rounded-2xl px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#CC2229] transition-all text-sm font-semibold text-gray-800"
                     />
                     <button type="submit" className="w-12 h-12 bg-[#CC2229] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                        <Send size={20} />
                     </button>
                  </form>
               </div>
            </div>
          ) : (
            <div className="text-center p-12 animate-in fade-in zoom-in duration-500">
              <div className="mb-8 relative inline-block group">
                 <div className="absolute -inset-4 bg-red-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                 <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-chat-6231018-5114707.png" alt="" className="w-64 h-auto relative drop-shadow-2xl" />
              </div>
              <h1 className="text-3xl font-black text-[#1B3A6B] mb-3">Welcome to Messages</h1>
              <p className="text-gray-400 font-bold text-sm max-w-sm mx-auto leading-relaxed">
                When an employer messages you, conversations show up here. Stay tuned for career opportunities!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
