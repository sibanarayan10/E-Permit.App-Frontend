/**
 * Initiator Closure Modal - Dialog for initiating permit closure
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
    Field,
    Input,
    Dropdown,
    Option,
    Spinner,
    Text,
    Image,
    tokens,
    MessageBar,
    MessageBarBody,
    Divider,
} from '@fluentui/react-components';
import { ClipboardTask24Regular, ArrowForward24Regular } from '@fluentui/react-icons';
import { useUser } from '@/context';
import { getAvailableExecutors } from '@/services';
import toast from 'react-hot-toast';

interface InitiatorClosureModalProps {
    open: boolean;
    onClose: () => void;
    permitNumber: string;
    user?: {
        name?: string;
        signature?: { url?: string } | string;
    } | null;
    onConfirm: (data: {
        initiatorDetails: {
            name: string;
            signature: string;
            date: string;
            time: string;
        };
        assignedExecutorId?: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

interface Executor {
    _id: string;
    name: string;
    email: string;
}

export const InitiatorClosureModal: React.FC<InitiatorClosureModalProps> = ({
    open,
    onClose,
    permitNumber,
    // user prop is available but we use context instead
    onConfirm,
    isLoading = false,
}) => {
    const { user } = useUser();
    const [executors, setExecutors] = useState<Executor[]>([]);
    const [selectedExecutor, setSelectedExecutor] = useState<string>('');
    const [loadingExecutors, setLoadingExecutors] = useState(false);

    // Helper to get local date string YYYY-MM-DD
    const getLocalDateString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper to get local time string HH:mm
    const getLocalTimeString = () => {
        const d = new Date();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const [formData, setFormData] = useState({
        name: '',
        date: getLocalDateString(),
        time: getLocalTimeString(),
    });

    // Load available executors
    useEffect(() => {
        const loadExecutors = async () => {
            if (open) {
                try {
                    setLoadingExecutors(true);
                    const response = await getAvailableExecutors();
                    setExecutors(response.data || []);
                } catch (error) {
                    console.error('Failed to load executors:', error);
                } finally {
                    setLoadingExecutors(false);
                }
            }
        };
        loadExecutors();
    }, [open]);

    // Auto-fill user details
    useEffect(() => {
        if (user && open) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || '',
            }));
        }
    }, [user, open]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setFormData({
                name: user?.name || '',
                date: getLocalDateString(),
                time: getLocalTimeString(),
            });
            setSelectedExecutor('');
        }
    }, [open, user]);

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }
        if (!formData.date) {
            toast.error('Date is required');
            return;
        }
        if (!formData.time) {
            toast.error('Time is required');
            return;
        }
        if (!selectedExecutor) {
            toast.error('Please select an Executor for closure approval');
            return;
        }

        // Get signature URL properly - could be object with url or string
        const getSignatureValue = (): string => {
            const sig = user?.signature;
            if (typeof sig === 'string') {
                return sig;
            }
            if (sig && typeof sig === 'object' && 'url' in sig) {
                return (sig as { url?: string }).url || '';
            }
            return user?.name || formData.name || '';
        };

        await onConfirm({
            initiatorDetails: {
                name: formData.name,
                signature: getSignatureValue(),
                date: formData.date,
                time: formData.time,
            },
            assignedExecutorId: selectedExecutor,
        });
    };

    const getSignatureUrl = (): string | null => {
        const sig = user?.signature;
        if (typeof sig === 'string') {
            return sig;
        }
        if (sig && typeof sig === 'object' && 'url' in sig) {
            return (sig as { url?: string }).url || null;
        }
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface style={{ maxWidth: '500px' }}>
                <DialogBody>
                    <DialogTitle>
                        <ClipboardTask24Regular style={{ marginRight: '8px' }} />
                        Close Permit – {permitNumber}
                    </DialogTitle>
                    <DialogContent>
                        <MessageBar intent="info" style={{ marginBottom: '16px' }}>
                            <MessageBarBody>
                                <strong>Closure of Work Permit</strong>
                                <br />
                                The job is completed. All men &amp; materials are removed from the site.
                                Safe to restore isolations as stated in Section (C).
                            </MessageBarBody>
                        </MessageBar>

                        <Field label="Name of Initiator" required style={{ marginBottom: '12px' }}>
                            <Input
                                value={formData.name}
                                onChange={(_, data) => setFormData({ ...formData, name: data.value })}
                                placeholder="Enter your name"
                                readOnly
                            />
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <Field label="Date" required>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(_, data) => setFormData({ ...formData, date: data.value })}
                                />
                            </Field>
                            <Field label="Time" required>
                                <Input
                                    type="time"
                                    value={formData.time}
                                    onChange={(_, data) => setFormData({ ...formData, time: data.value })}
                                />
                            </Field>
                        </div>

                        <Field label="Signature" style={{ marginBottom: '16px' }}>
                            {getSignatureUrl() ? (
                                <div style={{
                                    border: `1px solid ${tokens.colorNeutralStroke1}`,
                                    borderRadius: tokens.borderRadiusMedium,
                                    padding: tokens.spacingHorizontalS,
                                    backgroundColor: tokens.colorNeutralBackground2,
                                }}>
                                    <Image
                                        src={getSignatureUrl() ?? ''}
                                        alt="Signature"
                                        style={{ maxHeight: '80px', maxWidth: '100%' }}
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    border: `1px solid ${tokens.colorNeutralStroke1}`,
                                    borderRadius: tokens.borderRadiusMedium,
                                    padding: tokens.spacingHorizontalM,
                                    backgroundColor: tokens.colorNeutralBackground2,
                                    textAlign: 'center',
                                }}>
                                    <Text size={200}>No signature uploaded. Your name will be used.</Text>
                                </div>
                            )}
                        </Field>

                        <Divider style={{ margin: '16px 0' }} />

                        {/* Executor Selection Section */}
                        <Field label="Forward to Executor" required style={{ marginBottom: '12px' }}>
                            <Dropdown
                                placeholder={loadingExecutors ? 'Loading executors...' : 'Select Executor'}
                                value={executors.find(e => e._id === selectedExecutor)?.name || ''}
                                onOptionSelect={(_, data) => setSelectedExecutor(data.optionValue as string)}
                                disabled={loadingExecutors}
                                style={{ width: '100%' }}
                            >
                                {executors.map((executor) => (
                                    <Option key={executor._id} value={executor._id} text={`${executor.name} (${executor.email})`}>
                                        {executor.name} ({executor.email})
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>

                        <Text size={200} style={{ marginTop: '8px', display: 'block', color: tokens.colorNeutralForeground3 }}>
                            This action will forward the closure request to the selected Executor for handover checklist completion.
                        </Text>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit}
                            disabled={isLoading || !selectedExecutor}
                            icon={isLoading ? <Spinner size="tiny" /> : <ArrowForward24Regular />}
                        >
                            {isLoading ? 'Submitting...' : 'Initiate Closure'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default InitiatorClosureModal;

