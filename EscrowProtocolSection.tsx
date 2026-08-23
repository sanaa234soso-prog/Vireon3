import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle,
  FileCheck2,
  Coins,
  Scale,
  Zap,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface EscrowProtocolSectionProps {
  onOpenConnect?: () => void;
  onOpenSupport?: () => void;
}

export const EscrowProtocolSection: React.FC<EscrowProtocolSectionProps> = ({
  onOpenConnect,
  onOpenSupport
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      step: 1,
      title: 'إيداع وضمان الأموال في الخزينة المشفرة',
      subtitle: 'VIREON Vault Escrow Lock',
      description: 'يقوم المشتري أو المعلن بإيداع مبلغ الصفقة في الخزينة المشفرة لمنصة VIREON. يتم تأمين 100% من المبلغ ولا يتم تحويله للطرف الآخر إلا بعد اكتمال العمل بالكامل والموافقة عليه.',
      icon: <Lock className="w-6 h-6 text-purple-400" />,
      tag: 'أمان 100%'
    },
    {
      step: 2,
      title: 'مرحلة التنفيذ وصناعة المحتوى الرقمي',
      subtitle: 'Milestone Production & Tracking',
      description: 'يبدأ صانع المحتوى أو البائع العمل فور التأكد من حجز الأموال في الضمان. يمكن للطرفين التواصل عبر مركز المحادثات المباشر وتتبع مراحل الإنتاج والتعديل.',
      icon: <FileCheck2 className="w-6 h-6 text-pink-400" />,
      tag: 'تتبع لحظي'
    },
    {
      step: 3,
      title: 'المراجعة وفحص الجودة والامتثال الذكي',
      subtitle: 'AI Compliance & Quality Review',
      description: 'يتم رفع المخرجات (فيديو UGC، كود Spark Ads، حزم البرومبت) ومراجعتها. يملك المشتري صلاحية طلب تعديلات أو الموافقة على الاستلام بضغطة زر.',
      icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
      tag: 'فحص جودة'
    },
    {
      step: 4,
      title: 'التحرير الفوري للأرباح والمفاتيح الرقمية',
      subtitle: 'Instant Payout & Key Generation',
      description: 'بمجرد اعتماد المخرجات، يتم تحرير الأرباح تلقائياً إلى المحفظة الرقمية للبائع، مع إصدار فاتورة ضريبية رسمية وتفعيل تراخيص الاستخدام التجاري.',
      icon: <Coins className="w-6 h-6 text-amber-400" />,
      tag: 'دفع فوري'
    }
  ];

  return (
    <section className="py-16 bg-[#070A14] border-b border-gray-800/80 text-right relative overflow-hidden">
      
      {/* Subtle Glow Backdrop */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            VIREON PAYSECURE ESCROW PROTOCOL 2026
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            بروتوكول الضمان المالي المشفر وحماية الصفقات
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light">
            انسَ المخاطر والاحتيال في صفقات صناع المحتوى. نظامنا يضمن حقوق المعلن والمشتري وصانع المحتوى في كل خطوة من بداية الاتفاق وحتى التسليم النهائي.
          </p>
        </div>

        {/* 4 Interactive Protocol Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              onClick={() => setActiveStep(idx)}
              className={`p-6 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                activeStep === idx
                  ? 'bg-gradient-to-b from-[#12182B] to-[#0A0E1A] border-purple-500/80 shadow-xl shadow-purple-950/50 scale-[1.02]'
                  : 'bg-[#090D18]/70 border-gray-800/80 hover:border-gray-700 hover:bg-[#0B1020]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                    activeStep === idx ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    0{s.step}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/50 text-gray-300 border border-gray-800">
                    {s.tag}
                  </span>
                </div>

                <div className="p-3 w-fit rounded-xl bg-gray-900/90 border border-gray-800 mb-3">
                  {s.icon}
                </div>

                <h3 className="text-base font-bold text-white mb-1">{s.title}</h3>
                <p className="text-[11px] font-mono text-purple-400 mb-2">{s.subtitle}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                <span>المرحلة {s.step} من 4</span>
                <div className={`w-2 h-2 rounded-full ${activeStep === idx ? 'bg-emerald-400 animate-ping' : 'bg-gray-700'}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Escrow Guarantee Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#0C1222] to-emerald-950/60 border border-purple-800/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span>مركز التحكيم والنزاعات الذكي</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                  24/7 SUPPORT
                </span>
              </h4>
              <p className="text-xs text-gray-300 mt-1 max-w-xl">
                في حال وجود أي خلاف أو عدم مطابقة للمواصفات، يقوم فريق التحكيم المعتمد بفحص المخرجات والاتفاق، مع إمكانية استرداد كامل المبلغ أو تعديل العمل خلال 24 ساعة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenSupport}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 border border-purple-700/60 text-purple-200 text-xs font-bold transition-all"
            >
              استشارة المساعد الذكي
            </button>
            <button
              onClick={onOpenConnect}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>فحص حالة الضمان</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
