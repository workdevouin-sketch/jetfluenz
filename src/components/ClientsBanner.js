'use client'

import { motion } from 'framer-motion'

const clients = [
    "Glow & Co.",
    "TechSphere",
    "Urban Kicks",
    "Green Leaf",
    "Pixel Art",
    "Fresh Bites",
    "Studio 42",
    "Blue Wave",
    // Duplicate for seamless scroll
    "Glow & Co.",
    "TechSphere",
    "Urban Kicks",
    "Green Leaf",
    "Pixel Art",
    "Fresh Bites",
    "Studio 42",
    "Blue Wave",
]

export default function ClientsBanner() {
    return (
        <div className="bg-white py-6 overflow-hidden border-b border-gray-100 relative">
            <div className="flex">
                <motion.div
                    className="flex space-x-12 md:space-x-24 whitespace-nowrap"
                    animate={{
                        x: [0, -1000],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 20,
                            ease: "linear",
                        },
                    }}
                >
                    {clients.map((client, index) => (
                        <span
                            key={index}
                            className="text-xl md:text-2xl font-bold text-gray-300 uppercase tracking-widest inline-block select-none"
                        >
                            {client}
                        </span>
                    ))}
                    {/* Duplicate list to ensure no gaps during scroll if screen is wide */}
                    {clients.map((client, index) => (
                        <span
                            key={`dup-${index}`}
                            className="text-xl md:text-2xl font-bold text-gray-300 uppercase tracking-widest inline-block select-none"
                        >
                            {client}
                        </span>
                    ))}
                </motion.div>
            </div>
            {/* Gradient masks for smooth fade edges */}
            <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
    )
}
