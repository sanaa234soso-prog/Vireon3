import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Sparkles,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Plus,
  X,
  Share2,
  Eye,
  Video,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react';
import { CreatorPassport, User } from '../../types';

interface SellerPassportTabProps {
  currentUser: User;
  passport: CreatorPassport | null;
  onRefreshPassport: () => void;
  onOpenPublicPassport?: () => void;
}

export const SellerPassportTab: React.FC<SellerPassportTabProps> = ({
  currentUser,
  passport,
  onRefreshPassport,
  onOpenPublicPassport
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [tagline, setTagline] = useState(passport?.tagline || 'Top 1% High-Retention UGC & Commercial Video Creator');
  const [bio, setBio] = useState(passport?.bio || 'Specializing in Arabic & English commercial hooks, viral TikTok ads, and aesthetic product showcases.');
  const [nichesInput, setNichesInput] = useState(passport?.niches?.join(', ') || 'UGC, Beauty, Tech Gadgets, E-Commerce');
  const [skillsInput, setSkillsInput] = useState(passport?.skills?.join(', ') || 'CapCut Pro, 4K Color Grading, Scriptwriting, High CTR Hooks, Arabic VO');

  const handleSavePassport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('vireon_token');
      const res = await fetch('/api/seller/passport', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          tagline: tagline.trim(),
          bio: bio.trim(),
          niches: nichesInput.split(',').map(n => n.trim()).filter(Boolean),
          skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (!res.ok) throw new Error('Failed to update passport');

      setIsEditing(false);
      setFeedback('Creator Passport updated successfully and synced with the public marketplace!');
      setTimeout(() => setFeedback(null), 4000);
      onRefreshPassport();
    } catch (e: any) {
      alert(`Error updating passport: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const score = passport?.vireonScore || 96;
  const verifiedViews = passport?.verifiedViews || 8420000;

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
            <h2 className="text-xl font-bold text-white">Vireon Creator Passport™</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Verified On-Chain
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your tamper-proof digital creator CV. Showcase verified view metrics, platform badges, client reviews, and niche expertise to brand partners.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenPublicPassport && (
            <button
              onClick={onOpenPublicPassport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#1E293B] text-xs font-semibold transition"
            >
              <Eye className="w-4 h-4" />
              View Public Card
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 transition active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Cancel Editing' : 'Edit Passport Info'}
          </button>
        </div>
      </div>

      {/* Main Passport Card */}
      <div className="bg-[#0D1220] border border-purple-900/30 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        {/* Background glow aura */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar & Score */}
          <div className="flex flex-col items-center text-center space-y-3 shrink-0">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={currentUser.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-600 to-teal-600 p-1.5 rounded-xl text-white shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#111827] border border-[#1E293B] w-full">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Vireon Score</div>
              <div className="text-xl font-black text-emerald-400">{score} / 100</div>
              <div className="text-[10px] text-slate-400">Top 1% Tier</div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{currentUser.fullName}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-semibold text-purple-400 mt-0.5">{tagline}</p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{bio}</p>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] text-xs">
              <div>
                <span className="text-slate-500 text-[10px] block">Verified Views</span>
                <span className="font-bold text-white">{(verifiedViews / 1000000).toFixed(1)}M+</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Completed Orders</span>
                <span className="font-bold text-emerald-400">{passport?.completedProjects || 142}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Client Rating</span>
                <span className="font-bold text-amber-400">★ {passport?.rating || 4.98} / 5.0</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Dispute Rate</span>
                <span className="font-bold text-cyan-400">0.0% Perfect</span>
              </div>
            </div>

            {/* Niches & Skills */}
            <div className="space-y-2.5">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Focus Niches:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(passport?.niches || ['UGC', 'Beauty', 'E-Commerce']).map((n, i) => (
                    <span key={i} className="text-xs font-medium text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-lg">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Production Capabilities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(passport?.skills || ['4K Video', 'Color Grading', 'Arabic Voiceover']).map((s, i) => (
                    <span key={i} className="text-xs font-medium text-slate-300 bg-[#151D30] border border-[#1E293B] px-2.5 py-1 rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT FORM (Conditionally open) */}
      {isEditing && (
        <form onSubmit={handleSavePassport} className="bg-[#0D1220] border border-purple-500/40 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
            <h3 className="font-bold text-white text-base">Edit Passport Details</h3>
            <span className="text-xs text-slate-400">Real-time marketplace updates</span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Tagline / Headline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">About & Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl p-3 text-white outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Niches (comma-separated)</label>
              <input
                type="text"
                value={nichesInput}
                onChange={(e) => setNichesInput(e.target.value)}
                className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Skills & Software (comma-separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white outline-none transition"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-[#1E293B] text-slate-300 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Saving Changes...' : 'Save Passport'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
