import { CreatorPassport } from '../types';

export interface ScoreFactors {
  completedOrdersCount: number;
  onTimeDeliveryRate: number; // 0 - 100%
  averageRating: number; // 1 - 5 stars
  verifiedViews: number;
  engagementRate: number; // e.g. 6.5%
  cancellationRate: number; // 0 - 100%
  portfolioItemsCount: number;
}

export function calculateVireonScore(factors: ScoreFactors): {
  vireonScore: number;
  breakdown: {
    qualityAndPortfolio: number;
    deliveryAndPunctuality: number;
    clientSatisfaction: number;
    verifiedEngagementROI: number;
    disputeDeduction: number;
  };
  rankTier: 'Elite Master' | 'Verified Pro' | 'Rising Star' | 'Apprentice';
  explanation: string;
} {
  // 1. Quality & Portfolio (Max 25 pts)
  const portfolioScore = Math.min(25, Math.round(15 + Math.min(10, factors.portfolioItemsCount * 2.5)));

  // 2. Delivery & Punctuality (Max 20 pts)
  const deliveryScore = Math.round((Math.min(100, factors.onTimeDeliveryRate) / 100) * 20);

  // 3. Client Satisfaction (Max 25 pts)
  const satisfactionScore = Math.round((Math.max(1, Math.min(5, factors.averageRating)) / 5) * 25);

  // 4. Verified Engagement & ROI (Max 20 pts)
  let engagementScore = 10;
  if (factors.engagementRate >= 6.0) engagementScore = 20;
  else if (factors.engagementRate >= 4.0) engagementScore = 17;
  else if (factors.engagementRate >= 2.5) engagementScore = 14;
  else engagementScore = 10;

  // 5. Penalties (Cancellations/Disputes)
  const penalty = Math.round((factors.cancellationRate / 100) * 30);

  const rawScore = portfolioScore + deliveryScore + satisfactionScore + engagementScore - penalty;
  const vireonScore = Math.max(10, Math.min(100, rawScore));

  let rankTier: 'Elite Master' | 'Verified Pro' | 'Rising Star' | 'Apprentice' = 'Apprentice';
  if (vireonScore >= 92) rankTier = 'Elite Master';
  else if (vireonScore >= 80) rankTier = 'Verified Pro';
  else if (vireonScore >= 65) rankTier = 'Rising Star';

  return {
    vireonScore,
    breakdown: {
      qualityAndPortfolio: portfolioScore,
      deliveryAndPunctuality: deliveryScore,
      clientSatisfaction: satisfactionScore,
      verifiedEngagementROI: engagementScore,
      disputeDeduction: penalty
    },
    rankTier,
    explanation: `Calculated from ${factors.completedOrdersCount} verified completed orders, ${factors.onTimeDeliveryRate}% on-time delivery rate, ${factors.averageRating.toFixed(1)}/5 client reviews, and ${factors.engagementRate.toFixed(1)}% verified engagement.`
  };
}
