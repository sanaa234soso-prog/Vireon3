import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Download,
  ShieldCheck,
  ExternalLink,
  CreditCard,
  Package,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  AlertCircle,
  Heart,
  Key,
  Star,
  RefreshCw,
  Eye,
  MessageSquare,
  FileCheck,
  X,
  Wallet,
  Bell,
  Scale,
  User as UserIcon,
  Settings,
  HelpCircle,
  Send,
  Search,
  Filter,
  Check,
  ChevronRight,
  Info,
  Lock,
  Unlock,
  ArrowUpRight,
  FileQuestion,
  Phone,
  Mail,
  Globe,
  Sparkles
} from 'lucide-react';
import { OrderItem, User, ConversationItem, MessageItem } from '../../types';

interface CustomerDashboardProps {
  currentUser: User;
  orders: OrderItem[];
  onExplore: () => void;
  onOpenOrderChat?: (sellerId: string) => void;
  onOpenMessages?: () => void;
  onOpenSupport?: () => void;
  conversations?: ConversationItem[];
  messages?: MessageItem[];
  onSendMessage?: (conversationId: string, body: string) => void;
  onRefreshAllData?: () => void;
}

type TabType =
  | 'overview'
  | 'orders'
  | 'payments'
  | 'escrow'
  | 'messages'
  | 'notifications'
  | 'disputes'
  | 'profile'
  | 'support';

