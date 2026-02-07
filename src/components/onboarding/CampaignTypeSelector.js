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
                                ? 'bg-white/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                            }`}
                        type="button" // Prevent form submission
                    >
                        {isSelected && (
                            <div className="absolute top-2 right-2">
                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            </div>
                        )}

                        <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-blue-400' : 'text-white/60 group-hover:text-white/90'}`} />

                        <h4 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-white' : 'text-white/80'}`}>
                            {option.label}
                        </h4>

                        <p className="text-[10px] text-white/50 leading-tight">
                            {option.description}
                        </p>
                    </motion.button>
                );
            })}
        </div>
    );
}
