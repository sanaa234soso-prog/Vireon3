import React, { useState, useRef } from 'react';
import {
  ShoppingBag,
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
  Layers,
  Star,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { ServiceItem, MarketplaceCategory, User } from '../../types';

interface SellerServicesProps {
  currentUser: User;
  services: ServiceItem[];
  onRefreshServices: () => void;
  onSelectServicePreview?: (s: ServiceItem) => void;
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

export const SellerServices: React.FC<SellerServicesProps> = ({
  currentUser,
  services,
  onRefreshServices,
  onSelectServicePreview
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'paused'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
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
    category: 'UGC' as MarketplaceCategory,
    description: '',
    price: 150,
    deliveryDays: 3,
    revisions: 2,
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    tagsInput: 'UGC, TikTok Ads, Video Hook',
    sampleDeliverablesInput: '9:16 Vertical Video (4K 60fps), Alternate 3-sec Hook, Captions SRT File',
    status: 'published' as 'published' | 'draft' | 'paused'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'UGC',
      description: '',
      price: 150,
      deliveryDays: 3,
      revisions: 2,
      coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      tagsInput: 'UGC, TikTok Ads, Video Hook',
      sampleDeliverablesInput: '9:16 Vertical Video (4K 60fps), Alternate 3-sec Hook, Captions SRT File',
      status: 'published'
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingService(null);
    setShowCreateModal(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      category: service.category,
      description: service.description,
      price: service.price,
      deliveryDays: service.deliveryDays,
      revisions: service.revisions,
      coverImage: service.coverImage,
      tagsInput: service.tags?.join(', ') || '',
      sampleDeliverablesInput: service.sampleDeliverables?.join(', ') || '',
      status: service.status || 'published'
    });
    setShowCreateModal(true);
  };

  const handleSaveService = async (statusOverride?: 'published' | 'draft') => {
    if (!formData.title.trim() || formData.price <= 0) {
      alert('Please provide a valid service title and price.');
      return;
    }

    setIsSubmitting(true);
    const effectiveStatus = statusOverride || formData.status;

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description,
      price: Number(formData.price),
      deliveryDays: Number(formData.deliveryDays) || 3,
      revisions: Number(formData.revisions) || 2,
      coverImage: formData.coverImage.trim(),
      tags: formData.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      sampleDeliverables: formData.sampleDeliverablesInput.split(',').map(s => s.trim()).filter(Boolean),
      status: effectiveStatus
    };

    try {
      const token = localStorage.getItem('vireon_token');
      const url = editingService ? `/api/seller/services/${editingService.id}` : '/api/seller/services';
      const method = editingService ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Failed to save service');
      }

      setShowCreateModal(false);
      resetForm();
      setActionFeedback(editingService ? 'Service updated successfully!' : `Service created as ${effectiveStatus}!`);
      setTimeout(() => setActionFeedback(null), 3000);
      onRefreshServices();
    } catch (e: any) {
      alert(`Error saving service: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (service: ServiceItem, newStatus: 'published' | 'draft' | 'paused') => {
    try {
      const token = localStorage.getItem('vireon_token');
      const res = await fetch(`/api/seller/services/${service.id}/status`, {
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

      setActionFeedback(`Service status changed to ${newStatus}`);
      setTimeout(() => setActionFeedback(null), 3000);
      onRefreshServices();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const token = localStorage.getItem('vireon_token');
      const res = await fetch(`/api/seller/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser.id
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete service');
      }

      setDeletingServiceId(null);
      setActionFeedback('Service removed from marketplace.');
      setTimeout(() => setActionFeedback(null), 3000);
      onRefreshServices();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const filteredServices = services.filter(s => {
    if (filterStatus === 'all') return true;
    const currentStat = s.status || 'published';
    return currentStat === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Notification */}
      {actionFeedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-lg animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1220] border border-[#1E293B] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Services Management</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/40">
              {services.length} Listed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create custom video, editing, and UGC packages. Published services appear instantly in the marketplace for client bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create New Service
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto">
        {(['all', 'published', 'draft', 'paused'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                : 'bg-[#111827] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
            }`}
          >
            {st} ({st === 'all' ? services.length : services.filter(s => (s.status || 'published') === st).length})
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-[#0D1220] border border-[#1E293B] rounded-2xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-center mx-auto text-purple-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No services found in this view</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {filterStatus === 'all'
              ? 'You have not created any services yet. Click below to launch your first service on the Vireon marketplace.'
              : `You have no services currently categorized as '${filterStatus}'.`}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Create Service Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const currentStatus = service.status || 'published';
            return (
              <div
                key={service.id}
                className="bg-[#0D1220] border border-[#1E293B] hover:border-purple-500/40 rounded-2xl overflow-hidden shadow-lg transition flex flex-col group"
              >
                {/* Cover & Status Badge */}
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={service.coverImage}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1220] via-transparent to-transparent" />
                  
                  {/* Status Pill */}
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

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
                      {service.category}
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 left-3 bg-[#070A12]/90 border border-purple-500/30 px-3 py-1 rounded-xl flex items-baseline gap-1">
                    <span className="text-xs text-purple-400 font-semibold">$</span>
                    <span className="text-lg font-extrabold text-white">{service.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-purple-300 transition">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Specs & Performance */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#111827] border border-[#1E293B] text-[11px] text-slate-300">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px]">Delivery</span>
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {service.deliveryDays}d
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px]">Revisions</span>
                      <span className="font-semibold text-white">{service.revisions || 2}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[10px]">Orders</span>
                      <span className="font-semibold text-emerald-400">{service.ordersCount || 0}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {service.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-slate-400 bg-[#151D30] px-2 py-0.5 rounded border border-[#1E293B]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between gap-1 text-xs">
                    {/* Status Toggle buttons */}
                    <div className="flex items-center gap-1">
                      {currentStatus !== 'published' && (
                        <button
                          onClick={() => handleToggleStatus(service, 'published')}
                          title="Publish Live"
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 transition"
                        >
                          <PlayCircle className="w-4 h-4" />
                        </button>
                      )}
                      {currentStatus === 'published' && (
                        <button
                          onClick={() => handleToggleStatus(service, 'paused')}
                          title="Pause Service"
                          className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/40 transition"
                        >
                          <PauseCircle className="w-4 h-4" />
                        </button>
                      )}
                      {currentStatus !== 'draft' && (
                        <button
                          onClick={() => handleToggleStatus(service, 'draft')}
                          title="Move to Draft"
                          className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-slate-700 text-slate-300 transition"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onSelectServicePreview && (
                        <button
                          onClick={() => onSelectServicePreview(service)}
                          title="Preview Marketplace View"
                          className="p-1.5 rounded-lg bg-[#111827] hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-[#1E293B] transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(service)}
                        title="Edit Service"
                        className="p-1.5 rounded-lg bg-[#111827] hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-[#1E293B] transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingServiceId(service.id)}
                        title="Delete Service"
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

      {/* CREATE / EDIT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1E293B] sticky top-0 bg-[#0D1220] z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingService ? 'Edit Service Offering' : 'Create New Marketplace Service'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define deliverables, price, and turnaround for instant client bookings.
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

            {/* Modal Form */}
            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 3 High-Energy TikTok Hooks + 1 Conversion UGC Ad"
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition"
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
                    className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
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
                    min="10"
                    step="5"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Delivery Turnaround (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.deliveryDays}
                    onChange={(e) => setFormData({ ...formData, deliveryDays: Number(e.target.value) })}
                    className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Included Revisions
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.revisions}
                    onChange={(e) => setFormData({ ...formData, revisions: Number(e.target.value) })}
                    className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your creative process, equipment, voiceover languages, and exact file formats delivered..."
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl p-3 text-white placeholder-slate-500 outline-none transition resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">
                    Cover Image / Video Thumbnail *
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition"
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
                    className="flex-1 bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition"
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
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  placeholder="UGC, TikTok Ads, Arabic, Reels, Beauty"
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Included Deliverables Bullet Points (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.sampleDeliverablesInput}
                  onChange={(e) => setFormData({ ...formData, sampleDeliverablesInput: e.target.value })}
                  placeholder="4K 60fps MP4, 3 Hook Variations, Subtitles (.SRT)"
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            {/* Modal Footer */}
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
                  onClick={() => handleSaveService('draft')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-amber-800/40 transition disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveService('published')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : editingService ? 'Update & Publish' : 'Publish to Marketplace'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingServiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0D1220] border border-rose-900/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl shadow-rose-950/20">
            <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="text-base font-bold text-white">Delete Service Listing?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete this service? This action will permanently remove it from the public marketplace. Existing completed orders will remain archived in your earnings history.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingServiceId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteService(deletingServiceId)}
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
