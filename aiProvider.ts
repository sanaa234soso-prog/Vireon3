import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

export const VIREON_SUPPORT_POLICY_KNOWLEDGE = `
VIREON PLATFORM POLICIES & KNOWLEDGE BASE:
1. Overview: VIREON is the Creator Economy Marketplace connecting Creators, Brands, Marketers, and Customers.
2. Payment System: All payments on VIREON are processed exclusively through WHOP (credit cards, Apple Pay, crypto, localized currencies). Funds are held in escrow until deliverables are approved or delivery window expires.
3. Fees & Payouts: Platform fee is a standard 8%. Creators/Sellers receive 92% of gross order value. Payouts are dispatched directly via Whop seller balances.
4. Vireon Score: An algorithmic rating (0-100) based on verified portfolio quality, on-time delivery (98%+ benchmark), client review ratings, and verified engagement. Vireon Score CANNOT be bought or artificially manipulated.
5. Pay-Per-View (PPV) Engine: Verified views are scrubbed of bots, proxies, and duplicate device fingerprints. Creators earn up to $25 per 1,000 verified views based on brand campaign pools.
6. Campaign Models: Brands can launch Fixed, Pay-Per-View, Affiliate (sales commission), Hybrid (Fixed + PPV), and Performance campaigns.
7. Disputes & Revisions: Buyers have 48 hours after delivery to request revisions. If a dispute arises, Vireon Admin mediates based on original contract deliverables.
`;

export async function askAiSupport(
  userQuery: string,
  userContext?: { role?: string; userName?: string; activeOrderId?: string }
): Promise<{ reply: string; shouldEscalate: boolean; suggestedActions: string[] }> {
  const client = getAiClient();

  if (client) {
    try {
      const prompt = `You are VIREON AI Support Assistant — a professional, precise, and dedicated support concierge for the VIREON Creator Economy Marketplace.
Answer ONLY questions related to Vireon platform features, orders, payments (Whop), campaigns, creator passports, verified views, and policies.
Do not answer general coding or unrelated trivia. If the user asks for manual intervention, refund disputes, or account unbanning, indicate that a human support ticket has been flagged.

Knowledge Base:
${VIREON_SUPPORT_POLICY_KNOWLEDGE}

User Context: Role: ${userContext?.role || 'Guest'}, Name: ${userContext?.userName || 'User'}, Active Order: ${userContext?.activeOrderId || 'None'}
User Question: "${userQuery}"

Provide a concise, professional markdown answer (max 3 short paragraphs). At the very end, if escalation to human agent is needed, write "[ESCALATE: true]", else "[ESCALATE: false]".`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      const text = response.text || '';
      const shouldEscalate = text.includes('[ESCALATE: true]') || /refund|dispute|banned|human agent|escalate/i.test(userQuery);
      const cleanReply = text.replace(/\[ESCALATE: (true|false)\]/g, '').trim();

      return {
        reply: cleanReply,
        shouldEscalate,
        suggestedActions: shouldEscalate
          ? ['Open Support Ticket', 'Contact Dispute Manager', 'View Order Details']
          : ['Check Creator Passport', 'Browse Active Campaigns', 'Whop Payment FAQ']
      };
    } catch (err) {
      console.warn('Gemini API call error in AI support, using intelligent fallback rules:', err);
    }
  }

  // Intelligent fallback for support queries
  const q = userQuery.toLowerCase();
  if (q.includes('payment') || q.includes('whop') || q.includes('pay')) {
    return {
      reply: `**Vireon Payment System (Powered by Whop)**\n\nAll transactions on Vireon are handled directly via Whop's secure payment infrastructure. \n- **Security**: Payments are held in escrow until you approve the creator's deliverables.\n- **Fee**: Vireon takes an 8% platform fee, with 92% paid directly to the creator.\n- **Receipts**: Download your official Whop invoices anytime under your Dashboard > Orders.`,
      shouldEscalate: false,
      suggestedActions: ['Go to Wallet', 'View Active Orders', 'Connect Whop']
    };
  }

  if (q.includes('vireon score') || q.includes('score') || q.includes('passport')) {
    return {
      reply: `**Vireon Creator Passport & Score (0–100)**\n\nYour Vireon Score reflects verified performance across:\n1. **Work Quality & Portfolio** (25 pts)\n2. **On-Time Delivery** (20 pts)\n3. **Client Satisfaction & Reviews** (25 pts)\n4. **Verified Engagement & Conversion ROI** (20 pts)\n\n*Note: Vireon Scores are mathematically verified and cannot be purchased.*`,
      shouldEscalate: false,
      suggestedActions: ['View My Passport', 'Check Score Breakdown', 'Complete Profile']
    };
  }

  if (q.includes('refund') || q.includes('dispute') || q.includes('cancel')) {
    return {
      reply: `I have flagged this for our **Vireon Trust & Safety Team**. \n\nUnder Vireon Buyer Protection, if a creator fails to meet the agreed campaign deliverables or delivery timeline, our team mediates the dispute and issues an automatic Whop refund. A ticket has been created for your account.`,
      shouldEscalate: true,
      suggestedActions: ['Create Urgent Ticket', 'View Dispute Status', 'Message Creator']
    };
  }

  return {
    reply: `Hello! I am your **Vireon AI Concierge**. I can help you with:\n- **Creator Discovery & Vireon Match**\n- **Launching Brand Campaigns** (Fixed, PPV, Affiliate, Hybrid)\n- **Creator Passport & Verified Views**\n- **Whop Checkout & Seller Payouts**\n\nHow can I assist you today?`,
    shouldEscalate: false,
    suggestedActions: ['Browse Marketplace', 'Launch Campaign', 'Opportunity Radar']
  };
}

