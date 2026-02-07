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
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30"
            >
                <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                >
                    <Check className="w-12 h-12 text-white stroke-[3]" />
                </motion.div>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4">You're on the list!</h2>
            <p className="text-xl text-white/70 max-w-lg mb-10">
                We've received your application. We're setting up your profile now and will be in touch soon with your access details.
            </p>

            <button
                onClick={onClose}
                className="px-8 py-3 bg-white text-[#2008b9] font-bold rounded-lg hover:bg-white/90 active:scale-95 transition-all"
            >
                Back to Home
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
