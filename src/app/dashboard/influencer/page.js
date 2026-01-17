'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Check, X, ArrowRight, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { getInfluencerCampaigns } from '../../../lib/campaigns';

export default function InfluencerDashboard() {
    const [userData, setUserData] = useState(null);
    const [assignedCampaigns, setAssignedCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('jetfluenz_influencer_session'));
                if (storedUser?.id) {
                    // Fetch Profile
                    const docRef = doc(db, 'users', storedUser.id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    }

                    // Fetch Assigned Campaigns
                    const campRes = await getInfluencerCampaigns(storedUser.id);
                    if (campRes.success) {
                        setAssignedCampaigns(campRes.campaigns);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="influencer" title="Dashboard">
                <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2008b9]"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="influencer" title="Dashboard">
            <div className="space-y-8">
                {/* Welcome Section */}
                <div>
                    <h2 className="text-3xl font-bold text-[#343C6A]">Welcome back, {userData?.name?.split(' ')[0] || 'Influencer'}! 👋</h2>
                    <p className="text-gray-500 mt-1">Here's your snapshot for today.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Collaboration Requests / Assigned Campaigns */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-6">Collaboration Requests</h3>

                            {assignedCampaigns.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
                                    <p>No active campaign requests yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignedCampaigns.filter(c => c.status === 'active').map(campaign => (
                                        <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold text-xl">
                                                    {campaign.businessName?.[0] || 'B'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#343C6A]">{campaign.title}</h4>
                                                    <p className="text-sm text-blue-500">by {campaign.businessName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="font-bold text-[#343C6A] text-lg">${campaign.budget}</p>
                                                    <p className="text-xs text-gray-400">Budget</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="w-10 h-10 rounded-full bg-green-100 text-green-500 flex items-center justify-center hover:bg-green-200 transition-colors" title="Accept">
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors" title="Decline">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Earnings Tracker (Visual only for now) */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-8">Earnings Tracker</h3>
                            <div className="h-64 flex items-end justify-between px-4 sm:px-12 gap-4">
                                {[
                                    { month: 'Jan', height: '40%', color: 'bg-blue-100' },
                                    { month: 'Feb', height: '30%', color: 'bg-blue-100' },
                                    { month: 'Mar', height: '60%', color: 'bg-blue-200' },
                                    { month: 'Apr', height: '85%', color: 'bg-gradient-to-t from-blue-500 to-purple-500' },
                                    { month: 'May', height: '45%', color: 'bg-blue-100' },
                                    { month: 'Jun', height: '55%', color: 'bg-blue-200' },
                                ].map((bar, idx) => (
                                    <div key={idx} className="flex flex-col items-center w-full max-w-[60px] group">
                                        <div
                                            className={`w-full rounded-t-xl transition-all duration-500 hover:opacity-80 ${bar.color}`}
                                            style={{ height: bar.height }}
                                        ></div>
                                        <span className="text-xs font-medium text-gray-400 mt-3">{bar.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (1/3 width) */}
                    <div className="space-y-8">

                        {/* Profile Insights */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-6">Profile Insights</h3>

                            <div className="space-y-6">
                                {/* Engagement */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <span className="text-gray-500 font-medium">Engagement</span>
                                    </div>
                                    <span className="text-blue-600 font-bold">{userData?.engagement || '0%'}</span>
                                </div>

                                {/* Followers */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <span className="text-gray-500 font-medium">Followers</span>
                                    </div>
                                    <span className="text-blue-600 font-bold">{userData?.followers || '0'}</span>
                                </div>

                                {/* Top Categories */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-400 mb-3 mt-6">Niche & Focus</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {userData?.niche ? (
                                            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full font-medium border border-gray-100">
                                                {userData.niche}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">No niche set</span>
                                        )}
                                        {userData?.location && (
                                            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full font-medium border border-gray-100">
                                                {userData.location}
                                            </span>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Ready for more Card */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-3">Ready for more collabs?</h3>
                            <p className="text-gray-400 text-sm mb-6">Browse the marketplace to find your next partnership.</p>
                            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2">
                                Explore Offers <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
