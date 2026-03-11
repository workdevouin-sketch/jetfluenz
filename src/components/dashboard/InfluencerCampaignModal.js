import { X, Calendar, DollarSign, Users, Target, Instagram, MessageSquare, CheckCircle, Info, MapPin } from 'lucide-react';

export default function InfluencerCampaignModal({ campaign, onClose, onApply, loading, userApplied }) {
    if (!campaign) return null;

    const payout = Math.round(parseInt(campaign.budget || 0) * 0.25);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header Image/Gradient */}
                <div className="h-32 bg-gradient-to-r from-[#2008b9] to-indigo-600 relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-8 left-8">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
                            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-[#2008b9] text-3xl font-black">
                                {campaign.businessName?.[0]?.toUpperCase() || 'B'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 pt-12 pb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-[#343C6A] leading-tight mb-1">{campaign.title}</h2>
                            <p className="text-gray-400 flex items-center gap-1.5 font-medium">
                                <MapPin className="w-4 h-4" /> {campaign.businessName || 'Brand'} • {campaign.location || 'Global'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Your Payout</p>
                            <p className="text-3xl font-black text-[#2008b9]">₹{payout.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <Users className="w-5 h-5 text-blue-600 mb-2" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Followers</p>
                            <p className="font-bold text-gray-700 text-sm">{campaign.minFollowers && parseInt(campaign.minFollowers) > 0 ? `${(parseInt(campaign.minFollowers) / 1000).toFixed(1)}k+` : 'Any'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <Info className="w-5 h-5 text-purple-600 mb-2" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Engagement</p>
                            <p className="font-bold text-gray-700 text-sm">{campaign.engagement || 'Any'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <Calendar className="w-5 h-5 text-emerald-600 mb-2" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Deadline</p>
                            <p className="font-bold text-gray-700 text-sm">{campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <Instagram className="w-5 h-5 text-pink-600 mb-2" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Platform</p>
                            <p className="font-bold text-gray-700 text-sm">{campaign.platform || 'Instagram'}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <MessageSquare className="w-4 h-4 text-[#2008b9]" />
                                Campaign Brief
                            </h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                {campaign.description || "No description provided."}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <Target className="w-4 h-4 text-[#2008b9]" />
                                Goals & Requirements
                            </h3>
                            <ul className="grid grid-cols-1 gap-2">
                                <li className="flex items-start gap-3 text-sm text-gray-500 bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span>Target Niche: <strong>{campaign.niche || 'Any'}</strong></span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-gray-500 bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                    <span>Objective: <strong>{campaign.goal || 'General Awareness'}</strong></span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t flex gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-100 transition-all active:scale-95"
                    >
                        Close
                    </button>
                    {userApplied ? (
                        <div className="flex-[2] py-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-sm text-center flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Already Applied
                        </div>
                    ) : (
                        <button
                            onClick={() => onApply(campaign)}
                            disabled={loading}
                            className="flex-[2] py-3.5 rounded-xl bg-[#2008b9] text-white font-bold text-sm hover:bg-blue-800 shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</>
                            ) : (
                                <>Apply to Campaign <Instagram className="w-4 h-4" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
