'use client';

import { motion } from 'framer-motion';
import { Camera, Building2, ArrowRight } from 'lucide-react';

export default function StepRoleSelection({ onSelect }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full justify-center"
        >
            <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight">Welcome to Jetfluenz</h2>
                <p className="text-lg md:text-xl text-white/70 font-light">Tell us who you are to get started.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto w-full">
                {/* Influencer Card */}
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('influencer')}
                    className="group relative flex flex-col items-center p-6 md:p-12 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 text-left"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 md:mb-6 shadow-xl group-hover:shadow-purple-500/25 transition-shadow">
                        <Camera className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">I am an Influencer</h3>
                    <p className="text-white/60 text-center text-sm leading-relaxed mb-4 md:mb-6">
                        Ready to monetize my reach and connect with premium brands.
                    </p>
                    <div className="flex items-center text-sm font-semibold text-white/40 group-hover:text-white transition-colors">
                        Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.button>

                {/* Business Card */}
                <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('business')}
                    className="group relative flex flex-col items-center p-6 md:p-12 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 text-left"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 md:mb-6 shadow-xl group-hover:shadow-emerald-500/25 transition-shadow">
                        <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2">I am a Business</h3>
                    <p className="text-white/60 text-center text-sm leading-relaxed mb-4 md:mb-6">
                        Looking for authentic creators to amplify my brand's voice.
                    </p>
                    <div className="flex items-center text-sm font-semibold text-white/40 group-hover:text-white transition-colors">
                        Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.button>
            </div>
        </motion.div>
    );
}
