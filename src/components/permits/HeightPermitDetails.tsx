/**
 * Height Permit Details Component - Display full height permit information in tabs
 * Uses Fluent UI components with modern styling
 */

import React from 'react';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Badge,
    Image,
    Button,
    Divider,
    MessageBar,
    MessageBarBody,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@fluentui/react-components';
import {
    ArrowDownload24Regular,
    Person24Regular,
    Checkmark24Regular,
    Shield24Regular,
    Warning24Regular,
    ArrowUp24Regular,
    Document24Regular,
} from '@fluentui/react-icons';
import type { HeightPermit } from '@/models';
import { downloadHeightPermitPDF } from '@/services';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        padding: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalS,
        },
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalM,
        padding: tokens.spacingVerticalM,
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: tokens.borderRadiusMedium,
        color: 'white',
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: tokens.spacingVerticalS,
            borderRadius: 0,
            padding: tokens.spacingVerticalM,
        },
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
    },
    tabContent: {
        padding: tokens.spacingVerticalM,
        '@media (max-width: 768px)': {
            padding: tokens.spacingVerticalS,
        },
    },
    tabCard: {
        padding: tokens.spacingHorizontalL,
        marginBottom: tokens.spacingVerticalL,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalM,
            marginBottom: tokens.spacingVerticalM,
        },
    },
    section: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
        marginBottom: tokens.spacingVerticalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        '@media (max-width: 768px)': {
            padding: tokens.spacingVerticalS,
        },
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase400,
        marginBottom: tokens.spacingVerticalM,
        color: '#d97706',
        '@media (max-width: 768px)': {
            fontSize: tokens.fontSizeBase300,
        },
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: tokens.spacingVerticalS,
        },
    },
    infoCard: {
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        '@media (max-width: 768px)': {
            padding: tokens.spacingVerticalS,
        },
    },
    infoLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
        marginBottom: tokens.spacingVerticalXS,
    },
    infoValue: {
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase300,
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${tokens.spacingVerticalS} 0`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        gap: tokens.spacingHorizontalS,
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: tokens.spacingVerticalXS,
        },
    },
    signatureContainer: {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalS,
        backgroundColor: tokens.colorNeutralBackground2,
        textAlign: 'center' as const,
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    signatureImage: {
        maxHeight: '60px',
        maxWidth: '100%',
    },
    signatureCard: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        marginBottom: tokens.spacingVerticalM,
    },
    signatureCardSuccess: {
        borderLeft: `4px solid ${tokens.colorPaletteGreenBorder2}`,
    },
    signatureCardHeader: {
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalS,
        color: tokens.colorBrandForeground1,
    },
    hazardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: tokens.spacingHorizontalS,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: tokens.spacingVerticalXS,
        },
    },
    hazardItem: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalXS,
        '@media (max-width: 768px)': {
            gap: tokens.spacingHorizontalXS,
        },
    },
    tableContainer: {
        marginTop: tokens.spacingVerticalS,
        overflowX: 'auto' as const,
    },
});

interface HeightPermitDetailsProps {
    permit: HeightPermit | null;
    onDownloadPDF?: () => void;
    canDownload?: boolean;
}

// Helper functions
const formatDate = (dateValue?: string | Date): string => {
    if (!dateValue) return 'N/A';
    const dateString = typeof dateValue === 'object' ? dateValue.toISOString() : dateValue;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const getStatusColor = (status?: string): 'brand' | 'success' | 'warning' | 'danger' | 'informative' => {
    if (!status) return 'informative';
    const s = String(status).toUpperCase();
    if (s.includes('DRAFT')) return 'informative';
    if (s.includes('PENDING_EXECUTION') || s.includes('PENDING EXECUTION')) return 'warning';
    if (s.includes('PENDING_ISSUER') || s.includes('PENDING ISSUER')) return 'brand';
    if (s.includes('APPROVED')) return 'success';
    if (s.includes('RETURNED') || s.includes('REJECTED') || s.includes('CANCELLED')) return 'danger';
    if (s.includes('CLOSED')) return 'informative';
    return 'informative';
};

export const HeightPermitDetails: React.FC<HeightPermitDetailsProps> = ({
    permit,
    canDownload = false,
}) => {
    const styles = useStyles();

    const handleDownloadPDF = async () => {
        if (!permit?._id) return;
        try {
            toast.loading('Generating PDF...', { id: 'pdf-download' });
            const blob = await downloadHeightPermitPDF(permit._id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Height_Permit_${permit.permitNumber || 'unknown'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('PDF downloaded successfully!', { id: 'pdf-download' });
        } catch (error) {
            console.error('PDF download error:', error);
            toast.error('Failed to download PDF', { id: 'pdf-download' });
        }
    };

    if (!permit) {
        return (
            <MessageBar intent="info">
                <MessageBarBody>No permit data available</MessageBarBody>
            </MessageBar>
        );
    }

    const renderSignature = (signature?: string, name?: string) => {
        if (!signature) {
            return (
                <div className={styles.signatureContainer}>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        No signature provided
                    </Text>
                </div>
            );
        }

        if (String(signature).startsWith('http')) {
            return (
                <div className={styles.signatureContainer}>
                    <Image src={signature} alt={`${name || 'User'} Signature`} className={styles.signatureImage} />
                </div>
            );
        }

        return (
            <div className={styles.signatureContainer}>
                <Text weight="semibold">{signature}</Text>
            </div>
        );
    };

    const renderBasicInfo = () => (
        <div className={styles.tabContent}>
            <div className={styles.infoGrid}>
                <div className={styles.section}>
                    <div className={styles.infoRow}>
                        <Text weight="semibold">Permit Number:</Text>
                        <Badge appearance="filled" color="warning">{permit.permitNumber || 'N/A'}</Badge>
                    </div>
                    <div className={styles.infoRow}>
                        <Text weight="semibold">Permit Type:</Text>
                        <Badge appearance="filled" color="warning">Height Permit</Badge>
                    </div>
                    <div className={styles.infoRow}>
                        <Text weight="semibold">Current Stage:</Text>
                        <Badge appearance="filled" color="brand">{permit.workflowStage || 'N/A'}</Badge>
                    </div>
                    <div className={styles.infoRow} style={{ borderBottom: 'none' }}>
                        <Text weight="semibold">Status:</Text>
                        <Badge appearance="filled" color={getStatusColor(permit.status)}>
                            {(permit.status || 'N/A').toString().replace(/_/g, ' ')}
                        </Badge>
                    </div>
                </div>
                <div className={styles.section}>
                    <div className={styles.infoRow}>
                        <Text weight="semibold">Created By:</Text>
                        <Text>{typeof permit.createdBy === 'object' ? permit.createdBy?.name : 'Unknown'}</Text>
                    </div>
                    <div className={styles.infoRow}>
                        <Text weight="semibold">Created Date:</Text>
                        <Text>{formatDate(permit.createdAt)}</Text>
                    </div>
                    <div className={styles.infoRow}>
                        <Text weight="semibold">Assigned Executor:</Text>
                        <Text>{typeof permit.assignedExecutor === 'object' ? permit.assignedExecutor?.name : 'Not Assigned'}</Text>
                    </div>
                    <div className={styles.infoRow} style={{ borderBottom: 'none' }}>
                        <Text weight="semibold">Assigned Issuer:</Text>
                        <Text>{typeof permit.assignedIssuer === 'object' ? permit.assignedIssuer?.name : 'Not Assigned'}</Text>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderJobDetails = () => (
        <div className={styles.tabContent}>
            <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                    <Text className={styles.infoLabel}>Person/Contractor Responsible</Text>
                    <Text className={styles.infoValue}>{permit.personOrContractorResponsible?.name || 'N/A'}</Text>
                </div>
                <div className={styles.infoCard}>
                    <Text className={styles.infoLabel}>Name of Contractor's Supervisor</Text>
                    <Text className={styles.infoValue}>{permit.personOrContractorResponsible?.nameOfContractorsSupervisor || 'N/A'}</Text>
                </div>
                <div className={styles.infoCard}>
                    <Text className={styles.infoLabel}>Name of Departmental Representative</Text>
                    <Text className={styles.infoValue}>{permit.personOrContractorResponsible?.nameOfDepartmentalRepresentative || 'N/A'}</Text>
                </div>
            </div>

            <div className={styles.infoGrid} style={{ marginTop: tokens.spacingVerticalM }}>
                <div className={styles.infoCard}>
                    <Text className={styles.infoLabel}>Job Location</Text>
                    <Text className={styles.infoValue}>{permit.jobLocation || 'N/A'}</Text>
                </div>
                <div className={styles.infoCard}>
                    <Text className={styles.infoLabel}>Schedule</Text>
                    <Text className={styles.infoValue}>
                        Start: {formatDate(permit.schedule?.startTimeDate?.date)} {permit.schedule?.startTimeDate?.hrs || ''}
                    </Text>
                    <Text className={styles.infoValue}>
                        Finish: {formatDate(permit.schedule?.finishTimeDate?.date)} {permit.schedule?.finishTimeDate?.hrs || ''}
                    </Text>
                </div>
            </div>

            <div className={styles.section} style={{ marginTop: tokens.spacingVerticalM }}>
                <Text className={styles.infoLabel}>Job Description</Text>
                <Text className={styles.infoValue}>{permit.jobDescription || 'N/A'}</Text>
            </div>
        </div>
    );

    const renderHazards = () => {
        const hazards = permit.hazardsAssociated || {};
        const hazardItems = [
            { key: 'fallingObjects', label: 'Falling Objects' },
            { key: 'highWinds', label: 'High Winds' },
            { key: 'weatherConditions', label: 'Weather Conditions' },
            { key: 'unguardedEdges', label: 'Unguarded Edges' },
            { key: 'manualHandlingOfLoads', label: 'Manual Handling of Loads' },
            { key: 'riskOfFallingPersons', label: 'Risk of Falling' },
            { key: 'overheadElectricCables', label: 'Overhead Cables' },
            { key: 'unsecuredLadders', label: 'Unsecured Ladders' },
            { key: 'illumination', label: 'Illumination Issues' },
            { key: 'unevenFloorSurfaces', label: 'Uneven Surfaces' },
            { key: 'fragileRoofs', label: 'Fragile Roofs' },
            { key: 'equipmentMachinery', label: 'Equipment/Machinery' },
        ];

        const fp = permit.fallProtectionSystem || {};

        return (
            <div className={styles.tabContent}>
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <Warning24Regular />
                        Identified Hazards
                    </Text>
                    <div className={styles.hazardGrid}>
                        {hazardItems.map(({ key, label }) => (
                            <div key={key} className={styles.hazardItem}>
                                <Badge appearance="filled" color={(hazards as any)[key] ? 'danger' : 'informative'}>
                                    {(hazards as any)[key] ? '✓' : '✗'}
                                </Badge>
                                <Text size={200}>{label}</Text>
                            </div>
                        ))}
                    </div>
                    {hazards.other && (
                        <div style={{ marginTop: tokens.spacingVerticalM }}>
                            <Text weight="semibold">Other Hazards: </Text>
                            <Text>{hazards.other}</Text>
                        </div>
                    )}
                </div>

                <Divider />

                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <Shield24Regular />
                        Fall Protection System
                    </Text>
                    <div className={styles.tableContainer}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>Type of System</TableHeaderCell>
                                    <TableHeaderCell>Description</TableHeaderCell>
                                    <TableHeaderCell>Selected</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Travel Restraint System</TableCell>
                                    <TableCell>Falls are prevented – PPE limits travel</TableCell>
                                    <TableCell>
                                        <Badge appearance="filled" color={fp.travelRestraintSystem ? 'success' : 'informative'}>
                                            {fp.travelRestraintSystem ? 'YES' : 'NO'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Work Positioning System</TableCell>
                                    <TableCell>Continuous tension, restrained by PPE</TableCell>
                                    <TableCell>
                                        <Badge appearance="filled" color={fp.workPositioningSystem ? 'success' : 'informative'}>
                                            {fp.workPositioningSystem ? 'YES' : 'NO'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Fall-arrest System</TableCell>
                                    <TableCell>Does not prevent falls – catches after fall</TableCell>
                                    <TableCell>
                                        <Badge appearance="filled" color={fp.fallArrestSystem ? 'success' : 'informative'}>
                                            {fp.fallArrestSystem ? 'YES' : 'NO'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        );
    };

    const renderWorkContext = () => {
        const wc = permit.workContext || {};
        const contextItems = [
            { key: 'onRoofSurface', label: 'On Roof Surface' },
            { key: 'nearExposedEdge', label: 'Near Exposed Edge' },
            { key: 'nearOpenHole', label: 'Near Open Hole' },
            { key: 'onHeavyPlantAndMachinery', label: 'On Heavy Plant' },
            { key: 'onTowerStructure', label: 'On Tower Structure' },
            { key: 'erectingScaffold', label: 'Erecting Scaffold' },
            { key: 'onCrane', label: 'On Crane' },
            { key: 'other', label: 'Other' },
        ];

        return (
            <div className={styles.tabContent}>
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <Shield24Regular />
                        Work Context & Method of Access
                    </Text>
                    <div className={styles.tableContainer}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>Context / Access Method</TableHeaderCell>
                                    <TableHeaderCell>Selected</TableHeaderCell>
                                    <TableHeaderCell>Hazards Assessed/Inspected</TableHeaderCell>
                                    <TableHeaderCell>Remark</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contextItems.map(({ key, label }) => {
                                    const item = (wc as any)[key];
                                    if (!item) return null;
                                    return (
                                        <TableRow key={key}>
                                            <TableCell>
                                                <Text weight="semibold">{label}</Text>
                                                {key === 'onRoofSurface' && item.roofPitchAngle && <div style={{ fontSize: '11px', color: '#666' }}>Angle: {item.roofPitchAngle}</div>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge appearance="filled" color={item.selected ? 'success' : 'informative'}>
                                                    {item.selected ? 'YES' : 'NO'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.hazardsAssessed || 'N/A'}</TableCell>
                                            <TableCell>{item.remark || '-'}</TableCell>
                                        </TableRow>
                                    )
                                })}
                                {/* Loop Method of access similarly if needed, or just list context for now as requested by user to match form structure */}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        );
    }

    const renderPPE = () => {
        const ppe = permit.fallProtectionEquipment || {};
        const ppeItems = [
            { key: 'lanyardFixedLength', label: 'Lanyard (fixed length)' },
            { key: 'rearAttachment', label: 'Rear attachment' },
            { key: 'frontAttachment', label: 'Front attachment' },
            { key: 'isConnectorCompatible', label: 'Connector compatible' },
            { key: 'retractableLanyardType2NoWinchWebbing', label: 'Retractable Lanyard (Webbing)' },
            { key: 'retractableLanyardType2NoWinchCable', label: 'Retractable Lanyard (Cable)' },
            { key: 'retractableLanyardType3WinchCable', label: 'Retractable Lanyard (Winch)' },
            { key: 'poleStrapBelt', label: 'Pole Strap Belt' },
            { key: 'fullBodyHarnessFallArrest', label: 'Harness (Fall Arrest)' },
            { key: 'fullBodyHarnessWorkPositioning', label: 'Harness (Work Positioning)' },
            { key: 'safetyNet', label: 'Safety Net' },
        ];

        const ra = permit.riskAssessment || {};

        return (
            <div className={styles.tabContent}>
                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <Shield24Regular />
                        Fall Protection Equipment
                    </Text>
                    <div className={styles.tableContainer}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>Equipment Item</TableHeaderCell>
                                    <TableHeaderCell>Selected</TableHeaderCell>
                                    <TableHeaderCell>Inspected</TableHeaderCell>
                                    <TableHeaderCell>Remark</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ppeItems.map(({ key, label }) => {
                                    const item = (ppe as any)[key] || {};
                                    return (
                                        <TableRow key={key}>
                                            <TableCell>{label}</TableCell>
                                            <TableCell>
                                                <Badge appearance="filled" color={item.selected ? 'success' : 'informative'}>
                                                    {item.selected ? 'YES' : 'NO'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.inspected || '-'}</TableCell>
                                            <TableCell>{item.remark || '-'}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Divider />

                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <Person24Regular />
                        Authorized Persons
                    </Text>
                    {Array.isArray(permit.numberOfPersonsAuthorized) ? (
                        <div className={styles.tableContainer}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell>Name</TableHeaderCell>
                                        <TableHeaderCell>Height Pass Ref No.</TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permit.numberOfPersonsAuthorized.map((p: any, i: number) => (
                                        <TableRow key={i}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.heightPassRefNo}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className={styles.infoCard}>
                            <Text className={styles.infoLabel}>Number of Persons Authorized</Text>
                            <Text className={styles.infoValue}>{permit.numberOfPersonsAuthorized || 'N/A'}</Text>
                        </div>
                    )}
                </div>

                <Divider />

                <div className={styles.section}>
                    <Text className={styles.sectionTitle}>
                        <Document24Regular />
                        Risk Assessment
                    </Text>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <Text className={styles.infoLabel}>HIRA/JSA Completed</Text>
                            <Badge appearance="filled" color={ra.HIRAOrJSACompleted === 'YES' ? 'success' : 'warning'}>
                                {ra.HIRAOrJSACompleted || 'N/A'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSignatures = () => {
        const ptw = permit.permissionToWork || {};

        // Helper to get fallback signature data
        const getInitiator = () => {
            if (ptw.personResponsibleForWork?.name) return ptw.personResponsibleForWork;
            if (permit.initiatorSignature?.name) return permit.initiatorSignature;
            return null;
        };

        const getExecutor = () => {
            if (ptw.executingAgency?.name) return ptw.executingAgency;
            if (permit.executionApproval?.repDetails?.name) return permit.executionApproval.repDetails;
            return null;
        };

        const getIssuer = () => {
            if (ptw.authorisingPerson?.name) return ptw.authorisingPerson;
            if (permit.issuerApproval?.issuerDetails?.name) return permit.issuerApproval.issuerDetails;
            return null;
        };

        const initiator = getInitiator();
        const executor = getExecutor();
        const issuer = getIssuer();

        return (
            <div className={styles.tabContent}>
                <Text className={styles.sectionTitle}>
                    <Checkmark24Regular />
                    Permission to Work Signatures
                </Text>
                <div className={styles.infoGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    {/* Initiator of Permit - Keep original display if needed, or merge. User asked for Person Responsible (Initiator) specifically to show. */}
                    <div className={`${styles.signatureCard} ${permit.initiatorSignature?.name ? styles.signatureCardSuccess : ''}`}>
                        <Text className={styles.signatureCardHeader}>Initiator of Permit</Text>
                        <div className={styles.infoRow}>
                            <Text size={200}>Name:</Text>
                            <Text size={200} weight="semibold">{permit.initiatorSignature?.name || 'N/A'}</Text>
                        </div>
                        <div className={styles.infoRow}>
                            <Text size={200}>Date:</Text>
                            <Text size={200}>{formatDate(permit.initiatorSignature?.date)} {permit.initiatorSignature?.time || ''}</Text>
                        </div>
                        {renderSignature(permit.initiatorSignature?.signature, permit.initiatorSignature?.name)}
                    </div>

                    {/* Person Responsible for Work (Initiator) */}
                    <div className={`${styles.signatureCard} ${initiator?.name ? styles.signatureCardSuccess : ''}`}>
                        <Text className={styles.signatureCardHeader}>Person Responsible for Work (Initiator)</Text>
                        <div className={styles.infoRow}>
                            <Text size={200}>Name:</Text>
                            <Text size={200} weight="semibold">{initiator?.name || 'N/A'}</Text>
                        </div>
                        <div className={styles.infoRow}>
                            <Text size={200}>Designation:</Text>
                            <Text size={200}>{initiator?.designation || '-'}</Text>
                        </div>
                        <div className={styles.infoRow}>
                            <Text size={200}>Date:</Text>
                            <Text size={200}>{formatDate(initiator?.date)} {initiator?.time || ''}</Text>
                        </div>
                        {renderSignature(initiator?.signature, initiator?.name)}
                    </div>

                    {/* Executing Agency */}
                    <div className={`${styles.signatureCard} ${executor?.name ? styles.signatureCardSuccess : ''}`}>
                        <Text className={styles.signatureCardHeader}>Executing Agency</Text>
                        <div className={styles.infoRow}>
                            <Text size={200}>Name:</Text>
                            <Text size={200} weight="semibold">{executor?.name || 'Pending'}</Text>
                        </div>
                        <div className={styles.infoRow}>
                            <Text size={200}>Designation:</Text>
                            <Text size={200}>{executor?.designation || '-'}</Text>
                        </div>
                        <div className={styles.infoRow}>
                            <Text size={200}>Date:</Text>
                            <Text size={200}>{executor?.date ? `${formatDate(executor.date)} ${executor?.time || ''}` : '-'}</Text>
                        </div>
                        {/* Always render signature area to show 'No signature provided' if data is missing but expected, or if pending */}
                        {renderSignature(executor?.signature, executor?.name)}
                    </div>

                    {/* Authorising Person (Issuer) */}
                    <div className={`${styles.signatureCard} ${issuer?.name ? styles.signatureCardSuccess : ''}`}>
                        <Text className={styles.signatureCardHeader}>Authorising Person (Issuer)</Text>
                        <div className={styles.infoRow}>
                            <Text size={200}>Name:</Text>
                            <Text size={200} weight="semibold">{issuer?.name || 'Pending'}</Text>
                        </div>
                        <div className={styles.infoRow}>
                            <Text size={200}>Designation:</Text>
                            <Text size={200}>{issuer?.designation || '-'}</Text>
                        </div>
                        <div className={styles.infoRow}>
                            <Text size={200}>Date:</Text>
                            <Text size={200}>{issuer?.date ? `${formatDate(issuer.date)} ${issuer?.time || ''}` : '-'}</Text>
                        </div>
                        {renderSignature(issuer?.signature, issuer?.name)}
                    </div>
                </div>
            </div>
        );
    };

    const renderClosure = () => {
        const jc = permit.jobCompletionCancellation || {};
        // Check if any closure data exists
        const hasClosureData = jc.personResponsibleForWork?.name || jc.executingAgency?.name || jc.authorisingPerson?.name;

        if (!hasClosureData) {
            return (
                <div className={styles.tabContent}>
                    <MessageBar intent="info">
                        <MessageBarBody>Job completion signatures not yet recorded</MessageBarBody>
                    </MessageBar>
                </div>
            );
        }

        return (
            <div className={styles.tabContent}>
                <Text className={styles.sectionTitle}>
                    <Checkmark24Regular />
                    Job Completion / Cancellation
                </Text>
                <div className={styles.infoGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {jc.personResponsibleForWork?.name && (
                        <div className={styles.infoCard}>
                            <Text weight="semibold" style={{ marginBottom: tokens.spacingVerticalS }}>Person Responsible For Work</Text>
                            <Text size={200} block>Name: {jc.personResponsibleForWork.name}</Text>
                            <Text size={200} block>Date: {formatDate(jc.personResponsibleForWork.date)}</Text>
                            {jc.personResponsibleForWork.signature && renderSignature(jc.personResponsibleForWork.signature, jc.personResponsibleForWork.name)}
                        </div>
                    )}
                    {jc.executingAgency?.name && (
                        <div className={styles.infoCard}>
                            <Text weight="semibold" style={{ marginBottom: tokens.spacingVerticalS }}>Executing Agency</Text>
                            <Text size={200} block>Name: {jc.executingAgency.name}</Text>
                            <Text size={200} block>Date: {formatDate(jc.executingAgency.date)}</Text>
                            {jc.executingAgency.signature && renderSignature(jc.executingAgency.signature, jc.executingAgency.name)}
                        </div>
                    )}
                    {jc.authorisingPerson?.name && (
                        <div className={styles.infoCard}>
                            <Text weight="semibold" style={{ marginBottom: tokens.spacingVerticalS }}>Authorising Person</Text>
                            <Text size={200} block>Name: {jc.authorisingPerson.name}</Text>
                            <Text size={200} block>Date: {formatDate(jc.authorisingPerson.date)}</Text>
                            {jc.authorisingPerson.signature && renderSignature(jc.authorisingPerson.signature, jc.authorisingPerson.name)}
                        </div>
                    )}
                </div>
                <div className={styles.infoGrid} style={{ marginTop: tokens.spacingVerticalM }}>
                    <div className={styles.infoCard}>
                        <Text className={styles.infoLabel}>Incidents or Near Misses Reported?</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                            <Badge
                                appearance="filled"
                                color={permit.incidentsOrNearMisses === 'YES' ? 'danger' : 'success'}
                            >
                                {permit.incidentsOrNearMisses || 'NO'}
                            </Badge>
                            {permit.incidentsOrNearMisses === 'YES' && (
                                <Text size={200}>(See attached report)</Text>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <ArrowUp24Regular style={{ fontSize: '24px' }} />
                    <Text size={500} weight="bold" style={{ color: 'white' }}>
                        Height Work Permit Details
                    </Text>
                    <Badge appearance="tint" color="warning">
                        {permit.permitNumber}
                    </Badge>
                    <Badge
                        appearance="tint"
                        color={getStatusColor(permit.status)}
                    >
                        {(permit.status || 'N/A').toString().replace(/_/g, ' ')}
                    </Badge>
                </div>
                {canDownload && permit.status && String(permit.status).toUpperCase().includes('APPROVED') && (
                    <Button
                        appearance="primary"
                        icon={<ArrowDownload24Regular />}
                        onClick={handleDownloadPDF}
                        style={{ backgroundColor: '#1f2937' }}
                    >
                        Download PDF
                    </Button>
                )}
            </div>

            {/* All Sections in Vertical Layout */}
            <Card className={styles.tabCard}>
                {renderBasicInfo()}
            </Card>

            <Card className={styles.tabCard}>
                {renderJobDetails()}
            </Card>

            <Card className={styles.tabCard}>
                {renderHazards()}
            </Card>

            <Card className={styles.tabCard}>
                {renderWorkContext()}
            </Card>

            <Card className={styles.tabCard}>
                {renderPPE()}
            </Card>

            <Card className={styles.tabCard}>
                {renderSignatures()}
            </Card>

            <Card className={styles.tabCard}>
                {renderClosure()}
            </Card>
        </Card>
    );
};

export default HeightPermitDetails;
