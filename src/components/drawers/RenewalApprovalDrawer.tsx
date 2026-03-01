/**
 * Renewal Approval Drawer - Shows renewal details for Executor to review and approve
 * Used when a permit renewal is forwarded to executor for approval
 */

import React, { useState } from 'react';
import {
    makeStyles,
    tokens,
    Drawer,
    DrawerHeader,
    DrawerHeaderTitle,
    DrawerBody,
    Button,
    Text,
    Field,
    Textarea,
    MessageBar,
    MessageBarBody,
    Spinner,
} from '@fluentui/react-components';
import {
    Dismiss24Regular,
    Checkmark24Regular,
    Dismiss24Filled,
    CalendarLtr24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
    header: {
        background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
        color: 'white',
    },
    body: {
        padding: tokens.spacingHorizontalL,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '20px',
    },
    infoSection: {
        marginBottom: tokens.spacingVerticalL,
        padding: tokens.spacingHorizontalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground2,
    },
    infoTitle: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalM,
        color: tokens.colorBrandForeground1,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: `${tokens.spacingVerticalS} 0`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    label: {
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground2,
    },
    value: {
        color: tokens.colorNeutralForeground1,
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalM,
        paddingTop: tokens.spacingVerticalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground1,
        marginTop: 'auto',
        flexShrink: 0,
    },
});

interface RenewalApprovalDrawerProps {
    open: boolean;
    onClose: () => void;
    permit: {
        _id: string;
        permitNumber: string;
        permitStatus?: string;
        initiator?: {
            periodOfWork?: {
                from?: { date?: string; hrs?: string };
                to?: { date?: string; hrs?: string };
            };
        };
        // New pending renewal structure
        pendingRenewal?: {
            requestedBy?: { name?: string; _id?: string };
            requestedAt?: string;
            from?: { date?: string; hrs?: string };
            to?: { date?: string; hrs?: string };
            renewalReason?: string;
            isActive?: boolean;
            executorApproval?: {
                approved?: boolean;
                approvedBy?: { name?: string };
                approvedAt?: string;
                comments?: string;
            };
        };
        // Legacy renewal field (fallback)
        renewal?: {
            requestedBy?: { name?: string };
            requestedAt?: string;
            from?: { date?: string; hrs?: string };
            to?: { date?: string; hrs?: string };
            renewalReason?: string;
        };
    } | null;
    onApprove: (comments?: string) => Promise<void>;
    onReject: (reason: string) => Promise<void>;
    isLoading?: boolean;
}

