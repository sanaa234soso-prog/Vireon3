import {
  User,
  CreatorPassport,
  BrandProfile,
  ServiceItem,
  ProductItem,
  CampaignItem,
  CampaignApplication,
  OpportunityItem,
  AffiliateLink,
  OrderItem,
  ConversationItem,
  MessageItem,
  PPVMetric
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_creator_sarah',
    email: 'sarah.ugc@vireon.io',
    fullName: 'Sarah Al-Mansoor',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'creator',
    bio: 'Top 1% Beauty & Tech UGC Creator across GCC & MENA. High conversion video producer with 6.8% avg TikTok engagement.',
    country: 'Saudi Arabia',
    language: 'Arabic, English',
    isVerified: true,
    emailVerified: true,
    emailVerifiedAt: '2025-01-15T10:00:00Z',
    createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'user_creator_marcus',
    email: 'marcus.fx@vireon.io',
    fullName: 'Marcus Sterling',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'creator',
    bio: 'AI Persona Architect & Viral Short-Form Video Editor for Silicon Valley brands & SaaS founders.',
    country: 'United States',
    language: 'English',
    isVerified: true,
    emailVerified: true,
    emailVerifiedAt: '2025-02-01T12:00:00Z',
    createdAt: '2025-02-01T12:00:00Z'
  },
  {
    id: 'user_creator_elena',
    email: 'elena.rostova@vireon.io',
    fullName: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    role: 'creator',
    bio: 'Fashion, Lifestyle & E-Commerce UGC specialist. Verified 2.4M organic views in Q1 2026.',
    country: 'United Kingdom',
    language: 'English, French',
    isVerified: true,
    emailVerified: true,
    emailVerifiedAt: '2025-02-10T14:30:00Z',
    createdAt: '2025-02-10T14:30:00Z'
  },
  {
    id: 'user_brand_lumina',
    email: 'partners@luminaglow.com',
    fullName: 'Lumina Beauty Global',
    avatarUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    role: 'brand',
    bio: 'Premium D2C Clean Skincare Brand operating in US, UAE, and KSA.',
    country: 'United States',
    language: 'English, Arabic',
    isVerified: true,
    emailVerified: true,
    emailVerifiedAt: '2025-01-05T08:00:00Z',
    createdAt: '2025-01-05T08:00:00Z'
  },
  {
    id: 'user_brand_apex',
    email: 'growth@apexgaming.gg',
    fullName: 'Apex Tech & Gaming',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    role: 'brand',
    bio: 'Next-gen gaming peripherals & streaming gear manufacturer.',
    country: 'Germany',
    language: 'English, German',
    isVerified: true,
    emailVerified: true,
    emailVerifiedAt: '2025-01-20T09:00:00Z',
    createdAt: '2025-01-20T09:00:00Z'
  },
  {
    id: 'user_customer_david',
    email: 'david.marketer@gmail.com',
    fullName: 'David Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    role: 'customer',
    bio: 'E-commerce growth lead purchasing prompt packs and hiring UGC creators on demand.',
    country: 'Canada',
    language: 'English',
    isVerified: true,
    emailVerified: true,
    emailVerifiedAt: '2025-03-01T15:00:00Z',
    createdAt: '2025-03-01T15:00:00Z'
  },
  {
    id: 'user_admin_vireon',
    email: 'admin@vireon.io',
    fullName: 'Vireon Core Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    role: 'admin',
    bio: 'Platform Trust, Safety & Financial Clearinghouse Operations.',
    country: 'Global',
    language: 'English, Arabic',
    isVerified: true,
    emailVerified: true,
    emailVerifiedAt: '2024-12-01T00:00:00Z',
    createdAt: '2024-12-01T00:00:00Z'
  }
];

