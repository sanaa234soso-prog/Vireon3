import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCheck,
  ShieldCheck,
  UserCheck,
  Search
} from 'lucide-react';
import { ConversationItem, MessageItem, User } from '../types';

interface MessagingCenterProps {
  currentUser: User;
  conversations: ConversationItem[];
  messages: MessageItem[];
  onSendMessage: (conversationId: string, body: string) => void;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  currentUser,
  conversations,
  messages,
  onSendMessage
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeConversation = conversations.find(c => c.id === selectedConvId) || conversations[0];
  const activeMessages = messages.filter(m => m.conversationId === selectedConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;
    onSendMessage(activeConversation.id, inputText);
    setInputText('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-400" />
            Vireon Secure Messaging
          </h2>
          <p className="text-xs text-gray-400">
            End-to-end communication between Creators, Brands, and Customers.
          </p>
        </div>
      </div>

      <div className="bg-[#090D16] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        
        {/* Left List of Conversations */}
        <div className="md:col-span-4 border-r border-gray-800 flex flex-col bg-[#0B0F1A]">
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center gap-2 bg-[#121829] border border-gray-800 rounded-xl px-3 py-2 text-xs">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="bg-transparent w-full focus:outline-none text-white placeholder-gray-500 text-xs"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-850">
            {conversations.map(conv => {
              const otherUser = conv.participants.find(p => p.id !== currentUser.id) || conv.participants[0];
              const isSelected = conv.id === selectedConvId;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 flex gap-3 cursor-pointer transition-all ${
                    isSelected ? 'bg-purple-950/40 border-l-4 border-purple-500' : 'hover:bg-gray-900/50'
                  }`}
                >
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.name}
                    className="w-10 h-10 rounded-xl object-cover border border-gray-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-white truncate">{otherUser.name}</h4>
                      <span className="text-[10px] text-gray-500 font-mono">12:30 PM</span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Conversation View */}
        <div className="md:col-span-8 flex flex-col justify-between bg-[#080B13]">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 bg-[#0D1220] border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      activeConversation.participants.find(p => p.id !== currentUser.id)?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                    }
                    alt="User"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {activeConversation.participants.find(p => p.id !== currentUser.id)?.name}
                    </h3>
                    <p className="text-[10px] text-gray-400">{activeConversation.subject || 'Order & Deliverables Discussion'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800 text-[10px] text-emerald-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Whop Escrow Active
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[460px]">
                {activeMessages.map(m => {
                  const isMine = m.senderId === currentUser.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-br-none shadow-md'
                            : 'bg-[#121829] border border-gray-800 text-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p>{m.body}</p>
                      </div>
                      <span className="text-[9px] text-gray-500 mt-1 flex items-center gap-1">
                        {isMine && <CheckCheck className="w-3 h-3 text-purple-400" />}
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSend} className="p-3 bg-[#0A0E18] border-t border-gray-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Type your message or delivery update..."
                  className="flex-1 bg-[#121829] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg disabled:opacity-40 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-xs">
              Select a conversation to start messaging.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
