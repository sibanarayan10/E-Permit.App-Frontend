/**
 * Data Request Approval Page
 * Displays approval form for executor/issuer after OTP verification
 * Reuses the same form fields as ExecutionApprovalForm and IssuerApprovalForm
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
    Spinner,
    Input,
    Textarea,
    Checkbox,
    Field,
    Badge,
    MessageBar,
    MessageBarBody,
    Image,
    Radio,
} from '@fluentui/react-components';
import {
    Shield24Regular,
    Person24Regular,
    Calendar24Regular,
    Checkmark24Regular,
    Add24Regular,
    Delete24Regular,
    DocumentCheckmark24Regular,
    Send24Regular,
    Save24Regular,
} from '@fluentui/react-icons';
import { submitExecutorApproval, submitIssuerApproval, getAvailableIssuers } from '@/services';
import sailLogo from '@/assets/Sail_Logo.jpeg';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    page: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: tokens.spacingHorizontalXL,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalM,
        },
    },
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        '@media (max-width: 768px)': {
            maxWidth: '100%',
        },
    },
    header: {
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
        color: 'white',
        padding: tokens.spacingHorizontalXL,
        borderRadius: `${tokens.borderRadiusXLarge} ${tokens.borderRadiusXLarge} 0 0`,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalM,
            borderRadius: 0,
        },
    },
    logo: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(255,255,255,0.3)',
        '@media (max-width: 768px)': {
            width: '40px',
            height: '40px',
        },
    },
    headerTitle: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightBold,
        color: 'white',
        '@media (max-width: 768px)': {
            fontSize: tokens.fontSizeBase400,
        },
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: tokens.fontSizeBase200,
        '@media (max-width: 768px)': {
            fontSize: tokens.fontSizeBase100,
        },
    },
    card: {
        borderRadius: `0 0 ${tokens.borderRadiusXLarge} ${tokens.borderRadiusXLarge}`,
        padding: tokens.spacingHorizontalXL,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalM,
            borderRadius: 0,
        },
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: tokens.spacingHorizontalL,
        marginBottom: tokens.spacingVerticalXL,
        padding: tokens.spacingHorizontalM,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: tokens.spacingVerticalM,
            padding: tokens.spacingHorizontalS,
        },
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    infoLabel: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    infoValue: {
        fontWeight: tokens.fontWeightSemibold,
    },
    section: {
        marginBottom: tokens.spacingVerticalXL,
        padding: tokens.spacingHorizontalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalS,
            marginBottom: tokens.spacingVerticalL,
        },
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalM,
        color: tokens.colorBrandForeground1,
        '@media (max-width: 768px)': {
            fontSize: tokens.fontSizeBase300,
        },
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: tokens.spacingVerticalS,
        },
    },
    fullWidth: {
        gridColumn: '1 / -1',
    },
    badgeContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalS,
        marginTop: tokens.spacingVerticalS,
    },
    signatureBox: {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalM,
        backgroundColor: tokens.colorNeutralBackground2,
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '@media (max-width: 768px)': {
            minHeight: '60px',
            padding: tokens.spacingHorizontalS,
        },
    },
    checkTable: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        '@media (max-width: 768px)': {
            fontSize: tokens.fontSizeBase100,
        },
    },
    checkTableHeader: {
        backgroundColor: tokens.colorNeutralBackground3,
    },
    checkTableCell: {
        padding: tokens.spacingHorizontalS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalXS,
        },
    },
    checkTableCellCenter: {
        padding: tokens.spacingHorizontalS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        textAlign: 'center' as const,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalXS,
        },
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalM,
        paddingTop: tokens.spacingVerticalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        marginTop: tokens.spacingVerticalL,
        flexWrap: 'wrap',
        '@media (max-width: 768px)': {
            gap: tokens.spacingHorizontalS,
            paddingTop: tokens.spacingVerticalM,
            '& button': {
                flex: '1 1 auto',
                minWidth: '120px',
            },
        },
    },
    issuerSelection: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        marginRight: 'auto',
        '& .fui-Text': {
            color: tokens.colorNeutralForeground1,
            fontSize: tokens.fontSizeBase300,
        },
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
            width: '100%',
            marginRight: 0,
            marginBottom: tokens.spacingVerticalS,
        },
    },
    issuerSelectDropdown: {
        padding: '8px 12px',
        borderRadius: '4px',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        minWidth: '200px',
        backgroundColor: 'white',
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground1,
        fontWeight: tokens.fontWeightSemibold,
        '@media (max-width: 768px)': {
            width: '100%',
            minWidth: 'auto',
        },
        '&:focus': {
            outline: `2px solid ${tokens.colorBrandBackground}`,
            outlineOffset: '1px',
        },
    },
    successContainer: {
        textAlign: 'center',
        padding: tokens.spacingVerticalXXL,
    },
    successIcon: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        marginBottom: tokens.spacingVerticalL,
    },
});

const PRE_EXECUTION_CHECKS = [
    { field: 'jobSpecificSafetyTalk', label: 'Job Specific Safety Talk Conducted' },
    { field: 'sparkGeneratingWork', label: 'Spark Generating Work' },
    { field: 'combustibleMaterialRemoved', label: 'Combustible Material Removed' },
    { field: 'barriersGuardsUsed', label: 'Barriers/Guards Used' },
    { field: 'barricadingRequired', label: 'Barricading Required' },
    { field: 'fireExtinguisherLocationKnown', label: 'Fire Extinguisher Location Known' },
    { field: 'additionalIlluminationRequired', label: 'Additional Illumination Required' },
    { field: 'additionalSupplyPointsRequired', label: 'Additional Supply Points Required' },
    { field: 'gasTestingRequired', label: 'Gas Testing Required' },
    { field: 'periodicGasMonitoringRequired', label: 'Periodic Gas Monitoring Required' },
];

interface LocationState {
    type: 'executor' | 'issuer';
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        signature?: string;
    };
    dataRequestNumber: string;
    permitNumber: string;
    permitType: string;
}

const DataRequestApprovePage: React.FC = () => {
    const styles = useStyles();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Issuer selection state
    const [issuers, setIssuers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
    const [selectedIssuerId, setSelectedIssuerId] = useState<string>('');
    const [loadingIssuers, setLoadingIssuers] = useState(false);

    // Input state for dynamic lists
    const [newPPEItem, setNewPPEItem] = useState('');
    const [newPersonName, setNewPersonName] = useState('');

    // Executor form state
    const [executorFormData, setExecutorFormData] = useState({
        comments: '',
        executingAgency: {
            specialPPEsToolsEquipment: [] as string[],
            numberOfPersonsAttached: '',
            nameOfPersons: [] as string[],
            attachSeparateList: false,
            acceptorName: state?.user?.name || '',
            acceptorSignature: {
                name: state?.user?.name || '',
                signature: state?.user?.signature || '',
            },
            holderName: '',
            holderSignature: { name: '', signature: '' },
            acceptanceDate: new Date(),
            acceptanceTime: new Date().toTimeString().slice(0, 5),
        },
        preExecutionChecks: {
            jobSpecificSafetyTalk: '',
            sparkGeneratingWork: '',
            combustibleMaterialRemoved: '',
            barriersGuardsUsed: '',
            barricadingRequired: '',
            fireExtinguisherLocationKnown: '',
            additionalIlluminationRequired: '',
            additionalSupplyPointsRequired: '',
            gasTestingRequired: '',
            periodicGasMonitoringRequired: '',
            repDetails: {
                name: state?.user?.name || '',
                signature: state?.user?.signature || '',
                date: new Date(),
                time: new Date().toTimeString().slice(0, 5),
            },
        },
    });

    // Issuer form state
    const [issuerFormData, setIssuerFormData] = useState({
        comments: '',
        verifiedAndFoundSatisfactory: false,
        issuerDetails: {
            name: state?.user?.name || '',
            signature: state?.user?.signature || '',
            date: new Date(),
            time: new Date().toTimeString().slice(0, 5),
        },
    });

    // Redirect if no state
    useEffect(() => {
        if (!state || !state.token) {
            toast.error('Invalid session. Please use the link from your email.');
            navigate('/');
        }
    }, [state, navigate]);

    // Fetch available issuers for executor workflow
    useEffect(() => {
        const fetchIssuers = async () => {
            if (state?.type === 'executor') {
                setLoadingIssuers(true);
                try {
                    const response = await getAvailableIssuers();
                    if (response.success && response.data) {
                        setIssuers(response.data);
                    }
                } catch (err) {
                    console.error('Failed to fetch issuers:', err);
                } finally {
                    setLoadingIssuers(false);
                }
            }
        };
        fetchIssuers();
    }, [state?.type]);

    if (!state) {
        return null;
    }

    const isExecutor = state.type === 'executor';

    // PPE handlers
    const handleAddPPE = () => {
        if (newPPEItem.trim()) {
            setExecutorFormData((prev) => ({
                ...prev,
                executingAgency: {
                    ...prev.executingAgency,
                    specialPPEsToolsEquipment: [...prev.executingAgency.specialPPEsToolsEquipment, newPPEItem.trim()],
                },
            }));
            setNewPPEItem('');
        }
    };

    const handleRemovePPE = (index: number) => {
        setExecutorFormData((prev) => ({
            ...prev,
            executingAgency: {
                ...prev.executingAgency,
                specialPPEsToolsEquipment: prev.executingAgency.specialPPEsToolsEquipment.filter((_, i) => i !== index),
            },
        }));
    };

    // Person handlers
    const handleAddPerson = () => {
        if (newPersonName.trim()) {
            setExecutorFormData((prev) => ({
                ...prev,
                executingAgency: {
                    ...prev.executingAgency,
                    nameOfPersons: [...prev.executingAgency.nameOfPersons, newPersonName.trim()],
                },
            }));
            setNewPersonName('');
        }
    };

    const handleRemovePerson = (index: number) => {
        setExecutorFormData((prev) => ({
            ...prev,
            executingAgency: {
                ...prev.executingAgency,
                nameOfPersons: prev.executingAgency.nameOfPersons.filter((_, i) => i !== index),
            },
        }));
    };

    // Pre-execution check handler
    const handleCheckChange = (field: string, value: string) => {
        setExecutorFormData((prev) => ({
            ...prev,
            preExecutionChecks: {
                ...prev.preExecutionChecks,
                [field]: value,
            },
        }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (isExecutor) {
            if (!executorFormData.executingAgency.acceptorName) {
                newErrors.acceptorName = 'Acceptor name is required';
            }

            const unselected = PRE_EXECUTION_CHECKS.filter(
                (check) => !(executorFormData.preExecutionChecks as any)[check.field]
            );
            if (unselected.length > 0) {
                newErrors.preExecutionChecks = `Please select YES, NO, or N/A for all safety checks (${unselected.length} remaining)`;
            }
        } else {
            if (!issuerFormData.verifiedAndFoundSatisfactory) {
                newErrors.verified = 'Please confirm verification';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit handler - accepts optional assignIssuer flag
    const handleSubmit = async (assignIssuer: boolean = false) => {
        if (!validateForm()) {
            toast.error('Please complete all required fields');
            return;
        }

        // If assigning issuer, validate issuer selection
        if (assignIssuer && isExecutor && !selectedIssuerId) {
            toast.error('Please select an issuer to assign');
            return;
        }

        try {
            setLoading(true);

            if (isExecutor) {
                const result = await submitExecutorApproval(id!, state.token, {
                    executingAgency: {
                        ...executorFormData.executingAgency,
                        numberOfPersonsAttached: executorFormData.executingAgency.numberOfPersonsAttached
                            ? parseInt(executorFormData.executingAgency.numberOfPersonsAttached)
                            : undefined,
                    },
                    preExecutionChecks: executorFormData.preExecutionChecks,
                    comments: executorFormData.comments,
                    issuerId: assignIssuer ? selectedIssuerId : undefined,
                });

                if (result.data?.issuerAssigned) {
                    toast.success('Approval submitted and forwarded to issuer successfully!');
                } else {
                    toast.success('Approval saved successfully!');
                }
            } else {
                await submitIssuerApproval(id!, state.token, {
                    issuerDetails: issuerFormData.issuerDetails,
                    comments: issuerFormData.comments,
                    verifiedAndFoundSatisfactory: issuerFormData.verifiedAndFoundSatisfactory,
                });
                toast.success('Data request approved successfully!');
            }

            setSubmitted(true);
        } catch (err: any) {
            toast.error(err.message || 'Failed to submit approval');
        } finally {
            setLoading(false);
        }
    };

    // Render success state
    if (submitted) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <img src={sailLogo} alt="SAIL Logo" className={styles.logo} />
                        <div>
                            <Text className={styles.headerTitle}>E-Permit Data Request</Text>
                        </div>
                    </div>
                    <Card className={styles.card}>
                        <div className={styles.successContainer}>
                            <div className={styles.successIcon}>
                                <DocumentCheckmark24Regular style={{ color: '#fff', fontSize: '40px' }} />
                            </div>
                            <Text as="h2" style={{ fontSize: tokens.fontSizeHero700, fontWeight: tokens.fontWeightBold }}>
                                Data Request Submitted!
                            </Text>
                            <Text style={{ color: tokens.colorNeutralForeground3, marginTop: tokens.spacingVerticalM }}>
                                Your {isExecutor ? 'execution' : 'issuer'} approval has been recorded successfully.
                            </Text>
                            <Text style={{ color: tokens.colorNeutralForeground3 }}>
                                You can close this window now.
                            </Text>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <img src={sailLogo} alt="SAIL Logo" className={styles.logo} />
                    <div>
                        <Text className={styles.headerTitle}>
                            {isExecutor ? 'Executor Approval' : 'Issuer Approval'} - Data Request
                        </Text>
                        <Text className={styles.headerSubtitle}>
                            {state.dataRequestNumber} • {state.permitNumber}
                        </Text>
                    </div>
                </div>

                <Card className={styles.card}>
                    {/* Info Grid */}
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <Text className={styles.infoLabel}>Data Request ID</Text>
                            <Text className={styles.infoValue}>{state.dataRequestNumber}</Text>
                        </div>
                        <div className={styles.infoItem}>
                            <Text className={styles.infoLabel}>Permit Number</Text>
                            <Text className={styles.infoValue}>{state.permitNumber}</Text>
                        </div>
                        <div className={styles.infoItem}>
                            <Text className={styles.infoLabel}>Permit Type</Text>
                            <Badge appearance="filled" color={state.permitType === 'general' ? 'brand' : 'success'}>
                                {state.permitType === 'general' ? 'General' : 'Height'}
                            </Badge>
                        </div>
                        <div className={styles.infoItem}>
                            <Text className={styles.infoLabel}>Approver</Text>
                            <Text className={styles.infoValue}>{state.user.name}</Text>
                        </div>
                    </div>

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <MessageBar intent="error" style={{ marginBottom: tokens.spacingVerticalL }}>
                            <MessageBarBody>
                                {Object.values(errors).map((err, i) => (
                                    <div key={i}>{err}</div>
                                ))}
                            </MessageBarBody>
                        </MessageBar>
                    )}

                    {/* EXECUTOR FORM */}
                    {isExecutor && (
                        <>
                            {/* PPE & Personnel Section */}
                            <div className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Shield24Regular />
                                    PPE & Personnel Information
                                </Text>

                                <Field label="Special PPEs/Tools/Equipment">
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Input
                                            value={newPPEItem}
                                            onChange={(_, d) => setNewPPEItem(d.value)}
                                            placeholder="Enter PPE/Tool/Equipment"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPPE())}
                                            style={{ flex: 1 }}
                                        />
                                        <Button icon={<Add24Regular />} onClick={handleAddPPE}>Add</Button>
                                    </div>
                                    {executorFormData.executingAgency.specialPPEsToolsEquipment.length > 0 && (
                                        <div className={styles.badgeContainer}>
                                            {executorFormData.executingAgency.specialPPEsToolsEquipment.map((item, i) => (
                                                <Badge key={i} appearance="filled" color="brand">
                                                    {item}
                                                    <Button
                                                        icon={<Delete24Regular />}
                                                        appearance="subtle"
                                                        size="small"
                                                        onClick={() => handleRemovePPE(i)}
                                                        style={{ marginLeft: '4px', minWidth: 'auto' }}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </Field>

                                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                                    <Field label="Number of Persons Attached">
                                        <Input
                                            type="number"
                                            value={executorFormData.executingAgency.numberOfPersonsAttached}
                                            onChange={(_, d) => setExecutorFormData((prev) => ({
                                                ...prev,
                                                executingAgency: { ...prev.executingAgency, numberOfPersonsAttached: d.value },
                                            }))}
                                        />
                                    </Field>
                                    <Field>
                                        <Checkbox
                                            label="Attach Separate List"
                                            checked={executorFormData.executingAgency.attachSeparateList}
                                            onChange={(_, d) => setExecutorFormData((prev) => ({
                                                ...prev,
                                                executingAgency: { ...prev.executingAgency, attachSeparateList: d.checked === true },
                                            }))}
                                            style={{ marginTop: '24px' }}
                                        />
                                    </Field>
                                </div>

                                <Field label="Name of Persons" style={{ marginTop: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Input
                                            value={newPersonName}
                                            onChange={(_, d) => setNewPersonName(d.value)}
                                            placeholder="Enter person name"
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerson())}
                                            style={{ flex: 1 }}
                                        />
                                        <Button icon={<Add24Regular />} appearance="primary" onClick={handleAddPerson}>Add</Button>
                                    </div>
                                    {executorFormData.executingAgency.nameOfPersons.length > 0 && (
                                        <div className={styles.badgeContainer}>
                                            {executorFormData.executingAgency.nameOfPersons.map((name, i) => (
                                                <Badge key={i} appearance="filled" color="success">
                                                    <Person24Regular style={{ fontSize: '12px', marginRight: '4px' }} />
                                                    {name}
                                                    <Button
                                                        icon={<Delete24Regular />}
                                                        appearance="subtle"
                                                        size="small"
                                                        onClick={() => handleRemovePerson(i)}
                                                        style={{ marginLeft: '4px', minWidth: 'auto' }}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </Field>
                            </div>

                            {/* Acceptor Details */}
                            <div className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Person24Regular />
                                    Acceptor Details
                                </Text>

                                <div className={styles.formGrid}>
                                    <Field label="Acceptor Name *" required>
                                        <Input value={executorFormData.executingAgency.acceptorName} readOnly />
                                        <Text size={100} style={{ color: 'green', marginTop: '4px' }}>
                                            ✓ Auto-filled from your profile
                                        </Text>
                                    </Field>
                                    <Field label="Acceptor Signature">
                                        {executorFormData.executingAgency.acceptorSignature?.signature ? (
                                            <div className={styles.signatureBox}>
                                                <Image
                                                    src={executorFormData.executingAgency.acceptorSignature.signature}
                                                    alt="Signature"
                                                    style={{ maxHeight: '60px', maxWidth: '100%' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className={styles.signatureBox}>
                                                <Text size={200}>No signature in profile</Text>
                                            </div>
                                        )}
                                    </Field>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Calendar24Regular />
                                    Acceptance Date & Time
                                </Text>

                                <div className={styles.formGrid}>
                                    <Field label="Acceptance Date">
                                        <Input
                                            type="date"
                                            value={executorFormData.executingAgency.acceptanceDate instanceof Date
                                                ? executorFormData.executingAgency.acceptanceDate.toISOString().split('T')[0]
                                                : String(executorFormData.executingAgency.acceptanceDate)}
                                            onChange={(_, d) => setExecutorFormData((prev) => ({
                                                ...prev,
                                                executingAgency: { ...prev.executingAgency, acceptanceDate: new Date(d.value) },
                                            }))}
                                        />
                                    </Field>
                                    <Field label="Acceptance Time">
                                        <Input
                                            type="time"
                                            value={executorFormData.executingAgency.acceptanceTime}
                                            onChange={(_, d) => setExecutorFormData((prev) => ({
                                                ...prev,
                                                executingAgency: { ...prev.executingAgency, acceptanceTime: d.value },
                                            }))}
                                        />
                                    </Field>
                                </div>
                            </div>

                            {/* Pre-Execution Checks */}
                            <div className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Checkmark24Regular />
                                    Pre-Execution Safety Checks
                                </Text>

                                <table className={styles.checkTable}>
                                    <thead>
                                        <tr className={styles.checkTableHeader}>
                                            <th className={styles.checkTableCell} style={{ width: '55%' }}>Safety Check Item</th>
                                            <th className={styles.checkTableCellCenter} style={{ width: '15%' }}>YES</th>
                                            <th className={styles.checkTableCellCenter} style={{ width: '15%' }}>NO</th>
                                            <th className={styles.checkTableCellCenter} style={{ width: '15%' }}>N/A</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PRE_EXECUTION_CHECKS.map((check) => (
                                            <tr key={check.field}>
                                                <td className={styles.checkTableCell}>{check.label}</td>
                                                <td className={styles.checkTableCellCenter}>
                                                    <Radio
                                                        name={check.field}
                                                        value="YES"
                                                        checked={(executorFormData.preExecutionChecks as any)[check.field] === 'YES'}
                                                        onChange={() => handleCheckChange(check.field, 'YES')}
                                                    />
                                                </td>
                                                <td className={styles.checkTableCellCenter}>
                                                    <Radio
                                                        name={check.field}
                                                        value="NO"
                                                        checked={(executorFormData.preExecutionChecks as any)[check.field] === 'NO'}
                                                        onChange={() => handleCheckChange(check.field, 'NO')}
                                                    />
                                                </td>
                                                <td className={styles.checkTableCellCenter}>
                                                    <Radio
                                                        name={check.field}
                                                        value="NA"
                                                        checked={(executorFormData.preExecutionChecks as any)[check.field] === 'NA'}
                                                        onChange={() => handleCheckChange(check.field, 'NA')}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Comments */}
                            <div className={styles.section}>
                                <Field label="Comments (Optional)" className={styles.fullWidth}>
                                    <Textarea
                                        value={executorFormData.comments}
                                        onChange={(_, d) => setExecutorFormData((prev) => ({ ...prev, comments: d.value }))}
                                        placeholder="Add any additional comments..."
                                        rows={3}
                                    />
                                </Field>
                            </div>
                        </>
                    )}

                    {/* ISSUER FORM */}
                    {!isExecutor && (
                        <>
                            {/* Issuer Details */}
                            <div className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Person24Regular />
                                    Issuer Certification
                                </Text>

                                <div className={styles.formGrid}>
                                    <Field label="Issuer Name *" required>
                                        <Input value={issuerFormData.issuerDetails.name} readOnly />
                                        <Text size={100} style={{ color: 'green', marginTop: '4px' }}>
                                            ✓ Auto-filled from your profile
                                        </Text>
                                    </Field>
                                    <Field label="Issuer Signature">
                                        {issuerFormData.issuerDetails.signature ? (
                                            <div className={styles.signatureBox}>
                                                <Image
                                                    src={issuerFormData.issuerDetails.signature}
                                                    alt="Signature"
                                                    style={{ maxHeight: '60px', maxWidth: '100%' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className={styles.signatureBox}>
                                                <Text size={200}>No signature in profile</Text>
                                            </div>
                                        )}
                                    </Field>
                                </div>

                                <div className={styles.formGrid} style={{ marginTop: tokens.spacingVerticalM }}>
                                    <Field label="Date">
                                        <Input
                                            type="date"
                                            value={issuerFormData.issuerDetails.date instanceof Date
                                                ? issuerFormData.issuerDetails.date.toISOString().split('T')[0]
                                                : String(issuerFormData.issuerDetails.date)}
                                            onChange={(_, d) => setIssuerFormData((prev) => ({
                                                ...prev,
                                                issuerDetails: { ...prev.issuerDetails, date: new Date(d.value) },
                                            }))}
                                        />
                                    </Field>
                                    <Field label="Time">
                                        <Input
                                            type="time"
                                            value={issuerFormData.issuerDetails.time}
                                            onChange={(_, d) => setIssuerFormData((prev) => ({
                                                ...prev,
                                                issuerDetails: { ...prev.issuerDetails, time: d.value },
                                            }))}
                                        />
                                    </Field>
                                </div>

                                <Checkbox
                                    label="I have verified all details and found them satisfactory"
                                    checked={issuerFormData.verifiedAndFoundSatisfactory}
                                    onChange={(_, d) => setIssuerFormData((prev) => ({
                                        ...prev,
                                        verifiedAndFoundSatisfactory: d.checked === true,
                                    }))}
                                    style={{ marginTop: tokens.spacingVerticalL }}
                                />
                            </div>

                            {/* Comments */}
                            <div className={styles.section}>
                                <Field label="Comments (Optional)" className={styles.fullWidth}>
                                    <Textarea
                                        value={issuerFormData.comments}
                                        onChange={(_, d) => setIssuerFormData((prev) => ({ ...prev, comments: d.value }))}
                                        placeholder="Add any additional comments..."
                                        rows={3}
                                    />
                                </Field>
                            </div>
                        </>
                    )}

                    {/* Footer with Issuer Selection for Executor */}
                    <div className={styles.footer}>
                        {isExecutor && (
                            <>
                                {/* Issuer Selection */}
                                <div className={styles.issuerSelection}>
                                    <Text weight="semibold">Assign to Issuer:</Text>
                                    <select
                                        value={selectedIssuerId}
                                        onChange={(e) => setSelectedIssuerId(e.target.value)}
                                        className={styles.issuerSelectDropdown}
                                        disabled={loadingIssuers}
                                    >
                                        <option value="">-- Select Issuer (Optional) --</option>
                                        {issuers.map((issuer) => (
                                            <option key={issuer._id} value={issuer._id}>
                                                {issuer.name} ({issuer.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Save Only Button */}
                                <Button
                                    appearance="secondary"
                                    size="large"
                                    onClick={() => handleSubmit(false)}
                                    disabled={loading}
                                    icon={loading ? <Spinner size="tiny" /> : <Save24Regular />}
                                >
                                    {loading ? 'Saving...' : 'Save Only'}
                                </Button>

                                {/* Submit & Assign Issuer Button */}
                                <Button
                                    appearance="primary"
                                    size="large"
                                    onClick={() => handleSubmit(true)}
                                    disabled={loading || !selectedIssuerId}
                                    icon={loading ? <Spinner size="tiny" /> : <Send24Regular />}
                                >
                                    {loading ? 'Submitting...' : 'Submit & Assign Issuer'}
                                </Button>
                            </>
                        )}

                        {!isExecutor && (
                            <Button
                                appearance="primary"
                                size="large"
                                onClick={() => handleSubmit()}
                                disabled={loading}
                                icon={loading ? <Spinner size="tiny" /> : <Checkmark24Regular />}
                            >
                                {loading ? 'Submitting...' : 'Submit Approval'}
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DataRequestApprovePage;