export const INITIAL_CREATOR_PASSPORTS: Record<string, CreatorPassport> = {
  user_creator_sarah: {
    id: 'passport_sarah',
    userId: 'user_creator_sarah',
    handle: 'sarah_ugc',
    tagline: 'High-Converting TikTok & Reels UGC Video Specialist',
    vireonScore: 97,
    deliveryScore: 99.2,
    completedOrders: 142,
    totalEarnings: 38450.00,
    verifiedViews: 8420000,
    avgEngagementRate: 6.8,
    avgConversionRate: 4.6,
    niches: ['Beauty & Skincare', 'E-Commerce', 'Tech Gadgets', 'Health & Wellness'],
    skills: ['TikTok Hooks', 'UGC Scripting', 'Bilingual VO (AR/EN)', 'CapCut / Premiere', 'Conversion Ads'],
    languages: ['Arabic (Native)', 'English (Fluent)'],
    platforms: {
      tiktok: {
        handle: '@sarah_glow_ugc',
        followers: 245000,
        url: 'https://tiktok.com/@sarah_glow_ugc',
        avgViews: 85000,
        engagementRate: 7.1
      },
      instagram: {
        handle: '@sarah.creates.ugc',
        followers: 88000,
        url: 'https://instagram.com/sarah.creates.ugc',
        avgViews: 32000,
        engagementRate: 6.2
      }
    },
    audienceDemographics: {
      topCountries: [
        { country: 'Saudi Arabia', percentage: 48 },
        { country: 'UAE', percentage: 26 },
        { country: 'Kuwait', percentage: 14 },
        { country: 'USA', percentage: 12 }
      ],
      ageGroups: [
        { range: '18-24', percentage: 38 },
        { range: '25-34', percentage: 46 },
        { range: '35-44', percentage: 16 }
      ],
      genderSplit: { male: 22, female: 78 }
    },
    portfolio: [
      {
        id: 'port_1',
        title: 'HydraGlow Serum UGC Ad - 3.4M Organic Views',
        type: 'ugc',
        mediaUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
        metrics: { views: 3400000, likes: 245000, shares: 18200 }
      },
      {
        id: 'port_2',
        title: 'Smart Ring Unboxing & Hook Breakdown',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
        metrics: { views: 1850000, likes: 112000, shares: 9400 }
      }
    ],
    vireonScoreBreakdown: {
      qualityAndPortfolio: 25,
      deliveryAndPunctuality: 20,
      clientSatisfaction: 25,
      verifiedEngagementROI: 19,
      disputeDeduction: 0
    },
    badges: ['Top Rated Creator', 'Vireon Verified', '99% On-Time Delivery', 'Fast Responder']
  },
  user_creator_marcus: {
    id: 'passport_marcus',
    userId: 'user_creator_marcus',
    handle: 'marcus_ai_vids',
    tagline: 'AI Video Personas, Midjourney Prompts & Viral Motion Ads',
    vireonScore: 94,
    deliveryScore: 97.8,
    completedOrders: 98,
    totalEarnings: 29800.00,
    verifiedViews: 5120000,
    avgEngagementRate: 5.6,
    avgConversionRate: 3.9,
    niches: ['AI Personas', 'SaaS Marketing', 'Motion Graphics', 'Short-form Video'],
    skills: ['ComfyUI', 'Midjourney v6', 'Runway Gen-3', 'After Effects', 'AI Voice Clones'],
    languages: ['English (Native)'],
    platforms: {
      youtube: {
        handle: '@MarcusAIStudio',
        followers: 120000,
        url: 'https://youtube.com',
        avgViews: 45000,
        engagementRate: 5.4
      },
      x: {
        handle: '@marcus_sterling_ai',
        followers: 48000,
        url: 'https://x.com',
        avgViews: 18000,
        engagementRate: 5.8
      }
    },
    audienceDemographics: {
      topCountries: [
        { country: 'USA', percentage: 55 },
        { country: 'UK', percentage: 20 },
        { country: 'Germany', percentage: 15 },
        { country: 'Canada', percentage: 10 }
      ],
      ageGroups: [
        { range: '18-24', percentage: 25 },
        { range: '25-34', percentage: 55 },
        { range: '35-44', percentage: 20 }
      ],
      genderSplit: { male: 70, female: 30 }
    },
    portfolio: [
      {
        id: 'port_m1',
        title: 'Hyper-Realistic AI Fashion Persona Showcase',
        type: 'video',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        metrics: { views: 2100000, likes: 98000, shares: 14200 }
      }
    ],
    vireonScoreBreakdown: {
      qualityAndPortfolio: 24,
      deliveryAndPunctuality: 19,
      clientSatisfaction: 24,
      verifiedEngagementROI: 18,
      disputeDeduction: 0
    },
    badges: ['AI Specialist', 'Vireon Verified', 'Fast Turnaround']
  }
};

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'serv_ugc_beauty_pack',
    creatorId: 'user_creator_sarah',
    creatorName: 'Sarah Al-Mansoor',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    creatorHandle: 'sarah_ugc',
    creatorScore: 97,
    title: 'High-Converting Viral UGC Video Ads (3 Hooks + 1 Core Edit)',
    slug: 'ugc-viral-video-ads-3-hooks',
    category: 'UGC',
    description: 'I will write, film, and professionally edit high-converting UGC TikTok/Reels ads tailored for beauty, tech, and lifestyle brands. Includes 3 unique viral opening hooks, dynamic captions, trending sound mixing, and full commercial usage rights.',
    price: 320.00,
    deliveryDays: 3,
    revisions: 2,
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    tags: ['UGC', 'TikTok Ads', 'Beauty', 'Arabic & English', 'Reels'],
    isFeatured: true,
    ordersCount: 84,
    rating: 4.98,
    reviewCount: 76,
    sampleDeliverables: ['9:16 Vertical Video (4K 60fps)', '3 Alternate 3-second Hooks', 'Subtitles & Voiceover Files']
  },
  {
    id: 'serv_ai_persona_clone',
    creatorId: 'user_creator_marcus',
    creatorName: 'Marcus Sterling',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    creatorHandle: 'marcus_ai_vids',
    creatorScore: 94,
    title: 'Custom Photorealistic AI Brand Avatar & 10 Scripted Videos',
    slug: 'custom-ai-brand-avatar-10-videos',
    category: 'AI Creators',
    description: 'Turn your brand founder or digital spokesperson into a consistent, hyper-realistic AI persona. You get an exact model persona + 10 pre-rendered 30-second social videos generated with synchronized lip-sync and custom voice cloning.',
    price: 650.00,
    deliveryDays: 5,
    revisions: 3,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    tags: ['AI Personas', 'Virtual Influencer', 'Runway', 'Midjourney', 'Video Gen'],
    isFeatured: true,
    ordersCount: 42,
    rating: 4.92,
    reviewCount: 39
  },
  {
    id: 'serv_shortform_editing',
    creatorId: 'user_creator_elena',
    creatorName: 'Elena Rostova',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    creatorHandle: 'elena_ugc',
    creatorScore: 92,
    title: 'Retention-Mastered Short-Form Video Editing (Pack of 5 Reels)',
    slug: 'retention-short-form-video-editing',
    category: 'Video',
    description: 'Transform your raw footage into magnetic TikTok & Instagram content using fast-paced sound design, viral B-roll inserts, animated typography, and color grading optimized for maximum watch time.',
    price: 240.00,
    deliveryDays: 2,
    revisions: 2,
    coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    tags: ['Video Editing', 'Short Form', 'TikTok', 'CapCut', 'Retention'],
    isFeatured: false,
    ordersCount: 65,
    rating: 4.88,
    reviewCount: 51
  },
  {
    id: 'serv_ugc_product_photography',
    creatorId: 'user_creator_sarah',
    creatorName: 'Sarah Al-Mansoor',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    creatorHandle: 'sarah_ugc',
    creatorScore: 97,
    title: 'Aesthetic Lifestyle & E-Commerce UGC Photo Pack (12 Photos)',
    slug: 'lifestyle-ecommerce-ugc-photo-pack',
    category: 'Design',
    description: '12 high-resolution UGC product photos styled in luxury interior and natural outdoor environments with natural sunlight and crisp detail. Perfect for Shopify, Amazon, and Instagram carousels.',
    price: 180.00,
    deliveryDays: 2,
    revisions: 1,
    coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    tags: ['Photography', 'UGC', 'E-commerce', 'Shopify', 'Aesthetic'],
    isFeatured: false,
    ordersCount: 38,
    rating: 4.95,
    reviewCount: 31
  }
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_prompt_pack_midjourney',
    creatorId: 'user_creator_marcus',
    creatorName: 'Marcus Sterling',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    creatorScore: 94,
    title: 'Master Midjourney v6 + Flux Commercial Prompt Arsenal (500+ Prompts)',
    slug: 'midjourney-v6-flux-prompt-arsenal',
    category: 'Prompt Packs',
    description: 'The ultimate prompt engineering system for luxury product photography, hyper-realistic fashion models, cyberpunk 3D renders, and viral ad backdrops. Includes exact seeds, aspect ratios, lighting parameters, and negative prompts.',
    price: 49.00,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    whopProductId: 'prod_whop_prompt_500',
    downloadsCount: 640,
    rating: 4.96,
    format: 'Notion Database + PDF Guide + JSON'
  },
  {
    id: 'prod_ugc_contract_template',
    creatorId: 'user_creator_sarah',
    creatorName: 'Sarah Al-Mansoor',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    creatorScore: 97,
    title: 'Creator & Brand Legal Kit: UGC Licensing, Usage Rights & Invoicing Templates',
    slug: 'ugc-creator-legal-contracts-kit',
    category: 'Digital Products',
    description: 'Protect your content rights and get paid on time. Complete lawyer-vetted contract agreements, 30/60/90-day usage rights addendums, spark ad authorization clauses, and automated invoice spreadsheets.',
    price: 35.00,
    coverImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    whopProductId: 'prod_whop_legal_kit',
    downloadsCount: 420,
    rating: 4.94,
    format: 'Google Docs / PDF / Word'
  }
];

