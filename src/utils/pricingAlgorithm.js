/**
 * Super Algorithm for Influencer Pricing
 * Derived from empirical data points:
 * 1. 5.2k Followers, JetScore 46, ~241 Eng -> 2500 INR
 * 2. 600 Followers, JetScore 46, High Eng -> 600 INR
 * 3. 8.8k Followers, JetScore 8, ~26 Eng -> 1500 INR
 */
export function calculateInfluencerPrice(followers, jetScore, avgEngagement) {
    // Ensure numbers
    const F = Number(followers) || 0;
    const J = Number(jetScore) || 0;
    const E = Number(avgEngagement) || 0;

    // 1. Base Value: Followers weighted by Quality (JetScore)
    // Multiplier scales from ~1.0 (JetScore 0) to ~6.0 (JetScore 100)
    const qualityMultiplier = 1 + (J / 20);
    const baseValue = F * 0.13 * qualityMultiplier;

    // 2. Engagement Bonus: Direct value for engagement volume
    const engagementBonus = E * 0.25;

    // Total
    const total = baseValue + engagementBonus;

    return {
        total: Math.round(total),
        breakdown: {
            base: Math.round(baseValue),
            engagement: Math.round(engagementBonus),
            multiplier: qualityMultiplier.toFixed(2)
        }
    };
}
