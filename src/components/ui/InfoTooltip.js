'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

export default function InfoTooltip({ text }) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on scroll to prevent detached tooltips
    useEffect(() => {
        if (isVisible) {
            const handleScroll = () => setIsVisible(false);
            window.addEventListener('scroll', handleScroll, true);
            return () => window.removeEventListener('scroll', handleScroll, true);
        }
    }, [isVisible]);

    if (!text) return null;

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top - 8, // Slight offset up
                left: rect.left + rect.width / 2
            });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <>
            <div
                ref={triggerRef}
                className="relative flex items-center ml-2 cursor-help"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Info className="w-4 h-4 text-white/40 hover:text-white/80 transition-colors" />
            </div>

            {mounted && isVisible && createPortal(
                <div
                    className="fixed z-[9999] w-48 p-2 bg-black/90 border border-white/10 rounded-lg text-xs text-white/90 shadow-xl text-center backdrop-blur-sm pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{ top: position.top, left: position.left }}
                >
                    {text}
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90" />
                </div>,
                document.body
            )}
        </>
    );
}
