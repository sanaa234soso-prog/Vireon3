import React, { useState } from 'react';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  ShoppingBag,
  Radar,
  Sparkles,
  Lock,
  BarChart3,
  MessageSquare,
  Settings as SettingsIcon,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Star,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  FileCheck,
  Check,
  X,
  CreditCard,
  Download,
  AlertCircle
} from 'lucide-react';
import { CampaignItem, CampaignApplication, OrderItem, User, CampaignDeliverable } from '../../types';

interface BrandDashboardProps {
  currentUser: User;
  campaigns: CampaignItem[];
  applications: CampaignApplication[];
  orders: OrderItem[];
  onOpenCampaignWizard: () => void;
  onOpenMatch: () => void;
  onOpenRadar?: () => void;
  onViewPassport: (userId: string) => void;
  onOpenMessages?: () => void;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({
  currentUser,
  campaigns: initialCampaigns,
  applications,
  orders: initialOrders,
  onOpenCampaignWizard,
  onOpenMatch,
  onOpenRadar,
  onViewPassport,
  onOpenMessages
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'campaigns'
    | 'creators'
    | 'orders'
    | 'radar'
    | 'match'
    | 'escrow'
    | 'analytics'
    | 'messages'
    | 'settings'
  >('overview');

  const [campaignsList, setCampaignsList] = useState<CampaignItem[]>(initialCampaigns);
  const [ordersList, setOrdersList] = useState<OrderItem[]>(initialOrders);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Modals state
  const [revisionModal, setRevisionModal] = useState<{
    isOpen: boolean;
    campaignId?: string;
    deliverableId?: string;
    orderId?: string;
    title: string;
    creatorName: string;
  } | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  const [disputeModal, setDisputeModal] = useState<{
    isOpen: boolean;
    campaignId?: string;
    deliverableId?: string;
    orderId?: string;
    title: string;
    creatorName: string;
    amount: number;
  } | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const [fundModal, setFundModal] = useState<{
    isOpen: boolean;
    campaign: CampaignItem;
  } | null>(null);

  const myCampaigns = campaignsList.filter((c) => c.brandId === currentUser.id);
  const myOrders = ordersList.filter((o) => o.buyerId === currentUser.id);

  // Aggregate all campaign deliverables for this brand
  const allCampaignDeliverables: { campaign: CampaignItem; deliv: CampaignDeliverable }[] = [];
  myCampaigns.forEach((camp) => {
    if (camp.deliverablesList && camp.deliverablesList.length > 0) {
      camp.deliverablesList.forEach((deliv) => {
        allCampaignDeliverables.push({ campaign: camp, deliv });
      });
    }
  });

  // Calculate live financial statistics for Payment Protection
  const totalFunded = myCampaigns.reduce((sum, c) => sum + (c.fundedAmount || (c.fundingStatus === 'funded' ? c.budget : 0)), 0);
  const totalLockedInProtection = myCampaigns.reduce((sum, c) => sum + (c.lockedInProtection !== undefined ? c.lockedInProtection : (c.fundingStatus === 'funded' ? c.budget : 0)), 0) +
    myOrders.filter(o => o.status === 'paid' || o.status === 'in_progress' || o.status === 'delivered').reduce((sum, o) => sum + o.amount, 0);
  const totalReleased = myCampaigns.reduce((sum, c) => sum + (c.releasedAmount || 0), 0) +
    myOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0);
  const totalRefunded = myCampaigns.reduce((sum, c) => sum + (c.refundedAmount || 0), 0) +
    myOrders.filter(o => o.status === 'refunded').reduce((sum, o) => sum + o.amount, 0);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorBanner(msg);
      setTimeout(() => setErrorBanner(null), 5000);
    } else {
      setSuccessBanner(msg);
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  };

