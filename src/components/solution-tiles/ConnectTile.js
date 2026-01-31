import React from 'react';
import styles from './SolutionTiles.module.css';

const ConnectTile = () => {
    return (
        <div className={styles.featureCard}>
            <div className={styles.iconContainer}>
                <img
                    src="/connect-icon.png"
                    alt="Connect Business & Influencers"
                    className={styles.tileImage}
                />
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
