import React, { useState } from 'react';
import {
  X,
  Shield,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { adminApi } from '../lib/adminApi';
import { User } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminUser: User) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [email, setEmail] = useState('admin@vireon.io');
  const [adminKey, setAdminKey] = useState('VIREON_MASTER_ADMIN_2026');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await adminApi.adminLogin(email, adminKey, password);
    setLoading(false);

    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Authentication rejected. Verify admin credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A12]/80 backdrop-blur-sm">
      <div className="max-w-md w-full bg-[#0D1220] border border-purple-900/50 rounded-2xl p-6 shadow-2xl relative text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#111827] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Admin Gateway</span>
              <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                Core RBAC
              </span>
            </h2>
            <p className="text-xs text-slate-400">Authenticate for platform administration access.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Admin Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                placeholder="admin@vireon.io"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Master Admin Security Key</label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
                className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-[11px] placeholder-slate-500 focus:outline-none"
                placeholder="VIREON_MASTER_ADMIN_2026"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Default development key: <code className="text-purple-400">VIREON_MASTER_ADMIN_2026</code></p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold shadow-md shadow-purple-900/30 transition-colors"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Enter Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>SHA-512 Server Sealed</span>
          </span>
          <span className="text-slate-500">VIREON Kernel v2.6</span>
        </div>

      </div>
    </div>
  );
};