export async function aiCreatorMatchSearch(
  query: string,
  creators: any[]
): Promise<{ matchedCreators: any[]; searchSummary: string }> {
  const client = getAiClient();

  if (client) {
    try {
      const prompt = `You are Vireon Match AI. Given a brand's hiring request, analyze the available creators list and return a ranking with Match percentage (70-99%) and a 1-sentence match explanation for each creator.
Brand Prompt: "${query}"
Available Creators: ${JSON.stringify(creators.map(c => ({ id: c.id, name: c.fullName, score: c.vireonScore, niches: c.niches, platforms: c.platforms, country: c.country, engagement: c.avgEngagementRate })))}

Respond with a JSON object in this exact schema:
{
  "summary": "Brief summary of criteria matched",
  "matches": [
    { "id": "creator_id", "matchPercent": 96, "reason": "Explanation why they match" }
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      const text = response.text || '{}';
      const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const parsed = JSON.parse(cleanJson);
      
      const enriched = parsed.matches.map((m: any) => {
        const found = creators.find(c => c.id === m.id || c.userId === m.id);
        return {
          ...found,
          matchPercent: m.matchPercent,
          matchReason: m.reason
        };
      }).filter(Boolean);

      return {
        matchedCreators: enriched.length > 0 ? enriched : creators,
        searchSummary: parsed.summary || `Found ${creators.length} top verified creators matching your search.`
      };
    } catch (e) {
      console.warn('AI Creator match fallback:', e);
    }
  }

  // Algorithmic search fallback
  const qLower = query.toLowerCase();
  const matched = creators.map(c => {
    let score = 85;
    let reasons: string[] = [];

    if (qLower.includes('beauty') && c.niches?.some((n: string) => /beauty|skincare/i.test(n))) {
      score += 8;
      reasons.push('Matches Beauty/Skincare niche');
    }
    if (qLower.includes('saudi') || qLower.includes('ksa') || qLower.includes('gcc')) {
      if (c.country === 'Saudi Arabia' || c.languages?.some((l: string) => /arabic/i.test(l))) {
        score += 5;
        reasons.push('High GCC audience penetration');
      }
    }
    if (qLower.includes('tiktok') && c.platforms?.tiktok) {
      score += 4;
      reasons.push(`Strong TikTok presence (${c.platforms.tiktok.engagementRate}% engagement)`);
    }
    if (qLower.includes('ai') && c.niches?.some((n: string) => /ai/i.test(n))) {
      score += 10;
      reasons.push('AI Persona & Video specialist');
    }

    return {
      ...c,
      matchPercent: Math.min(99, score),
      matchReason: reasons.length > 0 ? reasons.join(' • ') : `High Vireon Score (${c.vireonScore || 90}+) and verified delivery history.`
    };
  }).sort((a, b) => b.matchPercent - a.matchPercent);

  return {
    matchedCreators: matched,
    searchSummary: `Found ${matched.length} verified creators matching: "${query}"`
  };
}

export async function aiGenerateCampaignBrief(brandIdea: string): Promise<{
  title: string;
  description: string;
  suggestedBudget: number;
  paymentModel: 'Fixed' | 'PayPerView' | 'Affiliate' | 'Hybrid';
  deliverables: string;
  targetNiche: string;
}> {
  const client = getAiClient();

  if (client) {
    try {
      const prompt = `You are Vireon Campaign Architect AI. Transform the following brand brief into an optimized Creator Campaign for Vireon Marketplace.
Brand Idea: "${brandIdea}"

Output JSON only in this format:
{
  "title": "Clear punchy campaign title",
  "description": "2-sentence compelling campaign brief",
  "suggestedBudget": 2500,
  "paymentModel": "Hybrid",
  "deliverables": "1 TikTok / Reels (Hook + Demo) + 2 B-roll cuts",
  "targetNiche": "Beauty & Skincare"
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      const text = response.text || '{}';
      const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn('AI Campaign brief fallback:', e);
    }
  }

  return {
    title: `Viral UGC Campaign: ${brandIdea.substring(0, 40)}`,
    description: `We are looking for creative, high-energy creators to showcase ${brandIdea}. Focus on authentic hooks, clear problem-solution framing, and high conversion.`,
    suggestedBudget: 3500,
    paymentModel: 'Hybrid',
    deliverables: '1 Vertical 9:16 UGC Video (4K) + 2 Alternate Opening Hooks + 30 Days Spark Ad Usage Rights',
    targetNiche: 'E-Commerce & Lifestyle'
  };
}

export async function aiGenerateProposal(
  campaignTitle: string,
  deliverables: string,
  creatorHandle: string
): Promise<{ proposalText: string; suggestedRate: number; keyStrengths: string[] }> {
  const client = getAiClient();

  if (client) {
    try {
      const prompt = `Write a high-converting creator pitch proposal for a brand campaign on Vireon.
Creator: @${creatorHandle}
Campaign Title: "${campaignTitle}"
Deliverables: "${deliverables}"

Output JSON only:
{
  "proposalText": "3-paragraph engaging pitch focusing on ROI, audience fit, and fast delivery",
  "suggestedRate": 450,
  "keyStrengths": ["High GCC engagement", "3.4M verified views", "48h turnaround"]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      const text = response.text || '{}';
      const cleanJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn('AI proposal fallback:', e);
    }
  }

  return {
    proposalText: `Hi there! I would love to create high-converting content for "${campaignTitle}". My audience has strong demographic alignment with your target buyers, and my recent campaigns achieved an average 6.8% engagement rate with over 3.4M verified organic views. I can deliver the full scope within 3 days including 3 viral hooks for ad testing!`,
    suggestedRate: 450,
    keyStrengths: ['Top 1% Engagement Rate', '99.2% Delivery Score', 'Full Commercial Rights Included']
  };
}

export async function aiGenerateSeoMetadata(
  title: string,
  category: string,
  type: string
): Promise<{ metaTitle: string; metaDescription: string; keywords: string[]; jsonLdSchema: string }> {
  const metaTitle = `${title} | Vireon Creator Marketplace`;
  const metaDescription = `Hire verified creators and purchase ${title} on VIREON. Escrow payments via Whop, verified views, and 98%+ delivery scores.`;
  const keywords = ['VIREON', category, 'Creator Economy', 'UGC', 'Whop Payments', 'Hire Creators'];

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': type === 'service' ? 'Service' : 'Product',
    name: title,
    description: metaDescription,
    provider: {
      '@type': 'Organization',
      name: 'VIREON',
      url: 'https://vireon.io'
    }
  });

  return {
    metaTitle,
    metaDescription,
    keywords,
    jsonLdSchema: jsonLd
  };
}
