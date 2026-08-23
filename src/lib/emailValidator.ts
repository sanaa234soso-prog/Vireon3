/**
 * Email validation utility with disposable and temporary email detection
 */

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Popular temporary/disposable email providers
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmailo.com',
  'tempail.com',
  '10minutemail.com',
  '10minutemail.net',
  'minuteinbox.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'grr.la',
  'sharklasers.com',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'dispostable.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'getairmail.com',
  'maildrop.cc',
  'fakeinbox.com',
  'mohmal.com',
  'mohmal.in',
  'tempm.com',
  'inboxbear.com',
  'crazymailing.com',
  'nada.ltd',
  'nada.email',
  'burnermail.io',
  'generator.email',
  'fakemailgenerator.com',
  'tempmailaddress.com',
  'mytemp.email',
  'emailondeck.com',
  'spam4.me',
  'dropmail.me',
  'getnada.com',
  'inboxkitten.com',
  'tmail.ws',
  'crazymailing.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'trbvm.com',
  'chacuo.net',
  'disposablemail.com'
]);

const BOGUS_PATTERNS = [
  /^test@test\./i,
  /^admin@admin\./i,
  /^user@user\./i,
  /^asdf@asdf\./i,
  /^a@a\./i,
  /^123@123\./i,
  /^fake@fake\./i,
  /^fake@/i
];

export interface EmailValidationResult {
  isValid: boolean;
  isDisposable: boolean;
  isGmail: boolean;
  domain: string;
  error?: string;
}

export function validateEmailAddress(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      isDisposable: false,
      isGmail: false,
      domain: '',
      error: 'يرجى إدخال البريد الإلكتروني (Email address is required)'
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Basic RFC email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      isDisposable: false,
      isGmail: false,
      domain: '',
      error: 'صيغة البريد الإلكتروني غير صحيحة (Invalid email format)'
    };
  }

  // Check bogus prefix/pattern
  for (const pattern of BOGUS_PATTERNS) {
    if (pattern.test(cleanEmail)) {
      return {
        isValid: false,
        isDisposable: true,
        isGmail: false,
        domain: cleanEmail.split('@')[1] || '',
        error: 'البريد الإلكتروني المدخل يبدو وهمياً، يرجى استخدام بريد إلكتروني حقيقي'
      };
    }
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      isDisposable: false,
      isGmail: false,
      domain: '',
      error: 'البريد الإلكتروني غير مكتمل'
    };
  }

  const username = parts[0];
  const domain = parts[1];

  if (username.length < 2) {
    return {
      isValid: false,
      isDisposable: false,
      isGmail: false,
      domain,
      error: 'اسم المستخدم في البريد الإلكتروني قصير جداً'
    };
  }

  // Check disposable domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      isDisposable: true,
      isGmail: false,
      domain,
      error: 'نعتذر، خدمة البريد المؤقت (Disposable Email) محظورة. يرجى استخدام Gmail أو بريد عمل حقيقي لحماية حسابك.'
    };
  }

  // Check for common temporary sub-strings in domain
  if (
    domain.includes('tempmail') ||
    domain.includes('disposable') ||
    domain.includes('guerrilla') ||
    domain.includes('trashmail') ||
    domain.includes('fake') ||
    domain.includes('throwaway') ||
    domain.includes('10minute')
  ) {
    return {
      isValid: false,
      isDisposable: true,
      isGmail: false,
      domain,
      error: 'نعتذر، خدمة البريد المؤقت محظورة. يرجى استخدام بريد حقيقي مثل Gmail أو Outlook.'
    };
  }

  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com';

  return {
    isValid: true,
    isDisposable: false,
    isGmail,
    domain
  };
}
