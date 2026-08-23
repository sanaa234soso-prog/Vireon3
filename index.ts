export type UserRole = 'creator' | 'brand' | 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: UserRole;
  bio: string;
  country: string;
  language: string;
  isVerified: boolean;
  personalPhotoUrl?: string;
  idDocumentUrl?: string;
  idType?: 'passport' | 'national_id' | 'driver_license';
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  isBanned?: boolean;
  whopUserId?: string;
  createdAt: string;
}

export interface CreatorPlatform {
  handle: string;
  followers: number;
  url: string;
  avgViews: number;
  engagementRate: number;
}

export interface CreatorPortfolioItem {
  id: string;
  title: string;
  type: 'video' | 'photo' | 'ugc' | 'design';
  mediaUrl: string;
  thumbnailUrl: string;
  metrics?: {
    views?: number;
    likes?: number;
    shares?: number;
  };
}

export interface CreatorPassport {
  id: string;
  userId: string;
  handle: string;
  tagline: string;
  vireonScore: number; // 0 - 100
  deliveryScore: number; // e.g. 98.5%
  completedOrders: number;
  totalEarnings: number;
  verifiedViews: number;
  avgEngagementRate: number; // e.g. 5.4%
  avgConversionRate: number; // e.g. 3.8%
  niches: string[];
  skills: string[];
  languages: string[];
  platforms: {
    tiktok?: CreatorPlatform;
    instagram?: CreatorPlatform;
    youtube?: CreatorPlatform;
    x?: CreatorPlatform;
  };
  audienceDemographics: {
    topCountries: { country: string; percentage: number }[];
    ageGroups: { range: string; percentage: number }[];
    genderSplit: { male: number; female: number };
  };
  portfolio: CreatorPortfolioItem[];
  vireonScoreBreakdown: {
    qualityAndPortfolio: number; // max 25
    deliveryAndPunctuality: number; // max 20
    clientSatisfaction: number; // max 25
    verifiedEngagementROI: number; // max 20
    disputeDeduction: number; // negative penalty
  };
  badges: string[];
}

export interface BrandProfile {
  id: string;
  userId: string;
  companyName: string;
  website: string;
  industry: string;
  budgetRange: string;
  totalSpent: number;
  verifiedBadge: boolean;
  activeCampaignsCount: number;
}

export type MarketplaceCategory =
  | 'UGC'
  | 'Creators'
  | 'Services'
  | 'Digital Products'
  | 'AI Creators'
  | 'Prompt Packs'
  | 'Video'
  | 'Design'
  | 'Marketing'
  | 'Jobs'
  | 'Campaigns'
  | 'Affiliate Opportunities';

export interface ServiceItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  creatorScore: number;
  title: string;
  slug: string;
  category: MarketplaceCategory;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  coverImage: string;
  tags: string[];
  status?: 'published' | 'draft' | 'paused' | 'archived';
  isFeatured?: boolean;
  ordersCount: number;
  rating: number;
  reviewCount: number;
  sampleDeliverables?: string[];
  videoUrl?: string;
  digitalFileUrl?: string;
  digitalFileName?: string;
}

export interface ProductItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorScore: number;
  title: string;
  slug: string;
  category: MarketplaceCategory;
  description: string;
  price: number;
  coverImage: string;
  previewUrl?: string;
  videoUrl?: string;
  digitalFileUrl?: string;
  digitalFileName?: string;
  digitalFileSize?: string;
  whopProductId?: string;
  status?: 'published' | 'draft' | 'paused' | 'archived';
  downloadsCount: number;
  rating: number;
  format: string; // e.g. 'ZIP / Notion / PDF / JSON'
}

export type PaymentModel = 'Fixed' | 'PayPerView' | 'Affiliate' | 'Hybrid' | 'Performance';

