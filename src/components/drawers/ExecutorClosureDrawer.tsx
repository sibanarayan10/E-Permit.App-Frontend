/**
 * Executor Closure Drawer - Offcanvas drawer for executor to complete handover checklist
 * Improved UI with checkboxes and modern styling
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
    Dropdown,
    Option,
    Spinner,
    Text,
    Image,
    tokens,
    makeStyles,
    MessageBar,
    MessageBarBody,
    Badge,
    Divider,
} from '@fluentui/react-components';
import {
    Dismiss24Regular,
    ClipboardTask24Regular,
    Checkmark24Regular,
    ArrowForward24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import { getAvailableIssuers } from '@/services';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    header: {
        background: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, ${tokens.colorBrandBackground2} 100%)`,
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
    checklistItem: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: tokens.spacingVerticalS,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalS,
        backgroundColor: tokens.colorNeutralBackground2,
        transition: 'all 0.2s ease',
        border: `1px solid transparent`,
        '&:hover': {
            backgroundColor: tokens.colorNeutralBackground3,
        },
    },
    checklistItemSelected: {
        backgroundColor: tokens.colorBrandBackground2,
        border: `1px solid ${tokens.colorBrandStroke1}`,
    },
    checklistLabel: {
        flex: 1,
        fontSize: tokens.fontSizeBase300,
        lineHeight: tokens.lineHeightBase300,
        cursor: 'pointer',
    },
    optionButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        marginLeft: tokens.spacingHorizontalM,
    },
    optionButton: {
        minWidth: '60px',
        fontWeight: tokens.fontWeightSemibold,
    },
    selectedYes: {
        backgroundColor: '#107c10 !important',
        color: 'white !important',
        border: 'none !important',
    },
    selectedNo: {
        backgroundColor: '#d13438 !important',
        color: 'white !important',
        border: 'none !important',
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
    progressIndicator: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalS,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalM,
    },
});

interface ChecklistState {
    isWorkCompleted: string;
    equipmentRemoved: string;
    personnelMovedToSafe: string;
    locksRemoved: string;
    workAreaCleaned: string;
    testRunRequired: string;
    testingProcedureAgreed: string;
}

interface ExecutorClosureDrawerProps {
    open: boolean;
    onClose: () => void;
    permitNumber: string;
    onConfirm: (data: any) => Promise<void>;
    isLoading?: boolean;
}

interface Issuer {
    _id: string;
    name: string;
    email: string;
}

export const ExecutorClosureDrawer: React.FC<ExecutorClosureDrawerProps> = ({
    open,
    onClose,
    permitNumber,
    onConfirm,
    isLoading = false,
}) => {
    const styles = useStyles();
    const { user } = useUser();
    const [issuers, setIssuers] = useState<Issuer[]>([]);
    const [selectedIssuer, setSelectedIssuer] = useState<string>('');
    const [loadingIssuers, setLoadingIssuers] = useState(false);

    const [checklist, setChecklist] = useState<ChecklistState>({
        isWorkCompleted: '',
        equipmentRemoved: '',
        personnelMovedToSafe: '',
        locksRemoved: '',
        workAreaCleaned: '',
        testRunRequired: '',
        testingProcedureAgreed: '',
    });

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

    // Load available issuers
    useEffect(() => {
        const loadIssuers = async () => {
            if (open) {
                try {
                    setLoadingIssuers(true);
                    const response = await getAvailableIssuers();
                    setIssuers(response.data || []);
                } catch (error) {
                    console.error('Failed to load issuers:', error);
                } finally {
                    setLoadingIssuers(false);
                }
            }
        };
        loadIssuers();
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

    // Reset form when drawer closes
    useEffect(() => {
        if (!open) {
            setChecklist({
                isWorkCompleted: '',
                equipmentRemoved: '',
                personnelMovedToSafe: '',
                locksRemoved: '',
                workAreaCleaned: '',
                testRunRequired: '',
                testingProcedureAgreed: '',
            });
            setFormData({
                name: user?.name || '',
                date: getLocalDateString(),
                time: getLocalTimeString(),
            });
            setSelectedIssuer('');
        }
    }, [open, user]);

    const handleChecklistChange = (field: keyof ChecklistState, value: string) => {
        setChecklist((prev) => ({ ...prev, [field]: value }));
    };

    // Calculate progress
    const requiredFields: (keyof ChecklistState)[] = [
        'isWorkCompleted',
        'equipmentRemoved',
        'personnelMovedToSafe',
        'locksRemoved',
        'workAreaCleaned',
        'testRunRequired',
    ];
    const completedCount = requiredFields.filter(f => checklist[f]).length;
    const totalCount = requiredFields.length;

    const handleSubmit = async () => {
        for (const field of requiredFields) {
            if (!checklist[field]) {
                toast.error('Please complete all checklist items');
                return;
            }
        }

        if (checklist.testRunRequired === 'YES' && !checklist.testingProcedureAgreed) {
            toast.error('Please indicate if testing procedure has been agreed');
            return;
        }

        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        if (!selectedIssuer) {
            toast.error('Please select an Issuer for final closure approval');
            return;
        }

        const getSignatureValue = (): string => {
            const sig = user?.signature;
            if (typeof sig === 'string') return sig;
            if (sig && typeof sig === 'object' && 'url' in sig) {
                return (sig as { url?: string }).url || '';
            }
            return user?.name || formData.name || '';
        };

        await onConfirm({
            checklist,
            executingAgencyRepDetails: {
                name: formData.name,
                signature: getSignatureValue(),
                date: formData.date,
                time: formData.time,
            },
            assignedIssuerId: selectedIssuer,
        });
    };

    const getSignatureUrl = (): string | null => {
        const sig = user?.signature;
        if (typeof sig === 'string') return sig;
        if (sig && typeof sig === 'object' && 'url' in sig) {
            return (sig as { url?: string }).url || null;
        }
        return null;
    };

    const checklistItems = [
        { key: 'isWorkCompleted' as const, label: 'Is work completed?', icon: '✓' },
        { key: 'equipmentRemoved' as const, label: 'Has all equipment, tools and consumables been removed from site?', icon: '🔧' },
        { key: 'personnelMovedToSafe' as const, label: 'Has all personnel left the work area and moved to a safe distance?', icon: '👷' },
        { key: 'locksRemoved' as const, label: 'Has any mechanical/electrical locks that may have been provided been removed?', icon: '🔒' },
        { key: 'workAreaCleaned' as const, label: 'Is the work area cleaned?', icon: '🧹' },
        { key: 'testRunRequired' as const, label: 'Any test run required?', icon: '⚡' },
    ];

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
                    <ClipboardTask24Regular style={{ marginRight: '8px' }} />
                    Closure Approval – {permitNumber}
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody className={styles.body}>
                {/* Progress Indicator */}
                <div className={styles.progressIndicator}>
                    <Badge appearance="filled" color={completedCount === totalCount ? 'success' : 'warning'}>
                        {completedCount}/{totalCount}
                    </Badge>
                    <Text size={200}>Checklist items completed</Text>
                </div>

                {/* Section Header */}
                <MessageBar intent="warning">
                    <MessageBarBody>
                        <strong>Section 15.5 - Permit to Work Closure / Handover Checklist</strong>
                        <br />
                        (By Executing Agency)
                    </MessageBarBody>
                </MessageBar>

                {/* Checklist Section */}
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <Checkmark24Regular />
                        Handover Checklist
                    </Text>

                    {checklistItems.map((item) => (
                        <div
                            key={item.key}
                            className={`${styles.checklistItem} ${checklist[item.key] ? styles.checklistItemSelected : ''}`}
                        >
                            <Text className={styles.checklistLabel}>
                                <span style={{ marginRight: '8px' }}>{item.icon}</span>
                                {item.label}
                            </Text>
                            <div className={styles.optionButtons}>
                                <Button
                                    size="small"
                                    appearance={checklist[item.key] === 'YES' ? 'primary' : 'outline'}
                                    className={`${styles.optionButton} ${checklist[item.key] === 'YES' ? styles.selectedYes : ''}`}
                                    onClick={() => handleChecklistChange(item.key, 'YES')}
                                >
                                    YES
                                </Button>
                                <Button
                                    size="small"
                                    appearance={checklist[item.key] === 'NO' ? 'primary' : 'outline'}
                                    className={`${styles.optionButton} ${checklist[item.key] === 'NO' ? styles.selectedNo : ''}`}
                                    onClick={() => handleChecklistChange(item.key, 'NO')}
                                >
                                    NO
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Conditional testing procedure question */}
                    {checklist.testRunRequired === 'YES' && (
                        <div
                            className={`${styles.checklistItem} ${checklist.testingProcedureAgreed ? styles.checklistItemSelected : ''}`}
                            style={{ marginLeft: '24px', borderLeft: `3px solid ${tokens.colorBrandBackground}` }}
                        >
                            <Text className={styles.checklistLabel}>
                                <span style={{ marginRight: '8px' }}>📋</span>
                                If Yes, a procedure has been agreed for testing?
                            </Text>
                            <div className={styles.optionButtons}>
                                <Button
                                    size="small"
                                    appearance={checklist.testingProcedureAgreed === 'YES' ? 'primary' : 'outline'}
                                    className={`${styles.optionButton} ${checklist.testingProcedureAgreed === 'YES' ? styles.selectedYes : ''}`}
                                    onClick={() => handleChecklistChange('testingProcedureAgreed', 'YES')}
                                >
                                    YES
                                </Button>
                                <Button
                                    size="small"
                                    appearance={checklist.testingProcedureAgreed === 'NO' ? 'primary' : 'outline'}
                                    className={`${styles.optionButton} ${checklist.testingProcedureAgreed === 'NO' ? styles.selectedNo : ''}`}
                                    onClick={() => handleChecklistChange('testingProcedureAgreed', 'NO')}
                                >
                                    NO
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* Forward to Issuer Section */}
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <ArrowForward24Regular />
                        Forward to Issuer
                    </Text>

                    <Field label="Select Issuer for Final Closure" required>
                        <Dropdown
                            placeholder={loadingIssuers ? 'Loading issuers...' : 'Select Issuer'}
                            value={issuers.find(i => i._id === selectedIssuer)?.name || ''}
                            onOptionSelect={(_, data) => setSelectedIssuer(data.optionValue as string)}
                            disabled={loadingIssuers}
                            style={{ width: '100%' }}
                        >
                            {issuers.map((issuer) => (
                                <Option key={issuer._id} value={issuer._id} text={`${issuer.name} (${issuer.email})`}>
                                    {issuer.name} ({issuer.email})
                                </Option>
                            ))}
                        </Dropdown>
                    </Field>
                </div>

                {/* Signatory Details */}
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        Executing Agency Representative Details
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
                                    No signature uploaded
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
                    disabled={isLoading || completedCount < totalCount || !selectedIssuer}
                    icon={isLoading ? <Spinner size="tiny" /> : <ArrowForward24Regular />}
                    style={{ backgroundColor: '#107c10' }}
                >
                    {isLoading ? 'Submitting...' : 'Approve & Forward to Issuer'}
                </Button>
            </div>
        </Drawer>
    );
};

export default ExecutorClosureDrawer;
