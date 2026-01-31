'use client';

import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, CheckCircle } from 'lucide-react';
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

    let displayedCampaigns = [];
    if (activeTab === 'browse') displayedCampaigns = activeCampaigns.filter(c => !(c.applicants || []).some(app => app.id === user?.id));
    if (activeTab === 'applications') displayedCampaigns = myApplications;
    if (activeTab === 'offers') displayedCampaigns = myOffers;

    return (
        <DashboardLayout role="influencer" title="Campaigns">
            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center space-x-6 border-b border-gray-200 w-full md:w-auto overflow-x-auto">
                    {['browse', 'applications', 'offers'].map((tab) => (
                        <button
                            key={tab}
                            className={`pb-3 px-2 text-base font-medium transition-all capitalize border-b-2 whitespace-nowrap ${activeTab === tab
                                ? 'border-[#2008b9] text-[#2008b9]'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'browse' ? 'Browse Opportunities' : tab === 'applications' ? 'My Applications' : 'My Offers'}
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
                    {activeTab === 'browse' ? "No active campaigns found at the moment." : "You haven't applied to any campaigns yet."}
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
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                {status}
            </span>
        );
    } else if (type === 'offers') {
        statusBadge = (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                Special Offer
            </span>
        );
    } else {
        statusBadge = (
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">{campaign.status}</span>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                        {campaign.businessName?.[0] || 'B'}
                    </div>
                    <div>
                        <h3 className="font-bold text-[#343C6A] text-sm line-clamp-1">{campaign.businessName || 'Business'}</h3>
                        <p className="text-xs text-gray-500">{campaign.goal || 'Campaign'}</p>
                    </div>
                </div>
                {statusBadge}
            </div>

            <h4 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-[#2008b9] transition-colors line-clamp-1">{campaign.title}</h4>
            <p className="text-sm text-gray-500 mb-6 line-clamp-3 flex-grow">
                {campaign.description}
            </p>

            <div className="space-y-3 mb-6 mt-auto">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">${campaign.budget}</span>
                </div>
                {campaign.startDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Starts: {campaign.startDate}</span>
                    </div>
                )}
            </div>

            {type === 'browse' && (
                <button
                    onClick={() => onApply(campaign)}
                    disabled={loading}
                    className="w-full py-3 rounded-xl border border-[#2008b9] text-[#2008b9] font-bold hover:bg-[#2008b9] hover:text-white transition-all disabled:opacity-50"
                >
                    {loading ? 'Applying...' : 'Apply Now'}
                </button>
            )}

            {type === 'offers' && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onReject(campaign)}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                        {loading ? '...' : 'Reject'}
                    </button>
                    <button
                        onClick={() => onAccept(campaign)}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-[#2008b9] text-white font-bold hover:bg-blue-800 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Accepting...' : 'Accept Offer'}
                    </button>
                </div>
            )}
            {type === 'applications' && (
                <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-bold border border-transparent cursor-default">
                    View Status
                </button>
            )}
        </div>
    );
};
