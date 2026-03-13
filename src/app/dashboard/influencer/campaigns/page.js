'use client';

import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Search, MapPin, CheckCircle, Users, TrendingUp, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllCampaigns, applyToCampaign } from '../../../../lib/campaigns';
import { useAuth } from '@/contexts/AuthContext';
import InfluencerCampaignModal from '../../../../components/dashboard/InfluencerCampaignModal';
import Toast from '../../../../components/ui/Toast';

// ─────────────────────────────────────────────────────────────────────────────
// MATCHING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the influencer's average engagement rate (%) from
 * their instagram_stats media data.
 */
function calculateEngagementRate(user) {
    const media = user?.instagram_stats?.profile?.media?.data || [];
    const followers = user?.instagram_stats?.profile?.followers_count || 0;
    if (!followers || media.length === 0) return 0;

    const totalInteractions = media.reduce((sum, post) => {
        return sum + (post.like_count || 0) + (post.comments_count || 0);
    }, 0);

    return (totalInteractions / media.length / followers) * 100;
}

/**
 * Maps the campaign's engagement requirement to a minimum engagement rate %.
 */
const ENGAGEMENT_THRESHOLDS = {
    Suitable: 0,   // Any engagement is fine
    Fair: 1,       // ≥ 1%
    Good: 5,       // ≥ 5%
    Excellent: 10  // ≥ 10%
};

/**
 * Returns true if the influencer meets ALL hard campaign requirements,
 * false otherwise.
 *
 * Rules:
 *  1. Niche:        campaign.niche must match user.niche (case-insensitive),
 *                   OR campaign has no niche (open to all).
 *  2. Followers:    influencer followers ≥ campaign.minFollowers (if set).
 *  3. Engagement:   influencer engagement rate ≥ campaign engagement threshold (if not "Suitable").
 */
function matchesCampaign(campaign, user) {
    if (!user) return false;

    // 1. Niche check
    if (campaign.niche && campaign.niche !== '') {
        const userNiche = (user.niche || '').toLowerCase().trim();
        const campaignNiche = campaign.niche.toLowerCase().trim();
        if (userNiche !== campaignNiche) return false;
    }

    // 2. Min followers check
    if (campaign.minFollowers && parseInt(campaign.minFollowers) > 0) {
        const followers = user.instagram_stats?.profile?.followers_count || 0;
        if (followers < parseInt(campaign.minFollowers)) return false;
    }

    // 3. Engagement rate check
    if (campaign.engagement && campaign.engagement !== 'Suitable') {
        const minRate = ENGAGEMENT_THRESHOLDS[campaign.engagement] ?? 0;
        const userRate = calculateEngagementRate(user);
        if (userRate < minRate) return false;
    }

    return true;
}

/**
 * Returns a numeric score (0–100) representing how strong the match is.
 * Used to sort the "Recommended" tab.
 *
 *  +50 pts — Niche matches
 *  +30 pts — Follower count qualifies
 *  +20 pts — Engagement rate qualifies
 */
function getMatchScore(campaign, user) {
    if (!user) return 0;
    let score = 0;

    // Niche (50 pts)
    const hasNicheReq = campaign.niche && campaign.niche !== '';
    if (!hasNicheReq) {
        score += 25; // Neutral — open to all, partial credit
    } else {
        const nicheMatch = (user.niche || '').toLowerCase().trim() === campaign.niche.toLowerCase().trim();
        if (nicheMatch) score += 50;
    }

    // Followers (30 pts)
    if (!campaign.minFollowers || parseInt(campaign.minFollowers) <= 0) {
        score += 15; // No requirement, partial credit
    } else {
        const followers = user.instagram_stats?.profile?.followers_count || 0;
        if (followers >= parseInt(campaign.minFollowers)) score += 30;
    }

    // Engagement (20 pts)
    if (!campaign.engagement || campaign.engagement === 'Suitable') {
        score += 10; // No requirement, partial credit
    } else {
        const minRate = ENGAGEMENT_THRESHOLDS[campaign.engagement] ?? 0;
        const userRate = calculateEngagementRate(user);
        if (userRate >= minRate) score += 20;
    }

    return score;
}

/**
 * Returns an array of human-readable reasons the influencer qualifies.
 * Used on the campaign card to show a "match badge".
 */
