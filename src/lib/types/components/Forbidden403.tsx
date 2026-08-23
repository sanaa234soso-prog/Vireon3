import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  KeyRound,
  AlertTriangle,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';

interface Forbidden403Props {
  currentUser?: User | null;
  onNavigateHome: () => void;
  onOpenAdminLogin: () => void;
}

export const Forbidden403: React.FC<Forbidden403Props> = ({
  currentUser,
  onNavigateHome,
  onOpenAdminLogin
}) => {
  const [copiedCurl, setCopiedCurl] = useState(false);

  const curlTestCode = `curl -i -X GET http://localhost:3000/api/admin/metrics \\
  -H "Authorization: Bearer ${currentUser ? 'user_token_role_' + currentUser.role : 'anonymous'}" \\
  -H "x-user-id: ${currentUser?.id || 'guest'}"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlTestCode);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#070A12] text-slate-100">
      <div className="max-w-xl w-full bg-[#0D1220] border border-rose-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-rose-950/20 relative overflow-hidden">
        
        {/* Subtle red glow aura */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status Code & Shield Icon */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                  HTTP 403
                </span>
                <span className="text-xs text-slate-400 font-mono">RBAC_FORBIDDEN_ZONE</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
                Access Denied: Admin Clearance Required
              </h1>
            </div>
          </div>
          <Lock className="w-5 h-5 text-slate-500" />
        </div>

        {/* Security Message Body */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            The administrative namespace (<code className="text-purple-300 bg-[#111827] px-1.5 py-0.5 rounded border border-[#1E293B]">/admin</code> and all <code className="text-purple-300 bg-[#111827] px-1.5 py-0.5 rounded border border-[#1E293B]">/api/admin/*</code> endpoints) is strictly isolated and restricted to verified platform administrators.
          </p>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Session User:</span>
              <span className="font-semibold text-slate-200">{currentUser?.fullName || 'Anonymous / Guest'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Active Role:</span>
              <span className="font-semibold uppercase tracking-wider text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                {currentUser?.role || 'UNAUTHENTICATED'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Firewall Decision:</span>
              <span className="font-bold text-rose-400">ACCESS REJECTED & AUDITED</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-400 bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              This security boundary is enforced at the server-side kernel. Unauthorized API mutations or role escalation requests are automatically rejected and recorded into the immutable audit trail.
            </span>
          </div>
        </div>

        {/* Security Proof Terminal Command */}
        <div className="mt-5 p-3 rounded-xl bg-[#070A12] border border-[#1E293B] font-mono text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              <span>Server-Side Security Verification</span>
            </span>
            <button
              onClick={handleCopyCurl}
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 text-[10px]"
            >
              {copiedCurl ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : null}
              <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>
          <p className="text-slate-300 truncate">{curlTestCode.replace(/\\/g, '')}</p>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-5 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-200 text-xs font-semibold border border-[#1E293B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </button>

          <button
            onClick={onOpenAdminLogin}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Authenticate as Admin</span>
          </button>
        </div>

      </div>
    </div>
  );
};
