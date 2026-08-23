import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  MessageSquare,
  Briefcase,
  Megaphone,
  Star,
  Eye,
  TrendingUp,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Play
} from 'lucide-react';
import { CreatorPassport, ServiceItem, User } from '../types';

interface CreatorPassportModalProps {
  passport: CreatorPassport | null;
  creatorUser?: User;
  services?: ServiceItem[];
  onClose: () => void;
  onSelectService?: (service: ServiceItem) => void;
  onMessageCreator?: (userId: string) => void;
  onInviteToCampaign?: (creatorId: string) => void;
}

export const CreatorPassportModal: React.FC<CreatorPassportModalProps> = ({
  passport,
  creatorUser,
  services = [],
  onClose,
  onSelectService,
  onMessageCreator,
  onInviteToCampaign
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'services' | 'campaigns' | 'reviews'>('about');

  if (!passport) return null;

  const creatorServices = services.filter((s) => s.creatorId === passport.userId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0D1220] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-[#1E293B] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={creatorUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={creatorUser?.fullName || passport.handle}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#1E293B]"
                />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-purple-600 text-white" title="Verified Creator">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {creatorUser?.fullName || passport.handle}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">@{passport.handle}</span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {creatorUser?.country || 'Global'}
                  </span>
                  <span>•</span>
                  <span className="text-purple-300 font-medium">
                    {passport.niches[0] || 'UGC Creator'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vireon Score Badge */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#111827] border border-[#1E293B]">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Vireon Score</span>
                <span className="text-xs text-emerald-400 font-medium">{passport.deliveryScore}% On-Time</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center font-mono font-bold text-lg text-purple-300">
                {passport.vireonScore}
              </div>
            </div>
          </div>

          {/* Action Buttons: Message, Hire, Invite to Campaign */}
          <div className="flex flex-wrap items-center gap-2.5 mt-5">
            <button
              onClick={() => onMessageCreator && onMessageCreator(passport.userId)}
              className="flex-1 min-w-[120px] py-2 px-3 rounded-lg bg-[#111827] hover:bg-[#151f33] border border-[#1E293B] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Message</span>
            </button>

            <button
              onClick={() => {
                if (creatorServices.length > 0 && onSelectService) {
                  onSelectService(creatorServices[0]);
                }
              }}
              className="flex-1 min-w-[120px] py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Hire Creator</span>
            </button>

            <button
              onClick={() => onInviteToCampaign && onInviteToCampaign(passport.userId)}
              className="flex-1 min-w-[140px] py-2 px-3 rounded-lg bg-[#111827] hover:bg-[#151f33] border border-[#1E293B] text-xs font-semibold text-purple-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Megaphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Invite to Campaign</span>
            </button>
          </div>

          {/* Tabs: About, Portfolio, Services, Campaign Results, Reviews */}
          <div className="flex items-center gap-2 overflow-x-auto pt-5 text-xs font-medium no-scrollbar">
            {[
              { id: 'about', label: 'About' },
              { id: 'portfolio', label: `Portfolio (${passport.portfolio.length})` },
              { id: 'services', label: `Services (${creatorServices.length})` },
              { id: 'campaigns', label: 'Campaign Results' },
              { id: 'reviews', label: 'Reviews (4.9 ★)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Biography & Tagline</h3>
                <p className="text-slate-300 leading-relaxed">{passport.tagline}</p>
                <p className="text-slate-400 mt-2 leading-relaxed">{creatorUser?.bio}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-[10px] block">Verified Views</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {(passport.verifiedViews / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-[10px] block">Avg. Engagement</span>
                  <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">
                    {passport.avgEngagementRate}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-[10px] block">Completed Orders</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    {passport.completedOrders}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-[10px] block">Est. Earnings</span>
                  <span className="text-base font-bold text-purple-300 font-mono mt-0.5 block">
                    ${passport.totalEarnings.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Core Niches & Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {passport.niches.concat(passport.skills).map((item) => (
                    <span key={item} className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1E293B] text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PORTFOLIO */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {passport.portfolio.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-purple-600/80 flex items-center justify-center text-white">
                        <Play className="w-4 h-4 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-white truncate">{item.title}</h4>
                  {item.metrics && (
                    <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                      <span>{item.metrics.views?.toLocaleString()} Views</span>
                      <span>•</span>
                      <span>{item.metrics.likes?.toLocaleString()} Likes</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-3">
              {creatorServices.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No custom service packages listed at this moment.</p>
              ) : (
                creatorServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img src={service.coverImage} alt={service.title} className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <span className="text-[10px] text-purple-300 font-semibold">{service.category}</span>
                        <h4 className="font-semibold text-white text-sm mt-0.5">{service.title}</h4>
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{service.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-mono text-white block">${service.price.toFixed(2)}</span>
                      <button
                        onClick={() => onSelectService && onSelectService(service)}
                        className="mt-1.5 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                      >
                        Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: CAMPAIGN RESULTS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-sm">Lumina Beauty Serum Campaign</h4>
                  <span className="text-emerald-400 font-mono font-bold">4.8x ROAS</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Delivered 3 viral hook variations generating 3.4M organic views in GCC region with a 4.6% click-to-purchase conversion rate.
                </p>
                <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-1">
                  <span>Verified by PaySecure Escrow</span>
                  <span>•</span>
                  <span>100% Payout Released</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Apex Tech Gear</span>
                  <div className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                </div>
                <p className="text-slate-300 text-xs">
                  "Phenomenal delivery and lightning fast communication. The hook in the first 2 seconds spiked our conversion by 28%."
                </p>
                <span className="text-slate-500 text-[10px] block">Verified Brand Review • 1 week ago</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
