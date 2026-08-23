import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import {
  User,
  CreatorPassport,
  ServiceItem,
  ProductItem,
  CampaignItem,
  CampaignApplication,
  CampaignDeliverable,
  OrderItem,
  OpportunityItem,
  AffiliateLink,
  ConversationItem,
  MessageItem,
  PPVMetric,
  PlatformSettings,
  AdminAuditLog,
  DisputeItem,
  ContentReport,
  AiAdminConfig,
  SeoConfig,
  UserRole,
  FavoriteItem,
  FollowedCreator,
  UserNotification,
  WalletTransaction,
  UserWallet,
  UserSettings,
  PayoutRequest,
  SellerSettings,
  SellerFileItem,
  UserDownloadItem
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CREATOR_PASSPORTS,
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_CAMPAIGNS,
  INITIAL_OPPORTUNITIES,
  INITIAL_ORDERS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_PPV_METRICS
} from './mockData';

class DatabaseAdapter {
  private pool: Pool | null = null;
  public isConnectedToPostgres = false;
  private connectionError: string | null = null;
  private isInitialized = false;

  // In-memory active cache (always synced with PostgreSQL)
  public users: User[] = [...INITIAL_USERS];
  public passports: Record<string, CreatorPassport> = { ...INITIAL_CREATOR_PASSPORTS };
  public services: ServiceItem[] = [...INITIAL_SERVICES];
  public products: ProductItem[] = [...INITIAL_PRODUCTS];
  public campaigns: CampaignItem[] = [...INITIAL_CAMPAIGNS];
  public applications: CampaignApplication[] = [
    {
      id: 'app_1',
      campaignId: 'camp_lumina_glow_spring',
      creatorId: 'user_creator_sarah',
      creatorName: 'Sarah Al-Mansoor',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      creatorScore: 97,
      proposalText: 'I would love to film 3 high-energy hooks showcasing the glow finish for Saudi & UAE audiences.',
      requestedPayout: 500,
      matchScore: 98,
      matchReason: 'Audience is 48% Saudi Arabia, 7.1% TikTok engagement rate.',
      status: 'accepted',
      createdAt: '2026-08-14T11:00:00Z'
    }
  ];
  public orders: OrderItem[] = [...INITIAL_ORDERS];
  public opportunities: OpportunityItem[] = [...INITIAL_OPPORTUNITIES];
  public affiliateLinks: AffiliateLink[] = [
    {
      id: 'aff_sarah_lumina',
      userId: 'user_creator_sarah',
      campaignId: 'camp_lumina_glow_spring',
      title: 'Lumina Peptide-C Serum - Sarah 15% VIP',
      code: 'SARAH15',
      targetUrl: 'https://luminaglow.com/serum?ref=sarah_ugc',
      commissionRate: 15.0,
      clicksCount: 1420,
      salesCount: 86,
      totalCommission: 2480.00,
      pendingCommission: 420.00,
      paidCommission: 2060.00
    }
  ];
  public conversations: ConversationItem[] = [...INITIAL_CONVERSATIONS];
  public messages: MessageItem[] = [...INITIAL_MESSAGES];
  public ppvMetrics: PPVMetric[] = [...INITIAL_PPV_METRICS];
  public ppvViewLogs: Array<{
    id: string;
    contentId: string;
    creatorId: string;
    ipHash: string;
    fingerprintHash: string;
    isVerified: boolean;
    isBot: boolean;
    timestamp: string;
  }> = [];

  public favorites: FavoriteItem[] = [
    {
      id: 'fav_1',
      userId: 'user_customer_david',
      itemType: 'service',
      itemId: 'serv_1',
      title: 'Custom TikTok UGC Video Package (3 Hooks + Raw B-Roll)',
      price: 350.0,
      coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      creatorName: 'Sarah Jenkins',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      creatorHandle: 'sarah_ugc',
      rating: 5.0,
      category: 'UGC',
      createdAt: '2026-08-14T10:00:00Z'
    }
  ];

  public followedCreators: FollowedCreator[] = [
    {
      id: 'foll_1',
      userId: 'user_customer_david',
      creatorId: 'user_creator_sarah',
      creatorName: 'Sarah Jenkins',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      creatorHandle: 'sarah_ugc',
      vireonScore: 97,
      followersCount: 142800,
      niches: ['UGC', 'Beauty', 'TikTok Ads'],
      followedAt: '2026-08-12T09:00:00Z'
    }
  ];

  public notifications: UserNotification[] = [];
  public wallets: Record<string, UserWallet> = {};
  public userSettings: Record<string, UserSettings> = {};

  public platformSettings: PlatformSettings = {
    platformFeePercent: 8.0,
    escrowLockHours: 72,
    minPayoutThreshold: 50.0,
    maintenanceMode: false,
    whopCompanyId: 'biz_vireon_core_prod',
    whopMode: 'sandbox',
    securityStrictIpHashing: true,
    autoApproveVerifiedCreators: false
  };

  public disputes: DisputeItem[] = [];
  public auditLogs: AdminAuditLog[] = [];
  public contentReports: ContentReport[] = [];

  public aiConfig: AiAdminConfig = {
    activeModel: 'models/gemini-2.5-flash',
    temperature: 0.7,
    tokenLimitPerDay: 500000,
    radarMatchThreshold: 85,
    autoPitchGenerationEnabled: true
  };

  public seoConfig: SeoConfig = {
    siteTitle: 'VIREON — The Next-Gen Marketplace for Creators & Brands',
    metaDescription: 'Discover, hire, and collaborate with verified UGC creators, AI video editors, and prompt engineers with PaySecure Escrow.',
    canonicalUrl: 'https://vireon.io',
    ogImage: 'https://vireon.io/og-preview.jpg',
    keywords: ['creator economy', 'UGC marketplace', 'creator passport', 'paysecure escrow', 'tiktok ads talent']
  };

