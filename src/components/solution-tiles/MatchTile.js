import React from 'react';
import styles from './SolutionTiles.module.css';

const MatchTile = () => {
    return (
        <div className={styles.featureCard}>
            <div className={styles.iconContainer}>
                <img
                    src="/match-icon.png"
                    alt="Smart Matching"
                    className={styles.tileImage}
                />
            </div>

            <h3 className={styles.cardTitle}>
                Smart Campaign<br />
                Matching
            </h3>
        </div>
    );
};

export default MatchTile;
