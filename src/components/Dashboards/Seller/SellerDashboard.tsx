import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  FolderOpen,
  FileCheck,
  Megaphone,
  Radar,
  Wallet,
  Share2,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Settings as SettingsIcon,
  Sparkles,
  ArrowUpRight,
  Menu,
  X,
  Plus,
  RefreshCw,
  LogOut
} from 'lucide-react';
import {
  User,
  CreatorPassport,
  ServiceItem,
  ProductItem,
  OrderItem,
  OpportunityItem,
  CampaignItem,
  CampaignApplication,
  AffiliateLink,
  PPVMetric
} from '../../types';

import { SellerForbidden403 } from './SellerForbidden403';
import { SellerOverview } from './SellerOverview';
import { SellerCatalog } from './SellerCatalog';
import { SellerServices } from './SellerServices';
import { SellerProducts } from './SellerProducts';
import { SellerFiles } from './SellerFiles';
import { SellerOrders } from './SellerOrders';
import { SellerCampaigns } from './SellerCampaigns';
import { SellerOpportunities } from './SellerOpportunities';
import { SellerEarnings } from './SellerEarnings';
import { SellerAffiliate } from './SellerAffiliate';
import { SellerAnalytics } from './SellerAnalytics';
import { SellerPassportTab } from './SellerPassportTab';
import { SellerSettingsTab } from './SellerSettingsTab';

export type SellerDashboardTab =
  | 'overview'
  | 'catalog'
  | 'services'
  | 'products'
  | 'files'
  | 'orders'
  | 'campaigns'
  | 'opportunities'
  | 'earnings'
  | 'affiliate'
  | 'analytics'
  | 'messages'
  | 'passport'
  | 'settings';