  public sellerSettings: Record<string, SellerSettings> = {};
  public payoutRequests: PayoutRequest[] = [];
  public sellerFiles: SellerFileItem[] = [
    {
      id: 'file_1',
      sellerId: 'user_creator_sarah',
      name: 'Viral_Hook_Formulas_2026.pdf',
      size: 4280000,
      sizeFormatted: '4.1 MB',
      fileType: 'application/pdf',
      category: 'document',
      fileUrl: 'https://vireon.io/assets/sample_guide.pdf',
      linkedServiceId: 'serv_1',
      linkedServiceName: 'Custom TikTok UGC Video Package (3 Hooks + Raw B-Roll)',
      linkedProductId: 'prod_1',
      linkedProductName: 'Viral AI Creator Persona & Prompt Masterpack (2026)',
      downloadCount: 142,
      description: 'دليل الصيغ البصرية الأكثر تحويلاً لإعلانات تيك توك وسناب شات 2026',
      uploadedAt: '2026-08-10T14:20:00Z'
    },
    {
      id: 'file_2',
      sellerId: 'user_creator_sarah',
      name: '4K_Cinematic_LUTs_Pack.zip',
      size: 18500000,
      sizeFormatted: '17.6 MB',
      fileType: 'application/zip',
      category: 'archive',
      fileUrl: 'https://vireon.io/assets/luts_masterpack.zip',
      linkedProductId: 'prod_1',
      linkedProductName: 'Viral AI Creator Persona & Prompt Masterpack (2026)',
      downloadCount: 98,
      description: 'حزمة تلوين سينمائية احترافية مخصصة لفيديوهات UGC بكاميرا الآيفون وسوني',
      uploadedAt: '2026-08-12T09:15:00Z'
    }
  ];

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes('sample-pooler')) {
      try {
        this.pool = new Pool({
          connectionString: dbUrl,
          ssl: { rejectUnauthorized: false }
        });
        this.isConnectedToPostgres = true;
      } catch (err: any) {
        this.connectionError = err.message;
        console.warn('[Database] PostgreSQL pool error:', err.message);
      }
    }
  }

  /**
   * Initialize PostgreSQL schema and synchronize records on boot
   */
  public async init(): Promise<void> {
    if (this.isInitialized) return;

    if (this.pool) {
      try {
        const client = await this.pool.connect();
        try {
          // 1. Ensure schema.sql is executed
          const schemaPath = path.join(process.cwd(), 'schema.sql');
          if (fs.existsSync(schemaPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            await client.query(schemaSql);
          }

          // Ensure verification columns exist in users table
          await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_photo_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS id_document_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS id_type VARCHAR(32) DEFAULT 'national_id';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(32) DEFAULT 'unverified';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
          `);

          // 2. Check users count and hydrate/seed
          const usersRes = await client.query('SELECT * FROM users');
          if (usersRes.rows.length > 0) {
            // Hydrate cache with PostgreSQL records
            this.users = usersRes.rows.map(r => ({
              id: r.id,
              email: r.email,
              fullName: r.full_name,
              avatarUrl: r.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              role: r.role as UserRole,
              bio: r.bio || '',
              country: r.country || 'Saudi Arabia',
              language: r.language || 'English',
              isVerified: Boolean(r.is_verified),
              personalPhotoUrl: r.personal_photo_url || undefined,
              idDocumentUrl: r.id_document_url || undefined,
              idType: r.id_type || 'national_id',
              verificationStatus: r.verification_status || (r.is_verified ? 'verified' : 'unverified'),
              verifiedAt: r.verified_at ? new Date(r.verified_at).toISOString() : undefined,
              isBanned: Boolean(r.is_banned),
              emailVerified: Boolean(r.is_verified),
              emailVerifiedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
              createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
            }));
            console.log(`[Database/PostgreSQL] Hydrated ${this.users.length} users.`);
          } else {
            // Seed initial users into PostgreSQL
            for (const u of INITIAL_USERS) {
              await client.query(
                `INSERT INTO users (id, email, full_name, avatar_url, role, bio, country, language, is_verified, is_banned, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                 ON CONFLICT (id) DO NOTHING`,
                [u.id, u.email, u.fullName, u.avatarUrl, u.role, u.bio || '', u.country || 'Saudi Arabia', u.language || 'Arabic', u.isVerified, u.isBanned || false]
              );
            }
            console.log(`[Database/PostgreSQL] Seeded initial users.`);
          }

          // 3. Hydrate or Seed Creators
          for (const u of this.users.filter(x => x.role === 'creator')) {
            await client.query(
              `INSERT INTO creators (id, handle, tagline, vireon_score, created_at)
               VALUES ($1, $2, $3, 90, NOW())
               ON CONFLICT (id) DO NOTHING`,
              [u.id, u.fullName.toLowerCase().replace(/\s+/g, '_'), u.bio || 'Verified Content Creator']
            );
          }

          // 4. Hydrate or Seed Services
          const servRes = await client.query('SELECT * FROM services');
          if (servRes.rows.length > 0) {
            this.services = servRes.rows.map(r => {
              const creator = this.users.find(u => u.id === r.creator_id);
              return {
                id: r.id,
                creatorId: r.creator_id,
                creatorName: creator?.fullName || 'Verified Creator',
                creatorAvatar: creator?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                creatorHandle: creator ? creator.fullName.toLowerCase().replace(/\s+/g, '_') : 'creator',
                creatorScore: 95,
                title: r.title,
                slug: r.slug,
                category: r.category as any,
                description: r.description,
                price: Number(r.price),
                deliveryDays: Number(r.delivery_days || 3),
                revisions: Number(r.revisions || 2),
                coverImage: r.cover_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                tags: r.tags || [],
                isFeatured: Boolean(r.is_featured),
                ordersCount: Number(r.orders_count || 0),
                rating: Number(r.rating || 5.0),
                reviewCount: 12
              };
            });
            console.log(`[Database/PostgreSQL] Hydrated ${this.services.length} services.`);
          } else {
            for (const s of INITIAL_SERVICES) {
              await client.query(
                `INSERT INTO services (id, creator_id, title, slug, category, description, price, delivery_days, revisions, cover_image, tags, is_featured, is_active, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
                 ON CONFLICT (id) DO NOTHING`,
                [s.id, s.creatorId, s.title, s.slug, s.category, s.description, s.price, s.deliveryDays, s.revisions, s.coverImage, s.tags, s.isFeatured || false, true]
              );
            }
            console.log(`[Database/PostgreSQL] Seeded initial services.`);
          }

          // 5. Hydrate or Seed Products
          const prodRes = await client.query('SELECT * FROM products');
          if (prodRes.rows.length > 0) {
            this.products = prodRes.rows.map(r => {
              const creator = this.users.find(u => u.id === r.creator_id);
              return {
                id: r.id,
                creatorId: r.creator_id,
                creatorName: creator?.fullName || 'Verified Creator',
                creatorAvatar: creator?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                creatorScore: 94,
                title: r.title,
                slug: r.slug,
                category: r.category as any,
                description: r.description,
                price: Number(r.price),
                coverImage: r.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
                previewUrl: r.preview_url || '',
                whopProductId: r.whop_product_id || '',
                downloadsCount: Number(r.downloads_count || 0),
                rating: 5.0,
                format: 'ZIP / Notion / PDF'
              };
            });
            console.log(`[Database/PostgreSQL] Hydrated ${this.products.length} products.`);
          } else {
            for (const p of INITIAL_PRODUCTS) {
              await client.query(
                `INSERT INTO products (id, creator_id, title, slug, category, description, price, preview_url, cover_image, whop_product_id, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                 ON CONFLICT (id) DO NOTHING`,
                [p.id, p.creatorId, p.title, p.slug, p.category, p.description, p.price, p.previewUrl || null, p.coverImage, p.whopProductId || null]
              );
            }
            console.log(`[Database/PostgreSQL] Seeded initial products.`);
          }

          this.isConnectedToPostgres = true;
          this.isInitialized = true;
        } finally {
          client.release();
        }
      } catch (err: any) {
        this.connectionError = err.message;
        console.warn('[Database] PostgreSQL sync warning:', err.message);
      }
    }
  }

  public getStatus() {
    return {
      connectedToPostgres: this.isConnectedToPostgres,
      provider: this.isConnectedToPostgres ? 'PostgreSQL (Active & Persistent)' : 'In-Memory Store',
      counts: {
        users: this.users.length,
        services: this.services.length,
        products: this.products.length,
        campaigns: this.campaigns.length,
        orders: this.orders.length,
        conversations: this.conversations.length
      }
    };
  }

  // --- Users & Profiles ---
  public async getUsers(): Promise<User[]> {
    return this.users;
  }

  public async getUserById(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public async createUser(userData: Partial<User> & { email: string; fullName: string; role: UserRole }): Promise<User> {
    const id = userData.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id,
      email: userData.email.trim().toLowerCase(),
      fullName: userData.fullName.trim(),
      role: userData.role,
      bio: userData.bio || (userData.role === 'creator' ? 'Verified Content Creator' : userData.role === 'brand' ? 'Brand Partner' : 'Customer & Buyer'),
      country: userData.country || 'Saudi Arabia',
      language: userData.language || 'English, Arabic',
      avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isVerified: userData.isVerified ?? true,
      emailVerified: true,
      emailVerifiedAt: now,
      createdAt: now
    };

    const existingIdx = this.users.findIndex(u => u.id === id || u.email.toLowerCase() === newUser.email);
    if (existingIdx >= 0) {
      this.users[existingIdx] = newUser;
    } else {
      this.users.push(newUser);
    }

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO users (id, email, full_name, avatar_url, role, bio, country, language, is_verified, is_banned, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             full_name = EXCLUDED.full_name,
             avatar_url = EXCLUDED.avatar_url,
             role = EXCLUDED.role,
             bio = EXCLUDED.bio,
             country = EXCLUDED.country,
             language = EXCLUDED.language,
             is_verified = EXCLUDED.is_verified,
             updated_at = NOW()`,
          [newUser.id, newUser.email, newUser.fullName, newUser.avatarUrl, newUser.role, newUser.bio, newUser.country, newUser.language, newUser.isVerified, false]
        );

        if (newUser.role === 'creator') {
          const creatorHandle = `${newUser.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${newUser.id.slice(-4)}`;
          await this.pool.query(
            `INSERT INTO creators (id, handle, tagline, vireon_score, created_at)
             VALUES ($1, $2, $3, 90, NOW())
             ON CONFLICT (id) DO NOTHING`,
            [newUser.id, creatorHandle, newUser.bio]
          );
        } else if (newUser.role === 'brand') {
          await this.pool.query(
            `INSERT INTO brands (id, company_name, created_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (id) DO NOTHING`,
            [newUser.id, newUser.fullName]
          );
        }
      } catch (err: any) {
        console.error('[Database/PostgreSQL] User persist error:', err.message);
      }
    }

    return newUser;
  }

  public async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;

    Object.assign(user, updates);

    if (this.pool) {
      try {
        await this.pool.query(
          `UPDATE users SET
             full_name = COALESCE($1, full_name),
             avatar_url = COALESCE($2, avatar_url),
             bio = COALESCE($3, bio),
             country = COALESCE($4, country),
             language = COALESCE($5, language),
             is_verified = COALESCE($6, is_verified),
             is_banned = COALESCE($7, is_banned),
             updated_at = NOW()
           WHERE id = $8`,
          [updates.fullName, updates.avatarUrl, updates.bio, updates.country, updates.language, updates.isVerified, updates.isBanned, userId]
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] User update error:', err.message);
      }
    }

    return user;
  }

  public async updateUserRole(userId: string, newRole: UserRole): Promise<User | null> {
    return this.updateUser(userId, { role: newRole });
  }

  public async toggleUserVerify(userId: string): Promise<User | null> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;
    return this.updateUser(userId, { isVerified: !user.isVerified });
  }

  public async verifySellerIdentity(userId: string, data: {
    personalPhotoUrl: string;
    idDocumentUrl?: string;
    idType?: 'passport' | 'national_id' | 'driver_license';
  }): Promise<User | null> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;

    user.isVerified = true;
    user.personalPhotoUrl = data.personalPhotoUrl;
    user.idDocumentUrl = data.idDocumentUrl;
    user.idType = data.idType || 'national_id';
    user.verificationStatus = 'verified';
    user.verifiedAt = new Date().toISOString();

    if (this.pool) {
      try {
        await this.pool.query(
          `UPDATE users SET 
             is_verified = true, 
             personal_photo_url = $1, 
             id_document_url = $2, 
             id_type = $3, 
             verification_status = 'verified', 
             verified_at = NOW(), 
             updated_at = NOW() 
           WHERE id = $4`,
          [user.personalPhotoUrl, user.idDocumentUrl, user.idType, userId]
        );
        await this.pool.query(
          `UPDATE creators SET vireon_score = GREATEST(vireon_score, 95) WHERE id = $1`,
          [userId]
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] verifySellerIdentity error:', err.message);
      }
    }

    return user;
  }

  public async toggleUserBan(userId: string): Promise<User | null> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;
    return this.updateUser(userId, { isBanned: !user.isBanned });
  }

  public async deleteUser(userId: string): Promise<boolean> {
    const initialLen = this.users.length;
    this.users = this.users.filter(u => u.id !== userId);

    if (this.pool) {
      try {
        await this.pool.query('DELETE FROM users WHERE id = $1', [userId]);
      } catch (err: any) {
        console.error('[Database/PostgreSQL] User delete error:', err.message);
      }
    }

    return this.users.length < initialLen;
  }

  public async getCreatorPassport(userId: string): Promise<CreatorPassport | null> {
    if (this.passports[userId]) {
      return this.passports[userId];
    }
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;

    const newPassport: CreatorPassport = {
      id: `passport_${userId}`,
      userId,
      handle: user.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      tagline: user.bio || (user.role === 'creator' ? 'Verified Content Creator' : 'Digital Creator'),
      vireonScore: user.isVerified ? 92 : 88,
      deliveryScore: 100.0,
      completedOrders: 0,
      totalEarnings: 0.00,
      verifiedViews: 0,
      avgEngagementRate: 0.0,
      avgConversionRate: 0.0,
      niches: ['UGC', 'Digital Media', 'Creator Economy'],
      skills: ['Content Creation', 'Digital Products'],
      languages: [user.language || 'English', 'Arabic'],
      platforms: {
        tiktok: {
          handle: `@${user.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '')}`,
          followers: 0,
          url: 'https://tiktok.com',
          avgViews: 0,
          engagementRate: 0.0
        }
      },
      audienceDemographics: {
        topCountries: [{ country: user.country || 'Saudi Arabia', percentage: 100 }],
        ageGroups: [{ range: '18-24', percentage: 50 }, { range: '25-34', percentage: 50 }],
        genderSplit: { male: 50, female: 50 }
      },
      portfolio: [],
      vireonScoreBreakdown: {
        qualityAndPortfolio: 20,
        deliveryAndPunctuality: 20,
        clientSatisfaction: 20,
        verifiedEngagementROI: 20,
        disputeDeduction: 0
      },
      badges: user.isVerified ? ['Verified Creator', 'New Talent'] : ['New Talent']
    };
    this.passports[userId] = newPassport;
    return newPassport;
  }

  public async updateCreatorPassport(userId: string, updates: Partial<CreatorPassport>): Promise<CreatorPassport | null> {
    const passport = await this.getCreatorPassport(userId);
    if (!passport) return null;
    Object.assign(passport, updates);
    this.passports[userId] = passport;
    return passport;
  }

  // --- Services ---
  public async getServices(category?: string): Promise<ServiceItem[]> {
    if (category && category !== 'All') {
      return this.services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    return this.services;
  }

  public async getServiceById(id: string): Promise<ServiceItem | undefined> {
    return this.services.find(s => s.id === id || s.slug === id);
  }

  public async getServicesByCreator(creatorId: string): Promise<ServiceItem[]> {
    return this.services.filter(s => s.creatorId === creatorId);
  }

  public async createService(service: Omit<ServiceItem, 'id' | 'slug' | 'ordersCount' | 'rating' | 'reviewCount'>): Promise<ServiceItem> {
    const slug = service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newService: ServiceItem = {
      ...service,
      id: `serv_${Date.now()}`,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      ordersCount: 0,
      rating: 5.0,
      reviewCount: 0
    };
    this.services.unshift(newService);

    if (this.pool) {
      try {
        // Ensure creator exists in creators table
        await this.pool.query(
          `INSERT INTO creators (id, handle, tagline, vireon_score, created_at)
           VALUES ($1, $2, 'Verified Creator', 90, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [newService.creatorId, newService.creatorHandle || `creator_${newService.creatorId}`]
        );

        await this.pool.query(
          `INSERT INTO services (id, creator_id, title, slug, category, description, price, delivery_days, revisions, cover_image, tags, is_featured, is_active, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [newService.id, newService.creatorId, newService.title, newService.slug, newService.category, newService.description, newService.price, newService.deliveryDays, newService.revisions, newService.coverImage, newService.tags, newService.isFeatured || false, newService.status !== 'paused']
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] Service persist error:', err.message);
      }
    }

    return newService;
  }

  public async updateService(id: string, updates: Partial<ServiceItem>, creatorId?: string): Promise<ServiceItem | null> {
    const s = this.services.find(item => item.id === id && (!creatorId || item.creatorId === creatorId));
    if (!s) return null;
    Object.assign(s, updates);
    return s;
  }

  public async deleteService(id: string, creatorId?: string): Promise<boolean> {
    const len = this.services.length;
    this.services = this.services.filter(s => !(s.id === id && (!creatorId || s.creatorId === creatorId)));
    return this.services.length < len;
  }

  // --- Products ---
  public async getProducts(category?: string): Promise<ProductItem[]> {
    if (category && category !== 'All') {
      return this.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    return this.products;
  }

  public async getProductById(id: string): Promise<ProductItem | undefined> {
    return this.products.find(p => p.id === id || p.slug === id);
  }

  public async getProductsByCreator(creatorId: string): Promise<ProductItem[]> {
    return this.products.filter(p => p.creatorId === creatorId);
  }

  public async createProduct(product: Omit<ProductItem, 'id' | 'slug' | 'downloadsCount' | 'rating'>): Promise<ProductItem> {
    const slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct: ProductItem = {
      ...product,
      id: `prod_${Date.now()}`,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      downloadsCount: 0,
      rating: 5.0
    };
    this.products.unshift(newProduct);

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO creators (id, handle, tagline, vireon_score, created_at)
           VALUES ($1, $2, 'Verified Creator', 90, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [newProduct.creatorId, `creator_${newProduct.creatorId}`]
        );

        await this.pool.query(
          `INSERT INTO products (id, creator_id, title, slug, category, description, price, preview_url, cover_image, whop_product_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [newProduct.id, newProduct.creatorId, newProduct.title, newProduct.slug, newProduct.category, newProduct.description, newProduct.price, newProduct.previewUrl || null, newProduct.coverImage, newProduct.whopProductId || null]
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] Product persist error:', err.message);
      }
    }

    return newProduct;
  }

  public async updateProduct(id: string, updates: Partial<ProductItem>, creatorId?: string): Promise<ProductItem | null> {
    const p = this.products.find(item => item.id === id && (!creatorId || item.creatorId === creatorId));
    if (!p) return null;
    Object.assign(p, updates);
    return p;
  }

  public async deleteProduct(id: string, creatorId?: string): Promise<boolean> {
    const len = this.products.length;
    this.products = this.products.filter(p => !(p.id === id && (!creatorId || p.creatorId === creatorId)));
    return this.products.length < len;
  }

  // --- Orders & Escrow ---
  public async getOrders(userId?: string): Promise<OrderItem[]> {
    if (userId) {
      return this.orders.filter(o => o.buyerId === userId || o.sellerId === userId);
    }
    return this.orders;
  }

  public async getUserOrders(userId: string): Promise<OrderItem[]> {
    return this.orders.filter(o => o.buyerId === userId);
  }

  public async getSellerOrders(sellerId: string): Promise<OrderItem[]> {
    return this.orders.filter(o => o.sellerId === sellerId);
  }

  public async getOrderById(id: string): Promise<OrderItem | undefined> {
    return this.orders.find(o => o.id === id);
  }

  public async createOrder(order: Omit<OrderItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderItem> {
    const now = new Date().toISOString();
    const platformFee = Number((order.amount * 0.03).toFixed(2));
    const sellerNet = Number((order.amount - platformFee).toFixed(2));
    const newOrder: OrderItem = {
      ...order,
      platformFee: order.platformFee !== undefined ? order.platformFee : platformFee,
      sellerNet: order.sellerNet !== undefined ? order.sellerNet : sellerNet,
      id: `ord_${Date.now()}`,
      status: order.status || 'pending',
      createdAt: now,
      updatedAt: now
    };
    this.orders.unshift(newOrder);

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO orders (id, buyer_id, seller_id, item_type, item_id, amount, platform_fee, seller_net, status, whop_payment_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          [newOrder.id, newOrder.buyerId, newOrder.sellerId, newOrder.itemType, newOrder.itemId, newOrder.amount, newOrder.platformFee, newOrder.sellerNet, newOrder.status, newOrder.whopPaymentId || null]
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] Order persist error:', err.message);
      }
    }

    return newOrder;
  }

  public async recordPayment(data: {
    orderId?: string;
    whopPaymentId: string;
    amount: number;
    currency?: string;
    status: 'succeeded' | 'failed' | 'refunded';
    customerEmail?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO payments (id, order_id, whop_payment_id, amount, currency, status, customer_email, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (whop_payment_id) DO UPDATE SET
             status = EXCLUDED.status,
             metadata = EXCLUDED.metadata`,
          [paymentId, data.orderId || null, data.whopPaymentId, data.amount, data.currency || 'USD', data.status, data.customerEmail || null, JSON.stringify(data.metadata || {})]
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] Payment persist error:', err.message);
      }
    }
    return { id: paymentId, ...data };
  }

  public async updateOrderStatus(orderId: string, status: OrderItem['status']): Promise<OrderItem | null> {
    let order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
    }

    if (this.pool) {
      try {
        const res = await this.pool.query(
          'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [status, orderId]
        );
        if (res.rows.length > 0 && !order) {
          const r = res.rows[0];
          order = {
            id: r.id,
            buyerId: r.buyer_id,
            buyerName: 'Customer',
            sellerId: r.seller_id,
            sellerName: 'Creator',
            itemType: r.item_type,
            itemId: r.item_id,
            itemTitle: 'Order Item',
            amount: Number(r.amount),
            platformFee: Number(r.platform_fee),
            sellerNet: Number(r.seller_net),
            status: r.status,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
          };
          this.orders.unshift(order);
        }
      } catch (err: any) {
        console.error('[Database/PostgreSQL] Order status update error:', err.message);
      }
    }

    return order || null;
  }

  public async submitDeliverable(orderId: string, data: { deliverableUrl: string; deliveryNotes?: string; notes?: string; deliveryFiles?: string[]; sellerId?: string }): Promise<OrderItem | null> {
    const order = this.orders.find(o => o.id === orderId && (!data.sellerId || o.sellerId === data.sellerId));
    if (!order) return null;
    order.status = 'delivered';
    order.deliverableUrl = data.deliverableUrl;
    order.deliveryNotes = data.deliveryNotes || data.notes;
    order.deliveryFiles = data.deliveryFiles || [data.deliverableUrl];
    order.deliveredAt = new Date().toISOString();
    order.reviewPeriodExpiresAt = new Date(Date.now() + 72 * 3600000).toISOString();
    order.updatedAt = new Date().toISOString();
    if (this.pool) {
      try {
        await this.pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', ['delivered', orderId]);
      } catch (err: any) {
        console.error('[Database/PostgreSQL] submitDeliverable update error:', err.message);
      }
    }
    return order;
  }

  public async acceptDelivery(orderId: string, _buyerId?: string): Promise<OrderItem | null> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    if (this.pool) {
      try {
        await this.pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', ['completed', orderId]);
      } catch (err: any) {
        console.error('[Database/PostgreSQL] acceptDelivery update error:', err.message);
      }
    }
    return order;
  }

  public async requestRevision(orderId: string, data: { revisionNotes: string; buyerId?: string } | string): Promise<OrderItem | null> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;
    const notes = typeof data === 'string' ? data : data.revisionNotes;
    order.status = 'revision_requested';
    order.revisionNotes = notes;
    order.revisionsCount = (order.revisionsCount || 0) + 1;
    order.updatedAt = new Date().toISOString();

    if (this.pool) {
      try {
        await this.pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', ['revision_requested', orderId]);
      } catch (err: any) {
        console.error('[Database/PostgreSQL] requestRevision update error:', err.message);
      }
    }
    return order;
  }

  public async openOrderDispute(orderId: string, data: { reason: string; userId?: string; userRole?: string; evidenceUrls?: string[] } | string): Promise<OrderItem | null> {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return null;
    const reason = typeof data === 'string' ? data : data.reason;
    order.status = 'disputed';
    order.disputeReason = reason;
    order.disputeStatus = 'opened';
    order.disputedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    if (this.pool) {
      try {
        await this.pool.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', ['disputed', orderId]);
      } catch (err: any) {
        console.error('[Database/PostgreSQL] openOrderDispute update error:', err.message);
      }
    }
    return order;
  }

  public async getUserDownloads(userId: string): Promise<UserDownloadItem[]> {
    const paidOrders = this.orders.filter(o => o.buyerId === userId && (o.status === 'paid' || o.status === 'completed' || o.status === 'delivered'));
    const downloads: UserDownloadItem[] = [];

    for (const o of paidOrders) {
      if (o.itemType === 'product') {
        const prod = this.products.find(p => p.id === o.itemId);
        // Check if there are specific seller files linked to this product
        const linkedFiles = this.sellerFiles.filter(f => f.linkedProductId === o.itemId);
        
        if (linkedFiles.length > 0) {
          for (const f of linkedFiles) {
            downloads.push({
              id: `down_${o.id}_${f.id}`,
              orderId: o.id,
              productId: o.itemId,
              title: prod?.title || o.itemTitle,
              fileName: f.name,
              fileSize: f.sizeFormatted,
              format: prod?.format || 'Digital Asset',
              fileType: f.fileType,
              coverImage: prod?.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
              creatorName: o.sellerName,
              purchasedAt: o.createdAt,
              downloadUrl: f.fileUrl,
              downloadCount: f.downloadCount || 1
            });
          }
        } else {
          downloads.push({
            id: `down_${o.id}`,
            orderId: o.id,
            productId: o.itemId,
            title: prod?.title || o.itemTitle,
            fileName: `${(prod?.title || 'digital_product').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_masterpack.zip`,
            fileSize: '24.8 MB',
            format: prod?.format || 'ZIP Masterpack',
            fileType: 'application/zip',
            coverImage: prod?.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            creatorName: o.sellerName,
            purchasedAt: o.createdAt,
            downloadUrl: prod?.previewUrl || 'https://vireon.io/downloads/asset_package.zip',
            downloadCount: 1
          });
        }
      } else if (o.itemType === 'service' && o.status === 'completed' && o.deliverableUrl) {
        // Completed custom service deliverable
        downloads.push({
          id: `down_srv_${o.id}`,
          orderId: o.id,
          serviceId: o.itemId,
          title: o.itemTitle,
          fileName: `Final_Deliverable_${o.id}.zip`,
          fileSize: '48.5 MB',
          format: '4K UGC Package',
          fileType: 'video/mp4',
          coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
          creatorName: o.sellerName,
          purchasedAt: o.createdAt,
          downloadUrl: o.deliverableUrl,
          downloadCount: 1
        });
      }
    }

    return downloads;
  }

  // --- Seller Digital Files ---
  public async getSellerFiles(sellerId: string): Promise<SellerFileItem[]> {
    return this.sellerFiles.filter(f => f.sellerId === sellerId);
  }

  public async createSellerFile(data: Omit<SellerFileItem, 'id' | 'uploadedAt' | 'downloadCount'>): Promise<SellerFileItem> {
    const newFile: SellerFileItem = {
      ...data,
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      downloadCount: 0,
      uploadedAt: new Date().toISOString()
    };
    this.sellerFiles.unshift(newFile);
    return newFile;
  }

  public async updateSellerFile(fileId: string, updates: Partial<SellerFileItem>, sellerId?: string): Promise<SellerFileItem | null> {
    const file = this.sellerFiles.find(f => f.id === fileId && (!sellerId || f.sellerId === sellerId));
    if (!file) return null;
    Object.assign(file, updates);
    return file;
  }

  public async deleteSellerFile(fileId: string, sellerId?: string): Promise<boolean> {
    const initialLen = this.sellerFiles.length;
    this.sellerFiles = this.sellerFiles.filter(f => !(f.id === fileId && (!sellerId || f.sellerId === sellerId)));
    return this.sellerFiles.length < initialLen;
  }

  public async linkFileToProduct(fileId: string, productId: string, sellerId: string): Promise<SellerFileItem | null> {
    const file = this.sellerFiles.find(f => f.id === fileId && f.sellerId === sellerId);
    if (!file) return null;
    const product = this.products.find(p => p.id === productId);
    file.linkedProductId = productId;
    file.linkedProductName = product ? product.title : 'Product';
    return file;
  }

  public async linkFileToService(fileId: string, serviceId: string, sellerId: string): Promise<SellerFileItem | null> {
    const file = this.sellerFiles.find(f => f.id === fileId && f.sellerId === sellerId);
    if (!file) return null;
    const service = this.services.find(s => s.id === serviceId);
    file.linkedServiceId = serviceId;
    file.linkedServiceName = service ? service.title : 'Service';
    return file;
  }

  public async incrementFileDownload(fileId: string): Promise<void> {
    const file = this.sellerFiles.find(f => f.id === fileId);
    if (file) {
      file.downloadCount = (file.downloadCount || 0) + 1;
    }
  }

  // --- Campaigns ---
  public async getCampaigns(): Promise<CampaignItem[]> {
    return this.campaigns;
  }

  public async getCampaignById(id: string): Promise<CampaignItem | undefined> {
    return this.campaigns.find(c => c.id === id || c.slug === id);
  }

  public async createCampaign(campaign: Omit<CampaignItem, 'id' | 'slug' | 'creatorsApplied' | 'status'>): Promise<CampaignItem> {
    const slug = campaign.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCampaign: CampaignItem = {
      ...campaign,
      id: `camp_${Date.now()}`,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      creatorsApplied: 0,
      status: 'active',
      fundingStatus: 'pending_payment',
      fundedAmount: 0,
      lockedInProtection: 0,
      releasedAmount: 0,
      refundedAmount: 0,
      deliverablesList: [],
      createdAt: new Date().toISOString()
    };
    this.campaigns.unshift(newCampaign);

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO campaigns (id, brand_id, title, slug, description, product_name, budget, payout_model, creators_needed, deliverables, target_platforms, target_countries, target_niche, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [newCampaign.id, newCampaign.brandId, newCampaign.title, newCampaign.slug, newCampaign.description, newCampaign.productName || '', newCampaign.budget, newCampaign.paymentModel, newCampaign.creatorsNeeded, newCampaign.deliverables, newCampaign.targetPlatforms, newCampaign.targetCountries, newCampaign.targetNiche || '', 'active']
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] Campaign persist error:', err.message);
      }
    }

    return newCampaign;
  }

  public async fundCampaign(campaignId: string, whopPaymentId?: string): Promise<CampaignItem | null> {
    const camp = this.campaigns.find(c => c.id === campaignId);
    if (!camp) return null;
    camp.fundingStatus = 'funded';
    camp.whopPaymentId = whopPaymentId || `whop_pay_${Date.now()}`;
    camp.fundedAmount = camp.budget;
    camp.lockedInProtection = camp.budget;
    return camp;
  }

  public async submitCampaignDeliverable(campaignId: string, deliverableData: any): Promise<CampaignDeliverable | null> {
    const camp = this.campaigns.find(c => c.id === campaignId);
    if (!camp) return null;

    if (!camp.deliverablesList) camp.deliverablesList = [];
    const newDeliv: CampaignDeliverable = {
      id: `deliv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      campaignId,
      creatorId: deliverableData.creatorId,
      creatorName: deliverableData.creatorName,
      creatorAvatar: deliverableData.creatorAvatar,
      creatorHandle: deliverableData.creatorHandle,
      milestoneTitle: deliverableData.milestoneTitle,
      amount: deliverableData.amount,
      status: 'submitted',
      deliverableUrl: deliverableData.deliverableUrl,
      deliverableFiles: deliverableData.deliverableFiles || [],
      notes: deliverableData.notes,
      submittedAt: new Date().toISOString(),
      reviewExpiresAt: new Date(Date.now() + 72 * 3600000).toISOString()
    };
    camp.deliverablesList.unshift(newDeliv);
    return newDeliv;
  }

  public async acceptCampaignDeliverable(campaignId: string, delivId: string, brandId: string): Promise<{ success: boolean; deliverable?: CampaignDeliverable; error?: string }> {
    const deliv = await this.releaseMilestoneDeliverable(campaignId, delivId, brandId);
    if (!deliv) {
      return { success: false, error: 'Deliverable not found or unauthorized' };
    }
    return { success: true, deliverable: deliv };
  }

  public async requestCampaignDeliverableRevision(campaignId: string, delivId: string, revisionNotes: string): Promise<{ success: boolean; deliverable?: CampaignDeliverable; error?: string }> {
    const camp = this.campaigns.find(c => c.id === campaignId);
    if (!camp || !camp.deliverablesList) return { success: false, error: 'Campaign not found' };
    const deliv = camp.deliverablesList.find(d => d.id === delivId);
    if (!deliv) return { success: false, error: 'Deliverable not found' };

    deliv.status = 'revision_requested';
    deliv.revisionNotes = revisionNotes;
    return { success: true, deliverable: deliv };
  }

  public async openCampaignDeliverableDispute(campaignId: string, delivId: string, reason: string, brandId: string): Promise<{ success: boolean; deliverable?: CampaignDeliverable; error?: string }> {
    const camp = this.campaigns.find(c => c.id === campaignId && c.brandId === brandId);
    if (!camp || !camp.deliverablesList) return { success: false, error: 'Campaign not found or unauthorized' };
    const deliv = camp.deliverablesList.find(d => d.id === delivId);
    if (!deliv) return { success: false, error: 'Deliverable not found' };

    deliv.status = 'disputed';
    deliv.disputeReason = reason;
    deliv.disputedAt = new Date().toISOString();
    return { success: true, deliverable: deliv };
  }

  public async releaseMilestoneDeliverable(campaignId: string, deliverableId: string, brandId: string): Promise<CampaignDeliverable | null> {
    const camp = this.campaigns.find(c => c.id === campaignId && c.brandId === brandId);
    if (!camp || !camp.deliverablesList) return null;

    const deliv = camp.deliverablesList.find(d => d.id === deliverableId);
    if (!deliv || deliv.status === 'approved') return null;

    deliv.status = 'approved';
    deliv.approvedAt = new Date().toISOString();
    camp.releasedAmount = (camp.releasedAmount || 0) + deliv.amount;
    camp.lockedInProtection = Math.max(0, (camp.lockedInProtection || camp.budget) - deliv.amount);
    return deliv;
  }

  public async refundCampaignDeliverable(campaignId: string, deliverableId: string, brandId: string, reason?: string): Promise<{ success: boolean; deliverable?: CampaignDeliverable; error?: string }> {
    const camp = this.campaigns.find(c => c.id === campaignId && c.brandId === brandId);
    if (!camp || !camp.deliverablesList) return { success: false, error: 'Campaign not found or unauthorized' };

    const deliv = camp.deliverablesList.find(d => d.id === deliverableId);
    if (!deliv) return { success: false, error: 'Deliverable not found' };

    deliv.status = 'refunded';
    deliv.refundedAt = new Date().toISOString();
    deliv.disputeReason = reason || 'Refund requested by brand';
    camp.refundedAmount = (camp.refundedAmount || 0) + deliv.amount;
    camp.lockedInProtection = Math.max(0, (camp.lockedInProtection || camp.budget) - deliv.amount);
    return { success: true, deliverable: deliv };
  }

  public async getApplications(campaignId?: string): Promise<CampaignApplication[]> {
    if (campaignId) {
      return this.applications.filter(a => a.campaignId === campaignId);
    }
    return this.applications;
  }

  public async getCampaignApplications(campaignId?: string): Promise<CampaignApplication[]> {
    return this.getApplications(campaignId);
  }

  public async applyToCampaign(data: Omit<CampaignApplication, 'id' | 'createdAt'>): Promise<CampaignApplication> {
    return this.createApplication(data);
  }

  public async createApplication(application: Omit<CampaignApplication, 'id' | 'createdAt'>): Promise<CampaignApplication> {
    const newApp: CampaignApplication = {
      ...application,
      id: `app_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.applications.unshift(newApp);

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO campaign_applications (id, campaign_id, creator_id, proposal_text, requested_payout, status, match_score, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [newApp.id, newApp.campaignId, newApp.creatorId, newApp.proposalText, newApp.requestedPayout, newApp.status, newApp.matchScore || 90]
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] Application persist error:', err.message);
      }
    }

    return newApp;
  }

  // --- Opportunities ---
  public async getOpportunities(): Promise<OpportunityItem[]> {
    return this.opportunities;
  }

  // --- Affiliate & PPV ---
  public async getAffiliateLinks(userId?: string): Promise<AffiliateLink[]> {
    if (userId) {
      return this.affiliateLinks.filter(a => a.userId === userId);
    }
    return this.affiliateLinks;
  }

  public async trackAffiliateClick(code: string): Promise<AffiliateLink | null> {
    const link = this.affiliateLinks.find(a => a.code.toUpperCase() === code.toUpperCase());
    if (link) {
      link.clicksCount += 1;
    }
    return link || null;
  }

  public async getPPVMetrics(): Promise<PPVMetric[]> {
    return this.ppvMetrics;
  }

  public async recordPPVView(data: { contentId: string; creatorId?: string; ip?: string; userAgent?: string; referrer?: string; ipHash?: string; fingerprintHash?: string; isBot?: boolean }): Promise<{ verified: boolean; earningsIncrement: number }> {
    const metric = this.ppvMetrics.find(m => m.contentId === data.contentId);
    const isVerified = !data.isBot;
    const rate = metric ? metric.payoutRatePer1k / 1000 : 0.018;

    if (metric) {
      metric.totalRawViews += 1;
      if (isVerified) {
        metric.verifiedViews += 1;
        metric.earningsAccumulated += rate;
      } else {
        metric.botFilteredViews += 1;
      }
    }

    return { verified: isVerified, earningsIncrement: isVerified ? rate : 0 };
  }

  // --- Conversations & Messages ---
  public async getConversations(userId: string): Promise<ConversationItem[]> {
    return this.conversations.filter(c => c.participants.some(p => p.id === userId));
  }

  public async getMessages(conversationId: string): Promise<MessageItem[]> {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  public async sendMessage(messageData: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    body: string;
    attachmentUrl?: string;
  }): Promise<MessageItem> {
    const newMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      conversationId: messageData.conversationId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderAvatar: messageData.senderAvatar,
      body: messageData.body,
      attachmentUrl: messageData.attachmentUrl,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.messages.push(newMsg);

    const conv = this.conversations.find(c => c.id === messageData.conversationId);
    if (conv) {
      conv.lastMessage = messageData.body;
      conv.lastMessageAt = new Date().toISOString();
    }

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO messages (id, conversation_id, sender_id, body, attachment_url, is_read, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [newMsg.id, newMsg.conversationId, newMsg.senderId, newMsg.body, newMsg.attachmentUrl || null, false]
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] Message persist error:', err.message);
      }
    }

    return newMsg;
  }

  // --- Admin Platform Management ---
  public async getPlatformSettings(): Promise<PlatformSettings> {
    return this.platformSettings;
  }

  public async updatePlatformSettings(newSettings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    this.platformSettings = { ...this.platformSettings, ...newSettings };
    return this.platformSettings;
  }

  public async getAuditLogs(): Promise<AdminAuditLog[]> {
    return this.auditLogs;
  }

  public async logAdminAudit(log: Omit<AdminAuditLog, 'id' | 'timestamp'>): Promise<AdminAuditLog> {
    const newLog: AdminAuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }

    if (this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO admin_logs (id, admin_id, action, details, ip_address, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [newLog.id, newLog.adminEmail || 'admin@vireon.io', newLog.action, JSON.stringify(newLog), newLog.ip || '127.0.0.1']
        );
      } catch (err: any) {
        console.error('[Database/PostgreSQL] Audit log persist error:', err.message);
      }
    }

    return newLog;
  }

  public async getDisputes(): Promise<DisputeItem[]> {
    return this.disputes;
  }

  public async resolveDispute(
    disputeId: string,
    action: 'release_to_seller' | 'refund_buyer',
    resolutionNote?: string
  ): Promise<DisputeItem | null> {
    const dispute = this.disputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    dispute.status = action === 'release_to_seller' ? 'resolved_seller' : 'resolved_buyer';
    dispute.resolvedAt = new Date().toISOString();
    dispute.resolutionNote = resolutionNote || (action === 'release_to_seller' ? 'Funds released to seller.' : 'Funds refunded to buyer.');

    const order = this.orders.find(o => o.id === dispute.orderId);
    if (order) {
      order.status = action === 'release_to_seller' ? 'completed' : 'refunded';
      order.updatedAt = new Date().toISOString();
      await this.updateOrderStatus(order.id, order.status);
    }

    return dispute;
  }

  public async getContentReports(): Promise<ContentReport[]> {
    return this.contentReports;
  }

  public async actionContentReport(reportId: string, action: 'dismiss' | 'remove'): Promise<ContentReport | null> {
    const report = this.contentReports.find(r => r.id === reportId);
    if (!report) return null;
    report.status = action === 'remove' ? 'removed' : 'dismissed';
    return report;
  }

  public async getAiConfig(): Promise<AiAdminConfig> {
    return this.aiConfig;
  }

  public async updateAiConfig(newConfig: Partial<AiAdminConfig>): Promise<AiAdminConfig> {
    this.aiConfig = { ...this.aiConfig, ...newConfig };
    return this.aiConfig;
  }

  public async getSeoConfig(): Promise<SeoConfig> {
    return this.seoConfig;
  }

  public async updateSeoConfig(newConfig: Partial<SeoConfig>): Promise<SeoConfig> {
    this.seoConfig = { ...this.seoConfig, ...newConfig };
    return this.seoConfig;
  }

  // --- Seller Settings & Payouts ---
  public async getSellerSettings(userId: string): Promise<SellerSettings> {
    if (!this.sellerSettings[userId]) {
      this.sellerSettings[userId] = {
        userId,
        autoAcceptOrders: true,
        vacationMode: false,
        emailAlerts: true,
        instantSmsAlerts: true,
        whopMerchantId: `whop_merch_${userId}`
      };
    }
    return this.sellerSettings[userId];
  }

  public async updateSellerSettings(userId: string, settings: Partial<SellerSettings>): Promise<SellerSettings> {
    const current = await this.getSellerSettings(userId);
    const updated = { ...current, ...settings, userId };
    this.sellerSettings[userId] = updated;
    return updated;
  }

  public async getSellerPayouts(userId: string): Promise<PayoutRequest[]> {
    return this.payoutRequests.filter(p => p.userId === userId);
  }

  public async requestPayout(data: { userId: string; amount: number; method: string; destination: string }): Promise<PayoutRequest> {
    const vireonFee = Math.round(data.amount * 0.03 * 100) / 100; // 3% Platform Fee (97% Creator Net)
    const netAmount = Math.round((data.amount - vireonFee) * 100) / 100;
    const now = new Date().toISOString();
    const newReq: PayoutRequest = {
      id: `payout_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: data.userId,
      amount: data.amount,
      vireonFee,
      netAmount,
      method: data.method,
      destination: data.destination,
      status: 'completed', // Direct instant clearance without manual confirmation
      whopTransferId: `whop_tr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      whopConfirmedAt: now,
      createdAt: now
    };
    this.payoutRequests.unshift(newReq);
    return newReq;
  }

  public async updatePayoutStatus(payoutId: string, status: PayoutRequest['status'], meta?: { whopTransferId?: string; confirmedAt?: string } | string): Promise<PayoutRequest | null> {
    const payout = this.payoutRequests.find(p => p.id === payoutId);
    if (!payout) return null;
    payout.status = status;
    if (typeof meta === 'object' && meta?.whopTransferId) {
      payout.whopTransferId = meta.whopTransferId;
    } else if (typeof meta === 'string') {
      payout.whopTransferId = meta;
    }
    if (status === 'completed') {
      payout.whopConfirmedAt = (typeof meta === 'object' && meta?.confirmedAt) ? meta.confirmedAt : new Date().toISOString();
    }
    return payout;
  }

  // --- Customer Favorites & Follows ---
  public async getUserFavorites(userId: string): Promise<FavoriteItem[]> {
    return this.favorites.filter(f => f.userId === userId);
  }

  public async toggleUserFavorite(userId: string, item: { itemType: 'service' | 'product'; itemId: string; title: string; price: number; coverImage: string; creatorName: string; creatorAvatar: string }): Promise<{ favorited: boolean }> {
    const existingIdx = this.favorites.findIndex(f => f.userId === userId && f.itemId === item.itemId);
    if (existingIdx >= 0) {
      this.favorites.splice(existingIdx, 1);
      return { favorited: false };
    } else {
      const newFav: FavoriteItem = {
        id: `fav_${Date.now()}`,
        userId,
        itemType: item.itemType,
        itemId: item.itemId,
        title: item.title,
        price: item.price,
        coverImage: item.coverImage,
        creatorName: item.creatorName,
        creatorAvatar: item.creatorAvatar,
        rating: 5.0,
        createdAt: new Date().toISOString()
      };
      this.favorites.unshift(newFav);
      return { favorited: true };
    }
  }

  public async addUserFavorite(userId: string, item: Omit<FavoriteItem, 'id' | 'createdAt' | 'userId'>): Promise<FavoriteItem> {
    const newFav: FavoriteItem = {
      ...item,
      id: `fav_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString()
    };
    this.favorites.unshift(newFav);
    return newFav;
  }

  public async removeUserFavorite(userId: string, favoriteId: string): Promise<boolean> {
    const initialLen = this.favorites.length;
    this.favorites = this.favorites.filter(f => !(f.userId === userId && (f.id === favoriteId || f.itemId === favoriteId)));
    return this.favorites.length < initialLen;
  }

  public async getFollowedCreators(userId: string): Promise<FollowedCreator[]> {
    return this.followedCreators.filter(f => f.userId === userId);
  }

  public async toggleFollowCreator(userId: string, creator: any): Promise<{ followed: boolean; follow?: FollowedCreator }> {
    const existingIndex = this.followedCreators.findIndex(f => f.userId === userId && f.creatorId === creator.creatorId);
    if (existingIndex >= 0) {
      this.followedCreators.splice(existingIndex, 1);
      return { followed: false };
    } else {
      const newFollow: FollowedCreator = {
        id: `foll_${Date.now()}`,
        userId,
        creatorId: creator.creatorId,
        creatorName: creator.creatorName,
        creatorAvatar: creator.creatorAvatar,
        creatorHandle: creator.creatorHandle,
        vireonScore: creator.vireonScore || 96,
        followersCount: creator.followersCount || 10500,
        niches: creator.niches || ['UGC', 'Content'],
        followedAt: new Date().toISOString()
      };
      this.followedCreators.unshift(newFollow);
      return { followed: true, follow: newFollow };
    }
  }

  public async getUserNotifications(userId: string): Promise<UserNotification[]> {
    return this.notifications.filter(n => n.userId === userId);
  }

  public async markNotificationRead(userId: string, notifId: string): Promise<boolean> {
    const notif = this.notifications.find(n => n.userId === userId && n.id === notifId);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
  }

  public async clearUserNotifications(userId: string): Promise<boolean> {
    this.notifications = this.notifications.filter(n => n.userId !== userId);
    return true;
  }

  public async getUserWallet(userId: string): Promise<UserWallet> {
    if (!this.wallets[userId]) {
      this.wallets[userId] = {
        userId,
        balance: 150.00,
        pendingEscrow: 0.00,
        currency: 'USD',
        transactions: []
      };
    }
    return this.wallets[userId];
  }

  public async topupUserWallet(userId: string, amount: number, method?: string): Promise<UserWallet> {
    const wallet = await this.getUserWallet(userId);
    wallet.balance += amount;
    wallet.transactions.unshift({
      id: `tx_${Date.now()}`,
      userId,
      type: 'topup',
      amount,
      description: `Instant Deposit via ${method || 'Credit / Debit Card'}`,
      date: new Date().toISOString(),
      status: 'completed',
      referenceId: `whop_dep_${Date.now()}`
    });
    return wallet;
  }

  public async getUserSettings(userId: string): Promise<UserSettings> {
    if (!this.userSettings[userId]) {
      this.userSettings[userId] = {
        userId,
        emailNotifications: true,
        orderStatusSms: true,
        promotionalEmails: false,
        instantDeliveryAlerts: true,
        preferredCurrency: 'USD',
        language: 'English',
        twoFactorEnabled: false
      };
    }
    return this.userSettings[userId];
  }

  public async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getUserSettings(userId);
    const updated = { ...current, ...settings, userId };
    this.userSettings[userId] = updated;
    return updated;
  }
}

export const db = new DatabaseAdapter();
