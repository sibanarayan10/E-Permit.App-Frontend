/**
 * Issuer Selection Modal - Dialog for selecting an issuer
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Spinner,
    Text,
    Card,
    tokens,
    makeStyles,
    MessageBar,
    MessageBarBody,
} from '@fluentui/react-components';
import { PersonAvailable24Regular, Checkmark24Filled } from '@fluentui/react-icons';
import { getAvailableIssuers } from '@/services';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    userList: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        maxHeight: '300px',
        overflowY: 'auto',
    },
    userCard: {
        padding: tokens.spacingHorizontalM,
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    checkIcon: {
        color: tokens.colorPaletteGreenForeground1,
    },
});

interface User {
    _id: string;
    name: string;
    email: string;
    department?: string;
}

interface IssuerSelectionModalProps {
    open: boolean;
    onClose: () => void;
    permitNumber: string;
    onSelectIssuer: (issuer: User) => void;
}

export const IssuerSelectionModal: React.FC<IssuerSelectionModalProps> = ({
    open,
    onClose,
    permitNumber,
    onSelectIssuer,
}) => {
    const styles = useStyles();
    const [issuers, setIssuers] = useState<User[]>([]);
    const [selectedIssuer, setSelectedIssuer] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchIssuers();
            setSelectedIssuer(null);
        }
    }, [open]);

    const fetchIssuers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAvailableIssuers();
            if (response.data && response.data.length > 0) {
                setIssuers(response.data);
            } else {
                setError('No issuers available. Please contact your administrator.');
                setIssuers([]);
            }
        } catch {
            setError('Failed to load issuers. Please try again.');
            toast.error('Failed to load available issuers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!selectedIssuer) {
            toast.error('Please select an issuer');
            return;
        }
        onSelectIssuer(selectedIssuer);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface style={{ maxWidth: '500px' }}>
                <DialogBody>
                    <DialogTitle>
                        <PersonAvailable24Regular style={{ marginRight: '8px' }} />
                        Assign Issuer
                    </DialogTitle>
                    <DialogContent>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '32px' }}>
                                <Spinner size="medium" />
                                <Text block style={{ marginTop: '16px' }}>
                                    Loading available issuers...
                                </Text>
                            </div>
                        ) : error ? (
                            <MessageBar intent="error">
                                <MessageBarBody>{error}</MessageBarBody>
                            </MessageBar>
                        ) : (
                            <>
                                <Text block style={{ marginBottom: '8px' }}>
                                    <strong>Permit:</strong> {permitNumber}
                                </Text>
                                <Text block style={{ marginBottom: '16px' }}>
                                    Select an Issuer to approve this permit:
                                </Text>

                                <div className={styles.userList}>
                                    {issuers.map((issuer) => (
                                        <Card
                                            key={issuer._id}
                                            className={styles.userCard}
                                            style={selectedIssuer?._id === issuer._id ? {
                                                backgroundColor: tokens.colorBrandBackground2,
                                                border: `1px solid ${tokens.colorBrandStroke1}`,
                                            } : undefined}
                                            onClick={() => setSelectedIssuer(issuer)}
                                        >
                                            <div className={styles.userInfo}>
                                                <Text weight="semibold">{issuer.name}</Text>
                                                <Text size={200}>{issuer.email}</Text>
                                            </div>
                                            {selectedIssuer?._id === issuer._id && (
                                                <Checkmark24Filled className={styles.checkIcon} />
                                            )}
                                        </Card>
                                    ))}
                                </div>

                                {issuers.length === 0 && !error && (
                                    <MessageBar intent="warning">
                                        <MessageBarBody>No issuers are currently available.</MessageBarBody>
                                    </MessageBar>
                                )}
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit}
                            disabled={!selectedIssuer || loading || !!error}
                        >
                            Assign Issuer
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default IssuerSelectionModal;
