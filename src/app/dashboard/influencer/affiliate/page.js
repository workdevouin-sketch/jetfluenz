'use client';

import { useState } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { TrendingUp, DollarSign, MessageCircle, ArrowUpRight, Search, Filter } from 'lucide-react';

export default function AffiliatePage() {
    // Mock Data
    const stats = [
        { title: 'Total Revenue', value: '₹1,240.50', change: '+12.5%', icon: DollarSign, color: 'bg-green-500' },
        { title: 'Qualifying Leads', value: '84', change: '+5.2%', icon: MessageCircle, color: 'bg-blue-500' },
        { title: 'Conv. Rate', value: '4.2%', change: '+1.1%', icon: TrendingUp, color: 'bg-purple-500' },
    ];

    const activeCampaigns = [
        { id: 1, brand: 'TechGear Pro', commission: '15%', status: 'Active', leads: 42, earnings: '₹630.00' },
        { id: 2, brand: 'GlowCosmetics', commission: '10%', status: 'Active', leads: 28, earnings: '₹410.50' },
        { id: 3, brand: 'FitLife', commission: '20%', status: 'Paused', leads: 14, earnings: '₹200.00' },
    ];

    const recentLeads = [
        { id: 1, user: '@sarah_j', comment: 'Where can I buy this? LINK please!', source: 'Reel #402', date: '2 mins ago', status: 'Pending', amount: '-' },
        { id: 2, user: '@mike_runs', comment: 'Price?', source: 'Post #331', date: '15 mins ago', status: 'Qualified', amount: '₹15.00' },
        { id: 3, user: '@beauty_queen', comment: 'Does this ship to UK?', source: 'Story', date: '1 hour ago', status: 'Inquiry', amount: '-' },
        { id: 4, user: '@gamer_x', comment: 'Need this setup!', source: 'Reel #402', date: '3 hours ago', status: 'Qualified', amount: '₹22.50' },
        { id: 5, user: '@mom_life', comment: 'Code please', source: 'Post #331', date: '5 hours ago', status: 'Qualified', amount: '₹10.00' },
    ];

    return (
        <DashboardLayout role="influencer" title="Affiliate Hub">
            <div className="space-y-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-[#343C6A]">{stat.value}</h3>
                                <p className="text-green-500 text-xs font-bold flex items-center mt-1">
                                    <ArrowUpRight className="w-3 h-3 mr-1" /> {stat.change} <span className="text-gray-400 font-normal ml-1">last month</span>
                                </p>
                            </div>
                            <div className={`${stat.color} p-4 rounded-xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Campaigns List */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-[#343C6A]">Active Programs</h3>
                            <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {activeCampaigns.map(campaign => (
                                <div key={campaign.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-[#343C6A]">{campaign.brand}</h4>
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">{campaign.commission} Comm.</span>
                                        </div>
                                        <span className={`w-2 h-2 rounded-full ${campaign.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-500 mt-3">
                                        <span>{campaign.leads} Leads</span>
                                        <span className="font-bold text-green-600">{campaign.earnings}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:text-[#2008b9] hover:border-[#2008b9] transition-all flex items-center justify-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Join New Program
                        </button>
                    </div>

                    {/* Recent Leads Table */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-[#343C6A]">Comment Leads</h3>
                                <p className="text-sm text-gray-400">Comments converted to potential sales</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input placeholder="Search..." className="pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-[#2008b9]/20 w-40" />
                                </div>
                                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                                        <th className="pb-3 pl-2 font-medium">User / Comment</th>
                                        <th className="pb-3 font-medium">Source</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 pr-2 font-medium text-right">Est. Earn</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {recentLeads.map(lead => (
                                        <tr key={lead.id} className="border-b border-gray-50 last:border-none hover:bg-blue-50/30 transition-colors group">
                                            <td className="py-4 pl-2">
                                                <div className="font-bold text-[#343C6A]">{lead.user}</div>
                                                <div className="text-gray-500 text-xs truncate max-w-[200px] italic">"{lead.comment}"</div>
                                            </td>
                                            <td className="py-4 text-gray-500">
                                                <div className="font-medium">{lead.source}</div>
                                                <div className="text-xs text-gray-400">{lead.date}</div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${lead.status === 'Qualified' ? 'bg-green-100 text-green-600' :
                                                    lead.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-2 text-right font-bold text-[#343C6A]">
                                                {lead.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
