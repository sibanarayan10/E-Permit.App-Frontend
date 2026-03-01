/**
 * Executor Selection Modal - Dialog for selecting an executor
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
    shorthands,
    Input,
} from '@fluentui/react-components';
import { PersonAvailable24Regular, Checkmark24Filled, Search24Regular } from '@fluentui/react-icons';
import { getAvailableExecutors } from '@/services';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    userList: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        maxHeight: '45vh', // Use viewport height to adapt to keyboard opening on mobile
        overflowY: 'auto',
        paddingRight: '4px',
    },
    userCard: {
        ...shorthands.padding(tokens.spacingHorizontalM),
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        backgroundColor: tokens.colorNeutralBackground1,
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
        transition: 'background-color 0.2s, border-color 0.2s',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
            ...shorthands.borderColor(tokens.colorBrandStroke1),
        },
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
    userId?: string;
    location?: string;
    subLocation?: string;
    department?: string;
}

interface ExecutorSelectionModalProps {
    open: boolean;
    onClose: () => void;
    permitNumber: string;
    onSelectExecutor: (executor: User) => void;
}

export const ExecutorSelectionModal: React.FC<ExecutorSelectionModalProps> = ({
    open,
    onClose,
    permitNumber,
    onSelectExecutor,
}) => {
    const styles = useStyles();
    const [executors, setExecutors] = useState<User[]>([]);
    const [filteredExecutors, setFilteredExecutors] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExecutor, setSelectedExecutor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchExecutors();
            setSelectedExecutor(null);
            setSearchQuery('');
        }
    }, [open]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredExecutors(executors);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = executors.filter((user) =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                (user.userId && user.userId.toLowerCase().includes(query)) ||
                (user.subLocation && user.subLocation.toLowerCase().includes(query))
            );
            setFilteredExecutors(filtered);
        }
    }, [searchQuery, executors]);

    const fetchExecutors = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAvailableExecutors();
            if (response.data && response.data.length > 0) {
                setExecutors(response.data);
            } else {
                setError('No executors available. Please contact your administrator.');
                setExecutors([]);
            }
        } catch {
            setError('Failed to load executors. Please try again.');
            toast.error('Failed to load available executors');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!selectedExecutor) {
            toast.error('Please select an executor');
            return;
        }
        onSelectExecutor(selectedExecutor);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(_, data) => {
                // Prevent closing on backdrop click to avoid issues with mobile keyboard resize
                if (data.type !== 'backdropClick' && !data.open) {
                    onClose();
                }
            }}
        >
            <DialogSurface style={{ maxWidth: '500px' }}>
                <DialogBody>
                    <DialogTitle>
                        <PersonAvailable24Regular style={{ marginRight: '8px' }} />
                        Assign Executor
                    </DialogTitle>
                    <DialogContent>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '32px' }}>
                                <Spinner size="medium" />
                                <Text block style={{ marginTop: '16px' }}>
                                    Loading available executors...
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
                                    Select an Executor to review and approve this permit:
                                </Text>

                                <div style={{ marginBottom: '16px' }}>
                                    <Input
                                        contentAfter={<Search24Regular />}
                                        placeholder="Search by name, ID or location..."
                                        value={searchQuery}
                                        onChange={(_, data) => setSearchQuery(data.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div className={styles.userList}>
                                    {filteredExecutors.map((executor) => (
                                        <Card
                                            key={executor._id}
                                            className={styles.userCard}
                                            style={selectedExecutor?._id === executor._id ? {
                                                backgroundColor: tokens.colorBrandBackground2,
                                                border: `1px solid ${tokens.colorBrandStroke1}`,
                                            } : undefined}
                                            onClick={() => setSelectedExecutor(executor)}
                                        >
                                            <div className={styles.userInfo}>
                                                <Text weight="semibold">{executor.name}</Text>
                                                <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                                                    {executor.userId ? `ID: ${executor.userId}` : ''}
                                                    {executor.subLocation ? ` | ${executor.subLocation}` : ''}
                                                </Text>
                                            </div>
                                            {selectedExecutor?._id === executor._id && (
                                                <Checkmark24Filled className={styles.checkIcon} />
                                            )}
                                        </Card>
                                    ))}

                                    {filteredExecutors.length === 0 && searchQuery && (
                                        <div style={{ textAlign: 'center', padding: '20px', color: tokens.colorNeutralForeground3 }}>
                                            No executors found matching "{searchQuery}"
                                        </div>
                                    )}
                                </div>

                                {executors.length === 0 && !error && (
                                    <MessageBar intent="warning">
                                        <MessageBarBody>No executors are currently available.</MessageBarBody>
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
                            disabled={!selectedExecutor || loading || !!error}
                        >
                            Assign Executor
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default ExecutorSelectionModal;
