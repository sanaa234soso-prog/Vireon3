import React from 'react';
import {
  Sparkles,
  Star,
  ShieldCheck,
  CheckCircle2,
  Eye,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowRight,
  Play
} from 'lucide-react';
import { User, CreatorPassport } from '../../types';

interface TopCreatorsShowcaseProps {
  onViewPassport: (userId: string) => void;
  onOpenMatch: () => void;
}

export const TopCreatorsShowcase: React.FC<TopCreatorsShowcaseProps> = ({
  onViewPassport,
  onOpenMatch
}) => {
  const featuredCreators = [
    {
      id: 'usr_sarah',
      name: 'Sarah Jenkins',
      handle: '@sarah_creates',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      badge: 'TOP RATED 2026',
      niche: 'Beauty & UGC TikTok Ads',
      score: 98,
      views: '4.8M+',
      ordersCompleted: 42,
      priceFrom: '$290',
      skills: ['Viral Hook Scripting', '4K Vertical Reels', 'Spark Code']
    },
    {
      id: 'usr_marcus',
      name: 'Marcus Vance',
      handle: '@vance_visuals',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      badge: 'AI & SAAS PRO',
      niche: 'AI Tech & SaaS Motion Demos',
      score: 96,
      views: '6.2M+',
      ordersCompleted: 58,
      priceFrom: '$350',
      skills: ['Screen Studio Flow', 'Voice Synthesis', 'B2B Conversion']
    },
    {
      id: 'usr_layla',
      name: 'Layla Al-Mansour',
      handle: '@layla_luxury',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      badge: 'GULF REGIONAL LEAD',
      niche: 'Luxury Lifestyle & E-Commerce',
      score: 99,
      views: '8.1M+',
      ordersCompleted: 76,
      priceFrom: '$420',
      skills: ['Arabic Dialects (Gulf)', 'Cinematic B-Roll', 'Brand Story']
    }
  ];

  return (
    <section className="py-16 bg-[#060812] border-b border-gray-800/80 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              VERIFIED 2026 CREATOR PASSPORTS
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              نخبة صناع المحتوى المعتمدين والموثقين
            </h2>
            <p className="text-sm text-gray-400 font-light max-w-xl">
              تصفح ملفات صناع المحتوى الأكثر طلباً مع جواز السفر الرقمي الموثق وتقييمات الأداء الفعلي.
            </p>
          </div>

          <button
            onClick={onOpenMatch}
            className="px-5 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-700/60 text-purple-200 text-xs font-bold flex items-center gap-2 transition-all self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>مطابقة AI لجميع الصناع</span>
          </button>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCreators.map((creator) => (
            <div
              key={creator.id}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#0C1020] to-[#080B16] border border-gray-800/90 hover:border-purple-600/70 shadow-xl transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                
                {/* Top Badge & Score */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                    {creator.badge}
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 font-mono text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{creator.score}/100</span>
                  </div>
                </div>

                {/* Avatar & Profile */}
                <div className="flex items-center gap-3.5 pt-1">
                  <div className="relative">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40 group-hover:border-purple-400 transition-all shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0C1020]" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>{creator.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">{creator.handle}</p>
                    <p className="text-[11px] text-pink-400 font-medium">{creator.niche}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#10162B] border border-gray-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block">إجمالي المشاهدات</span>
                    <span className="font-mono font-bold text-white">{creator.views}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">العقود المكتملة</span>
                    <span className="font-mono font-bold text-emerald-400">{creator.ordersCompleted} عقد</span>
                  </div>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {creator.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-[#141B32] text-gray-300 border border-gray-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-gray-800/80 flex items-center gap-2 mt-4">
                <button
                  onClick={() => onViewPassport(creator.id)}
                  className="flex-1 py-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 text-xs font-bold border border-purple-800/60 transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>عرض جواز السفر</span>
                </button>
                <div className="text-left px-2">
                  <span className="text-[9px] text-gray-400 block">يبدأ من</span>
                  <span className="text-xs font-mono font-bold text-white">{creator.priceFrom}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