export const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp_lumina_glow_spring',
    brandId: 'user_brand_lumina',
    brandName: 'Lumina Beauty Global',
    brandLogo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    brandVerified: true,
    title: 'Spring Clean Beauty Launch: Saudi & UAE UGC Creators Wanted',
    slug: 'spring-clean-beauty-launch-saudi-uae',
    description: 'Looking for 12 authentic female creators in KSA and UAE to produce honest 30-45s review videos of our new Peptide C-Serum. Focus on glow, texture, morning routine, and real unedited skin results.',
    productName: 'Lumina Peptide-C Glow Serum',
    budget: 6500.00,
    budgetFormatted: '$400 - $650 per Creator',
    paymentModel: 'Hybrid',
    creatorsNeeded: 12,
    creatorsApplied: 28,
    deliverables: '1 TikTok Video (Hook + Demo) + 2 Raw B-roll clips + 30 Days Spark Ad Rights',
    targetPlatforms: ['TikTok', 'Instagram'],
    targetCountries: ['Saudi Arabia', 'UAE', 'Kuwait'],
    targetNiche: 'Beauty & Skincare',
    minEngagementRate: 4.5,
    deadline: '2026-09-01T00:00:00Z',
    status: 'active',
    fundingStatus: 'funded',
    whopPaymentId: 'whop_pay_lumina_spring_9921',
    fundedAmount: 6500.00,
    lockedInProtection: 5500.00,
    releasedAmount: 1000.00,
    refundedAmount: 0,
    deliverablesList: [
      {
        id: 'deliv_lumina_sarah_1',
        campaignId: 'camp_lumina_glow_spring',
        creatorId: 'user_creator_sarah',
        creatorName: 'Sarah Al-Mansoor',
        creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        creatorHandle: 'sarah_ugc',
        milestoneTitle: '3x TikTok UGC Hook Variations (4K ProRes + Raw Clips)',
        amount: 500.00,
        status: 'submitted',
        deliverableUrl: 'https://vireon.io/deliverables/lumina_sarah_4k.mp4',
        deliverableFiles: ['https://vireon.io/deliverables/lumina_sarah_4k.mp4', 'https://vireon.io/deliverables/broll_raw.zip'],
        notes: 'Filmed in 4K ProRes with studio ring light. Hooks focus on glowing texture in Saudi morning light.',
        submittedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        reviewExpiresAt: new Date(Date.now() + 68 * 3600000).toISOString()
      },
      {
        id: 'deliv_lumina_layla_1',
        campaignId: 'camp_lumina_glow_spring',
        creatorId: 'user_creator_layla',
        creatorName: 'Layla K.',
        creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        creatorHandle: 'layla_glow',
        milestoneTitle: '1x Instagram Reel + Night Skincare Routine Demo',
        amount: 500.00,
        status: 'approved',
        deliverableUrl: 'https://vireon.io/deliverables/layla_reel.mp4',
        deliverableFiles: ['https://vireon.io/deliverables/layla_reel.mp4'],
        notes: 'Submitted and approved by brand. Payout released from Payment Protection vault.',
        submittedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        approvedAt: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'camp_apex_gaming_headset',
    brandId: 'user_brand_apex',
    brandName: 'Apex Tech & Gaming',
    brandLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    brandVerified: true,
    title: 'Zero-Latency Wireless Pro Headset Launch Campaign',
    slug: 'zero-latency-wireless-headset-launch',
    description: 'We need gaming, hardware, and tech creators to showcase the soundstage and microphone noise cancellation in high-energy shorts. Performance bonus for high click-throughs!',
    productName: 'Apex Quantum Wireless Pro Headset',
    budget: 8000.00,
    budgetFormatted: '$500 Fixed + $20/1k Verified Views',
    paymentModel: 'PayPerView',
    creatorsNeeded: 8,
    creatorsApplied: 19,
    deliverables: '1 YouTube Short / TikTok + Mic comparison audio test + Affiliate link in bio',
    targetPlatforms: ['YouTube', 'TikTok', 'X'],
    targetCountries: ['USA', 'UK', 'Germany', 'Canada'],
    targetNiche: 'Gaming & Tech',
    minEngagementRate: 5.0,
    deadline: '2026-09-15T00:00:00Z',
    status: 'active',
    fundingStatus: 'funded',
    whopPaymentId: 'whop_pay_apex_9102',
    fundedAmount: 8000.00,
    lockedInProtection: 8000.00,
    releasedAmount: 0,
    refundedAmount: 0,
    deliverablesList: [
      {
        id: 'deliv_apex_marcus_1',
        campaignId: 'camp_apex_gaming_headset',
        creatorId: 'user_creator_marcus',
        creatorName: 'Marcus Sterling',
        creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        creatorHandle: 'marcus_ai_vids',
        milestoneTitle: '1x YouTube Short Noise-Cancelling Audio Comparison',
        amount: 500.00,
        status: 'submitted',
        deliverableUrl: 'https://vireon.io/deliverables/apex_mic_test.mp4',
        deliverableFiles: ['https://vireon.io/deliverables/apex_mic_test.mp4'],
        notes: 'Audio sample tested with simulated mechanical keyboard background noise.',
        submittedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        reviewExpiresAt: new Date(Date.now() + 64 * 3600000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const INITIAL_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: 'opp_1',
    title: 'Beauty Brand UGC Sprint — KSA & Gulf Focus',
    type: 'UGC Campaign',
    brandName: 'Lumina Beauty Global',
    brandLogo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    budgetLabel: '$500 Fixed + 15% Affiliate',
    niche: 'Beauty & Skincare',
    platform: 'TikTok',
    matchScore: 98,
    matchReason: 'Direct match: Your 7.1% TikTok engagement in Saudi Arabia & GCC exceeds the brand requirement of 4.5%.',
    deadline: 'In 5 days'
  },
  {
    id: 'opp_2',
    title: 'AI Video Ad Creator for SaaS Launchpad',
    type: 'Brand Deal',
    brandName: 'OmniFlow AI Cloud',
    brandLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    budgetLabel: '$800 per 60s Video',
    niche: 'AI Personas / Tech',
    platform: 'YouTube & X',
    matchScore: 95,
    matchReason: 'Matches your expertise in AI persona generation, high Vireon Score (94+), and B2B SaaS video experience.',
    deadline: 'In 9 days'
  },
  {
    id: 'opp_3',
    title: 'Verified Pay-Per-View Pool: Fitness & Nutrition Shorts',
    type: 'PayPerView',
    brandName: 'Pulse Hydration Co.',
    brandLogo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    budgetLabel: '$22.50 per 1,000 Verified Views',
    niche: 'Health & Wellness',
    platform: 'TikTok & Reels',
    matchScore: 91,
    matchReason: 'Your audience demographic has strong overlap with 18-34 fitness buyers.',
    deadline: 'Open pool'
  }
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord_whop_8921',
    buyerId: 'user_brand_lumina',
    buyerName: 'Lumina Beauty Global',
    sellerId: 'user_creator_sarah',
    sellerName: 'Sarah Al-Mansoor',
    itemType: 'service',
    itemId: 'serv_ugc_beauty_pack',
    itemTitle: 'High-Converting Viral UGC Video Ads (3 Hooks + 1 Core Edit)',
    amount: 320.00,
    platformFee: 25.60,
    sellerNet: 294.40,
    status: 'delivered',
    whopPaymentId: 'whop_pay_9018247298',
    whopCheckoutUrl: 'https://whop.com/checkout/ord_whop_8921',
    deliverableUrl: 'https://drive.google.com/drive/folders/vireon_lumina_ugc_pack_4k',
    deliveryNotes: '3 high-energy 4K video hooks filmed in natural sunlight with bilingual AR/EN captions + ProRes master file.',
    deliveryFiles: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://drive.google.com/drive/folders/vireon_lumina_ugc_pack_4k'
    ],
    deliveredAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    reviewPeriodExpiresAt: new Date(Date.now() + 58 * 3600 * 1000).toISOString(),
    createdAt: '2026-08-14T09:30:00Z',
    updatedAt: '2026-08-16T12:30:00Z'
  },
  {
    id: 'ord_whop_9923',
    buyerId: 'user_customer_david',
    buyerName: 'David Vance',
    sellerId: 'user_creator_sarah',
    sellerName: 'Sarah Al-Mansoor',
    itemType: 'service',
    itemId: 'serv_1',
    itemTitle: 'Custom TikTok UGC Video Package (3 Hooks + Raw B-Roll)',
    amount: 350.00,
    platformFee: 28.00,
    sellerNet: 322.00,
    status: 'paid',
    whopPaymentId: 'whop_pay_8912301928',
    whopCheckoutUrl: 'https://whop.com/checkout/ord_whop_9923',
    createdAt: '2026-08-16T10:00:00Z',
    updatedAt: '2026-08-16T10:05:00Z'
  },
  {
    id: 'ord_whop_9984',
    buyerId: 'user_brand_apex',
    buyerName: 'Apex Tech & Gaming',
    sellerId: 'user_creator_marcus',
    sellerName: 'Marcus Sterling',
    itemType: 'service',
    itemId: 'serv_2',
    itemTitle: 'AI Persona Talking Avatar Ad',
    amount: 320.00,
    platformFee: 25.60,
    sellerNet: 294.40,
    status: 'revision_requested',
    whopPaymentId: 'whop_pay_7721839102',
    whopCheckoutUrl: 'https://whop.com/checkout/ord_whop_9984',
    deliverableUrl: 'https://frame.io/vireon/avatar_cut_v1',
    deliveryNotes: 'Initial v1 draft with synthetic voice and avatar lip-sync.',
    revisionNotes: 'Please lower the background music volume at 0:15 and provide 1 extra 9:16 vertical hook with higher pacing.',
    revisionsCount: 1,
    maxRevisions: 2,
    createdAt: '2026-08-13T14:00:00Z',
    updatedAt: '2026-08-16T08:15:00Z'
  },
  {
    id: 'ord_whop_7741',
    buyerId: 'user_customer_david',
    buyerName: 'David Vance',
    sellerId: 'user_creator_marcus',
    sellerName: 'Marcus Sterling',
    itemType: 'product',
    itemId: 'prod_prompt_pack_midjourney',
    itemTitle: 'Master Midjourney v6 + Flux Commercial Prompt Arsenal',
    amount: 49.00,
    platformFee: 3.92,
    sellerNet: 45.08,
    status: 'completed',
    whopPaymentId: 'whop_pay_3810294711',
    whopCheckoutUrl: 'https://whop.com/checkout/ord_whop_7741',
    deliveryFiles: ['https://vireon.io/downloads/prompt_pack_v6.zip'],
    completedAt: '2026-08-10T14:15:02Z',
    createdAt: '2026-08-10T14:15:00Z',
    updatedAt: '2026-08-10T14:15:02Z'
  }
];

export const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'conv_sarah_lumina',
    participants: [
      { id: 'user_creator_sarah', name: 'Sarah Al-Mansoor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', role: 'creator' },
      { id: 'user_brand_lumina', name: 'Lumina Beauty Global', avatar: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80', role: 'brand' }
    ],
    lastMessage: 'I have uploaded the 3 alternative opening hooks to the delivery review portal!',
    lastMessageAt: '2026-08-16T12:30:00Z',
    unreadCount: 0,
    subject: 'Order #ord_whop_8921: UGC Video Deliverables'
  }
];

