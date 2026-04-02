"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../layout";
import { getConversations, getMessages, sendMessage, deleteConversation } from "../../../utils/api";
import { Trash2 } from "lucide-react";

export default function NurseMessagesPage() {
  const { data, loading: dashboardLoading } = useDashboard();
  const user = data?.user;

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const convs = await getConversations(user.id);
      setConversations(convs);
      if (convs.length > 0 && !activeConvId) {
        setActiveConvId(convs[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    if (user) flexFetch();
    async function flexFetch() {
      await fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId, user]);

  const loadMessages = async (convId: string) => {
    setLoadingMsg(true);
    try {
      const msgs = await getMessages(user.id, convId);
      setMessages(msgs);
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvId || !user) return;
    try {
      const sent = await sendMessage(user.id, activeConvId, newMessage);
      setMessages([...messages, sent]);
      setNewMessage("");
      // optionally refresh conversations to update latest message
      fetchConversations();
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConvId || !user) return;
    
    if (!window.confirm("Are you sure you want to delete this entire conversation? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteConversation(user.id, activeConvId);
      alert("Conversation deleted successfully");
      setActiveConvId(null);
      setMessages([]);
      fetchConversations();
    } catch (error) {
      console.error("Failed to delete conversation", error);
      alert("Failed to delete conversation");
    }
  };

  const getOtherUser = (conv: any) => {
    const defaultUser = { name: "Unknown", image: "", logo: "" };
    if (!conv.ConversationMember) return defaultUser;
    const otherMember = conv.ConversationMember.find((m: any) => m.userId !== user?.id);
    if (!otherMember || !otherMember.User) return defaultUser;
    
    const u = otherMember.User;
    // If it's an employer, try to get their company logo
    const companyLogo = u.Company?.[0]?.logoUrl;
    
    return {
      ...u,
      logo: companyLogo || u.image || ""
    };
  };

  if (dashboardLoading || loadingConv) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading Conversations...</div>;
  }


  return (
    <div className="messages-page">
      <div className="content-header">
        <h1 className="page-title">Message Inbox</h1>
        <div className="breadcrumbs">
          <span>Candidate</span> / <span>Dashboard</span> / <span className="active">Chat & Messages</span>
        </div>
      </div>

      <div className="chat-container">
        {/* Sidebar List */}
        <div className="chat-sidebar">
          {conversations.length === 0 ? (
            <div className="p-4 text-gray-500">No conversations yet.</div>
          ) : (
            conversations.map(conv => {
              const otherUser = getOtherUser(conv);
              const latestMsg = conv.Message?.[0];
              
              // Handle relative logo paths
              const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
              const rawLogo = otherUser.logo || otherUser.image;
              const formattedLogo = rawLogo 
                ? (rawLogo.startsWith('http') ? rawLogo : `${apiBase}${rawLogo.startsWith('/') ? '' : '/'}${rawLogo}`)
                : null;
                
              const safeLogo = formattedLogo || `https://ui-avatars.com/api/?name=${(otherUser.name || "U").substring(0, 2)}&background=0D8ABC&color=fff`;
              const timeStr = latestMsg ? new Date(latestMsg.createdAt).toLocaleDateString() : "";

              return (
              <div key={conv.id} className={`chat-user-item ${conv.id === activeConvId ? 'active' : ''}`} onClick={() => setActiveConvId(conv.id)}>
                <div className="user-avatar-wrapper">
                  <img 
                    src={safeLogo} 
                    className="user-avatar" 
                    alt={otherUser.name} 
                    onError={(e: any) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${(otherUser.name || "U").substring(0, 2)}&background=0D8ABC&color=fff`;
                    }}
                  />
                  <div className={`status-indicator online`}></div>
                </div>
                <div className="user-meta">
                  <div className="user-meta-top">
                    <span className="user-name">{otherUser.name || "Unknown User"}</span>
                    <span className="user-time">{timeStr}</span>
                  </div>
                  <div className="user-excerpt">{latestMsg?.content || "No messages yet"}</div>
                </div>
              </div>
            )})
          )}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {activeConvId ? (
            <>
              <div className="chat-header">
                <h3 className="chat-partner-name">
                  {getOtherUser(conversations.find(c => c.id === activeConvId)).name || "Chat"}
                </h3>
                <button 
                  className="btn-delete-conv"
                  onClick={handleDeleteConversation}
                >
                  Delete Conversation
                </button>
              </div>

              <div className="chat-body">
                {loadingMsg ? (
                  <div className="text-gray-500 text-center">Loading Messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-gray-500 text-center">No messages yet. Send one to start the conversation!</div>
                ) : (
                  messages.map(msg => {
                    const isSent = msg.senderId === user?.id;
                    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                    
                    const senderImg = isSent ? user?.image : null;
                    const formattedSenderImg = senderImg 
                      ? (senderImg.startsWith('http') ? senderImg : `${apiBase}${senderImg.startsWith('/') ? '' : '/'}${senderImg}`)
                      : null;

                    const avatarStr = isSent 
                       ? formattedSenderImg || `https://ui-avatars.com/api/?name=${(user?.name || "U").substring(0,2)}&background=1e8e3e&color=fff`
                       : `https://ui-avatars.com/api/?name=${(msg.User?.name || "U").substring(0,2)}&background=0D8ABC&color=fff`;

                    return (
                      <div key={msg.id} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
                        {!isSent && (
                          <img 
                            src={avatarStr} 
                            className="msg-avatar" 
                            alt="Avatar" 
                            onError={(e: any) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${(msg.User?.name || "U").substring(0,2)}&background=0D8ABC&color=fff`;
                            }}
                          />
                        )}
                        <div className="msg-bubble">
                          {msg.content}
                        </div>
                        {isSent && (
                          <img 
                            src={avatarStr} 
                            className="msg-avatar" 
                            alt="Avatar" 
                            onError={(e: any) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${(user?.name || "U").substring(0,2)}&background=1e8e3e&color=fff`;
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="chat-input-area">
                <textarea 
                  className="chat-textarea" 
                  placeholder="Your Message..." 
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                ></textarea>
                <button className="btn-send-message" onClick={handleSend} disabled={!newMessage.trim()}>Send Message</button>
              </div>
            </>
          ) : (
             <div className="flex items-center justify-center flex-1 text-gray-500">
               Select a conversation to start chatting.
             </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .messages-page {
          max-width: 1200px;
          height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
        }
        
        /* THE PREMIUM CONVERSATION SLIDER */
        .chat-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .chat-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-sidebar::-webkit-scrollbar-thumb {
          background: rgba(0, 40, 104, 0.1);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .chat-sidebar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 40, 104, 0.3);
        }

        .content-header {
          margin-bottom: 24px;
        }
        .page-title {
          font-size: 28px;
          margin-bottom: 8px;
          color: #002868;
        }
        .breadcrumbs {
          font-size: 14px;
          color: #718096;
        }
        .breadcrumbs span.active {
          color: #002868;
          font-weight: 600;
        }

        .chat-container {
          flex: 1;
          display: flex;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #edf2f7;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          overflow: hidden;
          min-height: 500px;
        }

        /* Sidebar */
        .chat-sidebar {
          width: 320px;
          border-right: 1px solid #edf2f7;
          overflow-y: auto;
          background: #fff;
        }
        .chat-user-item {
          display: flex;
          padding: 20px 24px;
          border-bottom: 1px solid #edf2f7;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          gap: 16px;
        }
        .chat-user-item:hover, .chat-user-item.active {
          background: #f8fafc;
        }
        .chat-user-item:hover {
          transform: translateX(4px);
        }
        .chat-user-item.active {
          border-left: 3px solid #C8102E; /* Red active indicator */
          background: #f0f4f8;
        }
        
        .user-avatar-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          border-radius: 50%;
        }
        .user-avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #f0f0f0;
        }
        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #fff;
          background: #10b981; /* Green */
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        }
        .status-indicator.offline {
          background: #cbd5e1; /* Gray */
        }

        .user-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
        }
        .user-meta-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .user-name {
          font-weight: 700;
          color: #002868;
          font-size: 14px;
        }
        .user-time {
          font-size: 11px;
          color: #718096;
          font-weight: 600;
        }
        .user-excerpt {
          font-size: 13px;
          color: #718096;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        /* Chat Window */
        .chat-window {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 30px;
          background: #fff;
          border-bottom: 1px solid #edf2f7;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .chat-partner-name {
          font-size: 18px;
          font-weight: 800;
          color: #002868;
          margin: 0;
        }
        .btn-delete-conv {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #ef4444;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .btn-delete-conv:hover {
          background: #ef4444;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .chat-body {
          flex: 1;
          padding: 30px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .message-wrapper {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          max-width: 80%;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-wrapper.received {
          align-self: flex-start;
        }
        .message-wrapper.sent {
          align-self: flex-end;
          justify-content: flex-end;
        }
        
        .msg-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        
        .msg-bubble {
          padding: 16px 20px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          color: #1e293b;
          font-weight: 500;
        }
        .received .msg-bubble {
          background: #fff;
          border: 1px solid #edf2f7;
          border-top-left-radius: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .sent .msg-bubble {
          background: #e6f4ea; /* Light green tint matching platform theme */
          border: 1px solid #bce8cb;
          color: #166534;
          border-top-right-radius: 0;
          box-shadow: 0 4px 12px rgba(22, 101, 52, 0.05);
        }

        .chat-input-area {
          padding: 24px 30px;
          background: #fff;
          border-top: 1px solid #edf2f7;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chat-textarea {
          width: 100%;
          padding: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          resize: none;
          transition: all 0.2s;
          font-family: inherit;
          background: #f8fafc;
        }
        .chat-textarea:focus {
          outline: none;
          border-color: #002868;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(0, 40, 104, 0.05);
        }
        .btn-send-message {
          align-self: flex-end;
          background: #1e8e3e; /* Green send button */
          color: #fff;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 12px rgba(30, 142, 62, 0.2);
        }
        .btn-send-message:hover {
          background: #146c2e;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(30, 142, 62, 0.3);
        }
        .btn-send-message:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 900px) {
          .chat-container {
            flex-direction: column;
          }
          .chat-sidebar {
            width: 100%;
            height: 250px;
            border-right: none;
            border-bottom: 1px solid #edf2f7;
          }
          .messages-page {
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}
