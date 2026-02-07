'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function SuccessScreen({ onClose }) {
    useEffect(() => {
        // Fire confetti on mount
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/30"
            >
                <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                >
                    <Check className="w-12 h-12 text-[#2008b9] stroke-[3]" />
                </motion.div>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4">You're on the list!</h2>
            <p className="text-xl text-white/70 max-w-lg mb-10">
                We've received your application. We're setting up your profile now and will be in touch soon with your access details.
            </p>

            <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-xl p-4 mb-8 border border-white/20">
                <p className="text-white/90 font-medium mb-3">
                    Don't wait! Follow us on Instagram for exclusive updates! 👇
                </p>

                <a
                    href="https://www.instagram.com/jetfluenz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block w-full bg-[#ff3333] text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] shadow-lg shadow-red-500/30 overflow-hidden"
                >
                    {/* Timer/Loading Bar Effect */}
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1 bg-white/40"
                    />

                    <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Follow on Instagram
                </a>
            </div>

            <button
                onClick={onClose}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors border-b border-transparent hover:border-white/60 pb-0.5"
            >
                Close this window
            </button>

            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 right-10 opacity-20 pointer-events-none"
            >
                <Sparkles className="w-24 h-24" />
            </motion.div>
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-10 left-10 opacity-20 pointer-events-none"
            >
                <Sparkles className="w-16 h-16" />
            </motion.div>
        </motion.div>
    );
}
