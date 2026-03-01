/**
 * Cancel Permit Modal - Dialog for cancelling a permit
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
    Dropdown,
    Option,
    Textarea,
    Spinner,
    MessageBar,
    MessageBarBody,
} from '@fluentui/react-components';
import { Warning24Regular } from '@fluentui/react-icons';
import toast from 'react-hot-toast';

interface CancelPermitModalProps {
    open: boolean;
    onClose: () => void;
    permit: {
        _id: string;
        permitNumber: string;
    } | null;
    onSubmit: (data: { reason: string; comments: string }) => Promise<void>;
    isLoading?: boolean;
}

const cancellationReasons = [
    { value: 'CHANGE_OF_SCOPE', label: 'Change of Scope' },
    { value: 'VIOLATION_OF_PERMIT_CONDITIONS', label: 'Violation of Permit Conditions & Safety Requirements' },
    { value: 'PLANT_EMERGENCY', label: 'Plant Emergency' },
];

export const CancelPermitModal: React.FC<CancelPermitModalProps> = ({
    open,
    onClose,
    permit,
    onSubmit,
    isLoading = false,
}) => {
    const [reason, setReason] = useState('');
    const [comments, setComments] = useState('');

    // Reset when modal closes
    useEffect(() => {
        if (!open) {
            setReason('');
            setComments('');
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!reason) {
            toast.error('Please select a cancellation reason');
            return;
        }
        if (!comments.trim()) {
            toast.error('Please provide cancellation comments');
            return;
        }

        await onSubmit({
            reason,
            comments: comments.trim(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle>
                        <Warning24Regular style={{ marginRight: '8px', color: '#d13438' }} />
                        Cancel Permit – {permit?.permitNumber}
                    </DialogTitle>
                    <DialogContent>
                        <MessageBar intent="warning" style={{ marginBottom: '16px' }}>
                            <MessageBarBody>
                                This action will permanently cancel the permit and cannot be undone.
                            </MessageBarBody>
                        </MessageBar>

                        <Field label="Reason for Cancellation" required style={{ marginBottom: '16px' }}>
                            <Dropdown
                                placeholder="Select reason"
                                value={reason}
                                onOptionSelect={(_, data) => setReason(data.optionValue as string)}
                            >
                                {cancellationReasons.map((r) => (
                                    <Option key={r.value} value={r.value}>
                                        {r.label}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>

                        <Field label="Cancellation Comments" required>
                            <Textarea
                                value={comments}
                                onChange={(_, data) => setComments(data.value)}
                                placeholder="Enter detailed reason for cancelling the permit..."
                                rows={4}
                            />
                        </Field>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={onClose} disabled={isLoading}>
                            Close
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            style={{ backgroundColor: '#d13438' }}
                            icon={isLoading ? <Spinner size="tiny" /> : undefined}
                        >
                            {isLoading ? 'Cancelling...' : 'Cancel Permit'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default CancelPermitModal;
