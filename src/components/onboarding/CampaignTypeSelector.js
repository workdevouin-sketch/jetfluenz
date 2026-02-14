'use client';

import { Banknote, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const OPTIONS = [
    {
        id: 'paid',
        label: 'Paid Sponsorships',
        icon: Banknote,
        description: 'Get paid for your content'
    },
    {
        id: 'gifted',
        label: 'Gifting / Barter',
        icon: Gift,
        description: 'Products in exchange for posts'
    },
    {
        id: 'both',
        label: 'Open to Both',
        icon: Sparkles,
        description: 'Maximize opportunities'
    }
];

export default function CampaignTypeSelector({ value, onChange }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {OPTIONS.map((option) => {
                const isSelected = value === option.id;
                const Icon = option.icon;

                return (
                    <motion.button
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 h-32 text-center group ${isSelected
                            ? 'bg-[#2008b9]/5 border-[#2008b9] shadow-md shadow-[#2008b9]/10'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        type="button" // Prevent form submission
                    >
                        {isSelected && (
                            <div className="absolute top-2 right-2">
                                <CheckCircle2 className="w-5 h-5 text-[#2008b9]" />
                            </div>
                        )}

                        <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-[#2008b9]' : 'text-gray-400 group-hover:text-[#2008b9]'}`} />

                        <h4 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-[#2008b9]' : 'text-gray-700 group-hover:text-gray-900'}`}>
                            {option.label}
                        </h4>

                        <p className={`text-[10px] leading-tight ${isSelected ? 'text-[#2008b9]/80' : 'text-gray-500'}`}>
                            {option.description}
                        </p>
                    </motion.button>
                );
            })}
        </div>
    );
}