export interface CampaignDeliverable {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle?: string;
  milestoneTitle: string;
  amount: number;
  status: 'pending' | 'submitted' | 'revision_requested' | 'approved' | 'disputed' | 'refunded';
  deliverableUrl?: string;
  deliverableFiles?: string[];
  notes?: string;
  submittedAt?: string;
  reviewExpiresAt?: string;
  revisionNotes?: string;
  disputeReason?: string;
  whopPayoutId?: string;
  approvedAt?: string;
  disputedAt?: string;
  refundedAt?: string;
}

export interface CampaignItem {
  id: string;
  brandId: string;
  brandName: string;
  brandLogo: string;
  brandVerified: boolean;
  title: string;
  slug: string;
  description: string;
  productName: string;
  budget: number;
  budgetFormatted: string;
  paymentModel: PaymentModel;
  creatorsNeeded: number;
  creatorsApplied: number;
  deliverables: string;
  targetPlatforms: ('TikTok' | 'Instagram' | 'YouTube' | 'X')[];
  targetCountries: string[];
  targetNiche: string;
  minEngagementRate: number;
  deadline: string;
  status: 'active' | 'in_progress' | 'completed' | 'paused';
  fundingStatus?: 'unfunded' | 'pending_payment' | 'funded' | 'disputed' | 'refunded';
  whopPaymentId?: string;
  whopCheckoutUrl?: string;
  fundedAmount?: number;
  lockedInProtection?: number;
  releasedAmount?: number;
  refundedAmount?: number;
  deliverablesList?: CampaignDeliverable[];
  createdAt?: string;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorScore: number;
  proposalText: string;
  requestedPayout: number;
  matchScore: number;
  matchReason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  itemType: 'service' | 'product' | 'campaign_payout';
  itemId: string;
  itemTitle: string;
  amount: number;
  platformFee: number;
  sellerNet: number;
  status: 'pending' | 'paid' | 'in_progress' | 'delivered' | 'revision_requested' | 'completed' | 'disputed' | 'cancelled' | 'refunded';
  whopPaymentId?: string;
  whopCheckoutUrl?: string;
  deliverableUrl?: string;
  deliveryNotes?: string;
  deliveryFiles?: string[];
  deliveredAt?: string;
  reviewPeriodExpiresAt?: string;
  revisionNotes?: string;
  revisionsCount?: number;
  maxRevisions?: number;
  disputeReason?: string;
  disputeStatus?: 'none' | 'opened' | 'in_review' | 'resolved';
  disputedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityItem {
  id: string;
  title: string;
  type: 'UGC Campaign' | 'Brand Deal' | 'PayPerView' | 'Affiliate' | 'Job' | 'Service Request';
  brandName: string;
  brandLogo: string;
  budgetLabel: string;
  niche: string;
  platform: string;
  matchScore: number; // e.g. 97
  matchReason: string;
  deadline: string;
  directApplyLink?: string;
}

export interface AffiliateLink {
  id: string;
  userId: string;
  campaignId?: string;
  serviceId?: string;
  title: string;
  code: string;
  targetUrl: string;
  commissionRate: number; // e.g. 15%
  clicksCount: number;
  salesCount: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  body: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    role: UserRole;
  }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  subject?: string;
}

export interface PPVMetric {
  contentId: string;
  contentTitle: string;
  totalRawViews: number;
  verifiedViews: number;
  botFilteredViews: number;
  earningsAccumulated: number;
  payoutRatePer1k: number; // e.g. $18 per 1k verified views
}

export interface WhopConfigStatus {
  isConfigured: boolean;
  companyId?: string;
  webhookConfigured?: boolean;
  mode?: 'live' | 'sandbox';
  environment?: 'live' | 'sandbox';
  supportedCurrencies?: string[];
  escrowFeePercent?: number;
  platformFeePercent?: number;
}

