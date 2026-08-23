import React, { useState, useRef } from 'react';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Eye,
  PauseCircle,
  PlayCircle,
  FileCheck,
  DollarSign,
  Download,
  Sparkles,
  CheckCircle2,
  X,
  CreditCard,
  PackageCheck,
  Upload
} from 'lucide-react';
import { ProductItem, MarketplaceCategory, User } from '../../types';

interface SellerProductsProps {
  currentUser: User;
  products: ProductItem[];
  onRefreshProducts: () => void;
  onSelectProductPreview?: (p: ProductItem) => void;
}

const CATEGORIES: MarketplaceCategory[] = [
  'Prompt Packs',
  'Digital Products',
  'AI Creators',
  'Design',
  'Marketing',
  'Video'
];

export const SellerProducts: React.FC<SellerProductsProps> = ({
  currentUser,
  products,
  onRefreshProducts,
  onSelectProductPreview
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'paused'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      console.error('File upload failed:', err);
      setIsUploadingCover(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Prompt Packs' as MarketplaceCategory,
    description: '',
    price: 49,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    previewUrl: '',
    format: 'ZIP / Notion / PDF',
    whopProductId: '',
    status: 'published' as 'published' | 'draft' | 'paused'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Prompt Packs',
      description: '',
      price: 49,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      previewUrl: '',
      format: 'ZIP / Notion / PDF',
      whopProductId: '',
      status: 'published'
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingProduct(null);
    setShowCreateModal(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category,
      description: product.description,
      price: product.price,
      coverImage: product.coverImage,
      previewUrl: product.previewUrl || '',
      format: product.format || 'ZIP / Notion / PDF',
      whopProductId: product.whopProductId || '',
      status: product.status || 'published'
    });
    setShowCreateModal(true);
  };

  const handleSaveProduct = async (statusOverride?: 'published' | 'draft') => {
    if (!formData.title.trim() || formData.price <= 0) {
      alert('Please provide a valid product title and price.');
      return;
    }

    setIsSubmitting(true);
    const effectiveStatus = statusOverride || formData.status;

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description,
      price: Number(formData.price),
      coverImage: formData.coverImage.trim(),
      previewUrl: formData.previewUrl.trim(),
      format: formData.format.trim(),
      whopProductId: formData.whopProductId.trim() || `whop_prod_${Date.now()}`,
      status: effectiveStatus
    };

    try {
      const token = localStorage.getItem('vireon_token');
      const url = editingProduct ? `/api/seller/products/${editingProduct.id}` : '/api/seller/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product');
      }

      setShowCreateModal(false);
      resetForm();
      setActionFeedback(editingProduct ? 'Product updated successfully!' : `Digital product created as ${effectiveStatus}!`);
      setTimeout(() => setActionFeedback(null), 3000);
      onRefreshProducts();
    } catch (e: any) {
      alert(`Error saving product: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (product: ProductItem, newStatus: 'published' | 'draft' | 'paused') => {
    try {
      const token = localStorage.getItem('vireon_token');
      const res = await fetch(`/api/seller/products/${product.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      setActionFeedback(`Product status updated to ${newStatus}`);
      setTimeout(() => setActionFeedback(null), 3000);
      onRefreshProducts();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem('vireon_token');
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser.id
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      setDeletingProductId(null);
      setActionFeedback('Digital product deleted.');
      setTimeout(() => setActionFeedback(null), 3000);
      onRefreshProducts();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const filteredProducts = products.filter(p => {
    if (filterStatus === 'all') return true;
    const currentStat = p.status || 'published';
    return currentStat === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Feedback Alert */}
      {actionFeedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1220] border border-[#1E293B] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Digital Products & Assets</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sell Midjourney prompt packs, video LUTs, Notion creator OS templates, and digital toolkits with instant automated Whop checkout fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Digital Product
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto">
        {(['all', 'published', 'draft', 'paused'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/20'
                : 'bg-[#111827] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
            }`}
          >
            {st} ({st === 'all' ? products.length : products.filter(p => (p.status || 'published') === st).length})
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-[#0D1220] border border-[#1E293B] rounded-2xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center mx-auto text-cyan-400">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No digital products found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {filterStatus === 'all'
              ? 'You have not uploaded any prompt packs or digital products yet. Start monetizing digital downloads now.'
              : `You have no products currently under '${filterStatus}'.`}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const currentStatus = product.status || 'published';
            return (
              <div
                key={product.id}
                className="bg-[#0D1220] border border-[#1E293B] hover:border-cyan-500/40 rounded-2xl overflow-hidden shadow-lg transition flex flex-col group"
              >
                {/* Product Cover */}
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1220] via-transparent to-transparent" />
                  
                  {/* Status */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md ${
                      currentStatus === 'published'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                        : currentStatus === 'draft'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                        : 'bg-rose-950/80 text-rose-300 border-rose-700/50'
                    }`}>
                      {currentStatus}
                    </span>
                  </div>

                  {/* Format */}
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
                      {product.format || 'ZIP'}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-3 left-3 bg-[#070A12]/90 border border-cyan-500/30 px-3 py-1 rounded-xl flex items-baseline gap-1">
                    <span className="text-xs text-cyan-400 font-semibold">$</span>
                    <span className="text-lg font-extrabold text-white">{product.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-cyan-300 transition">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-xl bg-[#111827] border border-[#1E293B] text-[11px] text-slate-300">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px]">Total Sales</span>
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {product.downloadsCount || 0} downloads
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px]">Whop Status</span>
                      <span className="font-semibold text-cyan-400 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Auto-Fulfill
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      {currentStatus !== 'published' && (
                        <button
                          onClick={() => handleToggleStatus(product, 'published')}
                          title="Publish Live"
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 transition"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                      {currentStatus === 'published' && (
                        <button
                          onClick={() => handleToggleStatus(product, 'paused')}
                          title="Pause Product"
                          className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/40 transition"
                        >
                          <PauseCircle className="w-4 h-4" />
                        </button>
                      )}
                      {currentStatus !== 'draft' && (
                        <button
                          onClick={() => handleToggleStatus(product, 'draft')}
                          title="Move to Draft"
                          className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 transition"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onSelectProductPreview && (
                        <button
                          onClick={() => onSelectProductPreview(product)}
                          title="Preview Marketplace View"
                          className="p-1.5 rounded-lg bg-[#111827] hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-[#1E293B] transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(product)}
                        title="Edit Product"
                        className="p-1.5 rounded-lg bg-[#111827] hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-[#1E293B] transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingProductId(product.id)}
                        title="Delete Product"
                        className="p-1.5 rounded-lg bg-[#111827] hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-[#1E293B] transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#1E293B] sticky top-0 bg-[#0D1220] z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingProduct ? 'Edit Digital Asset' : 'Add New Digital Product'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instant delivery via Whop digital vault or downloadable bundle.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 500+ Midjourney V6 Hyper-Realistic Commercial Prompts"
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as MarketplaceCategory })}
                    className="w-full bg-[#111827] border border-[#1E293B] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Price (USD $) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-[#111827] border border-[#1E293B] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Asset Format
                  </label>
                  <input
                    type="text"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    placeholder="e.g. Notion OS / ZIP / PDF / JSON"
                    className="w-full bg-[#111827] border border-[#1E293B] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Whop Product ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.whopProductId}
                    onChange={(e) => setFormData({ ...formData, whopProductId: e.target.value })}
                    placeholder="prod_whop_xxx (Auto-generated if empty)"
                    className="w-full bg-[#111827] border border-[#1E293B] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Description & What's Inside *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail the contents, categories included, prompt styles, Notion template modules, etc..."
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-cyan-500 rounded-xl p-3 text-white placeholder-slate-500 outline-none transition resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">
                    Cover Image / Product Thumbnail *
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingCover ? 'Uploading...' : 'Upload Media File'}</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/mp4"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/... or upload directly"
                    className="flex-1 bg-[#111827] border border-[#1E293B] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition"
                  />
                  {formData.coverImage && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#1E293B] shrink-0 bg-slate-900">
                      <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Preview / Demo Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.previewUrl}
                  onChange={(e) => setFormData({ ...formData, previewUrl: e.target.value })}
                  placeholder="https://notion.site/preview or https://vireon.io/demo"
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[#1E293B] bg-[#0D1220] flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveProduct('draft')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-amber-800/40 transition disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveProduct('published')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/30 transition active:scale-95 disabled:opacity-50"
                >
                  <PackageCheck className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT DIALOG */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0D1220] border border-rose-900/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl shadow-rose-950/20">
            <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="text-base font-bold text-white">Delete Digital Product?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete this digital product from your catalog?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-900/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
