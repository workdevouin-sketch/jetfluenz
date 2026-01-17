'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Plus, Search, Filter, Trash2, Eye, Edit2, Calendar, DollarSign, Users } from 'lucide-react';
import { createCampaign, getBusinessCampaigns, updateCampaign, deleteCampaign } from '../../../../lib/campaigns';

export default function BusinessCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);

    // Form State
    const [newCampaign, setNewCampaign] = useState({
        title: '',
        budget: '',
        description: '',
        requirements: '',
        goal: 'Brand Awareness',
        engagement: 'Suitable',
        startDate: '',
        endDate: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('jetfluenz_user'));
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
        setCreateLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('jetfluenz_user'));

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
            startDate: campaign.startDate || '',
            endDate: campaign.endDate || ''
        });
        setShowCreateModal(true);
    };

    const openCreateModal = () => {
        setEditingCampaign(null);
        setNewCampaign({
            title: '', budget: '', description: '', requirements: '', goal: 'Brand Awareness', engagement: 'Suitable', startDate: '', endDate: ''
        });
        setShowCreateModal(true);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setEditingCampaign(null);
        setNewCampaign({
            title: '', budget: '', description: '', requirements: '', goal: 'Brand Awareness', engagement: 'Suitable', startDate: '', endDate: ''
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
                {campaigns.flatMap(c => c.applicants || []).filter(a => a.status === 'accepted').length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-400 text-sm">
                        No accepted collaborations yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {campaigns.flatMap(c => (c.applicants || []).filter(a => a.status === 'accepted').map((applicant, idx) => (
                            <div key={`${c.id}-${idx}`} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                    {applicant.name?.[0] || 'I'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-[#343C6A] truncate">{applicant.name || 'Influencer'}</p>
                                    <p className="text-xs text-gray-500 truncate">Campaign: {c.title}</p>
                                </div>
                            </div>
                        )))}
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
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(campaign.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {campaign.budget}</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.applicants?.length || 0} Applied</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                    <Eye className="w-5 h-5" />
                                </button>
                                <button onClick={() => openEditModal(campaign)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Campaign">
                                    <Edit2 className="w-5 h-5" />
                                </button>
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

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
                                <input name="title" value={newCampaign.title} onChange={handleInputChange} placeholder="e.g. Summer Glow 2026" className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                                    <input name="budget" value={newCampaign.budget} onChange={handleInputChange} placeholder="5000" className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
                                    <select name="goal" value={newCampaign.goal} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9]">
                                        <option value="Brand Awareness">Brand Awareness</option>
                                        <option value="App Download">App Download</option>
                                        <option value="Product Sales">Product Sales</option>
                                        <option value="Website Traffic">Website Traffic</option>
                                        <option value="UGC">User Generated Content</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Rate</label>
                                    <select name="engagement" value={newCampaign.engagement} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9]">
                                        <option value="Excellent">Excellent (&gt;10%)</option>
                                        <option value="Good">Good (5-10%)</option>
                                        <option value="Fair">Fair (1-5%)</option>
                                        <option value="Suitable">Suitable (Any)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input type="date" name="startDate" value={newCampaign.startDate} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" name="endDate" value={newCampaign.endDate} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                </div>
                            </div>



                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={newCampaign.description} onChange={handleInputChange} rows="3" className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400" placeholder="Campaign goals and details..."></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button type="submit" disabled={createLoading} className="px-6 py-3 bg-[#2008b9] text-white font-bold rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-500/20">
                                    {createLoading ? 'Saving...' : (editingCampaign ? 'Save Changes' : 'Post Campaign')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
