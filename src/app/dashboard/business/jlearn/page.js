'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { getDailyTip, getRandomTip } from '../../../../lib/jlearn-data';
import { BookOpen, Share2, Heart, Award, RefreshCw, Calendar, TrendingUp, DollarSign, Target } from 'lucide-react';

export default function BusinessJLearnPage() {
    const [dailyTip, setDailyTip] = useState(null);
    const [randomTip, setRandomTip] = useState(null);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        setDailyTip(getDailyTip('business'));
        setRandomTip(getRandomTip('business'));

        // Auto-rotate random tip every 10 seconds
        const interval = setInterval(() => {
            setRandomTip(getRandomTip('business'));
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleNewRandomTip = () => {
        const newTip = getRandomTip('business');
        setRandomTip(newTip);
        setLiked(false);
    };

    if (!dailyTip) return (
        <DashboardLayout role="business" title="JLearn">
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout role="business" title="JLearn">
            <div className="max-w-4xl mx-auto space-y-8 pb-12">

                {/* Header Section */}
                <div className="text-center space-y-2 mb-10">
                    <h1 className="text-4xl font-extrabold text-[#343C6A] tracking-tight">
                        Business <span className="text-[#2008b9]">Mastery</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Daily insights to maximize your influencer marketing ROI.
                    </p>
                </div>

                {/* Daily Tip Card - Hero */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#2008b9] to-[#0f035b] rounded-[2.5rem] p-1 shadow-2xl transform transition-all hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-[2.3rem] p-8 sm:p-10 h-full relative z-10 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/10 shadow-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Today's Insight
                            </span>
                            <span className="bg-indigo-500/30 text-indigo-100 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/10 shadow-sm">
                                {dailyTip.category}
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                            {dailyTip.title}
                        </h2>

                        <p className="text-lg text-blue-100 leading-relaxed max-w-2xl mb-8">
                            {dailyTip.content}
                        </p>

                        <div className="bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-blue-200 mb-1">Action Step</h4>
                                    <p className="text-white font-medium">{dailyTip.action}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Random Tip Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Learn Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen className="w-32 h-32 text-[#2008b9]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#343C6A] mb-4 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-[#2008b9]" /> Growth Hack
                        </h3>
                        {randomTip && (
                            <div className="space-y-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                                    {randomTip.category}
                                </span>
                                <h4 className="text-lg font-bold text-gray-800">{randomTip.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{randomTip.content}</p>
                                <div className="pt-4 border-t border-gray-100 mt-4">
                                    <p className="text-sm font-bold text-[#2008b9] flex items-center gap-2">
                                        <Target className="w-4 h-4" /> Try this: <span className="font-normal text-gray-600">{randomTip.action}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats / Motivation Card */}
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                                <Award className="w-6 h-6 text-yellow-400" /> Pro Tip
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">Invest in relationships, not just impressions.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Avg. ROI</p>
                                        <p className="text-lg font-bold">5.2x</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </DashboardLayout>
    );
}
