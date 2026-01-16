import React from 'react';
import styles from './Preloader.module.css';

const Preloader = () => {
    return (
        <div className={styles.loaderContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.textMask}>
                    <div className={styles.brandName}>Jetfluenz</div>
                </div>
                <div className={styles.loadingBar}></div>
            </div>
        </div>
    );
};

export default Preloader;
