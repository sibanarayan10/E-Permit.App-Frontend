/**
 * Signature Upload Component - Upload and manage digital signatures
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    Button,
    Card,
    Text,
    Spinner,
    tokens,
    makeStyles,
    Image,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@fluentui/react-components';
import { Signature24Regular, Delete24Regular, ArrowUpload24Regular, Eye24Regular } from '@fluentui/react-icons';
import { uploadSignature, deleteSignature } from '@/services';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        padding: tokens.spacingHorizontalM,
    },
    signatureBox: {
        border: `2px dashed ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalL,
        textAlign: 'center',
        minHeight: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column' as const,
        marginBottom: tokens.spacingVerticalM,
        cursor: 'pointer',
        position: 'relative' as const,
        transitionProperty: 'border-color, background-color',
        transitionDuration: '0.2s',
    },
    signaturePreview: {
        maxHeight: '100px',
        maxWidth: '100%',
        objectFit: 'contain',
    },
    actions: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    hiddenInput: {
        display: 'none',
    },
    previewButton: {
        position: 'absolute' as const,
        top: '4px',
        right: '4px',
    },
});

interface User {
    signature?: {
        url?: string;
        publicId?: string;
    };
}

interface SignatureUploadProps {
    user?: User | null;
    onSignatureUpdate?: (signature: { url?: string; publicId?: string } | null) => void;
}

export const SignatureUpload: React.FC<SignatureUploadProps> = ({
    user,
    onSignatureUpdate,
}) => {
    const styles = useStyles();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Load user's existing signature
    useEffect(() => {
        if (user?.signature?.url) {
            setPreviewUrl(user.signature.url);
        }
    }, [user]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please select a valid image file (JPEG, PNG, WebP, or SVG)');
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
            return;
        }

        setSelectedFile(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file first');
            return;
        }

        setIsUploading(true);

        try {
            const result = await uploadSignature(selectedFile);

            toast.success(result.message || 'Signature uploaded successfully');

            // Reset file selection
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Update preview with the new URL from server
            // API returns signature object with url
            const signatureData = result.data as { signature?: { url?: string; publicId?: string } } | { url?: string };

            if ('signature' in signatureData && signatureData.signature?.url) {
                setPreviewUrl(signatureData.signature.url);
                onSignatureUpdate?.(signatureData.signature);
            } else if ('url' in signatureData && signatureData.url) {
                setPreviewUrl(signatureData.url);
                onSignatureUpdate?.({ url: signatureData.url });
            }
        } catch (error) {
            toast.error((error as Error).message || 'Failed to upload signature');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!previewUrl && !user?.signature?.url) {
            toast.error('No signature to delete');
            return;
        }

        if (!window.confirm('Are you sure you want to delete your signature?')) {
            return;
        }

        setIsDeleting(true);

        try {
            const result = await deleteSignature();
            toast.success(result.message || 'Signature deleted successfully');

            setPreviewUrl(undefined);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            onSignatureUpdate?.(null);
        } catch (error) {
            toast.error((error as Error).message || 'Failed to delete signature');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(user?.signature?.url || undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card className={styles.container}>
            <Text weight="semibold" style={{ marginBottom: tokens.spacingVerticalS, display: 'block' }}>
                <Signature24Regular style={{ marginRight: '8px' }} />
                Digital Signature
            </Text>

            <div
                className={styles.signatureBox}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
                {isUploading ? (
                    <Spinner size="medium" label="Uploading..." />
                ) : previewUrl ? (
                    <>
                        <Image
                            src={previewUrl}
                            alt="Signature"
                            className={styles.signaturePreview}
                        />
                        <Button
                            icon={<Eye24Regular />}
                            appearance="subtle"
                            className={styles.previewButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowPreview(true);
                            }}
                        />
                    </>
                ) : (
                    <>
                        <ArrowUpload24Regular style={{ marginBottom: '8px', fontSize: '32px' }} />
                        <Text>Click to upload signature</Text>
                        <Text size={200}>PNG with transparent background recommended</Text>
                        <Text size={200}>Max size: 2MB</Text>
                    </>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.svg"
                className={styles.hiddenInput}
                onChange={handleFileSelect}
                disabled={isUploading || isDeleting}
            />

            <div className={styles.actions}>
                {selectedFile ? (
                    <>
                        <Button
                            appearance="primary"
                            icon={<ArrowUpload24Regular />}
                            onClick={handleUpload}
                            disabled={isUploading || isDeleting}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Signature'}
                        </Button>
                        <Button
                            appearance="secondary"
                            onClick={handleCancel}
                            disabled={isUploading || isDeleting}
                        >
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            appearance="subtle"
                            icon={<ArrowUpload24Regular />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isDeleting}
                        >
                            {previewUrl ? 'Change Signature' : 'Select File'}
                        </Button>
                        {previewUrl && (
                            <Button
                                appearance="subtle"
                                icon={<Delete24Regular />}
                                onClick={handleDelete}
                                disabled={isUploading || isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={(_, d) => !d.open && setShowPreview(false)}>
                <DialogSurface style={{ maxWidth: '600px' }}>
                    <DialogBody>
                        <DialogTitle>Signature Preview</DialogTitle>
                        <DialogContent style={{ textAlign: 'center', padding: '20px' }}>
                            {previewUrl && (
                                <Image
                                    src={previewUrl}
                                    alt="Signature Preview"
                                    style={{ maxHeight: '300px', maxWidth: '100%' }}
                                />
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setShowPreview(false)}>
                                Close
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </Card>
    );
};

export default SignatureUpload;
