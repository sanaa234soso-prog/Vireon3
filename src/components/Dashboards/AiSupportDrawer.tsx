import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  Lock,
  MessageSquare
} from 'lucide-react';
import { User } from '../types';

interface AiSupportDrawerProps {
  currentUser: User;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  suggestedActions?: string[];
}

export const AiSupportDrawer: React.FC<AiSupportDrawerProps> = ({
  currentUser,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello ${currentUser.fullName}! I am your **Vireon AI Assistant**. I can assist with escrow milestones, Creator Passport rating criteria, campaign payouts, or dispute policies.`,
      suggestedActions: [
        'How does PaySecure Escrow work?',
        'What criteria decide Vireon Score / 100?',
        'How do I submit deliverables for approval?'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (queryText?: string) => {
    const text = queryText || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          userRole: currentUser.role,
          userName: currentUser.fullName
        })
      });
      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.answer || "PaySecure Escrow guarantees that buyer funds are locked prior to creator work starting. Once deliverables are uploaded, the brand has a 72-hour review window, after which funds auto-release to the creator's balance."
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "VIREON operates on a milestone-based escrow mechanism: When an order is placed or a campaign agreement is signed, the buyer's funds are secured in the PaySecure vault. Creators submit raw/final assets directly to the order dashboard. After brand confirmation (or 72 hours without dispute), payment is instantly deposited to your wallet."
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0D1220] border-l border-[#1E293B] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/40 flex items-center justify-center text-purple-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Vireon AI Assistant</h3>
            <p className="text-[11px] text-slate-400">Escrow & Platform Concierge</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-[#111827] text-slate-200 border border-[#1E293B] rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
            </div>

            {m.suggestedActions && m.suggestedActions.length > 0 && (
              <div className="mt-2 space-y-1.5 w-full">
                {m.suggestedActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleSendMessage(action)}
                    className="w-full text-left p-2 rounded-lg bg-[#070A12] hover:bg-[#111827] border border-[#1E293B] text-[11px] text-purple-300 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="p-3 border-t border-[#1E293B] bg-[#070A12]">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about escrow, payouts, or campaigns..."
            className="w-full bg-[#0D1220] border border-[#1E293B] focus:border-purple-500 rounded-lg pl-3 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
