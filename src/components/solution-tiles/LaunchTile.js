import React from 'react';
import styles from './SolutionTiles.module.css';

const LaunchTile = () => {
    return (
        <div className={styles.featureCard}>
            <div className={styles.iconContainer}>
                <svg className={styles.connectSvg} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    {/* Clouds/Smoke */}
                    <circle cx="30" cy="80" r="10" fill="#f0f0f0" />
                    <circle cx="70" cy="80" r="12" fill="#f0f0f0" />
                    <circle cx="50" cy="85" r="15" fill="#f0f0f0" />

                    {/* Rocket Group */}
                    <g className={styles.launchRocket}>
                        {/* Fins */}
                        <path d="M 40,60 L 30,70 L 40,70 Z" className={styles.iconStroke} fill="#333" />
                        <path d="M 60,60 L 70,70 L 60,70 Z" className={styles.iconStroke} fill="#333" />

                        {/* Body */}
                        <path d="M 40,60 Q 50,20 60,60 L 60,70 H 40 L 40,60 Z" className={styles.iconStroke} fill="white" />
                        <path d="M 50,25 A 2,2 0 0 1 50,30" className={styles.iconStroke} />

                        {/* Window */}
                        <circle cx="50" cy="45" r="5" className={styles.iconStroke} fill="#2008b9" />

                        {/* Flame */}
                        <path d="M 45,70 Q 50,85 55,70" className={styles.iconStroke} fill="orange" />
                    </g>
                </svg>
            </div>

            <h3 className={styles.cardTitle}>
                Launch Impactful<br />
                Campaigns
            </h3>
        </div>
    );
};

export default LaunchTile;
