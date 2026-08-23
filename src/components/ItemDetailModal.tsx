import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Star,
  Clock,
  RotateCcw,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  Share2,
  Layers,
  Code
} from 'lucide-react';
import { ServiceItem, ProductItem, CampaignItem, User } from '../types';

interface ItemDetailModalProps {
  item: ServiceItem | ProductItem | CampaignItem | null;
  currentUser: User;
  onClose: () => void;
  onBuyItem: (item: any) => void;
  onViewPassport?: (creatorId: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  currentUser,
  onClose,
  onBuyItem,
  onViewPassport
}) => {
  const [seoData, setSeoData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'seo'>('details');

  useEffect(() => {
    if (!item) return;
    fetch('/api/ai/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: item.title,
        category: 'category' in item ? item.category : 'Campaign',
        type: 'price' in item ? 'service' : 'campaign'
      })
    })
      .then(res => res.json())
      .then(data => setSeoData(data))
      .catch(() => {});
  }, [item]);

  if (!item) return null;

  const isService = 'deliveryDays' in item;
  const isProduct = 'downloadsCount' in item && !isService;
  const isCampaign = 'budget' in item;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#090D16] border border-purple-800/60 rounded-2xl shadow-2xl overflow-hidden my-6 text-white">
        
        {/* Header */}
        <div className="relative h-48 sm:h-64 bg-gray-900 overflow-hidden">
          <img
            src={'coverImage' in item ? item.coverImage : 'brandLogo' in item ? item.brandLogo : 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'}
            alt={item.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-black/40"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold bg-purple-600/80 text-white backdrop-blur-md">
              {'category' in item ? item.category : 'Brand Campaign'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5 leading-tight">{item.title}</h2>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 py-2 bg-[#0C101C] border-b border-gray-800 flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'details' ? 'bg-purple-900/60 text-purple-200' : 'text-gray-400'
              }`}
            >
              Overview & Deliverables
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'seo' ? 'bg-purple-900/60 text-purple-200' : 'text-gray-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              AI SEO & Structured Data
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-sm">
            {'price' in item && `$${item.price.toFixed(2)} USD`}
            {'budgetFormatted' in item && item.budgetFormatted}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
          {activeTab === 'details' && (
            <>
              {/* Creator/Brand Card */}
              {'creatorId' in item && (
                <div className="p-3 rounded-xl bg-[#101524] border border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={item.creatorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1">
                        {item.creatorName}
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </h4>
                      <p className="text-[11px] text-purple-300 font-mono">
                        Vireon Score: {item.creatorScore || 94}/100
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewPassport?.(item.creatorId)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-white"
                  >
                    Inspect Passport
                  </button>
                </div>
              )}

              {/* Service Meta Specs */}
              {isService && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#101524] border border-gray-800">
                    <p className="text-gray-400 text-[10px] flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" /> Delivery
                    </p>
                    <p className="font-bold text-white mt-0.5">{item.deliveryDays} Days</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#101524] border border-gray-800">
                    <p className="text-gray-400 text-[10px] flex items-center justify-center gap-1">
                      <RotateCcw className="w-3 h-3 text-pink-400" /> Revisions
                    </p>
                    <p className="font-bold text-white mt-0.5">{item.revisions} Included</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#101524] border border-gray-800">
                    <p className="text-gray-400 text-[10px] flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" /> Rating
                    </p>
                    <p className="font-bold text-white mt-0.5">{item.rating} ({item.reviewCount || 0})</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="text-xs uppercase font-bold text-gray-400 mb-1">Description & Scope</h4>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-[#101524] p-3 rounded-xl border border-gray-800">
                  {item.description}
                </p>
              </div>

              {/* Deliverables */}
              {'sampleDeliverables' in item && item.sampleDeliverables && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-gray-400 mb-1.5">What's Included</h4>
                  <div className="space-y-1">
                    {item.sampleDeliverables.map((del, i) => (
                      <div key={i} className="text-xs text-gray-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 text-purple-200">
                <p className="font-bold">AI SEO Engine Optimization</p>
                <p className="text-[11px] text-gray-300 mt-1">
                  Automatic meta tags, canonical URL, and Schema.org structured data are active for this item.
                </p>
              </div>

              {seoData && (
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-gray-400">Meta Title:</span>
                    <p className="text-white font-mono bg-black/40 p-2 rounded-lg mt-0.5">{seoData.metaTitle}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-400">Meta Description:</span>
                    <p className="text-gray-300 bg-black/40 p-2 rounded-lg mt-0.5">{seoData.metaDescription}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-400">JSON-LD Structured Data:</span>
                    <pre className="text-[10px] text-emerald-300 bg-black/60 p-2.5 rounded-lg overflow-x-auto mt-0.5 font-mono">
                      {seoData.jsonLdSchema}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0A0E18] border-t border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official VIREON Escrow Protected</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onBuyItem(item);
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-900/30 transition-all"
          >
            {isCampaign ? 'Apply to Campaign' : 'Purchase / Order with Escrow'}
          </button>
        </div>

      </div>
    </div>
  );
};
