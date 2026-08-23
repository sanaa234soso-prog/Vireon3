import React, { useState, useEffect, useRef } from 'react';
import {
  FolderOpen,
  UploadCloud,
  FileText,
  Video,
  Image as ImageIcon,
  Archive,
  Download,
  Trash2,
  Edit3,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  HardDrive,
  Copy,
  Check,
  AlertCircle,
  FileCode,
  Sparkles,
  ShoppingBag,
  Layers,
  X
} from 'lucide-react';
import { User, SellerFileItem, ServiceItem, ProductItem } from '../../types';

interface SellerFilesProps {
  currentUser: User;
  services?: ServiceItem[];
  products?: ProductItem[];
  onRefreshFiles?: () => void;
}

export const SellerFiles: React.FC<SellerFilesProps> = ({
  currentUser,
  services = [],
  products = [],
  onRefreshFiles
}) => {
  const [files, setFiles] = useState<SellerFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [activeFileForLink, setActiveFileForLink] = useState<SellerFileItem | null>(null);
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State for File Upload / Creation
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    description: '',
    category: 'document' as SellerFileItem['category'],
    fileUrl: '',
    sizeFormatted: '2.5 MB',
    fileType: 'application/pdf',
    linkedServiceId: '',
    linkedProductId: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/seller/files', {
        headers: {
          'x-user-id': currentUser.id,
          Authorization: `Bearer ${currentUser.id}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      } else {
        // Fallback to initial empty array
        setFiles([]);
      }
    } catch (err) {
      console.error('Failed to fetch seller files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentUser.id]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Local File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Detect format and size
    const sizeInMB = (selected.size / (1024 * 1024)).toFixed(1);
    const formattedSize = Number(sizeInMB) >= 1 ? `${sizeInMB} MB` : `${(selected.size / 1024).toFixed(0)} KB`;
    
    let cat: SellerFileItem['category'] = 'document';
    if (selected.type.startsWith('video/')) cat = 'video';
    else if (selected.type.startsWith('image/')) cat = 'image';
    else if (selected.type.includes('zip') || selected.type.includes('tar') || selected.type.includes('rar')) cat = 'archive';
    else if (selected.name.endsWith('.prompt') || selected.name.endsWith('.json')) cat = 'prompt';

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadFormData(prev => ({
        ...prev,
        name: selected.name,
        fileType: selected.type || 'application/octet-stream',
        sizeFormatted: formattedSize,
        category: cat,
        fileUrl: dataUrl
      }));
    };
    reader.readAsDataURL(selected);
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.name.trim()) {
      showToast('يرجى كتابة اسم الملف', 'error');
      return;
    }
    if (!uploadFormData.fileUrl) {
      showToast('يرجى اختيار ملف أو إدخال رابط مباشر', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const linkedProduct = products.find(p => p.id === uploadFormData.linkedProductId);
      const linkedService = services.find(s => s.id === uploadFormData.linkedServiceId);

      const res = await fetch('/api/seller/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          Authorization: `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({
          ...uploadFormData,
          linkedProductName: linkedProduct?.title,
          linkedServiceName: linkedService?.title
        })
      });

      if (res.ok) {
        showToast('تم رفع وحفظ الملف الرقمي بنجاح!');
        setIsUploadModalOpen(false);
        setUploadFormData({
          name: '',
          description: '',
          category: 'document',
          fileUrl: '',
          sizeFormatted: '2.5 MB',
          fileType: 'application/pdf',
          linkedServiceId: '',
          linkedProductId: ''
        });
        await fetchFiles();
        if (onRefreshFiles) onRefreshFiles();
      } else {
        const err = await res.json();
        showToast(err.error || 'فشل في رفع الملف', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ في الاتصال بالسيرفر', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الملف؟ لن يتمكن المشترون السابقون من تحميله إذا لم يتوفر رابط بديل.')) {
      return;
    }

    try {
      const res = await fetch(`/api/seller/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id,
          Authorization: `Bearer ${currentUser.id}`
        }
      });

      if (res.ok) {
        showToast('تم حذف الملف بنجاح');
        setFiles(prev => prev.filter(f => f.id !== fileId));
        if (onRefreshFiles) onRefreshFiles();
      } else {
        showToast('فشل في حذف الملف', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const handleLinkItem = async (type: 'product' | 'service', targetId: string) => {
    if (!activeFileForLink) return;

    try {
      const res = await fetch(`/api/seller/files/${activeFileForLink.id}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          Authorization: `Bearer ${currentUser.id}`
        },
        body: JSON.stringify({ type, targetId })
      });

      if (res.ok) {
        showToast('تم ربط الملف بالمنتج/الخدمة بنجاح!');
        setIsLinkModalOpen(false);
        setActiveFileForLink(null);
        await fetchFiles();
        if (onRefreshFiles) onRefreshFiles();
      } else {
        showToast('فشل ربط الملف', 'error');
      }
    } catch (err) {
      showToast('خطأ في الاتصال بالخادم', 'error');
    }
  };

  const copyFileLink = (file: SellerFileItem) => {
    navigator.clipboard.writeText(file.fileUrl);
    setCopiedFileId(file.id);
    showToast('تم نسخ رابط التحميل المباشر إلى الحافظة');
    setTimeout(() => setCopiedFileId(null), 2500);
  };

  const triggerDownload = (file: SellerFileItem) => {
    // Increment download count on backend
    fetch(`/api/seller/files/${file.id}/download-hit`, { method: 'POST' }).catch(() => null);

    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`بدأ تحميل ${file.name}`);
  };

  // Filtered files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (file.linkedProductName && file.linkedProductName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (file.linkedServiceName && file.linkedServiceName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalDownloads = files.reduce((acc, f) => acc + (f.downloadCount || 0), 0);
  const totalLinked = files.filter(f => f.linkedProductId || f.linkedServiceId).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'video':
        return <Video className="w-5 h-5 text-indigo-400" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-amber-400" />;
      case 'prompt':
        return <FileCode className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border ${
          notification.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0D1220] p-6 rounded-2xl border border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">إدارة الملفات والمنتجات الرقمية</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ارفع الفيديوهات، القوالب، الكتب، البرومبتات وملفات التسليم واربطها بمبيعاتك وخدماتك تلقائيًا
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchFiles}
            className="p-2.5 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-[#1E293B] transition"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>رفع ملف جديد</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>إجمالي الملفات</span>
            <FolderOpen className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{files.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">جاهزة للتسليم والتحميل</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>مرات التحميل الفعلية</span>
            <Download className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{totalDownloads}</p>
          <p className="text-[11px] text-slate-400 mt-1">بواسطة المشترين والعملاء</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>الملفات المربوطة بمنتجات</span>
            <LinkIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-indigo-400">{totalLinked}</p>
          <p className="text-[11px] text-slate-400 mt-1">تسلّم آلياً فور الدفع</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>نظام الحماية والأمان</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-base font-bold text-amber-300">تسليم مشفر وآمن</p>
          <p className="text-[11px] text-slate-400 mt-1">روابط خاصة للمشترين فقط</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#0D1220] p-4 rounded-xl border border-[#1E293B]">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، الوصف، أو المنتج المرتبط..."
            className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-[#1E293B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'video', label: 'فيديوهات' },
            { id: 'document', label: 'مستندات وPDF' },
            { id: 'image', label: 'صور وتصاميم' },
            { id: 'archive', label: 'حزم مضغوطة' },
            { id: 'prompt', label: 'برومبت وAI' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#111827] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Files List Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-[#0D1220] rounded-2xl border border-[#1E293B]">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">جاري تحميل الملفات الرقمية...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="p-12 text-center bg-[#0D1220] rounded-2xl border border-[#1E293B]">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">لا توجد ملفات حالياً</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            قم برفع ملفاتك الرقمية (حزم الـ UGC، قوالب الموشن، برومبتات الذكاء الاصطناعي، الكتب) لربطها بمنتجات متجرك وتسليمها للمشترين تلقائياً.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>رفع أول ملف</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-[#0D1220] rounded-2xl border border-[#1E293B] hover:border-purple-500/40 p-5 flex flex-col justify-between transition-all duration-200 group"
            >
              <div>
                {/* Top Row: Icon, Category & Actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#111827] border border-[#1E293B] flex items-center justify-center">
                      {getCategoryIcon(file.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition line-clamp-1" title={file.name}>
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">{file.sizeFormatted}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] text-purple-400 uppercase font-bold">{file.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyFileLink(file)}
                      title="نسخ رابط التحميل"
                      className="p-1.5 rounded-lg bg-[#111827] hover:bg-purple-950 text-slate-400 hover:text-purple-300 border border-[#1E293B] transition"
                    >
                      {copiedFileId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      title="حذف الملف"
                      className="p-1.5 rounded-lg bg-[#111827] hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-[#1E293B] transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {file.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {file.description}
                  </p>
                )}

                {/* Linked Service / Product Status */}
                <div className="my-3 pt-3 border-t border-[#1E293B]/70 space-y-2">
                  {file.linkedProductName ? (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/30 text-indigo-300 text-[11px]">
                      <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-semibold line-clamp-1">منتج: {file.linkedProductName}</span>
                    </div>
                  ) : file.linkedServiceName ? (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/30 text-purple-300 text-[11px]">
                      <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-semibold line-clamp-1">خدمة: {file.linkedServiceName}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveFileForLink(file);
                        setIsLinkModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#161f33] border border-dashed border-[#2b3952] text-slate-400 hover:text-slate-200 text-[11px] font-medium transition"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>ربط بمنتج أو خدمة رقمية</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{file.downloadCount || 0} تحميلة</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveFileForLink(file);
                      setIsLinkModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#111827] hover:bg-[#1c2438] text-slate-300 hover:text-white text-xs border border-[#1E293B] transition"
                  >
                    تغيير الربط
                  </button>
                  <button
                    onClick={() => triggerDownload(file)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold border border-purple-500/30 transition"
                  >
                    <Download className="w-3 h-3" />
                    <span>تحميل</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD FILE MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">رفع وتخصيص ملف رقمي</h3>
                  <p className="text-xs text-slate-400">أضف ملفاً لتسليمه للمشترين عند شراء منتجاتك</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFile} className="space-y-4">
              {/* File Dropzone Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#1E293B] hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer bg-[#111827]/60 hover:bg-[#111827] transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="*/*"
                />
                <UploadCloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-white">
                  {uploadFormData.name ? uploadFormData.name : 'انقر لاختيار ملف من جهازك أو اسحبه هنا'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  يدعم الفيديوهات (MP4, MOV)، المستندات (PDF, Notion)، الحزم (ZIP)، وملفات الذكاء الاصطناعي
                </p>
                {uploadFormData.sizeFormatted && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-semibold border border-purple-800/40">
                    الحجم: {uploadFormData.sizeFormatted}
                  </span>
                )}
              </div>

              {/* Or Direct URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  أو رابط الملف السحابي المباشر (Google Drive / Dropbox / CDN)
                </label>
                <input
                  type="url"
                  value={uploadFormData.fileUrl}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, fileUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">اسم الملف أو العنوان</label>
                  <input
                    type="text"
                    required
                    value={uploadFormData.name}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                    placeholder="مثال: Masterpack_UGC_Hooks.zip"
                    className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تصنيف الملف</label>
                  <select
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="document">مستند / دليل PDF</option>
                    <option value="video">فيديو خام / UGC Master</option>
                    <option value="archive">حزمة ZIP مضغوطة</option>
                    <option value="prompt">برومبت AI / JSON Pack</option>
                    <option value="image">تصميم / صورة عالية الدقة</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">وصف الملف وإرشادات الاستخدام</label>
                <textarea
                  rows={2}
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                  placeholder="اكتب نبذة أو تعليمات للمشتري عند فك الضغط أو المشاهدة..."
                  className="w-full px-3.5 py-2 bg-[#111827] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Link to Product (Optional on upload) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ربط فوري بمنتج رقمي (اختياري)</label>
                <select
                  value={uploadFormData.linkedProductId}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, linkedProductId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#111827] border border-[#1E293B] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">بدون ربط (تخزين مستقل)</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      منتج: {p.title} (${p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#111827] text-slate-300 text-xs font-semibold hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع والحفظ...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>حفظ الملف الرقمي</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK TO PRODUCT / SERVICE MODAL */}
      {isLinkModalOpen && activeFileForLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-sm">ربط الملف: {activeFileForLink.name}</h3>
              </div>
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setActiveFileForLink(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              اختر المنتج أو الخدمة التي ترغب في ربط هذا الملف بها ليتم تسليمه للمشتري تلقائياً فور الدفع.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">الربط بمنتج رقمي من متجرك:</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-2 bg-[#111827] rounded-lg">لا توجد منتجات رقمية حالياً</p>
                  ) : (
                    products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleLinkItem('product', p.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition ${
                          activeFileForLink.linkedProductId === p.id
                            ? 'bg-purple-950/60 border-purple-500 text-white font-bold'
                            : 'bg-[#111827] border-[#1E293B] text-slate-300 hover:border-purple-500/50'
                        }`}
                      >
                        <span className="line-clamp-1">{p.title}</span>
                        <span className="text-emerald-400 font-bold ml-2">${p.price}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">أو الربط بحزمة خدمة مخصصة:</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {services.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-2 bg-[#111827] rounded-lg">لا توجد خدمات حالياً</p>
                  ) : (
                    services.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleLinkItem('service', s.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition ${
                          activeFileForLink.linkedServiceId === s.id
                            ? 'bg-indigo-950/60 border-indigo-500 text-white font-bold'
                            : 'bg-[#111827] border-[#1E293B] text-slate-300 hover:border-indigo-500/50'
                        }`}
                      >
                        <span className="line-clamp-1">{s.title}</span>
                        <span className="text-purple-400 font-bold ml-2">${s.price}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E293B] flex justify-end">
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setActiveFileForLink(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#111827] text-slate-300 text-xs font-semibold hover:text-white"
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
