'use client';

import { useState, useMemo } from 'react';
import { Calculator as CalculatorIcon, DollarSign, RefreshCw } from 'lucide-react';

export default function Calculator() {
    const [values, setValues] = useState({
        followers: 10000,
        platform: 'instagram',
        contentType: 'single_post',
        engagement: 'standard',
        industry: 'fashion',
        usageRights: 'none'
    });

    const RATES = {
        platform: {
            instagram: 800,
            tiktok: 950,
            youtube: 1200,
            twitter: 600
        },
        content: {
            single_post: 1.0,
            story: 0.7,
            reels: 1.2,
            long_video: 1.5,
            campaign: 2.5
        },
        engagement: {
            standard: 0,
            good: 0.05,
            high: 0.20,
            viral: 0.50
        },
        industry: {
            tech: 1.5,
            beauty: 1.3,
            travel: 1.4,
            gaming: 1.3,
            fashion: 1.2,
            food: 1.1,
            fitness: 1.3,
            lifestyle: 1.2,
            entertainment: 1.4,
            other: 1.0
        },
        rights: {
            none: 0,
            limited: 0.20,
            full: 0.50
        }
    };

    const calculation = useMemo(() => {
        const { followers, platform, contentType, engagement, industry, usageRights } = values;

        // BP (Base Price) = Follower count ÷ 1,000 × Platform Rate
        const basePrice = (Number(followers) / 1000) * RATES.platform[platform];

        // Multipliers
        const cm = RATES.content[contentType];
        const em = 1 + RATES.engagement[engagement];
        const im = RATES.industry[industry];
        const ur = 1 + RATES.rights[usageRights];

        // Final Price = BP × CM × (1 + EM) × IM × (1 + UR)
        const finalPrice = basePrice * cm * em * im * ur;

        return {
            basePrice,
            finalPrice,
            breakdown: { cm, em, im, ur }
        };
    }, [values]);

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-xl text-[#2008b9]">
                        <CalculatorIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#343C6A]">Rate Calculator</h2>
                        <p className="text-gray-500 text-sm">Estimate influencer rates instantly</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Follower Count</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="followers"
                                value={values.followers}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border-none rounded-xl text-lg font-bold text-[#343C6A] focus:ring-2 focus:ring-[#2008b9]/20 transition-all outline-none"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Followers</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Platform</label>
                            <select name="platform" value={values.platform} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#2008b9]">
                                <option value="instagram">Instagram (₹800)</option>
                                <option value="tiktok">TikTok (₹950)</option>
                                <option value="youtube">YouTube (₹1200)</option>
                                <option value="twitter">Twitter (₹600)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Content Type</label>
                            <select name="contentType" value={values.contentType} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#2008b9]">
                                <option value="single_post">Single Post (1.0x)</option>
                                <option value="story">Story (0.7x)</option>
                                <option value="reels">Reels (1.2x)</option>
                                <option value="long_video">Long Video (1.5x)</option>
                                <option value="campaign">Campaign (2.5x)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Engagement</label>
                            <select name="engagement" value={values.engagement} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#2008b9]">
                                <option value="standard">Standard (0%)</option>
                                <option value="good">Good (+5%)</option>
                                <option value="high">High (+20%)</option>
                                <option value="viral">Viral (+50%)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Industry</label>
                            <select name="industry" value={values.industry} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#2008b9]">
                                <option value="fashion">Fashion (1.2x)</option>
                                <option value="beauty">Beauty (1.3x)</option>
                                <option value="tech">Technology (1.5x)</option>
                                <option value="food">Food & Beverage (1.1x)</option>
                                <option value="fitness">Fitness & Health (1.3x)</option>
                                <option value="travel">Travel (1.4x)</option>
                                <option value="gaming">Gaming (1.3x)</option>
                                <option value="lifestyle">Lifestyle (1.2x)</option>
                                <option value="entertainment">Entertainment (1.4x)</option>
                                <option value="other">Other (1.0x)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Usage Rights</label>
                        <select name="usageRights" value={values.usageRights} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-[#2008b9]">
                            <option value="none">None (Standard)</option>
                            <option value="limited">Limited (+20%)</option>
                            <option value="full">Full Ownership (+50%)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="flex flex-col gap-6">
                <div className="bg-[#2008b9] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center items-center text-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                    <p className="text-blue-200 font-medium mb-2 uppercase tracking-widest text-sm">Estimated Price</p>
                    <div className="flex items-center justify-center text-6xl font-black mb-4 tracking-tight">
                        <span className="text-4xl opacity-50 font-medium mr-1">₹</span>
                        {Math.round(calculation.finalPrice).toLocaleString('en-IN')}
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium border border-white/10 text-blue-100">
                        per {values.contentType.replace('_', ' ')}
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex-1">
                    <h3 className="font-bold text-[#343C6A] mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-gray-400" />
                        Cost Breakdown
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 font-medium">Base Price</span>
                            <span className="font-bold text-[#343C6A]">₹{calculation.basePrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 font-medium">Content Multiplier</span>
                            <span className="font-bold text-[#343C6A]">x{calculation.breakdown.cm}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 font-medium">Engagement Bonus</span>
                            <span className="font-bold text-[#343C6A]">x{calculation.breakdown.em}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 font-medium">Industry Factor</span>
                            <span className="font-bold text-[#343C6A]">x{calculation.breakdown.im}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 font-medium">Usage Rights</span>
                            <span className="font-bold text-[#343C6A]">x{calculation.breakdown.ur}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
