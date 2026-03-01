/**
 * Profile Picture Upload Component - Upload and manage profile pictures
 */

import React, { useState, useRef } from 'react';
import {
    Button,
    Card,
    Text,
    Spinner,
    tokens,
    makeStyles,
    Avatar,
} from '@fluentui/react-components';
import { Camera24Regular, Delete24Regular } from '@fluentui/react-icons';
import { uploadProfilePicture } from '@/services';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacingVerticalM,
    },
    avatarWrapper: {
        position: 'relative',
    },
    overlay: {
        position: 'absolute',
        bottom: '0',
        right: '0',
        backgroundColor: tokens.colorBrandBackground,
        borderRadius: '50%',
        padding: tokens.spacingHorizontalXS,
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: tokens.colorBrandBackgroundHover,
        },
    },
    actions: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
    },
    hiddenInput: {
        display: 'none',
    },
});

interface ProfilePictureUploadProps {
    currentUrl?: string;
    onUploadSuccess: (url: string) => void;
    onRemove?: () => void;
    size?: number;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
    currentUrl,
    onUploadSuccess,
    onRemove,
    size = 120,
}) => {
    const styles = useStyles();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        try {
            setIsUploading(true);

            // Show preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to server
            const response = await uploadProfilePicture(file);

            if (response.data?.url) {
                onUploadSuccess(response.data.url);
                toast.success('Profile picture updated');
            }
        } catch {
            toast.error('Failed to upload image');
            setPreviewUrl(currentUrl);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(undefined);
        onRemove?.();
    };

    return (
        <Card className={styles.container}>
            <div className={styles.avatarWrapper}>
                <Avatar
                    image={{ src: previewUrl }}
                    size={size as 120}
                    name="Profile"
                />
                {!isUploading && (
                    <div
                        className={styles.overlay}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera24Regular style={{ color: 'white' }} />
                    </div>
                )}
                {isUploading && (
                    <div className={styles.overlay}>
                        <Spinner size="tiny" />
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleFileSelect}
            />

            <div className={styles.actions}>
                <Button
                    appearance="subtle"
                    icon={<Camera24Regular />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {previewUrl ? 'Change' : 'Upload'}
                </Button>
                {previewUrl && (
                    <Button
                        appearance="subtle"
                        icon={<Delete24Regular />}
                        onClick={handleRemove}
                        disabled={isUploading}
                    >
                        Remove
                    </Button>
                )}
            </div>

            <Text size={200}>Max 5MB, JPEG/PNG recommended</Text>
        </Card>
    );
};

export default ProfilePictureUpload;
