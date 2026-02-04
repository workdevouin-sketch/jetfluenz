'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Download, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function InfluencerEarnings() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBalance: 0,
        pendingPayouts: 0,
        completedJobs: 0,
        avgPerJob: 0
    });

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('jetfluenz_influencer_session'));
                if (!storedUser?.id) return;

                const q = query(
                    collection(db, 'payments'),
                    where('influencerId', '==', storedUser.id),
                    orderBy('createdAt', 'desc')
                );

                const querySnapshot = await getDocs(q);
                const paymentsList = [];
                let total = 0;
                let pending = 0;
                let completedCount = 0;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const amount = parseFloat(data.amount) || 0;
                    paymentsList.push({ id: doc.id, ...data });

                    // Stats Calculation
                    if (data.status === 'Paid') {
                        total += amount;
                        completedCount++;
                    } else if (['Pending', 'Processing'].includes(data.status)) {
                        pending += amount;
                    }
                });

                setPayments(paymentsList);
                setStats({
                    totalBalance: total,
                    pendingPayouts: pending,
                    completedJobs: completedCount,
                    avgPerJob: completedCount > 0 ? Math.round(total / completedCount) : 0
                });

            } catch (error) {
                console.error("Error fetching earnings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, []);

    return (
        <DashboardLayout role="influencer" title="Earnings">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#2008b9] text-white p-6 rounded-2xl shadow-lg shadow-blue-900/20">
                    <p className="text-blue-200 text-sm font-medium mb-1">Total Balance</p>
                    <h3 className="text-3xl font-bold mb-4">₹{stats.totalBalance.toLocaleString()}</h3>
                    <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>Lifetime Earnings</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-sm font-medium mb-1">Pending Payouts</p>
                    <h3 className="text-3xl font-bold text-[#343C6A] mb-4">₹{stats.pendingPayouts.toLocaleString()}</h3>
                    <p className="text-sm text-gray-500">Next payout cycle: Monthly</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-sm font-medium mb-1">Completed Jobs</p>
                    <h3 className="text-3xl font-bold text-[#343C6A] mb-4">{stats.completedJobs}</h3>
                    <p className="text-sm text-gray-500">Avg. ₹{stats.avgPerJob.toLocaleString()} per job</p>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[#343C6A]">Transaction History</h3>
                </div>

                {payments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 text-left">
                                    <th className="pb-4 pt-2 font-medium text-gray-400 text-sm px-4">Campaign</th>
                                    <th className="pb-4 pt-2 font-medium text-gray-400 text-sm px-4">Date</th>
                                    <th className="pb-4 pt-2 font-medium text-gray-400 text-sm px-4">Status</th>
                                    <th className="pb-4 pt-2 font-medium text-gray-400 text-sm px-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-4 font-medium text-[#343C6A]">{payment.campaignName || 'Campaign Payment'}</td>
                                        <td className="py-4 px-4 text-gray-500 text-sm">
                                            {payment.createdAt?.seconds ? new Date(payment.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${payment.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {payment.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold text-[#343C6A]">₹{payment.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
