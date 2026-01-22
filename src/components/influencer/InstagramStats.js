'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, TrendingUp, Image as ImageIcon, MessageCircle, Calendar, Hash, AtSign, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { syncInstagramStats, shouldUpdateStats } from '../../lib/instagram';

export default function InstagramStats({ predefinedUsername, userId, initialStats }) {
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
            // No initial stats but we have a username -> Fetch fresh
            fetchData(predefinedUsername);
        }
    }, [initialStats, predefinedUsername]);

    const checkAndBackgroundUpdate = async (lastFetched, user) => {
        if (shouldUpdateStats(lastFetched)) {
            console.log("Stats are stale. Updating in background...");
            // Silent update
            try {
                const res = await syncInstagramStats(userId, user);
                if (res.success && res.data) {
                    setData(res.data); // Update UI with fresh data
                }
            } catch (e) {
                console.error("Background update failed", e);
            }
        }
    };

    const getUsernameFromInput = (input) => {
        if (!input) return '';
        // Remove trailing slashes and spaces
        input = input.trim().replace(/\/$/, '');
        try {
            // Try parsing as URL if it looks like one
            if (input.includes('instagram.com')) {
                const url = new URL(input.startsWith('http') ? input : `https://${input}`);
                const pathParts = url.pathname.split('/').filter(Boolean);
                return pathParts[0] || '';
            }
        } catch (e) {
            // Ignore error, assume input is username
        }
        // If not a URL or fails parsing, return input as is (assuming it's a handle)
        return input.split('/').pop();
    };

    const fetchData = async (input) => {
        const userToFetch = getUsernameFromInput(input);
        if (!userToFetch) return;

        setLoading(true);
        setError(null);

        try {
            // 1. First, try to get from DB directly if not already there
            if (userId) {
                const { getStatsFromDB } = await import('../../lib/instagram');
                const dbStats = await getStatsFromDB(userId);
                if (dbStats) {
                    setData(dbStats);
                    setIsLinked(true);
                    setUsername(userToFetch);
                    setLoading(false);
                    // Check for staleness in background
                    // If stale, this will fire the API call invisibly
                    if (dbStats.last_fetched) {
                        checkAndBackgroundUpdate(dbStats.last_fetched, userToFetch);
                    }
                    return; // EXIT HERE so we don't double fetch
                }
            }

            // 2. Only if DB failed/empty, call the API (Sync)
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

    const extractHashtags = (mediaList) => {
        if (!mediaList || !mediaList.length) return [];
        const tagCounts = {};
        mediaList.forEach(media => {
            if (media.caption) {
                const matches = media.caption.match(/#[a-zA-Z0-9_]+/g);
                if (matches) {
                    matches.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                }
            }
        });
        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1]) // Sort by frequency
            .slice(0, 5) // Top 5
            .map(entry => entry[0]);
    };

    // --- Not Linked State ---
    if (!isLinked && !data) {
        return (
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-[#343C6A] mb-4">Connect Instagram</h3>
                <p className="text-gray-500 text-sm mb-6">Link your professional Instagram account to track real-time analytics.</p>
                <div className="space-y-4">
                    <div className="relative">
                        <AtSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Instagram Link or Username"
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2008b9] text-[#343C6A] font-medium"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="w-full bg-[#2008b9] text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Connect Account'}
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

    // --- Score Calculation (Original) ---
    const calculateScore = () => {
        if (!data) return 0;

        const subscribers = data.profile?.followers_count || 0;
        const engagement = parseFloat(data.metrics?.engagement_rate || 0);
        const frequency = parseFloat(data.metrics?.posts_per_week || 0);

        // 1. Follower Score (30%)
        let followerScore = 0;
        if (subscribers >= 1000000) followerScore = 100;
        else if (subscribers >= 100000) followerScore = 80;
        else if (subscribers >= 10000) followerScore = 50;
        else if (subscribers >= 1000) followerScore = 20;
        else followerScore = 10;

        // 2. Engagement Score (40%)
        // Cap at 10% engagement for max score, typical good is 3-5%
        let engagementScore = Math.min(100, (engagement / 5) * 100);

        // 3. Activity Score (30%)
        // 3 posts/week = 100%
        let activityScore = Math.min(100, (frequency / 3) * 100);

        const totalScore = (followerScore * 0.3) + (engagementScore * 0.4) + (activityScore * 0.3);
        return Math.round(totalScore);
    };

    const jetScore = calculateScore();
    const topHashtags = extractHashtags(data?.profile?.media?.data);

    // --- Main Dashboard View (SocialIQ Style) ---
    return (
        <div className="space-y-6">
            {/* 1. Score & Profile Header Grid */}
            <div className="space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden flex items-center justify-between min-h-[140px]">
                    <div className="flex items-center gap-6 relative z-10 w-full">
                        <div className="relative shrink-0 w-16 h-16">
                            {/* Gradient Ring */}
                            <div className="absolute -inset-1 bg-gradient-to-tr from-[#2008b9] to-purple-600 rounded-full opacity-70 blur-[2px]" />
                            <img
                                src={data.profile.profile_picture_url}
                                alt={data.profile.username}
                                className="relative w-16 h-16 rounded-full border-2 border-white object-cover bg-gray-100"
                            />
                            <div className="absolute bottom-0 right-0 bg-[#2008b9] text-white p-0.5 rounded-full border-2 border-white">
                                <CheckCircle className="w-3 h-3" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-[#343C6A] flex items-center gap-1 truncate">
                                {data.profile.name || data.profile.username}
                                <CheckCircle className="w-4 h-4 text-[#2008b9] fill-[#2008b9] text-white shrink-0" />
                            </h3>
                            <p className="text-gray-400 text-sm truncate">@{data.profile.username}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Followers</p>
                            <p className="text-3xl font-black text-[#2008b9]">{compactNumber(data.profile.followers_count)}</p>
                        </div>
                    </div>
                </div>

                {/* JetScore Card */}
                <div className="bg-[#2008b9] rounded-[2rem] p-6 text-white relative overflow-hidden flex items-center justify-between shadow-lg shadow-blue-900/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <div>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">JetScore</p>
                        <div className="text-5xl font-black tracking-tighter flex items-start">
                            {jetScore}<span className="text-2xl opacity-50 font-medium ml-1">/100</span>
                        </div>
                    </div>
                    <div className="text-right z-10">
                        <div className="text-xs font-medium px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10 inline-block">
                            {jetScore >= 80 ? 'Exceptional' : jetScore >= 60 ? 'Very Good' : jetScore >= 40 ? 'Good' : 'Growing'}
                        </div>
                        <p className="text-blue-200 text-xs mt-2">Based on performance</p>
                    </div>
                </div>
            </div>

            {/* 2. Engagement Rate (Hero Stat) */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Engagement rate</p>
                        {/* Recalculate rate using verified profile followers to avoid API glitches */}
                        <h4 className="text-3xl font-bold text-[#2008b9] mt-1">
                            {(() => {
                                // Fallback to API provided rate if raw metrics aren't active yet
                                if (data.metrics.total_likes === undefined) return data.metrics.engagement_rate;

                                const followers = data.profile.followers_count || 1;
                                const totalEng = (data.metrics.total_likes || 0) + (data.metrics.total_comments || 0);
                                const count = data.metrics.media_count || 1;
                                const avgEng = totalEng / count;
                                const rate = ((avgEng / followers) * 100).toFixed(2);
                                return `${rate}%`;
                            })()}
                        </h4>
                    </div>
                    <span className="bg-[#2008b9]/10 text-[#2008b9] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        🤩 Excellent!
                    </span>
                </div>
            </div>

            {/* 3. 2x2 Grid Stats */}
            <div className="grid grid-cols-2 gap-4">
                <StatBox
                    icon={<Calendar className="w-5 h-5 text-[#2008b9]" />}
                    label="Posts/ Week"
                    value={data.metrics.posting_frequency.replace(' Days', '')} // Crude approx, actually its frequency
                    sublabel="Days/Post"
                />
                <StatBox
                    icon={<ImageIcon className="w-5 h-5 text-[#2008b9]" />}
                    label="Total Posts"
                    value={data.profile.media_count}
                />
                <StatBox
                    icon={<CheckCircle className="w-5 h-5 text-[#2008b9]" />}
                    label="Avg Likes"
                    value={compactNumber(data.metrics.avg_image_likes)}
                />
                <StatBox
                    icon={<MessageCircle className="w-5 h-5 text-[#2008b9]" />}
                    label="Avg Comments"
                    value={data.metrics.conversation_rate}
                />
            </div>

            {/* 4. Top Tags */}
            <div className="space-y-4">
                <h4 className="text-gray-500 font-medium flex items-center gap-2">
                    Most Used Hashtags <span className="text-gray-300 text-xs">ⓘ</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                    {topHashtags.length > 0 ? (
                        topHashtags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg font-medium">
                                {tag}
                            </span>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400 italic">No hashtags found in recent posts.</p>
                    )}
                </div>
            </div>

            {/* 5. Top Performing Content (Gallery) */}
            <div className="space-y-4">
                <h4 className="text-gray-500 font-medium flex items-center gap-2">
                    Top Performing Content <span className="text-gray-300 text-xs">ⓘ</span>
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {(data.profile.media?.data || []).slice(0, 5).map((media) => (
                        <a
                            key={media.id}
                            href={media.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-[70px] w-[70px] h-[70px] rounded-full overflow-hidden border-2 border-white shadow-md ring-2 ring-gray-100 hover:ring-blue-400 transition-all"
                        >
                            {media.media_type === 'VIDEO' ? (
                                <video src={media.media_url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={media.media_url} className="w-full h-full object-cover" alt="Post" />
                            )}
                        </a>
                    ))}
                </div>
            </div>

        </div>
    );
}

function StatBox({ icon, label, value, sublabel }) {
    return (
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                {icon}
            </div>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
            <p className="text-[#343C6A] text-xl font-bold mt-1">
                {value} <span className="text-xs text-gray-400 font-normal">{sublabel}</span>
            </p>
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
