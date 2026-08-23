import React, { useState } from 'react';
import {
  Sparkles,
  Radar,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Search,
  CheckCircle2,
  Users,
  Zap,
  DollarSign,
  Play
} from 'lucide-react';
import { User } from '../../types';

interface HeroSectionProps {
  onOpenRadar: () => void;
  onOpenMatch: () => void;
  onOpenCampaignWizard: () => void;
  onSearch: (query: string) => void;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  selectedCategory: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenRadar,
  onOpenMatch,
  onOpenCampaignWizard,
  onSearch,
  onSelectCategory,
  searchQuery,
  selectedCategory
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const trendingTags = [
    { label: '🔥 TikTok UGC Videos', category: 'TikTok UGC' },
    { label: '🤖 AI Prompt Packs', category: 'Prompt Packs' },
    { label: '✨ Beauty & Skincare', category: 'Beauty & Skincare' },
    { label: '💻 SaaS Growth Ads', category: 'SaaS Growth' },
    { label: '⚡ Tech & Gadgets', category: 'Tech & AI' }
  ];

  return (
    <section className="relative overflow-hidden pt-8 pb-14 border-b border-gray-800/80 bg-gradient-to-b from-[#060812] via-[#090D1A] to-[#060812]">
      {/* 2026 Ambient Lighting Effect Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-[400px] h-[300px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[250px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Futuristic Background Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Chip */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-950/90 via-violet-950/80 to-pink-950/90 border border-purple-700/50 shadow-lg shadow-purple-950/40 text-purple-200 backdrop-blur-md animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-mono text-emerald-400 font-bold">2026 NEXT-GEN PLATFORM</span>
            <span className="text-gray-500">•</span>
            <span>المنصة الرائدة لاقتصاد صناع المحتوى وضمان الصفقات المالي</span>
            <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
          </div>
        </div>

        {/* Hero Main Typography & Intro */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.15] font-sans">
            سوق المحتوى الرقمي الفاخر <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              اصنع • بيع • وظّف • روّج • اكسب
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto font-light">
            بيئة العمل المتكاملة لربط أفضل صناع المحتوى المؤثرين والمنتجات الرقمية مع أكبر العلامات التجارية والمسوقين عالمياً وعربياً، مع نظام حماية مالي مشفر <span className="text-emerald-400 font-semibold font-mono">100% Escrow Protected</span>.
          </p>

          {/* Interactive Search Bar & Filter Engine */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto pt-2">
            <div className="relative flex flex-col sm:flex-row items-center p-2 rounded-2xl sm:rounded-full bg-[#0D1222]/95 border border-purple-800/60 shadow-2xl shadow-purple-950/60 backdrop-blur-xl gap-2">
              <div className="flex items-center gap-3 w-full px-4 py-2">
                <Search className="w-5 h-5 text-purple-400 shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ابحث عن صناع UGC، إعلانات TikTok، حزم أوامر الذكاء الاصطناعي، أو حملات الشركات..."
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-xl sm:rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-bold shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-pink-200" />
                  <span>بحث ذكي</span>
                </button>
              </div>
            </div>
          </form>

          {/* Popular Tag Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-gray-400 font-medium ml-1">الأكثر طلباً:</span>
            {trendingTags.map((tag) => (
              <button
                key={tag.category}
                onClick={() => onSelectCategory(tag.category)}
                className={`px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                  selectedCategory === tag.category
                    ? 'bg-purple-600/90 text-white border-purple-400 shadow-md'
                    : 'bg-[#0B101E]/80 text-gray-300 border-gray-800 hover:border-purple-700/60 hover:text-white'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Action Hub Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onOpenRadar}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-900/90 via-violet-900/80 to-purple-950 border border-purple-600/70 text-purple-100 hover:bg-purple-800/80 text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-purple-950/80 transition-all hover:-translate-y-0.5"
            >
              <Radar className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>رادار الفرص الذكي (Live Radar)</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-purple-500 text-white font-mono font-bold">
                98% دقة
              </span>
            </button>

            <button
              onClick={onOpenMatch}
              className="px-6 py-3.5 rounded-2xl bg-pink-950/80 hover:bg-pink-900/80 border border-pink-700/60 text-pink-100 text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-pink-950/60 transition-all hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>المطابقة الفورية بالذكاء الاصطناعي</span>
            </button>

            <button
              onClick={onOpenCampaignWizard}
              className="px-6 py-3.5 rounded-2xl bg-[#10172B] hover:bg-[#16203B] border border-gray-700 text-gray-200 text-sm font-bold flex items-center gap-2.5 shadow-lg transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>إطلاق حملة تسويقية</span>
            </button>
          </div>

        </div>

        {/* 2026 Live Web Platform Metrics Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-gray-800/80">
          
          <div className="p-4 rounded-2xl bg-[#0A0E1A]/80 border border-gray-800/90 text-right backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>حجم الضمان المالي المحمي</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              $18.4M+
            </p>
            <p className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              تأمين محجوز 100% بدون مخاطر
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A0E1A]/80 border border-gray-800/90 text-right backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>صناع محتوى موثقين (Passport)</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              14,280+
            </p>
            <p className="text-[11px] text-purple-400 font-medium mt-0.5">
              متوسط تقييم أداء 96.8 / 100
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A0E1A]/80 border border-gray-800/90 text-right backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>عائد الاستثمار للمعلنين (ROI)</span>
              <TrendingUp className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              4.9x
            </p>
            <p className="text-[11px] text-pink-400 font-medium mt-0.5">
              معدل وصول ومبيعات مضاعف
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0A0E1A]/80 border border-gray-800/90 text-right backdrop-blur-md">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>سرعة تسليم المخرجات الرقمية</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              &lt; 72 ساعة
            </p>
            <p className="text-[11px] text-amber-400 font-medium mt-0.5">
              تسليم فوري أو مجدول بدقة
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
