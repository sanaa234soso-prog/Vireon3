import crypto from 'crypto';
import { UserRole } from '../types';
import { emailService } from './emailService';
import { validateEmailAddress } from './emailValidator';

export interface OtpRecord {
  email: string;
  code: string;
  fullName: string;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  isVerified: boolean;
}

export interface SendOtpResult {
  success: boolean;
  email: string;
  message?: string;
  error?: string;
  expiresInSeconds?: number;
  emailDispatched?: boolean;
  driverUsed?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    email: string;
    fullName: string;
    role: UserRole;
    isVerified: boolean;
    emailVerified: boolean;
    emailVerifiedAt: string;
  };
}

class OtpService {
  private otps: Map<string, OtpRecord> = new Map();
  private readonly OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes validity
  private readonly MAX_ATTEMPTS = 5;

  constructor() {
    // Run garbage collection on expired OTPs every 2 minutes
    setInterval(() => this.cleanupExpiredOtps(), 2 * 60 * 1000);
  }

  /**
   * Request real OTP verification code sent to user's real email
   */
  public async sendOtp(params: {
    email: string;
    fullName: string;
    role?: UserRole;
  }): Promise<SendOtpResult> {
    const { fullName, role = 'customer' } = params;
    const cleanEmail = (params.email || '').trim().toLowerCase();

    // 1. Mandatory Full Name Check
    if (!fullName || fullName.trim().length < 2) {
      return {
        success: false,
        email: cleanEmail,
        error: 'الاسم الكامل مطلوب ولا يقل عن حرفين (Full Name is required)'
      };
    }

    // 2. Email Validation & Disposable Domain Blocking
    const emailValidation = validateEmailAddress(cleanEmail);
    if (!emailValidation.isValid) {
      return {
        success: false,
        email: cleanEmail,
        error: emailValidation.error || 'البريد الإلكتروني غير صالح أو غير مسموح به'
      };
    }

    // 3. Rate Limit / Cooldown check (prevent spamming within 10 seconds)
    const existing = this.otps.get(cleanEmail);
    const now = Date.now();
    if (existing && now - existing.createdAt < 10000) {
      const waitSeconds = Math.ceil((10000 - (now - existing.createdAt)) / 1000);
      return {
        success: false,
        email: cleanEmail,
        error: `يرجى الانتظار ${waitSeconds} ثانية قبل طلب رمز تحقق جديد (Cooldown active)`
      };
    }

    // 4. Generate Cryptographically Secure 6-Digit Code
    const codeNumber = crypto.randomInt(100000, 999999);
    const code = codeNumber.toString();

    // 5. Store in memory with strict expiry and zero attempts
    const record: OtpRecord = {
      email: cleanEmail,
      code,
      fullName: fullName.trim(),
      role,
      createdAt: now,
      expiresAt: now + this.OTP_TTL_MS,
      attempts: 0,
      isVerified: false
    };

    this.otps.set(cleanEmail, record);

    const officialSender = emailService.getOfficialSender();
    console.log(`[OTP Engine] Secure 6-digit OTP generated and dispatched for ${cleanEmail}. Official Sender: ${officialSender}`);

    // 6. Send Real Email via Google/SMTP or Supabase dispatch service
    const emailResult = await emailService.sendOtpEmail({
      to: cleanEmail,
      fullName: fullName.trim(),
      otpCode: code,
      expiresInMinutes: 10
    });

    if (!emailResult.success) {
      console.error(`[OTP Engine] Failed to dispatch OTP to ${cleanEmail}:`, emailResult.error);
      return {
        success: false,
        email: cleanEmail,
        error: emailResult.error || 'تعذر إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى التحقق من إعدادات البريد.',
        driverUsed: emailResult.driverUsed
      };
    }

    return {
      success: true,
      email: cleanEmail,
      message: `تم إرسال رمز التحقق الأمني المكون من 6 أرقام إلى بريدك (${cleanEmail}) بنجاح.`,
      expiresInSeconds: 600,
      emailDispatched: true,
      driverUsed: emailResult.driverUsed
    };
  }

