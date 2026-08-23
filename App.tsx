import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  ServiceItem,
  ProductItem,
  CampaignItem,
  CreatorPassport,
  OrderItem,
  OpportunityItem,
  CampaignApplication,
  AffiliateLink,
  PPVMetric,
  WhopConfigStatus
} from './types';
import {
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_CAMPAIGNS,
  INITIAL_PASSPORTS,
  INITIAL_ORDERS,
  INITIAL_OPPORTUNITIES,
  INITIAL_APPLICATIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_AFFILIATE_LINKS,
  INITIAL_PPV_METRICS
} from './lib/mockData';

// Core UI Components (Design System)
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { MarketplaceView } from './components/MarketplaceView';
import { CreateFlowModal } from './components/CreateFlowModal';
import { MobileBottomNav } from './components/MobileBottomNav';

// Modals
import { CreatorPassportModal } from './components/CreatorPassportModal';
import { VireonOpportunityRadar } from './components/VireonOpportunityRadar';
import { VireonMatchModal } from './components/VireonMatchModal';
import { CampaignWizardModal } from './components/CampaignWizardModal';
import { WhopCheckoutModal, WhopConnectModal } from './components/WhopCheckoutModal';
import { AiSupportDrawer } from './components/AiSupportDrawer';
import { ItemDetailModal } from './components/ItemDetailModal';
import { MessagingCenter } from './components/MessagingCenter';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Forbidden403 } from './components/Forbidden403';

// Role Dashboards
import { CreatorDashboard } from './components/Dashboards/CreatorDashboard';
import { SellerDashboard } from './components/Seller/SellerDashboard';
import { BrandDashboard } from './components/Dashboards/BrandDashboard';
import { CustomerDashboard } from './components/Dashboards/CustomerDashboard';
import { AdminPortal } from './components/Admin/AdminPortal';

