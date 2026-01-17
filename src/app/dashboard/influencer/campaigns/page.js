'use client';

import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Search, Filter, Briefcase, MapPin, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllCampaigns, applyToCampaign } from '../../../../lib/campaigns';

export default function InfluencerCampaigns() {
    const [activeTab, setActiveTab] = useState('browse');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [applying, setApplying] = useState(null);

    useEffect(() => {
        // Load user from local storage
        const storedUser = localStorage.getItem('user');
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

        setApplying(campaign.id);
        try {
            const res = await applyToCampaign(campaign.id, {
                id: user.id,
                name: user.name,
                email: user.email
            });

            if (res.success) {
                alert('Application submitted! The business will review your profile.');
                fetchCampaigns(); // Refresh to update status
            } else {
                alert('Failed to apply: ' + res.error);
            }
        } finally {
            setApplying(null);
        }
    };

    // Filter campaigns
    const activeCampaigns = campaigns.filter(c => c.status === 'active');

    // For "My Applications", we filter campaigns where the user is in the applicants list
    const myApplications = campaigns.filter(c =>
        (c.applicants || []).some(app => app.id === user?.id)
    );

    const displayedCampaigns = activeTab === 'browse'
        ? activeCampaigns.filter(c => !(c.applicants || []).some(app => app.id === user?.id)) // Show only ones NOT applied to yet? Or valid ones. Let's show all active, but mark applied. actually prompt implies "Accept" workflow. Let's show unapplied ones in Browse.
        : myApplications;

    return (
        <DashboardLayout role="influencer" title="Campaigns">
            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center space-x-6 border-b border-gray-200 w-full md:w-auto overflow-x-auto">
                    {['browse', 'applications'].map((tab) => (
                        <button
                            key={tab}
                            className={`pb-3 px-2 text-base font-medium transition-all capitalize border-b-2 whitespace-nowrap ${activeTab === tab
                                ? 'border-[#2008b9] text-[#2008b9]'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'browse' ? 'Browse Opportunities' : 'My Applications'}
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
                            applying={applying === campaign.id}
                            isApplied={activeTab === 'applications'}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

const CampaignCard = ({ campaign, user, onApply, applying, isApplied }) => {
    // Check if user accepted/applied
    const application = (campaign.applicants || []).find(a => a.id === user?.id);
    const status = application ? application.status : null; // 'accepted' usually

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
                {isApplied ? (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Accepted
                    </span>
                ) : (
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">{campaign.status}</span>
                )}
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

            {!isApplied ? (
                <button
                    onClick={() => onApply(campaign)}
                    disabled={applying}
                    className="w-full py-3 rounded-xl border border-[#2008b9] text-[#2008b9] font-bold hover:bg-[#2008b9] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {applying ? 'Accepting...' : 'Accept Collaboration'}
                </button>
            ) : (
                <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-bold border border-transparent cursor-default">
                    Collaboration Accepted
                </button>
            )}
        </div>
    );
};
