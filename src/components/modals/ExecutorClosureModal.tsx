/**
 * Executor Closure Modal - Dialog for executor to complete handover checklist
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
    Spinner,
    Text,
    Image,
    tokens,
    makeStyles,
    MessageBar,
    MessageBarBody,
} from '@fluentui/react-components';
import { ClipboardTask24Regular } from '@fluentui/react-icons';
import { useUser } from '@/context';
import { getAvailableIssuers } from '@/services';
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

interface ExecutorClosureModalProps {
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

interface Issuer {
    _id: string;
    name: string;
    email: string;
}

export const ExecutorClosureModal: React.FC<ExecutorClosureModalProps> = ({
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

    const [formData, setFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
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

    // Reset form when modal closes
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
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            });
            setSelectedIssuer('');
        }
    }, [open, user]);

    const handleChecklistChange = (field: keyof ChecklistState, value: string) => {
        setChecklist((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validate all checklist items are filled
        const requiredFields: (keyof ChecklistState)[] = [
            'isWorkCompleted',
            'equipmentRemoved',
            'personnelMovedToSafe',
            'locksRemoved',
            'workAreaCleaned',
            'testRunRequired',
        ];

        for (const field of requiredFields) {
            if (!checklist[field]) {
                toast.error('Please complete all checklist items');
                return;
            }
        }

        // If test run is required, testing procedure must be answered
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
        if (typeof sig === 'string') {
            return sig;
        }
        if (sig && typeof sig === 'object' && 'url' in sig) {
            return (sig as { url?: string }).url || null;
        }
        return null;
    };

    const checklistItems = [
        { key: 'isWorkCompleted' as const, label: 'Is work completed?' },
        { key: 'equipmentRemoved' as const, label: 'Has all equipment, tools and consumables removed from site?' },
        { key: 'personnelMovedToSafe' as const, label: 'Has all personnel left the work area and moved to a safe distance?' },
        { key: 'locksRemoved' as const, label: 'Has any mechanical / electrical locks that may have been provided been removed?' },
        { key: 'workAreaCleaned' as const, label: 'Is the work area cleaned?' },
        { key: 'testRunRequired' as const, label: 'Any test run required?' },
    ];

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface style={{ maxWidth: '650px', width: '95vw' }}>
                <DialogBody>
                    <DialogTitle>
                        <ClipboardTask24Regular style={{ marginRight: '8px' }} />
                        Closure Approval – {permitNumber}
                    </DialogTitle>
                    <DialogContent style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <MessageBar intent="warning" style={{ marginBottom: '16px' }}>
                            <MessageBarBody>
                                <strong>Section 15.5 - Permit to Work Closure / Handover Checklist</strong>
                                <br />
                                (By Executing Agency)
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
                                {/* Conditional row for testing procedure */}
                                {checklist.testRunRequired === 'YES' && (
                                    <tr>
                                        <td className={styles.tableCell} style={{ paddingLeft: '24px' }}>
                                            If Yes, a procedure has been agreed for testing?
                                        </td>
                                        <td className={`${styles.tableCell} ${styles.radioCell}`}>
                                            <input
                                                type="radio"
                                                name="testingProcedureAgreed"
                                                checked={checklist.testingProcedureAgreed === 'YES'}
                                                onChange={() => handleChecklistChange('testingProcedureAgreed', 'YES')}
                                            />
                                        </td>
                                        <td className={`${styles.tableCell} ${styles.radioCell}`}>
                                            <input
                                                type="radio"
                                                name="testingProcedureAgreed"
                                                checked={checklist.testingProcedureAgreed === 'NO'}
                                                onChange={() => handleChecklistChange('testingProcedureAgreed', 'NO')}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Select Issuer for next step */}
                        <Field label="Forward to Issuer" required style={{ marginBottom: '16px' }}>
                            <Dropdown
                                placeholder={loadingIssuers ? 'Loading issuers...' : 'Select Issuer'}
                                value={issuers.find(i => i._id === selectedIssuer)?.name || ''}
                                onOptionSelect={(_, data) => setSelectedIssuer(data.optionValue as string)}
                                disabled={loadingIssuers}
                            >
                                {issuers.map((issuer) => (
                                    <Option key={issuer._id} value={issuer._id} text={`${issuer.name} (${issuer.email})`}>
                                        {issuer.name} ({issuer.email})
                                    </Option>
                                ))}
                            </Dropdown>
                            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                Select the Issuer who will perform final closure approval
                            </Text>
                        </Field>

                        <Field label="Name of Executing Agency Rep" required style={{ marginBottom: '12px' }}>
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
                        >
                            {isLoading ? 'Submitting...' : 'Approve & Forward to Issuer'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default ExecutorClosureModal;
