import React from 'react';
import styles from './SolutionTiles.module.css';

const ConnectTile = () => {
    return (
        <div className={styles.featureCard}>
            <div className={styles.iconContainer}>
                <svg className={styles.connectSvg} viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">

                    <line x1="35" y1="25" x2="65" y2="25" className={styles.connectionLine} />
                    <line x1="85" y1="25" x2="115" y2="25" className={styles.connectionLine} />

                    <circle className={styles.signalDot} cy="25" cx="25" />

                    <g className={`${styles.iconGroup} ${styles.businessIcon}`}>
                        <rect x="15" y="15" width="20" height="24" rx="2" className={styles.iconStroke} />
                        <line x1="20" y1="22" x2="30" y2="22" className={styles.iconStroke} />
                        <line x1="20" y1="27" x2="30" y2="27" className={styles.iconStroke} />
                        <line x1="20" y1="32" x2="26" y2="32" className={styles.iconStroke} />
                        <path d="M 25,10 L 25,18 M 22,13 L 25,10 L 28,13" className={styles.iconStroke} transform="translate(0, -3)" />
                    </g>

                    <g className={`${styles.iconGroup} ${styles.globeIcon}`}>
                        <circle cx="75" cy="25" r="12" className={styles.iconStroke} />
                        <path d="M 63,25 L 87,25" className={styles.iconStroke} />
                        <path d="M 75,13 C 70,13 70,37 75,37 C 80,37 80,13 75,13" className={styles.iconStroke} />
                        <text x="75" y="46" fontSize="6" fontFamily="Arial" textAnchor="middle" fill="#666">Connect</text>
                    </g>

                    <g className={`${styles.iconGroup} ${styles.influencerIcon}`}>
                        <path d="M 115,13 H 135 A 2,2 0 0 1 137,15 V 29 A 2,2 0 0 1 135,31 H 120 L 115,36 V 15 A 2,2 0 0 1 117,13 Z" className={styles.iconStroke} />
                        <path d="M 126,24 C 126,24 123,21 123,19.5 C 123,18 124.5,17 126,17 C 127.5,17 129,18 129,19.5 C 129,21 126,24 126,24 Z" fill="#2008b9" />
                    </g>

                </svg>
            </div>

            <h3 className={styles.cardTitle}>
                Connect Businesses<br />
                & Startups with<br />
                Micro-Influencers
            </h3>
        </div>
    );
};

export default ConnectTile;
