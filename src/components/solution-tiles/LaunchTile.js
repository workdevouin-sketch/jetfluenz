import React from 'react';
import styles from './SolutionTiles.module.css';

const LaunchTile = () => {
    return (
        <div className={styles.featureCard}>
            <div className={styles.iconContainer}>
                <img
                    src="/launch-icon.png"
                    alt="Launch Campaign"
                    className={styles.tileImage}
                />
            </div>

            <h3 className={styles.cardTitle}>
                Launch Impactful<br />
                Campaigns
            </h3>
        </div>
    );
};

export default LaunchTile;
