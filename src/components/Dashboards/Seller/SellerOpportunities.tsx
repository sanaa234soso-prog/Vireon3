import React, { useState } from 'react';
import {
  Radar,
  Sparkles,
  Zap,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Send,
  CheckCircle2,
  Filter,
  X
} from 'lucide-react';
import { OpportunityItem, CreatorPassport, User } from '../../types';

interface SellerOpportunitiesProps {
  currentUser: User;
  passport: CreatorPassport | null;
  opportunities: OpportunityItem[];
  onOpenMessages?: (brandName?: string) => void;
}

export const SellerOpportunities: React.FC<SellerOpportunitiesProps> = ({
  currentUser,
  passport,
  opportunities,
  onOpenMessages
}) => {
  const [selectedOpp, setSelectedOpp] = useState<OpportunityItem | null>(null);
  const [pitchText, setPitchText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredOpps = opportunities.filter((opp) => {
    if (filterType === 'all') return true;
    return opp.type.toLowerCase().includes(filterType.toLowerCase());
  });

  const handleOpenPitchModal = (opp: OpportunityItem) => {
    setSelectedOpp(opp);
    setPitchText(
      `Hi ${opp.brandName} team, I saw your ${opp.title} project and my verified Vireon Passport demonstrates strong ROI in ${opp.niche} with a ${opp.matchScore}% algorithmic alignment. Here is my tailored concept...`
    );
  };

  const handleSendPitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    setFeedback(`Pitch submitted to ${selectedOpp.brandName} successfully!`);
    setSelectedOpp(null);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {feedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1220] border border-[#1E293B] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">AI Opportunity Radar™</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Live Matched
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time algorithmic sponsorship and campaign discovery tailored to your Creator Passport niches and Vireon Score ({passport?.vireonScore || 96}/100).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'UGC', 'Brand Deal', 'PayPerView'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterType === tab
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'bg-[#111827] text-slate-400 hover:text-white border border-[#1E293B]'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpps.map((opp) => (
          <div
            key={opp.id}
            className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] hover:border-purple-500/50 shadow-xl transition flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={opp.brandLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80'}
                    alt={opp.brandName}
                    className="w-10 h-10 rounded-xl object-cover border border-[#1E293B]"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition">
                      {opp.title}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{opp.brandName}</span>
                      <span>•</span>
                      <span className="text-purple-400 font-semibold">{opp.niche}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded-lg">
                    {opp.budgetLabel}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{opp.deadline}</div>
                </div>
              </div>

              {/* Match Reason Banner */}
              <div className="p-3 rounded-xl bg-[#111827] border border-purple-900/30 text-xs text-slate-300 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="line-clamp-1">{opp.matchReason}</span>
                </div>
                <span className="font-bold text-purple-400 shrink-0">{opp.matchScore}% Match</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1E293B]">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#151D30] text-slate-300 border border-[#1E293B]">
                {opp.type}
              </span>

              <button
                onClick={() => handleOpenPitchModal(opp)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                Submit Pitch
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PITCH MODAL */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0D1220] border border-purple-900/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Submit Creator Pitch</h3>
                <p className="text-xs text-purple-400 mt-0.5">{selectedOpp.title} • {selectedOpp.brandName}</p>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendPitch} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-200 text-xs">
                <strong>Vireon Smart Pitch:</strong> Pre-filled with your verified credentials, past engagement ROI, and niche relevance.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Your Pitch Proposal *
                </label>
                <textarea
                  required
                  rows={4}
                  value={pitchText}
                  onChange={(e) => setPitchText(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl p-3 text-white text-xs outline-none transition"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
