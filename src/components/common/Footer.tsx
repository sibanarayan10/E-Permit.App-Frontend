/**
 * Footer Component - Clean professional design
 */

import React from 'react';
import { makeStyles, tokens, Text } from '@fluentui/react-components';

const useStyles = makeStyles({
    footer: {
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)',
        color: 'white',
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
        marginTop: 'auto',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        '@media (min-width: 768px)': {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
    },
    brand: {
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        display: 'none',
        '@media (min-width: 768px)': {
            display: 'block',
        },
    },
    center: {
        fontSize: tokens.fontSizeBase100,
        opacity: 0.8,
        display: 'none',
        '@media (min-width: 992px)': {
            display: 'block',
        },
    },
    credits: {
        fontSize: tokens.fontSizeBase200,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    heart: {
        color: '#ef4444',
    },
    name: {
        color: '#ffc107',
        fontWeight: tokens.fontWeightSemibold,
    },
});

export const Footer: React.FC = () => {
    const styles = useStyles();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <Text className={styles.brand}>
                    🛡️ e-PTW System • Bhilai Steel Plant
                </Text>

                <Text className={styles.center}>
                    Safety Engineering Dept • ISO 45001 Certified
                </Text>

                <Text className={styles.credits}>
                    Designed with <span className={styles.heart}>❤️</span> by
                    <span className={styles.name}>Venkatpati Raju</span>
                    • AM (Safety)
                </Text>
            </div>
        </footer>
    );
};

export default Footer;
