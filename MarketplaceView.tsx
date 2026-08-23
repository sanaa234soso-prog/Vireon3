import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  Lock,
  ArrowUpDown,
  Filter,
  X,
  CreditCard,
  Eye,
  Sparkles
} from 'lucide-react';
import {
  ServiceItem,
  ProductItem,
  CampaignItem,
  CreatorPassport,
  User,
  MarketplaceCategory
} from '../types';

interface MarketplaceViewProps {
  services: ServiceItem[];
  products: ProductItem[];
  campaigns: CampaignItem[];
  passports: Record<string, CreatorPassport>;
  users: User[];
  selectedCategory?: string;
  initialQuery?: string;
  onSelectItem: (item: ServiceItem | ProductItem) => void;
  onSelectCampaign: (campaign: CampaignItem) => void;
  onSelectCreator: (creatorId: string) => void;
  onCheckout: (item: ServiceItem | ProductItem) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  services,
  products,
  campaigns,
  passports,
  users,
  selectedCategory = 'all',
  initialQuery = '',
  onSelectItem,
  onSelectCampaign,
  onSelectCreator,
  onCheckout
}) => {
  const [activeTab, setActiveTab] = useState<string>(selectedCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<'recommended' | 'score' | 'price_asc' | 'price_desc' | 'rating'>('recommended');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [priceMax, setPriceMax] = useState<number>(1000);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Listings' },
    { id: 'creators', label: 'Creators' },
    { id: 'services', label: 'Services' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'products', label: 'Digital Products' },
    { id: 'ugc', label: 'UGC Video' },
    { id: 'ai', label: 'AI Prompts & Personas' }
  ];

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (activeTab === 'creators' || activeTab === 'campaigns' || activeTab === 'jobs' || activeTab === 'products') return false;
      if (activeTab === 'ugc' && s.category !== 'UGC') return false;
      if (activeTab === 'ai' && s.category !== 'AI Creators') return false;
      if (s.price > priceMax) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchDesc = s.description.toLowerCase().includes(q);
        const matchCreator = s.creatorName.toLowerCase().includes(q);
        const matchCat = s.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCreator && !matchCat) return false;
      }
      return true;
    });
  }, [services, activeTab, searchQuery, priceMax]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeTab === 'creators' || activeTab === 'campaigns' || activeTab === 'jobs' || activeTab === 'services' || activeTab === 'ugc') return false;
      if (p.price > priceMax) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchCreator = p.creatorName.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCreator) return false;
      }
      return true;
    });
  }, [products, activeTab, searchQuery, priceMax]);

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (activeTab === 'creators' || activeTab === 'services' || activeTab === 'products' || activeTab === 'ugc' || activeTab === 'ai') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchBrand = c.brandName.toLowerCase().includes(q);
        const matchNiche = c.targetNiche.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchNiche) return false;
      }
      return true;
    });
  }, [campaigns, activeTab, searchQuery]);

  // Filtered Creators
  const filteredCreators = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'creators') return [];
    return (Object.values(passports) as CreatorPassport[]).filter((p) => {
      const u = users.find((user) => user.id === p.userId);
      if (verifiedOnly && !u?.isVerified) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = u?.fullName.toLowerCase().includes(q) || false;
        const matchHandle = p.handle.toLowerCase().includes(q);
        const matchNiches = p.niches.some((n) => n.toLowerCase().includes(q));
        if (!matchName && !matchHandle && !matchNiches) return false;
      }
      return true;
    });
  }, [passports, users, activeTab, searchQuery, verifiedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover verified creators, hire on-demand talent, or license digital prompt packs.
          </p>
        </div>

        {/* Quick Search on Top */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, niche, creator..."
            className="w-full bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 focus:border-purple-500 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. CATEGORIES ROW */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === cat.id
                ? 'bg-purple-600 text-white font-semibold shadow-sm'
                : 'bg-[#0D1220] text-slate-400 hover:text-white border border-[#1E293B]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. FILTERS & SORT CONTROLS */}
      <div className="p-3 rounded-xl bg-[#0D1220] border border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Quick Filter badges */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-[#1E293B] text-purple-600 focus:ring-0 bg-[#111827]"
            />
            <span>Verified only</span>
          </label>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Price & Filters</span>
          </button>
        </div>

        {/* Right: Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#111827] border border-[#1E293B] text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="recommended">Recommended</option>
            <option value="score">Highest Vireon Score</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

      </div>

      {/* Expandable Filter Box */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200">Max Budget / Price</span>
            <span className="font-mono text-purple-400 font-bold">${priceMax}</span>
          </div>
          <input
            type="range"
            min="50"
            max="1500"
            step="25"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full accent-purple-600"
          />
        </div>
      )}

      {/* 4. MARKETPLACE GRID */}
      <div className="space-y-8">
        
        {/* CREATORS DIRECTORY (When creators tab is active) */}
        {(activeTab === 'all' || activeTab === 'creators') && filteredCreators.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                Verified Creators ({filteredCreators.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreators.map((creator) => {
                const user = users.find((u) => u.id === creator.userId);
                return (
                  <div
                    key={creator.id}
                    className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={user?.avatarUrl}
                            alt={user?.fullName}
                            className="w-11 h-11 rounded-lg object-cover border border-[#1E293B]"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <h3 className="text-sm font-semibold text-white">{user?.fullName}</h3>
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                            </div>
                            <p className="text-xs text-slate-400">@{creator.handle}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800/40 text-purple-300">
                          Score {creator.vireonScore}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                        {creator.tagline}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {creator.niches.slice(0, 3).map((n) => (
                          <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-[#111827] text-slate-400">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center gap-2">
                      <button
                        onClick={() => onSelectCreator(creator.userId)}
                        className="flex-1 py-1.5 rounded-lg bg-[#111827] hover:bg-[#151f33] text-xs font-medium text-slate-200 transition-colors"
                      >
                        Profile
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
          </div>
        )}

        {/* SERVICES GRID (Card contains strictly: Image, Category, Title, Creator, Rating, Price, Vireon Score) */}
        {(activeTab === 'all' || activeTab === 'services' || activeTab === 'ugc' || activeTab === 'ai') && filteredServices.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Creator Services ({filteredServices.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  onClick={() => onSelectItem(service)}
                  className="group cursor-pointer rounded-xl bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
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
                    <div className="p-4 space-y-2">
                      {/* Creator + Vireon Score */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
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

                  {/* Rating + Price */}
                  <div className="p-4 pt-0 flex items-center justify-between text-xs border-t border-[#1E293B]/60 mt-2">
                    <div className="flex items-center gap-1 text-amber-400 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{service.rating}</span>
                      <span className="text-slate-500 font-normal">({service.reviewCount})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">
                        ${service.price.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckout(service);
                        }}
                        className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-colors"
                      >
                        Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIGITAL PRODUCTS (When products tab is active) */}
        {(activeTab === 'all' || activeTab === 'products') && filteredProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Digital Products & Assets ({filteredProducts.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onSelectItem(prod)}
                  className="group cursor-pointer rounded-xl bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden bg-[#111827]">
                      <img
                        src={prod.coverImage}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#070A12]/80 backdrop-blur-md text-pink-300 border border-pink-800/40">
                          {prod.format}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-300">{prod.creatorName}</span>
                        <span className="text-[10px] font-mono text-purple-400">Score {prod.creatorScore}</span>
                      </div>

                      <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-pink-300 transition-colors">
                        {prod.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{prod.description}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex items-center justify-between text-xs border-t border-[#1E293B]/60 mt-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{prod.rating}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">${prod.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCheckout(prod);
                        }}
                        className="px-2.5 py-1 rounded bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-semibold transition-colors"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAMPAIGNS (When campaigns/jobs tab is active) */}
        {(activeTab === 'all' || activeTab === 'campaigns' || activeTab === 'jobs') && filteredCampaigns.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Escrow Campaigns & Openings ({filteredCampaigns.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  onClick={() => onSelectCampaign(camp)}
                  className="cursor-pointer p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={camp.brandLogo}
                          alt={camp.brandName}
                          className="w-10 h-10 rounded-lg object-cover border border-[#1E293B]"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-slate-300">{camp.brandName}</span>
                            {camp.brandVerified && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                          </div>
                          <h3 className="text-sm font-semibold text-white mt-0.5">{camp.title}</h3>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                        {camp.budgetFormatted}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">{camp.targetNiche} • {camp.paymentModel}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCampaign(camp);
                      }}
                      className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
