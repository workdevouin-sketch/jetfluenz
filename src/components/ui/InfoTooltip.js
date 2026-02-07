'use client';

import { Info } from 'lucide-react';

export default function InfoTooltip({ text }) {
    if (!text) return null;

    return (
        <div className="group relative flex items-center ml-2 cursor-help">
            <Info className="w-4 h-4 text-white/40 hover:text-white/80 transition-colors" />

            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 border border-white/10 rounded-lg text-xs text-white/90 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center backdrop-blur-sm">
                {text}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90" />
            </div>
        </div>
    );
}