function getMatchReasons(campaign, user) {
    const reasons = [];
    if (!user) return reasons;

    const hasNicheReq = campaign.niche && campaign.niche !== '';
    if (hasNicheReq && (user.niche || '').toLowerCase().trim() === campaign.niche.toLowerCase().trim()) {
        reasons.push({ label: `${campaign.niche} niche`, color: 'text-purple-600 bg-purple-50 border-purple-100' });
    }
    if (!hasNicheReq) {
        reasons.push({ label: 'Open to all niches', color: 'text-gray-500 bg-gray-50 border-gray-100' });
    }

    const followers = user.instagram_stats?.profile?.followers_count || 0;
    if (campaign.minFollowers && parseInt(campaign.minFollowers) > 0) {
        if (followers >= parseInt(campaign.minFollowers)) {
            reasons.push({ label: `${(followers / 1000).toFixed(1)}k followers ✓`, color: 'text-blue-600 bg-blue-50 border-blue-100' });
        }
    }

    if (campaign.engagement && campaign.engagement !== 'Suitable') {
        const minRate = ENGAGEMENT_THRESHOLDS[campaign.engagement] ?? 0;
        const userRate = calculateEngagementRate(user);
        if (userRate >= minRate) {
            reasons.push({ label: `${userRate.toFixed(1)}% engagement ✓`, color: 'text-green-600 bg-green-50 border-green-100' });
        }
    }

    return reasons;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function InfluencerCampaigns() {
    const { userData: user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('recommended');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        const res = await getAllCampaigns();
        if (res.success) {
            setCampaigns(res.campaigns);
        }
        setLoading(false);
    };

    const handleApply = async (campaign) => {
        if (!user) return showToast('Please log in to apply.', 'error');
        if (!confirm(`Apply for "${campaign.title}"?`)) return;

        setActionLoading(campaign.id);
        try {
            const res = await applyToCampaign(campaign.id, {
                id: user.id,
                name: user.name,
                email: user.email
            });

            if (res.success) {
                showToast('Application submitted!');
                setSelectedCampaign(null); // Close modal if open
                fetchCampaigns();
            } else {
                showToast('Failed to apply: ' + res.error, 'error');
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleAccept = async (campaign) => { /* No longer used — business selects directly */ };
    const handleReject = async (campaign) => { /* No longer used */ };

    // ── Derived campaign lists ──────────────────────────────────────────────

    const activeCampaigns = campaigns.filter(c => c.status === 'active');

    // Already applied campaigns (any status)
    const myApplications = campaigns.filter(c =>
        (c.applicants || []).some(app => app.id === user?.id)
    );
    const appliedIds = new Set(myApplications.map(c => c.id));

    // Offers specifically directed at this influencer
    const myOffers = campaigns.filter(c =>
        c.status === 'offered' && c.assignedTo?.id === user?.id
    );

    /**
     * Browse tab:
     *  - Active campaigns the influencer hasn't applied to yet
     *  - Filtered by matchesCampaign() — ONLY campaigns they qualify for
     */
    const browseCampaigns = activeCampaigns
        .filter(c => !appliedIds.has(c.id))
        .filter(c => matchesCampaign(c, user));

    /**
     * Recommended tab:
     *  - Subset of browseCampaigns sorted by match score (highest first)
     *  - Shows only campaigns with score ≥ 50 (at least one strong signal)
     */
    const recommendedCampaigns = browseCampaigns
        .map(c => ({ campaign: c, score: getMatchScore(c, user) }))
        .filter(({ score }) => score >= 50)
        .sort((a, b) => b.score - a.score)
        .map(({ campaign }) => campaign);

    // Search filter applied on top of tab selection
    const applySearch = (list) => {
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(c =>
            c.title?.toLowerCase().includes(q) ||
            c.businessName?.toLowerCase().includes(q) ||
            c.niche?.toLowerCase().includes(q)
        );
    };

    let displayedCampaigns = [];
    if (activeTab === 'recommended') displayedCampaigns = applySearch(recommendedCampaigns);
    if (activeTab === 'applications') displayedCampaigns = applySearch(myApplications);

    return (
        <DashboardLayout role="influencer" title="Campaigns">

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center space-x-6 border-b border-gray-200 w-full md:w-auto overflow-x-auto">
                    {['recommended', 'applications'].map((tab) => (
                        <button
                            key={tab}
                            className={`pb-3 px-2 text-base font-medium transition-all capitalize border-b-2 whitespace-nowrap ${activeTab === tab
                                ? 'border-[#2008b9] text-[#2008b9]'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'recommended' ? (
                                <span className="flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5" />
                                    Recommended
                                    {recommendedCampaigns.length > 0 && (
                                        <span className="bg-[#2008b9] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                            {recommendedCampaigns.length}
                                        </span>
                                    )}
                                </span>
                            ) : 'My Applications'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search campaigns..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Campaign Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#2008b9]/20 border-t-[#2008b9] animate-spin" />
                    <p className="text-sm text-gray-400 font-medium">Finding campaigns for you...</p>
                </div>
            ) : displayedCampaigns.length === 0 ? (
                <EmptyState tab={activeTab} user={user} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {displayedCampaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            user={user}
                            onApply={handleApply}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            loading={actionLoading === campaign.id}
                            type={activeTab}
                            onClick={() => setSelectedCampaign(campaign)}
                        />
                    ))}
                </div>
            )}

            {/* Campaign Details Modal */}
            {selectedCampaign && (
                <InfluencerCampaignModal
                    campaign={selectedCampaign}
                    userApplied={appliedIds.has(selectedCampaign.id)}
                    loading={actionLoading === selectedCampaign.id}
                    onClose={() => setSelectedCampaign(null)}
                    onApply={handleApply}
                />
            )}

            {/* Notifications */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_CONFIG = {
    recommended: {
        icon: (
            <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16">
                <path d="M32 8l6 13h14l-11 8 4 14-13-9-13 9 4-14L12 21h14z" stroke="#2008b9" strokeWidth="3" strokeLinejoin="round" />
            </svg>
        ),
        heading: 'No strong matches yet',
        subtext: 'The Recommended tab surfaces campaigns that align closely with your niche, audience size, and engagement rate.',
        tip: '💡 Tip: A complete profile with Instagram stats gives the algorithm more to work with.',
    },
    applications: {
        icon: (
            <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16">
                <rect x="12" y="10" width="40" height="48" rx="5" stroke="#2008b9" strokeWidth="3" />
                <path d="M22 24h20M22 34h14M22 44h8" stroke="#2008b9" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        ),
        heading: "You haven't applied yet",
        subtext: "Browse active campaigns that match your profile and submit your first application.",
        tip: "💡 Tip: Businesses review applications quickly — don't wait!",
    },
};

function EmptyState({ tab }) {
    const config = EMPTY_CONFIG[tab] || EMPTY_CONFIG.recommended;

    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border border-gray-100">
            {/* Icon container */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-6 shadow-inner">
                {config.icon}
            </div>

            {/* Heading */}
            <h3 className="text-xl font-bold text-[#343C6A] mb-2 text-center">
                {config.heading}
            </h3>

            {/* Subtext */}
            <p className="text-sm text-gray-400 text-center max-w-sm leading-relaxed mb-6">
                {config.subtext}
            </p>

            {/* Tip pill */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 text-xs text-amber-700 font-medium text-center max-w-sm">
                {config.tip}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN CARD
// ─────────────────────────────────────────────────────────────────────────────

const NICHE_COLORS = {
    Fashion: { text: 'text-indigo-600', border: 'border-indigo-100', light: 'bg-indigo-50/30', bg: 'bg-indigo-600' },
    Beauty: { text: 'text-indigo-600', border: 'border-indigo-100', light: 'bg-indigo-50/30', bg: 'bg-indigo-600' },
    Tech: { text: 'text-indigo-600', border: 'border-indigo-100', light: 'bg-indigo-50/30', bg: 'bg-indigo-600' },
    Lifestyle: { text: 'text-indigo-600', border: 'border-indigo-100', light: 'bg-indigo-50/30', bg: 'bg-indigo-600' },
    Fitness: { text: 'text-indigo-600', border: 'border-indigo-100', light: 'bg-indigo-50/30', bg: 'bg-indigo-600' },
    Travel: { text: 'text-indigo-600', border: 'border-indigo-100', light: 'bg-indigo-50/30', bg: 'bg-indigo-600' },
    Food: { text: 'text-indigo-600', border: 'border-indigo-100', light: 'bg-indigo-50/30', bg: 'bg-indigo-600' },
    General: { text: 'text-gray-600', border: 'border-gray-100', light: 'bg-gray-50/30', bg: 'bg-gray-400' },
};

const DEFAULT_COLOR = { bg: 'bg-[#2008b9]', light: 'bg-gray-50/50', text: 'text-gray-600', border: 'border-gray-200' };

const CampaignCard = ({ campaign, user, onApply, onAccept, onReject, loading, type, onClick }) => {
    const niche = campaign.niche || 'General';
    const colors = NICHE_COLORS[niche] || NICHE_COLORS.General;
    const isPaid = campaign.type === 'Paid';
    const payout = Math.round(parseInt(campaign.budget || 0) * 0.25);

    // Application status
    const application = (campaign.applicants || []).find(a => a.id === user?.id);
    const appStatus = application?.status || 'applied';

    const statusStyles = {
        accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
        rejected: 'bg-red-50 text-red-600 border-red-200',
        applied: 'bg-blue-50 text-blue-600 border-blue-200',
    };

    const statusLabel = {
        accepted: '✓ Selected',
        in_progress: '🚀 In Progress',
        rejected: '✕ Not Selected',
        applied: '⏳ Pending'
    };

    // Match data (browse/recommended only)
    const matchReasons = (type === 'browse' || type === 'recommended') ? getMatchReasons(campaign, user) : [];
    const matchScore = (type === 'browse' || type === 'recommended') ? getMatchScore(campaign, user) : null;

    return (
        <div
            onClick={onClick}
            tabIndex={-1}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/30 transition-all duration-300 group flex flex-col overflow-hidden hover:-translate-y-0.5 cursor-pointer max-w-sm outline-none focus:outline-none focus-visible:outline-none ring-0 select-none"
        >

            {/* ── Card Header ── */}
            <div className={`relative px-5 pt-5 pb-3 bg-gray-50/30`}>

                {/* Type pill — top right */}
                <div className="absolute top-4 right-4">
                    {type === 'applications' ? (
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border capitalize ${statusStyles[appStatus] || statusStyles.applied}`}>
                            {appStatus}
                        </span>
                    ) : (
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            {isPaid ? '💰 Paid' : '🎁 Gifted'}
                        </span>
                    )}
                </div>

                {/* Business avatar + name */}
                <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm`}>
                        {campaign.businessName?.[0]?.toUpperCase() || 'B'}
                    </div>
                    <div>
                        <p className="font-bold text-[#343C6A] text-sm leading-tight">{campaign.businessName || 'Brand'}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {campaign.location || 'Global'}
                        </p>
                    </div>
                </div>

                {/* Niche + goal tags */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-gray-50 text-gray-500 border-gray-200`}>
                        {niche}
                    </span>
                    {campaign.goal && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-white text-gray-500 border-gray-200">
                            {campaign.goal}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Campaign title ── */}
            <div className="px-5 pt-3 pb-2">
                <h4 className="font-bold text-[15px] text-gray-800 leading-tight group-hover:text-[#2008b9] transition-colors duration-200 line-clamp-1">
                    {campaign.title}
                </h4>
                {campaign.description && (
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 leading-normal italic">"{campaign.description}"</p>
                )}
            </div>

            {/* ── Stats row ── */}
            <div className="px-5 pb-3 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-gray-50/50 rounded-lg p-2 border border-gray-100">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Followers</p>
                        <p className="font-bold text-gray-700 text-[11px]">
                            {campaign.minFollowers && parseInt(campaign.minFollowers) > 0
                                ? `${(parseInt(campaign.minFollowers) / 1000).toFixed(1)}k+`
                                : 'Any'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50/50 rounded-lg p-2 border border-gray-100">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Engagement</p>
                        <p className="font-bold text-gray-700 text-[11px]">{campaign.engagement || 'Any'}</p>
                    </div>
                </div>
            </div>

            {/* ── Match reasons (browse/recommended) ── */}
            {matchReasons.length > 0 && (
                <div className="px-5 pb-2 flex flex-wrap gap-1 items-center">
                    {matchReasons.map((r, i) => (
                        <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${r.color}`}>
                            {r.label}
                        </span>
                    ))}
                </div>
            )}

            {/* ── Budget highlight + deadline ── */}
            <div className="mx-5 mb-4 mt-auto rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 flex items-center justify-between">
                <div>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Earnings</p>
                    <p className="text-lg font-black text-[#2008b9] tracking-tight">
                        ₹{payout.toLocaleString()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Deadline</p>
                    <span className="text-[10px] font-bold text-gray-600">
                        {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Flexible'}
                    </span>
                </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="px-5 pb-5">
                {type === 'recommended' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onApply(campaign);
                        }}
                        disabled={loading}
                        className="w-full py-2.5 rounded-lg bg-[#2008b9] text-white font-bold text-xs hover:bg-blue-800 shadow-md shadow-blue-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                        {loading
                            ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> ...</>
                            : <>Apply Now <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                        }
                    </button>
                )}

                {type === 'applications' && (
                    <div className={`w-full py-2 rounded-lg text-center text-[10px] font-bold border select-none ${statusStyles[appStatus] || statusStyles.applied}`}>
                        {statusLabel[appStatus] || '⏳ Pending'}
                    </div>
                )}
            </div>
        </div>
    );
};