interface SupportTicket {
  id: string;
  subject: string;
  category: 'payment' | 'escrow' | 'order' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_review' | 'resolved';
  createdAt: string;
  lastReply: string;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  orders,
  onExplore,
  onOpenOrderChat,
  onOpenMessages,
  onOpenSupport,
  conversations = [],
  messages = [],
  onSendMessage,
  onRefreshAllData
}) => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Orders and local data states
  const [localOrders, setLocalOrders] = useState<OrderItem[]>(orders);
  const [orderFilter, setOrderFilter] = useState<'all' | 'in_progress' | 'delivered' | 'completed' | 'revision' | 'disputed'>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Modals & Action States
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<OrderItem | null>(null);
  const [disputeModalOrder, setDisputeModalOrder] = useState<OrderItem | null>(null);
  const [revisionModalOrder, setRevisionModalOrder] = useState<OrderItem | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Digital Downloads
  const [userDownloads, setUserDownloads] = useState<any[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(false);

  // Messages state
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [chatMessageText, setChatMessageText] = useState('');
  const [localMessages, setLocalMessages] = useState<MessageItem[]>(messages);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 'notif_1',
      title: 'تم تأكيد حجز الضمان المالي',
      message: 'أموالك بقيمة $350.00 محجوزة بأمان في خزينة Escrow Vault ولن تحول للبائع إلا بعد موافقتك على العمل.',
      type: 'escrow',
      isRead: false,
      date: 'منذ ساعتين'
    },
    {
      id: 'notif_2',
      title: 'تسليم عمل جاهز للمراجعة',
      message: 'قام صانع المحتوى بتسليم المسودة النهائية للطلب #ord_8921. لديك 72 ساعة للمعاينة والموافقة أو طلب تعديل.',
      type: 'order',
      isRead: false,
      date: 'منذ 5 ساعات'
    },
    {
      id: 'notif_3',
      title: 'إيصال دفع رسمي وموثق',
      message: 'تم إصدار الفاتورة الضريبية وسند الدفع للعملية رقم vir_pay_8912301928.',
      type: 'payment',
      isRead: true,
      date: 'أمس'
    }
  ]);

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'tkt_8912',
      subject: 'استفسار حول آلية الإفراج الجزئي عن الضمان المالي',
      category: 'escrow',
      priority: 'medium',
      status: 'resolved',
      createdAt: '2026-08-10',
      lastReply: 'تم توضيح أن الضمان يُفرج عنه بالكامل فقط عند اعتماد التسليم النهائي.'
    }
  ]);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<'payment' | 'escrow' | 'order' | 'technical' | 'other'>('escrow');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTicketDetails, setNewTicketDetails] = useState('');

  // Profile Form state
  const [profileName, setProfileName] = useState(currentUser.fullName);
  const [profileBio, setProfileBio] = useState(currentUser.bio || 'مشتري ومستثمر في صناعة المحتوى والإعلانات');
  const [profileCountry, setProfileCountry] = useState(currentUser.country || 'المملكة العربية السعودية');
  const [currencyPref, setCurrencyPref] = useState('USD');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Sync orders with parent
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  useEffect(() => {
    fetchUserDownloads();
  }, [currentUser.id]);

  const fetchUserDownloads = async () => {
    setLoadingDownloads(true);
    try {
      const res = await fetch(`/api/user/downloads?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserDownloads(data);
      }
    } catch (e) {
      console.error('Failed to fetch downloads', e);
    } finally {
      setLoadingDownloads(false);
    }
  };

  const reloadOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setLocalOrders(data);
      }
      if (onRefreshAllData) {
        onRefreshAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter orders related to this customer
  const myOrders = localOrders.filter(
    o => o.buyerId === currentUser.id || o.buyerName === currentUser.fullName
  );

  // Financial calculations
  const totalPaid = myOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.amount : 0), 0);
  
  const escrowLockedAmount = myOrders
    .filter(o => o.status === 'paid' || o.status === 'in_progress' || o.status === 'delivered' || o.status === 'revision_requested')
    .reduce((sum, o) => sum + o.amount, 0);

  const releasedAmount = myOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const refundedAmount = myOrders
    .filter(o => o.status === 'refunded')
    .reduce((sum, o) => sum + o.amount, 0);

  const pendingApprovalOrders = myOrders.filter(o => o.status === 'delivered');
  const inProgressOrders = myOrders.filter(o => o.status === 'paid' || o.status === 'in_progress');
  const disputedOrders = myOrders.filter(o => o.status === 'disputed');

  // Filtered orders list for "My Orders" tab
  const displayedOrders = myOrders.filter(order => {
    const matchesSearch =
      order.itemTitle.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.sellerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(orderSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (orderFilter === 'in_progress') return order.status === 'paid' || order.status === 'in_progress';
    if (orderFilter === 'delivered') return order.status === 'delivered';
    if (orderFilter === 'completed') return order.status === 'completed';
    if (orderFilter === 'revision') return order.status === 'revision_requested';
    if (orderFilter === 'disputed') return order.status === 'disputed';
    return true;
  });

  // Action handlers
  const handleApproveDelivery = async (orderId: string) => {
    if (!confirm('هل تؤكد استلام العمل والموافقة عليه بالكامل؟ سيتم فوراً الإفراج عن المبلغ المحجوز بالضمان وتحويله لحساب صانع المحتوى.')) {
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: currentUser.id })
      });
      if (res.ok) {
        setActionFeedback('تم اعتماد التسليم بنجاح! تم تحرير مبلغ الضمان وإرساله للبائع.');
        setTimeout(() => setActionFeedback(null), 4000);
        await reloadOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل اعتماد التسليم');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenRevision = (order: OrderItem) => {
    setRevisionModalOrder(order);
    setRevisionNotes('');
  };

  const handleSubmitRevision = async () => {
    if (!revisionModalOrder || !revisionNotes.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/orders/${revisionModalOrder.id}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisionNotes: revisionNotes.trim(),
          buyerId: currentUser.id
        })
      });
      if (res.ok) {
        setRevisionModalOrder(null);
        setActionFeedback('تم إرسال طلب التعديل لصانع المحتوى بنجاح. الضمان المالي لا يزال مجمداً لحين التسليم الجديد.');
        setTimeout(() => setActionFeedback(null), 4000);
        await reloadOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل إرسال طلب التعديل');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenDispute = (order: OrderItem) => {
    setDisputeModalOrder(order);
    setDisputeReason('');
  };

  const handleSubmitDispute = async () => {
    if (!disputeModalOrder || !disputeReason.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/orders/${disputeModalOrder.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: disputeReason.trim(),
          userId: currentUser.id,
          userRole: currentUser.role
        })
      });
      if (res.ok) {
        setDisputeModalOrder(null);
        setActionFeedback('تم رفع النزاع بنجاح وتجميد صرف الضمان المالي لحين مراجعة وتدخل إدارة المنصة.');
        setTimeout(() => setActionFeedback(null), 4000);
        await reloadOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'فشل رفع تذكرة النزاع');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTicket = () => {
    if (!newTicketSubject.trim() || !newTicketDetails.trim()) return;
    const newTkt: SupportTicket = {
      id: `tkt_${Date.now().toString().slice(-4)}`,
      subject: newTicketSubject.trim(),
      category: newTicketCategory,
      priority: newTicketPriority,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      lastReply: 'تم استلام تذكرتك وبانتظار رد ممثل الدعم المالي والفني.'
    };
    setTickets(prev => [newTkt, ...prev]);
    setIsNewTicketModalOpen(false);
    setNewTicketSubject('');
    setNewTicketDetails('');
    setActionFeedback('تم فتح تذكرة الدعم بنجاح وسيتم الرد عليك في غضون ساعتين.');
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleSaveProfile = () => {
    setActionFeedback('تم حفظ وتحديث الملف الشخصي وتفضيلات الحساب بنجاح.');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleSendDirectMessage = () => {
    if (!chatMessageText.trim()) return;
    const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
    const convId = activeConv ? activeConv.id : 'conv_default';
    
    if (onSendMessage) {
      onSendMessage(convId, chatMessageText.trim());
    }

    const newMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      conversationId: convId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      body: chatMessageText.trim(),
      isRead: true,
      createdAt: new Date().toISOString()
    };
    setLocalMessages(prev => [...prev, newMsg]);
    setChatMessageText('');
  };

  // Nav tabs config
  const navTabs = [
    { id: 'overview', label: 'الرئيسية', icon: ShoppingBag, badge: pendingApprovalOrders.length > 0 ? `${pendingApprovalOrders.length} إجراء` : undefined, badgeColor: 'bg-amber-500' },
    { id: 'orders', label: 'طلباتي', icon: Package, badge: myOrders.length.toString() },
    { id: 'payments', label: 'المدفوعات والفواتير', icon: CreditCard },
    { id: 'escrow', label: 'المحفظة / Escrow', icon: ShieldCheck, badge: `$${escrowLockedAmount.toFixed(0)}`, badgeColor: 'bg-emerald-600' },
    { id: 'messages', label: 'الرسائل', icon: MessageSquare, badge: conversations.length > 0 ? conversations.length.toString() : undefined },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: notifications.filter(n => !n.isRead).length > 0 ? notifications.filter(n => !n.isRead).length.toString() : undefined, badgeColor: 'bg-rose-500' },
    { id: 'disputes', label: 'النزاعات', icon: Scale, badge: disputedOrders.length > 0 ? disputedOrders.length.toString() : undefined, badgeColor: 'bg-rose-500' },
    { id: 'profile', label: 'الملف الشخصي', icon: UserIcon },
    { id: 'support', label: 'الدعم والمساعدة', icon: HelpCircle }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white space-y-8 animate-in fade-in duration-150" dir="rtl">
      
      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-purple-950/70 via-[#0A0E1A] to-[#070A12] border border-purple-900/50 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-500/60 shadow-lg shadow-purple-950"
            />
            <span className="absolute -bottom-1 -left-1 p-1.5 bg-emerald-500 text-black rounded-full shadow" title="حساب مشتري معتمد ومحمي بالكامل">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.fullName}</h1>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>حساب عميل موثق • مشتري محمي (VIREON Escrow)</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {currentUser.email} • عضوية المشتري المعتمد في VIREON
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onExplore}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-purple-200" />
            <span>تصفح سوق الخدمات والمنتجات</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar (9 Tabs) */}
      <div className="bg-[#090D16] border border-gray-800 rounded-2xl p-2 shadow-lg">
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : (tab.badgeColor || 'bg-gray-800 text-gray-300')
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT PANES */}
      <div className="space-y-6">

        {/* 1. OVERVIEW (الرئيسية) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* ACTION REQUIRED CALLOUT BOX */}
            {pendingApprovalOrders.length > 0 ? (
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#13110E] to-[#0A0D17] border border-amber-500/40 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3 text-amber-400">
                    <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40">
                      <Clock className="w-6 h-6 animate-pulse text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">الإجراء المطلوب منك الآن: تسليمات بانتظار فحصك وموافقتك</h3>
                      <p className="text-xs text-amber-300/80 mt-0.5">
                        لديك <strong className="text-white underline">{pendingApprovalOrders.length} طلب</strong> قام صانع المحتوى بتسليمه. يرجى معاينة العمل للموافقة والإفراج عن الضمان أو طلب تعديل.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setOrderFilter('delivered');
                      setActiveTab('orders');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg flex items-center gap-1.5 transition"
                  >
                    <span>معاينة التسليمات فوراً</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            ) : inProgressOrders.length > 0 ? (
              <div className="p-5 rounded-2xl bg-[#090D16] border border-purple-800/40 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">أموالك بأمان تام في الضمان (Escrow Protected)</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      لديك {inProgressOrders.length} طلب قيد التنفيذ. لن يتم تحويل أي مبلغ للبائع حتى تستلم العمل النهائي وتوافق عليه بنفسك.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-700/50">
                  ${escrowLockedAmount.toFixed(2)} محجوز ومحمي 100%
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#090D16] border border-gray-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <p className="text-xs text-gray-300">جميع طلباتك ومعاملاتك السابقة مكتملة وموثقة بدون أي معلقات.</p>
                </div>
                <button
                  onClick={onExplore}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300"
                >
                  استكشف خدمات وصناع جدد ←
                </button>
              </div>
            )}

            {/* FINANCIAL STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Paid */}
              <div className="p-5 rounded-2xl bg-[#090D16] border border-gray-800 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>إجمالي المبالغ المدفوعة</span>
                  <CreditCard className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-black text-white font-mono mt-2">${totalPaid.toFixed(2)}</p>
                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <span>سجل الدفع المشفر</span>
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
              </div>

              {/* Card 2: Escrow Locked */}
              <div className="p-5 rounded-2xl bg-[#090D16] border border-emerald-900/40 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-emerald-300">
                  <span>المحجوز في الضمان (Escrow)</span>
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-2">${escrowLockedAmount.toFixed(2)}</p>
                <div className="text-[10px] text-emerald-300 font-semibold mt-1">
                  محمي 100% — لا يُصرف دون موافقتك
                </div>
              </div>

              {/* Card 3: Released */}
              <div className="p-5 rounded-2xl bg-[#090D16] border border-gray-800 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>المبالغ المحررة والمعتمدة</span>
                  <Unlock className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-black text-cyan-300 font-mono mt-2">${releasedAmount.toFixed(2)}</p>
                <div className="text-[10px] text-gray-400 mt-1">
                  تم صرفها للبائعين بعد موافقتك
                </div>
              </div>

              {/* Card 4: Orders Count */}
              <div className="p-5 rounded-2xl bg-[#090D16] border border-gray-800 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>إجمالي الطلبات</span>
                  <Package className="w-4 h-4 text-pink-400" />
                </div>
                <p className="text-2xl font-black text-white font-mono mt-2">{myOrders.length}</p>
                <div className="text-[10px] text-purple-300 mt-1">
                  {pendingApprovalOrders.length} بانتظار الموافقة • {inProgressOrders.length} قيد التنفيذ
                </div>
              </div>

            </div>

            {/* RECENT ORDERS SUMMARY TABLE */}
            <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">آخر الطلبات وحالة الضمان المالي</h3>
                  <p className="text-xs text-gray-400">متابعة سريعة لجميع المعاملات والطلبات الجارية</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <span>عرض جميع الطلبات ({myOrders.length})</span>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
              </div>

              <div className="space-y-3">
                {myOrders.slice(0, 4).map(order => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-[#101524] border border-gray-800/80 hover:border-purple-800/60 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-gray-800 text-purple-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-white">{order.itemTitle}</h4>
                          <span className="text-[10px] font-mono text-gray-400">#{order.id}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          صانع المحتوى: <strong className="text-purple-300">{order.sellerName}</strong> • {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-black text-emerald-400 font-mono">${order.amount.toFixed(2)}</span>
                        <div className="text-[10px]">
                          {order.status === 'delivered' && <span className="text-amber-400 font-bold">بانتظار موافقتك (72h)</span>}
                          {order.status === 'paid' && <span className="text-emerald-400 font-bold">محجوز بالضمان</span>}
                          {order.status === 'completed' && <span className="text-cyan-400 font-bold">مكتمل ومصروف</span>}
                          {order.status === 'revision_requested' && <span className="text-amber-300 font-bold">طلب تعديل</span>}
                          {order.status === 'disputed' && <span className="text-rose-400 font-bold">نزاع مفتوح</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrderReceipt(order);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <span>الإيصال</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 2. MY ORDERS (طلباتي) */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">سجل جميع طلباتي ومتابعة الإنجاز</h3>
                <p className="text-xs text-gray-400">تحكم كامل في مراجعة الأعمال المسلمة، طلب التعديلات، أو الإفراج عن الضمان المالي.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={e => setOrderSearchQuery(e.target.value)}
                    placeholder="بحث برقم الطلب أو اسم الصانع..."
                    className="w-full bg-[#090D16] border border-gray-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              {[
                { id: 'all', label: 'جميع الطلبات', count: myOrders.length },
                { id: 'delivered', label: 'تم التسليم (بانتظار موافقتك)', count: pendingApprovalOrders.length, highlight: true },
                { id: 'in_progress', label: 'قيد التنفيذ', count: inProgressOrders.length },
                { id: 'completed', label: 'مكتملة', count: myOrders.filter(o => o.status === 'completed').length },
                { id: 'revision', label: 'طلبات تعديل', count: myOrders.filter(o => o.status === 'revision_requested').length },
                { id: 'disputed', label: 'النزاعات', count: disputedOrders.length }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 ${
                    orderFilter === f.id
                      ? f.highlight
                        ? 'bg-amber-500 text-black font-black shadow-md'
                        : 'bg-purple-600 text-white font-bold'
                      : 'bg-[#090D16] text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Orders List */}
            {displayedOrders.length === 0 ? (
              <div className="p-12 text-center bg-[#090D16] rounded-3xl border border-gray-800 space-y-3">
                <Package className="w-10 h-10 text-gray-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">لا توجد طلبات مطابقة لهذا الفلتر</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  يمكنك استكشاف صناع المحتوى المعتمدين وبدء طلبك الأول المحمي بنظام الضمان المالي.
                </p>
                <button
                  onClick={onExplore}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  تصفح السوق الآن
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedOrders.map(order => {
                  const isDelivered = order.status === 'delivered';
                  const isCompleted = order.status === 'completed';
                  const isRevision = order.status === 'revision_requested';
                  const isDisputed = order.status === 'disputed';

                  return (
                    <div
                      key={order.id}
                      className={`p-6 rounded-3xl bg-[#090D16] border transition-all space-y-5 shadow-xl ${
                        isDelivered
                          ? 'border-amber-500/60 shadow-amber-950/20'
                          : isDisputed
                          ? 'border-rose-800/60'
                          : 'border-gray-800 hover:border-purple-800/60'
                      }`}
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800">
                              {order.itemType}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">رقم الطلب: #{order.id}</span>
                            
                            {order.status === 'pending' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                ⏳ بانتظار إتمام وتأكيد الدفع
                              </span>
                            )}
                            {order.status === 'paid' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                مؤكد ومحجوز بالضمان
                              </span>
                            )}
                            {isDelivered && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                تم تسليم العمل — فترة الفحص والموافقة نشطة
                              </span>
                            )}
                            {isRevision && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/40">
                                ⚠️ تم إرسال طلب تعديل لصانع المحتوى
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                                مكتمل — تم تحويل الأرباح للبائع
                              </span>
                            )}
                            {isDisputed && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                نزاع مفتوح تحت وساطة الإدارة
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-white mt-1.5">{order.itemTitle}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            صانع المحتوى / البائع: <strong className="text-purple-300">{order.sellerName}</strong> • تاريخ الإنشاء: {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-lg font-black text-emerald-400 font-mono">
                            ${order.amount.toFixed(2)} USD
                          </span>
                          <div className="text-[10px] text-gray-400">
                            {isCompleted ? 'مكتمل ومحرر للبائع' : 'محمي في صندوق الضمان (Escrow)'}
                          </div>
                        </div>
                      </div>

                      {/* Deliverable Box (if delivered or has files) */}
                      {(isDelivered || order.deliverableUrl || isCompleted || isRevision) && (
                        <div className={`p-4 rounded-2xl border space-y-3 ${
                          isDelivered
                            ? 'bg-amber-950/20 border-amber-500/40'
                            : isRevision
                            ? 'bg-amber-950/10 border-amber-800/30'
                            : 'bg-[#101524] border-gray-800'
                        }`}>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-bold text-white">ملفات العمل المسلّمة من الصانع</span>
                            </div>
                            {order.reviewPeriodExpiresAt && isDelivered && (
                              <span className="text-[11px] text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-700/50 flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                مهلة الفحص: حتى {new Date(order.reviewPeriodExpiresAt).toLocaleDateString('ar-SA')}
                              </span>
                            )}
                          </div>

                          {order.deliveryNotes && (
                            <div className="text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5">
                              <span className="font-semibold text-gray-400">ملاحظات صانع المحتوى: </span>
                              {order.deliveryNotes}
                            </div>
                          )}

                          {order.revisionNotes && isRevision && (
                            <div className="text-xs text-amber-300 bg-amber-950/40 p-3 rounded-xl border border-amber-800/30">
                              <span className="font-semibold text-amber-400">ملاحظات التعديل المطلوبة منك: </span>
                              {order.revisionNotes}
                            </div>
                          )}

                          {order.deliverableUrl && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              <a
                                href={order.deliverableUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>معاينة وتحميل ملفات العمل (Download Deliverables)</span>
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Escrow Lifecycle Progress Bar */}
                      <div className="p-3.5 rounded-xl bg-[#101524] border border-gray-800 space-y-2">
                        <div className="flex justify-between text-[11px] text-gray-400">
                          <span className="text-emerald-400 font-bold">1. تم الدفع وحجز الضمان</span>
                          <span className={isDelivered || isCompleted ? 'text-amber-400 font-bold' : 'text-purple-300 font-bold'}>
                            2. {isDelivered ? 'تم التسليم والمراجعة' : 'قيد التنفيذ لدى الصانع'}
                          </span>
                          <span className={isCompleted ? 'text-cyan-400 font-bold' : 'text-gray-500'}>
                            3. {isCompleted ? 'تم اعتماد التسليم والإفراج' : 'موافقة المشتري والإفراج'}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 via-emerald-500 to-cyan-400 transition-all duration-500"
                            style={{
                              width: order.status === 'pending'
                                ? '25%'
                                : order.status === 'paid'
                                ? '50%'
                                : isDelivered
                                ? '75%'
                                : '100%'
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-800">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrderReceipt(order)}
                            className="px-3 py-1.5 rounded-xl bg-[#101524] hover:bg-gray-800 text-xs font-semibold text-gray-300 border border-gray-700 flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                            <span>عرض الفاتورة وسند الضمان</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab('messages');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#101524] hover:bg-gray-800 text-xs font-semibold text-gray-300 border border-gray-700 flex items-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                            <span>مراسلة البائع</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {isDelivered && (
                            <>
                              <button
                                disabled={isProcessing}
                                onClick={() => handleOpenDispute(order)}
                                className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 text-xs font-semibold border border-rose-800/50 flex items-center gap-1 transition"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>فتح نزاع</span>
                              </button>

                              <button
                                disabled={isProcessing}
                                onClick={() => handleOpenRevision(order)}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 text-xs font-bold border border-amber-700/50 flex items-center gap-1.5 transition"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>طلب تعديل (Revision)</span>
                              </button>

                              <button
                                disabled={isProcessing}
                                onClick={() => handleApproveDelivery(order.id)}
                                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isProcessing ? 'جاري المعالجة...' : 'قبول التسليم والإفراج عن الضمان للبائع'}</span>
                              </button>
                            </>
                          )}

                          {isCompleted && (
                            <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              تم اعتماد الطلب وتحويل المبلغ للبائع
                            </span>
                          )}

                          {isDisputed && (
                            <span className="px-3 py-1 rounded-lg bg-rose-950 text-rose-300 text-xs font-bold border border-rose-800 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              النزاع قيد مراجعة فريق الوساطة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* 3. PAYMENTS & INVOICES (المدفوعات والفواتير) */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">سجل المدفوعات والفواتير الرسمية</h3>
                <p className="text-xs text-gray-400">سجل كامل للمدفوعات المشفرة، الفواتير الضريبية، ومتابعة مبالغ الاسترداد.</p>
              </div>
            </div>

            {/* Financial Ledger Table */}
            <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">سجل العمليات المالية (Payment Ledger)</h4>
                <span className="text-xs text-gray-400 font-mono">العملة: USD</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-gray-800 text-gray-400 font-bold">
                    <tr>
                      <th className="py-3 px-4">رقم المعاملة</th>
                      <th className="py-3 px-4">المنتج / الخدمة</th>
                      <th className="py-3 px-4">البائع</th>
                      <th className="py-3 px-4">المبلغ</th>
                      <th className="py-3 px-4">طريقة الدفع</th>
                      <th className="py-3 px-4">حالة الضمان</th>
                      <th className="py-3 px-4">التاريخ</th>
                      <th className="py-3 px-4 text-center">الإيصال</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {myOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-800/30 transition">
                        <td className="py-3.5 px-4 font-mono text-purple-300">
                          {order.whopPaymentId || `vir_${order.id}`}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {order.itemTitle}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">
                          {order.sellerName}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          ${order.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400">
                          <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-mono">
                            PaySecure
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {order.status === 'completed' ? (
                            <span className="text-cyan-400 font-bold flex items-center gap-1">
                              <Unlock className="w-3 h-3" /> تم الإفراج
                            </span>
                          ) : order.status === 'refunded' ? (
                            <span className="text-rose-400 font-bold">مسترد</span>
                          ) : (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Lock className="w-3 h-3" /> محجوز بالضمان
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 font-mono">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedOrderReceipt(order)}
                            className="p-1.5 rounded-lg bg-[#101524] hover:bg-gray-800 text-purple-400 hover:text-purple-300 border border-gray-700"
                            title="عرض الفاتورة"
                          >
                            <FileText className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Refunds Section */}
            <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">سجل الاسترداد المالي (Refund Requests & Status)</h4>
                  <p className="text-xs text-gray-400">أي مبالغ يتم استردادها بناء على حل النزاع تعود تلقائياً لبطاقتك أو وسيلة الدفع الأصلية.</p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-800">
                  إجمالي المسترد: ${refundedAmount.toFixed(2)} USD
                </span>
              </div>

              {refundedAmount === 0 ? (
                <div className="p-6 rounded-2xl bg-[#101524] border border-gray-800 text-center text-xs text-gray-400">
                  لا توجد مبالغ مستردة حالياً. جميع مشترياتك تسير بسلاسة وفق شروط الضمان المالي.
                </div>
              ) : (
                <div className="text-xs text-gray-300">
                  تمت معالجة استرداد المبالغ وإرجاعها لحساب العميل البنكي بنجاح.
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. WALLET / ESCROW (المحفظة والضمان المالي) */}
        {activeTab === 'escrow' && (
          <div className="space-y-6">
            
            <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#0C121E] to-[#0A0D17] border border-emerald-600/40 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">VIREON PaySecure Vault</span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">خزينة الضمان المالي للأموال المحجوزة والمتاحة</h3>
                    <p className="text-xs text-gray-300 mt-1">حماية بنكية ذكية ومشفرة تحمي حقوق العميل والبائع بنسبة 100%.</p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-xs text-gray-400">إجمالي الرصيد المحمي بالضمان:</span>
                  <p className="text-3xl font-black text-emerald-400 font-mono mt-0.5">${escrowLockedAmount.toFixed(2)} USD</p>
                </div>
              </div>

              {/* Escrow Balance Split */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-emerald-900/40">
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30">
                  <span className="text-xs text-emerald-300 font-bold">1. الأموال المحجوزة حالياً (Locked in Escrow)</span>
                  <p className="text-xl font-bold font-mono text-white mt-1">${escrowLockedAmount.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">أموال قيد تنفيذ الخدمات وبانتظار موافقتك</p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-gray-800">
                  <span className="text-xs text-cyan-300 font-bold">2. المبالغ المحررة للبائعين (Released)</span>
                  <p className="text-xl font-bold font-mono text-white mt-1">${releasedAmount.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">تم تسليمها واعتمادها بالكامل</p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-gray-800">
                  <span className="text-xs text-purple-300 font-bold">3. المبالغ المستردة / المتاحة (Refunded)</span>
                  <p className="text-xl font-bold font-mono text-white mt-1">${refundedAmount.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">تم إعادتها لوسيلة الدفع الأصلية</p>
                </div>
              </div>
            </div>

            {/* How Escrow Works Info Card */}
            <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400" />
                <span>كيف تضمن منصة VIREON أموالك وحقوقك؟</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-300">
                <div className="p-4 rounded-2xl bg-[#101524] border border-gray-800 space-y-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    حجز الأموال في وسيط محايد
                  </span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    عند قيامك بالدفع، لا تذهب الأموال إلى حساب البائع مباشرة، بل تُحجز في خزينة الضمان المالي المشفرة من VIREON.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#101524] border border-gray-800 space-y-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    مهلة فحص ومعاينة 72 ساعة
                  </span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    بعد تسليم العمل، يمنحك النظام 72 ساعة كاملة لفحص الملفات ومطابقتها للشروط قبل تحويل أي سنت للبائع.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#101524] border border-gray-800 space-y-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-cyan-400" />
                    حق التعديل والتحكيم المستقل
                  </span>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    في حال وجود أي ملاحظات يحق لك طلب التعديلات أو فتح تذكرة نزاع وتجميد الصرف حتى التدخل وحل المسألة أو الاسترداد.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 5. MESSAGES (الرسائل) */}
        {activeTab === 'messages' && (
          <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">مركز الرسائل والتواصل المباشر</h3>
                <p className="text-xs text-gray-400">تواصل مباشر مع صناع المحتوى والبراندات لمناقشة تفاصيل الطلبات والتسليمات.</p>
              </div>
              <button
                onClick={onOpenMessages}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <span>فتح واجهة المحادثات الكاملة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[380px]">
              
              {/* Conversation List */}
              <div className="bg-[#101524] rounded-2xl border border-gray-800 p-3 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 px-2 block">المحادثات النشطة</span>
                
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    لا توجد محادثات سابقة. يمكنك بدء محادثة مع أي بائع من صفحة طلباتي.
                  </div>
                ) : (
                  conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`w-full p-3 rounded-xl text-right transition flex items-center gap-3 ${
                        activeConversationId === conv.id
                          ? 'bg-purple-950/80 border border-purple-700/60'
                          : 'hover:bg-gray-800/50 border border-transparent'
                      }`}
                    >
                      <img
                        src={conv.participants[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-white truncate">{conv.participants[0]?.name || 'صانع محتوى'}</h4>
                          <span className="text-[9px] text-gray-500">مباشر</span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{conv.lastMessage || 'مرحباً، أعمل على تجهيز الطلب...'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Chat Thread */}
              <div className="md:col-span-2 bg-[#101524] rounded-2xl border border-gray-800 p-4 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="Seller"
                      className="w-9 h-9 rounded-xl object-cover border border-purple-500/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">Sarah Al-Mansoor (صانع محتوى معتمد)</h4>
                      <span className="text-[10px] text-emerald-400">متصل الآن • الرد في أقل من 15 دقيقة</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-black/40 px-2.5 py-1 rounded-lg border border-gray-800">
                    محادثة آمنة ومشفرة
                  </span>
                </div>

                {/* Messages Body */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-56 pr-2">
                  <div className="flex justify-start">
                    <div className="bg-[#090D16] border border-gray-800 text-gray-300 text-xs p-3 rounded-2xl rounded-tr-none max-w-sm space-y-1">
                      <p>أهلاً بك! لقد بدأت بتصوير الـ Hooks الثلاثة بدقة 4K مع الإضاءة الطبيعية وسأرفع لك المسودة خلال الساعات القادمة.</p>
                      <span className="text-[9px] text-gray-500 block text-left">10:30 AM</span>
                    </div>
                  </div>

                  {localMessages.map(m => (
                    <div
                      key={m.id}
                      className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`text-xs p-3 rounded-2xl max-w-sm space-y-1 ${
                        m.senderId === currentUser.id
                          ? 'bg-purple-600 text-white rounded-tl-none'
                          : 'bg-[#090D16] border border-gray-800 text-gray-300 rounded-tr-none'
                      }`}>
                        <p>{m.body}</p>
                        <span className={`text-[9px] block text-left ${m.senderId === currentUser.id ? 'text-purple-200' : 'text-gray-500'}`}>
                          {new Date(m.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                  <input
                    type="text"
                    value={chatMessageText}
                    onChange={e => setChatMessageText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendDirectMessage();
                    }}
                    placeholder="اكتب رسالتك للبائع هنا..."
                    className="flex-1 bg-[#090D16] border border-gray-800 focus:border-purple-600 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSendDirectMessage}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5 rotate-180" />
                    <span>إرسال</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 6. NOTIFICATIONS (الإشعارات) */}
        {activeTab === 'notifications' && (
          <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">مركز الإشعارات والتنبيهات</h3>
                <p className="text-xs text-gray-400">تنبيهات فورية بخصوص حركات الضمان المالي، تسليم الطلبات، والرسائل.</p>
              </div>
              <button
                onClick={() => {
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                  setActionFeedback('تم تحديد جميع الإشعارات كمقروءة.');
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="text-xs font-bold text-purple-400 hover:text-purple-300"
              >
                تحديد الكل كمقروء ✓
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                    notif.isRead
                      ? 'bg-[#101524] border-gray-800 text-gray-400'
                      : 'bg-[#14192b] border-purple-800/60 text-white shadow-lg'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    notif.type === 'escrow' ? 'bg-emerald-500/20 text-emerald-400' :
                    notif.type === 'order' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {notif.type === 'escrow' ? <ShieldCheck className="w-5 h-5" /> :
                     notif.type === 'order' ? <Package className="w-5 h-5" /> :
                     <CreditCard className="w-5 h-5" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                      <span className="text-[10px] text-gray-500 font-mono">{notif.date}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. DISPUTES (النزاعات) */}
        {activeTab === 'disputes' && (
          <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">مركز حل النزاعات والوساطة المالية</h3>
                <p className="text-xs text-gray-400">إدارة النزاعات وتجميد صرف الضمان المالي لحماية أموال المشتري حتى حل المشكلة.</p>
              </div>
            </div>

            {/* Active Disputes List */}
            {disputedOrders.length === 0 ? (
              <div className="p-12 text-center bg-[#101524] rounded-2xl border border-gray-800 space-y-3">
                <Scale className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">لا توجد أي نزاعات مفتوحة حالياً</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  جميع تعاملاتك تسير بسلاسة. في حال واجهتك مشكلة في أي طلب مسلّم يمكنك فتح نزاع من صفحة "طلباتي" وسيتم تجميد الضمان فوراً.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputedOrders.map(order => (
                  <div key={order.id} className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/60 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        ⚖️ نزاع مفتوح — الضمان المالي مجمّد ($ {order.amount.toFixed(2)})
                      </span>
                      <span className="text-xs font-mono text-gray-400">طلب #{order.id}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{order.itemTitle}</h4>
                    <p className="text-xs text-gray-300">
                      سبب النزاع: {order.disputeReason || 'عدم مطابقة مواصفات العمل المتفق عليها.'}
                    </p>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>يقوم فريق الوساطة في VIREON بمراجعة الأدلة وسيتواصل معك خلال 24 ساعة لاتخاذ القرار النهائي.</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Arbitration Policy Note */}
            <div className="p-4 rounded-2xl bg-[#101524] border border-gray-800 text-xs text-gray-400 space-y-1">
              <span className="font-bold text-white">سياسة التحكيم وحماية المشتري:</span>
              <p>في حال عدم التزام البائع بالموعد أو الجودة المتفق عليها، يتم استرداد كامل المبلغ إلى محفظتك أو بطاقتك الائتمانية دون أي خصومات.</p>
            </div>

          </div>
        )}

        {/* 8. PROFILE & SETTINGS (الملف الشخصي والإعدادات) */}
        {activeTab === 'profile' && (
          <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-6">
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">الملف الشخصي وإعدادات الحساب</h3>
              <p className="text-xs text-gray-400">تعديل بيانات الحساب، الأمان والمصادقة الثنائية، وتفضيلات العملة والإشعارات.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Details Form */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">البيانات الشخصية</h4>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-[#101524] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">البريد الإلكتروني (موثق)</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-xs text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">الدولة / المنطقة</label>
                  <input
                    type="text"
                    value={profileCountry}
                    onChange={e => setProfileCountry(e.target.value)}
                    className="w-full bg-[#101524] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">نبذة عن النشاط</label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    className="w-full bg-[#101524] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Preferences & Security */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">الأمان والتفضيلات</h4>

                <div className="p-4 rounded-2xl bg-[#101524] border border-gray-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-white block">المصادقة الثنائية (2FA)</span>
                      <span className="text-[11px] text-gray-400">حماية إضافية لتسجيل الدخول وعمليات الدفع</span>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        twoFactorEnabled ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {twoFactorEnabled ? 'مفعل ✓' : 'معطل'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#101524] border border-gray-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-white block">إشعارات البريد الإلكتروني</span>
                      <span className="text-[11px] text-gray-400">استلام تنبيهات الدفع وحركات الضمان المالي</span>
                    </div>
                    <button
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        emailAlerts ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {emailAlerts ? 'مفعل ✓' : 'معطل'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">العملة المفضلة</label>
                  <select
                    value={currencyPref}
                    onChange={e => setCurrencyPref(e.target.value)}
                    className="w-full bg-[#101524] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="USD">USD ($) — الدولار الأمريكي</option>
                    <option value="SAR">SAR (ر.س) — الريال السعودي</option>
                    <option value="AED">AED (د.إ) — الدرهم الإماراتي</option>
                    <option value="EUR">EUR (€) — اليورو الأوروبي</option>
                  </select>
                </div>

              </div>

            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        )}

        {/* 9. SUPPORT & HELP (الدعم والمساعدة) */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">مركز الدعم والمساعدة الفنية والمالية</h3>
                <p className="text-xs text-gray-400">فريق الدعم متاح 24/7 لمساعدتك في أي استفسار يتعلق بالدفع، الضمان، أو التسليم.</p>
              </div>
              <button
                onClick={() => setIsNewTicketModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>فتح تذكرة دعم جديدة</span>
              </button>
            </div>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#090D16] border border-gray-800 space-y-2">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 w-fit">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">مساعد الذكاء الاصطناعي</h4>
                <p className="text-[11px] text-gray-400">إجابات فورية ذكية على مدار الساعة حول شروط الخدمة والضمان.</p>
                <button
                  onClick={onOpenSupport}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 pt-1 block"
                >
                  تشغيل المساعد الآلي ←
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#090D16] border border-gray-800 space-y-2">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">الدعم المالي المباشر</h4>
                <p className="text-[11px] text-gray-400">مراجعة المدفوعات والتحويلات واسترداد الأموال للعملاء.</p>
                <span className="text-[11px] text-emerald-400 font-mono block pt-1">support@vireon.io</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#090D16] border border-gray-800 space-y-2">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">قسم التحكيم والوساطة</h4>
                <p className="text-[11px] text-gray-400">حل النزاعات التجارية وفحص مطابقة ملفات العمل المسلمة.</p>
                <span className="text-[11px] text-cyan-300 font-mono block pt-1">disputes@vireon.io</span>
              </div>
            </div>

            {/* My Support Tickets */}
            <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white">تذاكر الدعم السابقة</h4>

              <div className="space-y-3">
                {tickets.map(tkt => (
                  <div key={tkt.id} className="p-4 rounded-2xl bg-[#101524] border border-gray-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-purple-400 font-bold">#{tkt.id}</span>
                        <h5 className="font-bold text-white">{tkt.subject}</h5>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tkt.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {tkt.status === 'resolved' ? 'تم الرد والحل ✓' : 'قيد المتابعة'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px] bg-black/40 p-2.5 rounded-xl">
                      <strong className="text-gray-300">آخر تحديث من الدعم: </strong>{tkt.lastReply}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer FAQs */}
            <div className="p-6 rounded-3xl bg-[#090D16] border border-gray-800 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white">الأسئلة الشائعة للعملاء (Buyer FAQ)</h4>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#101524] border border-gray-800 space-y-1">
                  <h5 className="font-bold text-white">متى يتم الإفراج عن المبلغ وتحويله للبائع؟</h5>
                  <p className="text-gray-400 text-[11px]">
                    يتم الإفراج عن المبلغ فقط بعد أن تقوم بفحص العمل المسلّم والضغط على زر "قبول التسليم"، أو بعد انقضاء مهلة الفحص المحددة بـ 72 ساعة دون طلب تعديل.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#101524] border border-gray-800 space-y-1">
                  <h5 className="font-bold text-white">ماذا يحدث إذا لم أكن راضياً عن جودة العمل المسلّم؟</h5>
                  <p className="text-gray-400 text-[11px]">
                    يمكنك الضغط على زر "طلب تعديل" وكتابة الملاحظات المطلوبة، أو الضغط على "فتح نزاع" لتجميد الضمان وتدخل فريق الوساطة لفحص التسليمات وإعادة المبلغ إن لزم.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#101524] border border-gray-800 space-y-1">
                  <h5 className="font-bold text-white">هل بيانات بطاقتي الائتمانية مخزنة في المنصة؟</h5>
                  <p className="text-gray-400 text-[11px]">
                    لا، المنصة تعتمد مبدأ (Zero-Storage) حيث تتم جميع عمليات الدفع عبر بوابات دفع مشفرة بمعيار PCI-DSS وApple Pay ولا يتم حفظ أي بيانات بنكية على خوادمنا.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* REVISION REQUEST MODAL */}
      {revisionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0A0D17] border border-amber-800/60 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">طلب تعديل على العمل المسلّم</h3>
              </div>
              <button onClick={() => setRevisionModalOrder(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              طلب #{revisionModalOrder.id} — <strong className="text-white">{revisionModalOrder.itemTitle}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                وضح التعديلات المطلوبة بدقة لصانع المحتوى:
              </label>
              <textarea
                rows={4}
                value={revisionNotes}
                onChange={e => setRevisionNotes(e.target.value)}
                placeholder="مثال: يرجى تعديل الخط في الثانية 0:15 وتغيير الموسيقى الخلفية وإضافة نص توضيحي..."
                className="w-full bg-[#101524] border border-gray-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              disabled={isProcessing || !revisionNotes.trim()}
              onClick={handleSubmitRevision}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-bold shadow-lg disabled:opacity-50"
            >
              {isProcessing ? 'جاري الإرسال...' : 'إرسال ملاحظات التعديل للبائع'}
            </button>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0A0D17] border border-rose-800/60 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">فتح تذكرة نزاع وتجميد الضمان</h3>
              </div>
              <button onClick={() => setDisputeModalOrder(null)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              طلب #{disputeModalOrder.id} — <strong className="text-white">{disputeModalOrder.itemTitle}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                اذكر سبب النزاع بالتفصيل لإدارة VIREON:
              </label>
              <textarea
                rows={4}
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
                placeholder="مثال: لم يتم الالتزام بالاتفاق، الملفات غير مطابقة، أو عدم التجاوب مع الملاحظات..."
                className="w-full bg-[#101524] border border-gray-800 focus:border-rose-500 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              disabled={isProcessing || !disputeReason.trim()}
              onClick={handleSubmitDispute}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg disabled:opacity-50"
            >
              {isProcessing ? 'جاري الإرسال...' : 'إرسال التذكرة وتجميد الإفراج المالي'}
            </button>
          </div>
        </div>
      )}

      {/* NEW SUPPORT TICKET MODAL */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0A0D17] border border-purple-800/60 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">فتح تذكرة دعم جديدة</h3>
              </div>
              <button onClick={() => setIsNewTicketModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">موضوع التذكرة</label>
              <input
                type="text"
                value={newTicketSubject}
                onChange={e => setNewTicketSubject(e.target.value)}
                placeholder="مثال: استفسار حول تسليم الطلب #8921"
                className="w-full bg-[#101524] border border-gray-800 focus:border-purple-600 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">القسم</label>
                <select
                  value={newTicketCategory}
                  onChange={e => setNewTicketCategory(e.target.value as any)}
                  className="w-full bg-[#101524] border border-gray-800 focus:border-purple-600 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="escrow">الضمان المالي (Escrow)</option>
                  <option value="payment">المدفوعات والفواتير</option>
                  <option value="order">مشكلة في الطلب</option>
                  <option value="technical">دعم فني</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">الأولوية</label>
                <select
                  value={newTicketPriority}
                  onChange={e => setNewTicketPriority(e.target.value as any)}
                  className="w-full bg-[#101524] border border-gray-800 focus:border-purple-600 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عاجلة</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">تفاصيل الاستفسار</label>
              <textarea
                rows={4}
                value={newTicketDetails}
                onChange={e => setNewTicketDetails(e.target.value)}
                placeholder="اشرح المشكلة بالتفصيل لممثلي الدعم..."
                className="w-full bg-[#101524] border border-gray-800 focus:border-purple-600 rounded-xl p-3 text-xs text-white focus:outline-none"
              ></textarea>
            </div>

            <button
              onClick={handleCreateTicket}
              disabled={!newTicketSubject.trim() || !newTicketDetails.trim()}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg disabled:opacity-50"
            >
              إرسال التذكرة لممثل الدعم
            </button>
          </div>
        </div>
      )}

      {/* OFFICIAL INVOICE & RECEIPT MODAL */}
      {selectedOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0A0D17] border border-purple-800/60 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">فاتورة وسند ضمان رسمي (Tax Invoice)</h3>
                  <span className="text-[10px] text-gray-400 font-mono">VIREON Global Commerce Ltd.</span>
                </div>
              </div>
              <button onClick={() => setSelectedOrderReceipt(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-800/50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#101524] border border-gray-800 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">رقم الفاتورة / الطلب:</span>
                <span className="font-mono text-purple-300 font-bold">#{selectedOrderReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">رقم المعاملة المشفر:</span>
                <span className="font-mono text-gray-300">{selectedOrderReceipt.whopPaymentId || `vir_tx_${selectedOrderReceipt.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">المنتج / الخدمة:</span>
                <span className="font-semibold text-white">{selectedOrderReceipt.itemTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">صانع المحتوى المعتمد:</span>
                <span className="text-purple-300 font-semibold">{selectedOrderReceipt.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">تاريخ المعاملة:</span>
                <span className="font-mono text-gray-300">{new Date(selectedOrderReceipt.createdAt).toLocaleString('ar-SA')}</span>
              </div>

              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">المبلغ الصافي:</span>
                  <span className="font-mono text-white">${(selectedOrderReceipt.amount * 0.92).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">رسوم حماية الضمان والوساطة (8%):</span>
                  <span className="font-mono text-purple-300">${selectedOrderReceipt.platformFee.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-700/60">
                  <span className="text-white">المبلغ الإجمالي المدفوع:</span>
                  <span className="font-mono text-emerald-400 text-base">${selectedOrderReceipt.amount.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-2 text-[11px] text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>حالة الضمان: {selectedOrderReceipt.status === 'completed' ? 'تم تحرير وإيداع المستحقات للبائع بنجاح' : 'محمي ومحجوز في خزينة الضمان المالي'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition"
              >
                طباعة الفاتورة 🖨️
              </button>
              <button
                onClick={() => setSelectedOrderReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
