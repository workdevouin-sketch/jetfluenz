'use client';

import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Download, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function InfluencerEarnings() {
    return (
        <DashboardLayout role="influencer" title="Earnings">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#2008b9] text-white p-6 rounded-2xl shadow-lg shadow-blue-900/20">
                    <p className="text-blue-200 text-sm font-medium mb-1">Total Balance</p>
                    <h3 className="text-3xl font-bold mb-4">$12,450.00</h3>
                    <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        <span>+15% vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-sm font-medium mb-1">Pending Payouts</p>
                    <h3 className="text-3xl font-bold text-[#343C6A] mb-4">$2,100.00</h3>
                    <p className="text-sm text-gray-500">Next payout: Jan 31</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-sm font-medium mb-1">Completed Jobs</p>
                    <h3 className="text-3xl font-bold text-[#343C6A] mb-4">45</h3>
                    <p className="text-sm text-gray-500">Avg. $850 per job</p>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[#343C6A]">Transaction History</h3>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-[#2008b9] text-sm font-medium border border-gray-200 px-4 py-2 rounded-lg hover:border-[#2008b9] transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>

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
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-4 font-medium text-[#343C6A]">Summer Glow Campaign {i}</td>
                                    <td className="py-4 px-4 text-gray-500 text-sm">Jan 15, 2026</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Paid</span>
                                    </td>
                                    <td className="py-4 px-4 text-right font-bold text-[#343C6A]">$1,200.00</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
