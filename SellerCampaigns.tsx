import React, { useState } from 'react';
import {
  Megaphone,
  Sparkles,
  DollarSign,
  Users,
  CheckCircle2,
  Send,
  ExternalLink,
  ShieldCheck,
  X,
  Target
} from 'lucide-react';
import { CampaignItem, CampaignApplication, User, CreatorPassport } from '../../types';

interface SellerCampaignsProps {
  currentUser: User;
  passport: CreatorPassport | null;
  campaigns: CampaignItem[];
  applications: CampaignApplication[];
  onRefreshCampaigns: () => void;
}

export const SellerCampaigns: React.FC<SellerCampaignsProps> = ({
  currentUser,
  passport,
  campaigns,
  applications,
  onRefreshCampaigns
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [proposalText, setProposalText] = useState('');
  const [requestedPayout, setRequestedPayout] = useState<number>(500);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleApplyClick = (camp: CampaignItem) => {
    setSelectedCampaign(camp);
    setRequestedPayout(camp.budget > 0 ? camp.budget : 500);
    setProposalText(`Hi ${camp.brandName}, I would love to film 3 high-converting hooks for ${camp.productName}. My audience has a 7.1% engagement rate across TikTok & Instagram.`);
  };

  const handleGenerateAiPitch = async () => {
    if (!selectedCampaign) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: currentUser.fullName,
          creatorNiches: passport?.niches || ['UGC', 'Beauty', 'E-Commerce'],
          vireonScore: passport?.vireonScore || 96,
          brandName: selectedCampaign.brandName,
          productName: selectedCampaign.productName,
          campaignTitle: selectedCampaign.title
        })
      });

      if (!res.ok) throw new Error('Failed to generate pitch');
      const data = await res.json();
      if (data.proposal) {
        setProposalText(data.proposal);
      }
    } catch (e: any) {
      setProposalText(
        `Dear ${selectedCampaign.brandName} team,\n\nI reviewed your brief for ${selectedCampaign.productName}. With a verified Vireon score of ${passport?.vireonScore || 96} and strong audience resonance, I propose 3 fast-paced opening hooks paired with a retention-optimized commercial edit. Ready to deliver within 48 hours.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !proposalText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaigns/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          creatorId: currentUser.id,
          creatorName: currentUser.fullName,
          creatorAvatar: currentUser.avatarUrl,
          creatorScore: passport?.vireonScore || 94,
          proposalText: proposalText.trim(),
          requestedPayout: Number(requestedPayout),
          matchScore: 97,
          matchReason: 'Strong demographic alignment with verified ROI.'
        })
      });

      if (!res.ok) throw new Error('Failed to submit application');

      setSelectedCampaign(null);
      setFeedback(`Application submitted to ${selectedCampaign.brandName}!`);
      setTimeout(() => setFeedback(null), 4000);
      onRefreshCampaigns();
    } catch (e: any) {
      alert(`Error submitting application: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
            <h2 className="text-xl font-bold text-white">Brand Campaigns & Sponsorships</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/40">
              {campaigns.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Apply to verified brand budgets, paid TikTok ad campaigns, and Pay-Per-View video partnerships with escrow security.
          </p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaigns.map((camp) => {
          const hasApplied = applications.some((a) => a.campaignId === camp.id && a.creatorId === currentUser.id);

          return (
            <div
              key={camp.id}
              className="bg-[#0D1220] border border-[#1E293B] hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Brand Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={camp.brandLogo}
                      alt={camp.brandName}
                      className="w-11 h-11 rounded-xl object-cover border border-[#1E293B] bg-slate-900"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{camp.brandName}</span>
                        {camp.brandVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{camp.productName}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
                    {camp.budgetFormatted}
                  </span>
                </div>

                {/* Title & Desc */}
                <div className="mt-3.5">
                  <h3 className="font-bold text-white text-sm leading-snug">{camp.title}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                    {camp.description}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[10px]">Payment Model</span>
                    <div className="font-semibold text-cyan-300">{camp.paymentModel}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Slots Remaining</span>
                    <div className="font-semibold text-white">
                      {Math.max(1, camp.creatorsNeeded - camp.creatorsApplied)} / {camp.creatorsNeeded}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {camp.creatorsApplied} creators applied
                </span>

                {hasApplied ? (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Applied
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyClick(camp)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-900/30 transition active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Apply with AI Pitch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* APPLY MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0D1220] border border-indigo-900/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Apply to {selectedCampaign.brandName}</h3>
                <p className="text-xs text-slate-400">{selectedCampaign.title}</p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Requested Payout ($ USD)
                </label>
                <input
                  type="number"
                  min="50"
                  value={requestedPayout}
                  onChange={(e) => setRequestedPayout(Number(e.target.value))}
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">Your Pitch & Creative Angles</label>
                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={handleGenerateAiPitch}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isGeneratingAi ? 'Generating...' : 'AI Smart Pitch'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  required
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-indigo-500 rounded-xl p-3 text-white outline-none transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCampaign(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/30 transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
