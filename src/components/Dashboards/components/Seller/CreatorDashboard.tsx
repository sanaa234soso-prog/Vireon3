import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Megaphone,
  Radar,
  Wallet,
  BarChart3,
  Share2,
  ShieldCheck,
  MessageSquare,
  Settings as SettingsIcon,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Plus,
  Copy,
  Check,
  TrendingUp,
  CreditCard,
  DollarSign,
  Eye,
  FileCheck,
  Upload,
  AlertCircle
} from 'lucide-react';
import {
  CreatorPassport,
  ServiceItem,
  ProductItem,
  CampaignItem,
  CampaignApplication,
  OrderItem,
  OpportunityItem,
  AffiliateLink,
  PPVMetric,
  User
} from '../../types';

interface CreatorDashboardProps {
  currentUser: User;
  passport: CreatorPassport | null;
  services: ServiceItem[];
  products: ProductItem[];
  orders: OrderItem[];
  opportunities: OpportunityItem[];
  applications: CampaignApplication[];
  affiliateLinks: AffiliateLink[];
  ppvMetrics: PPVMetric[];
  onOpenPassport: () => void;
  onOpenRadar: () => void;
  onCreateService: () => void;
  onSelectService: (s: ServiceItem) => void;
  onOpenMessages?: () => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  currentUser,
  passport,
  services,
  products,
  orders,
  opportunities,
  applications,
  affiliateLinks,
  ppvMetrics,
  onOpenPassport,
  onOpenRadar,
  onCreateService,
  onSelectService,
  onOpenMessages
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'services'
    | 'campaigns'
    | 'opportunities'
    | 'earnings'
    | 'analytics'
    | 'affiliate'
    | 'passport'
    | 'messages'
    | 'settings'
  >('overview');

  // Payout / Deliver state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [deliverModalOrder, setDeliverModalOrder] = useState<OrderItem | null>(null);
  const [deliveryFile, setDeliveryFile] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const myOrders = orders.filter((o) => o.sellerId === currentUser.id || o.sellerName === currentUser.fullName);
  const myServices = services.filter((s) => s.creatorId === currentUser.id);
  const totalRevenue = passport?.totalEarnings || 38450.0;
  const verifiedViews = passport?.verifiedViews || 8420000;
  const vireonScore = passport?.vireonScore || 97;
  const totalOrdersCount = passport?.completedOrders || 142;
  const availableBalance = 4850.0;

