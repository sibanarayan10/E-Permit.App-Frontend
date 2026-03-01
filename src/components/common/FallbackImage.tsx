/**
 * FallbackImage Component - Image with fallback support
 */

import React, { useState, useCallback } from 'react';
import { makeStyles, tokens, Avatar } from '@fluentui/react-components';
import { Person24Regular } from '@fluentui/react-icons';

const useStyles = makeStyles({
    fallbackContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.colorNeutralBackground3,
        color: tokens.colorNeutralForeground3,
        fontWeight: tokens.fontWeightSemibold,
        borderRadius: tokens.borderRadiusMedium,
    },
    image: {
        objectFit: 'cover',
    },
});

interface FallbackImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    fallbackText?: string;
    width?: number | string;
    height?: number | string;
    role?: 'initiator' | 'executor' | 'issuer' | 'admin' | 'default';
    showAvatar?: boolean;
    avatarSize?: 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 72 | 96 | 120 | 128;
}

// Role-based default avatars
const roleColors: Record<string, string> = {
    initiator: tokens.colorPaletteBlueBackground2,
    executor: tokens.colorPaletteGreenBackground2,
    issuer: tokens.colorPalettePurpleBackground2,
    admin: tokens.colorPaletteRedBackground2,
    default: tokens.colorNeutralBackground3,
};

export const FallbackImage: React.FC<FallbackImageProps> = ({
    src,
    alt,
    className,
    fallbackText,
    width = 40,
    height = 40,
    role = 'default',
    showAvatar = false,
    avatarSize = 40,
}) => {
    const styles = useStyles();
    const [hasError, setHasError] = useState(false);
    const [_isLoading, setIsLoading] = useState(true);

    const handleError = useCallback(() => {
        setHasError(true);
        setIsLoading(false);
    }, []);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    // Get initials from alt text
    const getInitials = (text: string): string => {
        if (fallbackText) return fallbackText;
        const words = text.trim().split(' ');
        if (words.length >= 2) {
            return `${words[0]?.[0] ?? ''}${words[1]?.[0] ?? ''}`.toUpperCase();
        }
        return text.substring(0, 2).toUpperCase();
    };

    // Show avatar mode
    if (showAvatar) {
        if (src && !hasError) {
            return (
                <Avatar
                    image={{ src, onError: handleError }}
                    name={alt}
                    size={avatarSize}
                    className={className}
                />
            );
        }
        return (
            <Avatar
                name={alt}
                size={avatarSize}
                className={className}
                color="colorful"
            />
        );
    }

    // If no src or error, show fallback
    if (!src || hasError) {
        return (
            <div
                className={`${styles.fallbackContainer} ${className ?? ''}`}
                style={{
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: typeof height === 'number' ? `${height}px` : height,
                    backgroundColor: roleColors[role] ?? roleColors.default,
                }}
                role="img"
                aria-label={alt}
            >
                {fallbackText ? (
                    getInitials(alt)
                ) : (
                    <Person24Regular />
                )}
            </div>
        );
    }

    // Show image
    return (
        <img
            src={src}
            alt={alt}
            className={`${styles.image} ${className ?? ''}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
            }}
            onError={handleError}
            onLoad={handleLoad}
        />
    );
};

export default FallbackImage;
