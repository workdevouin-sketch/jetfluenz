// Influencer Tips
export const SOCIAL_MEDIA_TIPS = [
    {
        id: 1,
        title: "Hook Them Early",
        content: "The first 3 seconds of your video are crucial. Start with a question, a bold statement, or a visual surprise to stop the scroll.",
        category: "Content Strategy",
        action: "Review your last 5 videos. Did they hook you in 3 seconds?",
    },
    // ... existing tips
    {
        id: 216,
        category: "Technical",
        title: "Micro-Looping",
        content: "Create seamless loops in your short-form videos to encourage re-watching.",
        action: "Try to edit your next Reel so the end flows seamlessly back into the beginning.",
    }
];

// Business Tips
export const BUSINESS_TIPS = [
    {
        id: 1,
        title: "Define Clear Goals",
        content: "Before launching a campaign, define exactly what you want to achieve: Brand Awareness, Conversions, or Content Creation. This guides your influencer selection.",
        category: "Strategy",
        action: "Write down the primary KPI for your next campaign.",
    },
    {
        id: 2,
        title: "Micro vs Macro Influencers",
        content: "Micro-influencers often have higher engagement rates and niche audiences compared to macro-influencers, making them ideal for conversion-focused campaigns.",
        category: "Selection",
        action: "Calculate the Engagement Rate (ER) of 3 potential micro-influencers.",
    },
    {
        id: 3,
        title: "Authenticity is Key",
        content: "Allow influencers creative freedom. Their audience follows them for their unique style. Forced scripts often perform poorly.",
        category: "Content",
        action: "Draft a brief for your next campaign that focuses on key messages rather than a script.",
    },
    {
        id: 4,
        title: "Track ROI",
        content: "Use unique discount codes or tracking links for each influencer to accurately measure the return on investment (ROI) of your campaigns.",
        category: "Analytics",
        action: "Set up a unique tracking code for your next collaboration.",
    },
    {
        id: 5,
        title: "Long-term Partnerships",
        content: "One-off posts are good, but long-term partnerships build trust and advocacy. Consider 3-6 month contracts for top performers.",
        category: "Relationships",
        action: "Idenity one influencer from a past campaign to propose a long-term deal.",
    },
    {
        id: 6,
        title: "Vet Before You Bet",
        content: "Check for fake followers. Look at comments for generic bot replies and analyze follower growth spikes.",
        category: "Vetting",
        action: "Use an audit tool or manual check on your next potential hire.",
    },
    {
        id: 7,
        title: "Clear Usage Rights",
        content: "Negotiate usage rights upfront. Ensure you can reuse their content in your ads, website, or email marketing.",
        category: "Legal",
        action: "Add a 'Usage Rights' clause to your next influencer contract.",
    },
    {
        id: 8,
        title: "Platform Relevance",
        content: "Choose the platform where your audience hangs out. B2B? LinkedIn/Twitter. Gen Z? TikTok. Lifestyle? Instagram.",
        category: "Strategy",
        action: "Survey your current customers to find out their favorite social platform.",
    },
    {
        id: 9,
        title: "Gift with No Strings",
        content: "Sometimes sending a gift with no obligation to post can yield genuine, high-quality organic mentions.",
        category: "Tactics",
        action: "Send product samples to 5 influencers with a personalized note, no strings attached.",
    },
    {
        id: 10,
        title: "User-Generated Content (UGC)",
        content: "Encourage your customers to create content. It acts as social proof and provides you with authentic assets.",
        category: "Content",
        action: "Run a contest encouraging customers to post photos with your product.",
    },
    {
        id: 11,
        title: "Compensation Models",
        content: "Explore different payment models: Flat fee, Commission-based (Affiliate), or Hybrid. Find what aligns with your budget and goals.",
        category: "Budgeting",
        action: "Draft a hybrid compensation offer for a potential partner.",
    },
    {
        id: 12,
        title: "The Brief Matters",
        content: "A confusing brief leads to poor content. Be clear about Do's and Don'ts, mood boards, and deliverables.",
        category: "Management",
        action: "Create a visual mood board for your next campaign brief.",
    },
    {
        id: 13,
        title: "Prompt Payments",
        content: "Pay influencers on time. A reputation for late payments will spread quickly in the creator community.",
        category: "Reputation",
        action: "Review your payment terms and ensure they are creator-friendly (e.g., Net 15 or Net 30).",
    },
    {
        id: 14,
        title: "Engage with Their Content",
        content: "Don't just treat them as a billboard. engage with their posts regularly to build a genuine relationship.",
        category: "Relationships",
        action: "Comment on the last 3 posts of your active influencers.",
    },
    {
        id: 15,
        title: "Whitelisting Ads",
        content: "Running ads through the influencer's handle (whitelisting) often outperforms brand handle ads due to increased trust.",
        category: "Advertising",
        action: "Test a whitelisted ad vs. a brand ad for the same creative.",
    }
];

export const getDailyTip = (type = 'influencer') => {
    const TIPS = type === 'business' ? BUSINESS_TIPS : SOCIAL_MEDIA_TIPS;

    // Use the current date to select a tip
    // This ensures the tip changes every day but is the same for everyone on that day
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    // Use modulo to cycle through tips if dayOfYear > tips length
    const tipIndex = dayOfYear % TIPS.length;

    return TIPS[tipIndex];
};

export const getRandomTip = (type = 'influencer') => {
    const TIPS = type === 'business' ? BUSINESS_TIPS : SOCIAL_MEDIA_TIPS;
    const randomIndex = Math.floor(Math.random() * TIPS.length);
    return TIPS[randomIndex];
};