  const sidebarNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: myOrders.length },
    { id: 'services', label: 'Services', icon: Layers, badge: myServices.length },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'opportunities', label: 'Opportunities', icon: Radar, badge: opportunities.length },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'affiliate', label: 'Affiliate', icon: Share2 },
    { id: 'passport', label: 'Creator Passport', icon: ShieldCheck },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
            
            {/* Creator Mini Profile Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E293B]">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-10 h-10 rounded-xl object-cover border border-[#1E293B]"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{currentUser.fullName}</h3>
                <p className="text-[11px] text-purple-400 font-mono">Score {vireonScore}/100</p>
              </div>
            </div>

            {/* Navigation List */}
            <nav className="space-y-1 text-xs font-medium">
              {sidebarNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'passport') {
                        onOpenPassport();
                      } else if (item.id === 'messages' && onOpenMessages) {
                        onOpenMessages();
                      } else {
                        setActiveTab(item.id as any);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                      isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive ? 'bg-purple-800 text-white' : 'bg-[#111827] text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Action */}
            <div className="pt-2 border-t border-[#1E293B]">
              <button
                onClick={onCreateService}
                className="w-full py-2 px-3 rounded-lg bg-[#111827] hover:bg-[#151f33] border border-[#1E293B] text-xs font-semibold text-purple-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Service</span>
              </button>
            </div>

          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* TOP 4 STAT CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Total Revenue</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      ${totalRevenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 font-mono">+14.2%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Orders Completed</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {totalOrdersCount}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono">99% on-time</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Verified Views</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {(verifiedViews / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-[10px] font-semibold text-purple-400 font-mono">6.8% ER</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Vireon Score</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-purple-400 font-mono">
                      {vireonScore}/100
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Top 1%</span>
                  </div>
                </div>
              </div>

              {/* RECOMMENDED OPPORTUNITIES */}
              <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Recommended Opportunities
                    </h2>
                    <p className="text-xs text-slate-400">High-matching brand campaigns matched to your audience profile.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('opportunities')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <span>View all radar ({opportunities.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {opportunities.slice(0, 2).map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={opp.brandLogo} alt={opp.brandName} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-semibold text-white">{opp.title}</h3>
                            <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[10px] font-mono font-bold">
                              {opp.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {opp.brandName} • {opp.niche} • {opp.budgetLabel}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={onOpenRadar}
                        className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold self-start sm:self-center transition-colors"
                      >
                        View Opportunity
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT ORDERS TABLE */}
              <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">Recent Orders</h2>
                    <p className="text-xs text-slate-400">Manage client milestones and deliver assets for escrow release.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                  >
                    All Orders
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-slate-500 font-semibold">
                        <th className="pb-2">Order / Service</th>
                        <th className="pb-2">Client</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                      {myOrders.slice(0, 3).map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#111827]/40">
                          <td className="py-3 font-medium text-white max-w-[200px] truncate">
                            {ord.itemTitle}
                          </td>
                          <td className="py-3 text-slate-400">{ord.buyerName}</td>
                          <td className="py-3 font-mono font-semibold text-emerald-400">${ord.amount.toFixed(2)}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40 uppercase">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setDeliverModalOrder(ord)}
                              className="px-2.5 py-1 rounded bg-[#111827] hover:bg-[#151f33] border border-[#1E293B] text-xs font-semibold text-slate-200"
                            >
                              Deliver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PERFORMANCE SUMMARY */}
              <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-3">
                <h2 className="text-base font-bold text-white tracking-tight">Performance Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-[#111827] border border-[#1E293B]/70">
                    <span className="text-slate-500 block">Avg. Client Satisfaction</span>
                    <span className="text-lg font-bold text-white font-mono mt-1 block">4.98 / 5.0</span>
                    <span className="text-[10px] text-slate-400">Based on 76 verified reviews</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#111827] border border-[#1E293B]/70">
                    <span className="text-slate-500 block">Delivery Turnaround</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">1.8 Days</span>
                    <span className="text-[10px] text-slate-400">Fastest 5% on platform</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-[#111827] border border-[#1E293B]/70">
                    <span className="text-slate-500 block">Dispute Rate</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono mt-1 block">0.0%</span>
                    <span className="text-[10px] text-slate-400">Clean escrow record</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">All Orders ({myOrders.length})</h2>
                <p className="text-xs text-slate-400">Manage order milestones and deliver files to clients.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-500 font-semibold">
                      <th className="pb-2">Item</th>
                      <th className="pb-2">Client</th>
                      <th className="pb-2">Net Earnings</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                    {myOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="py-3 font-medium text-white">{ord.itemTitle}</td>
                        <td className="py-3 text-slate-400">{ord.buyerName}</td>
                        <td className="py-3 font-mono font-semibold text-emerald-400">${ord.sellerNet.toFixed(2)}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40 uppercase">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => setDeliverModalOrder(ord)}
                            className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                          >
                            Submit Deliverables
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">My Listed Services ({myServices.length})</h2>
                  <p className="text-xs text-slate-400">Package and price your custom UGC offerings.</p>
                </div>
                <button
                  onClick={onCreateService}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myServices.map((service) => (
                  <div key={service.id} className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={service.coverImage} alt={service.title} className="w-14 h-14 rounded-lg object-cover" />
                      <div>
                        <span className="text-[10px] text-purple-300 font-semibold">{service.category}</span>
                        <h4 className="text-xs font-semibold text-white mt-0.5 line-clamp-1">{service.title}</h4>
                        <p className="text-slate-400 text-[11px] font-mono mt-0.5">${service.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectService(service)}
                      className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#151f33] border border-[#1E293B] text-xs text-slate-200"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OPPORTUNITIES (RADAR) */}
          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Opportunity Radar</h2>
                  <p className="text-xs text-slate-400">Real-time campaigns matched to your audience profile.</p>
                </div>
              </div>

              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={opp.brandLogo} alt={opp.brandName} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-semibold text-white">{opp.title}</h3>
                          <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[10px] font-mono font-bold">
                            {opp.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{opp.brandName} • {opp.niche} • {opp.budgetLabel}</p>
                        <p className="text-[11px] text-purple-300/80 mt-1">{opp.matchReason}</p>
                      </div>
                    </div>

                    <button
                      onClick={onOpenRadar}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
                    >
                      View Opportunity
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EARNINGS */}
          {activeTab === 'earnings' && (
            <div className="p-6 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Earnings & Balance</h2>
                  <p className="text-xs text-slate-400">Escrow balances and instant payout settlements.</p>
                </div>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
                >
                  Request Payout
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Available for Payout</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
                    ${availableBalance.toFixed(2)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Held in Escrow</span>
                  <span className="text-2xl font-bold text-purple-300 font-mono mt-1 block">$1,450.00</span>
                </div>
                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Lifetime Earnings</span>
                  <span className="text-2xl font-bold text-white font-mono mt-1 block">${totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AFFILIATE */}
          {activeTab === 'affiliate' && (
            <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
              <h2 className="text-base font-bold text-white">Affiliate Commission Links</h2>
              <div className="space-y-3">
                {affiliateLinks.map((link) => (
                  <div key={link.id} className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-semibold text-white">{link.title}</h4>
                      <p className="text-slate-400 font-mono text-[11px] mt-0.5">{link.targetUrl}?ref={link.code}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(`${link.targetUrl}?ref=${link.code}`, link.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#0D1220] hover:bg-[#151f33] border border-[#1E293B] text-slate-300 flex items-center gap-1.5"
                    >
                      {copiedLink === link.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink === link.id ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER TABS FALLBACK */}
          {activeTab !== 'overview' && activeTab !== 'orders' && activeTab !== 'services' && activeTab !== 'opportunities' && activeTab !== 'earnings' && activeTab !== 'affiliate' && (
            <div className="p-6 rounded-xl bg-[#0D1220] border border-[#1E293B] text-center py-12 space-y-2">
              <h3 className="text-base font-semibold text-white capitalize">{activeTab} Section</h3>
              <p className="text-xs text-slate-400">Settings and advanced preferences are active and synchronized.</p>
            </div>
          )}

        </main>

      </div>

      {/* DELIVER ORDER MODAL */}
      {deliverModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Submit Order Deliverables</h3>
            <p className="text-xs text-slate-400">Order: {deliverModalOrder.itemTitle}</p>
            <div className="space-y-2 text-xs">
              <label className="block text-slate-300">Google Drive / Dropbox / Asset URL</label>
              <input
                type="text"
                value={deliveryFile}
                onChange={(e) => setDeliveryFile(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div className="space-y-2 text-xs">
              <label className="block text-slate-300">Delivery Notes for Client</label>
              <textarea
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={3}
                placeholder="Included are the 3 viral hook variations..."
                className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeliverModalOrder(null)}
                className="flex-1 py-2 rounded-lg bg-[#111827] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Deliverables submitted! Client has 72 hours for review before escrow auto-release.');
                  setDeliverModalOrder(null);
                }}
                className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Submit to Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYOUT MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Instant Balance Payout</h3>
            <p className="text-xs text-slate-400">Transfer your available balance (${availableBalance.toFixed(2)}) directly.</p>
            <div className="p-3 rounded-lg bg-[#111827] border border-[#1E293B] text-xs space-y-1 text-slate-300">
              <p>Payout Destination: <strong>Bank Wire (IBAN ending in ••••8412)</strong></p>
              <p className="text-slate-500">Processing Time: Instant (under 10 mins)</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 py-2 rounded-lg bg-[#111827] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Payout initiated! Funds will arrive shortly via PaySecure rails.');
                  setShowPayoutModal(false);
                }}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
