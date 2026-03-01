/**
 * Issuer Closure Modal - Dialog for issuer to finalize permit closure
 * Matches original JSX functionality
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
    Checkbox,
    Spinner,
    Text,
    Image,
    tokens,
    makeStyles,
    MessageBar,
    MessageBarBody,
} from '@fluentui/react-components';
import { ClipboardTask24Regular, Add24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useUser } from '@/context';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    checklistTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: tokens.spacingVerticalM,
    },
    tableHeader: {
        backgroundColor: tokens.colorNeutralBackground3,
        padding: tokens.spacingHorizontalS,
        textAlign: 'left',
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
    },
    tableCell: {
        padding: tokens.spacingHorizontalS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        fontSize: tokens.fontSizeBase200,
    },
    radioCell: {
        textAlign: 'center',
        width: '60px',
    },
    isolationTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: tokens.spacingVerticalM,
        fontSize: tokens.fontSizeBase200,
    },
    smallInput: {
        minWidth: '80px',
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

interface IssuerClosureModalProps {
    open: boolean;
    onClose: () => void;
    permitNumber: string;
    user?: {
        name?: string;
        signature?: { url?: string } | string;
    } | null;
    onConfirm: (data: any) => Promise<void>;
    isLoading?: boolean;
}

export const IssuerClosureModal: React.FC<IssuerClosureModalProps> = ({
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

    // Reset form when modal closes
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
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
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

    const handleSubmit = async () => {
        // Validate all checklist items are filled
        const requiredFields = Object.keys(checklist) as (keyof ChecklistState)[];
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

        // Filter out empty isolation rows
        const filteredIsolationDetails = isolationRemovalDetails.filter(
            (row) => row.equipmentNameNo || row.isolationType || row.formNo
        );

        // Get signature URL properly
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
        if (typeof sig === 'string') {
            return sig;
        }
        if (sig && typeof sig === 'object' && 'url' in sig) {
            return (sig as { url?: string }).url || null;
        }
        return null;
    };

    const checklistItems = [
        { key: 'multiplePermitsIssued' as const, label: 'Are there multiple permits issued for the same work area / equipment to different agencies?' },
        { key: 'allWorkCompleted' as const, label: 'If so have all relevant work completed and permits ready for closure?' },
        { key: 'isolationCertificatesReturned' as const, label: 'Are all Isolation certificates returned after de-isolation?' },
        { key: 'testRunRequired' as const, label: 'Any test run required?' },
        { key: 'equipmentMovedToSafe' as const, label: 'People and equipment used for work has been moved to safe place?' },
        { key: 'emergencyProceduresInPlace' as const, label: 'Are emergency procedures in place to handle any incidents during testing?' },
    ];

    const isolationTypes = [
        { value: 'Ele', label: 'Electrical' },
        { value: 'Mech', label: 'Mechanical' },
        { value: 'Hyd', label: 'Hydraulic' },
        { value: 'Pneum', label: 'Pneumatic' },
        { value: 'Gas', label: 'Gas Isolation' },
    ];

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface style={{ maxWidth: '750px', width: '95vw' }}>
                <DialogBody>
                    <DialogTitle>
                        <ClipboardTask24Regular style={{ marginRight: '8px' }} />
                        Final Closure – {permitNumber}
                    </DialogTitle>
                    <DialogContent style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        {/* Section 15.6 - Issuer Checklist */}
                        <MessageBar intent="info" style={{ marginBottom: '16px' }}>
                            <MessageBarBody>
                                <strong>Section 15.6 - Permit to Work Closure Checklist</strong>
                                <br />
                                (By Issuer)
                            </MessageBarBody>
                        </MessageBar>

                        {/* Checklist Table */}
                        <table className={styles.checklistTable}>
                            <thead>
                                <tr>
                                    <th className={styles.tableHeader} style={{ width: '70%' }}>Checklist Item</th>
                                    <th className={`${styles.tableHeader} ${styles.radioCell}`}>YES</th>
                                    <th className={`${styles.tableHeader} ${styles.radioCell}`}>NO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checklistItems.map((item) => (
                                    <tr key={item.key}>
                                        <td className={styles.tableCell}>{item.label}</td>
                                        <td className={`${styles.tableCell} ${styles.radioCell}`}>
                                            <input
                                                type="radio"
                                                name={item.key}
                                                checked={checklist[item.key] === 'YES'}
                                                onChange={() => handleChecklistChange(item.key, 'YES')}
                                            />
                                        </td>
                                        <td className={`${styles.tableCell} ${styles.radioCell}`}>
                                            <input
                                                type="radio"
                                                name={item.key}
                                                checked={checklist[item.key] === 'NO'}
                                                onChange={() => handleChecklistChange(item.key, 'NO')}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Section E - Isolation Removal Details */}
                        <MessageBar intent="warning" style={{ marginBottom: '16px' }}>
                            <MessageBarBody>
                                <strong>Section E - Details of Isolation Removal for Restoration of Energy</strong>
                            </MessageBarBody>
                        </MessageBar>

                        <table className={styles.isolationTable}>
                            <thead>
                                <tr>
                                    <th className={styles.tableHeader} style={{ width: '5%' }}>SN</th>
                                    <th className={styles.tableHeader} style={{ width: '20%' }}>Equipment Name/No</th>
                                    <th className={styles.tableHeader} style={{ width: '15%' }}>Isolation Type</th>
                                    <th className={styles.tableHeader} style={{ width: '12%' }}>Form No</th>
                                    <th className={styles.tableHeader} style={{ width: '20%' }}>Auth. Isolator</th>
                                    <th className={styles.tableHeader} style={{ width: '20%' }}>Date & Time</th>
                                    <th className={styles.tableHeader} style={{ width: '8%' }}></th>
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
                                            />
                                        </td>
                                        <td className={styles.tableCell}>
                                            <Dropdown
                                                size="small"
                                                placeholder="Select"
                                                value={isolationTypes.find(t => t.value === row.isolationType)?.label || ''}
                                                onOptionSelect={(_, data) => handleIsolationDetailChange(index, 'isolationType', data.optionValue as string)}
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
                                            />
                                        </td>
                                        <td className={styles.tableCell}>
                                            <Input
                                                size="small"
                                                value={row.nameOfAuthorizedIsolator}
                                                onChange={(_, data) => handleIsolationDetailChange(index, 'nameOfAuthorizedIsolator', data.value)}
                                            />
                                        </td>
                                        <td className={styles.tableCell}>
                                            <Input
                                                size="small"
                                                type="datetime-local"
                                                value={row.dateAndTime}
                                                onChange={(_, data) => handleIsolationDetailChange(index, 'dateAndTime', data.value)}
                                            />
                                        </td>
                                        <td className={styles.tableCell} style={{ textAlign: 'center' }}>
                                            <Button
                                                appearance="subtle"
                                                size="small"
                                                icon={<Delete24Regular />}
                                                onClick={() => removeIsolationRow(index)}
                                                disabled={isolationRemovalDetails.length === 1}
                                                style={{ color: 'red' }}
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
                            style={{ marginBottom: '16px' }}
                        >
                            Add Row
                        </Button>

                        {/* Section F - Final Certification */}
                        <MessageBar intent="success" style={{ marginBottom: '16px' }}>
                            <MessageBarBody>
                                <strong>Section F - Final Certification</strong>
                                <br />
                                All isolation made as per Section C are now restored. Equipment are ready to start.
                            </MessageBarBody>
                        </MessageBar>

                        <Checkbox
                            label={<strong>I confirm that all isolations have been restored and equipment is ready to start</strong>}
                            checked={finalCertification.allIsolationsRestored}
                            onChange={(_, data) => setFinalCertification({ allIsolationsRestored: data.checked === true })}
                            style={{ marginBottom: '16px' }}
                        />

                        <Field label="Name of Issuer" required style={{ marginBottom: '12px' }}>
                            <Input value={formData.name} readOnly />
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
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

                        <Field label="Signature">
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
                                    <Text size={200}>No signature uploaded</Text>
                                </div>
                            )}
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
                            style={{ backgroundColor: '#107c10' }}
                        >
                            {isLoading ? 'Closing...' : 'Close Permit'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default IssuerClosureModal;
