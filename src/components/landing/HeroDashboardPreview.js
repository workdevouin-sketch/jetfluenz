import React, { useState, useEffect } from 'react';
import { BarChart3, Users, DollarSign, Briefcase, LayoutGrid, Settings, TrendingUp, Search, Bell, Plus, Check, Star, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroDashboardPreview = () => {
    const [step, setStep] = useState(0); // 0: Dashboard, 1: Create, 2: Matching, 3: Active
    const [cursorPos, setCursorPos] = useState({ x: '80%', y: '80%' });
    const [cursorClick, setCursorClick] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // Animation Sequence
    useEffect(() => {
        const sequence = async () => {
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Infinite Loop
            while (true) {
                // --- STEP 0: Dashboard View ---
                setStep(0);
                setInputValue('');
                setCursorPos({ x: '90%', y: '90%' }); // Idle bottom right
                await wait(2000);

                // Move to "New Campaign" button
                setCursorPos({ x: '85%', y: '16%' });
                await wait(1000);
                setCursorClick(true);
                await wait(200);
                setCursorClick(false);
                await wait(500);

                // --- STEP 1: Create Campaign Form ---
                setStep(1);
                setCursorPos({ x: '50%', y: '40%' }); // Move to input
                await wait(1000);

                // Typing Simulation
                const text = "Summer Launch 2024";
                for (let i = 0; i <= text.length; i++) {
                    setInputValue(text.slice(0, i));
                    await wait(50 + Math.random() * 50);
                }
                await wait(500);

                // Move to "Next" button
                setCursorPos({ x: '75%', y: '75%' });
                await wait(800);
                setCursorClick(true);
                await wait(200);
                setCursorClick(false);
                await wait(500);

                // --- STEP 2: Matching Screen ---
                setStep(2);
                setCursorPos({ x: '50%', y: '50%' }); // Idle center
                await wait(1000);

                // Move to "Invite" first influencer
                setCursorPos({ x: '85%', y: '40%' });
                await wait(800);
                setCursorClick(true);
                await wait(200);
                setCursorClick(false);
                await wait(500);

                // Move to "Launch" button
                setCursorPos({ x: '85%', y: '85%' });
                await wait(800);
                setCursorClick(true);
                await wait(200);
                setCursorClick(false);
                await wait(500);

                // --- STEP 3: Active Campaign (Success) ---
                setStep(3);
                setCursorPos({ x: '90%', y: '90%' }); // Move away
                await wait(4000); // Show success state for a while
            }
        };

        sequence();
    }, []);

    return (
        <div className="relative w-full max-w-[600px] lg:max-w-4xl mx-auto z-20 perspective-1000">
            {/* Browser Window / Dashboard Container */}
            <div className="bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-y-[-5deg] rotate-x-[2deg] hover:rotate-0 transition-all duration-700 ease-out h-[450px] flex flex-col">

                {/* Simulated Top Bar */}
                <div className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="hidden sm:flex bg-gray-100 rounded-lg px-3 py-1.5 items-center gap-2 w-64">
                        <Search className="w-3 h-3 text-gray-400" />
                        <div className="text-xs text-gray-400">Search...</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-gray-400" />
                        <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200"></div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Simulated Sidebar */}
                    <div className="w-16 sm:w-48 bg-white border-r border-gray-100 py-4 flex flex-col gap-1 hidden sm:flex">
                        <div className="px-4 mb-6">
                            <div className="h-6 w-6 bg-[#2008b9] rounded-lg"></div>
                        </div>

                        {[
                            { icon: LayoutGrid, label: 'Dashboard', active: step === 0 || step === 3 },
                            { icon: Briefcase, label: 'Campaigns', active: step === 1 || step === 2 },
                            { icon: Users, label: 'Influencers', active: false },
                            { icon: TrendingUp, label: 'Analytics', active: false },
                        ].map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-blue-50 text-[#2008b9]' : 'text-gray-500'}`}>
                                <item.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-6 bg-gray-50 overflow-hidden relative">
                        <AnimatePresence mode="wait">

                            {/* --- STEP 0: Dashboard Overview --- */}
                            {step === 0 && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-[#343C6A]">Campaign Overview</h2>
                                            <p className="text-xs text-gray-500 mt-1">Track your active influencer collaborations.</p>
                                        </div>
                                        <button className="bg-[#2008b9] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 hidden sm:flex items-center gap-2">
                                            <Plus className="w-3 h-3" /> New Campaign
                                        </button>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <StatCard icon={Users} label="Reach" value="2.4M" color="blue" />
                                        <StatCard icon={DollarSign} label="ROI" value="320%" color="green" />
                                        <StatCard icon={BarChart3} label="Engag." value="4.8%" color="purple" />
                                    </div>

                                    {/* Recent Activity Table */}
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1">
                                        <div className="px-4 py-3 border-b border-gray-50 font-bold text-xs text-[#343C6A]">Recent Activity</div>
                                        <div className="divide-y divide-gray-50">
                                            <ActivityRow name="Summer Collection" influencer="Sarah J." status="Active" color="green" />
                                            <ActivityRow name="Tech Review" influencer="Mike R." status="Pending" color="yellow" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* --- STEP 1: Create Campaign --- */}
                            {step === 1 && (
                                <motion.div
                                    key="create"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full flex flex-col"
                                >
                                    <h2 className="text-xl font-bold text-[#343C6A] mb-6">Create New Campaign</h2>

                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 flex-1">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Campaign Title</label>
                                            <div className="w-full p-2 border border-blue-200 rounded-lg text-sm text-[#343C6A] bg-blue-50/20 relative">
                                                {inputValue}
                                                <span className="animate-pulse">|</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Budget</label>
                                                <div className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50">$2,500</div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 block mb-1">Platform</label>
                                                <div className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50">Instagram</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button className="bg-[#2008b9] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 flex items-center gap-2">
                                            Next Step <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* --- STEP 2: Smart Matching --- */}
                            {step === 2 && (
                                <motion.div
                                    key="match"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full flex flex-col"
                                >
                                    <h2 className="text-xl font-bold text-[#343C6A] mb-4">Smart Matching</h2>
                                    <p className="text-xs text-gray-500 mb-4">We found 3 influencers matching your campaign.</p>

                                    <div className="space-y-3">
                                        <InfluencerRow name="Jessica Park" niche="Fashion" match="98%" invited={true} />
                                        <InfluencerRow name="David Chen" niche="Lifestyle" match="92%" invited={false} />
                                        <InfluencerRow name="Sarah Miller" niche="Beauty" match="88%" invited={false} />
                                    </div>

                                    <div className="mt-auto flex justify-end pt-4">
                                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md shadow-green-500/20 flex items-center gap-2">
                                            <Check className="w-3 h-3" /> Launch Campaign
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* --- STEP 3: Active Success --- */}
                            {step === 3 && (
                                <motion.div
                                    key="active"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="h-full flex flex-col items-center justify-center text-center p-8"
                                >
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                        <Check className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#343C6A] mb-2">Campaign Active!</h2>
                                    <p className="text-gray-500 text-sm mb-6">"Summer Launch 2024" is now live. Updates will appear in your dashboard.</p>

                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full max-w-xs">
                                        <ActivityRow name="Summer Launch 2024" influencer="Jessica Park" status="Active" color="green" />
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>

                        {/* --- Cursor Animation --- */}
                        <motion.div
                            className="absolute z-50 pointer-events-none"
                            animate={{
                                top: cursorPos.y,
                                left: cursorPos.x,
                                scale: cursorClick ? 0.8 : 1
                            }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg filter">
                                <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19169L11.7841 12.3673H5.65376Z" fill="black" stroke="white" strokeWidth="1" />
                            </svg>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components to keep clean ---

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className={`flex items-center gap-2 mb-2`}>
            <div className={`p-1.5 rounded-lg bg-${color}-100 text-${color}-600`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">{label}</span>
        </div>
        <div className="text-lg font-bold text-[#343C6A]">{value}</div>
    </div>
);

const ActivityRow = ({ name, influencer, status, color }) => (
    <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500`}>
                {influencer.charAt(0)}
            </div>
            <div className="text-left">
                <div className="text-xs font-bold text-[#343C6A]">{name}</div>
                <div className="text-[10px] text-gray-400">{influencer}</div>
            </div>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold bg-${color}-100 text-${color}-600`}>
            {status}
        </span>
    </div>
);

const InfluencerRow = ({ name, niche, match, invited }) => (
    <div className={`p-3 rounded-lg border flex items-center justify-between ${invited ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div>
                <div className="text-sm font-bold text-[#343C6A]">{name}</div>
                <div className="text-[10px] text-gray-500">{niche} • {match} Match</div>
            </div>
        </div>
        <button className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${invited ? 'bg-green-100 text-green-700' : 'bg-[#2008b9] text-white'}`}>
            {invited ? 'Selected' : 'Select'}
        </button>
    </div>
);

export default HeroDashboardPreview;
