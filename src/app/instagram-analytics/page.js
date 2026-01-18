'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Instagram, TrendingUp, Users, MessageCircle, Image as ImageIcon, Video, Calendar } from 'lucide-react';

export default function InstagramAnalyticsPage() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const fetchAnalytics = async () => {
        if (!username) return;
        setLoading(true);
        setError('');
        setData(null);

        try {
            // Parallel fetch for speed
            const [profileRes, analyticsRes] = await Promise.all([
                fetch(`/api/meta/business-discovery?username=${username}`),
                fetch(`/api/meta/analytics?username=${username}`)
            ]);

            const profileData = await profileRes.json();
            const analyticsData = await analyticsRes.json();

            if (profileData.error) throw new Error(profileData.error.message || profileData.error);
            if (analyticsData.error) throw new Error(analyticsData.error);

            setData({
                profile: profileData.business_discovery,
                metrics: analyticsData
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch data. Ensure the account is a Creator/Business account.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') fetchAnalytics();
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white p-6 md:p-12 font-sans relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl backdrop-blur-sm ring-1 ring-white/10 mb-4 shadow-lg shadow-purple-500/10">
                        <Instagram className="w-8 h-8 text-pink-500 mr-2" />
                        <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                            InstaPulse
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Deep dive into any Instagram Business account. Unlock engagement metrics, content performance, and growth insights instantly.
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-xl mx-auto relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
                    <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 pr-2 shadow-2xl">
                        <Search className="w-6 h-6 text-gray-400 ml-4" />
                        <input
                            type="text"
                            placeholder="Enter Instagram Username (e.g. nike)"
                            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-gray-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        <button
                            onClick={fetchAnalytics}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-full font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Analyze <ArrowRight className="w-4 h-4 ml-2" /></>
                            )}
                        </button>
                    </div>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-center mt-4 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
                        >
                            ⚠️ {error}
                        </motion.p>
                    )}
                </motion.div>

                {/* Results */}
                {data && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        {/* Profile Overview */}
                        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-xl">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full blur-sm opacity-50" />
                                <img
                                    src={data.profile.profile_picture_url}
                                    alt={data.profile.username}
                                    className="relative w-32 h-32 rounded-full border-4 border-[#1a1a2e] shadow-2xl object-cover"
                                />
                            </div>
                            <div className="text-center md:text-left flex-1 space-y-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{data.profile.name || data.profile.username}</h2>
                                    <p className="text-purple-400 text-lg">@{data.profile.username}</p>
                                </div>
                                <p className="text-gray-300 max-w-2xl leading-relaxed">{data.profile.biography}</p>
                                {data.profile.website && (
                                    <a href={data.profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors inline-block border-b border-blue-400/30 pb-0.5">
                                        {data.profile.website.replace(/^https?:\/\//, '')}
                                    </a>
                                )}

                                <div className="flex justify-center md:justify-start gap-8 pt-4 border-t border-white/10">
                                    <div className="text-center md:text-left">
                                        <p className="text-2xl font-bold text-white">{data.profile.followers_count.toLocaleString()}</p>
                                        <p className="text-xs uppercase tracking-wider text-gray-500">Followers</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-2xl font-bold text-white">{data.profile.media_count.toLocaleString()}</p>
                                        <p className="text-xs uppercase tracking-wider text-gray-500">Posts</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<TrendingUp className="text-green-400" />}
                                label="Engagement Rate"
                                value={data.metrics.engagement_rate}
                                subtext="Avg interactions / Followers"
                                color="green"
                            />
                            <StatCard
                                icon={<MessageCircle className="text-blue-400" />}
                                label="Conversation Rate"
                                value={data.metrics.conversation_rate}
                                subtext="Avg comments per post"
                                color="blue"
                            />
                            <StatCard
                                icon={<ImageIcon className="text-pink-400" />}
                                label="Avg Image Likes"
                                value={data.metrics.avg_image_likes.toLocaleString()}
                                subtext="Core audience quality"
                                color="pink"
                            />
                            <StatCard
                                icon={<Calendar className="text-orange-400" />}
                                label="Posting Freq"
                                value={data.metrics.posting_frequency}
                                subtext="Avg days between posts"
                                color="orange"
                            />
                        </div>

                        {/* Format Efficiency Banner */}
                        <motion.div variants={itemVariants} className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-xl">
                                    {data.metrics.format_efficiency.includes('Video') ? <Video className="w-6 h-6 text-purple-300" /> : <ImageIcon className="w-6 h-6 text-purple-300" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Format Efficiency</h3>
                                    <p className="text-gray-400 text-sm">Best performing content type for this account</p>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-purple-200 bg-white/5 px-6 py-2 rounded-lg border border-white/5">
                                {data.metrics.format_efficiency}
                            </div>
                        </motion.div>

                        {/* Recent Media */}
                        <div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1 h-8 bg-blue-500 rounded-full inline-block" /> Recent Posts
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {data.profile.media.data.map((media) => (
                                    <motion.a
                                        variants={itemVariants}
                                        key={media.id}
                                        href={media.permalink || media.media_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative block aspect-square bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-white/20 transition-all"
                                    >
                                        {media.media_type === 'IMAGE' || media.media_type === 'CAROUSEL_ALBUM' ? (
                                            <div
                                                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                style={{ backgroundImage: `url(${media.media_url})` }}
                                            />
                                        ) : (
                                            <video src={media.media_url} className="w-full h-full object-cover" />
                                        )}

                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                                            <div className="flex gap-4 mb-2">
                                                <span className="flex items-center gap-1 font-bold"><Users className="w-4 h-4" /> {media.like_count}</span>
                                                <span className="flex items-center gap-1 font-bold"><MessageCircle className="w-4 h-4" /> {media.comments_count}</span>
                                            </div>
                                            <p className="text-xs text-gray-300 line-clamp-3">{media.caption || 'No Caption'}</p>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtext, color }) {
    const colorMap = {
        green: 'from-green-500/20 to-emerald-500/5 text-green-400 border-green-500/20',
        blue: 'from-blue-500/20 to-cyan-500/5 text-blue-400 border-blue-500/20',
        pink: 'from-pink-500/20 to-rose-500/5 text-pink-400 border-pink-500/20',
        orange: 'from-orange-500/20 to-amber-500/5 text-orange-400 border-orange-500/20',
    };

    return (
        <motion.div
            variants={{
                hidden: { scale: 0.95, opacity: 0 },
                visible: { scale: 1, opacity: 1 }
            }}
            className={`relative overflow-hidden bg-gradient-to-br ${colorMap[color]} backdrop-blur-md rounded-2xl p-6 border transition-all hover:-translate-y-1`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-sm text-gray-400 font-medium mb-1">{label}</p>
            <p className="text-xs text-gray-500/80">{subtext}</p>
        </motion.div>
    );
}
