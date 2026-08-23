import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  Award,
  Globe,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { CreatorPassport, PPVMetric, User } from '../../types';

interface SellerAnalyticsProps {
  currentUser: User;
  passport: CreatorPassport | null;
  ppvMetrics: PPVMetric[];
}

export const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({
  currentUser,
  passport,
  ppvMetrics
}) => {
  const verifiedViews = passport?.verifiedViews || 0;
  const score = passport?.vireonScore || (currentUser.isVerified ? 92 : 88);

  const scoreBreakdown = [
    { label: 'Content Quality & Resolution', value: 98, color: 'bg-emerald-500' },
    { label: 'Audience Retention & Watch Time', value: 94, color: 'bg-purple-500' },
    { label: 'Delivery Speed & Turnaround', value: 97, color: 'bg-indigo-500' },
    { label: 'Buyer Satisfaction & Reviews', value: 99, color: 'bg-cyan-500' },
    { label: 'Escrow Dispute Rate (0.0%)', value: 100, color: 'bg-teal-500' }
  ];

  const topCountries = [
    { country: 'Saudi Arabia', code: 'SA', share: '38%', flag: '🇸🇦' },
    { country: 'United Arab Emirates', code: 'AE', share: '29%', flag: '🇦🇪' },
    { country: 'United States', code: 'US', share: '18%', flag: '🇺🇸' },
    { country: 'United Kingdom', code: 'GB', share: '10%', flag: '🇬🇧' },
    { country: 'Other Global Markets', code: 'ROW', share: '5%', flag: '🌍' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1220] border border-[#1E293B] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Performance Analytics & Audience Intelligence</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking of marketplace profile views, video impressions, client conversion funnel, and Vireon Score breakdown.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Video Impressions</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {(verifiedViews / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18.4% this month
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Marketplace Profile Visits</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            42,850
          </div>
          <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +12.1% organic CTR
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Listing Conversion Rate</span>
            <MousePointerClick className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            6.8%
          </div>
          <div className="text-[11px] text-amber-400">
            Top 5% among verified creators
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1220] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overall Vireon Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {score} <span className="text-sm font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Tier 1 Elite Creator
          </div>
        </div>
      </div>

      {/* 2-Column Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Breakdown */}
        <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="font-bold text-white text-base">Vireon Score 5-Pillar Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Algorithmically calculated from buyer verification, completion timeliness, and ad performance.
            </p>
          </div>

          <div className="space-y-4">
            {scoreBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{item.label}</span>
                  <span className="font-bold text-white">{item.value}/100</span>
                </div>
                <div className="w-full bg-[#111827] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Geography */}
        <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Audience Geography & Reach</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified viewer demographic distribution across social integrations.
              </p>
            </div>
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="space-y-3">
            {topCountries.map((c) => (
              <div key={c.code} className="flex items-center justify-between p-3 rounded-xl bg-[#111827] border border-[#1E293B]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.flag}</span>
                  <div>
                    <div className="font-bold text-white text-xs">{c.country}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{c.code}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cyan-400 text-xs">{c.share}</span>
                  <span className="text-[10px] text-slate-500 block">of views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
