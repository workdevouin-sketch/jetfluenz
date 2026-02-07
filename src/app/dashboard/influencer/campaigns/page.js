'use client';

import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, CheckCircle, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllCampaigns, applyToCampaign, acceptCampaign, rejectCampaign } from '../../../../lib/campaigns';

export default function InfluencerCampaigns() {
    const [activeTab, setActiveTab] = useState('browse');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // campaignId check for loading

    useEffect(() => {
        // Load user from local storage
        const storedUser = localStorage.getItem('jetfluenz_influencer_session');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
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
        if (!user) return alert('Please log in to apply.');
        if (!confirm(`Apply for "${campaign.title}"?`)) return;

        setActionLoading(campaign.id);
        try {
            const res = await applyToCampaign(campaign.id, {
                id: user.id,
                name: user.name,
                email: user.email
            });

            if (res.success) {
                alert('Application submitted!');
                fetchCampaigns();
            } else {
                alert('Failed to apply: ' + res.error);
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleAccept = async (campaign) => {
        if (!confirm(`Accept offer for "${campaign.title}"?`)) return;
        setActionLoading(campaign.id);
        try {
            const res = await acceptCampaign(campaign.id);
            if (res.success) {
                alert('Offer Accepted!');
                fetchCampaigns();
            } else {
                alert('Failed: ' + res.error);
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (campaign) => {
        if (!confirm(`Reject offer for "${campaign.title}"?`)) return;
        setActionLoading(campaign.id);
        try {
            const res = await rejectCampaign(campaign.id);
            if (res.success) {
                fetchCampaigns();
            }
        } finally {
            setActionLoading(null);
        }
    };

    // Filter campaigns
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const myApplications = campaigns.filter(c => (c.applicants || []).some(app => app.id === user?.id));
    const myOffers = campaigns.filter(c => c.status === 'offered' && c.assignedTo?.id === user?.id);

    // Recommended Logic
    const recommendedCampaigns = activeCampaigns.filter(c => {
        if (!user) return false;
        // 1. Niche Match (strict)
        const nicheMatch = c.niche && user.niche && c.niche.toLowerCase() === user.niche.toLowerCase();

        // 2. Follower Count Check (if specified by business)
        let followerMatch = true;
        if (c.minFollowers) {
            const userFollowers = user.instagram_stats?.profile?.followers_count || 0;
            followerMatch = userFollowers >= parseInt(c.minFollowers);
        }

        return nicheMatch && followerMatch;
    });

    let displayedCampaigns = [];
    if (activeTab === 'browse') displayedCampaigns = activeCampaigns.filter(c => !(c.applicants || []).some(app => app.id === user?.id));
    if (activeTab === 'recommended') displayedCampaigns = recommendedCampaigns.filter(c => !(c.applicants || []).some(app => app.id === user?.id));;
    if (activeTab === 'applications') displayedCampaigns = myApplications;
    if (activeTab === 'offers') displayedCampaigns = myOffers;

    return (
        <DashboardLayout role="influencer" title="Campaigns">
            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center space-x-6 border-b border-gray-200 w-full md:w-auto overflow-x-auto">
                    {['browse', 'recommended', 'applications', 'offers'].map((tab) => (
                        <button
                            key={tab}
                            className={`pb-3 px-2 text-base font-medium transition-all capitalize border-b-2 whitespace-nowrap ${activeTab === tab
                                ? 'border-[#2008b9] text-[#2008b9]'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'browse' ? 'Browse Opportunities' : tab === 'recommended' ? 'Recommended for You' : tab === 'applications' ? 'My Applications' : 'My Offers'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Campaign Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading campaigns...</div>
            ) : displayedCampaigns.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
                    {activeTab === 'browse' ? "No active campaigns found at the moment." :
                        activeTab === 'recommended' ? "No campaigns match your niche/profile right now." :
                            activeTab === 'applications' ? "You haven't applied to any campaigns yet." :
                                "No offers yet."}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

const CampaignCard = ({ campaign, user, onApply, onAccept, onReject, loading, type }) => {

    // Status Badge Logic
    let statusBadge = null;

    if (type === 'applications') {
        const application = (campaign.applicants || []).find(a => a.id === user?.id);
        const status = application?.status || 'Applied';
        statusBadge = (
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${status === 'accepted' ? 'bg-green-100 text-green-700' :
                status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                }`}>
                {status}
            </span>
        );
    } else if (type === 'offers') {
        statusBadge = (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                <Users className="w-3 h-3" />
                Special Offer
            </span>
        );
    } else {
        // In browse mode, show match score or new tag
        statusBadge = (
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {campaign.platform || 'Instagram'}
            </span>
        );
    }

    return (
        <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full hover:-translate-y-1 relative overflow-hidden">
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 w-full h-1 ${campaign.type === 'Paid' ? 'bg-green-500' : 'bg-orange-500'}`}></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-5 mt-2">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-[#343C6A] font-bold text-lg shadow-inner">
                        {campaign.businessName?.[0] || 'B'}
                    </div>
                    <div>
                        <h3 className="font-bold text-[#343C6A] text-base leading-tight">{campaign.businessName || 'Business Name'}</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {campaign.location || 'Global'}
                        </p>
                    </div>
                </div>
                {statusBadge}
            </div>

            {/* Campaign Title & Niche */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border border-gray-200 px-2 py-0.5 rounded-md">
                        {campaign.niche || 'General'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${campaign.type === 'Paid' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                        {campaign.type || 'Campaign'}
                    </span>
                </div>
                <h4 className="font-extrabold text-xl text-gray-800 leading-snug group-hover:text-[#2008b9] transition-colors line-clamp-2" title={campaign.title}>
                    {campaign.title}
                </h4>
            </div>

            {/* Requirements Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Followers</p>
                    <p className="font-bold text-gray-700 text-sm flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" />
                        {campaign.minFollowers ? `${(parseInt(campaign.minFollowers) / 1000).toFixed(1)}k+` : 'Any'}
                    </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Engagement</p>
                    <p className="font-bold text-gray-700 text-sm flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-purple-500" />
                        {campaign.engagement ? `${campaign.engagement}%` : 'N/A'}
                    </p>
                </div>
            </div>

            {/* Budget / Value */}
            <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between mb-6">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-0.5">Budget</p>
                    <p className="text-2xl font-extrabold text-[#343C6A]">
                        ₹{Math.round(parseInt(campaign.budget || 0) * 0.25).toLocaleString()}
                    </p>
                </div>
                {campaign.deadline && (
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-0.5">Deadline</p>
                        <p className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                            {new Date(campaign.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3">
                {(type === 'browse' || type === 'recommended') && (
                    <button
                        onClick={() => onApply(campaign)}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-[#2008b9] text-white font-bold hover:bg-blue-800 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</span> : 'Apply Now'}
                    </button>
                )}

                {type === 'offers' && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => onReject(campaign)}
                            disabled={loading}
                            className="flex-1 py-3.5 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => onAccept(campaign)}
                            disabled={loading}
                            className="flex-[2] py-3.5 rounded-xl bg-[#2008b9] text-white font-bold hover:bg-blue-800 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                        >
                            Accept Offer
                        </button>
                    </div>
                )}

                {type === 'applications' && (
                    <div className="w-full py-3.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-center border border-gray-200 select-none flex items-center justify-center gap-2">
                        {statusBadge}
                    </div>
                )}
            </div>
        </div>
    );
};
