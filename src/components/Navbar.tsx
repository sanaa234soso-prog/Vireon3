import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Search,
  MessageSquare,
  Bell,
  Plus,
  ChevronDown,
  User as UserIcon,
  Building2,
  Shield,
  ShieldCheck,
  Briefcase,
  Layers,
  ShoppingBag,
  Compass,
  CheckCircle2,
  LogOut,
  Settings,
  ExternalLink,
  Bot,
  LayoutDashboard,
  LogIn,
  Palette,
  Store,
  Crown
} from 'lucide-react';
import { User, UserRole, WhopConfigStatus } from '../types';

interface NavbarProps {
  currentUser: User | null;
  isAuthenticated: boolean;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  onNavigateDashboard: () => void;
  onOpenCreateModal: () => void;
  onOpenRadar: () => void;
  onOpenMatch: () => void;
  onOpenAiSupport: () => void;
  onOpenAuthModal: () => void;
  onSearch?: (query: string) => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAuthenticated,
  onLogout,
  activeView,
  setActiveView,
  onNavigateDashboard,
  onOpenCreateModal,
  onOpenRadar,
  onOpenMatch,
  onOpenAiSupport,
  onOpenAuthModal,
  onSearch,
  unreadCount = 0
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('vireon_token');
        const res = await fetch('/api/user/notifications', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : { 'x-user-id': currentUser.id })
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLiveNotifications(data);
          }
        }
      } catch (e) {
        // silent fallback
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id, isAuthenticated]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchInput.trim()) {
      onSearch(searchInput);
      setActiveView('marketplace');
    }
  };

  const navLinks = [
    { id: 'home', label: 'Explore' },
    { id: 'creators', label: 'Creators' },
    { id: 'services', label: 'Services' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'jobs', label: 'Jobs' }
  ];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'creator':
        return 'Creator & Seller (صانع محتوى وبائع)';
      case 'brand':
        return 'Brand Sponsor (علامة تجارية)';
      case 'customer':
        return 'Customer Buyer (مشتري وعميل)';
      case 'admin':
        return 'Platform Administrator (مشرف النظام)';
      default:
        return 'User Account';
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'creator':
        return {
          title: 'بائع / صانع محتوى (Creator)',
          desc: 'لوحة إدارة الخدمات والمنتجات والأرباح',
          color: 'bg-purple-950/80 border-purple-700/60 text-purple-200',
          icon: Palette
        };
      case 'brand':
        return {
          title: 'علامة تجارية / راعي (Brand)',
          desc: 'لوحة إطلاق الحملات والتعاقدات',
          color: 'bg-indigo-950/80 border-indigo-700/60 text-indigo-200',
          icon: Building2
        };
      case 'customer':
        return {
          title: 'عميل / مشتري (Customer)',
          desc: 'لوحة المشتريات والطلبات الرقمية',
          color: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-200',
          icon: ShoppingBag
        };
      case 'admin':
        return {
          title: 'مشرف النظام (Platform Admin)',
          desc: 'لوحة التحكم الشاملة والرقابة',
          color: 'bg-amber-950/80 border-amber-700/60 text-amber-200',
          icon: Crown
        };
      default:
        return {
          title: 'حساب مستخدم (User Account)',
          desc: 'حساب معتمد',
          color: 'bg-slate-900 border-slate-700 text-slate-200',
          icon: UserIcon
        };
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070A12]/95 backdrop-blur-md border-b border-[#1E293B] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand Logo & Main Navigation */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-900/30 group-hover:opacity-90 transition-opacity">
                <span className="text-base font-black text-white tracking-wider">V</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                VIREON
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = activeView === link.id || (link.id === 'home' && activeView === 'explore');
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveView(link.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-[#0D1220] border border-[#1E293B]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1220]/50'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}

              {/* Direct Dashboard Link in Nav Bar */}
              <button
                onClick={onNavigateDashboard}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'dashboard' || activeView === 'seller'
                    ? 'text-purple-300 bg-purple-950/40 border border-purple-800/50'
                    : 'text-slate-400 hover:text-purple-300 hover:bg-[#0D1220]/50'
                }`}
                title="لوحة التحكم الخاصة بحسابك"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                <span>Dashboard</span>
              </button>
            </nav>
          </div>

          {/* Center/Right: Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search creators, services, campaigns..."
                className="w-full bg-[#0D1220] border border-[#1E293B] hover:border-slate-700 focus:border-purple-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </form>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Vireon AI Button */}
            <button
              onClick={onOpenAiSupport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 transition-colors"
              title="Vireon AI Assistant"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Vireon AI</span>
            </button>

            {/* Messages */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuthModal();
                } else {
                  setActiveView('messages');
                }
              }}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#0D1220] border border-transparent hover:border-[#1E293B] transition-colors"
              title="Messages"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-[#070A12]" />
              )}
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#0D1220] border border-transparent hover:border-[#1E293B] transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {liveNotifications.filter((n) => !n.read && !n.isRead).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#070A12] animate-pulse" />
                  )}
                </button>

                {/* Notification Popover */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#0D1220] border border-[#1E293B] shadow-2xl p-3 z-50 text-xs space-y-2 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] text-slate-300 font-semibold">
                      <span>الإشعارات والتحديثات</span>
                      <span className="text-[10px] text-purple-400 font-mono">
                        {liveNotifications.filter((n) => !n.read && !n.isRead).length} جديد
                      </span>
                    </div>
                    <div className="space-y-2">
                      {liveNotifications.length === 0 ? (
                        <div className="p-3 text-center text-slate-500 text-xs">
                          لا توجد إشعارات جديدة حالياً
                        </div>
                      ) : (
                        liveNotifications.slice(0, 6).map((notif: any) => (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-lg border text-right ${
                              notif.read || notif.isRead
                                ? 'bg-[#0A0E18] border-[#1E293B]/40'
                                : 'bg-[#111827] border-purple-800/40'
                            }`}
                          >
                            <div className="flex items-start gap-2 justify-between">
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <p className="font-semibold text-slate-100 text-xs">{notif.title}</p>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create CTA Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuthModal();
                } else {
                  onOpenCreateModal();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>

            {/* User Profile & Auth Section */}
            {isAuthenticated && currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-[#0D1220] hover:bg-[#111827] border border-[#1E293B] hover:border-purple-500/50 transition-colors"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-full object-cover border border-purple-500/50"
                  />
                  <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[110px] truncate">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileMenu && (() => {
                  const roleInfo = getRoleBadge(currentUser.role);
                  const RoleIcon = roleInfo.icon;
                  return (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0D1220] border border-purple-900/60 shadow-2xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    {/* Current User Card */}
                    <div className="p-3 rounded-xl bg-gradient-to-b from-[#111827] to-[#0A0D17] border border-purple-800/40 mb-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-100 truncate text-sm">{currentUser.fullName}</p>
                        {(currentUser.emailVerified || currentUser.isVerified) && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-1.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            <span>موثق (Verified)</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                      
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">نوع الحساب (المحدد بالتسجيل):</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          <span>{currentUser.role}</span>
                        </span>
                      </div>
                    </div>

                    {/* Account Type Card Summary (Fixed Role) */}
                    <div className="p-2.5 rounded-xl bg-[#111827] border border-[#1E293B] mb-2 text-right">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${roleInfo.color} shrink-0`}>
                          <RoleIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{roleInfo.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{roleInfo.desc}</p>
                        </div>
                      </div>
                    </div>

                    {/* Direct Dashboard link */}
                    <button
                      onClick={() => {
                        onNavigateDashboard();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:text-white transition-all text-right font-bold group mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span>لوحة التحكم الخاصة بحسابي (My Dashboard)</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setActiveView('admin');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl text-amber-300 hover:bg-amber-950/40 border border-amber-800/40 text-right transition-colors mb-2 font-bold"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>بوابة المشرفين (Admin Portal)</span>
                      </button>
                    )}

                    <div className="my-1.5 border-t border-[#1E293B]" />

                    <div className="my-2 border-t border-[#1E293B]" />

                    {/* Log Out */}
                    <button
                      onClick={() => {
                        onLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-right"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-semibold">تسجيل الخروج (Log Out)</span>
                    </button>
                  </div>
                  );
                })()}
              </div>
            ) : (
              /* Unauthenticated: Sign In Button */
              <button
  onClick={onOpenAuthModal}
  className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-1.5 min-h-9 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-bold shadow-md shadow-purple-900/40 transition-all active:scale-95 whitespace-nowrap"
  title="Sign in / Create account"
>
  <LogIn className="w-4 h-4 shrink-0" />

  <span className="sm:hidden">
    Sign in
  </span>

  <span className="hidden sm:inline">
    Sign in / Create account
  </span>
</button>
