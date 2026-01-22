'use client';

import { Check, Edit2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { updateCampaign, assignCampaign } from '@/lib/campaigns';

export default function CampaignsTable({ campaigns, users, onRefetch }) {
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [assigningCampaign, setAssigningCampaign] = useState(null);

    // --- Campaign Actions ---

    const handleApprove = async (campaign) => {
        if (!confirm(`Approve campaign "${campaign.title}"? This will make it visible to influencers.`)) return;
        const res = await updateCampaign(campaign.id, { status: 'active' });
        if (res.success) {
            alert('Campaign approved!');
            onRefetch();
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-gray-50">
                <h2 className="text-xl font-bold text-[#343C6A]">Campaigns</h2>
            </div>

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
                        {campaigns.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No campaigns found.</td></tr>
                        ) : (
                            campaigns.map(campaign => (
                                <tr key={campaign.id} className={`group transition-colors ${campaign.status === 'pending_approval' ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-orange-50/30'}`}>
                                    <td className="px-6 py-4 font-bold text-[#343C6A]">{campaign.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{campaign.businessName}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-green-600">${campaign.budget}</td>
                                    <td className="px-6 py-4">
                                        {campaign.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                                    {campaign.assignedTo.name?.[0] || 'U'}
                                                </div>
                                                <span className="text-sm text-gray-700">{campaign.assignedTo.name || 'Unknown'}</span>
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
                                                <button onClick={() => handleApprove(campaign)} className="text-green-600 hover:text-green-800 font-bold text-xs bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Approve
                                                </button>
                                            )}
                                            <button onClick={() => setEditingCampaign(campaign)} className="p-2 text-gray-400 hover:text-indigo-600 bg-white border border-gray-100 hover:border-indigo-200 rounded-lg shadow-sm" title="Edit Details">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {!campaign.assignedTo && campaign.status === 'active' && (
                                                <button onClick={() => setAssigningCampaign(campaign)} className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                                                    <UserPlus className="w-3 h-3" /> Assign
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Campaign Modal */}
            {editingCampaign && (
                <EditCampaignModal
                    campaign={editingCampaign}
                    onClose={() => setEditingCampaign(null)}
                    onSuccess={onRefetch}
                />
            )}

            {/* Assign Campaign Modal */}
            {assigningCampaign && (
                <AssignCampaignModal
                    campaign={assigningCampaign}
                    users={users} // Pass users for selection
                    onClose={() => setAssigningCampaign(null)}
                    onSuccess={onRefetch}
                />
            )}
        </div>
    );
}

function EditCampaignModal({ campaign, onClose, onSuccess }) {
    const [formData, setFormData] = useState({ ...campaign });
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateCampaign(campaign.id, formData);
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                alert('Failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100">
                <h3 className="text-xl font-bold text-[#343C6A] mb-4">Edit Campaign</h3>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                            <input value={formData.budget || ''} onChange={e => setFormData({ ...formData, budget: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={formData.status || 'draft'} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#2008b9]">
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" className="w-full p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]"></textarea>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-[#2008b9] text-white font-bold rounded-lg hover:bg-blue-800">
                            {loading ? 'Updating...' : 'Update Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AssignCampaignModal({ campaign, users, onClose, onSuccess }) {
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAssign = async () => {
        if (!selectedInfluencer) return;
        setLoading(true);
        try {
            const influencer = users.find(u => u.id === selectedInfluencer);
            const influencerName = influencer?.name || influencer?.email || 'Unknown';
            const res = await assignCampaign(campaign.id, selectedInfluencer, influencerName);
            if (res.success) {
                alert(`Assigned to ${influencerName}`);
                onSuccess();
                onClose();
            } else {
                alert('Failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100">
                <h3 className="text-xl font-bold text-[#343C6A] mb-1">Assign Campaign</h3>
                <p className="text-sm text-gray-500 mb-6">Assign <strong>{campaign?.title}</strong> to an influencer.</p>

                <div className="space-y-4">
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
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={handleAssign} disabled={!selectedInfluencer || loading} className="px-4 py-2 bg-[#2008b9] text-white font-bold rounded-lg hover:bg-blue-800 disabled:opacity-50">
                            {loading ? 'Assigning...' : 'Confirm Assignment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
