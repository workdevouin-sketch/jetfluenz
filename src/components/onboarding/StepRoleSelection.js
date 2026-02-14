'use client';

import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from './animationData';
import { Camera, Building2, ArrowRight } from 'lucide-react';

export default function StepRoleSelection({ onSelect }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="flex flex-col h-full justify-center"
        >
            <motion.div variants={fadeInUp} className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight">Welcome to Jetfluenz</h2>
                <p className="text-lg md:text-xl text-gray-600 font-light">Tell us who you are to get started.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto w-full">
                {/* Influencer Card */}
                <motion.button
                    variants={fadeInUp}
                    whileHover={{ scale: 1.03, borderColor: '#2008b9' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('influencer')}
                    className="group relative flex flex-col items-center p-6 md:p-12 rounded-2xl bg-gray-50 border border-gray-200 transition-all duration-300 text-left shadow-sm hover:shadow-xl hover:bg-white"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 md:mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Camera className="w-8 h-8 md:w-10 md:h-10 text-[#2008b9]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">I am an Influencer</h3>
                    <p className="text-gray-600 text-center text-sm leading-relaxed mb-4 md:mb-6">
                        Ready to monetize my reach and connect with premium brands.
                    </p>
                    <div className="flex items-center text-sm font-semibold text-gray-400 group-hover:text-[#2008b9] transition-colors">
                        Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.button>

                {/* Business Card */}
                <motion.button
                    variants={fadeInUp}
                    whileHover={{ scale: 1.03, borderColor: '#2008b9' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect('business')}
                    className="group relative flex flex-col items-center p-6 md:p-12 rounded-2xl bg-gray-50 border border-gray-200 transition-all duration-300 text-left shadow-sm hover:shadow-xl hover:bg-white"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 md:mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Building2 className="w-8 h-8 md:w-10 md:h-10 text-[#2008b9]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">I am a Business</h3>
                    <p className="text-gray-600 text-center text-sm leading-relaxed mb-4 md:mb-6">
                        Looking for authentic creators to amplify my brand's voice.
                    </p>
                    <div className="flex items-center text-sm font-semibold text-gray-400 group-hover:text-[#2008b9] transition-colors">
                        Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.button>
            </div>
        </motion.div>
    );
}
