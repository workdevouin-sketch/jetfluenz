import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Users, ExternalLink, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function CampaignDetailsModal({ campaign, onClose }) {
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [accepting, setAccepting] = useState(false);

    // Helper: Compact Number (e.g. 1.2K)
    const compactNumber = (number) => {
        if (!number) return '0';
        return Intl.NumberFormat('en-US', {
            notation: "compact",
            maximumFractionDigits: 1
        }).format(number);
    };

    // Helper: Calculate JetScore (Client-side replication of InstagramStats logic)
    const calculateJetScore = (data) => {
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

        return Math.round((followerScore * 0.3) + (engagementScore * 0.4) + (activityScore * 0.3));
    };

    const handleAcceptCandidate = async () => {
        if (!selectedApplicant || !campaign.id) return;
        if (!confirm(`Are you sure you want to accept ${selectedApplicant.name}? This will close the campaign.`)) return;

        setAccepting(true);
        try {
            const campaignRef = doc(db, 'campaigns', campaign.id);
            // 1. Get latest campaign data to ensure we have current applicants
            const campaignSnap = await getDoc(campaignRef);
            if (!campaignSnap.exists()) throw new Error("Campaign not found");

            const campaignData = campaignSnap.data();

            // 2. Update applicants array
            const updatedApplicants = (campaignData.applicants || []).map(app => {
                if (app.id === selectedApplicant.id) {
                    return { ...app, status: 'accepted' };
                }
                return app; // Keep others as is, or mark 'rejected' if desired
            });

            // 3. Update Document
            await updateDoc(campaignRef, {
                status: 'offered',
                applicants: updatedApplicants,
                assignedTo: {
                    id: selectedApplicant.id,
                    name: selectedApplicant.name,
                    email: selectedApplicant.email,
                    profilePicture: stats?.profilePic || selectedApplicant.profile_picture_url || ''
                }
            });

            alert(`Successfully accepted ${selectedApplicant.name}!`);
            onClose(); // Close modal to refresh or just hide (Page refresh might be needed to reflect status change on UI)
            window.location.reload(); // Force reload to update dashboard state (Simple solution for now)

        } catch (error) {
            console.error("Error accepting candidate:", error);
            alert("Failed to accept candidate. Please try again.");
        } finally {
            setAccepting(false);
        }
    };

    useEffect(() => {
        const fetchApplicantStats = async () => {
            if (!selectedApplicant) {
                setStats(null);
                return;
            }

            setLoadingStats(true);
            try {
                const docRef = doc(db, 'users', selectedApplicant.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const igData = userData.instagram_stats;

                    if (igData && igData.profile) {
                        // Correct Data Path found in DB
                        setStats({
                            jetscore: calculateJetScore(igData),
                            engagement: igData.metrics?.engagement_rate || '0.00%',
                            postsPerWeek: igData.metrics?.posting_frequency?.replace(' Days', '') || '0',
                            totalPosts: igData.profile?.media_count || 0,
                            avgLikes: compactNumber(igData.metrics?.avg_image_likes),
                            avgComments: igData.metrics?.conversation_rate || '0',
                            followers: igData.profile?.followers_count || 0,
                            profilePic: igData.profile?.profile_picture_url || userData.profilePicture || selectedApplicant.profile_picture_url,
                            username: igData.profile?.username || userData.username || selectedApplicant.username,
                            name: igData.profile?.name || userData.name || selectedApplicant.name,
                            niche: userData.niche || 'Creator'
                        });
                    } else {
                        // Fallback: User exists but no synced stats
                        setStats({
                            jetscore: userData.jetscore || 0,
                            engagement: '0.00%',
                            postsPerWeek: '-',
                            totalPosts: 0,
                            avgLikes: '-',
                            avgComments: '-',
                            followers: 0,
                            profilePic: userData.profilePicture || selectedApplicant.profile_picture_url,
                            username: userData.username || selectedApplicant.username,
                            name: userData.name || selectedApplicant.name,
                            niche: userData.niche || 'Creator'
                        });
                    }
                } else {
                    // Fallback: User doc missing completely
                    setStats({
                        jetscore: 0,
                        engagement: '0.00%',
                        postsPerWeek: '-',
                        totalPosts: 0,
                        avgLikes: '-',
                        avgComments: '-',
                        followers: 0,
                        profilePic: selectedApplicant.profile_picture_url,
                        username: selectedApplicant.username,
                        name: selectedApplicant.name,
                        niche: 'Creator'
                    });
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchApplicantStats();
    }, [selectedApplicant]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl flex overflow-hidden">

                {/* LEFT PANEL: Campaign Info & Applicants List */}
                <div className={`w-full ${selectedApplicant ? 'lg:w-1/3 border-r' : 'lg:w-full'} flex flex-col bg-gray-50 transition-all duration-300`}>

                    {/* Header */}
                    <div className="p-6 bg-white border-b sticky top-0 z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#343C6A] line-clamp-1" title={campaign.title}>{campaign.title}</h2>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${campaign.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {campaign.launchDate || 'No Date'}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {campaign.budget}</span>
                        </div>
                    </div>

                    {/* Applicants List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                            Applicants ({campaign.applicants?.length || 0})
                        </h3>

                        <div className="space-y-2">
                            {(!campaign.applicants || campaign.applicants.length === 0) ? (
                                <div className="text-center py-10 text-gray-400 text-sm italic">
                                    No applicants yet.
                                </div>
                            ) : (
                                campaign.applicants.map((app) => (
                                    <div
                                        key={app.id}
                                        onClick={() => setSelectedApplicant(app)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedApplicant?.id === app.id
                                            ? 'bg-white border-[#2008b9] shadow-md ring-1 ring-[#2008b9]'
                                            : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-[#2008b9] font-bold">
                                                {app.name?.[0] || 'U'}
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <h4 className="font-bold text-[#343C6A] text-sm truncate">{app.name}</h4>
                                                <p className="text-xs text-gray-400 truncate">{app.email || 'No email'}</p>
                                            </div>
                                            <Clock className="w-3 h-3 text-gray-300" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Analysis Card */}
                {selectedApplicant && (
                    <div className="w-full lg:w-2/3 bg-white overflow-y-auto animate-in slide-in-from-right-10 duration-300 p-8">
                        {loadingStats ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2008b9] mb-4"></div>
                                <p>Analyzing Profile...</p>
                            </div>
                        ) : stats && (
                            <div className="max-w-2xl mx-auto">
                                {/* Profile Header */}
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                                        {stats.profilePic ? (
                                            <img src={stats.profilePic} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-2xl font-bold text-gray-300">{stats.name?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#343C6A] flex items-center gap-2">
                                            {stats.name}
                                            <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-50" />
                                        </h2>
                                        <p className="text-gray-500">@{stats.username || stats.name?.toLowerCase().replace(/\s/g, '_')}</p>
                                        <div className="text-xs font-bold text-gray-400 mt-1">{compactNumber(stats.followers)} FOLLOWERS</div>
                                    </div>
                                </div>

                                {/* Jetscore Card */}
                                <div className="bg-[#2008b9] text-white rounded-3xl p-6 mb-6 shadow-xl shadow-blue-200 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                                    <div className="relative z-10 flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">JetScore</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-6xl font-black">{stats.jetscore}</span>
                                                <span className="text-xl opacity-60 font-medium">/100</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold border border-white/10">
                                            Good
                                        </div>
                                    </div>
                                    <p className="text-[10px] opacity-60 text-right mt-2">Based on performance</p>
                                </div>

                                {/* Engagement Rate */}
                                <div className="bg-white border-2 border-gray-50 rounded-3xl p-6 mb-8 flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Engagement rate</p>
                                        <p className="text-4xl font-bold text-[#2008b9]">{stats.engagement}</p>
                                    </div>
                                    <div className="bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                                        😎 Excellent!
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Posts/Week</p>
                                        <p className="text-xl font-bold text-[#343C6A]">{stats.postsPerWeek} <span className="text-xs font-normal text-gray-400">Days/Post</span></p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Total Posts</p>
                                        <p className="text-xl font-bold text-[#343C6A]">{stats.totalPosts}</p>
                                    </div>
                                    {/* You can add more cards here for Avg Likes etc */}
                                    <div className="p-5 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Avg Likes</p>
                                        <p className="text-xl font-bold text-[#343C6A]">{stats.avgLikes}</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Avg Comments</p>
                                        <p className="text-xl font-bold text-[#343C6A]">{stats.avgComments}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={handleAcceptCandidate}
                                        disabled={accepting}
                                        className="flex-1 bg-[#2008b9] text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {accepting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Accepting...
                                            </>
                                        ) : 'Accept Candidate'}
                                    </button>
                                    <button className="px-6 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                                        View Profile <ExternalLink className="w-4 h-4 inline ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