  /**
   * Verify entered OTP code strictly against the stored cryptographic code or Supabase Auth
   */
  public async verifyOtp(params: {
    email: string;
    code: string;
    fullName?: string;
  }): Promise<VerifyOtpResult> {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const cleanCode = (params.code || '').trim();

    if (!cleanEmail || !cleanCode) {
      return {
        success: false,
        error: 'البريد الإلكتروني ورمز التحقق مطلوبان'
      };
    }

    const record = this.otps.get(cleanEmail);
    const now = Date.now();

    // 1. Check local OTP record
    if (record) {
      // Check expiration (10 minutes)
      if (now > record.expiresAt) {
        this.otps.delete(cleanEmail);
        return {
          success: false,
          error: 'انتهت صلاحية رمز التحقق (أكثر من 10 دقائق). يرجى طلب رمز جديد.'
        };
      }

      // Check max attempts (Max 5 attempts)
      if (record.attempts >= this.MAX_ATTEMPTS) {
        this.otps.delete(cleanEmail);
        return {
          success: false,
          error: 'تم تجاوز الحد الأقصى لمحاولات الإدخال (5 محاولات). تم إلغاء الرمز لأسباب أمنية.'
        };
      }

      // Strict Match
      if (record.code === cleanCode) {
        record.isVerified = true;
        this.otps.delete(cleanEmail);

        console.log(`[OTP Engine] Email ownership verified successfully for ${cleanEmail} via internal store`);

        return {
          success: true,
          message: 'تم التحقق من ملكية البريد الإلكتروني وتفعيل الحساب بنجاح (Email Verified)',
          user: {
            email: cleanEmail,
            fullName: params.fullName?.trim() || record.fullName,
            role: record.role,
            isVerified: true,
            emailVerified: true,
            emailVerifiedAt: new Date().toISOString()
          }
        };
      } else {
        record.attempts += 1;
      }
    }

    // 2. Fallback: Check Supabase Auth verify if Supabase is active
    const supabase = emailService.getSupabaseConfig();
    if (supabase) {
      try {
        console.log(`[OTP Engine] Verifying token against Supabase Auth for ${cleanEmail}...`);
        
        const types = ['email', 'signup', 'magiclink', 'recovery'];
        for (const type of types) {
          try {
            const sbRes = await fetch(`${supabase.url}/auth/v1/verify`, {
              method: 'POST',
              headers: {
                'apikey': supabase.anonKey,
                'Authorization': `Bearer ${supabase.anonKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type,
                email: cleanEmail,
                token: cleanCode
              })
            });

            if (sbRes.ok) {
              if (record) this.otps.delete(cleanEmail);
              console.log(`[OTP Engine] Email ownership verified successfully via Supabase Auth (${type}) for ${cleanEmail}`);
              return {
                success: true,
                message: 'تم التحقق من ملكية البريد الإلكتروني وتفعيل الحساب بنجاح (Email Verified via Supabase)',
                user: {
                  email: cleanEmail,
                  fullName: params.fullName?.trim() || record?.fullName || 'User',
                  role: record?.role || 'customer',
                  isVerified: true,
                  emailVerified: true,
                  emailVerifiedAt: new Date().toISOString()
                }
              };
            }
          } catch {
            // continue to next type
          }
        }
      } catch (err: any) {
        console.error('[OTP Engine] Supabase verify error:', err.message);
      }
    }

    if (record) {
      const remaining = this.MAX_ATTEMPTS - record.attempts;
      return {
        success: false,
        error: `رمز التحقق غير صحيح. متبقي لديك ${remaining} محاولات قبل إلغاء الرمز.`
      };
    }

    return {
      success: false,
      error: 'رمز التحقق غير صحيح أو انتهت صلاحيته. يرجى طلب رمز جديد.'
    };
  }

  /**
   * Periodic GC to purge expired OTP records and free RAM
   */
  private cleanupExpiredOtps(): void {
    const now = Date.now();
    for (const [email, record] of this.otps.entries()) {
      if (now > record.expiresAt) {
        this.otps.delete(email);
      }
    }
  }
}

export const otpService = new OtpService();
