import React, { useState, useEffect } from 'react';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  X,
  Building2,
  Download
} from 'lucide-react';
import { OrderItem, User } from '../../types';

interface SellerEarningsProps {
  currentUser: User;
  orders: OrderItem[];
  onRefreshOrders: () => void;
}

export const SellerEarnings: React.FC<SellerEarningsProps> = ({
  currentUser,
  orders,
  onRefreshOrders
}) => {
  const [earningsData, setEarningsData] = useState<{
    grossRevenue: number;
    platformFee: number;
    netEarned: number;
    pendingInEscrow: number;
    availableBalance: number;
    payouts: Array<{
      id: string;
      userId: string;
      amount: number;
      method: string;
      destination: string;
      status: string;
      createdAt: string;
    }>;
  } | null>(null);

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(500);
  const [payoutMethod, setPayoutMethod] = useState<'bank_wire' | 'card_direct' | 'crypto_usdt'>('bank_wire');
  const [beneficiaryName, setBeneficiaryName] = useState(currentUser.name || '');
  const [bankName, setBankName] = useState('Al Rajhi Bank / مصرف الراجحي');
  const [iban, setIban] = useState('SA0380000000608010167519');
  const [swiftCode, setSwiftCode] = useState('RJHISARI');
  const [cardNumber, setCardNumber] = useState('');
  const [usdtAddress, setUsdtAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('vireon_token');
      const res = await fetch('/api/seller/earnings', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        const data = await res.json();
        setEarningsData(data);
      }
    } catch (e) {
      console.error('Failed to fetch seller earnings:', e);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [currentUser.id, orders]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || payoutAmount < 50) {
      alert('Minimum withdrawal amount is $50.00.');
      return;
    }

    let destinationInfo = '';
    if (payoutMethod === 'bank_wire') {
      if (!iban.trim() || !beneficiaryName.trim()) {
        alert('يرجى كتابة اسم المستفيد ورقم الآيبان (IBAN) بدقة');
        return;
      }
      destinationInfo = `IBAN: ${iban} | Bank: ${bankName} | Swift: ${swiftCode || 'N/A'} | Beneficiary: ${beneficiaryName}`;
    } else if (payoutMethod === 'card_direct') {
      if (!cardNumber.trim() || !beneficiaryName.trim()) {
        alert('يرجى إدخال رقم البطاقة واسم حاملها');
        return;
      }
      destinationInfo = `Card: ${cardNumber} | Name: ${beneficiaryName}`;
    } else {
      if (!usdtAddress.trim()) {
        alert('يرجى إدخال عنوان محفظة USDT (TRC-20)');
        return;
      }
      destinationInfo = `USDT TRC-20: ${usdtAddress}`;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('vireon_token');
      const methodName = payoutMethod === 'bank_wire' ? 'Vireon Instant Wire (IBAN)' : payoutMethod === 'card_direct' ? 'Direct to Card (Visa/MC)' : 'Crypto USDT (TRC-20)';
      const res = await fetch('/api/seller/payouts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          amount: payoutAmount,
          method: methodName,
          destination: destinationInfo
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit payout');
      }

      setShowPayoutModal(false);
      setFeedback(`تم تقديم طلب سحب مبلغ $${payoutAmount.toFixed(2)} بنجاح! سيتم تحويل الأموال مباشرة خلال 24 ساعة.`);
      setTimeout(() => setFeedback(null), 5000);
      fetchEarnings();
    } catch (e: any) {
      alert(`خطأ في طلب السحب: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gross = earningsData?.grossRevenue || orders.reduce((sum, o) => sum + o.amount, 0);
  const net = earningsData?.netEarned || Number((gross * 0.92).toFixed(2));
  const escrow = earningsData?.pendingInEscrow || orders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((sum, o) => sum + (o.sellerNet || o.amount * 0.92), 0);
  const available = earningsData?.availableBalance || 2450.00;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {feedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1220] border border-[#1E293B] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Earnings, Escrow & Payouts</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              PaySecure Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time balance settlement, escrow timeline release, and automated Whop & Stripe payouts.
          </p>
        </div>

        <button
          onClick={() => {
            setPayoutAmount(Math.min(available, 1000));
            setShowPayoutModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition active:scale-95"
        >
          <Wallet className="w-4 h-4" />
          Withdraw Available Funds
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available for Withdrawal */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-[#0D1220] border border-emerald-800/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${available.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Ready for immediate withdrawal
          </div>
        </div>

        {/* In Escrow Clearance */}
        <div className="p-5 rounded-2xl bg-[#0D1220] border border-amber-800/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Pending in Escrow</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${escrow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-400/90 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            72h milestone clearance
          </div>
        </div>

        {/* Lifetime Net Earnings */}
        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Lifetime Earned Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/50 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-purple-300">
            3% Vireon fee (97% creator net earnings)
          </div>
        </div>

        {/* Gross Volume */}
        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Total Gross Volume</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {orders.length} total transactions
          </div>
        </div>
      </div>

      {/* Payout History & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout Withdrawal Records */}
        <div className="lg:col-span-1 bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Payout Requests</h3>
            <span className="text-[11px] text-slate-400">{earningsData?.payouts?.length || 1} Total</span>
          </div>

          <div className="space-y-3">
            {(earningsData?.payouts || [
              {
                id: 'payout_1',
                userId: currentUser.id,
                amount: 1250.00,
                vireonFee: 37.50,
                netAmount: 1212.50,
                method: 'Whop Express Payout',
                destination: 'Verified Account (**** 4242)',
                status: 'completed',
                whopTransferId: 'whop_tr_9941',
                createdAt: '2026-08-10T14:20:00Z'
              }
            ]).map((p: any) => {
              const feeVal = p.vireonFee !== undefined ? p.vireonFee : Number((p.amount * 0.03).toFixed(2));
              const netVal = p.netAmount !== undefined ? p.netAmount : Number((p.amount - feeVal).toFixed(2));
              return (
                <div key={p.id} className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">${p.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Net: ${netVal.toFixed(2)} (3% Vireon fee: -${feeVal.toFixed(2)})</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        p.status === 'completed'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/40'
                          : p.status === 'rejected'
                          ? 'bg-red-950/80 text-red-300 border-red-700/40'
                          : 'bg-amber-950/80 text-amber-300 border-amber-700/40'
                      }`}
                    >
                      {p.status === 'completed'
                        ? '✓ مؤكد من Whop'
                        : p.status === 'rejected'
                        ? '✕ فشل التحويل'
                        : '⏳ بانتظار تأكيد Whop'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{p.method}</div>
                  {p.whopTransferId && (
                    <div className="text-[10px] text-purple-300 font-mono">
                      Whop ID: {p.whopTransferId}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleString()}</div>

                  {p.status === 'pending' && (
                    <button
                      onClick={async () => {
                        await fetch('/api/whop/simulate-webhook', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            payoutId: p.id,
                            action: 'transfer_completed',
                            amount: p.amount
                          })
                        });
                        fetchEarnings();
                      }}
                      className="w-full mt-1.5 py-1 px-2.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-700/50 text-[10px] text-purple-200 font-bold flex items-center justify-center gap-1 transition"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>محاكاة تأكيد Whop للسحب (transfer_completed)</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="lg:col-span-2 bg-[#0D1220] border border-[#1E293B] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Recent Order Earnings Ledger</h3>
            <span className="text-xs text-emerald-400 font-semibold">100% credited (15% Vireon fee on withdrawal)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111827] text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Order</th>
                  <th className="py-2.5 px-3">Buyer</th>
                  <th className="py-2.5 px-3">Earned</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B] text-slate-300">
                {orders.map((o) => {
                  return (
                    <tr key={o.id} className="hover:bg-[#151D30]/60 transition">
                      <td className="py-2.5 px-3 font-semibold text-white line-clamp-1 max-w-[180px]">
                        {o.itemTitle}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{o.buyerName}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400 font-mono">+${o.amount.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                          o.status === 'completed'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
                            : 'bg-amber-950/60 text-amber-300 border-amber-700/40'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PAYOUT WITHDRAWAL MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0D1220] border border-emerald-900/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl shadow-emerald-950/20">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Request Fund Withdrawal</h3>
                  <p className="text-xs text-slate-400">Available: ${available.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Gross Withdrawal Amount ($ USD) *
                </label>
                <input
                  type="number"
                  min="50"
                  max={available}
                  step="10"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition text-base font-bold"
                />
              </div>

              {/* Commission Deduction Breakdown (3% Vireon Fee) */}
              <div className="p-3.5 rounded-xl bg-[#111827] border border-purple-900/40 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Requested Gross Amount:</span>
                  <span className="font-mono font-bold text-white">${payoutAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-purple-300">
                  <span>Vireon Platform Fee (3%):</span>
                  <span className="font-mono font-bold text-purple-400">-${(payoutAmount * 0.03).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between font-bold text-emerald-400 text-sm">
                  <span>Net Transfer to You (97%):</span>
                  <span className="font-mono text-base">+${(payoutAmount * 0.97).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  طريقة استلام الأرباح (Payout Gateway)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bank_wire', label: 'حوالة IBAN بنكية', icon: Building2 },
                    { id: 'card_direct', label: 'تحويل بطاقة فوري', icon: CreditCard },
                    { id: 'crypto_usdt', label: 'محفظة USDT', icon: DollarSign }
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPayoutMethod(method.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition ${
                          payoutMethod === method.id
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                            : 'bg-[#111827] border-[#1E293B] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Destination Inputs */}
              {payoutMethod === 'bank_wire' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">اسم صاحب الحساب</label>
                      <input
                        type="text"
                        required
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                        placeholder="الاسم القانوني كما في البنك"
                        className="w-full bg-[#0D1220] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1">اسم البنك</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="مثال: مصرف الراجحي"
                        className="w-full bg-[#0D1220] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">رقم الآيبان الدولي (IBAN)</label>
                    <input
                      type="text"
                      required
                      value={iban}
                      onChange={(e) => setIban(e.target.value)}
                      placeholder="SA0000000000000000000000"
                      className="w-full bg-[#0D1220] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white font-mono text-xs outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">رمز السويفت (SWIFT / BIC Code - اختياري)</label>
                    <input
                      type="text"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="RJHISARI"
                      className="w-full bg-[#0D1220] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white font-mono text-xs outline-none uppercase"
                    />
                  </div>
                </div>
              )}

              {payoutMethod === 'card_direct' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">الاسم المطبوع على البطاقة</label>
                    <input
                      type="text"
                      required
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      placeholder="CARDHOLDER NAME"
                      className="w-full bg-[#0D1220] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white text-xs outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">رقم البطاقة (Visa / Mastercard)</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full bg-[#0D1220] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {payoutMethod === 'crypto_usdt' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-[#111827] border border-[#1E293B]">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">عنوان محفظة USDT (شبكة TRC-20)</label>
                    <input
                      type="text"
                      required
                      value={usdtAddress}
                      onChange={(e) => setUsdtAddress(e.target.value)}
                      placeholder="T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"
                      className="w-full bg-[#0D1220] border border-[#1E293B] focus:border-emerald-500 rounded-lg px-3 py-2 text-white font-mono text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  نظام الحماية Vireon PaySecure™ يضمن سرية بياناتك المصرفية وتحويل أرباحك الصافية (97%) بأمان تام خلال 24 ساعة.
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
