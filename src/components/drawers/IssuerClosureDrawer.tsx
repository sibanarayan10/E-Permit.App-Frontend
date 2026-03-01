/**
 * Issuer Closure Drawer - Offcanvas drawer for issuer to finalize permit closure
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
    Checkbox,
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
    LockClosed24Regular,
    Checkmark24Regular,
    Add24Regular,
    Delete24Regular,
    Shield24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    header: {
        background: `linear-gradient(135deg, #6b21a8 0%, #9333ea 100%)`,
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
        color: '#6b21a8',
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
        backgroundColor: '#f3e8ff',
        border: `1px solid #9333ea`,
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
    isolationTable: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: tokens.fontSizeBase200,
    },
    tableHeader: {
        backgroundColor: tokens.colorNeutralBackground3,
        padding: tokens.spacingHorizontalS,
        textAlign: 'left',
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    tableCell: {
        padding: tokens.spacingHorizontalXS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        verticalAlign: 'middle',
    },
    certificationBox: {
        backgroundColor: '#f0fdf4',
        border: `2px solid #22c55e`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
    },
});

interface ChecklistState {
    multiplePermitsIssued: string;
    allWorkCompleted: string;
    isolationCertificatesReturned: string;
    testRunRequired: string;
    equipmentMovedToSafe: string;
    emergencyProceduresInPlace: string;
}

interface IsolationDetail {
    sn: number;
    equipmentNameNo: string;
    isolationType: string;
    formNo: string;
    nameOfAuthorizedIsolator: string;
    dateAndTime: string;
}

interface IssuerClosureDrawerProps {
    open: boolean;
    onClose: () => void;
    permitNumber: string;
    onConfirm: (data: any) => Promise<void>;
    isLoading?: boolean;
}

export const IssuerClosureDrawer: React.FC<IssuerClosureDrawerProps> = ({
    open,
    onClose,
    permitNumber,
    onConfirm,
    isLoading = false,
}) => {
    const styles = useStyles();
    const { user } = useUser();

    const [checklist, setChecklist] = useState<ChecklistState>({
        multiplePermitsIssued: '',
        allWorkCompleted: '',
        isolationCertificatesReturned: '',
        testRunRequired: '',
        equipmentMovedToSafe: '',
        emergencyProceduresInPlace: '',
    });

    const [isolationRemovalDetails, setIsolationRemovalDetails] = useState<IsolationDetail[]>([
        { sn: 1, equipmentNameNo: '', isolationType: '', formNo: '', nameOfAuthorizedIsolator: '', dateAndTime: '' }
    ]);

    const [finalCertification, setFinalCertification] = useState({
        allIsolationsRestored: false,
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
                multiplePermitsIssued: '',
                allWorkCompleted: '',
                isolationCertificatesReturned: '',
                testRunRequired: '',
                equipmentMovedToSafe: '',
                emergencyProceduresInPlace: '',
            });
            setIsolationRemovalDetails([
                { sn: 1, equipmentNameNo: '', isolationType: '', formNo: '', nameOfAuthorizedIsolator: '', dateAndTime: '' }
            ]);
            setFinalCertification({ allIsolationsRestored: false });
            setFormData({
                name: user?.name || '',
                date: getLocalDateString(),
                time: getLocalTimeString(),
            });
        }
    }, [open, user]);

    const handleChecklistChange = (field: keyof ChecklistState, value: string) => {
        setChecklist((prev) => ({ ...prev, [field]: value }));
    };

    const handleIsolationDetailChange = (index: number, field: keyof IsolationDetail, value: string | number) => {
        setIsolationRemovalDetails((prev) => {
            const updated = [...prev];
            const current = updated[index];
            if (!current) return prev;
            updated[index] = {
                sn: current.sn,
                equipmentNameNo: current.equipmentNameNo,
                isolationType: current.isolationType,
                formNo: current.formNo,
                nameOfAuthorizedIsolator: current.nameOfAuthorizedIsolator,
                dateAndTime: current.dateAndTime,
                [field]: value,
            } as IsolationDetail;
            return updated;
        });
    };

    const addIsolationRow = () => {
        setIsolationRemovalDetails((prev) => [
            ...prev,
            { sn: prev.length + 1, equipmentNameNo: '', isolationType: '', formNo: '', nameOfAuthorizedIsolator: '', dateAndTime: '' }
        ]);
    };

    const removeIsolationRow = (index: number) => {
        if (isolationRemovalDetails.length > 1) {
            setIsolationRemovalDetails((prev) => {
                const updated = prev.filter((_, i) => i !== index);
                return updated.map((item, i) => ({ ...item, sn: i + 1 }));
            });
        }
    };

    // Calculate progress
    const requiredFields = Object.keys(checklist) as (keyof ChecklistState)[];
    const completedCount = requiredFields.filter(f => checklist[f]).length;
    const totalCount = requiredFields.length;

    const handleSubmit = async () => {
        for (const field of requiredFields) {
            if (!checklist[field]) {
                toast.error('Please complete all checklist items');
                return;
            }
        }

        if (!finalCertification.allIsolationsRestored) {
            toast.error('Please confirm that all isolations have been restored');
            return;
        }

        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        const filteredIsolationDetails = isolationRemovalDetails.filter(
            (row) => row.equipmentNameNo || row.isolationType || row.formNo
        );

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
            isolationRemovalDetails: filteredIsolationDetails,
            finalCertification,
            issuerDetails: {
                name: formData.name,
                signature: getSignatureValue(),
                date: formData.date,
                time: formData.time,
            },
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
        { key: 'multiplePermitsIssued' as const, label: 'Are there multiple permits issued for the same work area/equipment to different agencies?', icon: '📋' },
        { key: 'allWorkCompleted' as const, label: 'If so, have all relevant work completed and permits ready for closure?', icon: '✓' },
        { key: 'isolationCertificatesReturned' as const, label: 'Are all Isolation certificates returned after de-isolation?', icon: '📄' },
        { key: 'testRunRequired' as const, label: 'Any test run required?', icon: '⚡' },
        { key: 'equipmentMovedToSafe' as const, label: 'People and equipment used for work has been moved to safe place?', icon: '👷' },
        { key: 'emergencyProceduresInPlace' as const, label: 'Are emergency procedures in place to handle any incidents during testing?', icon: '🚨' },
    ];

    const isolationTypes = [
        { value: 'Ele', label: 'Electrical' },
        { value: 'Mech', label: 'Mechanical' },
        { value: 'Hyd', label: 'Hydraulic' },
        { value: 'Pneum', label: 'Pneumatic' },
        { value: 'Gas', label: 'Gas Isolation' },
    ];

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
                    <LockClosed24Regular style={{ marginRight: '8px' }} />
                    Final Closure – {permitNumber}
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody className={styles.body}>
                {/* Progress Indicator */}
                <div className={styles.progressIndicator}>
                    <Badge appearance="filled" color={completedCount === totalCount ? 'success' : 'warning'}>
                        {completedCount}/{totalCount}
                    </Badge>
                    <Text size={200}>Checklist items completed</Text>
                    {!finalCertification.allIsolationsRestored && (
                        <Badge appearance="outline" color="danger" style={{ marginLeft: 'auto' }}>
                            Certification pending
                        </Badge>
                    )}
                </div>

                {/* Section 15.6 - Issuer Checklist */}
                <MessageBar intent="info">
                    <MessageBarBody>
                        <strong>Section 15.6 - Permit to Work Closure Checklist</strong>
                        <br />
                        (By Issuer)
                    </MessageBarBody>
                </MessageBar>

                {/* Checklist Section */}
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <Checkmark24Regular />
                        Issuer Closure Checklist
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
                </div>

                <Divider />

                {/* Section E - Isolation Removal Details */}
                <MessageBar intent="warning">
                    <MessageBarBody>
                        <strong>Section E - Details of Isolation Removal for Restoration of Energy</strong>
                    </MessageBarBody>
                </MessageBar>

                <div className={styles.section}>
                    <table className={styles.isolationTable}>
                        <thead>
                            <tr>
                                <th className={styles.tableHeader} style={{ width: '5%' }}>SN</th>
                                <th className={styles.tableHeader} style={{ width: '22%' }}>Equipment Name/No</th>
                                <th className={styles.tableHeader} style={{ width: '18%' }}>Isolation Type</th>
                                <th className={styles.tableHeader} style={{ width: '12%' }}>Form No</th>
                                <th className={styles.tableHeader} style={{ width: '20%' }}>Auth. Isolator</th>
                                <th className={styles.tableHeader} style={{ width: '18%' }}>Date & Time</th>
                                <th className={styles.tableHeader} style={{ width: '5%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isolationRemovalDetails.map((row, index) => (
                                <tr key={index}>
                                    <td className={styles.tableCell} style={{ textAlign: 'center' }}>{row.sn}</td>
                                    <td className={styles.tableCell}>
                                        <Input
                                            size="small"
                                            value={row.equipmentNameNo}
                                            onChange={(_, data) => handleIsolationDetailChange(index, 'equipmentNameNo', data.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </td>
                                    <td className={styles.tableCell}>
                                        <Dropdown
                                            size="small"
                                            placeholder="Select"
                                            value={isolationTypes.find(t => t.value === row.isolationType)?.label || ''}
                                            onOptionSelect={(_, data) => handleIsolationDetailChange(index, 'isolationType', data.optionValue as string)}
                                            style={{ minWidth: '100px' }}
                                        >
                                            {isolationTypes.map((type) => (
                                                <Option key={type.value} value={type.value}>
                                                    {type.label}
                                                </Option>
                                            ))}
                                        </Dropdown>
                                    </td>
                                    <td className={styles.tableCell}>
                                        <Input
                                            size="small"
                                            value={row.formNo}
                                            onChange={(_, data) => handleIsolationDetailChange(index, 'formNo', data.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </td>
                                    <td className={styles.tableCell}>
                                        <Input
                                            size="small"
                                            value={row.nameOfAuthorizedIsolator}
                                            onChange={(_, data) => handleIsolationDetailChange(index, 'nameOfAuthorizedIsolator', data.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </td>
                                    <td className={styles.tableCell}>
                                        <Input
                                            size="small"
                                            type="datetime-local"
                                            value={row.dateAndTime}
                                            onChange={(_, data) => handleIsolationDetailChange(index, 'dateAndTime', data.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </td>
                                    <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                                        <Button
                                            appearance="subtle"
                                            size="small"
                                            icon={<Delete24Regular />}
                                            onClick={() => removeIsolationRow(index)}
                                            disabled={isolationRemovalDetails.length === 1}
                                            style={{ color: isolationRemovalDetails.length > 1 ? '#d13438' : undefined }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <Button
                        appearance="outline"
                        size="small"
                        icon={<Add24Regular />}
                        onClick={addIsolationRow}
                        style={{ marginTop: '12px' }}
                    >
                        Add Row
                    </Button>
                </div>

                <Divider />

                {/* Section F - Final Certification */}
                <div className={styles.certificationBox}>
                    <Text className={styles.sectionTitle} style={{ color: '#15803d' }}>
                        <Shield24Regular />
                        Section F - Final Certification
                    </Text>

                    <Text block style={{ marginBottom: '16px' }}>
                        All isolation made as per Section C are now restored. Equipment are ready to start.
                    </Text>

                    <Checkbox
                        label={<strong>I confirm that all isolations have been restored and equipment is ready to start</strong>}
                        checked={finalCertification.allIsolationsRestored}
                        onChange={(_, data) => setFinalCertification({ allIsolationsRestored: data.checked === true })}
                        size="large"
                    />
                </div>

                {/* Signatory Details */}
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        Issuer Details
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
                    disabled={isLoading || completedCount < totalCount || !finalCertification.allIsolationsRestored}
                    icon={isLoading ? <Spinner size="tiny" /> : <LockClosed24Regular />}
                    style={{ backgroundColor: '#6b21a8' }}
                >
                    {isLoading ? 'Closing Permit...' : 'Close Permit'}
                </Button>
            </div>
        </Drawer>
    );
};

export default IssuerClosureDrawer;
