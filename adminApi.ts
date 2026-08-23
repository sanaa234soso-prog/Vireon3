import {
  PlatformSettings,
  AdminAuditLog,
  DisputeItem,
  ContentReport,
  AiAdminConfig,
  SeoConfig,
  User,
  OrderItem,
  UserRole
} from '../types';

export interface AdminMetrics {
  totalGMV: number;
  platformRevenue: number;
  platformFeePercent: number;
  activeEscrowPool: number;
  totalUsers: number;
  creatorsCount: number;
  brandsCount: number;
  pendingVerificationsCount: number;
  activeDisputesCount: number;
  totalOrders: number;
  systemHealth: string;
  timestamp: string;
}

class AdminApiService {
  private getHeaders(token?: string, adminKey?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const storedToken = token || localStorage.getItem('vireon_token');
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }

    const storedAdminKey = adminKey || localStorage.getItem('vireon_admin_key');
    if (storedAdminKey) {
      headers['x-admin-key'] = storedAdminKey;
    }

    return headers;
  }

  public async verifyAdminSession(): Promise<{ valid: boolean; user?: User }> {
    try {
      const res = await fetch('/api/admin/auth/verify', {
        headers: this.getHeaders()
      });
      if (!res.ok) return { valid: false };
      const data = await res.json();
      return { valid: true, user: data.user };
    } catch {
      return { valid: false };
    }
  }

  public async adminLogin(email: string, adminKey?: string, password?: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, adminKey, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }
      if (data.token) {
        localStorage.setItem('vireon_token', data.token);
      }
      if (adminKey) {
        localStorage.setItem('vireon_admin_key', adminKey);
      }
      return { success: true, token: data.token, user: data.user };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  public async getMetrics(): Promise<AdminMetrics | null> {
    const res = await fetch('/api/admin/metrics', { headers: this.getHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('403_FORBIDDEN');
      return null;
    }
    return res.json();
  }

  public async getUsers(): Promise<User[]> {
    const res = await fetch('/api/admin/users', { headers: this.getHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('403_FORBIDDEN');
      return [];
    }
    return res.json();
  }

  public async toggleUserVerify(userId: string): Promise<User | null> {
    const res = await fetch(`/api/admin/users/${userId}/verify`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async toggleUserBan(userId: string): Promise<User | null> {
    const res = await fetch(`/api/admin/users/${userId}/ban`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async updateUserRole(userId: string, role: UserRole): Promise<User | null> {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ role })
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async deleteUser(userId: string): Promise<boolean> {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.ok;
  }

  public async getEscrow(): Promise<{ orders: OrderItem[]; disputes: DisputeItem[] } | null> {
    const res = await fetch('/api/admin/escrow', { headers: this.getHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('403_FORBIDDEN');
      return null;
    }
    return res.json();
  }

  public async forceReleaseEscrow(orderId: string): Promise<OrderItem | null> {
    const res = await fetch(`/api/admin/escrow/${orderId}/release`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async forceRefundEscrow(orderId: string): Promise<OrderItem | null> {
    const res = await fetch(`/api/admin/escrow/${orderId}/refund`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async getDisputes(): Promise<DisputeItem[]> {
    const res = await fetch('/api/admin/disputes', { headers: this.getHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('403_FORBIDDEN');
      return [];
    }
    return res.json();
  }

  public async resolveDispute(disputeId: string, action: 'release_to_seller' | 'refund_buyer', resolutionNote?: string): Promise<DisputeItem | null> {
    const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action, resolutionNote })
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async getReports(): Promise<ContentReport[]> {
    const res = await fetch('/api/admin/reports', { headers: this.getHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('403_FORBIDDEN');
      return [];
    }
    return res.json();
  }

  public async actionReport(reportId: string, action: 'dismiss' | 'remove'): Promise<ContentReport | null> {
    const res = await fetch(`/api/admin/reports/${reportId}/action`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ action })
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async getSettings(): Promise<PlatformSettings | null> {
    const res = await fetch('/api/admin/settings', { headers: this.getHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('403_FORBIDDEN');
      return null;
    }
    return res.json();
  }

  public async updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings | null> {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async getAiConfig(): Promise<AiAdminConfig | null> {
    const res = await fetch('/api/admin/ai/config', { headers: this.getHeaders() });
    if (!res.ok) return null;
    return res.json();
  }

  public async updateAiConfig(config: Partial<AiAdminConfig>): Promise<AiAdminConfig | null> {
    const res = await fetch('/api/admin/ai/config', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config)
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async getSeoConfig(): Promise<SeoConfig | null> {
    const res = await fetch('/api/admin/seo', { headers: this.getHeaders() });
    if (!res.ok) return null;
    return res.json();
  }

  public async updateSeoConfig(config: Partial<SeoConfig>): Promise<SeoConfig | null> {
    const res = await fetch('/api/admin/seo', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(config)
    });
    if (!res.ok) return null;
    return res.json();
  }

  public async getAuditLogs(): Promise<AdminAuditLog[]> {
    const res = await fetch('/api/admin/audit-logs', { headers: this.getHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('403_FORBIDDEN');
      return [];
    }
    return res.json();
  }
}

export const adminApi = new AdminApiService();
