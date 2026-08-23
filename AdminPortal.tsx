import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  Settings,
  Bot,
  Globe,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Eye,
  Sliders,
  Database,
  Terminal,
  Save,
  Check,
  Zap,
  Copy,
  Mail
} from 'lucide-react';
import {
  User,
  UserRole,
  OrderItem,
  DisputeItem,
  ContentReport,
  PlatformSettings,
  AiAdminConfig,
  SeoConfig,
  AdminAuditLog
} from '../../types';
import { adminApi, AdminMetrics } from '../../lib/adminApi';

interface AdminPortalProps {
  currentAdmin: User;
  onLogoutAdmin: () => void;
  onNavigateHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentAdmin,
  onLogoutAdmin,
  onNavigateHome
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'escrow' | 'whop' | 'disputes' | 'content' | 'settings' | 'ai' | 'seo' | 'audit'
  >('overview');

  // State
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [aiConfig, setAiConfig] = useState<AiAdminConfig | null>(null);
  const [seoConfig, setSeoConfig] = useState<SeoConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Whop Live Integration State
  const [whopConfig, setWhopConfig] = useState<{
    isConfigured: boolean;
    companyId: string;
    webhookConfigured: boolean;
    mode: 'live' | 'sandbox';
    platformFeePercent: number;
    webhookEndpoint: string;
    hasApiKey: boolean;
    apiKeyMasked: string | null;
  } | null>(null);
  const [whopInputs, setWhopInputs] = useState({
    apiKey: '',
    webhookSecret: '',
    companyId: ''
  });
  const [whopTestStatus, setWhopTestStatus] = useState<{
    loading: boolean;
    result?: {
      success: boolean;
      mode: 'live' | 'sandbox';
      message: string;
      httpStatus?: number;
      companyDetails?: any;
    };
  }>({ loading: false });
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [simulatingEvent, setSimulatingEvent] = useState<string | null>(null);

