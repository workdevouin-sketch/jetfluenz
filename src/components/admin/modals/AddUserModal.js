'use client';

import { useState, useEffect } from 'react';
import { addUserFromAdmin, updateWaitlistUser } from '@/lib/waitlist';
import { BarChart2 } from 'lucide-react';

export default function AddUserModal({ onClose, onSuccess, initialUser = null }) {
    const [formData, setFormData] = useState({
        email: '', role: 'influencer', instagram: '', phone: '', status: 'waitlist'
    });
    const [formErrors, setFormErrors] = useState({});
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (initialUser) {
            setFormData({ ...initialUser });
        }
    }, [initialUser]);

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

    const fetchInstagramImage = async (instagramInput) => {
        if (!instagramInput) return null;
        try {
            let handle = instagramInput;
            if (handle.includes('instagram.com')) {
                const url = new URL(handle.startsWith('http') ? handle : `https://${handle}`);
                const parts = url.pathname.split('/').filter(Boolean);
                handle = parts[0] || handle;
            }
            handle = handle.replace(/\/$/, '');

            const res = await fetch(`/api/meta/business-discovery?username=${handle}`);
            const metaData = await res.json();
            return metaData?.business_discovery?.profile_picture_url || null;
        } catch (e) {
            console.error('Failed to fetch IG image', e);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setActionLoading(true);
        try {
            let dataToSubmit = { ...formData };
            if (dataToSubmit.role === 'influencer' && dataToSubmit.instagram && (!initialUser || dataToSubmit.instagram !== initialUser.instagram)) {
                const img = await fetchInstagramImage(dataToSubmit.instagram);
                if (img) dataToSubmit.image = img;
            }

            let res;
            if (initialUser) {
                res = await updateWaitlistUser(initialUser.id, dataToSubmit);
            } else {
                res = await addUserFromAdmin(dataToSubmit);
            }

            if (res.success) {
                // Auto-sync stats if new influencer
                if (!initialUser && dataToSubmit.role === 'influencer' && dataToSubmit.instagram) {
                    const { syncInstagramStats } = await import('@/lib/instagram');
                    syncInstagramStats(res.id, dataToSubmit.instagram).catch(console.error);
                }
                onSuccess();
                onClose();
            }
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-100">
                <h3 className="text-xl font-bold text-[#343C6A] mb-4">{initialUser ? 'Edit User' : 'Add New User'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram ID</label>
                                    <div className="flex gap-2">
                                        <input name="instagram" value={formData.instagram || ''} onChange={handleInputChange} className="flex-1 p-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9]" />
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
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[#2008b9] text-white font-bold rounded-lg hover:bg-blue-800">{initialUser ? 'Update' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
