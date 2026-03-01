/**
 * Loading Component - Reusable loading spinners
 */

import React from 'react';
import {
    makeStyles,
    tokens,
    Spinner,
    Text,
} from '@fluentui/react-components';

const useStyles = makeStyles({
    fullPage: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: tokens.spacingVerticalM,
    },
    inline: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.spacingVerticalXXL,
        gap: tokens.spacingVerticalM,
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
        gap: tokens.spacingVerticalM,
    },
    label: {
        color: tokens.colorNeutralForeground2,
    },
});

type LoadingVariant = 'fullPage' | 'inline' | 'overlay';
type SpinnerSize = 'tiny' | 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' | 'huge';

interface LoadingProps {
    variant?: LoadingVariant;
    size?: SpinnerSize;
    label?: string;
}

export const Loading: React.FC<LoadingProps> = ({
    variant = 'inline',
    size = 'medium',
    label = 'Loading...',
}) => {
    const styles = useStyles();

    const containerClass = {
        fullPage: styles.fullPage,
        inline: styles.inline,
        overlay: styles.overlay,
    }[variant];

    return (
        <div className={containerClass}>
            <Spinner size={size} />
            {label && <Text className={styles.label}>{label}</Text>}
        </div>
    );
};

/**
 * PageLoading - Full page loading state
 */
export const PageLoading: React.FC<{ label?: string }> = ({ label }) => (
    <Loading variant="fullPage" size="large" label={label} />
);

/**
 * TableLoading - Loading state for tables
 */
export const TableLoading: React.FC = () => (
    <Loading variant="inline" size="medium" label="Loading data..." />
);

/**
 * ButtonLoading - Small loading for buttons
 */
export const ButtonLoading: React.FC = () => (
    <Spinner size="tiny" />
);

export default Loading;