export default function App() {
  // Navigation State: 'home' | 'marketplace' | 'dashboard' | 'seller' | 'admin' | 'messages' | 'radar'
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedMarketplaceCategory, setSelectedMarketplaceCategory] = useState<string>('all');
  const [marketplaceInitialQuery, setMarketplaceInitialQuery] = useState<string>('');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vireon_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Default logged in user for immediate preview readiness
    return INITIAL_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('vireon_token') || !!localStorage.getItem('vireon_current_user');
  });

  // Data State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(INITIAL_OPPORTUNITIES);
  const [applications, setApplications] = useState<CampaignApplication[]>(INITIAL_APPLICATIONS);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>(INITIAL_AFFILIATE_LINKS);
  const [ppvMetrics, setPpvMetrics] = useState<PPVMetric[]>(INITIAL_PPV_METRICS);

  // Creator Passports Map
  const [passportsMap, setPassportsMap] = useState<Record<string, CreatorPassport>>(() => {
    const map: Record<string, CreatorPassport> = {};
    INITIAL_PASSPORTS.forEach((p) => {
      map[p.userId] = p;
    });
    return map;
  });

  // Whop Config Status
  const [whopStatus, setWhopStatus] = useState<WhopConfigStatus>({
    isConfigured: false,
    environment: 'sandbox',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'SAR', 'AED'],
    escrowFeePercent: 8
  });

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showCreateFlowModal, setShowCreateFlowModal] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [passportTargetUserId, setPassportTargetUserId] = useState<string>(currentUser?.id || INITIAL_USERS[0].id);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [showWhopConnectModal, setShowWhopConnectModal] = useState(false);
  const [showAiSupport, setShowAiSupport] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<any | null>(null);
  const [selectedItemForCheckout, setSelectedItemForCheckout] = useState<any | null>(null);

  // Synchronize URL Path on load and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
      let path = window.location.pathname.toLowerCase();

      if (basePath && path.startsWith(basePath)) {
        path = path.slice(basePath.length);
      }

      if (!path) {
        path = '/';
      }

      if (path === '/admin') {
        setActiveView('admin');
      } else if (
        path === '/seller/dashboard' ||
        path === '/creator/dashboard' ||
        path === '/seller'
      ) {
        setActiveView('seller');
      } else if (
        path === '/marketplace' ||
        path === '/creators' ||
        path === '/services' ||
        path === '/campaigns' ||
        path === '/jobs'
      ) {
        setActiveView('marketplace');
      } else if (path === '/messages') {
        setActiveView('messages');
      } else if (path === '/dashboard') {
        setActiveView('dashboard');
      } else if (path === '/radar') {
        setActiveView('radar');
      } else {
        setActiveView('home');
      }
    };

    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateTo = useCallback((view: string) => {
    setActiveView(view);

    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

    let route = '/';

    if (view === 'home') {
      route = '/';
    } else if (view === 'seller') {
      route = '/seller/dashboard';
    } else {
      route = `/${view}`;
    }

    const targetPath =
      route === '/'
        ? `${basePath}/`
        : `${basePath}${route}`;

    window.history.pushState({}, '', targetPath);

    window.dispatchEvent(new PopStateEvent('popstate'));

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);


  // Verify active JWT session with backend
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('vireon_token');
      if (!token) return;

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            localStorage.setItem('vireon_current_user', JSON.stringify(data.user));
          }
        }
      } catch (e) {
        // fallback
      }
    };
    verifySession();
  }, []);

  // Fetch and refresh all backend data
  const refreshAllData = async () => {
    try {
      const [whopRes, servRes, prodRes, campRes, ordRes] = await Promise.all([
        fetch('/api/whop/config').catch(() => null),
        fetch('/api/services').catch(() => null),
        fetch('/api/products').catch(() => null),
        fetch('/api/campaigns').catch(() => null),
        fetch('/api/orders').catch(() => null)
      ]);

      if (whopRes && whopRes.ok) {
        const whopData = await whopRes.json();
        setWhopStatus(whopData);
      }
      if (servRes && servRes.ok) {
        const servData = await servRes.json();
        if (Array.isArray(servData)) setServices(servData);
      }
      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) setProducts(prodData);
      }
      if (campRes && campRes.ok) {
        const campData = await campRes.json();
        if (Array.isArray(campData)) setCampaigns(campData);
      }
      if (ordRes && ordRes.ok) {
        const ordData = await ordRes.json();
        if (Array.isArray(ordData)) setOrders(ordData);
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Navigate to user's personal dashboard or prompt login
  const handleNavigateToDashboard = () => {
    if (!isAuthenticated || !currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (currentUser.role === 'creator') {
      navigateTo('seller');
    } else if (currentUser.role === 'admin') {
      navigateTo('admin');
    } else {
      navigateTo('dashboard');
    }
  };

  // Log out current user
  const handleLogout = () => {
    localStorage.removeItem('vireon_token');
    localStorage.removeItem('vireon_current_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigateTo('home');
  };

  // Open creator passport
  const handleOpenPassport = (userId?: string) => {
    setPassportTargetUserId(userId || currentUser?.id || INITIAL_USERS[0].id);
    setShowPassportModal(true);
  };

  const handleNavigateMarketplace = (category?: string, query?: string) => {
    setSelectedMarketplaceCategory(category || 'all');
    setMarketplaceInitialQuery(query || '');
    setActiveView('marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateOptionSelect = (type: 'service' | 'product' | 'ugc' | 'campaign' | 'job' | 'affiliate') => {
    if (!isAuthenticated || !currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (type === 'campaign' || type === 'job') {
      setShowCampaignWizard(true);
    } else if (type === 'service' || type === 'ugc') {
      const newServ: ServiceItem = {
        id: `serv_${Date.now()}`,
        creatorId: currentUser.id,
        creatorName: currentUser.fullName,
        creatorAvatar: currentUser.avatarUrl,
        creatorHandle: currentUser.fullName.toLowerCase().replace(/\s+/g, '_'),
        creatorScore: 97,
        title: 'Custom TikTok UGC Video Package (3 Hooks + Raw B-Roll)',
        slug: `custom-tiktok-ugc-${Date.now()}`,
        category: 'UGC',
        description: 'High-converting viral video package tailored for TikTok Ads and Instagram Reels.',
        price: 350.0,
        deliveryDays: 3,
        revisions: 2,
        coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        tags: ['UGC', 'TikTok Ads', 'Reels'],
        sampleDeliverables: ['3 Vertical Videos', 'Scriptwriting', 'Color Graded'],
        rating: 5.0,
        reviewCount: 1,
        ordersCount: 0
      };
      setServices((prev) => [newServ, ...prev]);
      if (currentUser.role === 'creator') {
        navigateTo('seller');
      } else {
        navigateTo('dashboard');
      }
    } else if (type === 'product') {
      const newProd: ProductItem = {
        id: `prod_${Date.now()}`,
        creatorId: currentUser.id,
        creatorName: currentUser.fullName,
        creatorAvatar: currentUser.avatarUrl,
        creatorScore: 97,
        title: 'Viral AI Creator Persona & Prompt Masterpack (2026)',
        slug: `viral-ai-creator-persona-${Date.now()}`,
        category: 'Prompt Packs',
        description: 'Ready-to-use Midjourney & Runway Gen-3 camera motion prompt templates.',
        price: 49.0,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        format: 'PDF / Notion',
        downloadsCount: 0,
        rating: 5.0
      };
      setProducts((prev) => [newProd, ...prev]);
      setActiveView('marketplace');
    }
  };

  const handleCreateCampaign = (campData: any) => {
    const newCamp: CampaignItem = {
      ...campData,
      id: `camp_${Date.now()}`,
      creatorsApplied: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setCampaigns((prev) => [newCamp, ...prev]);
  };

  const handlePaymentSuccess = (newOrder: OrderItem) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleSendMessage = (conversationId: string, body: string) => {
    if (!currentUser) return;
    const newMsg = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      body,
      createdAt: new Date().toISOString(),
      read: true
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const activePassport = passportsMap[passportTargetUserId] || INITIAL_PASSPORTS[0];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        activeView={activeView}
        setActiveView={(tab: string) => {
          navigateTo(tab);
        }}
        onNavigateDashboard={handleNavigateToDashboard}
        onLogout={handleLogout}
        onOpenRadar={() => setShowRadarModal(true)}
        onOpenMatch={() => setShowMatchModal(true)}
        onOpenAiSupport={() => setShowAiSupport(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenCreateModal={() => setShowCreateFlowModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16 md:pb-0">
        
        {/* 1. HOME VIEW */}
        {activeView === 'home' && (
          <HomePage
            services={services}
            campaigns={campaigns}
            passports={passportsMap}
            users={users}
            onNavigateMarketplace={handleNavigateMarketplace}
            onSelectService={(service) => setSelectedItemForDetail(service)}
            onSelectCampaign={(campaign) => {
              setSelectedMarketplaceCategory('campaigns');
              setActiveView('marketplace');
            }}
            onSelectCreator={handleOpenPassport}
            onOpenCreateModal={() => {
              if (!isAuthenticated) setShowAuthModal(true);
              else setShowCreateFlowModal(true);
            }}
            onOpenRadar={() => setShowRadarModal(true)}
            onOpenMatch={() => setShowMatchModal(true)}
          />
        )}

        {/* 2. MARKETPLACE VIEW */}
        {activeView === 'marketplace' && (
          <MarketplaceView
            services={services}
            products={products}
            campaigns={campaigns}
            passports={passportsMap}
            users={users}
            selectedCategory={selectedMarketplaceCategory}
            initialQuery={marketplaceInitialQuery}
            onSelectItem={(item) => setSelectedItemForDetail(item)}
            onSelectCampaign={(camp) => {
              setShowRadarModal(true);
            }}
            onSelectCreator={handleOpenPassport}
            onCheckout={(item) => {
              if (!isAuthenticated || !currentUser) {
                setShowAuthModal(true);
                return;
              }
              setSelectedItemForCheckout(item);
            }}
          />
        )}

        {/* 3. RADAR VIEW */}
        {activeView === 'radar' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <VireonOpportunityRadar
              opportunities={opportunities}
              currentUser={currentUser || INITIAL_USERS[0]}
              onClose={() => navigateTo('home')}
              onApplySuccess={(opp, pitch) => {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-6 right-6 z-50 bg-emerald-500 text-black px-4 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 text-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3';
                toast.innerText = `✓ Proposal submitted successfully for ${opp.title}!`;
                document.body.appendChild(toast);
                setTimeout(() => {
                  toast.remove();
                }, 3500);
              }}
            />
          </div>
        )}

        {/* 4. MESSAGES VIEW */}
        {activeView === 'messages' && (
          isAuthenticated && currentUser ? (
            <MessagingCenter
              currentUser={currentUser}
              conversations={conversations}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#0D1220] border border-purple-900/60 text-center space-y-4">
              <h3 className="text-xl font-bold text-white">تسجيل الدخول مطلوب</h3>
              <p className="text-xs text-slate-400">يرجى تسجيل الدخول للوصول إلى المحادثات والرسائل المباشرة.</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg"
              >
                تسجيل الدخول الآن
              </button>
            </div>
          )
        )}

        {/* 5. DASHBOARD VIEW (Role-Based) */}
        {activeView === 'dashboard' && (
          isAuthenticated && currentUser ? (
            <div className="animate-in fade-in duration-150">
              {currentUser.role === 'creator' && (
                <SellerDashboard
                  currentUser={currentUser}
                  passport={passportsMap[currentUser.id] || INITIAL_PASSPORTS[0]}
                  services={services}
                  products={products}
                  orders={orders}
                  opportunities={opportunities}
                  campaigns={campaigns}
                  applications={applications}
                  affiliateLinks={affiliateLinks}
                  ppvMetrics={ppvMetrics}
                  onOpenPublicPassport={() => handleOpenPassport(currentUser.id)}
                  onOpenRadar={() => setShowRadarModal(true)}
                  onOpenMessages={(recId) => setActiveView('messages')}
                  onSelectServicePreview={(s) => setSelectedItemForDetail(s)}
                  onSelectProductPreview={(p) => setSelectedItemForDetail(p)}
                  onNavigateHome={() => navigateTo('home')}
                  onNavigateDashboard={handleNavigateToDashboard}
                  onRefreshAllData={refreshAllData}
                />
              )}

              {currentUser.role === 'brand' && (
                <BrandDashboard
                  currentUser={currentUser}
                  campaigns={campaigns}
                  applications={applications}
                  orders={orders}
                  onOpenCampaignWizard={() => setShowCampaignWizard(true)}
                  onOpenMatch={() => setShowMatchModal(true)}
                  onOpenRadar={() => setShowRadarModal(true)}
                  onViewPassport={handleOpenPassport}
                  onOpenMessages={() => setActiveView('messages')}
                />
              )}

              {currentUser.role === 'customer' && (
                <CustomerDashboard
                  currentUser={currentUser}
                  orders={orders}
                  onExplore={() => setActiveView('marketplace')}
                  onOpenMessages={() => setActiveView('messages')}
                  onOpenSupport={() => setShowAiSupport(true)}
                  conversations={conversations}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onRefreshAllData={refreshAllData}
                />
              )}

              {currentUser.role === 'admin' && (
                <AdminPortal
                  currentAdmin={currentUser}
                  onLogoutAdmin={handleLogout}
                  onNavigateHome={() => navigateTo('home')}
                />
              )}
            </div>
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#0D1220] border border-purple-900/60 text-center space-y-4">
              <h3 className="text-xl font-bold text-white">لوحة التحكم مقفلة</h3>
              <p className="text-xs text-slate-400">يرجى تسجيل الدخول إلى حسابك للوصول إلى لوحة التحكم الخاصة بك.</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg"
              >
                تسجيل الدخول / إنشاء حساب
              </button>
            </div>
          )
        )}

        {/* 6. DEDICATED SELLER / CREATOR DASHBOARD DIRECT ROUTE (/seller/dashboard) */}
        {activeView === 'seller' && (
          isAuthenticated && currentUser ? (
            <div className="animate-in fade-in duration-150">
              <SellerDashboard
                currentUser={currentUser}
                passport={passportsMap[currentUser.id] || INITIAL_PASSPORTS[0]}
                services={services}
                products={products}
                orders={orders}
                opportunities={opportunities}
                campaigns={campaigns}
                applications={applications}
                affiliateLinks={affiliateLinks}
                ppvMetrics={ppvMetrics}
                onOpenPublicPassport={() => handleOpenPassport(currentUser.id)}
                onOpenRadar={() => setShowRadarModal(true)}
                onOpenMessages={(recId) => setActiveView('messages')}
                onSelectServicePreview={(s) => setSelectedItemForDetail(s)}
                onSelectProductPreview={(p) => setSelectedItemForDetail(p)}
                onNavigateHome={() => navigateTo('home')}
                onNavigateDashboard={handleNavigateToDashboard}
                onRefreshAllData={refreshAllData}
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#0D1220] border border-purple-900/60 text-center space-y-4">
              <h3 className="text-xl font-bold text-white">مركز البائعين وصناع المحتوى</h3>
              <p className="text-xs text-slate-400">سجل الدخول بحساب صانع المحتوى لإدارة خدماتك وأرباحك.</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg"
              >
                تسجيل الدخول
              </button>
            </div>
          )
        )}

        {/* 7. DEDICATED ADMIN NAMESPACE & 403 FORBIDDEN GUARD */}
        {activeView === 'admin' && (
          <div className="animate-in fade-in duration-150">
            {isAuthenticated && currentUser?.role === 'admin' ? (
              <AdminPortal
                currentAdmin={currentUser}
                onLogoutAdmin={handleLogout}
                onNavigateHome={() => navigateTo('home')}
              />
            ) : (
              <Forbidden403
                currentUser={currentUser || INITIAL_USERS[0]}
                onNavigateHome={() => navigateTo('home')}
                onOpenAdminLogin={() => setShowAdminLoginModal(true)}
              />
            )}
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeView={activeView}
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        onNavigate={(v) => {
          navigateTo(v);
        }}
        onNavigateDashboard={handleNavigateToDashboard}
        onOpenCreate={() => {
          if (!isAuthenticated) setShowAuthModal(true);
          else setShowCreateFlowModal(true);
        }}
      />

      {/* MODAL OVERLAYS */}

      {/* Create Flow Modal */}
      <CreateFlowModal
        isOpen={showCreateFlowModal}
        onClose={() => setShowCreateFlowModal(false)}
        onSelectOption={handleCreateOptionSelect}
      />

      {/* Creator Passport Modal */}
      {showPassportModal && (
        <CreatorPassportModal
          passport={activePassport}
          creatorUser={users.find((u) => u.id === activePassport.userId)}
          services={services}
          onClose={() => setShowPassportModal(false)}
          onSelectService={(s) => setSelectedItemForDetail(s)}
          onMessageCreator={(uid) => {
            setShowPassportModal(false);
            if (!isAuthenticated) setShowAuthModal(true);
            else setActiveView('messages');
          }}
          onInviteToCampaign={(uid) => {
            setShowPassportModal(false);
            if (!isAuthenticated) setShowAuthModal(true);
            else setShowCampaignWizard(true);
          }}
        />
      )}

      {/* Opportunity Radar Modal */}
      {showRadarModal && (
        <VireonOpportunityRadar
          opportunities={opportunities}
          currentUser={currentUser || INITIAL_USERS[0]}
          onClose={() => setShowRadarModal(false)}
        />
      )}

      {/* Vireon Match AI Modal */}
      {showMatchModal && (
        <VireonMatchModal
          creators={users
            .filter((u) => u.role === 'creator')
            .map((c) => ({
              ...c,
              passport: passportsMap[c.id],
              vireonScore: passportsMap[c.id]?.vireonScore || 95,
              niches: passportsMap[c.id]?.niches || ['Beauty', 'UGC', 'TikTok'],
              avgEngagementRate: passportsMap[c.id]?.avgEngagementRate || 6.8
            }))}
          onClose={() => setShowMatchModal(false)}
          onViewPassport={handleOpenPassport}
        />
      )}

      {/* Campaign Creation Wizard */}
      {showCampaignWizard && currentUser && (
        <CampaignWizardModal
          currentUser={currentUser}
          onClose={() => setShowCampaignWizard(false)}
          onCreateCampaign={handleCreateCampaign}
        />
      )}

      {/* Item Detail Modal */}
      {selectedItemForDetail && (
        <ItemDetailModal
          item={selectedItemForDetail}
          currentUser={currentUser || INITIAL_USERS[0]}
          onClose={() => setSelectedItemForDetail(null)}
          onBuyItem={(item) => {
            if (!isAuthenticated || !currentUser) {
              setSelectedItemForDetail(null);
              setShowAuthModal(true);
              return;
            }
            setSelectedItemForCheckout(item);
          }}
          onViewPassport={handleOpenPassport}
        />
      )}

      {/* Whop Checkout Modal */}
      {selectedItemForCheckout && currentUser && (
        <WhopCheckoutModal
          item={selectedItemForCheckout}
          buyerUser={currentUser}
          whopStatus={whopStatus}
          onClose={() => setSelectedItemForCheckout(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Whop Connect Modal */}
      {showWhopConnectModal && (
        <WhopConnectModal
          whopStatus={whopStatus}
          onClose={() => setShowWhopConnectModal(false)}
        />
      )}

      {/* AI Support Drawer */}
      {showAiSupport && (
        <AiSupportDrawer
          currentUser={currentUser || INITIAL_USERS[0]}
          onClose={() => setShowAiSupport(false)}
        />
      )}

      {/* Gmail / Google / OTP Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser || INITIAL_USERS[0]}
        onLoginSuccess={(authedUser) => {
          setCurrentUser(authedUser);
          setIsAuthenticated(true);
          setPassportTargetUserId(authedUser.id);
          localStorage.setItem('vireon_current_user', JSON.stringify(authedUser));
          setUsers((prev) => {
            const exists = prev.some((u) => u.id === authedUser.id);
            if (exists) {
              return prev.map((u) => (u.id === authedUser.id ? authedUser : u));
            }
            return [authedUser, ...prev];
          });
          setShowAuthModal(false);

          // Direct navigation into current user's role-appropriate dashboard immediately!
          if (authedUser.role === 'creator') {
            navigateTo('seller');
          } else if (authedUser.role === 'admin') {
            navigateTo('admin');
          } else {
            navigateTo('dashboard');
          }
        }}
      />

      {/* Admin Gateway Authentication Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onSuccess={(adminUser) => {
          setCurrentUser(adminUser);
          setIsAuthenticated(true);
          localStorage.setItem('vireon_current_user', JSON.stringify(adminUser));
          setUsers((prev) => {
            const exists = prev.some((u) => u.id === adminUser.id);
            if (exists) return prev.map((u) => (u.id === adminUser.id ? adminUser : u));
            return [adminUser, ...prev];
          });
          setShowAdminLoginModal(false);
          navigateTo('admin');
        }}
      />

    </div>
  );
}
