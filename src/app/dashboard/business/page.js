'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Plus, BarChart3, Users, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function BusinessDashboard() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('jetfluenz_business_session'));
                if (storedUser?.id) {
                    const docRef = doc(db, 'users', storedUser.id);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
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

    // Helper to get display name
    const getDisplayName = () => {
        if (!userData) return 'Business';
        return userData.companyName || userData.name || 'Business';
    };

    return (
        <DashboardLayout role="business" title="Campaign Manager">
            <div className="space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-[#343C6A]">Welcome, {getDisplayName()} 👋</h2>
                        <p className="text-gray-500 mt-1">Manage your influencer campaigns.</p>
                    </div>
                    <button className="bg-[#2008b9] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition-all flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Post New Campaign
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={BarChart3} label="Active Campaigns" value="3" color="bg-blue-100" textColor="text-blue-600" />
                    <StatCard icon={DollarSign} label="Total Spend" value="$12,450" color="bg-green-100" textColor="text-green-600" />
                    <StatCard icon={Users} label="Total Reach" value="2.4M" color="bg-purple-100" textColor="text-purple-600" />
                </div>

                {/* Previous Campaigns List */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-[#343C6A]">Previous Campaigns</h3>
                        <button className="text-[#2008b9] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Campaign Name</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Status</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Budget</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Influencers</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <CampaignRow
                                    name="Summer Glow 2025"
                                    status="Active"
                                    budget="$5,000"
                                    influencers="12"
                                    date="Jan 15 - Feb 15"
                                />
                                <CampaignRow
                                    name="Holiday Special"
                                    status="Completed"
                                    budget="$15,000"
                                    influencers="25"
                                    date="Dec 01 - Dec 31"
                                />
                                <CampaignRow
                                    name="Product Launch: Zen"
                                    status="Draft"
                                    budget="$2,000"
                                    influencers="-"
                                    date="Not scheduled"
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const StatCard = ({ icon: Icon, label, value, color, textColor }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color} ${textColor}`}>
            <Icon className="w-7 h-7" />
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-[#343C6A]">{value}</p>
        </div>
    </div>
);

const CampaignRow = ({ name, status, budget, influencers, date }) => {
    const statusColor =
        status === 'Active' ? 'bg-green-100 text-green-600' :
            status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                'bg-yellow-100 text-yellow-600';

    return (
        <tr className="group hover:bg-gray-50/50 transition-colors">
            <td className="py-4 px-4">
                <span className="font-bold text-[#343C6A]">{name}</span>
            </td>
            <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                    {status}
                </span>
            </td>
            <td className="py-4 px-4 text-gray-600 font-medium">{budget}</td>
            <td className="py-4 px-4">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {status === 'Draft' ? '-' : 'U'}
                        </div>
                    ))}
                </div>
            </td>
            <td className="py-4 px-4 text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" /> {date}
            </td>
        </tr>
    );
}
