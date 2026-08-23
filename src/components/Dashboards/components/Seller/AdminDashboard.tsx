import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShoppingBag,
  Megaphone,
  Scale,
  DollarSign,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { User, OrderItem } from '../../types';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  orders: OrderItem[];
  onUpdateUser?: (updated: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users: initialUsers,
  orders
}) => {
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'users'
    | 'verification'
    | 'orders'
    | 'campaigns'
    | 'disputes'
    | 'revenue'
    | 'analytics'
    | 'settings'
  >('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [disputedOrders, setDisputedOrders] = useState([
    {
      id: 'disp_101',
      orderId: 'ord_9941',
      buyerName: 'Riyadh Growth Agency',
      sellerName: 'Sarah Al-Mansoor',
      itemTitle: 'TikTok UGC Spark Ad Video Pack (3 Hooks)',
      amount: 450.0,
      escrowLocked: 450.0,
      buyerComplaint: 'The creator submitted video in 1080p instead of 4K ProRes as agreed in milestone requirements.',
      sellerResponse: 'Raw 4K footage was provided via Dropbox link in chat message #4.',
      status: 'pending'
    },
    {
      id: 'disp_102',
      orderId: 'ord_9984',
      buyerName: 'E-com Brand Alpha',
      sellerName: 'Marcus Sterling',
      itemTitle: 'AI Persona Talking Avatar Ad',
      amount: 320.0,
      escrowLocked: 320.0,
      buyerComplaint: 'Delivery delayed by 4 days without prior notice.',
      sellerResponse: 'Milestone was updated and communicated with revised render.',
      status: 'pending'
    }
  ]);

  const handleResolveDispute = (disputeId: string, action: 'release_to_seller' | 'refund_buyer') => {
    setDisputedOrders((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? {
              ...d,
              status: action === 'release_to_seller' ? 'Released to Seller' : 'Refunded to Buyer'
            }
          : d
      )
    );
  };

  const handleToggleVerifyUser = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVerified: !u.isVerified } : u))
    );
  };

  const handleToggleBanUser = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: !u.isBanned } : u))
    );
  };

  const totalGMV = 184500.0;
  const platformRevenue = totalGMV * 0.08;
  const activeEscrowPool = 24600.0;

  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const pendingVerificationUsers = usersList.filter((u) => !u.isVerified && u.role === 'creator');

  const sidebarNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, badge: usersList.length },
    { id: 'verification', label: 'Creators Verification', icon: ShieldCheck, badge: pendingVerificationUsers.length },
    { id: 'orders', label: 'Orders & Escrow', icon: ShoppingBag, badge: orders.length },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'disputes', label: 'Disputes', icon: Scale, badge: disputedOrders.filter((d) => d.status === 'pending').length },
    { id: 'revenue', label: 'Platform Revenue', icon: DollarSign },
    { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
            
            {/* Admin Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E293B]">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center font-bold text-purple-300">
                ADM
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">Admin Portal</h3>
                <p className="text-[11px] text-purple-400 font-mono">Full Control Access</p>
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
                    onClick={() => setActiveTab(item.id as any)}
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

          </div>
        </aside>

        {/* MAIN ADMIN CONTENT */}
        <main className="flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* TOP METRICS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Total GMV</span>
                  <span className="text-xl sm:text-2xl font-bold text-white font-mono mt-1 block">
                    ${totalGMV.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Platform Revenue (8%)</span>
                  <span className="text-xl sm:text-2xl font-bold text-purple-400 font-mono mt-1 block">
                    ${platformRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Locked in Escrow</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1 block">
                    ${activeEscrowPool.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0D1220] border border-[#1E293B]">
                  <span className="text-slate-500 text-xs block">Active Disputes</span>
                  <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono mt-1 block">
                    {disputedOrders.filter((d) => d.status === 'pending').length}
                  </span>
                </div>
              </div>

              {/* PENDING VERIFICATION TABLE */}
              <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">Pending Creator Verifications</h2>
                    <p className="text-xs text-slate-400">Review creator identities and issue verified passports.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('verification')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1E293B] text-slate-500 font-semibold">
                        <th className="pb-2">Creator</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Country</th>
                        <th className="pb-2">Role</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                      {usersList.slice(0, 3).map((u) => (
                        <tr key={u.id}>
                          <td className="py-3 font-medium text-white flex items-center gap-2">
                            <img src={u.avatarUrl} alt={u.fullName} className="w-6 h-6 rounded-full object-cover" />
                            <span>{u.fullName}</span>
                          </td>
                          <td className="py-3 text-slate-400">{u.email}</td>
                          <td className="py-3 text-slate-400">{u.country}</td>
                          <td className="py-3 capitalize">{u.role}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleToggleVerifyUser(u.id)}
                              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                u.isVerified
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                  : 'bg-purple-600 text-white'
                              }`}
                            >
                              {u.isVerified ? 'Verified' : 'Verify'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DISPUTES TABLE */}
              <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">Escrow Dispute Resolution</h2>
                    <p className="text-xs text-slate-400">Intervene in open milestone disputes.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('disputes')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                  >
                    All Disputes
                  </button>
                </div>

                <div className="space-y-3">
                  {disputedOrders.slice(0, 1).map((disp) => (
                    <div key={disp.id} className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{disp.itemTitle}</span>
                        <span className="font-mono text-emerald-400 font-bold">${disp.amount.toFixed(2)} Escrow</span>
                      </div>
                      <p className="text-slate-400"><strong className="text-slate-200">Buyer:</strong> {disp.buyerComplaint}</p>
                      <p className="text-slate-400"><strong className="text-slate-200">Seller:</strong> {disp.sellerResponse}</p>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E293B]">
                        <button
                          onClick={() => handleResolveDispute(disp.id, 'refund_buyer')}
                          className="px-3 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40 text-xs font-semibold"
                        >
                          Refund Buyer
                        </button>
                        <button
                          onClick={() => handleResolveDispute(disp.id, 'release_to_seller')}
                          className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-semibold"
                        >
                          Release to Seller
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: USERS TABLE */}
          {activeTab === 'users' && (
            <div className="p-5 rounded-xl bg-[#0D1220] border border-[#1E293B] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">All Platform Users ({filteredUsers.length})</h2>
                  <p className="text-xs text-slate-400">Manage creator, brand, and admin accounts.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="bg-[#111827] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-[#111827] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="creator">Creators</option>
                    <option value="brand">Brands</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-slate-500 font-semibold">
                      <th className="pb-2">User</th>
                      <th className="pb-2">Email</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">Verified</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3 font-medium text-white flex items-center gap-2">
                          <img src={u.avatarUrl} alt={u.fullName} className="w-6 h-6 rounded-full object-cover" />
                          <span>{u.fullName}</span>
                        </td>
                        <td className="py-3 text-slate-400">{u.email}</td>
                        <td className="py-3 capitalize">{u.role}</td>
                        <td className="py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            u.isVerified ? 'bg-emerald-950/80 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.isVerified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleToggleVerifyUser(u.id)}
                            className="px-2 py-1 rounded bg-[#111827] text-slate-300 hover:text-white"
                          >
                            {u.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          <button
                            onClick={() => handleToggleBanUser(u.id)}
                            className={`px-2 py-1 rounded ${
                              u.isBanned ? 'bg-emerald-900 text-emerald-200' : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OTHER ADMIN TABS */}
          {activeTab !== 'overview' && activeTab !== 'users' && (
            <div className="p-6 rounded-xl bg-[#0D1220] border border-[#1E293B] text-center py-12 space-y-2">
              <h3 className="text-base font-semibold text-white capitalize">{activeTab} Controls</h3>
              <p className="text-xs text-slate-400">Escrow rails, dispute resolvers, and platform metrics are operational.</p>
            </div>
          )}

        </main>

      </div>
    </div>
  );
};