export const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_sarah_lumina',
    senderId: 'user_brand_lumina',
    senderName: 'Lumina Beauty Global',
    senderAvatar: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    body: 'Hi Sarah! We loved your passport metrics and previous serum campaigns. Could you emphasize the morning glow in the first 2 seconds?',
    isRead: true,
    createdAt: '2026-08-14T10:00:00Z'
  },
  {
    id: 'msg_2',
    conversationId: 'conv_sarah_lumina',
    senderId: 'user_creator_sarah',
    senderName: 'Sarah Al-Mansoor',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    body: 'Absolutely! I will film with direct morning sunlight by the mirror with high contrast texture.',
    isRead: true,
    createdAt: '2026-08-14T10:15:00Z'
  },
  {
    id: 'msg_3',
    conversationId: 'conv_sarah_lumina',
    senderId: 'user_creator_sarah',
    senderName: 'Sarah Al-Mansoor',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    body: 'I have uploaded the 3 alternative opening hooks to the delivery review portal!',
    isRead: true,
    createdAt: '2026-08-16T12:30:00Z'
  }
];

export const INITIAL_PASSPORTS: CreatorPassport[] = Object.values(INITIAL_CREATOR_PASSPORTS);

export const INITIAL_APPLICATIONS: CampaignApplication[] = [
  {
    id: 'app_1',
    campaignId: 'camp_lumina_glow_spring',
    creatorId: 'user_creator_sarah',
    creatorName: 'Sarah Al-Mansoor',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    creatorScore: 97,
    proposalText: 'Excited about the Peptide-C launch! My audience is 74% GCC skincare enthusiasts with an avg 7.1% TikTok engagement. Can deliver within 48h.',
    requestedPayout: 500,
    matchScore: 98,
    matchReason: 'Top tier beauty creator in Saudi Arabia with 7.1% TikTok engagement.',
    status: 'accepted',
    createdAt: '2026-08-15T11:00:00Z'
  },
  {
    id: 'app_2',
    campaignId: 'camp_apex_gaming_headset',
    creatorId: 'user_creator_marcus',
    creatorName: 'Marcus Sterling',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    creatorScore: 94,
    proposalText: 'Can create high-impact 3D sound breakdown & AI motion graphics showcasing the noise cancellation.',
    requestedPayout: 650,
    matchScore: 95,
    matchReason: 'Proven AI motion ad specialist with strong tech gamer audience demographic.',
    status: 'pending',
    createdAt: '2026-08-15T14:30:00Z'
  }
];

