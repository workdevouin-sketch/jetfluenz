'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { db } from '../../../lib/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { Users, Briefcase, CheckCircle, MessageSquare, TrendingUp } from 'lucide-react';

export default function AdminOverviewPage() {
    const [stats, setStats] = useState({
        influencers: 0,
        businesses: 0,
        completedCampaigns: 0,
        activeTickets: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Influencers Count
                const influencersQ = query(collection(db, 'users'), where('role', '==', 'influencer'));
                const influencersSnap = await getCountFromServer(influencersQ);

                // Businesses Count
                const businessQ = query(collection(db, 'users'), where('role', '==', 'business'));
                const businessSnap = await getCountFromServer(businessQ);

                // Completed Campaigns
                const campaignsQ = query(collection(db, 'campaigns'), where('status', '==', 'completed'));
                const campaignsSnap = await getCountFromServer(campaignsQ);

                // Active Tickets (Open or In Progress)
                // Firestore "in" query limited to 10 values, perfect here
                const ticketsQ = query(collection(db, 'tickets'), where('status', 'in', ['open', 'in_progress']));
                const ticketsSnap = await getCountFromServer(ticketsQ);

                setStats({
                    influencers: influencersSnap.data().count,
                    businesses: businessSnap.data().count,
                    completedCampaigns: campaignsSnap.data().count,
                    activeTickets: ticketsSnap.data().count
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <DashboardLayout role="admin" title="Dashboard">
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-[#343C6A]">Platform Overview</h2>
                    <p className="text-gray-500 mt-1">Key metrics and platform activity.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white h-32 rounded-2xl animate-pulse shadow-sm border border-gray-100"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={Users}
                            label="Total Influencers"
                            value={stats.influencers}
                            color="bg-purple-100"
                            textColor="text-purple-600"
                        />
                        <StatCard
                            icon={Briefcase}
                            label="Total Businesses"
                            value={stats.businesses}
                            color="bg-blue-100"
                            textColor="text-blue-600"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Completed Campaigns"
                            value={stats.completedCampaigns}
                            color="bg-green-100"
                            textColor="text-green-600"
                        />
                        <StatCard
                            icon={MessageSquare}
                            label="Active Tickets"
                            value={stats.activeTickets}
                            color="bg-yellow-100"
                            textColor="text-yellow-600"
                        />
                    </div>
                )}

                {/* Quick Actions / Future Expansion */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-[#343C6A] mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Platform Growth</span>
                                <span className="text-green-600 font-bold flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +12%</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <span className="text-gray-600 font-medium">Ticket Resolution Rate</span>
                                <span className="text-blue-600 font-bold">94%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#2008b9] to-purple-800 rounded-[2rem] p-8 shadow-lg text-white">
                        <h3 className="text-xl font-bold mb-2">Admin Control Center</h3>
                        <p className="opacity-80 mb-6">Manage users, campaigns, and support tickets from the sidebar.</p>
                        <div className="flex gap-3">
                            <span className="px-3 py-1 bg-white/20 rounded-lg text-sm">v1.2.0</span>
                            <span className="px-3 py-1 bg-white/20 rounded-lg text-sm">Secure</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const StatCard = ({ icon: Icon, label, value, color, textColor }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color} ${textColor} group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7" />
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-[#343C6A]">{value}</p>
        </div>
    </div>
);