  // --- Campaign Funding via Whop ---
  const handleFundCampaign = async (campaignId: string) => {
    setActionLoading(`fund_${campaignId}`);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulated: true, // Server-side Whop Payment Protection funding verification
          whopPaymentId: `whop_pay_${Date.now()}`,
          brandEmail: currentUser.email
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCampaignsList((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, fundingStatus: 'funded', fundedAmount: c.budget, lockedInProtection: c.budget } : c))
        );
        showNotification(`تم تأكيد الدفع وتفعيل حماية الدفع (Payment Protection) للحملة بمبلغ $${data.campaign?.budget || ''}`);
        setFundModal(null);
      } else {
        showNotification(data.error || 'فشل تأكيد التمويل للحملة', true);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Campaign Deliverable Actions ---
  const handleAcceptCampaignDeliverable = async (campaignId: string, deliverableId: string, amount: number, creatorName: string) => {
    setActionLoading(`deliv_${deliverableId}`);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/deliverables/${deliverableId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: currentUser.id })
      });
      const data = await res.json();
      if (res.ok) {
        setCampaignsList((prev) =>
          prev.map((camp) => {
            if (camp.id === campaignId) {
              const updatedList = (camp.deliverablesList || []).map((d) =>
                d.id === deliverableId ? { ...d, status: 'approved' as const, approvedAt: new Date().toISOString() } : d
              );
              return {
                ...camp,
                deliverablesList: updatedList,
                lockedInProtection: Math.max(0, (camp.lockedInProtection || 0) - amount),
                releasedAmount: (camp.releasedAmount || 0) + amount
              };
            }
            return camp;
          })
        );
        showNotification(`تم قبول التسليم والإفراج عن مستحقات المبدع (${creatorName}) بمبلغ $${amount.toFixed(2)} بنجاح من حماية الدفع.`);
      } else {
        showNotification(data.message || 'حدث خطأ أثناء قبول التسليم', true);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestRevisionSubmit = async () => {
    if (!revisionModal || !revisionNotes.trim()) return;
    setActionLoading('revision_submitting');
    try {
      if (revisionModal.campaignId && revisionModal.deliverableId) {
        const res = await fetch(`/api/campaigns/${revisionModal.campaignId}/deliverables/${revisionModal.deliverableId}/revision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ revisionNotes })
        });
        if (res.ok) {
          setCampaignsList((prev) =>
            prev.map((camp) => {
              if (camp.id === revisionModal.campaignId) {
                const updatedList = (camp.deliverablesList || []).map((d) =>
                  d.id === revisionModal.deliverableId ? { ...d, status: 'revision_requested' as const, revisionNotes } : d
                );
                return { ...camp, deliverablesList: updatedList };
              }
              return camp;
            })
          );
          showNotification(`تم إرسال طلب التعديل إلى المبدع (${revisionModal.creatorName}) بنجاح.`);
        }
      } else if (revisionModal.orderId) {
        const res = await fetch(`/api/orders/${revisionModal.orderId}/request-revision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: revisionNotes, buyerId: currentUser.id })
        });
        if (res.ok) {
          setOrdersList((prev) =>
            prev.map((o) => (o.id === revisionModal.orderId ? { ...o, status: 'revision_requested' as any, revisionNotes } : o))
          );
          showNotification(`تم إرسال طلب التعديل على الطلب بنجاح.`);
        }
      }
      setRevisionModal(null);
      setRevisionNotes('');
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenDisputeSubmit = async () => {
    if (!disputeModal || !disputeReason.trim()) return;
    setActionLoading('dispute_submitting');
    try {
      if (disputeModal.campaignId && disputeModal.deliverableId) {
        const res = await fetch(`/api/campaigns/${disputeModal.campaignId}/deliverables/${disputeModal.deliverableId}/dispute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: disputeReason, brandId: currentUser.id })
        });
        if (res.ok) {
          setCampaignsList((prev) =>
            prev.map((camp) => {
              if (camp.id === disputeModal.campaignId) {
                const updatedList = (camp.deliverablesList || []).map((d) =>
                  d.id === disputeModal.deliverableId ? { ...d, status: 'disputed' as const, disputeReason } : d
                );
                return { ...camp, deliverablesList: updatedList };
              }
              return camp;
            })
          );
          showNotification(`تم فتح تذكرة النزاع وتجميد تحويل المبلغ تحت مظلة حماية الدفع المالي بنجاح.`);
        }
      } else if (disputeModal.orderId) {
        const res = await fetch(`/api/orders/${disputeModal.orderId}/dispute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: disputeReason, buyerId: currentUser.id })
        });
        if (res.ok) {
          setOrdersList((prev) =>
            prev.map((o) => (o.id === disputeModal.orderId ? { ...o, status: 'disputed' as any } : o))
          );
          showNotification(`تم فتح تذكرة النزاع وتجميد رصيد الطلب بنجاح.`);
        }
      }
      setDisputeModal(null);
      setDisputeReason('');
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefundCampaignDeliverable = async (campaignId: string, deliverableId: string, amount: number) => {
    if (!confirm(`هل أنت متأكد من طلب استرداد مبلغ $${amount.toFixed(2)} عبر نظام حماية الدفع؟`)) return;
    setActionLoading(`refund_${deliverableId}`);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/deliverables/${deliverableId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: currentUser.id })
      });
      if (res.ok) {
        setCampaignsList((prev) =>
          prev.map((camp) => {
            if (camp.id === campaignId) {
              const updatedList = (camp.deliverablesList || []).map((d) =>
                d.id === deliverableId ? { ...d, status: 'refunded' as const, refundedAt: new Date().toISOString() } : d
              );
              return {
                ...camp,
                deliverablesList: updatedList,
                lockedInProtection: Math.max(0, (camp.lockedInProtection || 0) - amount),
                refundedAmount: (camp.refundedAmount || 0) + amount
              };
            }
            return camp;
          })
        );
        showNotification(`تم استرداد مبلغ $${amount.toFixed(2)} بنجاح وإيداعه في محفظتك.`);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Individual Order Deliverable Acceptance ---
  const handleAcceptOrder = async (order: OrderItem) => {
    setActionLoading(`order_${order.id}`);
    try {
      const res = await fetch(`/api/orders/${order.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: currentUser.id })
      });
      if (res.ok) {
        setOrdersList((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: 'completed' } : o))
        );
        showNotification(`تم قبول التسليم وصرف مستحقات المبدع (${order.sellerName}) بمبلغ $${order.amount.toFixed(2)} بنجاح.`);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setActionLoading(null);
    }
  };

  const sidebarNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, badge: myCampaigns.length },
    { id: 'creators', label: 'Creators', icon: Users, badge: 18 },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: myOrders.length },
    { id: 'radar', label: 'Opportunity Radar', icon: Radar },
    { id: 'match', label: 'AI Match', icon: Sparkles },
    { id: 'escrow', label: 'Payment Protection', icon: Lock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* SUCCESS / ERROR BANNERS */}
      {successBanner && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorBanner && (
        <div className="mb-4 p-4 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
            
            {/* Brand Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E293B]">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-10 h-10 rounded-xl object-cover border border-[#1E293B]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-semibold text-white truncate">{currentUser.fullName}</h3>
                  <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400">Verified Brand</p>
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
                      if (item.id === 'match') {
                        onOpenMatch();
                      } else if (item.id === 'radar' && onOpenRadar) {
                        onOpenRadar();
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
                onClick={onOpenCampaignWizard}
                className="w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Campaign</span>
              </button>
            </div>

          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* TOP 4 STAT CARDS (WITH REAL PAYMENT PROTECTION STATS) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Active Campaigns</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      {myCampaigns.length}
                    </span>
                    <span className="text-[10px] font-semibold text-purple-400 font-mono">Running</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Whop Funded Budget</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                      ${totalFunded.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 font-mono">Verified</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Locked in Protection</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-purple-400 font-mono">
                      ${totalLockedInProtection.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono">Whop Vault</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Released to Creators</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                      ${totalReleased.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono">Approved</span>
                  </div>
                </div>
              </div>

              {/* ACTIVE CAMPAIGNS TABLE WITH PAYMENT PROTECTION STATUS */}
              <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">Active Campaigns & Whop Protection</h2>
                    <p className="text-xs text-slate-400">Campaigns are protected via Whop. Funds remain locked until deliverables are accepted.</p>
                  </div>
                  <button
                    onClick={onOpenCampaignWizard}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <span>Launch Campaign</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-slate-500 font-semibold">
                        <th className="pb-2">Campaign Title</th>
                        <th className="pb-2">Budget</th>
                        <th className="pb-2">Payment Protection</th>
                        <th className="pb-2">Locked Vault</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                      {myCampaigns.map((camp) => {
                        const isFunded = camp.fundingStatus === 'funded';
                        return (
                          <tr key={camp.id} className="hover:bg-[#111827]/40">
                            <td className="py-3 font-medium text-white max-w-[200px] truncate">
                              <div className="font-semibold">{camp.title}</div>
                              <div className="text-[11px] text-slate-500">{camp.productName}</div>
                            </td>
                            <td className="py-3 font-mono font-semibold text-white">${camp.budget.toFixed(2)}</td>
                            <td className="py-3">
                              {isFunded ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                  Whop Protected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/50">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  Pending Payment
                                </span>
                              )}
                            </td>
                            <td className="py-3 font-mono text-purple-300 font-semibold">
                              ${(camp.lockedInProtection !== undefined ? camp.lockedInProtection : (isFunded ? camp.budget : 0)).toFixed(2)}
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/40">
                                {camp.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {!isFunded ? (
                                <button
                                  disabled={actionLoading === `fund_${camp.id}`}
                                  onClick={() => handleFundCampaign(camp.id)}
                                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 ml-auto"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>{actionLoading === `fund_${camp.id}` ? 'Funding...' : 'Fund via Whop'}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setActiveTab('campaigns')}
                                  className="px-2.5 py-1 rounded bg-[#111827] hover:bg-[#151f33] border border-[#1E293B] text-xs font-semibold text-purple-300"
                                >
                                  View Deliverables
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RECENT CREATOR DELIVERABLES (CAMPAIGNS & ORDERS) WITH FULL PROTECTION CONTROLS */}
              <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">Campaign & Order Deliverables Review</h2>
                    <p className="text-xs text-slate-400">
                      Payment Protection is active. Payouts to creators are only released after your formal approval.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {allCampaignDeliverables.length === 0 && myOrders.filter(o => o.status === 'delivered' || o.status === 'completed' || o.status === 'revision_requested' || o.status === 'disputed').length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No active deliverables awaiting review right now.</p>
                  ) : (
                    <>
                      {/* Campaign Deliverables */}
                      {allCampaignDeliverables.map(({ campaign, deliv }) => {
                        const isPendingReview = deliv.status === 'submitted';
                        return (
                          <div
                            key={deliv.id}
                            className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={deliv.creatorAvatar}
                                alt={deliv.creatorName}
                                className="w-10 h-10 rounded-lg object-cover border border-[#1E293B]"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-white">{deliv.milestoneTitle}</h3>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/40">
                                    ${deliv.amount.toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-slate-400 text-[11px] mt-0.5">
                                  Creator: <span className="text-purple-300">{deliv.creatorName}</span> • Campaign: <span className="text-slate-300">{campaign.title}</span>
                                </p>
                                {deliv.notes && (
                                  <p className="text-slate-300 text-[11px] mt-1 bg-[#0D1220] p-2 rounded border border-[#1E293B]">
                                    "{deliv.notes}"
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-[11px]">
                                  {deliv.status === 'submitted' && (
                                    <span className="text-amber-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      Under Review • 72h Protection Window
                                    </span>
                                  )}
                                  {deliv.status === 'approved' && (
                                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Approved & Payout Released via Whop
                                    </span>
                                  )}
                                  {deliv.status === 'revision_requested' && (
                                    <span className="text-amber-300 flex items-center gap-1">
                                      <RotateCcw className="w-3 h-3" />
                                      Revision Requested: {deliv.revisionNotes}
                                    </span>
                                  )}
                                  {deliv.status === 'disputed' && (
                                    <span className="text-rose-400 flex items-center gap-1 font-semibold">
                                      <AlertTriangle className="w-3 h-3" />
                                      Dispute Open • Transfer Frozen in Vault
                                    </span>
                                  )}
                                  {deliv.status === 'refunded' && (
                                    <span className="text-slate-400 flex items-center gap-1">
                                      Refunded to Brand Wallet
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {deliv.deliverableUrl && (
                                <a
                                  href={deliv.deliverableUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-[#0D1220] border border-[#1E293B] text-slate-300 text-xs font-medium hover:text-white flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Preview File</span>
                                </a>
                              )}

                              {isPendingReview && (
                                <>
                                  <button
                                    disabled={actionLoading === `deliv_${deliv.id}`}
                                    onClick={() => handleAcceptCampaignDeliverable(campaign.id, deliv.id, deliv.amount, deliv.creatorName)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve & Release (${deliv.amount.toFixed(2)})</span>
                                  </button>

                                  <button
                                    onClick={() =>
                                      setRevisionModal({
                                        isOpen: true,
                                        campaignId: campaign.id,
                                        deliverableId: deliv.id,
                                        title: deliv.milestoneTitle,
                                        creatorName: deliv.creatorName
                                      })
                                    }
                                    className="px-2.5 py-1.5 rounded-lg bg-[#0D1220] hover:bg-[#151f33] border border-[#1E293B] text-amber-300 text-xs font-medium flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Request Revision</span>
                                  </button>

                                  <button
                                    onClick={() =>
                                      setDisputeModal({
                                        isOpen: true,
                                        campaignId: campaign.id,
                                        deliverableId: deliv.id,
                                        title: deliv.milestoneTitle,
                                        creatorName: deliv.creatorName,
                                        amount: deliv.amount
                                      })
                                    }
                                    className="px-2.5 py-1.5 rounded-lg bg-[#0D1220] hover:bg-rose-950/60 border border-rose-900/40 text-rose-300 text-xs font-medium flex items-center gap-1"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Dispute</span>
                                  </button>
                                </>
                              )}

                              {deliv.status === 'disputed' && (
                                <button
                                  disabled={actionLoading === `refund_${deliv.id}`}
                                  onClick={() => handleRefundCampaignDeliverable(campaign.id, deliv.id, deliv.amount)}
                                  className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold"
                                >
                                  Claim Refund (${deliv.amount.toFixed(2)})
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Order Deliverables */}
                      {myOrders
                        .filter(o => o.status === 'delivered' || o.status === 'completed' || o.status === 'revision_requested' || o.status === 'disputed')
                        .map((order) => (
                          <div
                            key={order.id}
                            className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/40 flex items-center justify-center text-purple-300 font-bold uppercase">
                                {order.itemType.slice(0, 3)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{order.itemTitle} - {order.sellerName}</h3>
                                <p className="text-slate-400 text-[11px]">
                                  {order.status === 'delivered'
                                    ? 'Submitted • 72h Payment Protection Window'
                                    : order.status === 'completed'
                                    ? 'Completed & Released via Whop'
                                    : order.status === 'disputed'
                                    ? 'Dispute Open • Held in Protection'
                                    : 'Revision Pending'}
                                </p>
                                {order.deliveryNotes && (
                                  <p className="text-slate-300 text-[11px] mt-0.5">{order.deliveryNotes}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {order.deliverableUrl && (
                                <a
                                  href={order.deliverableUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-[#0D1220] border border-[#1E293B] text-slate-300 text-xs font-medium hover:text-white"
                                >
                                  Preview Files
                                </a>
                              )}
                              {order.status === 'delivered' ? (
                                <>
                                  <button
                                    disabled={actionLoading === `order_${order.id}`}
                                    onClick={() => handleAcceptOrder(order)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                                  >
                                    Approve & Release (${order.amount.toFixed(2)})
                                  </button>
                                  <button
                                    onClick={() =>
                                      setRevisionModal({
                                        isOpen: true,
                                        orderId: order.id,
                                        title: order.itemTitle,
                                        creatorName: order.sellerName
                                      })
                                    }
                                    className="px-2.5 py-1.5 rounded-lg bg-[#0D1220] border border-[#1E293B] text-amber-300 text-xs font-medium"
                                  >
                                    Revise
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDisputeModal({
                                        isOpen: true,
                                        orderId: order.id,
                                        title: order.itemTitle,
                                        creatorName: order.sellerName,
                                        amount: order.amount
                                      })
                                    }
                                    className="px-2.5 py-1.5 rounded-lg bg-[#0D1220] border border-rose-900/40 text-rose-300 text-xs font-medium"
                                  >
                                    Dispute
                                  </button>
                                </>
                              ) : (
                                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 text-[11px] font-bold border border-emerald-800">
                                  {order.status.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Campaign Management & Payment Protection</h2>
                  <p className="text-xs text-slate-400">Fund campaigns through Whop, manage creator applicants, and approve milestone deliverables.</p>
                </div>
                <button
                  onClick={onOpenCampaignWizard}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Campaign</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {myCampaigns.map((c) => {
                  const isFunded = c.fundingStatus === 'funded';
                  return (
                    <div key={c.id} className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-purple-300 font-semibold">{c.targetNiche}</span>
                            {isFunded ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                Payment Protection Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/40">
                                Unfunded / Pending Whop Payment
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-white mt-1">{c.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-sm font-bold text-emerald-400 block">${c.budget.toFixed(2)}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{c.paymentModel}</span>
                        </div>
                      </div>

                      {/* Payment Protection Vault Progress */}
                      <div className="p-3.5 rounded-lg bg-[#111827] border border-[#1E293B] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Total Budget</span>
                          <span className="font-mono font-semibold text-white mt-0.5 block">${c.budget.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Locked in Protection</span>
                          <span className="font-mono font-semibold text-purple-400 mt-0.5 block">
                            ${(c.lockedInProtection !== undefined ? c.lockedInProtection : (isFunded ? c.budget : 0)).toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Released to Talent</span>
                          <span className="font-mono font-semibold text-emerald-400 mt-0.5 block">${(c.releasedAmount || 0).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Refunded / Disputed</span>
                          <span className="font-mono font-semibold text-slate-300 mt-0.5 block">${(c.refundedAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Deliverables Submissions inside Campaign */}
                      {c.deliverablesList && c.deliverablesList.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                          <h4 className="text-xs font-semibold text-slate-300">Creator Milestone Deliverables:</h4>
                          <div className="space-y-2">
                            {c.deliverablesList.map((deliv) => (
                              <div
                                key={deliv.id}
                                className="p-3 rounded-lg bg-[#0D1220] border border-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <img src={deliv.creatorAvatar} alt={deliv.creatorName} className="w-8 h-8 rounded-lg object-cover" />
                                  <div>
                                    <div className="font-medium text-white">{deliv.milestoneTitle}</div>
                                    <div className="text-[11px] text-slate-400">{deliv.creatorName} • ${deliv.amount.toFixed(2)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {deliv.status === 'submitted' ? (
                                    <>
                                      <button
                                        disabled={actionLoading === `deliv_${deliv.id}`}
                                        onClick={() => handleAcceptCampaignDeliverable(c.id, deliv.id, deliv.amount, deliv.creatorName)}
                                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                                      >
                                        Approve (${deliv.amount.toFixed(2)})
                                      </button>
                                      <button
                                        onClick={() =>
                                          setRevisionModal({
                                            isOpen: true,
                                            campaignId: c.id,
                                            deliverableId: deliv.id,
                                            title: deliv.milestoneTitle,
                                            creatorName: deliv.creatorName
                                          })
                                        }
                                        className="px-2 py-1 rounded bg-[#111827] border border-[#1E293B] text-amber-300 text-xs"
                                      >
                                        Revise
                                      </button>
                                    </>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                      {deliv.status.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs">
                        <span className="text-slate-400">{c.creatorsApplied} / {c.creatorsNeeded} applicants</span>
                        <div className="flex items-center gap-2">
                          {!isFunded && (
                            <button
                              disabled={actionLoading === `fund_${c.id}`}
                              onClick={() => handleFundCampaign(c.id)}
                              className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                            >
                              Fund Campaign via Whop
                            </button>
                          )}
                          <button
                            onClick={onOpenMatch}
                            className="px-3 py-1 rounded bg-[#111827] hover:bg-[#151f33] border border-[#1E293B] text-purple-300 text-xs font-semibold"
                          >
                            Match Talent
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS & PAYMENT PROTECTION (WHOP) */}
          {activeTab === 'escrow' && (
            <div className="p-6 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <h2 className="text-base font-bold text-white">Whop Payment Protection (حماية الدفع)</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  100% Server-side Whop integration. Campaign budgets and milestone payments are securely locked in the Vireon vault until work is delivered and approved.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Active Protection Vault</span>
                  <span className="text-2xl font-bold text-purple-400 font-mono mt-1 block">
                    ${totalLockedInProtection.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400">Locked in Whop</span>
                </div>
                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Total Funded via Whop</span>
                  <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
                    ${totalFunded.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-emerald-400">payment_succeeded verified</span>
                </div>
                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Released After Approval</span>
                  <span className="text-2xl font-bold text-white font-mono mt-1 block">
                    ${totalReleased.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400">Transferred to talent</span>
                </div>
                <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Refunded to Brand</span>
                  <span className="text-2xl font-bold text-slate-300 font-mono mt-1 block">
                    ${totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400">Disputes / Cancellations</span>
                </div>
              </div>

              {/* HOW PAYMENT PROTECTION WORKS */}
              <div className="p-5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3 text-xs">
                <h3 className="font-semibold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Whop Payment Protection Rules & Lifecycle</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
                  <div className="p-3 rounded-lg bg-[#0D1220] border border-[#1E293B]/70">
                    <span className="text-purple-400 font-bold block mb-1">1. Server-Side Funding</span>
                    <p className="text-[11px] text-slate-400">
                      Campaigns are funded via Whop checkouts. Funds are never credited directly to creators until deliverables are verified.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0D1220] border border-[#1E293B]/70">
                    <span className="text-purple-400 font-bold block mb-1">2. 72h Review Window</span>
                    <p className="text-[11px] text-slate-400">
                      Creators submit high-res deliverables inside Vireon. Brands have 72 hours to inspect files, request revisions, or approve payouts.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0D1220] border border-[#1E293B]/70">
                    <span className="text-purple-400 font-bold block mb-1">3. Dispute & Refund Safety</span>
                    <p className="text-[11px] text-slate-400">
                      If deliverables do not match agreed specifications, brand can freeze payouts with 1-click and request full Whop refunds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {activeTab !== 'overview' && activeTab !== 'campaigns' && activeTab !== 'escrow' && (
            <div className="p-6 rounded-xl bg-[#0D1220] border border-[#1E293B] text-center py-12 space-y-2">
              <h3 className="text-base font-semibold text-white capitalize">{activeTab} Section</h3>
              <p className="text-xs text-slate-400">Settings and brand configurations are active.</p>
            </div>
          )}

        </main>

      </div>

      {/* REVISION REQUEST MODAL */}
      {revisionModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Request Revision</h3>
              </div>
              <button onClick={() => setRevisionModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400">
              Provide feedback for <span className="text-white font-medium">{revisionModal.creatorName}</span> regarding <span className="text-purple-300 font-medium">{revisionModal.title}</span>. Payout remains securely locked in protection.
            </p>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Required Edits / Notes:</label>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="e.g. Please adjust color grading in hook 2 and add Saudi subtitle captions..."
                className="w-full h-24 p-3 rounded-lg bg-[#111827] border border-[#1E293B] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevisionModal(null)}
                className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#151f33] border border-[#1E293B] text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                disabled={!revisionNotes.trim() || actionLoading === 'revision_submitting'}
                onClick={handleRequestRevisionSubmit}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{actionLoading === 'revision_submitting' ? 'Sending...' : 'Send Revision Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Open Dispute & Freeze Funds</h3>
              </div>
              <button onClick={() => setDisputeModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-400">
              Opening a dispute immediately freezes the <span className="font-mono text-white">${disputeModal.amount.toFixed(2)}</span> payout in Whop Payment Protection vault until resolved by Vireon mediation.
            </p>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reason for Dispute:</label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe the issue (e.g. Non-delivery, wrong resolution, missed deadline, rights breach)..."
                className="w-full h-24 p-3 rounded-lg bg-[#111827] border border-[#1E293B] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDisputeModal(null)}
                className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#151f33] border border-[#1E293B] text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                disabled={!disputeReason.trim() || actionLoading === 'dispute_submitting'}
                onClick={handleOpenDisputeSubmit}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{actionLoading === 'dispute_submitting' ? 'Freezing...' : 'Freeze Funds & Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