export const RenewalApprovalDrawer: React.FC<RenewalApprovalDrawerProps> = ({
    open,
    onClose,
    permit,
    onApprove,
    onReject,
    isLoading = false,
}) => {
    const styles = useStyles();
    const [comments, setComments] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Get renewal data from pendingRenewal (new) or renewal (legacy fallback)
    const renewalData = permit?.pendingRenewal?.isActive
        ? permit.pendingRenewal
        : permit?.renewal;

    // Determine the current approval stage
    const isExecutorStage = permit?.permitStatus === 'Pending_Execution';
    const isIssuerStage = permit?.permitStatus === 'Pending_Issuer';
    const stageName = isExecutorStage ? 'Executor' : isIssuerStage ? 'Issuer Final' : '';

    // Get original period (supports both General and Height permits)
    const permitAny = permit as any;
    const originalPeriod = {
        from: permit?.initiator?.periodOfWork?.from || permitAny?.schedule?.startTimeDate,
        to: permit?.initiator?.periodOfWork?.to || permitAny?.schedule?.finishTimeDate,
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB');
    };

    const formatTime = (time?: string) => {
        return time || 'N/A';
    };

    const handleApprove = async () => {
        await onApprove(comments.trim() || undefined);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            return;
        }
        await onReject(rejectReason.trim());
    };

    return (
        <Drawer
            open={open}
            onOpenChange={(_, d) => !d.open && onClose()}
            position="end"
            size="medium"
        >
            <DrawerHeader className={styles.header}>
                <DrawerHeaderTitle
                    action={
                        <Button
                            appearance="subtle"
                            icon={<Dismiss24Regular />}
                            onClick={onClose}
                            style={{ color: 'white' }}
                        />
                    }
                >
                    {stageName} Renewal Approval - {permit?.permitNumber}
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody className={styles.body}>
                <div className={styles.content}>
                    {/* Stage Indicator */}
                    {isIssuerStage && permit?.pendingRenewal?.executorApproval?.approved && (
                        <MessageBar intent="success" style={{ marginBottom: '16px' }}>
                            <MessageBarBody>
                                ✓ Executor approved this renewal on{' '}
                                {permit.pendingRenewal.executorApproval.approvedAt
                                    ? new Date(permit.pendingRenewal.executorApproval.approvedAt).toLocaleString('en-GB')
                                    : 'N/A'}
                                {permit.pendingRenewal.executorApproval.comments && (
                                    <> - "{permit.pendingRenewal.executorApproval.comments}"</>
                                )}
                            </MessageBarBody>
                        </MessageBar>
                    )}

                    {/* Renewal Request Information */}
                    <div className={styles.infoSection}>
                        <Text className={styles.infoTitle}>
                            <CalendarLtr24Regular />
                            Renewal Request Details
                        </Text>

                        <div className={styles.infoRow}>
                            <Text className={styles.label}>Requested By:</Text>
                            <Text className={styles.value}>
                                {renewalData?.requestedBy?.name || 'N/A'}
                            </Text>
                        </div>

                        <div className={styles.infoRow}>
                            <Text className={styles.label}>Requested On:</Text>
                            <Text className={styles.value}>
                                {renewalData?.requestedAt
                                    ? new Date(renewalData.requestedAt).toLocaleString('en-GB')
                                    : 'N/A'}
                            </Text>
                        </div>

                        <div className={styles.infoRow} style={{ borderBottom: 'none' }}>
                            <Text className={styles.label}>Renewal Reason:</Text>
                        </div>
                        <Text
                            block
                            style={{
                                padding: tokens.spacingVerticalS,
                                backgroundColor: tokens.colorNeutralBackground1,
                                borderRadius: tokens.borderRadiusSmall,
                                marginTop: tokens.spacingVerticalS,
                            }}
                        >
                            {renewalData?.renewalReason || 'No reason provided'}
                        </Text>
                    </div>

                    {/* Original Period */}
                    <div className={styles.infoSection}>
                        <Text className={styles.infoTitle}>Original Work Period</Text>

                        <div className={styles.infoRow}>
                            <Text className={styles.label}>From Date:</Text>
                            <Text className={styles.value}>
                                {formatDate(originalPeriod.from?.date)}
                            </Text>
                        </div>

                        <div className={styles.infoRow}>
                            <Text className={styles.label}>From Time:</Text>
                            <Text className={styles.value}>
                                {formatTime(originalPeriod.from?.hrs)}
                            </Text>
                        </div>

                        <div className={styles.infoRow}>
                            <Text className={styles.label}>To Date:</Text>
                            <Text className={styles.value}>
                                {formatDate(originalPeriod.to?.date)}
                            </Text>
                        </div>

                        <div className={styles.infoRow} style={{ borderBottom: 'none' }}>
                            <Text className={styles.label}>To Time:</Text>
                            <Text className={styles.value}>
                                {formatTime(originalPeriod.to?.hrs)}
                            </Text>
                        </div>
                    </div>

                    {/* New Requested Period */}
                    <div className={styles.infoSection}>
                        <Text className={styles.infoTitle}>Requested New Work Period</Text>

                        <div className={styles.infoRow}>
                            <Text className={styles.label}>New From Date:</Text>
                            <Text className={styles.value} style={{ fontWeight: tokens.fontWeightSemibold, color: tokens.colorBrandForeground1 }}>
                                {formatDate(renewalData?.from?.date)}
                            </Text>
                        </div>

                        <div className={styles.infoRow}>
                            <Text className={styles.label}>New From Time:</Text>
                            <Text className={styles.value} style={{ fontWeight: tokens.fontWeightSemibold, color: tokens.colorBrandForeground1 }}>
                                {formatTime(renewalData?.from?.hrs)}
                            </Text>
                        </div>

                        <div className={styles.infoRow}>
                            <Text className={styles.label}>New To Date:</Text>
                            <Text className={styles.value} style={{ fontWeight: tokens.fontWeightSemibold, color: tokens.colorBrandForeground1 }}>
                                {formatDate(renewalData?.to?.date)}
                            </Text>
                        </div>

                        <div className={styles.infoRow} style={{ borderBottom: 'none' }}>
                            <Text className={styles.label}>New To Time:</Text>
                            <Text className={styles.value} style={{ fontWeight: tokens.fontWeightSemibold, color: tokens.colorBrandForeground1 }}>
                                {formatTime(renewalData?.to?.hrs)}
                            </Text>
                        </div>
                    </div>

                    {/* Comments/Reject Reason Section */}
                    {!showRejectForm ? (
                        <Field label={isIssuerStage ? "Issuer Comments (Optional)" : "Executor Comments (Optional)"}>
                            <Textarea
                                value={comments}
                                onChange={(_, d) => setComments(d.value)}
                                placeholder="Add any comments about this renewal request..."
                                rows={3}
                            />
                        </Field>
                    ) : (
                        <div>
                            <MessageBar intent="error" style={{ marginBottom: '12px' }}>
                                <MessageBarBody>
                                    Please provide a reason for rejecting this renewal request.
                                </MessageBarBody>
                            </MessageBar>
                            <Field label="Rejection Reason *" required>
                                <Textarea
                                    value={rejectReason}
                                    onChange={(_, d) => setRejectReason(d.value)}
                                    placeholder="Explain why you are rejecting this renewal..."
                                    rows={4}
                                />
                            </Field>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    {!showRejectForm ? (
                        <>
                            <Button
                                appearance="secondary"
                                icon={<Dismiss24Filled />}
                                onClick={() => setShowRejectForm(true)}
                                disabled={isLoading}
                            >
                                Reject
                            </Button>
                            <Button
                                appearance="primary"
                                icon={<Checkmark24Regular />}
                                onClick={handleApprove}
                                disabled={isLoading}
                            >
                                {isLoading && <Spinner size="tiny" style={{ marginRight: '8px' }} />}
                                {isLoading ? 'Approving...' : isIssuerStage ? 'Approve & Update Period' : 'Approve & Forward to Issuer'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                appearance="secondary"
                                onClick={() => {
                                    setShowRejectForm(false);
                                    setRejectReason('');
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleReject}
                                disabled={isLoading || !rejectReason.trim()}
                            >
                                {isLoading && <Spinner size="tiny" style={{ marginRight: '8px' }} />}
                                {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </Button>
                        </>
                    )}
                </div>
            </DrawerBody>
        </Drawer>
    );
};

export default RenewalApprovalDrawer;
