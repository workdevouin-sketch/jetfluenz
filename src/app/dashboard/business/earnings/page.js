'use client';

import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { Download, CreditCard, Receipt, TrendingUp } from 'lucide-react';

export default function BusinessFinancials() {
    return (
        <DashboardLayout role="business" title="Financials">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-400">This Month</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">Total Spend</p>
                    <h3 className="text-3xl font-bold text-[#343C6A]">$4,250.00</h3>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <button className="text-sm font-bold text-blue-600 hover:underline">Manage</button>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">Payment Method</p>
                    <h3 className="text-xl font-bold text-[#343C6A]">•••• 4242</h3>
                    <p className="text-xs text-gray-400 mt-1">Visa Corporate</p>
                </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[#343C6A]">Invoices & Billing</h3>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-[#2008b9] text-sm font-medium border border-gray-200 px-4 py-2 rounded-lg hover:border-[#2008b9] transition-colors">
                        <Download className="w-4 h-4" /> Download All
                    </button>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 text-left">
                            <th className="pb-4 pt-2 font-medium text-gray-400 text-sm px-4">Invoice ID</th>
                            <th className="pb-4 pt-2 font-medium text-gray-400 text-sm px-4">Date</th>
                            <th className="pb-4 pt-2 font-medium text-gray-400 text-sm px-4">Amount</th>
                            <th className="pb-4 pt-2 font-medium text-gray-400 text-sm px-4">Status</th>
                            <th className="pb-4 pt-2 font-medium text-gray-400 text-sm px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {[1, 2, 3].map(i => (
                            <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-4 font-medium text-[#343C6A]">#INV-2026-00{i}</td>
                                <td className="py-4 px-4 text-gray-500 text-sm">Jan {10 + i}, 2026</td>
                                <td className="py-4 px-4 font-bold text-[#343C6A]">$1,250.00</td>
                                <td className="py-4 px-4">
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Paid</span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">PDF</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