interface SellerDashboardProps {
  currentUser: User;
  passport: CreatorPassport | null;
  services: ServiceItem[];
  products: ProductItem[];
  orders: OrderItem[];
  opportunities: OpportunityItem[];
  campaigns: CampaignItem[];
  applications: CampaignApplication[];
  affiliateLinks: AffiliateLink[];
  ppvMetrics: PPVMetric[];
  onOpenPublicPassport?: () => void;
  onOpenRadar?: () => void;
  onOpenMessages?: (recipientId?: string) => void;
  onSelectServicePreview?: (s: ServiceItem) => void;
  onSelectProductPreview?: (p: ProductItem) => void;
  onNavigateHome: () => void;
  onNavigateDashboard?: () => void;
  onRefreshAllData: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  currentUser,
  passport,
  services,
  products,
  orders,
  opportunities,
  campaigns,
  applications,
  affiliateLinks,
  ppvMetrics,
  onOpenPublicPassport,
  onOpenRadar,
  onOpenMessages,
  onSelectServicePreview,
  onSelectProductPreview,
  onNavigateHome,
  onNavigateDashboard,
  onRefreshAllData
}) => {
  const [activeTab, setActiveTab] = useState<SellerDashboardTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // RBAC GUARD: Only 'creator' and 'admin' roles have clearance to the Seller Portal
  const isAuthorizedSeller = currentUser && (currentUser.role === 'creator' || currentUser.role === 'admin');

  if (!isAuthorizedSeller) {
    return (
      <SellerForbidden403
        currentUser={currentUser}
        onNavigateHome={onNavigateHome}
        onNavigateDashboard={onNavigateDashboard}
      />
    );
  }

  // Filter creator-specific items
  const myServices = services.filter((s) => s.creatorId === currentUser.id);
  const myProducts = products.filter((p) => p.creatorId === currentUser.id);
  const myOrders = orders.filter((o) => o.sellerId === currentUser.id || o.sellerName === currentUser.fullName);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshAllData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'catalog', label: 'Services & Products', icon: ShoppingBag, badge: (myServices.length + myProducts.length) || null },
    { id: 'files', label: 'Files & Assets', icon: FolderOpen, badge: 'جديد', highlightBadge: false },
    { id: 'orders', label: 'Client Orders', icon: FileCheck, badge: myOrders.filter(o => o.status === 'paid').length || null, highlightBadge: true },
    { id: 'campaigns', label: 'Brand Campaigns', icon: Megaphone, badge: campaigns.length || null },
    { id: 'opportunities', label: 'AI Radar', icon: Radar, badge: 'AI', aiBadge: true },
    { id: 'earnings', label: 'Earnings & Payouts', icon: Wallet, badge: null },
    { id: 'affiliate', label: 'Affiliate Links', icon: Share2, badge: null },
    { id: 'analytics', label: 'Analytics & Reach', icon: BarChart3, badge: null },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: null },
    { id: 'passport', label: 'Creator Passport™', icon: ShieldCheck, badge: '96' },
    { id: 'settings', label: 'Store Settings', icon: SettingsIcon, badge: null }
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0D1220] border-b border-[#1E293B] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B]"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs">
              V
            </div>
            <span className="font-bold text-white text-sm">Seller Center</span>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          className={`p-2 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B] ${isRefreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0D1220] border-r border-[#1E293B] flex flex-col justify-between z-40 transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top brand header */}
        <div className="p-5 border-b border-[#1E293B]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-purple-900/30">
                V
              </div>
              <div>
                <h1 className="font-bold text-white text-sm tracking-tight">Vireon Seller OS</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Creator Active</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleManualRefresh}
              title="Refresh Data"
              className={`p-1.5 rounded-lg bg-[#111827] text-slate-400 hover:text-white border border-[#1E293B] hidden md:block transition ${isRefreshing ? 'animate-spin text-purple-400' : ''}`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'messages' && onOpenMessages) {
                    onOpenMessages();
                  } else {
                    setActiveTab(item.id as SellerDashboardTab);
                  }
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#111827]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.highlightBadge
                        ? 'bg-amber-400 text-black font-extrabold'
                        : item.aiBadge
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/40'
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#151D30] text-slate-300 border border-[#1E293B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card at Footer */}
        <div className="p-4 border-t border-[#1E293B] bg-[#070A12]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-xl object-cover border border-purple-500/40"
              />
              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white truncate">{currentUser.fullName}</span>
                  {(currentUser.emailVerified || currentUser.isVerified) && (
                    <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" title="Email Verified" />
                  )}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">✓ Email Verified</div>
              </div>
            </div>

            <button
              onClick={onNavigateHome}
              title="Return to Public Store"
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-400 hover:text-white border border-[#1E293B] transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* BACKDROP FOR MOBILE */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* MAIN VIEW AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {activeTab === 'overview' && (
          <SellerOverview
            currentUser={currentUser}
            passport={passport}
            services={myServices}
            products={myProducts}
            orders={myOrders}
            opportunities={opportunities}
            campaigns={campaigns}
            onNavigateTab={(t) => setActiveTab(t as SellerDashboardTab)}
            onCreateService={() => setActiveTab('services')}
            onCreateProduct={() => setActiveTab('products')}
            onRequestPayout={() => setActiveTab('earnings')}
          />
        )}

        {(activeTab === 'catalog' || activeTab === 'services' || activeTab === 'products') && (
          <SellerCatalog
            currentUser={currentUser}
            services={myServices}
            products={myProducts}
            initialType={activeTab === 'products' ? 'product' : 'service'}
            onRefreshAllData={onRefreshAllData}
            onSelectServicePreview={onSelectServicePreview}
            onSelectProductPreview={onSelectProductPreview}
          />
        )}

        {activeTab === 'files' && (
          <SellerFiles
            currentUser={currentUser}
            services={myServices}
            products={myProducts}
            onRefreshFiles={onRefreshAllData}
          />
        )}

        {activeTab === 'orders' && (
          <SellerOrders
            currentUser={currentUser}
            orders={myOrders}
            onRefreshOrders={onRefreshAllData}
            onOpenMessages={onOpenMessages}
          />
        )}

        {activeTab === 'campaigns' && (
          <SellerCampaigns
            currentUser={currentUser}
            passport={passport}
            campaigns={campaigns}
            applications={applications}
            onRefreshCampaigns={onRefreshAllData}
          />
        )}

        {activeTab === 'opportunities' && (
          <SellerOpportunities
            currentUser={currentUser}
            passport={passport}
            opportunities={opportunities}
            onOpenMessages={onOpenMessages}
          />
        )}

        {activeTab === 'earnings' && (
          <SellerEarnings
            currentUser={currentUser}
            orders={myOrders}
            onRefreshOrders={onRefreshAllData}
          />
        )}

        {activeTab === 'affiliate' && (
          <SellerAffiliate
            currentUser={currentUser}
            affiliateLinks={affiliateLinks}
            onRefreshAffiliate={onRefreshAllData}
          />
        )}

        {activeTab === 'analytics' && (
          <SellerAnalytics
            currentUser={currentUser}
            passport={passport}
            ppvMetrics={ppvMetrics}
          />
        )}

        {activeTab === 'passport' && (
          <SellerPassportTab
            currentUser={currentUser}
            passport={passport}
            onRefreshPassport={onRefreshAllData}
            onOpenPublicPassport={onOpenPublicPassport}
          />
        )}

        {activeTab === 'settings' && (
          <SellerSettingsTab currentUser={currentUser} />
        )}
      </main>
    </div>
  );
};
