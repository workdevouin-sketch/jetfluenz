import React from 'react';
import styles from './SolutionTiles.module.css';

const TrackTile = () => {
    return (
        <div className={styles.featureCard}>
            <div className={styles.iconContainer}>
                <img
                    src="/track-icon.png"
                    alt="Track & Grow"
                    className={styles.tileImage}
                />
            </div>

            <h3 className={styles.cardTitle}>
                Track & Grow
            </h3>
        </div>
    );
};

export default TrackTile;
