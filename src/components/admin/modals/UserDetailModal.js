'use client';

import { useState, useEffect } from 'react';
import { X, Phone, Globe, Instagram, Edit2, Save } from 'lucide-react';
import { updateWaitlistUser } from '@/lib/waitlist';
import LocationAutocompleteAdmin from '../LocationAutocompleteAdmin';


export default function UserDetailModal({ user, onClose }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                instagram: user.instagram || user.instagramUrl || '', // Handle legacy field name if any
                website: user.website || '',
                location: user.location || user.address || '',
                niche: user.niche || '',
                age: user.age || '',
                campaignTypes: user.campaignTypes || '',
                description: user.description || user.bio || '',
                companyName: user.companyName || '',
                contactPerson: user.contactPerson || '',
                industry: user.industry || '',
                portfolio: user.portfolio || ''
            });
        }
    }, [user]);

    if (!user) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateWaitlistUser(user.id, formData);
            if (result.success) {
                setIsEditing(false);
                // Ideally refresh parent data here, but for now we might need to reload or rely on real-time listener
                // onClose(); // Optional: close on save
                // window.location.reload(); // excessive, better to pass a refresh callback
            } else {
                alert('Failed to update user: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        {isEditing ? (
                            <input
                                type="text"
                                name={user.role === 'influencer' ? 'name' : 'companyName'}
                                value={user.role === 'influencer' ? formData.name : formData.companyName}
                                onChange={handleChange}
                                className="text-2xl font-bold text-[#343C6A] mb-1 border-b border-gray-300 focus:border-blue-500 outline-none w-full"
                            />
                        ) : (
                            <h3 className="text-2xl font-bold text-[#343C6A] mb-1">
                                {user.role === 'influencer' ? formData.name : formData.companyName || 'Business User'}
                            </h3>
                        )}

                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${user.role === 'influencer' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                {user.role}
                            </span>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-gray-500 text-sm">{user.email}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                title="Edit User"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                                title="Save Changes"
                            >
                                <Save className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Core Info */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Profile Information</h4>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 font-medium mb-1">User ID / Default Password</p>
                            <code className="text-sm font-mono text-[#2008b9] font-bold select-all break-all">
                                {user.id}
                            </code>
                            <p className="text-[10px] text-gray-400 mt-1">Share this with the user for their first login.</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Status</p>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${user.status === 'approved' ? 'bg-blue-100 text-blue-700' : user.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {user.status || 'Pending'}
                            </span>
                        </div>

                        {user.role === 'business' && (
                            <>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1">Contact Person</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            value={formData.contactPerson}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-2 py-1"
                                        />
                                    ) : (
                                        <p className="font-medium text-[#343C6A] text-lg">{formData.contactPerson || '-'}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Industry</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        ) : (
                                            <p className="font-medium text-[#343C6A]">{formData.industry || '-'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Website</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-2 py-1"
                                            />
                                        ) : (
                                            <a href={formData.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block max-w-[150px]">{formData.website || '-'}</a>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {user.role === 'influencer' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Niche</p>
                                        {isEditing ? (
                                            <select
                                                name="niche"
                                                value={formData.niche}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
                                            >
                                                <option value="">Select Niche</option>
                                                <option value="Fashion">Fashion</option>
                                                <option value="Beauty">Beauty</option>
                                                <option value="Tech">Tech</option>
                                                <option value="Lifestyle">Lifestyle</option>
                                                <option value="Fitness">Fitness</option>
                                                <option value="Travel">Travel</option>
                                                <option value="Food">Food</option>
                                            </select>
                                        ) : (
                                            <p className="font-medium text-[#343C6A] text-lg">{formData.niche || '-'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Age Group</p>
                                        {isEditing ? (
                                            <select
                                                name="age"
                                                value={formData.age}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
                                            >
                                                <option value="">Select Age</option>
                                                <option value="18-24">18-24</option>
                                                <option value="25-34">25-34</option>
                                                <option value="35-44">35-44</option>
                                                <option value="45-54">45-54</option>
                                                <option value="55-64">55-64</option>
                                                <option value="65+">65+</option>
                                            </select>
                                        ) : (
                                            <p className="font-medium text-[#343C6A] text-lg">{formData.age || '-'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50 space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Campaign Preferences</p>
                                        {isEditing ? (
                                            <select
                                                name="campaignTypes"
                                                value={formData.campaignTypes}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded px-2 py-1 bg-white"
                                            >
                                                <option value="">Select Type</option>
                                                <option value="paid">Paid</option>
                                                <option value="gifted">Gifted</option>
                                                <option value="both">Both</option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                {formData.campaignTypes ? (
                                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-medium capitalize">
                                                        {formData.campaignTypes === 'both' ? 'Paid & Gifted' : formData.campaignTypes}
                                                    </span>
                                                ) : <span className="text-gray-400 italic">Not set</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Bio / Description</p>
                            {isEditing ? (
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-2 py-1 h-24 text-sm"
                                />
                            ) : (
                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                    {formData.description || 'No description provided.'}
                                </p>
                            )}
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
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded px-2 py-1"
                                        />
                                    ) : (
                                        formData.phone || <span className="text-gray-400 italic font-normal">Not provided</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">
                                    {user.role === 'influencer' ? 'Instagram Profile' : 'Website'}
                                </p>
                                <div className="flex items-center gap-2 text-gray-700">
                                    {user.role === 'influencer' ? <Instagram className="w-4 h-4 text-pink-500" /> : <Globe className="w-4 h-4 text-blue-500" />}

                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name={user.role === 'influencer' ? 'instagram' : 'website'}
                                            value={user.role === 'influencer' ? formData.instagram : formData.website}
                                            onChange={handleChange}
                                            placeholder={user.role === 'influencer' ? 'username (no @)' : 'https://...'}
                                            className="w-full border border-gray-300 rounded px-2 py-1"
                                        />
                                    ) : (
                                        (formData.instagram || formData.website) ? (
                                            <a href={user.role === 'influencer' ? `https://instagram.com/${formData.instagram}` : formData.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate hover:text-blue-800 font-medium">
                                                {user.role === 'influencer' ? `@${formData.instagram}` : formData.website}
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 italic">Not provided</span>
                                        )
                                    )}
                                </div>
                            </div>


                        </div>

                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-2">Location Information</p>
                            {isEditing ? (
                                <LocationAutocompleteAdmin
                                    value={formData.location || ''}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    className="px-2 py-1 h-auto"
                                />
                            ) : (
                                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3">
                                    {formData.location || 'No location info provided.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
