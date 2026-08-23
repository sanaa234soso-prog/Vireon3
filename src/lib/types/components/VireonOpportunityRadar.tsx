import React, { useState } from 'react';
import {
  Radar,
  Sparkles,
  X,
  TrendingUp,
  CheckCircle2,
  Send,
  Zap,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { OpportunityItem, User } from '../types';

interface VireonOpportunityRadarProps {
  opportunities: OpportunityItem[];
  currentUser: User;
  onClose: () => void;
  onApplySuccess?: (opportunity: OpportunityItem, proposalText: string) => void;
}

export const VireonOpportunityRadar: React.FC<VireonOpportunityRadarProps> = ({
  opportunities,
  currentUser,
  onClose,
  onApplySuccess
}) => {
  const [selectedOpp, setSelectedOpp] = useState<OpportunityItem | null>(opportunities[0] || null);
  const [proposalText, setProposalText] = useState('');
  const [isGeneratingAiProposal, setIsGeneratingAiProposal] = useState(false);
  const [appliedOpps, setAppliedOpps] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('All');

  const filteredOpps = filterType === 'All'
    ? opportunities
    : opportunities.filter(o => o.type.toLowerCase().includes(filterType.toLowerCase()));

  const handleGenerateAiPitch = async () => {
    if (!selectedOpp) return;
    setIsGeneratingAiProposal(true);
    try {
      const res = await fetch('/api/ai/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignTitle: selectedOpp.title,
          deliverables: selectedOpp.budgetLabel,
          creatorHandle: currentUser.fullName.toLowerCase().replace(/\s+/g, '_')
        })
      });
      const data = await res.json();
      setProposalText(data.proposalText || `Hi! I would love to create high-converting content for ${selectedOpp.title}. My audience has strong demographic alignment with your target buyers, and my recent campaigns achieved an average 6.8% engagement rate.`);
    } catch (e) {
      setProposalText(`Hi! I would love to create high-converting content for ${selectedOpp.title}. My audience has strong demographic alignment with your target buyers, and my recent campaigns achieved an average 6.8% engagement rate.`);
    } finally {
      setIsGeneratingAiProposal(false);
    }
  };

  const handleSubmitApplication = () => {
    if (!selectedOpp) return;
    setAppliedOpps(prev => [...prev, selectedOpp.id]);
    onApplySuccess?.(selectedOpp, proposalText || 'Standard verified pitch submitted.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-[#0D1220] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/40 flex items-center justify-center text-purple-300">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Opportunity Radar</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                  Live Match Feed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Algorithmically curated deals matching your Creator Passport metrics.
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

        {/* Filter Pills */}
        <div className="px-6 py-2.5 bg-[#070A12] border-b border-[#1E293B] flex items-center gap-2 overflow-x-auto text-xs font-medium">
          {['All', 'Direct Hire', 'PPV Campaign', 'Affiliate'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                filterType === f
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 2-Column Split Pane */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#1E293B]">
          
          {/* Left: Opportunities List */}
          <div className="w-full md:w-5/12 p-4 overflow-y-auto space-y-2.5 max-h-[500px]">
            {filteredOpps.map((opp) => {
              const isSelected = selectedOpp?.id === opp.id;
              const hasApplied = appliedOpps.includes(opp.id);
              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#111827] border-purple-500/60 shadow-md'
                      : 'bg-[#0D1220] border-[#1E293B] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img src={opp.brandLogo} alt={opp.brandName} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs font-semibold text-white truncate max-w-[160px]">{opp.title}</h4>
                        <p className="text-[11px] text-slate-400">{opp.brandName} • {opp.niche}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/40">
                      {opp.matchScore}%
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="font-mono font-semibold text-emerald-400">{opp.budgetLabel}</span>
                    {hasApplied ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Applied
                      </span>
                    ) : (
                      <span className="text-slate-500">{opp.expiresIn}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Opportunity Detail & Proposal */}
          <div className="w-full md:w-7/12 p-6 overflow-y-auto space-y-4 max-h-[500px] text-xs">
            {selectedOpp ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={selectedOpp.brandLogo} alt={selectedOpp.brandName} className="w-12 h-12 rounded-xl object-cover border border-[#1E293B]" />
                    <div>
                      <h3 className="text-base font-bold text-white">{selectedOpp.title}</h3>
                      <p className="text-slate-400 mt-0.5">{selectedOpp.brandName} • {selectedOpp.niche} • {selectedOpp.location}</p>
                    </div>
                  </div>

                  <span className="font-mono text-sm font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/40">
                    {selectedOpp.budgetLabel}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-1.5">
                  <span className="text-purple-300 font-semibold text-[11px] block">AI Match Analysis</span>
                  <p className="text-slate-300 leading-relaxed">{selectedOpp.matchReason}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">Deliverables & Requirements</h4>
                  <p className="text-slate-400 leading-relaxed">{selectedOpp.deliverables}</p>
                </div>

                {/* Proposal Submission Area */}
                <div className="pt-2 border-t border-[#1E293B] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Your Application Pitch</span>
                    <button
                      onClick={handleGenerateAiPitch}
                      disabled={isGeneratingAiProposal}
                      className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingAiProposal ? 'Drafting pitch...' : 'AI Auto-Pitch'}</span>
                    </button>
                  </div>

                  <textarea
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    rows={3}
                    placeholder="Briefly explain your hook strategy and creative angle for this brand..."
                    className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />

                  <div className="flex items-center justify-end gap-2">
                    {appliedOpps.includes(selectedOpp.id) ? (
                      <div className="px-4 py-2 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Proposal Submitted</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleSubmitApplication}
                        className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-center py-12">Select an opportunity to view requirements.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
