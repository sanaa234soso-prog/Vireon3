import React from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  LayoutDashboard,
  Store,
  AlertTriangle
} from 'lucide-react';
import { User } from '../../types';

interface SellerForbidden403Props {
  currentUser?: User | null;
  onNavigateHome: () => void;
  onNavigateDashboard?: () => void;
}

export const SellerForbidden403: React.FC<SellerForbidden403Props> = ({
  currentUser,
  onNavigateHome,
  onNavigateDashboard
}) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-[#070A12] text-slate-100">
      <div className="max-w-xl w-full bg-[#0D1220] border border-amber-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-950/20 relative overflow-hidden">
        
        {/* Subtle glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400 shadow-inner">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  HTTP 403
                </span>
                <span className="text-xs text-slate-400 font-mono">ROLE_RESTRICTED_PORTAL</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
                صلاحية الدخول مخصصة للبائعين فقط (Seller Only)
              </h1>
            </div>
          </div>
          <Lock className="w-5 h-5 text-slate-500" />
        </div>

        {/* Security Message Body */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed text-right">
          <p>
            لوحة تحكم البائعين والمبدعين <code className="text-purple-300 bg-[#111827] px-1.5 py-0.5 rounded border border-[#1E293B]">/seller</code> ونقاط الـ API المحمية مخصصة حصرياً لحسابات البائعين وصناع المحتوى المسجلين.
          </p>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">المستخدم الحالي:</span>
              <span className="font-semibold text-slate-200">{currentUser?.fullName || 'غير مسجل'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">نوع حسابك المسجل:</span>
              <span className="font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                {currentUser?.role || 'UNAUTHENTICATED'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">الصلاحية المطلوبة:</span>
              <span className="font-bold text-amber-400">بائع / صانع محتوى (CREATOR)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 flex items-start gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              نوع الحساب يُحدد بشكل دائم عند التسجيل ولا يمكن تغييره. يمكنك استخدام لوحة التحكم المخصصة لنوع حسابك أو تصفح السوق بحرية.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 pt-5 border-t border-[#1E293B]">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#1E293B] text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة للسوق العام (Marketplace)</span>
          </button>
          {onNavigateDashboard && (
            <button
              onClick={onNavigateDashboard}
              className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>الذهاب للوحة تحكم حسابي</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
