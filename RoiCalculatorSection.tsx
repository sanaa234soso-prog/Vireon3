import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Percent,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface RoiCalculatorSectionProps {
  onLaunchCampaign: () => void;
}

export const RoiCalculatorSection: React.FC<RoiCalculatorSectionProps> = ({
  onLaunchCampaign
}) => {
  const [budget, setBudget] = useState<number>(3500);
  const [campaignType, setCampaignType] = useState<'hybrid' | 'fixed' | 'ppv' | 'affiliate'>('hybrid');
  const [niche, setNiche] = useState<string>('ugc');

  // Multiplier calculations based on niche and model
  const getNicheMultiplier = () => {
    switch (niche) {
      case 'beauty': return 1.15;
      case 'saas': return 1.4;
      case 'tech': return 1.25;
      case 'fitness': return 1.1;
      default: return 1.2;
    }
  };

  const mult = getNicheMultiplier();
  const estimatedCreators = Math.max(1, Math.round((budget / 450) * (campaignType === 'ppv' ? 1.8 : 1)));
  const estimatedViews = Math.round(budget * 680 * mult);
  const estimatedClicks = Math.round(estimatedViews * 0.042);
  const estimatedConversions = Math.round(estimatedClicks * 0.065);
  const escrowProtectedAmount = budget;
  const platformFee = Math.round(budget * 0.08);
  const netCreatorPayout = budget - platformFee;
  const projectedGrossRevenue = Math.round(estimatedConversions * 45);
  const projectedRoi = ((projectedGrossRevenue / budget) * 100).toFixed(0);

  return (
    <section className="py-16 bg-gradient-to-b from-[#060812] via-[#090D1C] to-[#060812] border-b border-gray-800/80 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-pink-950/80 text-pink-300 border border-pink-800/60 font-mono">
            <Calculator className="w-4 h-4 text-pink-400" />
            2026 AI ROI & ESCROW SIMULATOR
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            حاسبة العوائد التفاعلية وتوزيع ميزانية الحملات
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light">
            احسب التقديرات الذكية لعدد المشاهدات، صناع المحتوى المؤهلين، وتوزيع الضمان المالي قبل إطلاق حملتك الإعلانية.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#0B0F1E] border border-purple-800/40 shadow-2xl space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center justify-between">
                <span>تخصيص معايير الحملة</span>
                <span className="text-xs text-purple-400 font-mono">Real-time Model</span>
              </h3>

              {/* Budget Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">ميزانية الحملة الإجمالية</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    ${budget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="25000"
                  step="250"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>$500</span>
                  <span>$10,000</span>
                  <span>$25,000+</span>
                </div>
              </div>

              {/* Model Selector */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium block">
                  نموذج الدفع والتعاقد (Payout Model)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'hybrid', label: '✨ مختلط (Hybrid VIP)' },
                    { id: 'fixed', label: '💵 مبلغ ثابت (Fixed)' },
                    { id: 'ppv', label: '📊 الدفع لكل 1K مشاهدة' },
                    { id: 'affiliate', label: '🎯 تسويق بالعمولة %' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCampaignType(m.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-right ${
                        campaignType === m.id
                          ? 'bg-purple-950/80 text-purple-200 border-purple-500 shadow-md'
                          : 'bg-[#101526] text-gray-400 border-gray-800 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Niche Selector */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium block">مجال العمل المستهدف (Niche)</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-[#101526] border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ugc">فيديوهات UGC وإعلانات TikTok</option>
                  <option value="saas">تطبيقات التقنية والبرمجيات SaaS</option>
                  <option value="beauty">الجمال والعناية بالبشرة (Beauty)</option>
                  <option value="tech">الإلكترونيات والذكاء الاصطناعي</option>
                  <option value="fitness">اللياقة والصحة البدنية</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> ضمان مالي مشفر 100%
              </span>
              <span className="font-mono text-gray-500">VIREON Secure</span>
            </div>
          </div>

          {/* Results Projection Card (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-[#0F1424] via-[#12182B] to-[#0A0D18] border border-purple-700/50 shadow-2xl space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400 font-mono">
                    AI PROJECTION ENGINE 2026
                  </span>
                  <h3 className="text-xl font-bold text-white">النتائج والعوائد المتوقعة للحملة</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                  ROI متوقع: ~{projectedRoi}%
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-2xl bg-[#0B0F1D]/90 border border-gray-800">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                    <span>المشاهدات التقديرية</span>
                    <Eye className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-black text-white font-mono">
                    {(estimatedViews / 1000).toFixed(0)}K+
                  </p>
                  <p className="text-[10px] text-purple-300 mt-0.5">ظهور مستهدف للفئة المحددة</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B0F1D]/90 border border-gray-800">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                    <span>صناع المحتوى المتعاقد معهم</span>
                    <Users className="w-4 h-4 text-pink-400" />
                  </div>
                  <p className="text-2xl font-black text-white font-mono">
                    {estimatedCreators} صناع
                  </p>
                  <p className="text-[10px] text-pink-300 mt-0.5">معتمدين بجواز السفر (Passport)</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B0F1D]/90 border border-gray-800">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                    <span>النقرات والزيارات المتوقعة</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    {estimatedClicks.toLocaleString()}+
                  </p>
                  <p className="text-[10px] text-emerald-300 mt-0.5">معدل تحويل قياسي ~6.5%</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0B0F1D]/90 border border-gray-800">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
                    <span>العائد الإجمالي التقديري</span>
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-400 font-mono">
                    ${projectedGrossRevenue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-amber-300 mt-0.5">بناءً على متوسط مبيعات النيتش</p>
                </div>
              </div>

              {/* Escrow Breakdown Bar */}
              <div className="p-4 rounded-2xl bg-[#090C16] border border-gray-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">تأمين الخزينة المشفرة (Escrow Vault):</span>
                  <span className="text-white font-mono font-bold">${escrowProtectedAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-purple-500 h-full" style={{ width: '92%' }} title="مستحقات صناع المحتوى" />
                  <div className="bg-pink-500 h-full" style={{ width: '8%' }} title="رسوم الضمان 8%" />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>صافي مكافآت الصناع: ${netCreatorPayout.toLocaleString()} (92%)</span>
                  <span>رسوم الضمان والتحكيم: ${platformFee.toLocaleString()} (8%)</span>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="pt-2">
              <button
                onClick={onLaunchCampaign}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-950/60 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>أطلق هذه الحملة فوراً بالضمان المالي</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