export const INITIAL_AFFILIATE_LINKS: AffiliateLink[] = [
  {
    id: 'aff_1',
    userId: 'user_creator_sarah',
    campaignId: 'camp_lumina_glow_spring',
    title: 'Lumina Peptide-C Glow Serum',
    code: 'SARAHGLOW',
    targetUrl: 'https://luminaglow.com/products/peptide-c',
    commissionRate: 15,
    clicksCount: 1420,
    salesCount: 89,
    totalCommission: 667.50,
    pendingCommission: 120.00,
    paidCommission: 547.50
  }
];


export const INITIAL_PPV_METRICS: PPVMetric[] = [
  {
    contentId: 'ppv_content_101',
    contentTitle: 'Viral Glowing Skin Routine (TikTok)',
    totalRawViews: 485000,
    verifiedViews: 442000,
    botFilteredViews: 43000,
    earningsAccumulated: 8840.00,
    payoutRatePer1k: 20.00
  },
  {
    contentId: 'ppv_content_102',
    contentTitle: 'AI Midjourney Prompt Breakdown (YouTube Short)',
    totalRawViews: 210000,
    verifiedViews: 198000,
    botFilteredViews: 12000,
    earningsAccumulated: 3960.00,
    payoutRatePer1k: 20.00
  }
];


