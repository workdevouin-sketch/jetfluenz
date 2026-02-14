import React, { useRef, useEffect } from 'react';
import { Eye } from 'lucide-react';

const GridItem = ({ videoSrc, imageSrc, className, span, reach }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        const playPromise = videoRef.current.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(() => {
                                // Auto-play was prevented or interrupted, silence error
                            });
                        }
                    } else {
                        videoRef.current.pause();
                    }
                }
            },
            { threshold: 0.2 } // Play when 20% visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className={`relative group overflow-hidden rounded-2xl cursor-pointer ${span}`}>
            {/* Media */}
            <div className="absolute inset-0 w-full h-full">
                {videoSrc ? (
                    <video
                        ref={videoRef}
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    >
                        <source src={videoSrc} type="video/mp4" />
                    </video>
                ) : (
                    <img
                        src={imageSrc}
                        alt="Grid Item"
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
            </div>

            {/* Top Badge */}
            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3 text-orange-500" />
                <span className="text-white text-xs font-bold">{reach}</span>
            </div>
        </div>
    );
};

const InteractiveHeroGrid = () => {
    return (
        <div className="w-full md:max-w-7xl mx-auto h-[80vh] md:h-[600px] p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-4 h-full">

                {/* London - Top Left */}
                <GridItem
                    videoSrc="/videos/vid2.mp4"
                    span="col-span-1 row-span-1"
                    reach="8.5k"
                />

                {/* Paris - Center Tall */}
                <GridItem
                    videoSrc="/videos/vid1.mp4"
                    span="col-span-1 row-span-1 md:row-span-2"
                    reach="9.2k"
                />

                {/* Rome - Top Right Wide */}
                <GridItem
                    videoSrc="/videos/vid3.mp4"
                    span="col-span-2 row-span-1"
                    reach="7.8k"
                />

                {/* Pisa - Bottom Left */}
                <GridItem
                    videoSrc="/videos/vid4.mp4"
                    span="col-span-1 row-span-1"
                    reach="8.1k"
                />

                {/* New York - Bottom Right 1 */}
                <GridItem
                    videoSrc="/videos/vid5.mp4"
                    span="col-span-1 row-span-1"
                    reach="9.5k"
                />

                {/* Sydney - Bottom Right 2 */}
                <GridItem
                    imageSrc="/card3-hero.png"
                    span="col-span-1 row-span-1"
                    reach="7.5k"
                />

            </div>
        </div>
    );
};

export default InteractiveHeroGrid;
