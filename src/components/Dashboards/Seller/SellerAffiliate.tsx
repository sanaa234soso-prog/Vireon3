import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Plus,
  TrendingUp,
  Percent,
  ExternalLink,
  DollarSign,
  MousePointerClick,
  CheckCircle2,
  X
} from 'lucide-react';
import { AffiliateLink, User } from '../../types';

interface SellerAffiliateProps {
  currentUser: User;
  affiliateLinks: AffiliateLink[];
  onRefreshAffiliate?: () => void;
}

export const SellerAffiliate: React.FC<SellerAffiliateProps> = ({
  currentUser,
  affiliateLinks,
  onRefreshAffiliate
}) => {
  const myLinks = affiliateLinks.filter((l) => l.userId === currentUser.id);
  const [links, setLinks] = useState<AffiliateLink[]>(myLinks);

  React.useEffect(() => {
    setLinks(affiliateLinks.filter((l) => l.userId === currentUser.id));
  }, [affiliateLinks, currentUser.id]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [commissionRate, setCommissionRate] = useState(25);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCopyLink = (linkId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const code = `${currentUser.fullName.split(' ')[0].toLowerCase()}_${Date.now().toString().slice(-4)}`;
    const newLink: AffiliateLink = {
      id: `aff_${Date.now()}`,
      userId: currentUser.id,
      campaignId: 'camp_aff_custom',
      title: productName.trim(),
      targetUrl: `https://vireon.io/marketplace?ref=${code}`,
      code: code.toUpperCase(),
      commissionRate: commissionRate,
      clicksCount: 0,
      salesCount: 0,
      totalCommission: 0,
      pendingCommission: 0,
      paidCommission: 0
    };

    setLinks([newLink, ...links]);
    setShowCreateModal(false);
    setProductName('');
    setFeedback(`New affiliate tracker for "${newLink.title}" created!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const totalClicks = links.reduce((sum, l) => sum + (l.clicksCount || 0), 0);
  const totalConversions = links.reduce((sum, l) => sum + (l.salesCount || 0), 0);
  const totalAffiliateEarned = links.reduce((sum, l) => sum + (l.totalCommission || 0), 0);
  const avgConversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
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
            <h2 className="text-xl font-bold text-white">Affiliate Links & Referral Commission</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/40">
              {links.length} Trackers
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate custom affiliate referral links and track click-throughs, purchases, and commission payouts in real time.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Generate New Link
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Referrals Earned</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${totalAffiliateEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400">Paid out automatically</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Link Clicks</span>
            <MousePointerClick className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Unique visitors routed</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Successful Conversions</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalConversions.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400">Completed purchases</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Conversion Rate</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {avgConversionRate}%
          </div>
          <div className="text-[11px] text-amber-400">Above industry benchmark</div>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#111827] text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-[#1E293B]">
              <tr>
                <th className="py-3.5 px-4">Item & Code</th>
                <th className="py-3.5 px-4">Commission</th>
                <th className="py-3.5 px-4">Clicks</th>
                <th className="py-3.5 px-4">Sales</th>
                <th className="py-3.5 px-4">Earnings</th>
                <th className="py-3.5 px-4 text-right">Referral Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {links.map((item) => (
                <tr key={item.id} className="hover:bg-[#151D30]/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="text-[11px] text-purple-400 font-mono mt-0.5">Code: {item.code}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-cyan-400">{item.commissionRate}%</span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {(item.clicksCount || 0).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-emerald-400">
                    {item.salesCount || 0}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-white">
                    ${(item.totalCommission || 0).toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleCopyLink(item.id, item.targetUrl)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        copiedId === item.id
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                          : 'bg-[#111827] text-slate-300 hover:text-white border-[#1E293B]'
                      }`}
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Link
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0D1220] border border-purple-900/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="font-bold text-white text-base">Generate Affiliate Tracker</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Product / Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. AI Prompt Superpack or 3x UGC Package"
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition active:scale-95"
                >
                  Create Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
