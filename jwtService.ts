import crypto from 'crypto';
import { User, UserRole } from '../types';

/**
 * Interface representing standard JWT payload for VIREON session authentication
 */
export interface VireonJwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  fullName: string;
  iat: number; // Issued at (seconds)
  exp: number; // Expiration (seconds)
  jti: string; // Unique token identifier
}

/**
 * Server-Side Cryptographically Secure JWT Management Service
 * Automatically generates a high-entropy 512-bit secret if not present in environment variables.
 */
class JwtService {
  private secret: string;

  constructor() {
    // Check if process.env.JWT_SECRET exists and is sufficiently configured
    const envSecret = process.env.JWT_SECRET?.trim();
    if (envSecret && envSecret.length >= 32) {
      this.secret = envSecret;
    } else {
      // Generate a cryptographically secure 512-bit random secret key in-memory on the server
      const generatedSecret = crypto.randomBytes(64).toString('hex');
      this.secret = generatedSecret;
      process.env.JWT_SECRET = generatedSecret;
      console.log('[VIREON Security] Cryptographically secure JWT_SECRET initialized automatically in server environment.');
    }
  }

  /**
   * Helper to convert Base64 string to URL-safe Base64 (base64url)
   */
  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  /**
   * Helper to decode URL-safe Base64 to string
   */
  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  /**
   * Sign a payload to create a signed JWT token (HMAC SHA-256)
   * Default expiration is 7 days (604,800 seconds)
   */
  public signToken(user: User, expiresInSeconds: number = 7 * 24 * 3600): string {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expInSeconds = nowInSeconds + expiresInSeconds;

    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload: VireonJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      iat: nowInSeconds,
      exp: expInSeconds,
      jti: crypto.randomBytes(16).toString('hex')
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(dataToSign)
      .digest('base64url');

    return `${dataToSign}.${signature}`;
  }

  /**
   * Verify and decode a JWT token with constant-time signature comparison and expiration checks
   */
  public verifyToken(token: string): VireonJwtPayload | null {
    try {
      if (!token || typeof token !== 'string') return null;

      const parts = token.trim().split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;
      const dataToSign = `${encodedHeader}.${encodedPayload}`;

      // Calculate expected signature using server secret
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(dataToSign)
        .digest('base64url');

      // Constant-time comparison to prevent timing attacks
      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (sigBuffer.length !== expectedBuffer.length) {
        return null;
      }

      if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return null;
      }

      // Parse payload
      const decodedPayloadJson = this.base64UrlDecode(encodedPayload);
      const payload: VireonJwtPayload = JSON.parse(decodedPayloadJson);

      // Verify expiration
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < nowInSeconds) {
        return null; // Expired
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Safe status check (never returns or logs the secret key)
   */
  public isReady(): boolean {
    return Boolean(this.secret && this.secret.length >= 32);
  }
}

export const jwtService = new JwtService();
