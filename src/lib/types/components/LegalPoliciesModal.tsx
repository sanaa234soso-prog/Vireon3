import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  Scale,
  X,
  CheckCircle2,
  ExternalLink,
  Download,
  Printer,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'licensing' | 'disputes';

interface LegalPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms'
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0A0E1A] border border-[#1E293B] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0D1220]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>السياسات القانونية والاتفاقيات الرسمية</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40 font-mono">
                  نسخة 2026 الرسمية
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                منظومة العقود الرقمية، حماية الملكية الفكرية، وضمانات المعاملات المالية لمنصة VIREON
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111827] text-slate-400 hover:text-white border border-[#1E293B] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1E293B] bg-[#070A14] overflow-x-auto">
          {[
            { id: 'terms', label: 'شروط الاستخدام (Terms of Service)', icon: FileText },
            { id: 'privacy', label: 'سياسة الخصوصية وأمن البيانات (Privacy Policy)', icon: Lock },
            { id: 'licensing', label: 'ترخيص المحتوى التجاري (UGC Licensing)', icon: ShieldCheck },
            { id: 'disputes', label: 'سياسة حل النزاعات والضمان (Disputes & Escrow)', icon: Scale }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PolicyTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                    : 'bg-[#0D1220] text-slate-400 hover:text-slate-200 border border-[#1E293B]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Policy Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar text-slate-300 text-xs sm:text-sm leading-relaxed space-y-6">
          
          {/* TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6 text-right">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 text-purple-200 text-xs">
                <p className="font-bold mb-1">ملخص تنفيذي لاتفاقية الاستخدام:</p>
                <p>تحكم هذه الاتفاقية العلاقة بين منصة VIREON وصناع المحتوى (Sellers) والمشترين/الشركات (Buyers). يضمن النظام حماية حقوق الطرفين عبر بروتوكول الضمان المالي PaySecure Escrow.</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>1. الأهلية وإنشاء الحسابات والتصنيف الفئوي</span>
                </h4>
                <p className="text-slate-400">
                  - يشترط أن يكون عمر المستخدم 18 عاماً فأكثر أو يحمل إذناً تجارياً قانونياً.
                  <br />
                  - يُلزم صناع المحتوى بتقديم بيانات هوية مطابقة (KYC) للحصول على شارة التوثيق المعتمدة (Creator Passport™).
                  <br />
                  - تُطبق المنصة عزلاً صارماً للبيانات؛ فلا يحق لأي حساب الاطلاع على طلبات، لوحات تحكم، أو مراسلات حسابات أخرى.
                  <br />
                  - حسابات البائعين مخصصة لعرض الخدمات واستلام الأرباح فقط وممنوع استخدامها لشراء خدمات بائعين آخرين.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>2. نظام المدفوعات واحتساب العمولات والسحب</span>
                </h4>
                <p className="text-slate-400">
                  - تتم معالجة المدفوعات عبر بوابات مشفرة معتمدة وتُحجز في خزانة الضمان (Escrow Vault).
                  <br />
                  - تقتطع المنصة رسوم وساطة وحماية تبلغ <strong>3% فقط</strong>، ويحصل صانع المحتوى على <strong>97% صافي الأرباح</strong>.
                  <br />
                  - تتم عمليات سحب الأرباح فورياً وبشكل مؤتمت بالكامل دون الحاجة لأي مراجعات يدوية بمجرد طلب الصانع عبر التحويل البنكي أو Whop Direct.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>3. التزامات التسليم وفترة المراجعة (72 ساعة)</span>
                </h4>
                <p className="text-slate-400">
                  - يلتزم البائع بتسليم مخرجات الخدمة والملفات الرقمية بجودتها المتفق عليها عبر قسم "الملفات" أو رابط التسليم المباشر.
                  <br />
                  - يُمنح المشتري مهلة فحص مدتها 72 ساعة من لحظة التسليم لمراجعة العمل، أو طلب التعديل المتفق عليه، أو قبول التسليم وإفراج المبلغ للبائع.
                </p>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 text-right">
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/30 text-indigo-200 text-xs">
                <p className="font-bold mb-1">التزام حماية وخصوصية البيانات:</p>
                <p>تلتزم VIREON بأعلى معايير تشفير البيانات والامتثال لأنظمة حماية البيانات العامة (GDPR) ونظام حماية البيانات الشخصية في المملكة العربية السعودية ودول الخليج (PDPL).</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>1. البيانات التي نجمعها وكيفية معالجتها</span>
                </h4>
                <p className="text-slate-400">
                  - <strong>بيانات التسجيل الأساسية:</strong> البريد الإلكتروني، الاسم، الدولة، واللغة المفضلة.
                  <br />
                  - <strong>بيانات التحقق والتوثيق (KYC):</strong> صور الهوية الشخصية ومستندات العمل ويتم تشفيرها وتخزينها في بيئة آمنة غير متاحة للعامة.
                  <br />
                  - <strong>بيانات المعاملات والمدفوعات:</strong> معرفات العمليات وتواريخ التحويل المشفرة. لا نقوم بتخزين أرقام البطاقات الائتمانية الكاملة على خوادمنا.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>2. أمان التحميلات والملفات الرقمية</span>
                </h4>
                <p className="text-slate-400">
                  - الملفات والمنتجات الرقمية المرفوعة من قبل البائعين تُحفظ بروابط تسليم مشفرة ومحمية، ولا يمكن الوصول إليها إلا من خلال العميل الذي أكمل عملية الشراء بنجاح.
                </p>
              </div>
            </div>
          )}

          {/* CONTENT LICENSING */}
          {activeTab === 'licensing' && (
            <div className="space-y-6 text-right">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-emerald-200 text-xs">
                <p className="font-bold mb-1">اتفاقية ترخيص المحتوى التجاري وحقوق الاستخدام الإعلاني:</p>
                <p>تضمن هذه الاتفاقية نقل الحقوق التجارية الكاملة للمشتري فور تحرير مبلغ الضمان، مع حماية حقوق البائع في عدم إعادة بيع أو استغلال هويته خارج النطاق المتفق عليه.</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>1. نطاق الترخيص الإعلاني (Commercial Ads License)</span>
                </h4>
                <p className="text-slate-400">
                  - يحصل المشتري على ترخيص عالمي غير حصري لاستخدام فيديوهات ومواد UGC المنتجة في حملاته الإعلانية الرقمية (TikTok Ads, Meta Ads, Snapchat Ads, Google Ads).
                  <br />
                  - يشمل الترخيص استخدام كود الترويج (Spark Ads Whitelist Code) للفترة المتفق عليها في تفاصيل الطلب.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>2. حقوق المنتجات الرقمية وحزم البرومبت</span>
                </h4>
                <p className="text-slate-400">
                  - يُمنح مشتري المنتجات الرقمية (كتب إلكترونية، قوالب تصميم، حزم أوامر الذكاء الاصطناعي) ترخيص استخدام شخصي وتجاري لمشاريعه الخاصة.
                  <br />
                  - يُحظر تماماً إعادة توزيع، أو بيع، أو مشاركة الملفات الرقمية الأصلية كمنتجات مستقلة على منصات أخرى.
                </p>
              </div>
            </div>
          )}

          {/* DISPUTES & ESCROW */}
          {activeTab === 'disputes' && (
            <div className="space-y-6 text-right">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-200 text-xs">
                <p className="font-bold mb-1">بروتوكول التحكيم وفض النزاعات المالية:</p>
                <p>نظام تحكيم عادل ومحايد لحماية أموال المشترين ومجهودات صناع المحتوى في حالة حدوث أي اختلاف حول مخرجات العمل.</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>1. مراحل تسوية النزاع الثلاث</span>
                </h4>
                <p className="text-slate-400">
                  - <strong>المرحلة 1 (طلب المراجعة الودية):</strong> يقوم المشتري بتحديد التعديلات المطلوبة بوضوح وفقاً للباقة المشتراة.
                  <br />
                  - <strong>المرحلة 2 (فتح النزاع الرسمي):</strong> في حال عدم التوصل لاتفاق، يتم فتح نزاع رسمي وتجميد المبلغ في خزانة الضمان تلقائياً.
                  <br />
                  - <strong>المرحلة 3 (قرار التحكيم الإداري):</strong> يراجع فريق الامتثال ومراقبة الجودة في VIREON ملفات الطلب والمحادثات لاتخاذ قرار نهائي إما بتحرير المبلغ للبائع أو استرداده للعميل خلال 48 ساعة.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0D1220] flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>وثيقة قانونية سارية وموثقة رقمياً</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1b2336] text-slate-300 hover:text-white text-xs border border-[#1E293B] transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الاتفاقية</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-900/30"
            >
              موافق وإغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
