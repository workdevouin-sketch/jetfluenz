'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Check, X, ArrowRight, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { getInfluencerCampaigns } from '../../../lib/campaigns';
import InstagramStats from '../../../components/influencer/InstagramStats';

export default function InfluencerDashboard() {
    const [userData, setUserData] = useState(null);
    const [assignedCampaigns, setAssignedCampaigns] = useState([]);
    const [payments, setPayments] = useState([]);
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

                    // Fetch Payments (Limit 5)
                    try {
                        const paymentsQ = query(
                            collection(db, 'payments'),
                            where('influencerId', '==', storedUser.id),
                            orderBy('createdAt', 'desc'),
                            limit(5)
                        );
                        const paymentsSnap = await getDocs(paymentsQ);
                        const paymentsList = [];
                        paymentsSnap.forEach(doc => {
                            paymentsList.push({ id: doc.id, ...doc.data() });
                        });
                        setPayments(paymentsList);
                    } catch (err) {
                        console.error("Error fetching payments:", err);
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

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* LEFT COLUMN (3/5 width - roughly 60%) */}
                    <div className="lg:col-span-3 space-y-8">

                        {/* Collaboration Requests / Assigned Campaigns */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-6">Collaboration Requests</h3>

                            {assignedCampaigns.filter(c => ['offered', 'active', 'assigned'].includes(c.status)).length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
                                    <p>No active campaign requests yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignedCampaigns.filter(c => ['offered', 'active', 'assigned'].includes(c.status)).map(campaign => (
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
                                                    <button
                                                        onClick={async () => {
                                                            const { acceptCampaign } = await import('../../../lib/campaigns');
                                                            await acceptCampaign(campaign.id);
                                                            // Refresh list
                                                            setAssignedCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'accepted' } : c));
                                                        }}
                                                        className="w-10 h-10 rounded-full bg-green-100 text-green-500 flex items-center justify-center hover:bg-green-200 transition-colors"
                                                        title="Accept"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            const { rejectCampaign } = await import('../../../lib/campaigns');
                                                            await rejectCampaign(campaign.id);
                                                            setAssignedCampaigns(prev => prev.filter(c => c.id !== campaign.id));
                                                        }}
                                                        className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors"
                                                        title="Decline"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Active Campaigns (Accepted) */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-6">Active Campaigns</h3>

                            {assignedCampaigns.filter(c => c.status === 'accepted').length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
                                    <p>No active collaborations yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {assignedCampaigns.filter(c => c.status === 'accepted').map(campaign => (
                                        <div key={campaign.id} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl hover:bg-blue-50 transition-colors border border-blue-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center font-bold text-xl">
                                                    <TrendingUp className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#343C6A]">{campaign.title}</h4>
                                                    <p className="text-sm text-gray-500">Working with {campaign.businessName}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                                                    In Progress
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Earnings Tracker (Visual only for now) */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-[#343C6A] mb-8">Earnings Tracker</h3>
                            {payments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl">
                                    <p>No recent payments found.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Campaign</th>
                                                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Date</th>
                                                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Status</th>
                                                <th className="text-right py-4 px-4 text-gray-400 font-medium text-sm">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {payments.map((payment) => (
                                                <tr key={payment.id} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-4 font-bold text-[#343C6A]">{payment.campaignName || 'Campaign Payment'}</td>
                                                    <td className="py-4 px-4 text-gray-500 text-sm">
                                                        {payment.createdAt?.seconds ? new Date(payment.createdAt.seconds * 1000).toLocaleDateString() : 'Active'}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${payment.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                                            }`}>
                                                            {payment.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-right font-bold text-[#2008b9]">+₹{payment.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Top Performing Content */}
                        {userData?.instagram_stats?.profile?.media?.data?.length > 0 && (
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-[#343C6A] mb-6">Top Performing Content</h3>
                                <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide justify-start">
                                    {(userData.instagram_stats.profile.media.data || []).slice(0, 3).map((media) => (
                                        <a
                                            key={media.id}
                                            href={media.permalink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative min-w-[120px] w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-100 hover:ring-blue-500 transition-all transform hover:scale-105 group"
                                        >
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                                            {media.media_type === 'VIDEO' ? (
                                                <video src={media.media_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={media.media_url} className="w-full h-full object-cover" alt="Post" />
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN (2/5 width - roughly 40%) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Instagram Analytics Panel */}
                        <InstagramStats
                            predefinedUsername={userData?.instagram}
                            userId={userData?.id}
                            initialStats={userData?.instagram_stats}
                        />

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
