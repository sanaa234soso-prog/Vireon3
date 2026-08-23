import React, { useState, useRef } from 'react';
import {
  ShoppingBag,
  Layers,
  Plus,
  Edit3,
  Trash2,
  Eye,
  PauseCircle,
  PlayCircle,
  FileCheck,
  Clock,
  DollarSign,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Check,
  Play
} from 'lucide-react';
import { ServiceItem, ProductItem, MarketplaceCategory, User } from '../../types';

interface SellerCatalogProps {
  currentUser: User;
  services: ServiceItem[];
  products: ProductItem[];
  initialType?: 'service' | 'product';
  onRefreshAllData: () => void;
  onSelectServicePreview?: (s: ServiceItem) => void;
  onSelectProductPreview?: (p: ProductItem) => void;
}

const CATEGORIES: MarketplaceCategory[] = [
  'UGC',
  'Creators',
  'Services',
  'Digital Products',
  'AI Creators',
  'Prompt Packs',
  'Video',
  'Design',
  'Marketing'
];

export const SellerCatalog: React.FC<SellerCatalogProps> = ({
  currentUser,
  services,
  products,
  initialType = 'service',
  onRefreshAllData,
  onSelectServicePreview,
  onSelectProductPreview
}) => {
  // Mode selection: creating a service or product
  const [itemType, setItemType] = useState<'service' | 'product'>(initialType);
  const [filterType, setFilterType] = useState<'all' | 'services' | 'products' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI Panels
  const [showForm, setShowForm] = useState(true);
  const [editingItem, setEditingItem] = useState<{ type: 'service' | 'product'; data: ServiceItem | ProductItem } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; type: 'service' | 'product'; title: string } | null>(null);
  
  // Processing & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // File input refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const digitalFileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Unified Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'UGC' as MarketplaceCategory,
    description: '',
    price: 150,
    // Media & Files
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    digitalFileUrl: '',
    digitalFileName: '',
    digitalFileSize: '',
    videoUrl: '',
    // Service Specific
    deliveryDays: 3,
    revisions: 2,
    tags: ['UGC', 'Social Media', 'Video Ads'],
    sampleDeliverables: ['4K Vertical Video 9:16', '3 Hook Variations', 'SRT Captions'],
    // Product Specific
    format: 'ZIP / Notion / PDF',
    previewUrl: '',
    whopProductId: '',
    // Common
    status: 'published' as 'published' | 'draft' | 'paused'
  });

  const [tagInput, setTagInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');

  // Auto-calculated financial metrics (3% platform fee, 97% seller net)
  const totalBuyerPrice = Number(formData.price) || 0;
  const platformFee = totalBuyerPrice * 0.03;
  const sellerNetEarnings = totalBuyerPrice * 0.97;

  // File Upload Handlers
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            fileType: file.type
          })
        });
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({ ...prev, coverImage: data.url }));
        } else {
          setFormData((prev) => ({ ...prev, coverImage: base64Data }));
        }
        setIsUploadingCover(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Cover upload failed:', err);
      setIsUploadingCover(false);
    }
  };

  const handleDigitalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            fileType: file.type
          })
        });
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({
            ...prev,
            digitalFileUrl: data.url,
            digitalFileName: file.name,
            digitalFileSize: sizeInMb,
            format: file.name.endsWith('.zip') ? 'ZIP Archive' : file.name.endsWith('.pdf') ? 'PDF Document' : 'Digital Asset'
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            digitalFileUrl: base64Data,
            digitalFileName: file.name,
            digitalFileSize: sizeInMb
          }));
        }
        setIsUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Digital file upload failed:', err);
      setIsUploadingFile(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            fileType: file.type
          })
        });
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({ ...prev, videoUrl: data.url }));
        } else {
          setFormData((prev) => ({ ...prev, videoUrl: base64Data }));
        }
        setIsUploadingVideo(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Video upload failed:', err);
      setIsUploadingVideo(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: itemType === 'service' ? 'UGC' : 'Prompt Packs',
      description: '',
      price: itemType === 'service' ? 150 : 49,
      coverImage: itemType === 'service'
        ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      digitalFileUrl: '',
      digitalFileName: '',
      digitalFileSize: '',
      videoUrl: '',
      deliveryDays: 3,
      revisions: 2,
      tags: ['UGC', 'Social Media'],
      sampleDeliverables: ['4K Vertical Video 9:16', '3 Hook Variations'],
      format: 'ZIP / Notion / PDF',
      previewUrl: '',
      whopProductId: '',
      status: 'published'
    });
    setEditingItem(null);
  };

  const startEditing = (item: ServiceItem | ProductItem, type: 'service' | 'product') => {
    setItemType(type);
    setEditingItem({ type, data: item });
    setShowForm(true);

    if (type === 'service') {
      const s = item as ServiceItem;
      setFormData({
        title: s.title,
        category: s.category,
        description: s.description || '',
        price: s.price,
        coverImage: s.coverImage,
        digitalFileUrl: s.digitalFileUrl || '',
        digitalFileName: s.digitalFileName || '',
        digitalFileSize: '',
        videoUrl: s.videoUrl || '',
        deliveryDays: s.deliveryDays || 3,
        revisions: s.revisions || 2,
        tags: s.tags || ['UGC'],
        sampleDeliverables: s.sampleDeliverables || [],
        format: 'Custom Service',
        previewUrl: '',
        whopProductId: '',
        status: s.status || 'published'
      });
    } else {
      const p = item as ProductItem;
      setFormData({
        title: p.title,
        category: p.category,
        description: p.description || '',
        price: p.price,
        coverImage: p.coverImage,
        digitalFileUrl: p.digitalFileUrl || '',
        digitalFileName: p.digitalFileName || '',
        digitalFileSize: p.digitalFileSize || '',
        videoUrl: p.videoUrl || '',
        deliveryDays: 3,
        revisions: 2,
        tags: ['Digital Product'],
        sampleDeliverables: [],
        format: p.format || 'ZIP / Notion / PDF',
        previewUrl: p.previewUrl || '',
        whopProductId: p.whopProductId || '',
        status: p.status || 'published'
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent, overrideStatus?: 'published' | 'draft') => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      setActionFeedback({ type: 'error', message: 'يرجى إدخال عنوان وسعر العرض' });
      return;
    }

    setIsSubmitting(true);
    setActionFeedback(null);

    const effectiveStatus = overrideStatus || formData.status;
    const token = localStorage.getItem('vireon_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      if (editingItem) {
        // UPDATE Existing
        const url = editingItem.type === 'service'
          ? `/api/seller/services/${editingItem.data.id}`
          : `/api/seller/products/${editingItem.data.id}`;
        
        const payload = editingItem.type === 'service'
          ? {
              title: formData.title,
              category: formData.category,
              description: formData.description,
              price: Number(formData.price),
              deliveryDays: Number(formData.deliveryDays),
              revisions: Number(formData.revisions),
              coverImage: formData.coverImage,
              digitalFileUrl: formData.digitalFileUrl,
              digitalFileName: formData.digitalFileName,
              videoUrl: formData.videoUrl,
              tags: formData.tags,
              sampleDeliverables: formData.sampleDeliverables,
              status: effectiveStatus
            }
          : {
              title: formData.title,
              category: formData.category,
              description: formData.description,
              price: Number(formData.price),
              coverImage: formData.coverImage,
              previewUrl: formData.previewUrl,
              digitalFileUrl: formData.digitalFileUrl,
              digitalFileName: formData.digitalFileName,
              digitalFileSize: formData.digitalFileSize,
              videoUrl: formData.videoUrl,
              format: formData.format,
              whopProductId: formData.whopProductId,
              status: effectiveStatus
            };

        const res = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'فشل تعديل العرض');
        }

        setActionFeedback({
          type: 'success',
          message: editingItem.type === 'service' ? 'تم تحديث الخدمة بنجاح!' : 'تم تحديث المنتج الرقمي بنجاح!'
        });
      } else {
        // CREATE New Item
        const url = itemType === 'service' ? '/api/seller/services' : '/api/seller/products';
        const payload = itemType === 'service'
          ? {
              title: formData.title,
              category: formData.category,
              description: formData.description,
              price: Number(formData.price),
              deliveryDays: Number(formData.deliveryDays),
              revisions: Number(formData.revisions),
              coverImage: formData.coverImage,
              digitalFileUrl: formData.digitalFileUrl,
              digitalFileName: formData.digitalFileName,
              videoUrl: formData.videoUrl,
              tags: formData.tags,
              sampleDeliverables: formData.sampleDeliverables,
              status: effectiveStatus
            }
          : {
              title: formData.title,
              category: formData.category,
              description: formData.description,
              price: Number(formData.price),
              coverImage: formData.coverImage,
              previewUrl: formData.previewUrl,
              digitalFileUrl: formData.digitalFileUrl,
              digitalFileName: formData.digitalFileName,
              digitalFileSize: formData.digitalFileSize,
              videoUrl: formData.videoUrl,
              format: formData.format,
              whopProductId: formData.whopProductId,
              status: effectiveStatus
            };

        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'فشل إنشاء العرض');
        }

        setActionFeedback({
          type: 'success',
          message: itemType === 'service' ? 'تم نشر الخدمة بنجاح في سوق Vireon!' : 'تم نشر المنتج الرقمي بنجاح في المتجر!'
        });
      }

      onRefreshAllData();
      resetForm();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'حدث خطأ غير متوقع' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const token = localStorage.getItem('vireon_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const url = deletingItem.type === 'service'
        ? `/api/seller/services/${deletingItem.id}`
        : `/api/seller/products/${deletingItem.id}`;

      const res = await fetch(url, { method: 'DELETE', headers });
      if (res.ok) {
        setActionFeedback({
          type: 'success',
          message: `تم حذف ${deletingItem.title} بنجاح.`
        });
        onRefreshAllData();
      }
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setDeletingItem(null);
    }
  };

  // Status Toggle
  const handleToggleStatus = async (item: ServiceItem | ProductItem, type: 'service' | 'product') => {
    const nextStatus = item.status === 'published' ? 'paused' : 'published';
    const token = localStorage.getItem('vireon_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const url = type === 'service'
        ? `/api/seller/services/${item.id}/status`
        : `/api/seller/products/${item.id}/status`;

      await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: nextStatus })
      });
      onRefreshAllData();
    } catch (e) {
      console.error('Status toggle error:', e);
    }
  };

  // Unified items list for catalog management
  const combinedItems = [
    ...services.map((s) => ({ ...s, itemType: 'service' as const })),
    ...products.map((p) => ({ ...p, itemType: 'product' as const }))
  ].filter((item) => {
    // Filter by type
    if (filterType === 'services' && item.itemType !== 'service') return false;
    if (filterType === 'products' && item.itemType !== 'product') return false;
    if (filterType === 'published' && item.status !== 'published') return false;
    if (filterType === 'draft' && item.status !== 'draft') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200" dir="rtl">
      {/* PAGE TITLE & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1220] border border-[#1E293B] p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-2.5 py-0.5 rounded-md border border-purple-800/40">
              كتالوج البائع الموحد
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {services.length} خدمة • {products.length} منتج رقمي
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            إضافة وإدارة المنتجات والخدمات
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            أضف خدماتك المخصصة أو منتجاتك الرقمية مع صورة الغلاف، الملف الرقمي للتحميل، وفيديو العرض في صفحة واحدة متكاملة.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) resetForm();
          }}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30 transition active:scale-95 shrink-0"
        >
          {showForm && !editingItem ? (
            <>
              <X className="w-4 h-4" />
              <span>إخفاء استمارة الإضافة</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>إضافة عرض جديد (خدمة أو منتج)</span>
            </>
          )}
        </button>
      </div>

      {/* FEEDBACK BANNER */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-semibold">{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* UNIFIED ADD / EDIT FORM (IN THE SAME PAGE) */}
      {showForm && (
        <div className="bg-[#0D1220] border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl transition-all">
          {/* FORM TOP TABS: SERVICE VS PRODUCT */}
          <div className="bg-[#070A12] p-4 border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {editingItem
                    ? `تعديل ${editingItem.type === 'service' ? 'الخدمة' : 'المنتج الرقمي'}`
                    : 'إنشاء وإضافة عرض جديد في المتجر'}
                </h2>
                <p className="text-xs text-slate-400">
                  حدد نوع العرض، وقم بإرفاق صورة الغلاف والملف الرقمي وفيديو البرومو مباشرة
                </p>
              </div>
            </div>

            {/* Type Selector Tabs */}
            <div className="flex items-center p-1 bg-[#111827] rounded-xl border border-[#1E293B] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setItemType('service');
                  if (!editingItem) {
                    setFormData((prev) => ({
                      ...prev,
                      category: 'UGC',
                      price: 150,
                      coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
                    }));
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  itemType === 'service'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>خدمة مخصصة (Service)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setItemType('product');
                  if (!editingItem) {
                    setFormData((prev) => ({
                      ...prev,
                      category: 'Prompt Packs',
                      price: 49,
                      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
                    }));
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  itemType === 'product'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>منتج رقمي جاهز (Product)</span>
              </button>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="p-6 sm:p-8 space-y-8">
            {/* SECTION 1: BASIC INFORMATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                <span className="w-6 h-6 rounded-full bg-purple-900/50 text-purple-300 flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-sm font-bold text-white">البيانات الأساسية والتسعير</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    {itemType === 'service' ? 'عنوان الخدمة الاحترافية *' : 'اسم المنتج الرقمي *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={
                      itemType === 'service'
                        ? 'مثال: إنتاج فيديو إعلاني UGC بجودة 4K مع 3 نصوص جذابة وتعديل احترافي'
                        : 'مثال: باقة البرومبتات الاحترافية الشاملة لـ Midjourney v6 + دليل استثماري'
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#1E293B] text-white text-sm focus:outline-hidden focus:border-purple-500 transition placeholder:text-slate-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">التصنيف *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as MarketplaceCategory })}
                    className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#1E293B] text-white text-sm focus:outline-hidden focus:border-purple-500 transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">الوصف والمميزات بالتفصيل *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={
                    itemType === 'service'
                      ? 'اشرح ما تتضمنه الخدمة، خطوات العمل، شروط التسليم، وما يحصل عليه العميل بالضبط...'
                      : 'اشرح محتويات المنتج الرقمي، الملفات المرفقة، كيفية الاستفادة منها، والقيمة الفريدة...'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#111827] border border-[#1E293B] text-white text-sm focus:outline-hidden focus:border-purple-500 transition placeholder:text-slate-500"
                />
              </div>

              {/* Price & Real-time Financial Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#070A12] p-4 rounded-xl border border-[#1E293B]">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    السعر المطلوب بالدولار ($ USD) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full pl-4 pr-9 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-white text-base font-bold font-mono focus:outline-hidden focus:border-purple-500"
                    />
                    <DollarSign className="w-4 h-4 text-emerald-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400">عمولة منصة Vireon (3% فقط)</div>
                  <div className="text-sm font-mono font-bold text-slate-300">
                    ${platformFee.toFixed(2)} USD
                  </div>
                  <div className="text-[10px] text-slate-500">حماية الضمان ومعالجة Whop</div>
                </div>

                <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/50 space-y-0.5">
                  <div className="text-xs text-purple-300 font-semibold">صافي أرباحك المقبوضة (97%):</div>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    ${sellerNetEarnings.toFixed(2)} USD
                  </div>
                  <div className="text-[10px] text-slate-400">تسليم فوري ومحمي في الضمان</div>
                </div>
              </div>
            </div>

            {/* SECTION 2: UNIFIED MEDIA, FILES & VIDEO UPLOAD */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                <span className="w-6 h-6 rounded-full bg-cyan-900/50 text-cyan-300 flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-white">
                  الميديا، الملفات الرقمية، وفيديو العرض (All in One Page)
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. COVER IMAGE UPLOAD */}
                <div className="space-y-3 bg-[#070A12] p-4 rounded-xl border border-[#1E293B] flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                        <span>1. صورة الغلاف والمعاينة</span>
                      </div>
                      <span className="text-[10px] text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40 font-mono">
                        مطلوبة
                      </span>
                    </div>

                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center group">
                      {formData.coverImage ? (
                        <img
                          src={formData.coverImage}
                          alt="Cover Preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-500">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-xs">لا توجد صورة غلاف</span>
                        </div>
                      )}

                      {isUploadingCover && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-xs text-white">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mb-1" />
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleCoverUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
                      >
                        <Upload className="w-3.5 h-3.5 text-purple-400" />
                        <span>رفع صورة من جهازك</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">أو أدخل رابط الصورة مباشرة:</label>
                      <input
                        type="url"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#111827] border border-[#1E293B] text-white focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. DIGITAL FILE / ASSET PACKAGE UPLOAD */}
                <div className="space-y-3 bg-[#070A12] p-4 rounded-xl border border-[#1E293B] flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <FolderArchive className="w-4 h-4 text-cyan-400" />
                        <span>2. الملف الرقمي القابل للتحميل</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
                        {itemType === 'product' ? 'أساسي للتسليم' : 'اختياري كقالب'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ارفع ملف المنتج (ZIP، PDF، JSON، Notion، Figma) أو ضع رابط التحميل السحابي ليتم تسليمه للمشتري تلقائياً بعد تأكيد الدفع من Whop.
                    </p>

                    <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
                      {formData.digitalFileName || formData.digitalFileUrl ? (
                        <div className="flex items-center justify-between bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-800/40">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <div className="text-xs font-bold text-white truncate">
                                {formData.digitalFileName || 'الملف الرقمي المرفق'}
                              </div>
                              <div className="text-[10px] text-cyan-300 font-mono">
                                {formData.digitalFileSize || 'حزمة رقمية جاهزة'}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                digitalFileUrl: '',
                                digitalFileName: '',
                                digitalFileSize: ''
                              })
                            }
                            className="p-1 text-slate-400 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-3 text-slate-500 text-xs">
                          لم يتم إرفاق ملف رقمي بعد
                        </div>
                      )}

                      <input
                        type="file"
                        ref={digitalFileInputRef}
                        onChange={handleDigitalFileUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => digitalFileInputRef.current?.click()}
                        disabled={isUploadingFile}
                        className="w-full py-2 px-3 rounded-lg bg-[#151D30] hover:bg-[#1E293B] border border-cyan-800/40 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-1.5 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingFile ? 'جاري رفع الملف الرقمي...' : 'رفع ملف رقمي (ZIP / PDF / Assets)'}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">أو رابط التنزيل السحابي (Drive / Notion / Figma):</label>
                      <input
                        type="url"
                        value={formData.digitalFileUrl}
                        onChange={(e) => setFormData({ ...formData, digitalFileUrl: e.target.value })}
                        placeholder="https://drive.google.com/... أو Notion"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#111827] border border-[#1E293B] text-white focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. SHOWCASE / PROMO VIDEO UPLOAD */}
                <div className="space-y-3 bg-[#070A12] p-4 rounded-xl border border-[#1E293B] flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <Video className="w-4 h-4 text-emerald-400" />
                        <span>3. فيديو العرض والبرومو التوضيحي</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40 font-mono">
                        يزيد المبيعات 3x
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      أرفق فيديو معاينة UGC أو استعراض للمنتج (MP4 أو رابط YouTube / Vimeo / Drive) ليظهر للعميل في مشغل فيديو فوري.
                    </p>

                    <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
                      {formData.videoUrl ? (
                        <div className="space-y-2">
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border border-emerald-800/40">
                            {formData.videoUrl.startsWith('data:video') || formData.videoUrl.endsWith('.mp4') ? (
                              <video
                                src={formData.videoUrl}
                                controls
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-emerald-300 p-2">
                                <Play className="w-4 h-4 text-emerald-400" />
                                <span className="truncate">رابط فيديو مدرج جاهز للعرض</span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, videoUrl: '' })}
                            className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>إزالة الفيديو</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-2 text-slate-500 text-xs">
                          لا يوجد فيديو مرفق حالياً
                        </div>
                      )}

                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={handleVideoUpload}
                        accept="video/*"
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={isUploadingVideo}
                        className="w-full py-2 px-3 rounded-lg bg-[#151D30] hover:bg-[#1E293B] border border-emerald-800/40 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingVideo ? 'جاري معالجة الفيديو...' : 'رفع ملف فيديو (MP4 / WebM)'}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">أو رابط فيديو (YouTube / Vimeo / Loom / Drive):</label>
                      <input
                        type="url"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=... أو Drive"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#111827] border border-[#1E293B] text-white focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: TYPE-SPECIFIC SPECS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-900/50 text-emerald-300 flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="text-sm font-bold text-white">
                  {itemType === 'service' ? 'مواصفات وشروط تسليم الخدمة' : 'صيغة وتنسيق المنتج الرقمي'}
                </h3>
              </div>

              {itemType === 'service' ? (
                /* SERVICE SPECIFIC FIELDS */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">مدة التسليم (بالأيام)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={formData.deliveryDays}
                          onChange={(e) => setFormData({ ...formData, deliveryDays: Number(e.target.value) })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-white text-sm focus:outline-hidden"
                        />
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">عدد التعديلات المسموحة</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={formData.revisions}
                        onChange={(e) => setFormData({ ...formData, revisions: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-white text-sm focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Sample Deliverables Tags */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      مخرجات العمل المشمولة (Sample Deliverables)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={deliverableInput}
                        onChange={(e) => setDeliverableInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (deliverableInput.trim()) {
                              setFormData({
                                ...formData,
                                sampleDeliverables: [...formData.sampleDeliverables, deliverableInput.trim()]
                              });
                              setDeliverableInput('');
                            }
                          }
                        }}
                        placeholder="أدخل مخرج واضغط Enter (مثال: فيديو عمودي 9:16)"
                        className="flex-1 px-3 py-2 rounded-xl bg-[#111827] border border-[#1E293B] text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (deliverableInput.trim()) {
                            setFormData({
                              ...formData,
                              sampleDeliverables: [...formData.sampleDeliverables, deliverableInput.trim()]
                            });
                            setDeliverableInput('');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold"
                      >
                        إضافة
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.sampleDeliverables.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] bg-purple-950/70 text-purple-300 px-2.5 py-1 rounded-md border border-purple-800/40"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                sampleDeliverables: formData.sampleDeliverables.filter((_, i) => i !== idx)
                              })
                            }
                            className="hover:text-rose-400 pr-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* PRODUCT SPECIFIC FIELDS */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      صيغة الملف ونوع المحتوى (Format)
                    </label>
                    <input
                      type="text"
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      placeholder="مثال: ZIP Archive / Notion Template / PDF Guide"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-white text-sm focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Whop Product ID (اختياري / يُنشأ تلقائياً)
                    </label>
                    <input
                      type="text"
                      value={formData.whopProductId}
                      onChange={(e) => setFormData({ ...formData, whopProductId: e.target.value })}
                      placeholder="prod_whop_..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#111827] border border-[#1E293B] text-white text-sm font-mono focus:outline-hidden placeholder:text-slate-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#1E293B]">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-900/40 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'جاري النشر والحفظ...'
                      : editingItem
                      ? 'حفظ التعديلات'
                      : itemType === 'service'
                      ? 'نشر الخدمة في المتجر فوراً'
                      : 'نشر المنتج الرقمي فوراً'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => handleSubmit(e, 'draft')}
                  className="px-4 py-3 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] font-semibold text-xs transition"
                >
                  حفظ كمسودة (Draft)
                </button>
              </div>

              {editingItem && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 border border-rose-900/40"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* CATALOG MANAGEMENT SECTION: LIST OF ALL SERVICES & PRODUCTS (IN THE SAME PAGE) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">قائمة العروض والمنتجات الحالية</h2>
            <span className="text-xs bg-[#111827] text-purple-400 px-2.5 py-0.5 rounded-full border border-[#1E293B] font-bold">
              {combinedItems.length}
            </span>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في الكتالوج..."
                className="pl-3 pr-8 py-1.5 text-xs rounded-xl bg-[#111827] border border-[#1E293B] text-white focus:outline-hidden w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <div className="flex items-center p-1 bg-[#111827] rounded-xl border border-[#1E293B] text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterType === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل ({services.length + products.length})
              </button>
              <button
                onClick={() => setFilterType('services')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterType === 'services' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                خدمات ({services.length})
              </button>
              <button
                onClick={() => setFilterType('products')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterType === 'products' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                منتجات ({products.length})
              </button>
            </div>
          </div>
        </div>

        {/* ITEMS GRID */}
        {combinedItems.length === 0 ? (
          <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 opacity-70" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">لا توجد عروض مطابقة للبحث</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                استخدم النموذج أعلاه في نفس الصفحة لإضافة أول خدمة أو منتج رقمي لك والبدء في تلقي المبيعات عبر Whop.
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                resetForm();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {combinedItems.map((item) => {
              const isService = item.itemType === 'service';
              const service = isService ? (item as ServiceItem) : null;
              const product = !isService ? (item as ProductItem) : null;

              return (
                <div
                  key={item.id}
                  className="bg-[#0D1220] border border-[#1E293B] hover:border-purple-800/50 rounded-2xl overflow-hidden shadow-lg transition duration-200 flex flex-col justify-between group"
                >
                  {/* Top Cover Thumbnail */}
                  <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md ${
                          isService
                            ? 'bg-purple-950/90 text-purple-200 border border-purple-700/60'
                            : 'bg-cyan-950/90 text-cyan-200 border border-cyan-700/60'
                        }`}
                      >
                        {isService ? 'خدمة مخصصة' : 'منتج رقمي'}
                      </span>
                    </div>

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                      {item.videoUrl && (
                        <span className="p-1 rounded-md bg-black/70 text-emerald-400 border border-emerald-500/40" title="فيديو مدرج">
                          <Video className="w-3 h-3" />
                        </span>
                      )}
                      {item.digitalFileUrl && (
                        <span className="p-1 rounded-md bg-black/70 text-cyan-400 border border-cyan-500/40" title="ملف رقمي مرفق">
                          <FolderArchive className="w-3 h-3" />
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.status === 'published'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                            : item.status === 'paused'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-700/50'
                            : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.status === 'published' ? 'نشط' : item.status === 'paused' ? 'موقوف مؤقتاً' : 'مسودة'}
                      </span>
                    </div>

                    {/* Category pill at bottom */}
                    <div className="absolute bottom-2 right-2">
                      <span className="text-[10px] bg-black/70 text-slate-300 px-2 py-0.5 rounded-md backdrop-blur-xs font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description || 'لا يوجد وصف تفصيلي'}
                      </p>
                    </div>

                    {/* Price & Stats Row */}
                    <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400">سعر البيع:</div>
                        <div className="text-base font-black font-mono text-white">
                          ${item.price.toFixed(2)}{' '}
                          <span className="text-[10px] text-emerald-400 font-normal">
                            (صافي ${(item.price * 0.97).toFixed(2)})
                          </span>
                        </div>
                      </div>

                      <div className="text-left text-xs text-slate-400">
                        {isService ? (
                          <div>
                            <span className="font-bold text-slate-200">{service?.ordersCount || 0}</span> طلب
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-200">{product?.downloadsCount || 0}</span> مبيعة
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#1E293B]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (isService && onSelectServicePreview) {
                              onSelectServicePreview(service!);
                            } else if (!isService && onSelectProductPreview) {
                              onSelectProductPreview(product!);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#1E293B] text-xs flex items-center gap-1 transition"
                          title="معاينة في المتجر"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-[11px] hidden sm:inline">معاينة</span>
                        </button>

                        <button
                          onClick={() => startEditing(item, item.itemType)}
                          className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#1E293B] text-xs flex items-center gap-1 transition"
                          title="تعديل سريع في هذه الصفحة"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-[11px] hidden sm:inline">تعديل</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(item, item.itemType)}
                          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                            item.status === 'published'
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800/40 hover:bg-amber-900/60'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/60'
                          }`}
                          title={item.status === 'published' ? 'إيقاف مؤقت' : 'تفعيل ونشر'}
                        >
                          {item.status === 'published' ? (
                            <>
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span className="text-[11px] hidden sm:inline">إيقاف</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span className="text-[11px] hidden sm:inline">تفعيل</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setDeletingItem({ id: item.id, type: item.itemType, title: item.title })}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs transition"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#0D1220] border border-rose-800/50 rounded-2xl max-w-md w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">تأكيد حذف العرض</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف <strong className="text-white">"{deletingItem.title}"</strong>؟ لن تتمكن من استرجاعه بعد الحذف.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B] text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
