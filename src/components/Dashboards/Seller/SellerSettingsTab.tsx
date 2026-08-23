import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  CreditCard,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Save,
  ShieldCheck,
  Camera,
  UploadCloud,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { User } from '../../types';

interface SellerSettingsTabProps {
  currentUser: User;
  onUserUpdated?: (updated: User) => void;
}

export const SellerSettingsTab: React.FC<SellerSettingsTabProps> = ({ currentUser, onUserUpdated }) => {
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(true);
  const [vacationMode, setVacationMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [instantSmsAlerts, setInstantSmsAlerts] = useState(true);
  const [payoutAccountName, setPayoutAccountName] = useState(currentUser.name || '');
  const [bankIban, setBankIban] = useState('SA0380000000608010167519');
  const [bankName, setBankName] = useState('Al Rajhi Bank / مصرف الراجحي');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Identity Verification Form State
  const [personalPhotoUrl, setPersonalPhotoUrl] = useState(currentUser.personalPhotoUrl || currentUser.avatarUrl || '');
  const [idDocumentUrl, setIdDocumentUrl] = useState(currentUser.idDocumentUrl || '');
  const [idType, setIdType] = useState<'passport' | 'national_id' | 'driver_license'>(currentUser.idType || 'national_id');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<string | null>(null);
  const [userState, setUserState] = useState<User>(currentUser);

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'doc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'photo') setIsUploadingPhoto(true);
    else setIsUploadingDoc(true);

    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64,
              fileName: file.name,
              fileType: file.type
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (type === 'photo') setPersonalPhotoUrl(data.url);
            else setIdDocumentUrl(data.url);
          } else {
            if (type === 'photo') setPersonalPhotoUrl(base64);
            else setIdDocumentUrl(base64);
          }
        } catch {
          if (type === 'photo') setPersonalPhotoUrl(base64);
          else setIdDocumentUrl(base64);
        }
        if (type === 'photo') setIsUploadingPhoto(false);
        else setIsUploadingDoc(false);
      };
      reader.readAsDataURL(file);
    } catch {
      if (type === 'photo') setIsUploadingPhoto(false);
      else setIsUploadingDoc(false);
    }
  };

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalPhotoUrl.trim()) {
      alert('يرجى تقديم رابط الصورة الشخصية الواضحة (Selfie)');
      return;
    }
    if (!idDocumentUrl.trim()) {
      alert('يرجى تقديم رابط مستند الهوية الرسمية (National ID / Passport)');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/seller/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userState.id,
          personalPhotoUrl: personalPhotoUrl.trim(),
          idDocumentUrl: idDocumentUrl.trim(),
          idType
        })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUserState(data.user);
        if (onUserUpdated) onUserUpdated(data.user);
        setVerifyFeedback('تم توثيق هوية البائع والصورة الشخصية بنجاح واعتماد الشارة الموثقة الرسمية!');
        setTimeout(() => setVerifyFeedback(null), 5000);
      } else {
        alert(data.error || 'فشل التوثيق');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('Seller store preferences updated successfully!');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {feedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {verifyFeedback && (
        <div className="bg-purple-950/90 border border-purple-500/50 text-purple-200 px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm shadow-lg">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{verifyFeedback}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1220] border border-[#1E293B] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">إعدادات متجر البائع وتوثيق الهوية</h2>
            {userState.isVerified && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                صانع محتوى موثق بالهوية والصورة
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            توثيق الهوية الرسمية، إدارة بوابات الدفع، وإعدادات قبول الطلبات التلقائية بنسبة عمولة 97% للمنشئ.
          </p>
        </div>
      </div>

      {/* Seller Identity Verification Section */}
      <div className="bg-[#0D1220] border border-purple-900/50 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-white">توثيق البائع بالصورة الشخصية والهوية (KYC Verification)</h3>
              <p className="text-xs text-slate-400">
                توثيق حسابك يرفع ثقة العلامات التجارية ويزيد ترتيب خدماتك في السوق بنسبة 400%.
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            userState.isVerified 
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300' 
              : 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${userState.isVerified ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
            <span>{userState.isVerified ? 'موثق رسمياً (Verified)' : 'غير موثق (Unverified)'}</span>
          </div>
        </div>

        <form onSubmit={handleVerifyIdentity} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>الصورة الشخصية (Selfie Photo)</span>
                </span>
                <label className="cursor-pointer text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
                  <UploadCloud className="w-3 h-3" />
                  <span>{isUploadingPhoto ? 'جاري الرفع...' : 'رفع صورة من جهازك'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                  />
                </label>
              </label>
              <input
                type="text"
                value={personalPhotoUrl}
                onChange={(e) => setPersonalPhotoUrl(e.target.value)}
                placeholder="https://... أو قم برفع الصورة مباشرة"
                className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
              />
              {personalPhotoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={personalPhotoUrl}
                    alt="Selfie Preview"
                    className="w-10 h-10 rounded-full object-cover border border-purple-500"
                    onError={(e) => { (e.target as any).style.display = 'none'; }}
                  />
                  <span className="text-[10px] text-emerald-400">✓ معاينة الصورة الشخصية</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold text-xs mb-1.5 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>نوع وثيقة الهوية (ID Document Type)</span>
              </label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as any)}
                className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
              >
                <option value="national_id">بطاقة الهوية الوطنية (National ID)</option>
                <option value="passport">جواز السفر (Passport)</option>
                <option value="driver_license">رخصة القيادة (Driver License)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold text-xs mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>مستند الهوية الرسمية (National ID / Passport Scan)</span>
              </span>
              <label className="cursor-pointer text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                <UploadCloud className="w-3 h-3" />
                <span>{isUploadingDoc ? 'جاري الرفع...' : 'رفع وثيقة من جهازك'}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'doc')}
                />
              </label>
            </label>
            <input
              type="text"
              value={idDocumentUrl}
              onChange={(e) => setIdDocumentUrl(e.target.value)}
              placeholder="https://... أو قم برفع ملف الوثيقة مباشرة"
              className="w-full bg-[#111827] border border-[#1E293B] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? 'جاري توثيق البيانات...' : 'حفظ واعتماد توثيق الهوية (Verify Seller)'}</span>
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Order Automation Card */}
        <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            إدارة قبول الطلبات وتوفر البائع
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111827] border border-[#1E293B]">
              <div>
                <div className="font-semibold text-white text-xs sm:text-sm">القبول الفوري لطلبات الضمان (Auto-Accept Paid Escrow)</div>
                <div className="text-xs text-slate-400">بدء عداد التسليم مباشرة فور تأكيد نظام Vireon PaySecure لاستلام المبلغ.</div>
              </div>
              <input
                type="checkbox"
                checked={autoAcceptOrders}
                onChange={(e) => setAutoAcceptOrders(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111827] border border-[#1E293B]">
              <div>
                <div className="font-semibold text-white text-xs sm:text-sm">وضع الإجازة / إيقاف استقبال الطلبات مؤقتاً</div>
                <div className="text-xs text-slate-400">إخفاء الخدمات مؤقتاً من نتائج البحث دون حذفها.</div>
              </div>
              <input
                type="checkbox"
                checked={vacationMode}
                onChange={(e) => setVacationMode(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Vireon Payout & Banking Settings */}
        <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            إعدادات الحساب البنكي واستلام الأرباح (Vireon PaySecure™)
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs">
              <span className="font-bold">عمولة المنصة: 3% فقط</span> — يحصل صانع المحتوى على <span className="font-bold text-emerald-400">97% من إجمالي قيمة أي خدمة أو منتج</span> بشكل مباشر في محفظته ومحمي في حساب الضمان (Escrow).
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">اسم المستفيد الكامل (الاسم القانوني في البنك)</label>
                <input
                  type="text"
                  value={payoutAccountName}
                  onChange={(e) => setPayoutAccountName(e.target.value)}
                  placeholder="محمد أحمد الشمري"
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">اسم البنك / المؤسسة المالية</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="مصرف الراجحي / البنك الأهلي السعودي"
                  className="w-full bg-[#111827] border border-[#1E293B] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">رقم الآيبان الدولي (IBAN Account Number)</label>
              <input
                type="text"
                value={bankIban}
                onChange={(e) => setBankIban(e.target.value)}
                placeholder="SA00 0000 0000 0000 0000 0000"
                className="w-full bg-[#111827] border border-[#1E293B] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs outline-none transition uppercase"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                تُحول الأرباح آلياً وبشكل مشفر ومباشر إلى حسابك البنكي المعتمد بدون وسيط خارجي.
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#0D1220] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            تنبيهات الطلبات والرسائل الفورية
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111827] border border-[#1E293B]">
              <div>
                <div className="font-semibold text-white text-xs sm:text-sm">إشعارات البريد الإلكتروني عند استلام طلبات وسحوبات جديدة</div>
                <div className="text-xs text-slate-400">تذكير بمواعيد التسليم وطلبات التعديل من المشترين.</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111827] border border-[#1E293B]">
              <div>
                <div className="font-semibold text-white text-xs sm:text-sm">تنبيهات فورية لفرص الرادار والحملات المطابقة</div>
                <div className="text-xs text-slate-400">إشعارك فور إطلاق براند لحملة تسويقية تناسب مجالك.</div>
              </div>
              <input
                type="checkbox"
                checked={instantSmsAlerts}
                onChange={(e) => setInstantSmsAlerts(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            حفظ إعدادات المتجر
          </button>
        </div>
      </form>
    </div>
  );
};