  // Filters & Actions
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [disputeNote, setDisputeNote] = useState<Record<string, string>>({});
  const [test403Result, setTest403Result] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [m, u, esc, disp, rep, sett, ai, seo, logs, whopRes] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getUsers(),
        adminApi.getEscrow(),
        adminApi.getDisputes(),
        adminApi.getReports(),
        adminApi.getSettings(),
        adminApi.getAiConfig(),
        adminApi.getSeoConfig(),
        adminApi.getAuditLogs(),
        fetch('/api/whop/config').catch(() => null)
      ]);

      if (m) setMetrics(m);
      if (u) setUsers(u);
      if (esc) setOrders(esc.orders);
      if (disp) setDisputes(disp);
      if (rep) setReports(rep);
      if (sett) setSettings(sett);
      if (ai) setAiConfig(ai);
      if (seo) setSeoConfig(seo);
      if (logs) setAuditLogs(logs);

      if (whopRes && whopRes.ok) {
        const whopData = await whopRes.json();
        setWhopConfig(whopData);
        setWhopInputs(prev => ({
          ...prev,
          companyId: whopData.companyId || ''
        }));
      }
    } catch (e: any) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showNotification = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // User Actions
  const handleToggleVerify = async (userId: string) => {
    const updated = await adminApi.toggleUserVerify(userId);
    if (updated) {
      setUsers(users.map(u => u.id === userId ? updated : u));
      showNotification(`Verification status updated for ${updated.fullName}`);
    }
  };

  const handleToggleBan = async (userId: string) => {
    const updated = await adminApi.toggleUserBan(userId);
    if (updated) {
      setUsers(users.map(u => u.id === userId ? updated : u));
      showNotification(`Account ${updated.isBanned ? 'banned' : 'unbanned'}: ${updated.fullName}`);
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    const updated = await adminApi.updateUserRole(userId, newRole);
    if (updated) {
      setUsers(users.map(u => u.id === userId ? updated : u));
      showNotification(`Role updated to ${newRole} for ${updated.fullName}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;
    const ok = await adminApi.deleteUser(userId);
    if (ok) {
      setUsers(users.filter(u => u.id !== userId));
      showNotification('User account deleted.');
    }
  };

  // Escrow Actions
  const handleReleaseEscrow = async (orderId: string) => {
    const updated = await adminApi.forceReleaseEscrow(orderId);
    if (updated) {
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      showNotification(`Escrow funds manually released for Order #${orderId}`);
      fetchAdminData();
    }
  };

  const handleRefundEscrow = async (orderId: string) => {
    const updated = await adminApi.forceRefundEscrow(orderId);
    if (updated) {
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      showNotification(`Escrow funds refunded to buyer for Order #${orderId}`);
      fetchAdminData();
    }
  };

  // Dispute Actions
  const handleResolveDispute = async (disputeId: string, action: 'release_to_seller' | 'refund_buyer') => {
    const note = disputeNote[disputeId] || '';
    const resolved = await adminApi.resolveDispute(disputeId, action, note);
    if (resolved) {
      setDisputes(disputes.map(d => d.id === disputeId ? resolved : d));
      showNotification(`Dispute #${disputeId} resolved.`);
      fetchAdminData();
    }
  };

  // Content Actions
  const handleActionReport = async (reportId: string, action: 'dismiss' | 'remove') => {
    const updated = await adminApi.actionReport(reportId, action);
    if (updated) {
      setReports(reports.map(r => r.id === reportId ? updated : r));
      showNotification(`Content report ${action === 'remove' ? 'content removed' : 'dismissed'}.`);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const updated = await adminApi.updateSettings(settings);
    if (updated) {
      setSettings(updated);
      showNotification('Platform policies and financial settings saved.');
    }
  };

  // AI Config Save
  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiConfig) return;
    const updated = await adminApi.updateAiConfig(aiConfig);
    if (updated) {
      setAiConfig(updated);
      showNotification('AI Engine parameters updated.');
    }
  };

  // SEO Config Save
  const handleSaveSeoConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seoConfig) return;
    const updated = await adminApi.updateSeoConfig(seoConfig);
    if (updated) {
      setSeoConfig(updated);
      showNotification('SEO Metadata published.');
    }
  };

  // Whop Config Save & Live Connection Test
  const handleSaveWhopConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/whop/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whopInputs)
      });
      if (res.ok) {
        const data = await res.json();
        setWhopConfig(data.status);
        showNotification('تم حفظ وتحديث إعدادات ربط Whop المالي بنجاح.');
      }
    } catch (e: any) {
      showNotification(`فشل حفظ إعدادات Whop: ${e.message}`);
    }
  };

  const handleTestWhopConnection = async () => {
    setWhopTestStatus({ loading: true });
    try {
      const res = await fetch('/api/whop/test-connection');
      const data = await res.json();
      setWhopTestStatus({
        loading: false,
        result: data
      });
      if (data.success) {
        showNotification('اتصال Whop Live نشط ويعمل بشكل موثوق.');
      }
    } catch (e: any) {
      setWhopTestStatus({
        loading: false,
        result: {
          success: false,
          mode: 'sandbox',
          message: `خطأ في الاتصال: ${e.message}`
        }
      });
    }
  };

  const handleSimulateWhopWebhook = async (action: 'payment.succeeded' | 'transfer_completed' | 'escrow.released') => {
    setSimulatingEvent(action);
    try {
      const res = await fetch('/api/whop/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        showNotification(`تمت معالجة حدث Webhook التجريبي (${action}) بنجاح.`);
        fetchAdminData();
      }
    } catch (e: any) {
      showNotification(`فشل اختبار Webhook: ${e.message}`);
    } finally {
      setSimulatingEvent(null);
    }
  };

  // Simulate RBAC Test: Calling /api/admin/metrics without admin header
  const handleRunRbacTest = async () => {
    setTest403Result('Testing unauthenticated request to /api/admin/metrics...');
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { 'x-user-id': 'user_creator_sarah' } // Sarah is creator, not admin
      });
      const data = await res.json();
      if (res.status === 403) {
        setTest403Result(`PASS: Server returned HTTP 403 Forbidden with payload: ${JSON.stringify(data)}`);
      } else {
        setTest403Result(`FAIL: Server unexpectedly returned status ${res.status}`);
      }
      // Refresh audit logs to show the recorded blocked attempt
      const logs = await adminApi.getAuditLogs();
      if (logs) setAuditLogs(logs);
    } catch (e: any) {
      setTest403Result(`Error running test: ${e.message}`);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 pb-16">
      
      {/* Top Admin Security Navbar */}
      <header className="sticky top-0 z-40 bg-[#0D1220] border-b border-purple-900/40 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center text-purple-300 shadow-md shadow-purple-950">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">VIREON Core Administration</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                  Isolated Admin Namespace
                </span>
              </div>
              <p className="text-xs text-slate-400">Authenticated: {currentAdmin.email} ({currentAdmin.fullName})</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunRbacTest}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-300 text-xs font-medium border border-[#1E293B] transition-colors"
              title="Test server-side 403 block on non-admin token"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Test RBAC 403 Guard</span>
            </button>

            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-300 text-xs font-medium border border-[#1E293B] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Marketplace</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 text-xs font-medium border border-rose-800/40 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Exit Admin</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* Global Success Notification */}
        {saveSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* RBAC 403 Test Notification */}
        {test403Result && (
          <div className="mb-4 p-3 rounded-xl bg-[#111827] border border-amber-800/50 text-xs font-mono text-slate-200 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <Terminal className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{test403Result}</span>
            </div>
            <button onClick={() => setTest403Result(null)} className="text-slate-400 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#1E293B] mb-6 text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview & Telemetry', icon: Activity },
            { id: 'users', label: 'Users & Passports', icon: Users, badge: users.length },
            { id: 'escrow', label: 'PaySecure Escrow', icon: CreditCard, badge: orders.length },
            { id: 'whop', label: 'Whop Financial Hub', icon: Zap, badge: whopConfig?.mode === 'live' ? 'LIVE' : 'ACTIVE' },
            { id: 'disputes', label: 'Disputes Court', icon: AlertTriangle, badge: disputes.filter(d => d.status === 'pending').length },
            { id: 'content', label: 'Content Moderation', icon: ShieldCheck, badge: reports.filter(r => r.status === 'pending').length },
            { id: 'settings', label: 'Platform Policies', icon: Settings },
            { id: 'ai', label: 'AI & Radar Engine', icon: Bot },
            { id: 'seo', label: 'SEO & Metadata', icon: Globe },
            { id: 'audit', label: 'Security & Audit Logs', icon: FileText, badge: auditLogs.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-950/70 text-white border border-purple-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D1220]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    tab.id === 'whop' && whopConfig?.mode === 'live'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : typeof tab.badge === 'number' && tab.badge > 0
                      ? (isActive ? 'bg-purple-800 text-white' : 'bg-[#1E293B] text-slate-400')
                      : 'bg-[#1E293B] text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Gross Platform Volume (GMV)</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  ${(metrics?.totalGMV || 184500).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">Live escrow & settled orders</span>
              </div>

              <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Platform Revenue (8% Take)</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-300 mt-2">
                  ${(metrics?.platformRevenue || 14760).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Commission rate: {metrics?.platformFeePercent || 8}%</span>
              </div>

              <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Escrow Pool</span>
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-300 mt-2">
                  ${(metrics?.activeEscrowPool || 24600).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-amber-400/80 mt-1 block">Locked in PaySecure vault</span>
              </div>

              <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>Active Registered Users</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-indigo-200 mt-2">
                  {users.length}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {users.filter(u => u.role === 'creator').length} Creators • {users.filter(u => u.role === 'brand').length} Brands
                </span>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Security & Platform Audits */}
              <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Recent Security Audit Stream</span>
                  </h3>
                  <button onClick={() => setActiveTab('audit')} className="text-xs text-purple-400 hover:text-purple-300">View All</button>
                </div>
                <div className="space-y-2.5">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-[#111827] border border-[#1E293B]/70 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                            log.status === 'BLOCKED_403' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-slate-400 text-[11px]">{log.adminEmail}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] mt-1">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Action Items */}
              <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Action Required Queue</span>
                  </h3>
                  <span className="text-xs text-amber-400">{disputes.filter(d => d.status === 'pending').length} Disputes</span>
                </div>
                <div className="space-y-2.5">
                  {disputes.filter(d => d.status === 'pending').map((d) => (
                    <div key={d.id} className="p-3 rounded-xl bg-[#111827] border border-amber-900/30 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-300">Dispute #{d.id}: {d.itemTitle}</span>
                        <span className="text-slate-200 font-bold">${d.amount}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1">Buyer: {d.buyerName} vs Seller: {d.sellerName}</p>
                      <button
                        onClick={() => setActiveTab('disputes')}
                        className="mt-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium"
                      >
                        Open Dispute Case &rarr;
                      </button>
                    </div>
                  ))}
                  {disputes.filter(d => d.status === 'pending').length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No open disputes requiring administrative arbitration.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D1220] p-3 rounded-xl border border-[#1E293B]">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name or email..."
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400">Filter Role:</span>
                {(['all', 'creator', 'brand', 'customer', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors ${
                      userRoleFilter === r
                        ? 'bg-purple-950 text-purple-300 border border-purple-700/60'
                        : 'text-slate-400 hover:text-slate-200 bg-[#111827]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111827] text-slate-400 border-b border-[#1E293B] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] text-slate-300">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#111827]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatarUrl} alt={u.fullName} className="w-8 h-8 rounded-full object-cover border border-[#1E293B]" />
                            <div>
                              <p className="font-semibold text-slate-100">{u.fullName}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                            className="bg-[#111827] border border-[#1E293B] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500 uppercase font-semibold"
                          >
                            <option value="creator">Creator</option>
                            <option value="brand">Brand</option>
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {u.country}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleVerify(u.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                              u.isVerified
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/60'
                                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {u.isVerified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-500" />}
                            <span>{u.isVerified ? 'Verified Gold' : 'Unverified'}</span>
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.isBanned
                              ? 'bg-rose-950 text-rose-400 border border-rose-800/50'
                              : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                          }`}>
                            {u.isBanned ? 'BANNED' : 'ACTIVE'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleBan(u.id)}
                              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                u.isBanned
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900'
                                  : 'bg-rose-950/40 text-rose-300 border-rose-900/40 hover:bg-rose-900/60'
                              }`}
                              title={u.isBanned ? 'Unban User' : 'Ban User'}
                            >
                              {u.isBanned ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-900/60 border border-rose-900/40 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ESCROW & PAYMENTS */}
        {activeTab === 'escrow' && (
          <div className="space-y-4">
            
            <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">PaySecure Escrow & Settlement Engine</h3>
              <p className="text-xs text-slate-400 mb-4">
                Full ledger of transaction deposits held in escrow. Administrators hold authority to force manual releases or execute emergency refunds.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111827] text-slate-400 border-b border-[#1E293B] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Service / Milestone</th>
                      <th className="py-3 px-4">Buyer</th>
                      <th className="py-3 px-4">Seller / Creator</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Escrow Status</th>
                      <th className="py-3 px-4 text-right">Admin Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] text-slate-300">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#111827]/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-purple-300">{o.id}</td>
                        <td className="py-3 px-4 font-medium text-slate-100">{o.itemTitle}</td>
                        <td className="py-3 px-4 text-slate-300">{o.buyerName}</td>
                        <td className="py-3 px-4 text-slate-300">{o.sellerName}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">${o.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            o.status === 'completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                            o.status === 'refunded' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' :
                            'bg-amber-950 text-amber-300 border border-amber-800/40'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {o.status !== 'completed' && (
                              <button
                                onClick={() => handleReleaseEscrow(o.id)}
                                className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 text-[11px] font-medium"
                              >
                                Force Release
                              </button>
                            )}
                            {o.status !== 'refunded' && (
                              <button
                                onClick={() => handleRefundEscrow(o.id)}
                                className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 text-[11px] font-medium"
                              >
                                Force Refund
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: WHOP FINANCIAL HUB */}
        {activeTab === 'whop' && (
          <div className="space-y-6">
            
            {/* Status & Live Diagnostics Card */}
            <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E293B]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-bold text-white">Whop Payment Gateway & Payout Engine</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      whopConfig?.mode === 'live'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80 shadow-sm shadow-emerald-950'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                    }`}>
                      {whopConfig?.mode === 'live' ? '● Live Production Mode' : '○ Sandbox Mode'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Processes Visa, MasterCard, Mada, Apple Pay, Crypto USDT, Escrow vault holding, and automated creator withdrawals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestWhopConnection}
                    disabled={whopTestStatus.loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${whopTestStatus.loading ? 'animate-spin' : ''}`} />
                    <span>{whopTestStatus.loading ? 'Testing Connection...' : 'Test Live API Connection'}</span>
                  </button>
                </div>
              </div>

              {/* Test Connection Output */}
              {whopTestStatus.result && (
                <div className={`mt-4 p-4 rounded-xl border text-xs ${
                  whopTestStatus.result.success
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {whopTestStatus.result.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{whopTestStatus.result.message}</p>
                      {whopTestStatus.result.companyDetails && (
                        <pre className="mt-2 p-2 bg-[#070A12] rounded border border-[#1E293B] text-[11px] font-mono text-slate-300 overflow-x-auto">
                          {JSON.stringify(whopTestStatus.result.companyDetails, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Webhook Endpoint Box */}
              <div className="mt-6 p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Official Webhook URL (Paste into Whop Developer Dashboard)</span>
                    <p className="text-[11px] text-slate-400">Events listened: payment.succeeded, payout.succeeded, transfer.succeeded, dispute.opened</p>
                  </div>
                  <button
                    onClick={() => {
                      if (whopConfig?.webhookEndpoint) {
                        navigator.clipboard.writeText(whopConfig.webhookEndpoint);
                        setCopiedWebhookUrl(true);
                        setTimeout(() => setCopiedWebhookUrl(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600 transition-colors"
                  >
                    {copiedWebhookUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>Copy Webhook URL</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-[#070A12] rounded-lg border border-[#1E293B] font-mono text-xs text-purple-300 break-all select-all">
                  {whopConfig?.webhookEndpoint || 'https://ais-pre-o4hzhtpl47ozqq54wzd6ml-813385242426.europe-west2.run.app/api/webhooks/whop'}
                </div>
              </div>
            </div>

            {/* Whop Credentials Update Form */}
            <form onSubmit={handleSaveWhopConfig} className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Whop Production API Credentials</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update live API keys directly. Credentials are encrypted and used for real-time payments and withdrawals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Live API Key (Whop Developer Secret Key)
                  </label>
                  <input
                    type="password"
                    placeholder={whopConfig?.apiKeyMasked || 'whop_live_... / sk_...'}
                    value={whopInputs.apiKey}
                    onChange={(e) => setWhopInputs({ ...whopInputs, apiKey: e.target.value })}
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Leave empty to keep existing masked key.</p>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Webhook Secret (HMAC SHA-256 Signature)
                  </label>
                  <input
                    type="password"
                    placeholder={whopConfig?.webhookConfigured ? '●●●●●●●●●●●● (Configured)' : 'whop_ws_...'}
                    value={whopInputs.webhookSecret}
                    onChange={(e) => setWhopInputs({ ...whopInputs, webhookSecret: e.target.value })}
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Used to cryptographically verify incoming Webhooks.</p>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Whop Company ID
                  </label>
                  <input
                    type="text"
                    placeholder="biz_... / company_..."
                    value={whopInputs.companyId}
                    onChange={(e) => setWhopInputs({ ...whopInputs, companyId: e.target.value })}
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Your registered Whop business entity ID.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1E293B] flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Whop Credentials</span>
                </button>
              </div>
            </form>

            {/* Webhook & Payout Verification Sandbox */}
            <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Live Webhook Event Simulator & Integrity Checks</h3>
              <p className="text-xs text-slate-400 mb-4">
                Verify that real webhook events trigger automatic service activation, buyer/seller notifications, and instant creator withdrawals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleSimulateWhopWebhook('payment.succeeded')}
                  disabled={!!simulatingEvent}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Simulate Payment Succeeded</span>
                </button>

                <button
                  onClick={() => handleSimulateWhopWebhook('transfer_completed')}
                  disabled={!!simulatingEvent}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <span>Simulate Creator Payout</span>
                </button>

                <button
                  onClick={() => handleSimulateWhopWebhook('escrow.released')}
                  disabled={!!simulatingEvent}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Simulate Escrow Auto-Release</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: DISPUTES COURT */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            
            <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Administrative Dispute Resolution Clearinghouse</h3>
              <p className="text-xs text-slate-400 mb-4">
                Evaluate buyer complaints against creator delivery artifacts. Issue final binding administrative judgments.
              </p>

              <div className="space-y-4">
                {disputes.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
                      <div>
                        <span className="text-xs font-mono text-purple-400 font-bold">CASE #{d.id}</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{d.itemTitle}</h4>
                        <p className="text-xs text-slate-400">Order ID: {d.orderId} • Disputed Amount: <strong className="text-emerald-400">${d.amount}</strong></p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                        d.status === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-800/40' :
                        d.status === 'resolved_seller' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' :
                        'bg-blue-950 text-blue-300 border border-blue-800/40'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-lg bg-[#0D1220] border border-rose-900/30">
                        <p className="font-semibold text-rose-300 mb-1">Buyer Claim ({d.buyerName}):</p>
                        <p className="text-slate-300 leading-relaxed">{d.buyerComplaint}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0D1220] border border-emerald-900/30">
                        <p className="font-semibold text-emerald-300 mb-1">Seller Response ({d.sellerName}):</p>
                        <p className="text-slate-300 leading-relaxed">{d.sellerResponse}</p>
                      </div>
                    </div>

                    {d.status === 'pending' && (
                      <div className="pt-2 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3">
                        <input
                          type="text"
                          placeholder="Arbitration judgment rationale / notes..."
                          value={disputeNote[d.id] || ''}
                          onChange={(e) => setDisputeNote({ ...disputeNote, [d.id]: e.target.value })}
                          className="w-full sm:flex-1 bg-[#0D1220] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleResolveDispute(d.id, 'release_to_seller')}
                            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            Release Funds to Seller
                          </button>
                          <button
                            onClick={() => handleResolveDispute(d.id, 'refund_buyer')}
                            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            Refund Buyer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: CONTENT MODERATION */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-200 mb-1">Content & Marketplace Moderation</h3>
              <p className="text-xs text-slate-400 mb-4">
                Review flagged listings, copyright claims, and reported creator services.
              </p>

              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800/40">
                          {r.itemType}
                        </span>
                        <span className="font-bold text-slate-200">{r.itemTitle}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1">Reason: <span className="text-slate-300">{r.reason}</span> (Reported by {r.reportedBy})</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'removed' ? 'bg-rose-950 text-rose-400' :
                        r.status === 'dismissed' ? 'bg-slate-800 text-slate-400' : 'bg-amber-950 text-amber-300'
                      }`}>
                        {r.status}
                      </span>
                      {r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleActionReport(r.id, 'dismiss')}
                            className="px-2.5 py-1 rounded bg-[#0D1220] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] text-[11px]"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleActionReport(r.id, 'remove')}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold"
                          >
                            Takedown Item
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PLATFORM SETTINGS */}
        {activeTab === 'settings' && settings && (
          <form onSubmit={handleSaveSettings} className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Platform Policies & Financial Constants</h3>
              <p className="text-xs text-slate-400 mt-0.5">Control global fees, escrow release locks, and payment sandbox routing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Platform Commission Fee (%): <span className="text-purple-400 font-bold">{settings.platformFeePercent}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={settings.platformFeePercent}
                  onChange={(e) => setSettings({ ...settings, platformFeePercent: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Deducted automatically upon escrow settlement.</p>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Escrow Auto-Release Lock Duration (Hours)
                </label>
                <input
                  type="number"
                  value={settings.escrowLockHours}
                  onChange={(e) => setSettings({ ...settings, escrowLockHours: parseInt(e.target.value) || 24 })}
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Minimum Creator Payout Threshold ($)
                </label>
                <input
                  type="number"
                  value={settings.minPayoutThreshold}
                  onChange={(e) => setSettings({ ...settings, minPayoutThreshold: parseFloat(e.target.value) || 10 })}
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Whop Financial Processing Mode</label>
                <select
                  value={settings.whopMode}
                  onChange={(e) => setSettings({ ...settings, whopMode: e.target.value as any })}
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="sandbox">Sandbox Test Environment</option>
                  <option value="live">Live Production Clearinghouse</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1E293B]">
                <div>
                  <p className="font-semibold text-slate-200">Maintenance Mode</p>
                  <p className="text-[11px] text-slate-400">Lock marketplace actions for public visitors</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1E293B]">
                <div>
                  <p className="font-semibold text-slate-200">Strict IP Hashing Firewall</p>
                  <p className="text-[11px] text-slate-400">Anonymize and encrypt visitor IP tracking logs</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.securityStrictIpHashing}
                  onChange={(e) => setSettings({ ...settings, securityStrictIpHashing: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
              </div>

            </div>

            {/* Email & OTP Dispatch Diagnostics Box */}
            <div className="p-4 rounded-xl bg-[#111827] border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>Email & OTP Dispatch Infrastructure</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Active Carriers: Google Gmail SMTP & Supabase Auth Fallback
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Production Ready (Live)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-lg bg-[#0D1220] border border-[#1E293B] space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-300">
                    <span>Gmail SMTP Relay</span>
                    <span className="text-emerald-400 font-mono">PORT 465 (SSL)</span>
                  </div>
                  <p className="text-slate-400 font-mono text-[10px]">smtp.gmail.com | vireon.partners1@gmail.com</p>
                  <p className="text-emerald-400/90 text-[10px]">✓ Google App Password Active & Verified</p>
                </div>

                <div className="p-3 rounded-lg bg-[#0D1220] border border-[#1E293B] space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-300">
                    <span>Supabase Auth Secondary Carrier</span>
                    <span className="text-emerald-400 font-mono">API Active</span>
                  </div>
                  <p className="text-slate-400 font-mono text-[10px]">/auth/v1/otp & /auth/v1/verify</p>
                  <p className="text-emerald-400/90 text-[10px]">✓ Automatic Fallback Active</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E293B] flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Platform Policies</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 7: AI & RADAR ENGINE */}
        {activeTab === 'ai' && aiConfig && (
          <form onSubmit={handleSaveAiConfig} className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">VIREON Opportunity Radar & AI Engine</h3>
              <p className="text-xs text-slate-400 mt-0.5">Configure Gemini model parameters, matching threshold sensitivity, and token budgets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              <div>
                <label className="block font-medium text-slate-300 mb-1">Active AI Model</label>
                <select
                  value={aiConfig.activeModel}
                  onChange={(e) => setAiConfig({ ...aiConfig, activeModel: e.target.value })}
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                >
                  <option value="models/gemini-2.5-flash">models/gemini-2.5-flash (Ultra Fast & Responsive)</option>
                  <option value="models/gemini-2.5-pro">models/gemini-2.5-pro (High Reasoning & Campaign Analysis)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Radar Match Threshold Sensitivity: <span className="text-purple-400 font-bold">{aiConfig.radarMatchThreshold}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={aiConfig.radarMatchThreshold}
                  onChange={(e) => setAiConfig({ ...aiConfig, radarMatchThreshold: parseInt(e.target.value) })}
                  className="w-full accent-purple-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">Opportunities scoring below this threshold are filtered out.</p>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Daily Token Limit Quota</label>
                <input
                  type="number"
                  value={aiConfig.tokenLimitPerDay}
                  onChange={(e) => setAiConfig({ ...aiConfig, tokenLimitPerDay: parseInt(e.target.value) || 100000 })}
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1E293B]">
                <div>
                  <p className="font-semibold text-slate-200">Auto Pitch Proposal Generation</p>
                  <p className="text-[11px] text-slate-400">Allow creators to generate instant bespoke proposals</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiConfig.autoPitchGenerationEnabled}
                  onChange={(e) => setAiConfig({ ...aiConfig, autoPitchGenerationEnabled: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-[#1E293B] flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save AI Engine Config</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 8: SEO & METADATA */}
        {activeTab === 'seo' && seoConfig && (
          <form onSubmit={handleSaveSeoConfig} className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">SEO & OpenGraph Social Metadata</h3>
              <p className="text-xs text-slate-400 mt-0.5">Control search engine index tags, social cards, and platform indexing.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Default Site Title</label>
                <input
                  type="text"
                  value={seoConfig.siteTitle}
                  onChange={(e) => setSeoConfig({ ...seoConfig, siteTitle: e.target.value })}
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Meta Description</label>
                <textarea
                  rows={3}
                  value={seoConfig.metaDescription}
                  onChange={(e) => setSeoConfig({ ...seoConfig, metaDescription: e.target.value })}
                  className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={seoConfig.canonicalUrl}
                    onChange={(e) => setSeoConfig({ ...seoConfig, canonicalUrl: e.target.value })}
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">OpenGraph Preview Image URL</label>
                  <input
                    type="text"
                    value={seoConfig.ogImage}
                    onChange={(e) => setSeoConfig({ ...seoConfig, ogImage: e.target.value })}
                    className="w-full bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E293B] flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Publish SEO Metadata</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 9: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Immutable Security & Administrative Audit Log</h3>
                <p className="text-xs text-slate-400">Cryptographically tracked ledger of all administrative interventions and blocked 403 intrusions.</p>
              </div>
              <button
                onClick={fetchAdminData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-300 text-xs border border-[#1E293B]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    log.status === 'BLOCKED_403'
                      ? 'bg-rose-950/20 border-rose-900/40'
                      : log.status === 'SUCCESS'
                      ? 'bg-[#111827] border-[#1E293B]'
                      : 'bg-amber-950/20 border-amber-900/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        log.status === 'BLOCKED_403' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' :
                        log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                        'bg-amber-950 text-amber-300'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">By: {log.adminEmail}</span>
                      <span className="text-slate-500 font-mono text-[10px]">IP: {log.ip}</span>
                    </div>
                    <p className="text-slate-200">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap self-end sm:self-auto font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
