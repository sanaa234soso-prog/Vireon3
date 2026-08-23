import React, { useState } from 'react';
import {
  Search,
  Users,
  Briefcase,
  Layers,
  Megaphone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Lock,
  Zap,
  TrendingUp
} from 'lucide-react';
import {
  ServiceItem,
  ProductItem,
  CampaignItem,
  CreatorPassport,
  User
} from '../types';

interface HomePageProps {
  services: ServiceItem[];
  campaigns: CampaignItem[];
  passports: Record<string, CreatorPassport>;
  users: User[];
  onNavigateMarketplace: (category?: string, query?: string) => void;
  onSelectService: (service: ServiceItem) => void;
  onSelectCampaign: (campaign: CampaignItem) => void;
  onSelectCreator: (creatorId: string) => void;
  onOpenCreateModal: () => void;
  onOpenRadar: () => void;
  onOpenMatch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  services,
  campaigns,
  passports,
  users,
  onNavigateMarketplace,
  onSelectService,
  onSelectCampaign,
  onSelectCreator,
  onOpenCreateModal,
  onOpenRadar,
  onOpenMatch
}) => {
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateMarketplace(undefined, heroSearch);
  };

  const categories = [
    {
      id: 'creators',
      title: 'Creators',
      description: 'Discover verified UGC creators & viral video specialists.',
      icon: Users,
      count: '1,400+ Verified'
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Ready-to-order UGC packages, editing, and custom reviews.',
      icon: Layers,
      count: '3,200+ Listings'
    },
    {
      id: 'campaigns',
      title: 'Campaigns',
      description: 'Brand deals, pay-per-view payouts, and affiliate campaigns.',
      icon: Megaphone,
      count: '$450K+ In Escrow'
    },
    {
      id: 'jobs',
      title: 'Jobs',
      description: 'Monthly retainers and long-term content creator roles.',
      icon: Briefcase,
      count: '120+ Active Openings'
    }
  ];

  // Get top 3 creators
  const featuredCreatorList = (Object.values(passports) as CreatorPassport[]).slice(0, 3);
  const trendingServicesList = services.slice(0, 3);
  const activeCampaignsList = campaigns.slice(0, 2);

  return (
    <div className="space-y-16 py-8 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6 pt-6 sm:pt-12">
        
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#0D1220] border border-[#1E293B] text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>The Next-Gen Creator Marketplace</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          The marketplace where creators get <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">discovered, hired and paid.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Find creators. Sell your skills. Launch campaigns. Turn your content into income.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateMarketplace('creators')}
            className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-md shadow-purple-900/30 transition-colors"
          >
            Find Creators
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-6 py-2.5 rounded-lg bg-[#0D1220] hover:bg-[#111827] text-slate-200 hover:text-white border border-[#1E293B] text-sm font-semibold transition-colors"
          >
            Start Creating
          </button>
        </div>

        {/* Single Clean Search Bar */}
        <div className="max-w-xl mx-auto pt-4">
          <form onSubmit={handleHeroSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search creators, services, campaigns..."
              className="w-full bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 focus:border-purple-500 rounded-xl pl-10 pr-24 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>
        </div>

      </section>

      {/* 2. WHAT ARE YOU LOOKING FOR? (4 CLEAN CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-left">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            What are you looking for?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Explore curated categories across the creator economy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onNavigateMarketplace(cat.id)}
                className="group p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] hover:border-purple-500/50 hover:bg-[#111827] text-left transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-300 group-hover:text-purple-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-[#070A12] border border-[#1E293B]">
                      {cat.count}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-purple-400 group-hover:text-purple-300">
                  <span>Browse {cat.title}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED CREATORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Featured Creators
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Verified talent with proven conversion and engagement metrics.
            </p>
          </div>
          <button
            onClick={() => onNavigateMarketplace('creators')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View all creators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredCreatorList.map((creator) => {
            const user = users.find((u) => u.id === creator.userId);
            return (
              <div
                key={creator.id}
                className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Creator Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user?.fullName || creator.handle}
                        className="w-12 h-12 rounded-xl object-cover border border-[#1E293B]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-semibold text-white">
                            {user?.fullName}
                          </h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <p className="text-xs text-slate-400">@{creator.handle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{user?.country}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800/40 text-purple-300">
                        Score {creator.vireonScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Tagline / Niche */}
                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {creator.tagline}
                  </p>

                  {/* Niches Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {creator.niches.slice(0, 3).map((niche) => (
                      <span
                        key={niche}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#111827] border border-[#1E293B] text-slate-400"
                      >
                        {niche}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-lg bg-[#111827] border border-[#1E293B]/70 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Verified Views</span>
                      <span className="font-semibold text-white font-mono">
                        {(creator.verifiedViews / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Avg. Engagement</span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {creator.avgEngagementRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center gap-2">
                  <button
                    onClick={() => onSelectCreator(creator.userId)}
                    className="flex-1 py-1.5 rounded-lg bg-[#111827] hover:bg-[#151f33] text-xs font-medium text-slate-200 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onSelectCreator(creator.userId)}
                    className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors"
                  >
                    Hire
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TRENDING SERVICES (ONLY: Image, Category, Title, Creator, Rating, Price, Vireon Score) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Trending Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Top requested UGC and creator services with instant delivery milestones.
            </p>
          </div>
          <button
            onClick={() => onNavigateMarketplace('services')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View all services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trendingServicesList.map((service) => (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="group cursor-pointer rounded-xl bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image & Category */}
                <div className="relative aspect-video w-full overflow-hidden bg-[#111827]">
                  <img
                    src={service.coverImage}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#070A12]/80 backdrop-blur-md text-purple-300 border border-purple-800/40">
                      {service.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2.5">
                  {/* Creator info & Vireon Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={service.creatorAvatar}
                        alt={service.creatorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-medium text-slate-300 truncate max-w-[120px]">
                        {service.creatorName}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-semibold text-purple-400">
                      Vireon {service.creatorScore}/100
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
                    {service.title}
                  </h3>
                </div>
              </div>

              {/* Price & Rating Footer */}
              <div className="p-4 pt-0 flex items-center justify-between text-xs border-t border-[#1E293B]/60 mt-2">
                <div className="flex items-center gap-1 text-amber-400 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{service.rating}</span>
                  <span className="text-slate-500 font-normal">({service.reviewCount})</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 mr-1">From</span>
                  <span className="text-sm font-bold text-white font-mono">
                    ${service.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ACTIVE CAMPAIGNS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Active Campaigns
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Escrow-funded brand deals ready for creator applications.
            </p>
          </div>
          <button
            onClick={() => onNavigateMarketplace('campaigns')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View all campaigns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCampaignsList.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => onSelectCampaign(campaign)}
              className="cursor-pointer p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={campaign.brandLogo}
                      alt={campaign.brandName}
                      className="w-10 h-10 rounded-lg object-cover border border-[#1E293B]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-300">
                          {campaign.brandName}
                        </span>
                        {campaign.brandVerified && (
                          <CheckCircle2 className="w-3 h-3 text-purple-400" />
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white mt-0.5">
                        {campaign.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                    {campaign.budgetFormatted}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {campaign.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                  <span>{campaign.targetNiche}</span>
                  <span>•</span>
                  <span>{campaign.creatorsApplied} / {campaign.creatorsNeeded} Creators</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCampaign(campaign);
                  }}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW VIREON WORKS (3 STEPS ONLY) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            How Vireon Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            A frictionless, escrow-protected ecosystem for creators and brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-xl bg-[#0D1220] border border-[#1E293B] relative">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/40 flex items-center justify-center text-purple-300 text-xs font-bold font-mono mb-4">
              01
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">
              Create
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set up your verified Creator Passport, list UGC packages and digital assets, or fund a brand campaign with milestone-based escrow.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-xl bg-[#0D1220] border border-[#1E293B] relative">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/40 flex items-center justify-center text-purple-300 text-xs font-bold font-mono mb-4">
              02
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">
              Connect
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leverage the Opportunity Radar and Vireon AI Match to partner with brands and creators matching your niche, audience, and pricing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-xl bg-[#0D1220] border border-[#1E293B] relative">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/40 flex items-center justify-center text-purple-300 text-xs font-bold font-mono mb-4">
              03
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">
              Earn
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit deliverables for 72-hour review. Funds are released automatically into your balance with zero dispute risk via PaySecure Escrow.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0D1220] border border-[#1E293B] text-center space-y-4 relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to turn your content into revenue?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Join thousands of verified creators and leading brands operating on Vireon.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenCreateModal}
                className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-900/30 transition-colors"
              >
                Join as a Creator
              </button>
              <button
                onClick={() => onNavigateMarketplace('campaigns')}
                className="px-6 py-2.5 rounded-lg bg-[#111827] hover:bg-[#151f33] text-slate-200 border border-[#1E293B] text-xs sm:text-sm font-semibold transition-colors"
              >
                Launch Brand Campaign
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MINIMAL FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#1E293B] text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
            V
          </div>
          <span className="font-semibold text-slate-300">VIREON</span>
          <span>© 2026 VIREON Inc. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => onNavigateMarketplace('creators')} className="hover:text-slate-300">Creators</button>
          <button onClick={() => onNavigateMarketplace('services')} className="hover:text-slate-300">Services</button>
          <button onClick={() => onNavigateMarketplace('campaigns')} className="hover:text-slate-300">Campaigns</button>
          <button onClick={() => onNavigateMarketplace('jobs')} className="hover:text-slate-300">Jobs</button>
          <span className="flex items-center gap-1 text-emerald-400">
            <Lock className="w-3 h-3" /> PaySecure Escrow Protected
          </span>
        </div>
      </footer>

    </div>
  );
};
