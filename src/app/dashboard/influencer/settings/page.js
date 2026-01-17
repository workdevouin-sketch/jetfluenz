'use client';

import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Pencil, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

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
                const storedUser = JSON.parse(localStorage.getItem('jetfluenz_user'));
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
            const storedUser = JSON.parse(localStorage.getItem('jetfluenz_user'));
            const docRef = doc(db, 'users', storedUser.id);
            await updateDoc(docRef, formData);

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
            <DashboardLayout role="influencer" title="Setting">
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2008b9]"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="influencer" title="Setting">
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
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Avatar Section */}
                    <div className="w-full md:w-auto flex justify-center md:justify-start">
                        <div className="relative">
                            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                {/* Placeholder or Actual Image */}
                                {userData?.image ? (
                                    <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-gray-300">{userData?.name?.[0]}</span>
                                )}
                            </div>
                            <button className="absolute bottom-2 right-0 bg-[#2008b9] text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors">
                                <Pencil className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InputField label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Your Name" />
                        <InputField label="Niche" name="niche" value={formData.niche || ''} onChange={handleChange} placeholder="e.g. Travel, Tech" />

                        <InputField label="Email" name="email" value={formData.email || ''} onChange={handleChange} disabled type="email" />
                        <InputField label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="+1 234..." />

                        <InputField label="Instagram URL" name="instagram" value={formData.instagram || ''} onChange={handleChange} placeholder="https://instagram.com/..." />
                        <InputField label="Portfolio / Media Kit" name="portfolio" value={formData.portfolio || ''} onChange={handleChange} placeholder="https://..." />

                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Followers" name="followers" value={formData.followers || ''} onChange={handleChange} placeholder="10k" />
                            <InputField label="Engagement (%)" name="engagement" value={formData.engagement || ''} onChange={handleChange} placeholder="4.5%" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Age Group" name="age" value={formData.age || ''} onChange={handleChange} placeholder="18-24" />
                            <InputField label="Location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="City, Country" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-gray-700 font-medium mb-2 block">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio || ''}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-600 focus:outline-none focus:border-[#2008b9] focus:ring-1 focus:ring-[#2008b9]/20 transition-all placeholder-gray-300"
                                placeholder="Tell us about yourself..."
                            ></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-gray-700 font-medium mb-2 block">Campaign Types</label>
                            <select name="campaignTypes" value={formData.campaignTypes || ''} onChange={handleChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-gray-600 focus:outline-none focus:border-[#2008b9] bg-white">
                                <option value="">Select...</option>
                                <option value="paid">Paid Sponsorships</option>
                                <option value="gifted">Gifting / Barter</option>
                                <option value="both">Both</option>
                            </select>
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
