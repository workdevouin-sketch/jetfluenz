import React from 'react';
import styles from './SolutionTiles.module.css';

const TrackTile = () => {
    return (
        <div className={styles.featureCard}>
            <div className={styles.iconContainer}>
                <svg className={styles.connectSvg} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">

                    {/* Axes */}
                    <line x1="20" y1="80" x2="90" y2="80" className={styles.iconStroke} />
                    <line x1="20" y1="80" x2="20" y2="20" className={styles.iconStroke} />

                    {/* Bar 1 */}
                    <rect x="30" y="60" width="10" height="20" className={`${styles.iconStroke} ${styles.trackBar}`} fill="#e0e0e0" style={{ transformOrigin: 'bottom', animationDelay: '0s' }} />

                    {/* Bar 2 */}
                    <rect x="50" y="45" width="10" height="35" className={`${styles.iconStroke} ${styles.trackBar}`} fill="#b0b0b0" style={{ transformOrigin: 'bottom', animationDelay: '0.2s' }} />

                    {/* Bar 3 */}
                    <rect x="70" y="30" width="10" height="50" className={`${styles.iconStroke} ${styles.trackBar}`} fill="#2008b9" style={{ transformOrigin: 'bottom', animationDelay: '0.4s' }} />

                    {/* Trend Line */}
                    <polyline points="35,60 55,45 75,30" fill="none" stroke="#2008b9" strokeWidth="2" strokeDasharray="2 2" />
                    <circle cx="75" cy="30" r="2" fill="#2008b9" />

                </svg>
            </div>

            <h3 className={styles.cardTitle}>
                Track & Grow
            </h3>
        </div>
    );
};

export default TrackTile;
