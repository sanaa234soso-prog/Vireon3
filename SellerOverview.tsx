import React from 'react';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Layers,
  Clock,
  Sparkles,
  FileCheck,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Eye,
  Megaphone,
  Radar,
  Plus,
  Wallet,
  MessageSquare
} from 'lucide-react';
import {
  User,
  CreatorPassport,
  ServiceItem,
  ProductItem,
  OrderItem,
  OpportunityItem,
  CampaignItem
} from '../../types';

interface SellerOverviewProps {
  currentUser: User;
  passport: CreatorPassport | null;
  services: ServiceItem[];
  products: ProductItem[];
  orders: OrderItem[];
  opportunities: OpportunityItem[];
  campaigns: CampaignItem[];
  onNavigateTab: (tab: string) => void;
  onCreateService: () => void;
  onCreateProduct: () => void;
  onRequestPayout: () => void;
}

export const SellerOverview: React.FC<SellerOverviewProps> = ({
  currentUser,
  passport,
  services,
  products,
  orders,
  opportunities,
  campaigns,
  onNavigateTab,
  onCreateService,
  onCreateProduct,
  onRequestPayout
}) => {
  const activeOrders = orders.filter((o) => o.status === 'paid' || o.status === 'delivered');
  const totalNet = orders.reduce((sum, o) => sum + (o.sellerNet || o.amount * 0.97), 0) + (passport?.totalEarnings || 0);
  const verifiedViews = passport?.verifiedViews || 0;
  const score = passport?.vireonScore || (currentUser.isVerified ? 92 : 88);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-purple-950/60 via-[#0D1220] to-[#070A12] border border-purple-900/40 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-md border border-purple-800/40">
                Verified Seller & Creator
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {currentUser.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {currentUser.fullName.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Your Vireon marketplace catalog is live. You have <strong className="text-white">{activeOrders.length} active escrow orders</strong> in progress and <strong className="text-white">{opportunities.length} high-match radar opportunities</strong>.
            </p>
          </div>

          {/* Quick Actions Ribbon */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onCreateService}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Service
            </button>
            <button
              onClick={onCreateProduct}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-200 hover:text-white border border-[#1E293B] font-semibold text-xs transition"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              Add Product
            </button>
            <button
              onClick={onRequestPayout}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 font-bold text-xs transition"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              Payouts
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Earnings */}
        <div
          onClick={() => onNavigateTab('earnings')}
          className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] hover:border-emerald-500/40 cursor-pointer shadow-xl transition space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Net Earnings Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            8% platform fee deducted
          </div>
        </div>

        {/* Vireon Score */}
        <div
          onClick={() => onNavigateTab('passport')}
          className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] hover:border-purple-500/40 cursor-pointer shadow-xl transition space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Vireon Score™</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {score} <span className="text-sm font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-purple-300 font-semibold">
            Top 1% Creator Passport
          </div>
        </div>

        {/* Active Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] hover:border-amber-500/40 cursor-pointer shadow-xl transition space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Escrow Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {activeOrders.length} <span className="text-sm font-normal text-slate-500">orders</span>
          </div>
          <div className="text-[11px] text-amber-400 font-semibold">
            {orders.filter(o => o.status === 'paid').length} awaiting delivery
          </div>
        </div>

        {/* Total Verified Impressions */}
        <div
          onClick={() => onNavigateTab('analytics')}
          className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] hover:border-cyan-500/40 cursor-pointer shadow-xl transition space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Video Reach</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {(verifiedViews / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18.4% monthly expansion
          </div>
        </div>
      </div>

      {/* 2-Column Section: Active Orders + AI Opportunity Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active In-Progress Orders */}
        <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-base">Active Escrow Orders</h3>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              View All ({orders.length})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No orders pending fulfillment. All milestones cleared!
              </div>
            ) : (
              activeOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-between gap-3 hover:border-purple-500/30 transition"
                >
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm line-clamp-1">{order.itemTitle}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Client: <span className="text-slate-200 font-medium">{order.buyerName}</span> • Escrow: ${(order.sellerNet || order.amount * 0.92).toFixed(2)}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border whitespace-nowrap ${
                    order.status === 'delivered'
                      ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/40'
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/40'
                  }`}>
                    {order.status === 'delivered' ? 'Delivered (Review)' : 'In Production'}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
            <span>PaySecure Escrow 72h auto-release guarantee</span>
            <button
              onClick={() => onNavigateTab('orders')}
              className="font-semibold text-white hover:text-purple-300 transition"
            >
              Submit Deliverable →
            </button>
          </div>
        </div>

        {/* AI Opportunity Radar */}
        <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-base">Top Inbound Radar Matches</h3>
            </div>
            <button
              onClick={() => onNavigateTab('opportunities')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              Explore Radar ({opportunities.length})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {opportunities.slice(0, 3).map((opp) => (
              <div
                key={opp.id}
                className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-between gap-3 hover:border-purple-500/30 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">{opp.title}</span>
                    <span className="text-[10px] text-purple-400 font-semibold bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-800/40">
                      {opp.matchScore}% Match
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {opp.brandName} • Budget: <strong className="text-emerald-400">{opp.estimatedBudget}</strong>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('opportunities')}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
                >
                  Pitch
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
            <span>Matched to your Vireon Creator Passport niches</span>
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="font-semibold text-white hover:text-purple-300 transition"
            >
              Browse Brand Campaigns →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
