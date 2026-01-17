'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Instagram, Globe, Phone, Mail, Eye, Edit2, Trash2, Search, Filter, Download, Briefcase, Plus, UserPlus, X, Check } from 'lucide-react';
import { getWaitlistUsers, updateWaitlistUser, deleteWaitlistUser, addUserFromAdmin } from '../../lib/waitlist';
import { getAllCampaigns, assignCampaign, updateCampaign } from '../../lib/campaigns';

export default function AdminWaitlist() {
    const searchParams = useSearchParams();
    // ... (rest of imports/state) ...

    const handleApproveCampaign = async (campaign) => {
        if (!confirm(`Approve campaign "${campaign.title}"? This will make it visible to influencers.`)) return;
        setActionLoading(true);
        try {
            const res = await updateCampaign(campaign.id, { status: 'active' });
            if (res.success) {
                alert('Campaign approved and live!');
                await fetchData();
            } else {
                alert('Failed to approve campaign');
            }
        } finally {
            setActionLoading(false);
        }
    };

    // ... (rest of handlers) ...

    // Inside render, in the campaigns table map:
    const [campaigns, setCampaigns] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        influencers: 0,
        businesses: 0,
        activeCampaigns: 0
    });

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // CRUD State
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '', role: 'influencer', instagram: '', phone: '', status: 'waitlist'
    });
    const [formErrors, setFormErrors] = useState({});
    const [actionLoading, setActionLoading] = useState(false);

    // Campaign CRUD & Assignment State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);
    const [campaignFormData, setCampaignFormData] = useState({});

    // Authentication Check
    useEffect(() => {
        const isAuth = localStorage.getItem('adminAuthenticated');
        if (isAuth === 'true') setIsAuthenticated(true);
    }, []);

    // Data Fetching
    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Users
            const userRes = await getWaitlistUsers();
            if (userRes.success) {
                setUsers(userRes.users);
            }

            // Fetch Campaigns
            const campRes = await getAllCampaigns();
            if (campRes.success) {
                setCampaigns(campRes.campaigns);
            }

            if (userRes.success && campRes.success) {
                setStats({
                    total: userRes.users.length,
                    influencers: userRes.users.filter(u => u.role === 'influencer').length,
                    businesses: userRes.users.filter(u => u.role === 'business').length,
                    activeCampaigns: campRes.campaigns.filter(c => c.status === 'active').length
                });
            }

        } catch (err) {
            setError('An error occurred fetching data');
        } finally {
            setLoading(false);
        }
    };

    // Filtering Logic
    const filteredUsers = users.filter(user => {
        if (activeTab === 'influencers') return user.role === 'influencer';
        if (activeTab === 'business') return user.role === 'business';
        return true;
    });

    const filteredCampaigns = campaigns;

    const getPageTitle = () => {
        if (activeTab === 'influencers') return 'Influencers';
        if (activeTab === 'business') return 'Businesses';
        if (activeTab === 'campaigns') return 'Campaigns';
        return 'Waitlist';
    };

    // --- User CRUD Handlers ---
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: '' });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.email) errors.email = 'Required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setActionLoading(true);
        try {
            const res = await addUserFromAdmin(formData);
            if (res.success) { await fetchData(); setShowAddForm(false); setFormData({ email: '', role: 'influencer', instagram: '', phone: '', status: 'waitlist' }); }
        } finally { setActionLoading(false); }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setActionLoading(true);
        try {
            const res = await updateWaitlistUser(editingUser.id, formData);
            if (res.success) { await fetchData(); setShowAddForm(false); setEditingUser(null); }
        } finally { setActionLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete user?')) return;
        await deleteWaitlistUser(id);
        fetchData();
    };


    // --- Campaign Handlers ---

    const openAssignModal = (campaign) => {
        setSelectedCampaign(campaign);
        setSelectedInfluencer(null);
        setShowAssignModal(true);
    };

    const openEditCampaignModal = (campaign) => {
        setSelectedCampaign(campaign);
        setCampaignFormData({ ...campaign });
        setShowEditCampaignModal(true);
    };

    const handleCampaignInputChange = (e) => {
        setCampaignFormData({ ...campaignFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateCampaign = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await updateCampaign(selectedCampaign.id, campaignFormData);
            if (res.success) {
                await fetchData();
                setShowEditCampaignModal(false);
                setSelectedCampaign(null);
            } else {
                alert("Failed to update campaign");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedCampaign || !selectedInfluencer) return;
        setActionLoading(true);
        try {
            // Find influencer name
            const influencer = users.find(u => u.id === selectedInfluencer);
            const influencerName = influencer?.name || influencer?.email || 'Unknown';

            const res = await assignCampaign(selectedCampaign.id, selectedInfluencer, influencerName);
            if (res.success) {
                alert(`Assigned to ${influencerName}`);
                await fetchData();
                setShowAssignModal(false);
            } else {
                alert('Assignment failed');
            }
        } finally {
            setActionLoading(false);
        }
    };


    return (
        <DashboardLayout role="admin" title={getPageTitle()}>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Total Users" value={stats.total} icon={Globe} color="blue" active={activeTab === 'waitlist'} />
                <StatCard label="Influencers" value={stats.influencers} icon={Instagram} color="purple" active={activeTab === 'influencers'} />
                <StatCard label="Businesses" value={stats.businesses} icon={Phone} color="green" active={activeTab === 'business'} />
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={activeTab === 'campaigns' ? "Search campaigns..." : "Search users..."}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]"
                    />
                </div>
                {activeTab !== 'campaigns' && (
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={() => setShowAddForm(true)} className="bg-[#2008b9] text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors text-sm">
                            + Add User
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>
                ) : activeTab === 'campaigns' ? (
                    // --- CAMPAIGNS TABLE ---
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Campaign</th>
                                    <th className="px-6 py-4">Business</th>
                                    <th className="px-6 py-4">Budget</th>
                                    <th className="px-6 py-4">Assigned To</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCampaigns.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No campaigns found.</td></tr>
                                ) : (
                                    filteredCampaigns.map(campaign => (
                                        <tr key={campaign.id} className={`group transition-colors ${campaign.status === 'pending_approval' ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-orange-50/30'}`}>
                                            <td className="px-6 py-4 font-bold text-[#343C6A]">{campaign.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{campaign.businessName}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-green-600">${campaign.budget}</td>
                                            <td className="px-6 py-4">
                                                {campaign.assignedTo ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                                            {campaign.assignedTo.name[0]}
                                                        </div>
                                                        <span className="text-sm text-gray-700">{campaign.assignedTo.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    campaign.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {campaign.status === 'pending_approval' ? 'Pending Approval' : campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {campaign.status === 'pending_approval' && (
                                                        <button onClick={() => handleApproveCampaign(campaign)} className="text-green-600 hover:text-green-800 font-bold text-xs bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                                                            <Check className="w-3 h-3" /> Approve
                                                        </button>
                                                    )}
                                                    <button onClick={() => openEditCampaignModal(campaign)} className="p-2 text-gray-400 hover:text-indigo-600 bg-white border border-gray-100 hover:border-indigo-200 rounded-lg shadow-sm" title="Edit Details">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {!campaign.assignedTo && campaign.status === 'active' && (
                                                        <button onClick={() => openAssignModal(campaign)} className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                                                            <UserPlus className="w-3 h-3" /> Assign
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                                }
                            </tbody >
                        </table >
                    </div >
                ) : (
                    // --- USERS TABLE (Existing) ---
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50">
                                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">User / Contact</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Submitted</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="group hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${user.role === 'influencer' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                                    {user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#343C6A]">{user.role === 'influencer' ? user.name : user.companyName || user.email.split('@')[0]}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${user.role === 'influencer' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{user.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${user.status === 'approved' ? 'bg-blue-100 text-blue-700' : user.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{user.status || 'Pending'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.submittedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-gray-500">
                                                <button onClick={() => setViewingUser(user)} className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-100 hover:border-blue-200 rounded-lg shadow-sm"><Eye className="w-4 h-4" /></button>
                                                <button onClick={() => { setEditingUser(user); setFormData({ ...user }); setShowAddForm(true); }} className="p-2 text-gray-400 hover:text-indigo-600 bg-white border border-gray-100 hover:border-indigo-200 rounded-lg shadow-sm"><Edit2 className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-100 hover:border-red-200 rounded-lg shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div >

            {/* --- MODALS --- */}

            {/* Add/Edit User Modal */}
            {
                showAddForm && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <form onSubmit={editingUser ? handleUpdate : handleAddUser} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="user@example.com" className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select name="role" value={formData.role || 'influencer'} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9]"><option value="influencer">Influencer</option><option value="business">Business</option></select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select name="status" value={formData.status || 'waitlist'} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9]"><option value="waitlist">Waitlist</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="banned">Banned</option></select>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h4 className="font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">Profile Details</h4>

                                    {formData.role === 'influencer' ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <input name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Niche</label>
                                                    <input name="niche" value={formData.niche || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                    <input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                                                <input name="instagram" value={formData.instagram || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Followers</label>
                                                    <input name="followers" value={formData.followers || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Engagement (%)</label>
                                                    <input name="engagement" value={formData.engagement || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                                                    <input name="age" value={formData.age || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                    <input name="location" value={formData.location || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                                                <input name="portfolio" value={formData.portfolio || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                                <input name="companyName" value={formData.companyName || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                                    <input name="contactPerson" value={formData.contactPerson || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                    <input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                                    <input name="industry" value={formData.industry || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                                    <input name="website" value={formData.website || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location</label>
                                                <input name="address" value={formData.address || ''} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Bio / Description</label>
                                        <textarea name={formData.role === 'influencer' ? "bio" : "description"} value={formData.bio || formData.description || ''} onChange={handleInputChange} rows="3" className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]"></textarea>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-[#2008b9] text-white font-bold rounded-lg hover:bg-blue-800">{editingUser ? 'Update' : 'Save'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Edit Campaign Modal */}
            {
                showEditCampaignModal && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-4">Edit Campaign</h3>
                            <form onSubmit={handleUpdateCampaign} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input name="title" value={campaignFormData.title || ''} onChange={handleCampaignInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                                        <input name="budget" value={campaignFormData.budget || ''} onChange={handleCampaignInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select name="status" value={campaignFormData.status || 'draft'} onChange={handleCampaignInputChange} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9]">
                                            <option value="draft">Draft</option>
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea name="description" value={campaignFormData.description || ''} onChange={handleCampaignInputChange} rows="3" className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]"></textarea>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setShowEditCampaignModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-[#2008b9] text-white font-bold rounded-lg hover:bg-blue-800">
                                        {actionLoading ? 'Updating...' : 'Update Campaign'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Assign Campaign Modal */}
            {
                showAssignModal && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-1">Assign Campaign</h3>
                            <p className="text-sm text-gray-500 mb-6">Assign <strong>{selectedCampaign?.title}</strong> to an influencer.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Influencer</label>
                                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl divide-y">
                                        {users.filter(u => u.role === 'influencer' && u.status === 'approved').map(inf => (
                                            <div
                                                key={inf.id}
                                                onClick={() => setSelectedInfluencer(inf.id)}
                                                className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition-colors ${selectedInfluencer === inf.id ? 'bg-blue-50 border-l-4 border-[#2008b9]' : ''}`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                    {inf.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#343C6A] text-sm">{inf.name || inf.email.split('@')[0]}</p>
                                                    <p className="text-xs text-gray-500">{inf.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button onClick={handleAssign} disabled={!selectedInfluencer || actionLoading} className="px-4 py-2 bg-[#2008b9] text-white font-bold rounded-lg hover:bg-blue-800 disabled:opacity-50">
                                        {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* View User Modal */}
            {
                viewingUser && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#343C6A] mb-1">
                                        {viewingUser.role === 'influencer' ? viewingUser.name : viewingUser.companyName || 'Business User'}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${viewingUser.role === 'influencer' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                            {viewingUser.role}
                                        </span>
                                        <span className="text-gray-400 text-sm">•</span>
                                        <span className="text-gray-500 text-sm">{viewingUser.email}</span>
                                    </div>
                                </div>
                                <button onClick={() => setViewingUser(null)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                {/* Core Info */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Profile Information</h4>

                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-400 font-medium mb-1">User ID / Default Password</p>
                                        <code className="text-sm font-mono text-[#2008b9] font-bold select-all break-all">
                                            {viewingUser.id}
                                        </code>
                                        <p className="text-[10px] text-gray-400 mt-1">Share this with the user for their first login.</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Status</p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${viewingUser.status === 'approved' ? 'bg-blue-100 text-blue-700' : viewingUser.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {viewingUser.status || 'Pending'}
                                        </span>
                                    </div>

                                    {viewingUser.role === 'business' && (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium mb-1">Contact Person</p>
                                                <p className="font-medium text-[#343C6A] text-lg">{viewingUser.contactPerson || '-'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium mb-1">Industry</p>
                                                    <p className="font-medium text-[#343C6A]">{viewingUser.industry || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium mb-1">Website</p>
                                                    <a href={viewingUser.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block max-w-[150px]">{viewingUser.website || '-'}</a>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {viewingUser.role === 'influencer' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium mb-1">Niche</p>
                                                    <p className="font-medium text-[#343C6A] text-lg">{viewingUser.niche || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium mb-1">Age Group</p>
                                                    <p className="font-medium text-[#343C6A] text-lg">{viewingUser.age || '-'}</p>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-400 font-medium">Followers</p>
                                                    <p className="font-bold text-[#343C6A] text-lg">{viewingUser.followers || '-'}</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-gray-400 font-medium">Engagement Rate</p>
                                                    <p className="font-bold text-[#343C6A] text-lg">{viewingUser.engagement ? `${viewingUser.engagement}%` : '-'}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400 font-medium mb-1">Campaign Preferences</p>
                                                <div className="flex gap-2">
                                                    {viewingUser.campaignTypes ? (
                                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-medium capitalize">
                                                            {viewingUser.campaignTypes === 'both' ? 'Paid & Gifted' : viewingUser.campaignTypes}
                                                        </span>
                                                    ) : <span className="text-gray-400 italic">Not set</span>}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Bio / Description</p>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                            {viewingUser.description || viewingUser.bio || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact & Socials */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Contact & Socials</h4>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium mb-1">Phone</p>
                                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {viewingUser.phone || <span className="text-gray-400 italic font-normal">Not provided</span>}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400 font-medium mb-1">
                                                {viewingUser.role === 'influencer' ? 'Instagram Profile' : 'Website'}
                                            </p>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                {viewingUser.role === 'influencer' ? <Instagram className="w-4 h-4 text-pink-500" /> : <Globe className="w-4 h-4 text-blue-500" />}
                                                {viewingUser.instagram || viewingUser.website ? (
                                                    <a href={viewingUser.instagram || viewingUser.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate hover:text-blue-800 font-medium">
                                                        {viewingUser.instagram || viewingUser.website}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 italic">Not provided</span>
                                                )}
                                            </div>
                                        </div>

                                        {viewingUser.role === 'influencer' && viewingUser.portfolio && (
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium mb-1">Portfolio / Media Kit</p>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Briefcase className="w-4 h-4 text-gray-400" />
                                                    <a href={viewingUser.portfolio} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate hover:text-blue-800 font-medium">
                                                        View Portfolio
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-2">Location Information</p>
                                        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3">
                                            <div className="bg-white p-2 rounded-full shadow-sm">
                                                <Globe className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div>
                                                {viewingUser.address && <p className="font-medium text-gray-900 block mb-1">{viewingUser.address}</p>}
                                                <p className="text-gray-500">
                                                    {[viewingUser.city, viewingUser.state, viewingUser.country].filter(Boolean).join(', ')}
                                                </p>
                                                {viewingUser.postalCode && <p className="text-xs text-gray-400 mt-1">ZIP: {viewingUser.postalCode}</p>}
                                                {(!viewingUser.address && !viewingUser.city && !viewingUser.country) && (
                                                    <span className="italic text-gray-400">No location data available</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50">
                                        <p className="text-xs text-gray-400 font-medium mb-1">Account Created</p>
                                        <p className="text-gray-500 text-sm">
                                            {new Date(viewingUser.submittedAt?.seconds * 1000 || Date.now()).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

        </DashboardLayout >
    );
}

const StatCard = ({ label, value, icon: Icon }) => (
    <div className="p-6 rounded-2xl border transition-all bg-[#2008b9] text-white border-[#2008b9] shadow-lg shadow-blue-900/20">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 text-white">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-blue-100">{label}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
            </div>
        </div>
    </div>
);
