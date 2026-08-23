import React, { useState, useRef } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Upload,
  Send,
  MessageSquare,
  DollarSign,
  ShieldCheck,
  X,
  Search,
  Download,
  Paperclip
} from 'lucide-react';
import { OrderItem, User } from '../../types';

interface SellerOrdersProps {
  currentUser: User;
  orders: OrderItem[];
  onRefreshOrders: () => void;
  onOpenMessages?: (buyerId?: string) => void;
}

export const SellerOrders: React.FC<SellerOrdersProps> = ({
  currentUser,
  orders,
  onRefreshOrders,
  onOpenMessages
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'delivered' | 'completed' | 'refunded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveringOrder, setDeliveringOrder] = useState<OrderItem | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingDeliverable, setIsUploadingDeliverable] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const deliverableInputRef = useRef<HTMLInputElement>(null);

  const handleDeliverableFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDeliverable(true);
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
          setDeliverableUrl(data.url);
        } else {
          setDeliverableUrl(base64Data);
        }
        setIsUploadingDeliverable(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload failed:', err);
      setIsUploadingDeliverable(false);
    }
  };

  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveringOrder || !deliverableUrl.trim()) {
      alert('Please provide a valid deliverable URL or download link.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('vireon_token');
      const res = await fetch(`/api/seller/orders/${deliveringOrder.id}/deliver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          deliverableUrl: deliverableUrl.trim(),
          notes: deliveryNotes.trim()
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit deliverable');
      }

      setDeliveringOrder(null);
      setDeliverableUrl('');
      setDeliveryNotes('');
      setFeedback(`Order #${deliveringOrder.id} marked as delivered! Buyer notified and 72-hour escrow countdown initiated.`);
      setTimeout(() => setFeedback(null), 4000);
      onRefreshOrders();
    } catch (e: any) {
      alert(`Error submitting deliverable: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.itemTitle.toLowerCase().includes(q) ||
        o.buyerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Feedback Banner */}
      {feedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1220] border border-[#1E293B] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Client Orders & Escrow Deliveries</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              {orders.length} Total Orders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Fulfill client bookings, submit final video deliverables, and track PaySecure Escrow release milestones.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E293B] pb-3 overflow-x-auto">
        {(['all', 'paid', 'delivered', 'completed', 'refunded'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
              filterStatus === st
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/20'
                : 'bg-[#111827] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
            }`}
          >
            {st === 'paid' ? 'In Progress (Escrow Locked)' : st} ({st === 'all' ? orders.length : orders.filter(o => o.status === st).length})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#0D1220] border border-[#1E293B] rounded-2xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-center mx-auto text-purple-400">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No orders matching this filter</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {filterStatus === 'all'
              ? 'You do not have any incoming client orders yet. Promote your services or apply to active brand campaigns.'
              : `No orders currently found with status '${filterStatus}'.`}
          </p>
        </div>
      ) : (
        <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#111827] border-b border-[#1E293B] text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Item</th>
                  <th className="py-3.5 px-4">Buyer / Client</th>
                  <th className="py-3.5 px-4">Gross / Net</th>
                  <th className="py-3.5 px-4">Escrow Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-slate-300">
                {filteredOrders.map((order) => {
                  const net = order.sellerNet || Number((order.amount * 0.92).toFixed(2));
                  return (
                    <tr key={order.id} className="hover:bg-[#151D30]/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400 shrink-0 font-mono text-[11px] font-bold">
                            #{order.id.slice(-4)}
                          </div>
                          <div>
                            <div className="font-bold text-white line-clamp-1">{order.itemTitle}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                              <span className="uppercase text-[10px] text-cyan-400 bg-cyan-950/40 px-1 rounded border border-cyan-800/30">
                                {order.itemType}
                              </span>
                              <span>{order.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{order.buyerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{order.buyerId}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">${order.amount.toFixed(2)}</div>
                        <div className="text-[11px] text-emerald-400 font-semibold">
                          Net: ${net.toFixed(2)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          order.status === 'completed'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                            : order.status === 'delivered'
                            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50'
                            : order.status === 'paid'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                            : 'bg-rose-950/80 text-rose-300 border-rose-700/50'
                        }`}>
                          {order.status === 'paid' && <Clock className="w-3 h-3 text-amber-400" />}
                          {order.status === 'delivered' && <ShieldCheck className="w-3 h-3 text-cyan-400" />}
                          {order.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {order.status === 'paid' ? 'Escrow In Progress' : order.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onOpenMessages && (
                            <button
                              onClick={() => onOpenMessages(order.buyerId)}
                              title="Chat with Buyer"
                              className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] text-slate-400 hover:text-slate-200 border border-[#1E293B] transition"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}

                          {order.status === 'paid' && (
                            <button
                              onClick={() => {
                                setDeliveringOrder(order);
                                setDeliverableUrl('');
                                setDeliveryNotes('');
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-900/30 transition active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Submit Deliverable
                            </button>
                          )}

                          {order.status === 'delivered' && (
                            <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/30">
                              Under Review
                            </span>
                          )}

                          {order.status === 'completed' && (
                            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/30">
                              Settled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMIT DELIVERABLE MODAL */}
      {deliveringOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0D1220] border border-purple-900/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-purple-950/20">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">Submit Milestone Deliverables</h3>
                  <p className="text-xs text-slate-400">Order #{deliveringOrder.id} • {deliveringOrder.buyerName}</p>
                </div>
              </div>
              <button
                onClick={() => setDeliveringOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeliverSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-[#111827] border border-[#1E293B] space-y-1">
                <div className="text-slate-400 text-xs">Ordered Item:</div>
                <div className="font-semibold text-white">{deliveringOrder.itemTitle}</div>
                <div className="text-xs text-emerald-400 font-semibold">Net Payout on Release: ${(deliveringOrder.sellerNet || deliveringOrder.amount * 0.92).toFixed(2)}</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">
                    Deliverable Files URL or Direct Attachment *
                  </label>
                  <button
                    type="button"
                    onClick={() => deliverableInputRef.current?.click()}
                    disabled={isUploadingDeliverable}
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{isUploadingDeliverable ? 'Uploading...' : 'Upload Work File'}</span>
                  </button>
                </div>
                <input
                  ref={deliverableInputRef}
                  type="file"
                  onChange={handleDeliverableFileUpload}
                  className="hidden"
                />
                <input
                  type="text"
                  required
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or upload file directly"
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Delivery Notes & Instructions for Client
                </label>
                <textarea
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Here is the final 4K cut with 3 hook variations and custom sound design. Please inspect and approve..."
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl p-3 text-white placeholder-slate-500 outline-none transition resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/30 flex items-start gap-2 text-xs text-purple-300">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Once submitted, the client will receive an automated delivery notification. If no revision or dispute is opened within 72 hours, PaySecure Escrow automatically releases full net funds to your balance.
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliveringOrder(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Submitting...' : 'Complete & Deliver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
