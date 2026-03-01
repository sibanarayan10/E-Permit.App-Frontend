/**
 * Renew Permit Modal - Dialog for renewing a permit with new dates
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
    Textarea,
    Spinner,
    Text,
    tokens,
    makeStyles,
} from '@fluentui/react-components';
import { CalendarAdd24Regular } from '@fluentui/react-icons';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalM,
    },
});

interface RenewPermitModalProps {
    open: boolean;
    onClose: () => void;
    permit: {
        _id: string;
        permitNumber: string;
        initiator?: {
            periodOfWork?: {
                from?: { date?: string; hrs?: string };
                to?: { date?: string; hrs?: string };
            };
        };
    } | null;
    onSubmit: (data: {
        from: { date: string; hrs: string };
        to: { date: string; hrs: string };
        renewalReason: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

export const RenewPermitModal: React.FC<RenewPermitModalProps> = ({
    open,
    onClose,
    permit,
    onSubmit,
    isLoading = false,
}) => {
    const styles = useStyles();
    const [fromDate, setFromDate] = useState('');
    const [fromTime, setFromTime] = useState('');
    const [toDate, setToDate] = useState('');
    const [toTime, setToTime] = useState('');
    const [renewalReason, setRenewalReason] = useState('');

    // Auto-fill start date from permit (supports both General and Height permits)
    // For 2nd+ renewals, use the last approved period's end date as new start date
    useEffect(() => {
        // Check if there's an existing approved renewal period to use
        // If pendingRenewal was approved previously, the periodOfWork should be updated
        // So we always use the current periodOfWork as the base

        // Try General Permit structure first
        const formatLocalDate = (dateStr: string) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Try General Permit structure first
        if (permit?.initiator?.periodOfWork?.to) {
            // For renewal, start from where the last period ended
            const periodTo = permit.initiator.periodOfWork.to;
            if (periodTo.date) {
                setFromDate(formatLocalDate(periodTo.date));
            }
            if (periodTo.hrs) {
                setFromTime(periodTo.hrs);
            }
        } else if (permit?.initiator?.periodOfWork?.from) {
            // Fallback to from date if to date is not set
            const periodFrom = permit.initiator.periodOfWork.from;
            if (periodFrom.date) {
                setFromDate(formatLocalDate(periodFrom.date));
            }
            if (periodFrom.hrs) {
                setFromTime(periodFrom.hrs);
            }
        }
        // Try Height Permit structure
        else if ((permit as any)?.schedule?.finishTimeDate) {
            // For renewal, start from where the last period ended
            const finishTimeDate = (permit as any).schedule.finishTimeDate;
            if (finishTimeDate.date) {
                setFromDate(formatLocalDate(finishTimeDate.date));
            }
            if (finishTimeDate.hrs) {
                setFromTime(finishTimeDate.hrs);
            }
        } else if ((permit as any)?.schedule?.startTimeDate) {
            // Fallback to start time if finish time is not set
            const startTimeDate = (permit as any).schedule.startTimeDate;
            if (startTimeDate.date) {
                setFromDate(formatLocalDate(startTimeDate.date));
            }
            if (startTimeDate.hrs) {
                setFromTime(startTimeDate.hrs);
            }
        }
        // Keep end date/time empty for user to fill
        setToDate('');
        setToTime('');
        setRenewalReason('');
    }, [permit]);

    const handleSubmit = async () => {
        if (!fromDate || !toDate) {
            toast.error('Please select both dates');
            return;
        }
        if (!fromTime || !toTime) {
            toast.error('Please enter start and end time');
            return;
        }
        if (!renewalReason.trim()) {
            toast.error('Please enter a reason for renewal');
            return;
        }

        // Validate that end date/time is after start
        const fromDateTime = new Date(`${fromDate}T${fromTime}`);
        const toDateTime = new Date(`${toDate}T${toTime}`);

        if (toDateTime <= fromDateTime) {
            toast.error('End date/time must be after start date/time');
            return;
        }

        await onSubmit({
            from: { date: fromDate, hrs: fromTime },
            to: { date: toDate, hrs: toTime },
            renewalReason: renewalReason.trim(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface style={{ maxWidth: '500px' }}>
                <DialogBody>
                    <DialogTitle>
                        <CalendarAdd24Regular style={{ marginRight: '8px' }} />
                        Request Period Renewal – {permit?.permitNumber}
                    </DialogTitle>
                    <DialogContent>
                        <Text block style={{ marginBottom: '16px' }}>
                            Request a new validity period for this permit. Your request will be sent to the Executor for review, then to the Issuer for final approval. The permit period will only be updated after Issuer approval.
                        </Text>

                        <div className={styles.formGrid}>
                            <Field label="Start Date" required>
                                <Input
                                    type="date"
                                    value={fromDate}
                                    onChange={(_, data) => setFromDate(data.value)}
                                />
                            </Field>
                            <Field label="Start Time" required>
                                <Input
                                    type="time"
                                    value={fromTime}
                                    onChange={(_, data) => setFromTime(data.value)}
                                />
                            </Field>
                            <Field label="End Date" required>
                                <Input
                                    type="date"
                                    value={toDate}
                                    onChange={(_, data) => setToDate(data.value)}
                                    min={fromDate}
                                />
                            </Field>
                            <Field label="End Time" required>
                                <Input
                                    type="time"
                                    value={toTime}
                                    onChange={(_, data) => setToTime(data.value)}
                                />
                            </Field>
                        </div>

                        <Field label="Reason for Renewal" required>
                            <Textarea
                                value={renewalReason}
                                onChange={(_, data) => setRenewalReason(data.value)}
                                placeholder="Explain why this permit needs to be renewed..."
                                rows={3}
                            />
                        </Field>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            icon={isLoading ? <Spinner size="tiny" /> : undefined}
                        >
                            {isLoading ? 'Submitting...' : 'Submit Renewal Request'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default RenewPermitModal;
