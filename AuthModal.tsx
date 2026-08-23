import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  User as UserIcon,
  RefreshCw,
  AlertCircle,
  Clock,
  KeyRound,
  Check,
  BadgeCheck,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Globe,
  Lock,
  ChevronRight
} from 'lucide-react';
import { User, UserRole } from '../types';
import { validateEmailAddress } from '../lib/emailValidator';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  currentUser?: User;
}

type AuthStep = 'account' | 'role' | 'otp';
type Language = 'en' | 'ar';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [tab, setTab] = useState<'signup' | 'signin'>('signup');
  const [currentStep, setCurrentStep] = useState<AuthStep>('account');
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successBadge, setSuccessBadge] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);
  
  // Realtime email validation state
  const [emailValidationNote, setEmailValidationNote] = useState<{ isDisposable?: boolean; error?: string; isValid?: boolean } | null>(null);

  // Resend Countdown Timer (60s)
  const [resendCountdown, setResendCountdown] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Translations dictionary for bilingual support (EN primary, AR switchable)
  const t = {
    en: {
      createAccountTitle: 'Create your VIREON account',
      signInTitle: 'Welcome back to VIREON',
      createAccountSub: 'Join the premier marketplace for creators, brands, and buyers.',
      signInSub: 'Access your projects, escrow balances, and conversations.',
      tabSignUp: 'Sign Up',
      tabSignIn: 'Sign In',
      stepAccount: 'Account',
      stepRole: 'Role',
      stepVerification: 'Verification',
      fullNameLabel: 'Full Legal Name',
      fullNamePlaceholder: 'e.g. Alex Morgan',
      fullNameRequired: 'Full name is required (min 2 characters)',
      emailLabel: 'Work or Personal Email',
      emailPlaceholder: 'name@company.com or name@gmail.com',
      emailValidText: 'Valid business or personal email',
      disposableWarning: 'Disposable email addresses are not allowed for security.',
      chooseRoleTitle: 'How will you use VIREON?',
      chooseRoleSub: 'Select the primary account type for your workflow.',
      roleBuyerTitle: 'I am a Client / Buyer',
      roleBuyerDesc: 'Hire vetted creators, commission custom content, and license premium digital assets with escrow protection.',
      roleCreatorTitle: 'I am a Creator / Seller',
      roleCreatorDesc: 'Monetize creative services, publish digital products, and accept brand sponsorships with zero commission hold.',
      roleBrandTitle: 'I am an Agency / Brand',
      roleBrandDesc: 'Scale multi-creator influencer campaigns, manage team rosters, and execute verified enterprise contracts.',
      continueBtn: 'Continue',
      sendOtpBtn: 'Send Secure Verification Code',
      sendingCode: 'Sending verification code...',
      otpScreenTitle: 'Enter verification code',
      otpScreenSub: 'We sent a 6-digit security code to',
      otpInputLabel: '6-digit verification code',
      verifyBtn: 'Verify & Activate Account',
      verifying: 'Verifying code...',
      resendIn: 'Resend code in',
      resendNow: 'Resend verification code',
      changeEmail: 'Change email',
      verifiedSuccessTitle: 'Email Verified Successfully',
      verifiedSuccessSub: 'Your identity has been verified. Redirecting to your dashboard...',
      verifiedBadge: 'Verified Account',
      securityFootnote: 'Protected by VIREON Escrow & Bank-Grade Security Protocol',
      socialOr: 'or continue with email',
      googleBtn: 'Continue with Google',
      appleBtn: 'Continue with Apple',
      termsNotice: 'By continuing, you agree to VIREON Terms of Service and Privacy Policy.'
    },
    ar: {
      createAccountTitle: 'إنشاء حساب جديد في VIREON',
      signInTitle: 'تسجيل الدخول إلى VIREON',
      createAccountSub: 'انضم إلى المنصة العالمية الرائدة لصناع المحتوى والشركات والمشترين.',
      signInSub: 'تابع مشاريعك، أرصدة الضمان المالي ومحادثاتك.',
      tabSignUp: 'حساب جديد',
      tabSignIn: 'تسجيل الدخول',
      stepAccount: 'البيانات',
      stepRole: 'نوع الحساب',
      stepVerification: 'التحقق',
      fullNameLabel: 'الاسم الكامل',
      fullNamePlaceholder: 'مثال: سناء العفولة / Alex Morgan',
      fullNameRequired: 'الاسم الكامل مطلوب (لا يقل عن حرفين)',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'name@gmail.com أو بريدك المهني',
      emailValidText: 'بريد إلكتروني صالح ومقبول للتحقق الأمني',
      disposableWarning: 'عناوين البريد المؤقتة غير مقبولة لحماية الحسابات.',
      chooseRoleTitle: 'كيف ستستخدم منصة VIREON؟',
      chooseRoleSub: 'اختر نوع الحساب الأنسب لنشاطك وأهدافك.',
      roleBuyerTitle: 'أنا عميل / مشتري (Client)',
      roleBuyerDesc: 'توظيف أفضل صناع المحتوى، طلب خدمات حصرية وشراء منتجات رقمية مع حماية الضمان المالي (Escrow).',
      roleCreatorTitle: 'أنا صانع محتوى / بائع (Creator)',
      roleCreatorDesc: 'بيع الخدمات والمنتجات الرقمية، استقبال صفقات الرعاية، واستلام أرباحك فوراً بدون تعقيد.',
      roleBrandTitle: 'أنا وكالة / علامة تجارية (Agency / Brand)',
      roleBrandDesc: 'إدارة حملات تسويقية واسعة النطاق، التعاقد مع مواهب متعددة وأدوات تحليلات متقدمة.',
      continueBtn: 'المتابعة',
      sendOtpBtn: 'إرسال رمز التحقق الأمني',
      sendingCode: 'جاري إرسال رمز التحقق...',
      otpScreenTitle: 'أدخل رمز التحقق الأمني',
      otpScreenSub: 'أرسلنا رمز أمان مكوّن من 6 أرقام إلى',
      otpInputLabel: 'رمز التحقق المكوّن من 6 أرقام',
      verifyBtn: 'تأكيد وتفعيل الحساب',
      verifying: 'جاري التحقق من الرمز...',
      resendIn: 'إعادة الإرسال خلال',
      resendNow: 'إعادة إرسال رمز جديد',
      changeEmail: 'تعديل البريد',
      verifiedSuccessTitle: 'تم التحقق من البريد بنجاح',
      verifiedSuccessSub: 'تم تفعيل حسابك الرسمي وجاري نقلك إلى لوحة التحكم الخاصة بك...',
      verifiedBadge: 'حساب موثق رسميًا (Verified)',
      securityFootnote: 'محمي بنظام الضمان المالي والتشفير الأمني المعتمد لمنصة VIREON',
      socialOr: 'أو المتابعة عبر البريد الإلكتروني',
      googleBtn: 'المتابعة باستخدام Google',
      appleBtn: 'المتابعة باستخدام Apple',
      termsNotice: 'بمتابعتك، أنت توافق على شروط خدمة VIREON وسياسة الخصوصية.'
    }
  }[lang];

  const isRtl = lang === 'ar';

  useEffect(() => {
    if (currentStep === 'otp') {
      setResendCountdown(60);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep]);

  if (!isOpen) return null;

  // Realtime email checking
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setErrorMessage('');
    if (val.trim().length > 3 && val.includes('@')) {
      const res = validateEmailAddress(val);
      if (!res.isValid) {
        setEmailValidationNote({ isDisposable: res.isDisposable, error: res.error, isValid: false });
      } else {
        setEmailValidationNote({ isValid: true });
      }
    } else {
      setEmailValidationNote(null);
    }
  };

  // Step 1 -> Step 2 validation
  const handleProceedFromAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (tab === 'signup' && (!fullName || fullName.trim().length < 2)) {
      setErrorMessage(t.fullNameRequired);
      return;
    }

    const validation = validateEmailAddress(email);
    if (!validation.isValid) {
      setErrorMessage(validation.error || t.disposableWarning);
      return;
    }

    if (tab === 'signup') {
      setCurrentStep('role');
    } else {
      // In sign in mode, proceed directly to sending OTP
      handleSendOtp();
    }
  };

  // Trigger real OTP dispatch
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const validation = validateEmailAddress(email);
    if (!validation.isValid) {
      setErrorMessage(validation.error || t.disposableWarning);
      return;
    }

    setIsLoading(true);

    try {
      const resolvedName = fullName.trim() || email.split('@')[0];
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          fullName: resolvedName,
          role: selectedRole
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || (lang === 'ar' ? 'تعذر إرسال رمز التحقق. يرجى المحاولة مرة أخرى.' : 'Unable to send verification code. Please try again.'));
      }

      setCurrentStep('otp');
      setOtpCode(['', '', '', '', '', '']);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === 'ar' ? 'حدث خطأ أثناء إرسال رمز التحقق.' : 'An error occurred while sending verification code.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Google Direct Sign-In Handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const googleEmail = (email.trim() || 'sanaafola8@gmail.com').toLowerCase();
      const resolvedName = fullName.trim() || (googleEmail.includes('@') ? googleEmail.split('@')[0] : 'Sanaa');

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmail,
          fullName: resolvedName,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (lang === 'ar' ? 'فشل تسجيل الدخول بحساب Google' : 'Google sign-in failed'));
      }

      const verifiedUserData: User = data.user;
      setVerifiedUser(verifiedUserData);
      setSuccessBadge(true);

      if (data.token) {
        localStorage.setItem('vireon_token', data.token);
      }
      localStorage.setItem('vireon_current_user', JSON.stringify(verifiedUserData));

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(verifiedUserData);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || (lang === 'ar' ? 'تعذر إتمام تسجيل الدخول باستخدام Google' : 'Google sign-in could not be completed'));
    }
  };

  // Step 3: Verify 6-digit OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entered = otpCode.join('').trim();

    if (entered.length < 6) {
      setErrorMessage(lang === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام بالكامل' : 'Please enter the complete 6-digit verification code');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: entered,
          fullName: fullName.trim() || undefined,
          role: selectedRole
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || (lang === 'ar' ? 'رمز التحقق غير صحيح أو انتهت صلاحيته' : 'Invalid or expired verification code'));
      }

      const verifiedUserData: User = data.user;
      setVerifiedUser(verifiedUserData);
      setSuccessBadge(true);

      // Save token & user in local storage
      if (data.token) {
        localStorage.setItem('vireon_token', data.token);
      }
      localStorage.setItem('vireon_current_user', JSON.stringify(verifiedUserData));

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(verifiedUserData);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || (lang === 'ar' ? 'فشل التحقق من رمز OTP' : 'Verification failed. Please check the code.'));
    }
  };

  // OTP Input handler with auto-advance and paste splitting
  const handleOtpInput = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    const newOtp = [...otpCode];

    // Handle full pasted code (e.g. "839201")
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpCode(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtpCode(newOtp);

    // Auto advance
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const digits = pastedData.split('');
      const newOtp = ['', '', '', '', '', ''];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpCode(newOtp);
      const nextIdx = Math.min(digits.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
    }
  };

  // Mock social sign-in focus (seamless UX)
  const handleSocialClick = (provider: string) => {
    setErrorMessage(
      lang === 'ar'
        ? `تسجيل الدخول المباشر بالبريد هو الأكثر أماناً وحماية لحسابات VIREON. يرجى إدخال بريد ${provider} الخاص بك للمتابعة.`
        : `Email-based OTP authentication is the primary secure gateway for VIREON. Please enter your ${provider} address below to continue.`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      dir={isRtl ? 'rtl' : 'ltr'}
      id="vireon-auth-modal"
    >
      <div className="relative w-full max-w-lg bg-[#0B0F19] border border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden my-4 text-zinc-100 flex flex-col transition-all">
        
        {/* Top Minimal Global Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 bg-[#0E1322]/80 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">VIREON</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Global
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Creator Marketplace & Escrow</p>
            </div>
          </div>

          {/* Controls: Language Switcher & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg border border-zinc-700/60 transition-colors flex items-center gap-1.5"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Indicator (For Sign Up) */}
        {!successBadge && tab === 'signup' && (
          <div className="px-6 pt-4 pb-2 bg-[#0B0F19] border-b border-zinc-850">
            <div className="flex items-center justify-between text-xs font-medium">
              
              {/* Step 1: Account */}
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === 'account' 
                    ? 'bg-purple-600 text-white ring-2 ring-purple-500/30' 
                    : (currentStep === 'role' || currentStep === 'otp')
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {(currentStep === 'role' || currentStep === 'otp') ? <Check className="w-3 h-3" /> : '1'}
                </span>
                <span className={currentStep === 'account' ? 'text-white font-semibold' : 'text-zinc-400'}>
                  {t.stepAccount}
                </span>
              </div>

              <div className={`flex-1 mx-3 h-0.5 rounded-full ${
                (currentStep === 'role' || currentStep === 'otp') ? 'bg-emerald-600' : 'bg-zinc-800'
              }`} />

              {/* Step 2: Role */}
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === 'role' 
                    ? 'bg-purple-600 text-white ring-2 ring-purple-500/30' 
                    : currentStep === 'otp'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {currentStep === 'otp' ? <Check className="w-3 h-3" /> : '2'}
                </span>
                <span className={currentStep === 'role' ? 'text-white font-semibold' : 'text-zinc-400'}>
                  {t.stepRole}
                </span>
              </div>

              <div className={`flex-1 mx-3 h-0.5 rounded-full ${
                currentStep === 'otp' ? 'bg-purple-600' : 'bg-zinc-800'
              }`} />

              {/* Step 3: Verification */}
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === 'otp' 
                    ? 'bg-purple-600 text-white ring-2 ring-purple-500/30' 
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  3
                </span>
                <span className={currentStep === 'otp' ? 'text-white font-semibold' : 'text-zinc-400'}>
                  {t.stepVerification}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5">

          {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
          {currentStep === 'account' && !successBadge && (
            <div className="flex bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => { setTab('signup'); setErrorMessage(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === 'signup'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.tabSignUp}
              </button>
              <button
                type="button"
                onClick={() => { setTab('signin'); setErrorMessage(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === 'signin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.tabSignIn}
              </button>
            </div>
          )}

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUCCESS SCREEN: Email Verified Badge                     */}
          {/* ======================================================== */}
          {successBadge ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs font-bold">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.verifiedBadge}</span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  {t.verifiedSuccessTitle}
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  {t.verifiedSuccessSub}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.fullNameLabel}:</span>
                  <span className="font-semibold text-white">{verifiedUser?.fullName || fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">{t.emailLabel}:</span>
                  <span className="font-mono text-purple-300">{verifiedUser?.email || email}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* STEP 1: Account Details (Email & Full Name)              */}
              {/* ======================================================== */}
              {currentStep === 'account' && (
                <form onSubmit={handleProceedFromAccount} className="space-y-4">
                  
                  {/* Headline & Subtitle */}
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {tab === 'signup' ? t.createAccountTitle : t.signInTitle}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {tab === 'signup' ? t.createAccountSub : t.signInSub}
                    </p>
                  </div>

                  {/* Social Buttons (Upwork style clean social auth) */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition-colors shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"/>
                        <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSocialClick('Apple')}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.7-0.94 2.73 1.01.08 2.03-.48 2.65-1.23"/>
                      </svg>
                      <span>Apple</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-zinc-800 w-full" />
                    <span className="bg-[#0B0F19] px-3 text-[11px] text-zinc-500 font-medium whitespace-nowrap">
                      {t.socialOr}
                    </span>
                  </div>

                  {/* 1. Full Name (Required for Sign Up) */}
                  {tab === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">
                        {t.fullNameLabel} <span className="text-purple-400">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <UserIcon className="w-4 h-4 text-zinc-500 absolute start-3.5 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder={t.fullNamePlaceholder}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl py-2.5 ps-10 pe-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* 2. Email Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      {t.emailLabel} <span className="text-purple-400">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-zinc-500 absolute start-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => handleEmailChange(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className={`w-full bg-zinc-900 border rounded-xl py-2.5 ps-10 pe-4 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all ${
                          emailValidationNote?.isDisposable
                            ? 'border-red-600 focus:ring-1 focus:ring-red-500'
                            : emailValidationNote?.isValid
                            ? 'border-emerald-600/70 focus:ring-1 focus:ring-emerald-500'
                            : 'border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        }`}
                      />
                    </div>

                    {/* Email Realtime Helper */}
                    {emailValidationNote?.isDisposable && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{emailValidationNote.error}</span>
                      </p>
                    )}
                    {emailValidationNote?.isValid && (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" />
                        <span>{t.emailValidText}</span>
                      </p>
                    )}
                  </div>

                  {/* Next Step Button */}
                  <button
                    type="submit"
                    disabled={isLoading || (tab === 'signup' && !fullName.trim()) || !email.trim() || emailValidationNote?.isDisposable}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-900/30"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{t.sendingCode}</span>
                      </>
                    ) : (
                      <>
                        <span>{tab === 'signup' ? t.continueBtn : t.sendOtpBtn}</span>
                        {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-zinc-500 text-center leading-relaxed">
                    {t.termsNotice}
                  </p>
                </form>
              )}

              {/* ======================================================== */}
              {/* STEP 2: Role Selection (Buyer / Creator / Brand)         */}
              {/* ======================================================== */}
              {currentStep === 'role' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {t.chooseRoleTitle}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {t.chooseRoleSub}
                    </p>
                  </div>

                  {/* 3 Interactive Upwork-Style Role Cards */}
                  <div className="space-y-2.5">
                    
                    {/* Role 1: Customer / Buyer */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('customer')}
                      className={`w-full p-4 rounded-xl border text-start transition-all flex items-start gap-3.5 ${
                        selectedRole === 'customer'
                          ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${
                        selectedRole === 'customer' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{t.roleBuyerTitle}</h4>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedRole === 'customer' ? 'border-purple-500 bg-purple-600' : 'border-zinc-700'
                          }`}>
                            {selectedRole === 'customer' && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          {t.roleBuyerDesc}
                        </p>
                      </div>
                    </button>

                    {/* Role 2: Creator / Seller */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('creator')}
                      className={`w-full p-4 rounded-xl border text-start transition-all flex items-start gap-3.5 ${
                        selectedRole === 'creator'
                          ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${
                        selectedRole === 'creator' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{t.roleCreatorTitle}</h4>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedRole === 'creator' ? 'border-purple-500 bg-purple-600' : 'border-zinc-700'
                          }`}>
                            {selectedRole === 'creator' && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          {t.roleCreatorDesc}
                        </p>
                      </div>
                    </button>

                    {/* Role 3: Brand / Agency */}
                    <button
                      type="button"
                      onClick={() => setSelectedRole('brand')}
                      className={`w-full p-4 rounded-xl border text-start transition-all flex items-start gap-3.5 ${
                        selectedRole === 'brand'
                          ? 'bg-purple-950/30 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${
                        selectedRole === 'brand' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{t.roleBrandTitle}</h4>
                          <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedRole === 'brand' ? 'border-purple-500 bg-purple-600' : 'border-zinc-700'
                          }`}>
                            {selectedRole === 'brand' && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          {t.roleBrandDesc}
                        </p>
                      </div>
                    </button>

                  </div>

                  {/* Permanent Account Role Security Notice */}
                  <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/40 flex items-start gap-2.5 text-[11px] text-purple-300">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>
                      {isRtl
                        ? 'تنبيه: نوع الحساب يُحدد بشكل دائم عند التسجيل ولا يمكن تغييره لاحقاً لضمان أمان الصفقات والعقود.'
                        : 'Note: Account type is permanently assigned upon registration and cannot be changed later.'}
                    </span>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('account')}
                      className="py-2.5 px-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 text-xs font-semibold transition-colors"
                    >
                      {isRtl ? '→ رجوع' : '← Back'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isLoading}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-900/30"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t.sendingCode}</span>
                        </>
                      ) : (
                        <>
                          <span>{t.sendOtpBtn}</span>
                          {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* STEP 3: 6-Digit Real OTP Verification Screen            */}
              {/* ======================================================== */}
              {currentStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  
                  {/* Status Banner */}
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      {t.otpScreenTitle}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {t.otpScreenSub}{' '}
                      <span className="font-mono font-semibold text-purple-300">{email}</span>
                    </p>
                  </div>

                  {/* 6 Digits Inputs Grid */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300 text-center">
                      {t.otpInputLabel}
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-2.5" dir="ltr">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => { otpInputRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpInput(idx, e.target.value)}
                          onKeyDown={e => handleKeyDown(idx, e)}
                          onPaste={handlePaste}
                          className="w-11 h-12 sm:w-12 sm:h-13 text-center text-xl font-bold font-mono bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:bg-zinc-850 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                        />
                      ))}
                    </div>

                    <p className="text-[11px] text-zinc-500 text-center pt-1">
                      {isRtl
                        ? 'يرجى مراجعة صندوق الوارد ومجلد الرسائل غير المرغوب فيها (Spam / Junk)'
                        : 'Please check your Inbox and Spam / Junk folders if delayed'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || otpCode.join('').length < 6}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-950"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t.verifying}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t.verifyBtn}</span>
                        </>
                      )}
                    </button>

                    {/* Resend & Change Email Row */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                      <button
                        type="button"
                        onClick={() => { setCurrentStep('account'); setErrorMessage(''); }}
                        className="hover:text-white transition-colors"
                      >
                        {isRtl ? '→ ' + t.changeEmail : '← ' + t.changeEmail}
                      </button>

                      {resendCountdown > 0 ? (
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{t.resendIn} {resendCountdown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                        >
                          {t.resendNow}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Footer Security Badges - 100% Brand Shield Only */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.securityFootnote}</span>
            </span>
            <span className="font-mono text-[10px] text-zinc-600">VIREON v2.4</span>
          </div>

        </div>

      </div>
    </div>
  );
};
