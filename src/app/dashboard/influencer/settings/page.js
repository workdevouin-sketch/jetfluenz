'use client';

import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Loader2, Bell, Lock, Key, Trash2, Shield, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import LocationAutocompleteAdmin from '../../../../components/admin/LocationAutocompleteAdmin';

export default function InfluencerSettings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('jetfluenz_influencer_session'));
                if (storedUser?.id) {
                    const docRef = doc(db, 'users', storedUser.id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                        setFormData(docSnap.data());
                    }
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let updatedData = { ...formData };

            // 1. Fetch Profile Picture if Instagram ID is present
            if (updatedData.instagram) {
                try {
                    // Handle both full URL and handle
                    let handle = updatedData.instagram;
                    if (handle.includes('instagram.com')) {
                        const url = new URL(handle.startsWith('http') ? handle : `https://${handle}`);
                        const parts = url.pathname.split('/').filter(Boolean);
                        handle = parts[0] || handle;
                    }
                    handle = handle.replace(/\/$/, '');

                    const res = await fetch(`/api/meta/business-discovery?username=${handle}`);
                    const metaData = await res.json();

                    if (metaData?.business_discovery) {
                        if (metaData.business_discovery.profile_picture_url) {
                            updatedData.image = metaData.business_discovery.profile_picture_url;
                        }
                        if (metaData.business_discovery.followers_count) {
                            // Format: e.g. 1500 -> 1.5k if desired, or keep raw number. 
                            // Input field is text, so raw number or formatted string works.
                            // Let's store raw number for now or formatted? The placeholder says "10k"
                            const count = metaData.business_discovery.followers_count;
                            updatedData.followers = count >= 1000000 ? (count / 1000000).toFixed(1) + 'M' : count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count.toString();
                        }
                        setFormData(prev => ({ ...prev, image: updatedData.image, followers: updatedData.followers }));
                    }
                } catch (metaErr) {
                    console.error("Failed to auto-fetch profile pic:", metaErr);
                    // Continue saving even if fetch fails
                }
            }

            const storedUser = JSON.parse(localStorage.getItem('jetfluenz_influencer_session'));
            const docRef = doc(db, 'users', storedUser.id);
            await updateDoc(docRef, updatedData);
            setUserData(prev => ({ ...prev, ...updatedData })); // Keep local state in sync

            // Also update main user doc to keep them in sync if needed, 
            // but primarily dashboard uses 'influencers' collection now.
            // Just assume success for UI
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="influencer" title="Settings">
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2008b9]"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="influencer" title="Settings">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[600px]">

                {/* Tabs */}
                <div className="flex items-center space-x-12 border-b border-gray-100 mb-10">
                    {['Edit Profile', 'Preferences', 'Security'].map((tab) => (
                        <button
                            key={tab}
                            className={`pb-3 text-base font-medium transition-all relative ${(activeTab === 'profile' && tab === 'Edit Profile') || activeTab === tab
                                ? 'text-[#2008b9]'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => setActiveTab(tab === 'Edit Profile' ? 'profile' : tab)}
                        >
                            {tab}
                            {((activeTab === 'profile' && tab === 'Edit Profile') || activeTab === tab) && (
                                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#2008b9] rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Profile Form Content */}
                {activeTab === 'profile' && (
                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Avatar Section */}
                        <div className="w-full md:w-auto flex justify-center md:justify-start">
                            <div className="relative">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                    {/* Placeholder or Actual Image */}
                                    {formData.image || userData?.image ? (
                                        <img src={formData.image || userData?.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-gray-300">{formData.name?.[0] || userData?.name?.[0]}</span>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <InputField label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Your Name" />
                            <div>
                                <label className="text-gray-700 font-medium mb-2 block">Niche</label>
                                <select
                                    name="niche"
                                    value={formData.niche || ''}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#2008b9] transition-all bg-white"
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
                            </div>

                            <InputField label="Email" name="email" value={formData.email || ''} onChange={handleChange} disabled type="email" />
                            <InputField label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="+1 234..." />

                            {/* Row 3: Age & Location */}
                            <div>
                                <label className="text-gray-700 font-medium mb-2 block">Age Group</label>
                                <select
                                    name="age"
                                    value={formData.age || ''}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#2008b9] transition-all bg-white"
                                >
                                    <option value="">Select Age</option>
                                    <option value="18-24">18-24</option>
                                    <option value="25-34">25-34</option>
                                    <option value="35-44">35-44</option>
                                    <option value="45-54">45-54</option>
                                    <option value="55-64">55-64</option>
                                    <option value="65+">65+</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-gray-700 font-medium mb-2 block">Location</label>
                                <LocationAutocompleteAdmin
                                    value={formData.location || ''}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#2008b9]"
                                />
                            </div>

                            {/* Row 4: Instagram & Campaign Types */}
                            <InputField label="Instagram ID" name="instagram" value={formData.instagram || ''} onChange={handleChange} placeholder="@username" disabled />

                            <div>
                                <label className="text-gray-700 font-medium mb-2 block">Campaign Types</label>
                                <select name="campaignTypes" value={formData.campaignTypes || ''} onChange={handleChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#2008b9] bg-white">
                                    <option value="">Select...</option>
                                    <option value="paid">Paid Sponsorships</option>
                                    <option value="gifted">Gifting / Barter</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>

                            {/* Row 5: Bio */}
                            <div className="md:col-span-2">
                                <label className="text-gray-700 font-medium mb-2 block">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio || ''}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#2008b9] focus:ring-1 focus:ring-[#2008b9]/20 transition-all placeholder-gray-300"
                                    placeholder="Tell us about yourself..."
                                ></textarea>
                            </div>

                            {/* Save Button */}
                            <div className="md:col-span-2 flex justify-end mt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-[#2008b9] text-white px-12 py-3.5 rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-800 transition-all active:scale-95 flex items-center justify-center min-w-[120px]"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preferences Content */}
                {activeTab === 'Preferences' && (
                    <div className="max-w-3xl space-y-8">
                        {/* Notifications */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-4 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-blue-600" />
                                Notification Settings
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div>
                                        <p className="font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-sm text-gray-500">Receive updates about your campaigns via email</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2008b9]"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div>
                                        <p className="font-medium text-gray-900">Marketing Updates</p>
                                        <p className="text-sm text-gray-500">Receive news, tips, and special offers</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2008b9]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Privacy */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Privacy Settings
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div>
                                        <p className="font-medium text-gray-900">Profile Visibility</p>
                                        <p className="text-sm text-gray-500">Allow brands to discover your profile</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2008b9]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        {/* Save Button */}
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-[#2008b9] text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-800 transition-all active:scale-95"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                )}

                {/* Security Content */}
                {activeTab === 'Security' && (
                    <div className="max-w-3xl space-y-8">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-blue-600" />
                                Change Password
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-gray-700 font-medium">Current Password</label>
                                    <div className="relative">
                                        <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#2008b9] bg-white transition-all" />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <EyeOff className="w-5 h-5 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-700 font-medium">New Password</label>
                                    <div className="relative">
                                        <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#2008b9] bg-white transition-all" />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <EyeOff className="w-5 h-5 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-gray-700 font-medium">Confirm New Password</label>
                                    <div className="relative">
                                        <input type="password" placeholder="••••••••" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#2008b9] bg-white transition-all" />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <EyeOff className="w-5 h-5 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        className="bg-[#2008b9] text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-800 transition-all active:scale-95"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <h3 className="text-xl font-bold text-red-700 mb-2 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" />
                                Delete Account
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <button
                                className="bg-white border border-red-200 text-red-600 px-6 py-3 rounded-xl font-medium hover:bg-red-50 transition-all active:scale-95 shadow-sm"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}

const InputField = ({ label, name, type = "text", placeholder, value, onChange, disabled }) => (
    <div className="flex flex-col space-y-2">
        <label className="text-gray-700 font-medium">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-[#2008b9] focus:ring-1 focus:ring-[#2008b9]/20 transition-all placeholder-gray-400 ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'}`}
        />
    </div>
);
