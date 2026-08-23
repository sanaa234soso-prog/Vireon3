import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  Globe,
  Mail,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Layers,
  Heart,
  Scale,
  FileText
} from 'lucide-react';
import { LegalPoliciesModal, PolicyTab } from '../LegalPoliciesModal';

interface WebsiteFooterProps {
  onOpenRadar: () => void;
  onOpenMatch: () => void;
  onOpenCampaignWizard: () => void;
  onOpenAiSupport: () => void;
  onOpenAuthModal: () => void;
  onOpenEscrowInfo: () => void;
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({
  onOpenRadar,
  onOpenMatch,
  onOpenCampaignWizard,
  onOpenAiSupport,
  onOpenAuthModal,
  onOpenEscrowInfo
}) => {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<PolicyTab>('terms');

  const openLegalPolicy = (tab: PolicyTab) => {
    setActiveLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <footer className="bg-[#04060C] border-t border-gray-800/80 text-gray-400 text-right text-xs">
      
      {/* Newsletter & Trust Bar */}
      <div className="border-b border-gray-800/80 bg-[#060814]/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-right">
            <h4 className="text-base font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>انضم إلى النشرة البريدية لاقتصاد صناع المحتوى 2026</span>
            </h4>
            <p className="text-xs text-gray-400">
              تلقَّ أحدث تقارير الصفقات، الفرص التسويقية الأعلى عائداً، وتحديثات بروتوكول الضمان أسبوعياً.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto max-w-md">
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني (Gmail / Work)..."
              className="w-full bg-[#0D1224] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => alert('تم الاشتراك بنجاح في نشرة VIREON 2026!')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition-all shadow-md shadow-purple-900/30"
            >
              اشتراك
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-pink-500 p-0.5 shadow-lg shadow-purple-900/40">
                <div className="w-full h-full bg-[#080B14] rounded-[14px] flex items-center justify-center">
                  <span className="text-xl font-black tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                    V
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white font-sans">
                  VIREON
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 mr-2">
                  MARKETPLACE 2026
                </span>
                <p className="text-[11px] text-gray-400">The Next-Gen Creator Economy Web Platform</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              المنصة المتكاملة الأولى لربط صناع المحتوى المعتمدين مع الشركات والمسوقين لتنفيذ حملات UGC والمنتجات الرقمية بنظام الضمان المالي المشفر.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit Escrow Vault</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>SOC-2 Verified</span>
              </div>
            </div>
          </div>

          {/* Col 2: السوق والخدمات */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm">السوق والخدمات</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenRadar} className="hover:text-purple-300 transition-colors">
                  📡 رادار الفرص (Opportunity Radar)
                </button>
              </li>
              <li>
                <button onClick={onOpenMatch} className="hover:text-purple-300 transition-colors">
                  ✨ مطابقة الذكاء الاصطناعي
                </button>
              </li>
              <li>
                <button onClick={onOpenCampaignWizard} className="hover:text-purple-300 transition-colors">
                  📢 إطلاق حملات المعلنين
                </button>
              </li>
              <li>
                <button onClick={() => openLegalPolicy('licensing')} className="hover:text-purple-300 transition-colors">
                  🎬 تراخيص فيديوهات UGC
                </button>
              </li>
              <li>
                <button onClick={() => openLegalPolicy('terms')} className="hover:text-purple-300 transition-colors">
                  📦 حزم المنتجات الرقمية والـ Prompts
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: الأمان والضمان */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm">الأمان والضمان</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenEscrowInfo} className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>بروتوكول VIREON PaySecure</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenAuthModal} className="hover:text-purple-300 transition-colors">
                  🔐 توثيق الحسابات بـ Google
                </button>
              </li>
              <li>
                <button onClick={() => openLegalPolicy('disputes')} className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <Scale className="w-3 h-3 text-amber-400" />
                  <span>⚖️ سياسة حل النزاعات والتحكيم</span>
                </button>
              </li>
              <li>
                <button onClick={() => openLegalPolicy('licensing')} className="hover:text-purple-300 transition-colors">
                  📜 اتفاقية ترخيص المحتوى التجاري
                </button>
              </li>
              <li>
                <button onClick={onOpenEscrowInfo} className="hover:text-emerald-300 transition-colors">
                  🛡️ صندوق حماية المشتري والبائع (3% رسوم)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: الدعم والمنصة */}
          <div className="space-y-3">
            <h5 className="text-white font-bold text-sm">الدعم والمنظومة</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenAiSupport} className="hover:text-purple-300 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>المساعد الذكي 24/7 (AI Concierge)</span>
                </button>
              </li>
              <li>
                <button onClick={() => openLegalPolicy('privacy')} className="hover:text-purple-300 transition-colors">
                  🔒 خصوصية وأمان بيانات المستخدمين
                </button>
              </li>
              <li>
                <button onClick={() => openLegalPolicy('terms')} className="hover:text-purple-300 transition-colors">
                  🌐 شروط التداول والعملات المعتمدة
                </button>
              </li>
              <li>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>جميع الأنظمة تعمل بكفاءة 99.99%</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright & Sub-footer */}
        <div className="mt-12 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© 2026 VIREON Platform Inc. جميع الحقوق محفوظة لمنظومة اقتصاد صناع المحتوى.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => openLegalPolicy('terms')} className="hover:text-gray-300 transition cursor-pointer">
              شروط الاستخدام
            </button>
            <button onClick={() => openLegalPolicy('privacy')} className="hover:text-gray-300 transition cursor-pointer">
              سياسة الخصوصية
            </button>
            <button onClick={() => openLegalPolicy('licensing')} className="hover:text-gray-300 transition cursor-pointer">
              تراخيص المحتوى
            </button>
            <button onClick={() => openLegalPolicy('disputes')} className="hover:text-gray-300 transition cursor-pointer">
              فض النزاعات
            </button>
            <span className="font-mono text-purple-400">v3.4.0 (2026 Web Edition)</span>
          </div>
        </div>

      </div>

      {/* Interactive Legal Policies Modal */}
      <LegalPoliciesModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={activeLegalTab}
      />
    </footer>
  );
};
