"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../layout";
import { 
  getGlobalChat, 
  getMessages, 
  sendMessage, 
  getCommunityPosts, 
  createCommunityPost 
} from "../../../utils/api";
import { MessageSquare, Users, Send, PlusCircle, Clock, MessageCircle, Share2, Heart } from "lucide-react";

export default function NurseCommunityPage() {
  const { data, loading: dashboardLoading } = useDashboard();
  const user = data?.user;

  const [activeTab, setActiveTab] = useState<'chat' | 'posts'>('chat');
  
  // Chat State
  const [globalChat, setGlobalChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);

  // Posts State
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  useEffect(() => {
    if (user) {
      initCommunity();
    }
  }, [user]);

  const initCommunity = async () => {
    try {
      const [chatData, postsData] = await Promise.all([
        getGlobalChat(user.id),
        getCommunityPosts(user.id)
      ]);
      setGlobalChat(chatData);
      setPosts(postsData);
      if (chatData) {
        loadMessages(chatData.id);
      }
    } catch (error) {
      console.error("Failed to initialize community:", error);
    } finally {
      setLoadingChat(false);
      setLoadingPosts(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setLoadingMsg(true);
    try {
      const msgs = await getMessages(user.id, convId);
      setMessages(msgs);
    } catch (error) {
      console.error("Failed to load community messages:", error);
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !globalChat || !user) return;
    try {
      const sent = await sendMessage(user.id, globalChat.id, newMessage);
      setMessages([...messages, sent]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send community message:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !user) return;
    try {
      const created = await createCommunityPost(user.id, newPost.title, newPost.content);
      setPosts([created, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowCreatePost(false);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  if (dashboardLoading || loadingChat) {
    return <div className="flex items-center justify-center min-h-[400px] text-[#002868] font-medium">Entering Community...</div>;
  }

  return (
    <div className="community-page">
      <div className="content-header">
        <h1 className="page-title">Nurse Community</h1>
        <p className="page-subtitle">Connect, share, and grow with pre-vetted nursing professionals.</p>
        
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={18} />
            Nurse Live Chat
          </button>
          <button 
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <Users size={18} />
            Professional Discussions
          </button>
        </div>
      </div>

      <div className="community-container">
        {activeTab === 'chat' ? (
          <div className="chat-interface">
            <div className="chat-header">
              <div className="chat-info">
                <div className="group-icon">
                  <Users size={20} color="#fff" />
                </div>
                <div>
                  <h3 className="group-name">Nurse Community Global Room</h3>
                  <p className="group-status">Online Community Chat</p>
                </div>
              </div>
            </div>

            <div className="chat-body" id="community-chat-body">
              {loadingMsg ? (
                <div className="p-8 text-center text-gray-500">Syncing messages...</div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Start the conversation! Say hello to your fellow nurses.</div>
              ) : (
                messages.map((msg, idx) => {
                  const isSent = msg.senderId === user?.id;
                  const prevMsg = messages[idx - 1];
                  const showSender = !isSent && (!prevMsg || prevMsg.senderId !== msg.senderId);
                  const avatarStr = `https://ui-avatars.com/api/?name=${(msg.User?.name || "U").substring(0,2)}&background=${isSent ? '1e8e3e' : '0D8ABC'}&color=fff`;

                  return (
                    <div key={msg.id} className={`msg-group ${isSent ? 'sent' : 'received'}`}>
                      {showSender && <span className="sender-name">{msg.User?.name}</span>}
                      <div className="msg-content">
                        {!isSent && (
                          <div className="msg-avatar-col">
                             {showSender ? <img src={avatarStr} className="msg-avatar" alt="A" /> : <div className="w-8" />}
                          </div>
                        )}
                        <div className="msg-bubble-wrapper">
                          <div className="msg-bubble">{msg.content}</div>
                          <span className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="chat-footer">
              <textarea 
                className="chat-textarea" 
                placeholder="Share something with the community..."
                rows={2}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSendMessage();
                   }
                }}
              ></textarea>
              <button 
                className="btn-send" 
                disabled={!newMessage.trim()}
                onClick={handleSendMessage}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="discussions-interface">
            <div className="posts-header">
              <h3 className="section-title">Latest Discussions</h3>
              <button className="btn-create-post" onClick={() => setShowCreatePost(true)}>
                <PlusCircle size={18} />
                Start Discussion
              </button>
            </div>

            {showCreatePost && (
              <div className="create-post-card">
                <input 
                  type="text" 
                  placeholder="Post Title (e.g. Best Nursing Shoes 2024?)"
                  className="post-input-title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                />
                <textarea 
                  placeholder="What's on your mind? Share tips, questions, or updates..."
                  className="post-input-content"
                  rows={4}
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                ></textarea>
                <div className="post-actions">
                   <button className="btn-cancel" onClick={() => setShowCreatePost(false)}>Cancel</button>
                   <button 
                    className="btn-post" 
                    disabled={!newPost.title.trim() || !newPost.content.trim()}
                    onClick={handleCreatePost}
                   >
                     Publish Post
                   </button>
                </div>
              </div>
            )}

            <div className="posts-feed">
              {loadingPosts ? (
                <div className="p-8 text-center text-gray-500">Loading feed...</div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-lg">No discussions yet. Be the first to start one!</div>
              ) : (
                posts.map(post => {
                  const authorAvatar = post.User?.image || `https://ui-avatars.com/api/?name=${(post.User?.name || "U").substring(0,2)}&background=f1f5f9&color=64748b`;
                  
                  return (
                    <div key={post.id} className="post-card">
                      <div className="post-author-bar">
                        <img src={authorAvatar} className="author-img" alt="Author" />
                        <div className="author-info">
                          <span className="author-name">{post.User?.name}</span>
                          <span className="post-date">
                            <Clock size={12} />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="post-body">
                        <h4 className="post-title">{post.title}</h4>
                        <p className="post-excerpt">{post.content}</p>
                      </div>
                      <div className="post-footer">
                        <div className="post-stats">
                          <span className="stat-item"><Heart size={16} /> {post._count?.PostReaction || 0}</span>
                          <span className="stat-item"><MessageCircle size={16} /> {post._count?.PostComment || 0} comments</span>
                        </div>
                        <button className="btn-details">View Discussion</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .community-page {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .content-header {
          margin-bottom: 8px;
        }
        .page-title {
          font-size: 32px;
          font-weight: 800;
          color: #002868;
          margin-bottom: 8px;
        }
        .page-subtitle {
          color: #718096;
          margin-bottom: 24px;
        }

        .tab-navigation {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid #edf2f7;
          padding-bottom: 1px;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 14px;
          color: #718096;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          color: #002868;
          background: #f1f5f9;
        }
        .tab-btn.active {
          color: #C8102E;
          border-bottom-color: #C8102E;
        }

        .community-container {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #edf2f7;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
          overflow: hidden;
          min-height: 600px;
          display: flex;
          flex-direction: column;
        }

        /* Live Chat Styling */
        .chat-interface {
          display: flex;
          flex-direction: column;
          height: 600px;
        }
        .chat-header {
          padding: 20px 24px;
          border-bottom: 1px solid #edf2f7;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-info {
          display: flex;
          gap: 14px;
          align-items: center;
        }
        .group-icon {
          width: 40px;
          height: 40px;
          background: #C8102E;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .group-name {
          font-weight: 700;
          font-size: 16px;
          color: #002868;
          margin: 0;
        }
        .group-status {
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
          margin: 0;
        }

        .chat-body {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .msg-group {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }
        .msg-group.sent {
          align-self: flex-end;
          align-items: flex-end;
        }
        .msg-group.received {
          align-self: flex-start;
          align-items: flex-start;
        }
        .sender-name {
          font-size: 11px;
          font-weight: 700;
          color: #718096;
          margin-bottom: 4px;
          margin-left: 48px;
        }
        .msg-content {
          display: flex;
          gap: 12px;
          width: 100%;
        }
        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .msg-bubble-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .msg-bubble {
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.5;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .sent .msg-bubble {
          background: #C8102E;
          color: #fff;
          border-top-right-radius: 2px;
        }
        .received .msg-bubble {
          background: #fff;
          color: #2d3748;
          border-top-left-radius: 2px;
        }
        .msg-time {
          font-size: 10px;
          color: #a0aec0;
          font-weight: 600;
        }

        .chat-footer {
          padding: 20px 24px;
          background: #fff;
          border-top: 1px solid #edf2f7;
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .chat-textarea {
          flex: 1;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          resize: none;
          font-family: inherit;
        }
        .chat-textarea:focus {
          outline: none;
          border-color: #002868;
        }
        .btn-send {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: #002868;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .btn-send:hover {
          transform: translateY(-2px);
          background: #001a45;
        }
        .btn-send:disabled {
          background: #cbd5e1;
          transform: none;
        }

        /* Discussions Interface */
        .discussions-interface {
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .posts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .section-title {
          font-size: 20px;
          font-weight: 800;
          color: #002868;
          margin: 0;
        }
        .btn-create-post {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #C8102E;
          color: #fff;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          transition: background 0.2s;
        }
        .btn-create-post:hover {
          background: #a50d26;
        }

        .create-post-card {
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .post-input-title {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-weight: 700;
          font-size: 16px;
        }
        .post-input-content {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          resize: vertical;
        }
        .post-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .btn-cancel {
          padding: 8px 16px;
          font-weight: 600;
          color: #718096;
        }
        .btn-post {
          padding: 8px 24px;
          background: #002868;
          color: #fff;
          border-radius: 6px;
          font-weight: 700;
        }
        .btn-post:disabled {
          background: #cbd5e1;
        }

        .post-card {
          border: 1px solid #edf2f7;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.2s;
        }
        .post-card:hover {
          border-color: #cbd5e1;
        }
        .post-author-bar {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .author-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .author-info {
          display: flex;
          flex-direction: column;
        }
        .author-name {
          font-weight: 700;
          font-size: 14px;
          color: #2d3748;
        }
        .post-date {
          font-size: 12px;
          color: #718096;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .post-title {
          font-size: 18px;
          font-weight: 800;
          color: #002868;
          margin: 0 0 8px 0;
        }
        .post-excerpt {
          font-size: 14px;
          color: #4a5568;
          line-height: 1.6;
          margin: 0;
        }
        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #f7fafc;
          padding-top: 16px;
        }
        .post-stats {
          display: flex;
          gap: 20px;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #718096;
          font-weight: 600;
        }
        .btn-details {
          font-size: 13px;
          font-weight: 700;
          color: #C8102E;
        }
      `}</style>
    </div>
  );
}
