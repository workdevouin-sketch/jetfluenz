'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, TrendingUp, Image as ImageIcon, MessageCircle, Calendar, AtSign, Loader2, DollarSign, Calculator } from 'lucide-react';
import { syncInstagramStats, shouldUpdateStats } from '../../lib/instagram';
import { calculateInfluencerPrice } from '@/utils/pricingAlgorithm';

export default function ValuationStats({ predefinedUsername, userId, initialStats }) {
    // Priority: State -> Initial Props -> Null
    const [username, setUsername] = useState(predefinedUsername || '');
    const [data, setData] = useState(initialStats || null);
    const [loading, setLoading] = useState(!initialStats && !!predefinedUsername);
    const [error, setError] = useState(null);
    const [isLinked, setIsLinked] = useState(!!initialStats || !!predefinedUsername);

    // Update state if props change (e.g. parent fetch completes)
    useEffect(() => {
        if (initialStats) {
            setData(initialStats);
            setIsLinked(true);
            setLoading(false);
            if (initialStats.last_fetched) {
                checkAndBackgroundUpdate(initialStats.last_fetched, predefinedUsername);
            }
        } else if (predefinedUsername && !data) {
            fetchData(predefinedUsername);
        }
    }, [initialStats, predefinedUsername]);

    const checkAndBackgroundUpdate = async (lastFetched, user) => {
        if (shouldUpdateStats(lastFetched)) {
            try {
                const res = await syncInstagramStats(userId, user);
                if (res.success && res.data) {
                    setData(res.data);
                }
            } catch (e) {
                console.error("Background update failed", e);
            }
        }
    };

    const getUsernameFromInput = (input) => {
        if (!input) return '';
        input = input.trim().replace(/\/$/, '');
        try {
            if (input.includes('instagram.com')) {
                const url = new URL(input.startsWith('http') ? input : `https://${input}`);
                const pathParts = url.pathname.split('/').filter(Boolean);
                return pathParts[0] || '';
            }
        } catch (e) { }
        return input.split('/').pop();
    };

    const fetchData = async (input) => {
        const userToFetch = getUsernameFromInput(input);
        if (!userToFetch) return;

        setLoading(true);
        setError(null);

        try {
            if (userId) {
                const { getStatsFromDB } = await import('../../lib/instagram');
                const dbStats = await getStatsFromDB(userId);
                if (dbStats) {
                    setData(dbStats);
                    setIsLinked(true);
                    setUsername(userToFetch);
                    setLoading(false);
                    if (dbStats.last_fetched) {
                        checkAndBackgroundUpdate(dbStats.last_fetched, userToFetch);
                    }
                    return;
                }
            }

            const res = await syncInstagramStats(userId, userToFetch);

            if (!res.success) {
                throw new Error(res.error || 'Failed to fetch');
            }

            setData(res.data);
            setIsLinked(true);
            setUsername(userToFetch);
        } catch (err) {
            console.error(err);
            setError('Could not fetch data. Ensure it is a Business Account.');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        if (username) fetchData(username);
    };

    // --- Not Linked State ---
    if (!isLinked && !data) {
        return (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-[#343C6A] mb-4">Connect Intelligent Analyzer</h3>
                <p className="text-gray-500 text-sm mb-6">Enter an Instagram username to fetch analytics and calculate valuation instantly.</p>
                <div className="space-y-4">
                    <div className="relative">
                        <AtSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Instagram Link or Username"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2008b9] text-[#343C6A] font-medium"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                        />
                    </div>
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="w-full bg-[#2008b9] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Analyze & Calculate'}
                    </button>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex justify-center py-20">
                <Loader2 className="animate-spin w-8 h-8 text-[#2008b9]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-[2rem] p-8 shadow-sm border border-red-100 text-center">
                <p className="text-red-600 font-bold mb-2">Failed to load analytics</p>
                <p className="text-red-500 text-sm mb-6">{error}</p>
                <button
                    onClick={() => { setIsLinked(false); setError(null); }}
                    className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-bold text-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!data || !data.profile) return null;

    // --- Calculations ---
    const calculateScore = () => {
        if (!data) return 0;
        const subscribers = data.profile?.followers_count || 0;
        const engagement = parseFloat(data.metrics?.engagement_rate || 0);
        const frequency = parseFloat(data.metrics?.posts_per_week || 0);

        let followerScore = 0;
        if (subscribers >= 1000000) followerScore = 100;
        else if (subscribers >= 100000) followerScore = 80;
        else if (subscribers >= 10000) followerScore = 50;
        else if (subscribers >= 1000) followerScore = 20;
        else followerScore = 10;

        let engagementScore = Math.min(100, (engagement / 5) * 100);
        let activityScore = Math.min(100, (frequency / 3) * 100);

        const totalScore = (followerScore * 0.3) + (engagementScore * 0.4) + (activityScore * 0.3);
        return Math.round(totalScore);
    };

    const jetScore = calculateScore();
    const followers = data.profile.followers_count || 0;

    // Avg Engagement Raw
    const totalEng = (data.metrics?.total_likes || 0) + (data.metrics?.total_comments || 0);
    const count = data.metrics?.media_count || 1;
    const avgEngRaw = Math.round(totalEng / count);

    const valuation = calculateInfluencerPrice(followers, jetScore, avgEngRaw);

    return (
        <div className="flex flex-col xl:flex-row gap-6">
            {/* Left Column: Stats */}
            <div className="flex-1 space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={data.profile.profile_picture_url}
                            alt={data.profile.username}
                            className="w-16 h-16 rounded-full border-2 border-white object-cover bg-gray-100 shadow-sm"
                        />
                        <div>
                            <h3 className="text-xl font-bold text-[#343C6A] flex items-center gap-1">
                                {data.profile.name || data.profile.username}
                                <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />
                            </h3>
                            <p className="text-gray-400 text-sm">@{data.profile.username}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider text-right">Followers</p>
                        <p className="text-2xl font-black text-[#2008b9] text-right">{compactNumber(followers)}</p>
                    </div>
                </div>

                {/* Score & Engagement Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* JetScore */}
                    <div className="bg-[#2008b9] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg shadow-blue-900/20">
                        <TrendingUp className="absolute top-4 right-4 w-12 h-12 opacity-20" />
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">JetScore</p>
                        <div className="text-4xl font-black">{jetScore}<span className="text-xl opacity-50">/100</span></div>
                    </div>

                    {/* Engagement */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Avg. Eng.</p>
                        <div className="text-4xl font-black text-[#343C6A]">{compactNumber(avgEngRaw)}</div>
                        <p className="text-xs text-green-600 font-bold mt-1">
                            Rate: {data.metrics.engagement_rate}%
                        </p>
                    </div>
                </div>

                {/* 4 Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatBox icon={<Calendar />} label="Frequency" value={data.metrics.posting_frequency.replace(' Days', '') + 'd'} />
                    <StatBox icon={<ImageIcon />} label="Posts" value={data.profile.media_count} />
                    <StatBox icon={<CheckCircle />} label="Avg Likes" value={compactNumber(data.metrics.avg_image_likes)} />
                    <StatBox icon={<MessageCircle />} label="Avg Cmts" value={data.metrics.conversation_rate} />
                </div>
            </div>

            {/* Right Column: Valuation */}
            <div className="w-full xl:w-1/3 space-y-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-blue-100 h-full flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2008b9] to-purple-600"></div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl text-[#2008b9]">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#343C6A]">Valuation</h2>
                            <p className="text-gray-500 text-xs">AI-Powered Price Estimation</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
                        <p className="text-gray-400 font-medium mb-2 uppercase tracking-widest text-xs">Recommended Rate</p>
                        <div className="flex items-start justify-center text-5xl font-black text-[#343C6A] mb-2 tracking-tight">
                            <span className="text-3xl opacity-40 font-medium mr-1 mt-1">₹</span>
                            {valuation.total.toLocaleString('en-IN')}
                        </div>
                        <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                            per Post / Reel
                        </div>
                    </div>

                    <div className="mt-auto space-y-3 pt-6 border-t border-gray-50">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Base Calculation</span>
                            <span className="font-bold text-gray-700">₹{valuation.breakdown.base.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Engagement Bonus</span>
                            <span className="font-bold text-green-600">+₹{valuation.breakdown.engagement.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Quality Multiplier</span>
                            <span className="font-bold text-blue-600">x{valuation.breakdown.multiplier}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ icon, label, value }) {
    return (
        <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                <div className="w-5 h-5 text-[#2008b9]">{icon}</div>
            </div>
            <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">{label}</p>
                <p className="text-[#343C6A] text-lg font-bold">{value}</p>
            </div>
        </div>
    );
}

function compactNumber(number) {
    if (!number) return '0';
    return Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
}
