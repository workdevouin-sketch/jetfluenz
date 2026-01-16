import React from 'react';
import styles from './SolutionTiles.module.css';

const MatchTile = () => {
    return (
        <div className={styles.featureCard}>
            <div className={styles.iconContainer}>
                <svg className={styles.connectSvg} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">

                    {/* Left Piece (Business) */}
                    <g className={styles.matchPulse} style={{ transformOrigin: '40px 50px' }}>
                        <path d="M 20,40 H 40 V 50 A 5,5 0 0 0 40,60 V 70 H 20 V 55 A 5,5 0 0 1 20,45 V 40 Z"
                            className={styles.iconStroke} fill="white" />
                        <text x="30" y="58" fontSize="8" textAnchor="middle" fill="#2008b9">Biz</text>
                    </g>

                    {/* Right Piece (Influencer) */}
                    <g className={styles.matchPulse} style={{ transformOrigin: '60px 50px', animationDelay: '1s' }}>
                        <path d="M 80,40 H 60 V 45 A 5,5 0 0 0 60,55 V 70 H 80 V 60 A 5,5 0 0 1 80,50 V 40 Z"
                            className={styles.iconStroke} fill="#2008b9" />
                        <text x="70" y="58" fontSize="8" textAnchor="middle" fill="white">Inf</text>
                    </g>

                    {/* Connection Lines */}
                    <path d="M 45,30 Q 50,20 55,30" className={styles.connectionLine} />
                    <path d="M 45,80 Q 50,90 55,80" className={styles.connectionLine} />

                </svg>
            </div>

            <h3 className={styles.cardTitle}>
                Smart Campaign<br />
                Matching
            </h3>
        </div>
    );
};

export default MatchTile;
