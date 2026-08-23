import React from 'react';
import {
  X,
  Sparkles,
  Package,
  Video,
  Megaphone,
  Briefcase,
  Share2,
  ArrowRight
} from 'lucide-react';

interface CreateFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (type: 'service' | 'product' | 'ugc' | 'campaign' | 'job' | 'affiliate') => void;
}

export const CreateFlowModal: React.FC<CreateFlowModalProps> = ({
  isOpen,
  onClose,
  onSelectOption
}) => {
  if (!isOpen) return null;

  const createOptions = [
    {
      id: 'service' as const,
      title: 'Creator Service',
      description: 'Offer customized UGC filming, video editing, or voiceover packages.',
      icon: Sparkles,
      tag: 'Creators'
    },
    {
      id: 'product' as const,
      title: 'Digital Product',
      description: 'Sell AI prompt packs, Lightroom presets, Notion templates, or media kits.',
      icon: Package,
      tag: 'Instant Sell'
    },
    {
      id: 'ugc' as const,
      title: 'UGC Offer',
      description: 'Create ready-to-buy short-form content packages for TikTok and Reels.',
      icon: Video,
      tag: 'High Demand'
    },
    {
      id: 'campaign' as const,
      title: 'Brand Campaign',
      description: 'Post an escrow-backed campaign and hire verified creators with set deliverables.',
      icon: Megaphone,
      tag: 'Brands'
    },
    {
      id: 'job' as const,
      title: 'Job / Retainer',
      description: 'Post full-time, part-time, or monthly retainer positions for content creators.',
      icon: Briefcase,
      tag: 'Hiring'
    },
    {
      id: 'affiliate' as const,
      title: 'Affiliate Offer',
      description: 'Set up commission-based product links and track creator conversion payouts.',
      icon: Share2,
      tag: 'Performance'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0D1220] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            What do you want to create?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose a creation pathway to list your work, monetize your audience, or hire talent.
          </p>
        </div>

        {/* 6 Clean Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {createOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  onSelectOption(opt.id);
                  onClose();
                }}
                className="group flex flex-col justify-between text-left p-4 rounded-xl bg-[#111827] border border-[#1E293B] hover:border-purple-500/60 hover:bg-[#131d33] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/70 border border-purple-800/40 flex items-center justify-center text-purple-300 group-hover:text-purple-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#0D1220] border border-[#1E293B] text-slate-400">
                      {opt.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {opt.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-purple-400 group-hover:text-purple-300">
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
