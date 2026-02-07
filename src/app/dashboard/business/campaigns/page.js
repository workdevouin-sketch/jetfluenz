'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import CampaignDetailsModal from '../../../../components/dashboard/CampaignDetailsModal';
import { Plus, Search, Filter, Trash2, Eye, Edit2, Calendar, DollarSign, Users, Target, Megaphone, Smartphone, ShoppingBag, Globe, Video, Gift, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import { createCampaign, getBusinessCampaigns, updateCampaign, deleteCampaign, completeCampaign } from '../../../../lib/campaigns';

export default function BusinessCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedCampaignDetails, setSelectedCampaignDetails] = useState(null);
    const totalSteps = 3;

    // Form State
    const [newCampaign, setNewCampaign] = useState({
        title: '',
        budget: '',
        description: '',
        requirements: '',
        goal: 'Brand Awareness',
        engagement: 'Suitable',
        launchDate: '',
        type: 'Paid'
    });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('jetfluenz_business_session'));
            if (user?.id) {
                const res = await getBusinessCampaigns(user.id);
                if (res.success) {
                    setCampaigns(res.campaigns);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Prevent premature submission: If not last step, Go Next
        if (step < totalSteps) {
            setStep(step + 1);
            return;
        }

        setCreateLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('jetfluenz_business_session'));

            if (editingCampaign) {
                // Update existing campaign
                const res = await updateCampaign(editingCampaign.id, newCampaign);
                if (res.success) {
                    await fetchCampaigns();
                    closeModal();
                } else {
                    alert('Failed to update campaign');
                }
            } else {
                // Create new campaign
                const campaignData = {
                    ...newCampaign,
                    businessId: user.id,
                    businessName: user.companyName || user.name || 'Business',
                    status: 'pending_approval'
                };

                const res = await createCampaign(campaignData);
                if (res.success) {
                    await fetchCampaigns();
                    closeModal();
                    alert('Campaign Posted! Waiting for Admin Approval.');
                } else {
                    alert('Failed to post campaign');
                }
            }
        } finally {
            setCreateLoading(false);
        }
    };

    const handleComplete = async (campaign) => {
        const totalBudget = parseInt(campaign.budget || 0);
        const influencerPayout = Math.round(totalBudget * 0.25);
        const platformFee = totalBudget - influencerPayout;

        if (confirm(`Mark "${campaign.title}" as Complete?\n\nThis will trigger the following transaction:\n--------------------------------\nTotal Budget: ₹${totalBudget}\nInfluencer Payout (25%): ₹${influencerPayout}\nPlatform Fee (75%): ₹${platformFee}\n\nProceed?`)) {
            try {
                const paymentData = {
                    amount: totalBudget, // Record total amount for filtering
                    payoutAmount: influencerPayout,
                    platformFee: platformFee,
                    influencerId: campaign.assignedTo?.id,
                    businessId: campaign.businessId,
                    campaignName: campaign.title,
                    breakdown: {
                        total: totalBudget,
                        influencer: influencerPayout,
                        platform: platformFee
                    }
                };
                const res = await completeCampaign(campaign.id, paymentData);
                if (res.success) {
                    await fetchCampaigns();
                    alert(`Campaign Completed! Payment of ₹${influencerPayout} generated for ${campaign.assignedTo?.name}.`);
                } else {
                    alert('Failed to complete campaign');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred');
            }
        }
    };

    const handleDelete = async (campaignId) => {
        if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            try {
                const res = await deleteCampaign(campaignId);
                if (res.success) {
                    setCampaigns(campaigns.filter(c => c.id !== campaignId));
                } else {
                    alert('Failed to delete campaign');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while deleting');
            }
        }
    };

    const openEditModal = (campaign) => {
        setEditingCampaign(campaign);
        setNewCampaign({
            title: campaign.title || '',
            budget: campaign.budget || '',
            description: campaign.description || '',
            requirements: campaign.requirements || '',
            goal: campaign.goal || 'Brand Awareness',
            engagement: campaign.engagement || 'Suitable',
            launchDate: campaign.launchDate || '',
            type: campaign.type || 'Paid'
        });
        setShowCreateModal(true);
    };

    const openCreateModal = () => {
        setEditingCampaign(null);
        setStep(1);
        setNewCampaign({
            title: '', budget: '', description: '', requirements: '', goal: 'Brand Awareness', engagement: 'Suitable', launchDate: '', type: 'Paid', niche: '', minFollowers: ''
        });
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingCampaign(null);
        setNewCampaign({
            title: '', budget: '', description: '', requirements: '', goal: 'Brand Awareness', engagement: 'Suitable', launchDate: '', type: 'Paid', niche: '', minFollowers: ''
        });
    };

    const handleInputChange = (e) => {
        setNewCampaign({ ...newCampaign, [e.target.name]: e.target.value });
    };

    return (
        <DashboardLayout role="business" title="My Campaigns">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h2 className="text-xl font-bold text-[#343C6A]">All Campaigns</h2>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button onClick={openCreateModal} className="bg-[#2008b9] text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Post New Campaign
                    </button>
                </div>
            </div>

            {/* Accepted Collabs Section */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-[#343C6A] mb-4">Accepted Collaborations</h3>
                {campaigns.filter(c => c.status === 'accepted').length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                        No accepted collaborations yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaigns.filter(c => c.status === 'accepted').map((campaign) => (
                            <div key={campaign.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                    {campaign.assignedTo?.name?.[0] || 'I'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-[#343C6A] truncate">{campaign.assignedTo?.name || 'Influencer'}</p>
                                    <p className="text-xs text-gray-500 truncate">Campaign: {campaign.title}</p>
                                    <p className="text-xs text-gray-500 truncate">Campaign: {campaign.title}</p>
                                    <p className="text-[10px] text-green-600 font-bold mt-1 bg-green-50 inline-block px-2 py-0.5 rounded-full mb-2">Started {campaign.acceptedAt ? new Date(campaign.acceptedAt.seconds * 1000).toLocaleDateString() : 'Recently'}</p>
                                    <button
                                        onClick={() => handleComplete(campaign)}
                                        className="block w-full text-center text-xs bg-[#2008b9] text-white py-1.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md shadow-blue-500/20"
                                    >
                                        Mark Complete & Pay
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Campaign List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">No campaigns yet. Create your first one!</p>
                    </div>
                ) : (
                    campaigns.map(campaign => (
                        <div key={campaign.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-[#343C6A]">{campaign.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${campaign.status === 'active' ? 'bg-green-100 text-green-600' :
                                        campaign.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                        {campaign.status === 'active' ? 'Active' : campaign.status === 'pending_approval' ? 'Pending Approval' : 'Draft'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {campaign.launchDate ? new Date(campaign.launchDate).toLocaleDateString() : new Date(campaign.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><span className="text-gray-500 font-bold">₹</span> {campaign.budget}</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.applicants?.length || 0} Applied</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <button onClick={() => setSelectedCampaignDetails(campaign)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                    <Eye className="w-5 h-5" />
                                </button>
                                {['draft', 'pending_approval', 'rejected'].includes(campaign.status) ? (
                                    <button onClick={() => openEditModal(campaign)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Campaign">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button disabled className="p-2 text-gray-200 cursor-not-allowed" title="Cannot edit approved/active campaigns">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => handleDelete(campaign.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Campaign">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-[#343C6A]">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">Close</button>
                        </div>

                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

                            {/* Progress Bar */}
                            <div className="flex items-center gap-2 mb-8">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`h-2 rounded-full flex-1 transition-all ${s <= step ? 'bg-[#2008b9]' : 'bg-gray-100'}`}></div>
                                ))}
                            </div>

                            {/* Step 1: The Vision */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center mb-6">
                                        <h4 className="text-xl font-bold text-[#343C6A]">Step 1: The Vision 🎯</h4>
                                        <p className="text-gray-500 text-sm">What do you want to achieve?</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Title</label>
                                        <input name="title" value={newCampaign.title} onChange={handleInputChange} placeholder="e.g. Summer Glow 2026" className="w-full p-4 text-lg border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#2008b9] transition-colors" required autoFocus />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">What's your main goal?</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {[
                                                { icon: Megaphone, label: "Brand Awareness", value: "Brand Awareness" },
                                                { icon: Smartphone, label: "App Download", value: "App Download" },
                                                { icon: ShoppingBag, label: "Product Sales", value: "Product Sales" },
                                                { icon: Globe, label: "Website Traffic", value: "Website Traffic" },
                                                { icon: Video, label: "UGC Content", value: "UGC" },
                                            ].map((option) => (
                                                <button
                                                    type="button"
                                                    key={option.value}
                                                    onClick={() => setNewCampaign({ ...newCampaign, goal: option.value })}
                                                    className={`w-full cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2 text-center transition-all hover:shadow-md ${newCampaign.goal === option.value ? 'border-[#2008b9] bg-blue-50 text-[#2008b9]' : 'border-gray-100 text-gray-500 hover:border-blue-200'}`}
                                                >
                                                    <option.icon className="w-6 h-6" />
                                                    <span className="text-xs font-bold">{option.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: The Offer */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center mb-6">
                                        <h4 className="text-xl font-bold text-[#343C6A]">Step 2: The Offer 💸</h4>
                                        <p className="text-gray-500 text-sm">Define the budget and timeline.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { icon: CreditCard, label: "Paid Campaign", value: "Paid", desc: "Monetary compensation" },
                                            { icon: Gift, label: "Gifted / Barter", value: "Gifted", desc: "Free products only" }
                                        ].map((option) => (
                                            <button
                                                type="button"
                                                key={option.value}
                                                onClick={() => setNewCampaign({ ...newCampaign, type: option.value })}
                                                className={`w-full cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center gap-2 text-center transition-all hover:shadow-md ${newCampaign.type === option.value ? 'border-[#2008b9] bg-blue-50 text-[#2008b9]' : 'border-gray-100 text-gray-500 hover:border-blue-200'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${newCampaign.type === option.value ? 'bg-white' : 'bg-gray-100'}`}>
                                                    <option.icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold">{option.label}</span>
                                                <span className="text-[10px] opacity-70">{option.desc}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Budget / Value (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input name="budget" value={newCampaign.budget} onChange={handleInputChange} placeholder="5000" className="w-full p-3 pl-8 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9] font-bold" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Launch Date</label>
                                            <input type="date" name="launchDate" value={newCampaign.launchDate} onChange={handleInputChange} className="w-full p-3 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9]" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: The Details */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="text-center mb-6">
                                        <h4 className="text-xl font-bold text-[#343C6A]">Step 3: The Details 📝</h4>
                                        <p className="text-gray-500 text-sm">Who are you looking for?</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Target Niche</label>
                                            <select
                                                name="niche"
                                                value={newCampaign.niche}
                                                onChange={handleInputChange}
                                                className="w-full p-3 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9] bg-white"
                                            >
                                                <option value="">Any Niche</option>
                                                <option value="Fashion">Fashion</option>
                                                <option value="Beauty">Beauty</option>
                                                <option value="Tech">Tech</option>
                                                <option value="Lifestyle">Lifestyle</option>
                                                <option value="Fitness">Fitness</option>
                                                <option value="Travel">Travel</option>
                                                <option value="Food">Food</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Min. Followers</label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    name="minFollowers"
                                                    value={newCampaign.minFollowers}
                                                    onChange={handleInputChange}
                                                    placeholder="1000"
                                                    className="w-full p-3 pl-10 border-2 border-gray-100 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Engagement Rate</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Suitable (Any)", "Fair (1-5%)", "Good (5-10%)", "Excellent (>10%)"].map(rate => (
                                                <button
                                                    type="button"
                                                    key={rate}
                                                    onClick={() => setNewCampaign({ ...newCampaign, engagement: rate.split(' ')[0] })}
                                                    className={`cursor-pointer px-4 py-2 rounded-full text-sm font-bold border transition-all ${newCampaign.engagement === rate.split(' ')[0] ? 'bg-[#2008b9] text-white border-[#2008b9]' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'}`}
                                                >
                                                    {rate}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Description</label>
                                        <textarea
                                            name="description"
                                            value={newCampaign.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            className="w-full p-4 border-2 border-gray-100 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#2008b9]"
                                            placeholder="Tell influencers about your brand, requirements, and deliverables..."
                                        ></textarea>
                                    </div>
                                </div>
                            )}


                            {/* Navigation */}
                            <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                                {step > 1 ? (
                                    <button type="button" onClick={() => setStep(step - 1)} className="text-gray-500 font-bold hover:text-[#343C6A] flex items-center gap-1 pl-2">
                                        <ChevronLeft className="w-4 h-4" /> Back
                                    </button>
                                ) : (
                                    <div></div> // Spacer
                                )}

                                {step < totalSteps ? (
                                    <button type="button" onClick={() => setStep(step + 1)} className="bg-[#2008b9] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition-all flex items-center gap-2">
                                        Next Step <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleSave} disabled={createLoading} className="bg-[#2008b9] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition-all">
                                        {createLoading ? 'Launching...' : '🚀 Launch Campaign'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Campaign Details Modal */}
            {selectedCampaignDetails && (
                <CampaignDetailsModal
                    campaign={selectedCampaignDetails}
                    onClose={() => setSelectedCampaignDetails(null)}
                />
            )}
        </DashboardLayout>
    );
}
