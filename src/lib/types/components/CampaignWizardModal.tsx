import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  DollarSign,
  Users,
  Layers,
  Calendar,
  Globe,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { CampaignItem, PaymentModel, User } from '../types';

interface CampaignWizardModalProps {
  currentUser: User;
  onClose: () => void;
  onCreateCampaign: (campaignData: any) => void;
}

export const CampaignWizardModal: React.FC<CampaignWizardModalProps> = ({
  currentUser,
  onClose,
  onCreateCampaign
}) => {
  const [title, setTitle] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('3500');
  const [paymentModel, setPaymentModel] = useState<PaymentModel>('Hybrid');
  const [creatorsNeeded, setCreatorsNeeded] = useState('8');
  const [deliverables, setDeliverables] = useState(
    '1 Vertical TikTok/Reels Video (4K) + 2 Alternate Hooks + 30 Days Spark Ad Code'
  );
  const [targetNiche, setTargetNiche] = useState('Beauty & Skincare');
  const [targetCountries, setTargetCountries] = useState('Saudi Arabia, UAE, Kuwait');
  const [minEngagementRate, setMinEngagementRate] = useState('4.5');
  const [aiIdeaPrompt, setAiIdeaPrompt] = useState('');
  const [isGeneratingAiBrief, setIsGeneratingAiBrief] = useState(false);

  const handleGenerateAiBrief = async () => {
    if (!aiIdeaPrompt.trim()) return;
    setIsGeneratingAiBrief(true);
    try {
      const res = await fetch('/api/ai/campaign-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: aiIdeaPrompt })
      });
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.suggestedBudget) setBudget(data.suggestedBudget.toString());
      if (data.paymentModel) setPaymentModel(data.paymentModel);
      if (data.deliverables) setDeliverables(data.deliverables);
      if (data.targetNiche) setTargetNiche(data.targetNiche);
    } catch (e) {
      console.warn('AI brief fallback:', e);
    } finally {
      setIsGeneratingAiBrief(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCampaign({
      brandId: currentUser.id,
      brandName: currentUser.fullName,
      brandLogo: currentUser.avatarUrl,
      brandVerified: true,
      title: title || 'New Brand Creator Campaign',
      description: description || 'Seeking top creators to produce authentic UGC.',
      productName: productName || 'Brand Product',
      budget: Number(budget) || 2500,
      budgetFormatted: `$${Number(budget) || 2500} Total Pool (${paymentModel})`,
      paymentModel,
      creatorsNeeded: Number(creatorsNeeded) || 5,
      deliverables,
      targetPlatforms: ['TikTok', 'Instagram'],
      targetCountries: targetCountries.split(',').map(c => c.trim()),
      targetNiche,
      minEngagementRate: Number(minEngagementRate) || 4.0,
      deadline: new Date(Date.now() + 14 * 86400000).toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#090D16] border border-purple-800/60 rounded-2xl shadow-2xl overflow-hidden my-6 text-white">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-pink-950/80 via-[#0F1422] to-purple-950/80 border-b border-purple-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Launch Creator Campaign</h2>
              <p className="text-xs text-gray-400">
                Deploy multi-creator briefs with Whop Escrow and automated Vireon matching.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Brief Generator Bar */}
        <div className="p-4 bg-purple-950/30 border-b border-purple-800/40 flex flex-col sm:flex-row items-center gap-2">
          <div className="flex-1 w-full flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
            <input
              type="text"
              value={aiIdeaPrompt}
              onChange={e => setAiIdeaPrompt(e.target.value)}
              placeholder="Have an idea? Enter product idea (e.g. 'Vegan protein shake for gym goers in GCC') to auto-generate brief..."
              className="w-full bg-black/40 border border-purple-800/50 rounded-lg px-3 py-1.5 text-xs text-purple-200 placeholder-purple-400/60 focus:outline-none focus:border-pink-500"
            />
          </div>
          <button
            type="button"
            onClick={handleGenerateAiBrief}
            disabled={isGeneratingAiBrief}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shrink-0 transition-all disabled:opacity-50"
          >
            {isGeneratingAiBrief ? 'Generating...' : 'AI Auto-Draft'}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[520px] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Campaign Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Spring Beauty Serum UGC Challenge"
                className="w-full bg-[#101524] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Product / Brand Name *</label>
              <input
                type="text"
                required
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="e.g. Peptide-C Glow Serum"
                className="w-full bg-[#101524] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Campaign Brief & Objectives *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe product advantages, target message, tone, and visual guidelines..."
              className="w-full bg-[#101524] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Payment Model Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1.5">
              Select Payout & Monetization Model
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['Fixed', 'PayPerView', 'Affiliate', 'Hybrid', 'Performance'] as PaymentModel[]).map(model => (
                <button
                  type="button"
                  key={model}
                  onClick={() => setPaymentModel(model)}
                  className={`p-2 rounded-xl text-xs font-bold text-center border transition-all ${
                    paymentModel === model
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                      : 'bg-[#101524] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Total Budget Pool ($)</label>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="w-full bg-[#101524] border border-gray-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Creators Needed</label>
              <input
                type="number"
                value={creatorsNeeded}
                onChange={e => setCreatorsNeeded(e.target.value)}
                className="w-full bg-[#101524] border border-gray-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Min Engagement (%)</label>
              <input
                type="text"
                value={minEngagementRate}
                onChange={e => setMinEngagementRate(e.target.value)}
                className="w-full bg-[#101524] border border-gray-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Target Niche</label>
              <input
                type="text"
                value={targetNiche}
                onChange={e => setTargetNiche(e.target.value)}
                className="w-full bg-[#101524] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Target Countries</label>
              <input
                type="text"
                value={targetCountries}
                onChange={e => setTargetCountries(e.target.value)}
                className="w-full bg-[#101524] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Deliverables & Usage Rights</label>
            <input
              type="text"
              value={deliverables}
              onChange={e => setDeliverables(e.target.value)}
              className="w-full bg-[#101524] border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Funds locked in Whop Escrow until deliverables are accepted</span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-900/40 transition-all"
            >
              Publish Campaign to Marketplace
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
