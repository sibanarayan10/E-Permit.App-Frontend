/**
 * Height Permit Executor Closure Drawer - Simple approval with just info display and signature
 */

import React, { useState, useEffect } from 'react';
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    Button,
    Field,
    Input,
    Spinner,
    Text,
    Image,
    tokens,
    makeStyles,
    MessageBar,
    MessageBarBody,
} from '@fluentui/react-components';
import {
    Dismiss24Regular,
    CheckmarkCircle24Regular,
    ArrowForward24Regular,
    CalendarLtr24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';

const useStyles = makeStyles({
    header: {
        background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
        color: 'white',
        padding: tokens.spacingVerticalL,
    },
    body: {
        padding: tokens.spacingVerticalL,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
    },
    section: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase400,
        marginBottom: tokens.spacingVerticalM,
        color: tokens.colorBrandForeground1,
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
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingHorizontalM,
    },
    signatureBox: {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalM,
        backgroundColor: tokens.colorNeutralBackground2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground1,
    },
});

interface HeightPermitExecutorClosureDrawerProps {
    open: boolean;
    onClose: () => void;
    permit: {
        _id: string;
        permitNumber: string;
        jobDescription?: string;
        jobLocation?: string;
        schedule?: {
            startTimeDate?: { date?: string; hrs?: string };
            finishTimeDate?: { date?: string; hrs?: string };
        };
        personOrContractorResponsible?: {
            name?: string;
            nameOfDepartmentalRepresentative?: string;
        };
    } | null;
    onConfirm: (data: any) => Promise<void>;
    isLoading?: boolean;
}

export const HeightPermitExecutorClosureDrawer: React.FC<HeightPermitExecutorClosureDrawerProps> = ({
    open,
    onClose,
    permit,
    onConfirm,
    isLoading = false,
}) => {
    const styles = useStyles();
    const { user } = useUser();

    const [formData, setFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    });

    // Auto-fill user details
    useEffect(() => {
        if (user && open) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || '',
            }));
        }
    }, [user, open]);

    // Reset form when drawer closes
    useEffect(() => {
        if (!open) {
            setFormData({
                name: user?.name || '',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            });
        }
    }, [open, user]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB');
    };

    const getSignatureUrl = (): string | null => {
        const sig = user?.signature;
        if (typeof sig === 'string') return sig;
        if (sig && typeof sig === 'object' && 'url' in sig) {
            return (sig as { url?: string }).url || null;
        }
        return null;
    };

    const getSignatureValue = (): string => {
        const sig = user?.signature;
        if (typeof sig === 'string') return sig;
        if (sig && typeof sig === 'object' && 'url' in sig) {
            return (sig as { url?: string }).url || '';
        }
        return user?.name || formData.name || '';
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            return;
        }

        await onConfirm({
            executorDetails: {
                name: formData.name,
                signature: getSignatureValue(),
                date: formData.date,
                time: formData.time,
            },
        });
    };

    return (
        <Drawer
            open={open}
            onOpenChange={(_, d) => !d.open && onClose()}
            position="end"
            size="large"
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
                    <CheckmarkCircle24Regular style={{ marginRight: '8px' }} />
                    Height Permit Closure Approval – {permit?.permitNumber}
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody className={styles.body}>
                {/* Info Message */}
                <MessageBar intent="info">
                    <MessageBarBody>
                        <strong>Executor Closure Approval</strong>
                        <br />
                        Review the permit details and confirm your approval to forward to Issuer for final closure.
                    </MessageBarBody>
                </MessageBar>

                {/* Permit Information */}
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <CalendarLtr24Regular />
                        Permit Information
                    </Text>

                    <div className={styles.infoRow}>
                        <Text className={styles.label}>Permit Number:</Text>
                        <Text className={styles.value}>{permit?.permitNumber || 'N/A'}</Text>
                    </div>

                    <div className={styles.infoRow}>
                        <Text className={styles.label}>Job Description:</Text>
                        <Text className={styles.value}>{permit?.jobDescription || 'N/A'}</Text>
                    </div>

                    <div className={styles.infoRow}>
                        <Text className={styles.label}>Job Location:</Text>
                        <Text className={styles.value}>{permit?.jobLocation || 'N/A'}</Text>
                    </div>

                    <div className={styles.infoRow}>
                        <Text className={styles.label}>Person Responsible:</Text>
                        <Text className={styles.value}>
                            {permit?.personOrContractorResponsible?.name || 'N/A'}
                        </Text>
                    </div>

                    <div className={styles.infoRow}>
                        <Text className={styles.label}>Start Date:</Text>
                        <Text className={styles.value}>
                            {formatDate(permit?.schedule?.startTimeDate?.date)} at {permit?.schedule?.startTimeDate?.hrs || 'N/A'}
                        </Text>
                    </div>

                    <div className={styles.infoRow} style={{ borderBottom: 'none' }}>
                        <Text className={styles.label}>Finish Date:</Text>
                        <Text className={styles.value}>
                            {formatDate(permit?.schedule?.finishTimeDate?.date)} at {permit?.schedule?.finishTimeDate?.hrs || 'N/A'}
                        </Text>
                    </div>
                </div>

                {/* Executor Signatory Details */}
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        Executor Approval Details
                    </Text>

                    <Field label="Name" required style={{ marginBottom: '12px' }}>
                        <Input value={formData.name} readOnly />
                    </Field>

                    <div className={styles.formGrid}>
                        <Field label="Date">
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(_, data) => setFormData({ ...formData, date: data.value })}
                            />
                        </Field>
                        <Field label="Time">
                            <Input
                                type="time"
                                value={formData.time}
                                onChange={(_, data) => setFormData({ ...formData, time: data.value })}
                            />
                        </Field>
                    </div>

                    <Field label="Signature" style={{ marginTop: '12px' }}>
                        <div className={styles.signatureBox}>
                            {getSignatureUrl() ? (
                                <Image
                                    src={getSignatureUrl() ?? ''}
                                    alt="Signature"
                                    style={{ maxHeight: '60px', maxWidth: '100%' }}
                                />
                            ) : (
                                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                    {user?.name || 'Signature'}
                                </Text>
                            )}
                        </div>
                    </Field>
                </div>
            </DrawerBody>

            {/* Footer */}
            <div className={styles.footer}>
                <Button appearance="secondary" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button
                    appearance="primary"
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.name.trim()}
                    icon={isLoading ? <Spinner size="tiny" /> : <ArrowForward24Regular />}
                    style={{ backgroundColor: '#107c10' }}
                >
                    {isLoading ? 'Approving...' : 'Approve & Forward to Issuer'}
                </Button>
            </div>
        </Drawer>
    );
};

export default HeightPermitExecutorClosureDrawer;