export interface MarketplaceFilterState {
  search: string;
  category: MarketplaceCategory | 'All';
  minPrice: number;
  maxPrice: number;
  minVireonScore: number;
  platform: string;
  niche: string;
  country: string;
  language: string;
  verifiedOnly: boolean;
  sortBy: 'recommended' | 'score' | 'price_asc' | 'price_desc' | 'orders' | 'rating';
}

export interface PlatformSettings {
  platformFeePercent: number;
  escrowLockHours: number;
  minPayoutThreshold: number;
  maintenanceMode: boolean;
  whopCompanyId: string;
  whopMode: 'sandbox' | 'live';
  securityStrictIpHashing: boolean;
  autoApproveVerifiedCreators: boolean;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  adminEmail: string;
  targetType: 'user' | 'order' | 'dispute' | 'settings' | 'campaign' | 'ai' | 'security';
  targetId: string;
  details: string;
  ip: string;
  status: 'SUCCESS' | 'BLOCKED_403' | 'WARNING';
  timestamp: string;
}

export interface DisputeItem {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  itemTitle: string;
  amount: number;
  buyerComplaint: string;
  sellerResponse: string;
  evidenceUrls: string[];
  status: 'pending' | 'resolved_seller' | 'resolved_buyer' | 'under_review';
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface ContentReport {
  id: string;
  itemType: 'service' | 'product' | 'campaign' | 'creator';
  itemId: string;
  itemTitle: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'dismissed' | 'removed';
  createdAt: string;
}

export interface AiAdminConfig {
  activeModel: string;
  temperature: number;
  tokenLimitPerDay: number;
  radarMatchThreshold: number;
  autoPitchGenerationEnabled: boolean;
}

export interface SeoConfig {
  siteTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImage: string;
  keywords: string[];
}

export interface FavoriteItem {
  id: string;
  userId: string;
  itemType: 'service' | 'product';
  itemId: string;
  title: string;
  price: number;
  coverImage: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle?: string;
  rating: number;
  category?: string;
  createdAt: string;
}

export interface FollowedCreator {
  id: string;
  userId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  vireonScore: number;
  followersCount: number;
  niches: string[];
  followedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'message' | 'promo' | 'system' | 'delivery' | 'escrow' | 'payment' | 'payout' | 'security';
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'topup' | 'purchase' | 'refund' | 'affiliate_payout' | 'credit' | 'payout';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  referenceId?: string;
}

export interface UserWallet {
  userId: string;
  balance: number;
  pendingEscrow: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface PayoutRequest {
  id: string;
  userId: string;
  amount: number;
  vireonFee: number;
  netAmount: number;
  method: string;
  destination: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  whopTransferId?: string;
  whopConfirmedAt?: string;
  createdAt: string;
}

export interface SellerSettings {
  userId: string;
  autoAcceptOrders: boolean;
  vacationMode: boolean;
  emailAlerts: boolean;
  instantSmsAlerts: boolean;
  whopMerchantId: string;
}

export interface SellerFileItem {
  id: string;
  sellerId: string;
  name: string;
  size: number;
  sizeFormatted: string;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  category: 'video' | 'document' | 'image' | 'prompt' | 'archive' | 'audio';
  linkedServiceId?: string;
  linkedServiceName?: string;
  linkedProductId?: string;
  linkedProductName?: string;
  downloadCount: number;
  description?: string;
  uploadedAt: string;
}

export interface UserDownloadItem {
  id: string;
  orderId: string;
  productId?: string;
  serviceId?: string;
  title: string;
  fileName: string;
  fileSize: string;
  format: string;
  fileType: string;
  coverImage: string;
  creatorName: string;
  purchasedAt: string;
  downloadUrl: string;
  downloadCount: number;
}

export interface UserSettings {
  userId: string;
  emailNotifications: boolean;
  orderStatusSms: boolean;
  promotionalEmails: boolean;
  instantDeliveryAlerts: boolean;
  preferredCurrency: string;
  language: string;
  twoFactorEnabled: boolean;
}
