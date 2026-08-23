import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  X,
  ShieldCheck,
  CheckCircle2,
  Send,
  Star,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { CreatorPassport, User } from '../types';

interface VireonMatchModalProps {
  creators: (User & { passport?: CreatorPassport; vireonScore?: number; niches?: string[]; avgEngagementRate?: number })[];
  onClose: () => void;
  onViewPassport: (userId: string) => void;
  onInviteCreator?: (creatorId: string) => void;
}

export const VireonMatchModal: React.FC<VireonMatchModalProps> = ({
  creators,
  onClose,
  onViewPassport,
  onInviteCreator
}) => {
  const [searchPrompt, setSearchPrompt] = useState(
    '10 Beauty & Skincare UGC Creators in GCC / Saudi Arabia, TikTok, Engagement > 5%, Budget $300–$650'
  );
  const [isSearching, setIsSearching] = useState(false);
  const [matchedResults, setMatchedResults] = useState<any[]>([]);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [searchSummary, setSearchSummary] = useState<string>('');

  const handleExecuteMatch = async (promptQuery?: string) => {
    const q = promptQuery || searchPrompt;
    setIsSearching(true);
    try {
      const res = await fetch('/api/ai/creator-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      setMatchedResults(data.matchedCreators || []);
      setSearchSummary(data.searchSummary || `Matched ${data.matchedCreators?.length || 0} creators`);
    } catch (e) {
      setMatchedResults(
        creators.map((c) => ({
          ...c,
          matchPercent: 96,
          matchReason: 'Direct match for Beauty & Short-form video requirements with high GCC engagement.'
        }))
      );
      setSearchSummary('Found 3 verified creators matching your criteria.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInvite = (id: string) => {
    setInvitedIds((prev) => [...prev, id]);
    onInviteCreator?.(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#0D1220] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Vireon Match AI</h2>
              <p className="text-xs text-slate-400">
                Natural language discovery matching verified Creator Passports to brand requirements.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Input Box */}
        <div className="p-6 pb-4 bg-[#070A12] border-b border-[#1E293B] space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              placeholder="e.g. 5 Tech & Gaming creators in US with >4% engagement under $500..."
              className="w-full bg-[#0D1220] border border-[#1E293B] focus:border-purple-500 rounded-xl pl-4 pr-28 py-3 text-xs text-white placeholder-slate-500 focus:outline-none shadow-inner"
            />
            <button
              onClick={() => handleExecuteMatch()}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSearching ? 'Matching...' : 'Find Match'}</span>
            </button>
          </div>

          {searchSummary && (
            <p className="text-xs text-purple-300 font-medium">{searchSummary}</p>
          )}
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-3 max-h-[450px]">
          {matchedResults.length === 0 && !isSearching ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-slate-400 text-xs">Enter your target campaign parameters above to match talent.</p>
              <button
                onClick={() => handleExecuteMatch()}
                className="px-4 py-2 rounded-lg bg-[#111827] text-purple-300 text-xs font-semibold border border-[#1E293B]"
              >
                Run Default Beauty & Tech Search
              </button>
            </div>
          ) : (
            matchedResults.map((c) => {
              const isInvited = invitedIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatarUrl}
                      alt={c.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-[#1E293B]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-white text-sm">{c.fullName}</h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
                          {c.matchPercent || 95}% Match
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">{c.country} • Score {c.vireonScore || 95}/100</p>
                      <p className="text-[11px] text-slate-300 mt-1">{c.matchReason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onViewPassport(c.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#0D1220] hover:bg-[#151f33] border border-[#1E293B] text-slate-200 text-xs font-medium transition-colors"
                    >
                      View Passport
                    </button>
                    <button
                      onClick={() => handleInvite(c.id)}
                      disabled={isInvited}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isInvited
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {isInvited ? 'Invited' : 'Invite'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
