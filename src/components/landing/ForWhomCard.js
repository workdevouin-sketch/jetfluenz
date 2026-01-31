import styles from './ForWhomCard.module.css';

export default function ForWhomCard({ title, description, benefits, buttonText = "Book a Call", onButtonClick }) {
    return (
        <div className={styles.card}>
            <div className={styles.card_title__container}>
                <span className={styles.card_title}>{title}</span>
                <p className={styles.card_paragraph}>
                    {description}
                </p>
            </div>
            <hr className={styles.line} />
            <ul className={styles.card__list}>
                {benefits.map((benefit, index) => (
                    <li key={index} className={styles.card__list_item}>
                        <span className={styles.check}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className={styles.check_svg}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </span>
                        <span className={styles.list_text}>{benefit}</span>
                    </li>
                ))}
            </ul>
            <button className={styles.button} onClick={onButtonClick}>{buttonText}</button>
        </div>
    );
}
