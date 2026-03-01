/**
 * Permit Details Component - Display full permit information in tabs
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
    Document24Regular,
    Checkmark24Regular,
    Shield24Regular,
    ArrowDownload24Regular,
    Warning24Regular,
    Info24Regular,
    CalendarAdd24Regular,
} from '@fluentui/react-icons';
import type { Permit } from '@/models';
import { HiraDetailsEmbed } from '../hira/HiraDetailsEmbed';

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
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
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
        marginTop: tokens.spacingVerticalM,
    },
    tabCard: {
        padding: tokens.spacingHorizontalL,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalM,
        },
    },
    section: {
        marginBottom: tokens.spacingVerticalL,
        '@media (max-width: 768px)': {
            marginBottom: tokens.spacingVerticalM,
        },
    },
    sectionTitle: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalS,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        paddingBottom: tokens.spacingVerticalS,
        '@media (max-width: 768px)': {
            fontSize: tokens.fontSizeBase300,
        },
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: tokens.spacingVerticalS,
        },
    },
    infoCard: {
        padding: tokens.spacingHorizontalM,
        backgroundColor: tokens.colorNeutralBackground2,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalS,
        },
    },
    infoItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: `${tokens.spacingVerticalS} 0`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        gap: tokens.spacingHorizontalS,
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            gap: tokens.spacingVerticalXS,
            padding: `${tokens.spacingVerticalXS} 0`,
        },
    },
    checkRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: `${tokens.spacingVerticalXS} 0`,
        gap: tokens.spacingHorizontalS,
        '@media (max-width: 768px)': {
            alignItems: 'flex-start',
        },
    },
    signatureContainer: {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalS,
        backgroundColor: tokens.colorNeutralBackground2,
        textAlign: 'center',
    },
    signatureImage: {
        maxHeight: '80px',
        maxWidth: '100%',
        '@media (max-width: 768px)': {
            maxHeight: '60px',
        },
    },
    tableContainer: {
        marginTop: tokens.spacingVerticalS,
        overflowX: 'auto',
    },
});

interface PermitDetailsProps {
    permit: Permit | null;
    onDownloadPDF?: () => void;
    canDownload?: boolean;
}

// Helper functions
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (timeString?: string): string => {
    if (!timeString) return 'N/A';
    const timeParts = String(timeString).split(':');
    if (timeParts.length >= 2) return `${timeParts[0]}:${timeParts[1]}`;
    return timeString;
};

const getStatusColor = (status?: string): 'brand' | 'success' | 'warning' | 'danger' | 'informative' => {
    if (!status) return 'informative';
    const s = String(status).toUpperCase();
    if (s.includes('APPROVED')) return 'success';
    if (s.includes('PENDING')) return 'warning';
    if (s.includes('REJECTED') || s.includes('RETURNED')) return 'danger';
    if (s.includes('CLOSED')) return 'informative';
    return 'brand';
};

const isYes = (value: unknown): boolean => {
    if (value === true) return true;
    if (typeof value === 'string') {
        const v = value.trim().toUpperCase();
        return v === 'YES' || v === 'TRUE';
    }
    return false;
};

const hasCancellationData = (permit: Permit): boolean => {
    const cancellation = (permit as any).cancellation;
    if (!cancellation || typeof cancellation !== 'object') return false;
    // Check if there's actual cancellation data (reason, date, or cancelled by)
    return !!(cancellation.reason || cancellation.cancelledAt || cancellation.cancelledBy ||
        cancellation.issuerDetails?.name || cancellation.issuerDetails?.date);
};

const hasRenewalData = (permit: Permit): boolean => {
    const pendingRenewal = (permit as any).pendingRenewal;
    const renewalCount = (permit as any).renewalCount;

    // Check if there's a valid pending renewal with meaningful data
    const hasPendingRenewal = pendingRenewal && typeof pendingRenewal === 'object' &&
        (pendingRenewal.requestedAt || pendingRenewal.from || pendingRenewal.to ||
            pendingRenewal.renewalReason || pendingRenewal.executorApproval);

    // Check if renewal count is actually greater than 0
    const hasValidCount = renewalCount && Number(renewalCount) > 0;

    return !!(hasPendingRenewal || hasValidCount);
};

export const PermitDetails: React.FC<PermitDetailsProps> = ({
    permit,
    onDownloadPDF,
    canDownload = false,
}) => {
    const styles = useStyles();

    if (!permit) {
        return (
            <Card className={styles.container}>
                <MessageBar intent="info">
                    <MessageBarBody>No permit data available</MessageBarBody>
                </MessageBar>
            </Card>
        );
    }

    const initiator = permit.initiator as unknown as Record<string, unknown> | undefined;
    const prePermitChecks = permit.prePermitChecks;
    const executionApproval = permit.executionApproval;
    const issuerApproval = permit.issuerApproval;

    const renderSignature = (signature?: string, name?: string) => {
        if (!signature) {
            return (
                <div className={styles.signatureContainer}>
                    <Warning24Regular style={{ marginRight: '4px' }} />
                    <Text size={200}>No signature provided</Text>
                </div>
            );
        }
        if (String(signature).startsWith('http')) {
            return (
                <div className={styles.signatureContainer}>
                    <Image src={signature} alt={`${name || 'User'} Signature`} className={styles.signatureImage} />
                    <Text size={200} block>Digital signature</Text>
                </div>
            );
        }
        return (
            <div className={styles.signatureContainer}>
                <Text>{signature}</Text>
                <Text size={200} block>Text signature</Text>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Document24Regular style={{ fontSize: '24px' }} />
                    <Text size={500} weight="bold" style={{ color: 'white' }}>
                        General Work Permit Details
                    </Text>
                    <Badge appearance="tint" color="brand">
                        {permit.permitNumber}
                    </Badge>
                    <Badge
                        appearance="tint"
                        color={getStatusColor(permit.permitStatus || permit.status)}
                    >
                        {(permit.permitStatus || permit.status || 'N/A').toString().replace('_', ' ')}
                    </Badge>
                </div>
                {canDownload && onDownloadPDF && (
                    <Button
                        appearance="primary"
                        icon={<ArrowDownload24Regular />}
                        onClick={onDownloadPDF}
                        style={{ backgroundColor: '#1f2937' }}
                    >
                        Download PDF
                    </Button>
                )}
            </div>

            {/* All Sections in Vertical Layout */}
            <div className={styles.tabContent}>
                {/* Basic Info */}
                <Card className={styles.tabCard}>
                    <div className={styles.section}>
                        <div className={styles.infoGrid}>
                            <Card className={styles.infoCard}>
                                <div className={styles.infoItem}>
                                    <Text weight="semibold">Permit Number</Text>
                                    <Text>{permit.permitNumber || 'N/A'}</Text>
                                </div>
                                <div className={styles.infoItem}>
                                    <Text weight="semibold">Protocol Number</Text>
                                    <Text>{permit.protocolNumber || 'N/A'}</Text>
                                </div>
                                <div className={styles.infoItem}>
                                    <Text weight="semibold">SR No</Text>
                                    <Text>{permit.srNo || 'N/A'}</Text>
                                </div>
                                <div className={styles.infoItem}>
                                    <Text weight="semibold">Current Stage</Text>
                                    <Badge color="brand">{permit.currentStage || 'N/A'}</Badge>
                                </div>
                            </Card>
                            <Card className={styles.infoCard}>
                                <div className={styles.infoItem}>
                                    <Text weight="semibold">Status</Text>
                                    <Badge color={getStatusColor(permit.permitStatus)}>
                                        {(permit.permitStatus || 'N/A').toString().replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className={styles.infoItem}>
                                    <Text weight="semibold">Created By</Text>
                                    <Text>{permit.createdBy?.name || 'Unknown'}</Text>
                                </div>
                                <div className={styles.infoItem}>
                                    <Text weight="semibold">Created Date</Text>
                                    <Text>{formatDate(permit.createdAt)}</Text>
                                </div>
                                <div className={styles.infoItem}>
                                    <Text weight="semibold">Last Updated</Text>
                                    <Text>{formatDate(permit.updatedAt)}</Text>
                                </div>
                            </Card>
                        </div>
                    </div>
                </Card>

                {/* HIRA Linkage Section - Show only if HIRA is linked */}
                {permit.isHiraRequired && permit.hiraId && (
                    <Card className={styles.tabCard}>
                        <div className={styles.section}>
                            <Text className={styles.sectionTitle}>
                                <Shield24Regular style={{ color: '#0078d4' }} />
                                HIRA (Hazard Identification & Risk Assessment)
                            </Text>
                            <HiraDetailsEmbed
                                hiraId={typeof permit.hiraId === 'object' && permit.hiraId?._id
                                    ? permit.hiraId._id
                                    : typeof permit.hiraId === 'string' ? permit.hiraId : undefined
                                }
                                showActions={true}
                            />
                        </div>
                    </Card>
                )}

                {/* Cancellation Details - Show only if permit has cancellation data */}
                {hasCancellationData(permit) && (
                    <Card className={styles.tabCard}>
                        <div className={styles.section}>
                            <Text className={styles.sectionTitle}>
                                <Warning24Regular style={{ color: '#d13438' }} />Cancellation Details
                            </Text>
                            <div className={styles.infoGrid}>
                                <Card className={styles.infoCard}>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Status</Text>
                                        <Badge color="danger">Cancelled</Badge>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Reason</Text>
                                        <Text>
                                            {(permit as any).cancellation?.reason === 'CHANGE_OF_SCOPE' && 'Change of Scope'}
                                            {(permit as any).cancellation?.reason === 'VIOLATION_OF_PERMIT_CONDITIONS' && 'Violation of Permit Conditions & Safety Requirements'}
                                            {(permit as any).cancellation?.reason === 'PLANT_EMERGENCY' && 'Plant Emergency'}
                                            {!(permit as any).cancellation?.reason && 'N/A'}
                                        </Text>
                                    </div>
                                    {(permit as any).cancellation?.comments && (
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Comments</Text>
                                            <Text>{(permit as any).cancellation.comments}</Text>
                                        </div>
                                    )}
                                </Card>
                                <Card className={styles.infoCard}>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Cancelled By</Text>
                                        <Text>
                                            {(permit as any).cancellation?.issuerDetails?.name ||
                                                (permit as any).cancellation?.cancelledBy?.name ||
                                                'N/A'}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Cancelled Date</Text>
                                        <Text>
                                            {formatDate((permit as any).cancellation?.issuerDetails?.date ||
                                                (permit as any).cancellation?.cancelledAt)}
                                        </Text>
                                    </div>
                                    {(permit as any).cancellation?.issuerDetails?.time && (
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Cancelled Time</Text>
                                            <Text>{(permit as any).cancellation.issuerDetails.time}</Text>
                                        </div>
                                    )}
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Signature</Text>
                                        {renderSignature(
                                            (permit as any).issuerCertification?.issuerDetails?.signature ||
                                            (issuerApproval as any)?.approvedBy?.signature ||
                                            (permit as any).cancellation?.issuerDetails?.signature,
                                            (permit as any).cancellation?.issuerDetails?.name || issuerApproval?.approvedBy?.name
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Closure Details - Show if any closure data exists */}
                {((permit as any).closure?.initiatorClosure?.initiatorDetails || permit.permitStatus === 'Closed') && (
                    <Card className={styles.tabCard}>
                        <div className={styles.section}>
                            <Text className={styles.sectionTitle}>
                                <Checkmark24Regular style={{ color: '#16a34a' }} />Closure of Work Permit
                            </Text>

                            <div className={styles.infoGrid}>
                                {/* Initiator Closure - Always show if exists */}
                                <Card className={styles.infoCard}>
                                    <Text weight="semibold" style={{ marginBottom: '8px', color: '#1e3a5f' }}>
                                        Initiator Closure
                                    </Text>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Status</Text>
                                        <Badge color="success">Initiated</Badge>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Confirmation</Text>
                                        <Text>
                                            {(permit as any).closure?.initiatorClosure?.confirmationText ||
                                                'The Job is completed. All men & materials are removed from the site.'}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Initiator Name</Text>
                                        <Text>{(permit as any).closure?.initiatorClosure?.initiatorDetails?.name || 'N/A'}</Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Date</Text>
                                        <Text>
                                            {formatDate((permit as any).closure?.initiatorClosure?.initiatorDetails?.date ||
                                                (permit as any).closure?.initiatedAt)}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Time</Text>
                                        <Text>
                                            {(permit as any).closure?.initiatorClosure?.initiatorDetails?.time || ''}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Signature</Text>
                                        {renderSignature(
                                            (permit as any).closure?.initiatorClosure?.initiatorDetails?.signature,
                                            (permit as any).closure?.initiatorClosure?.initiatorDetails?.name
                                        )}
                                    </div>
                                </Card>

                                {/* Executing Agency Rep - Show if exists */}
                                {((permit as any).closure?.executingAgencyRepDetails || (permit as any).closure?.executorChecklist || (permit as any).closure?.checklist || (permit as any).closure?.executorClosure) && (
                                    <Card className={styles.infoCard}>
                                        <Text weight="semibold" style={{ marginBottom: '8px', color: '#f59e0b' }}>
                                            Executing Agency Handover
                                        </Text>

                                        {/* Executor Checklist */}
                                        {((permit as any).closure?.executorChecklist || (permit as any).closure?.checklist) && (
                                            <div style={{ marginBottom: '16px', padding: '8px', backgroundColor: '#fff7ed', borderRadius: '4px' }}>
                                                <Text weight="semibold" style={{ display: 'block', marginBottom: '8px' }}>Handover Checklist</Text>
                                                {(() => {
                                                    const cl = (permit as any).closure?.executorChecklist || (permit as any).closure?.checklist;
                                                    return (
                                                        <>
                                                            <div className={styles.checkRow}><Text>Work completed?</Text><Text weight="semibold">{isYes(cl.isWorkCompleted) ? 'Yes' : 'No'}</Text></div>
                                                            <div className={styles.checkRow}><Text>Equipment/Tools removed?</Text><Text weight="semibold">{isYes(cl.equipmentRemoved) ? 'Yes' : 'No'}</Text></div>
                                                            <div className={styles.checkRow}><Text>Personnel moved to safe?</Text><Text weight="semibold">{isYes(cl.personnelMovedToSafe) ? 'Yes' : 'No'}</Text></div>
                                                            <div className={styles.checkRow}><Text>Locks removed?</Text><Text weight="semibold">{isYes(cl.locksRemoved) ? 'Yes' : 'No'}</Text></div>
                                                            <div className={styles.checkRow}><Text>Area cleaned?</Text><Text weight="semibold">{isYes(cl.workAreaCleaned) ? 'Yes' : 'No'}</Text></div>
                                                            <div className={styles.checkRow}><Text>Test run required?</Text><Text weight="semibold">{isYes(cl.testRunRequired) ? 'Yes' : 'No'}</Text></div>
                                                            {isYes(cl.testRunRequired) && (
                                                                <div className={styles.checkRow}><Text>Testing procedure agreed?</Text><Text weight="semibold">{isYes(cl.testingProcedureAgreed) ? 'Yes' : 'No'}</Text></div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {(() => {
                                            // Consolidation of potential data paths
                                            // The executor details are stored inside executorChecklist.executingAgencyRepDetails
                                            const execData =
                                                (permit as any).closure?.executorChecklist?.executingAgencyRepDetails ||
                                                (permit as any).closure?.executingAgencyRepDetails ||
                                                (permit as any).closure?.executorClosure?.executingAgencyRepDetails ||
                                                (permit as any).closure?.initiatorClosure?.executingAgencyRepSignature;

                                            return (
                                                <>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Name</Text>
                                                        <Text>{execData?.name || 'N/A'}</Text>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Date</Text>
                                                        <Text>{formatDate(execData?.date)}</Text>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Time</Text>
                                                        <Text>{execData?.time || ''}</Text>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Signature</Text>
                                                        {renderSignature(
                                                            execData?.signature,
                                                            execData?.name
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </Card>
                                )}
                            </div>

                            <Divider style={{ margin: '16px 0' }} />

                            {/* Final Certification - Only show if ACTUALLY completed (has signature/date) or status is Closed */}
                            {((permit.permitStatus === 'Closed') || (permit as any).closure?.issuerDetails?.signature || (permit as any).closure?.finalCertification?.issuerSignature?.signature) && (
                                <>
                                    <Text className={styles.sectionTitle}>Final Certification & Closure</Text>

                                    {/* Issuer Checklist */}
                                    {(permit as any).closure?.issuerChecklist && (
                                        <Card className={styles.infoCard} style={{ marginBottom: '16px' }}>
                                            <Text weight="semibold" style={{ display: 'block', marginBottom: '8px', color: '#6b21a8' }}>Issuer Closure Checklist</Text>
                                            {(() => {
                                                const cl = (permit as any).closure?.issuerChecklist;
                                                // Handle nested checklist if necessary, or flat properties
                                                // Assuming flat or inside 'checklist' property of issuerChecklist if structure differs
                                                const items = cl.checklist || cl;
                                                return (
                                                    <>
                                                        <div className={styles.checkRow}><Text>Multiple permits issued?</Text><Text weight="semibold">{isYes(items.multiplePermitsIssued) ? 'Yes' : 'No'}</Text></div>
                                                        <div className={styles.checkRow}><Text>All work completed?</Text><Text weight="semibold">{isYes(items.allWorkCompleted) ? 'Yes' : 'No'}</Text></div>
                                                        <div className={styles.checkRow}><Text>Isolation certs returned?</Text><Text weight="semibold">{isYes(items.isolationCertificatesReturned) ? 'Yes' : 'No'}</Text></div>
                                                        <div className={styles.checkRow}><Text>Test run required?</Text><Text weight="semibold">{isYes(items.testRunRequired) ? 'Yes' : 'No'}</Text></div>
                                                        <div className={styles.checkRow}><Text>Equipment moved to safe?</Text><Text weight="semibold">{isYes(items.equipmentMovedToSafe) ? 'Yes' : 'No'}</Text></div>
                                                        <div className={styles.checkRow}><Text>Emergency procedures?</Text><Text weight="semibold">{isYes(items.emergencyProceduresInPlace) ? 'Yes' : 'No'}</Text></div>
                                                    </>
                                                );
                                            })()}
                                        </Card>
                                    )}

                                    {/* Isolation Removal Details */}
                                    {(permit as any).closure?.isolationRemovalDetails && (permit as any).closure?.isolationRemovalDetails.length > 0 && (
                                        <Card className={styles.infoCard} style={{ marginBottom: '16px' }}>
                                            <Text weight="semibold" style={{ display: 'block', marginBottom: '8px', color: '#c2410c' }}>Isolation Removal Details</Text>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                    <thead>
                                                        <tr style={{ backgroundColor: tokens.colorNeutralBackground3 }}>
                                                            <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Eq. Name</th>
                                                            <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Type</th>
                                                            <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Form No</th>
                                                            <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Auth. Isolator</th>
                                                            <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(permit as any).closure.isolationRemovalDetails.map((item: any, idx: number) => (
                                                            <tr key={idx}>
                                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>{item.equipmentNameNo}</td>
                                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>{item.isolationType}</td>
                                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>{item.formNo}</td>
                                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>{item.nameOfAuthorizedIsolator}</td>
                                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>{item.dateAndTime ? new Date(item.dateAndTime).toLocaleString() : ''}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Card>
                                    )}

                                    <Card className={styles.infoCard}>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Certification</Text>
                                            <Text>All isolations are restored. Equipment are ready to start.</Text>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Issuer Name</Text>
                                            <Text>
                                                {(permit as any).closure?.issuerDetails?.name ||
                                                    (permit as any).closure?.finalCertification?.issuerSignature?.name ||
                                                    'N/A'}
                                            </Text>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Closed Date & Time</Text>
                                            <Text>
                                                {formatDate((permit as any).closure?.issuerDetails?.date || (permit as any).closure?.closedAt)}{' '}
                                                {(permit as any).closure?.issuerDetails?.time || ''}
                                            </Text>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Issuer Signature</Text>
                                            {renderSignature(
                                                (permit as any).closure?.issuerDetails?.signature ||
                                                (permit as any).closure?.finalCertification?.issuerSignature?.signature,
                                                (permit as any).closure?.issuerDetails?.name
                                            )}
                                        </div>
                                    </Card>
                                </>
                            )}
                        </div>
                    </Card>
                )}

                {/* Renewal Information - Show only if permit has renewal data */}
                {hasRenewalData(permit) && (
                    <Card className={styles.tabCard}>
                        <div className={styles.section}>
                            <Text className={styles.sectionTitle}>
                                <CalendarAdd24Regular />Renewal of General Work Permit
                            </Text>

                            {/* Renewal Status Summary */}
                            <div className={styles.infoGrid}>
                                <Card className={styles.infoCard}>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Shift / Renewal Count</Text>
                                        <Badge color="brand">{(permit as any).renewalCount || 1}</Badge>
                                    </div>
                                    {(permit as any).pendingRenewal && (
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Status</Text>
                                            <Badge color={
                                                // If isActive is false, renewal is fully approved
                                                (permit as any).pendingRenewal?.isActive === false
                                                    ? 'success'
                                                    : (permit as any).pendingRenewal?.executorApproval?.approved
                                                        ? 'informative'
                                                        : 'warning'
                                            }>
                                                {(permit as any).pendingRenewal?.isActive === false
                                                    ? 'Renewal Approved'
                                                    : (permit as any).pendingRenewal?.executorApproval?.approved
                                                        ? 'Executor Approved - Pending Issuer'
                                                        : 'Pending Executor Approval'}
                                            </Badge>
                                        </div>
                                    )}
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Requested At</Text>
                                        <Text>{formatDate((permit as any).pendingRenewal?.requestedAt)}</Text>
                                    </div>
                                </Card>
                            </div>

                            <Divider style={{ margin: '16px 0' }} />

                            {/* Date & Time Information */}
                            <Text className={styles.sectionTitle}>Date & Time</Text>
                            <div className={styles.infoGrid}>
                                <Card className={styles.infoCard}>
                                    <Text weight="semibold" style={{ marginBottom: '8px', color: '#1e3a5f' }}>Previous Date & Time</Text>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">From</Text>
                                        <Text>
                                            {/* Use previousPeriod if available (after renewal approved), otherwise use current periodOfWork */}
                                            {formatDate((permit as any).pendingRenewal?.previousPeriod?.from?.date || (initiator?.periodOfWork as any)?.from?.date)} {(permit as any).pendingRenewal?.previousPeriod?.from?.hrs || (initiator?.periodOfWork as any)?.from?.hrs || ''}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">To</Text>
                                        <Text>
                                            {formatDate((permit as any).pendingRenewal?.previousPeriod?.to?.date || (initiator?.periodOfWork as any)?.to?.date)} {(permit as any).pendingRenewal?.previousPeriod?.to?.hrs || (initiator?.periodOfWork as any)?.to?.hrs || ''}
                                        </Text>
                                    </div>
                                </Card>
                                {(permit as any).pendingRenewal && (
                                    <Card className={styles.infoCard}>
                                        <Text weight="semibold" style={{ marginBottom: '8px', color: '#16a34a' }}>New Date & Time</Text>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">From</Text>
                                            <Text>
                                                {/* If renewal is approved (isActive=false), use current periodOfWork; otherwise use pendingRenewal */}
                                                {(permit as any).pendingRenewal?.isActive === false
                                                    ? `${formatDate((initiator?.periodOfWork as any)?.from?.date)} ${(initiator?.periodOfWork as any)?.from?.hrs || ''}`
                                                    : `${formatDate((permit as any).pendingRenewal?.from?.date)} ${(permit as any).pendingRenewal?.from?.hrs || ''}`
                                                }
                                            </Text>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">To</Text>
                                            <Text>
                                                {(permit as any).pendingRenewal?.isActive === false
                                                    ? `${formatDate((initiator?.periodOfWork as any)?.to?.date)} ${(initiator?.periodOfWork as any)?.to?.hrs || ''}`
                                                    : `${formatDate((permit as any).pendingRenewal?.to?.date)} ${(permit as any).pendingRenewal?.to?.hrs || ''}`
                                                }
                                            </Text>
                                        </div>
                                    </Card>
                                )}
                            </div>

                            {/* Renewal Reason */}
                            {(permit as any).pendingRenewal?.renewalReason && (
                                <>
                                    <Divider style={{ margin: '16px 0' }} />
                                    <Card className={styles.infoCard}>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Renewal Reason</Text>
                                            <Text>{(permit as any).pendingRenewal.renewalReason}</Text>
                                        </div>
                                    </Card>
                                </>
                            )}

                            <Divider style={{ margin: '16px 0' }} />

                            {/* Signatures Section */}
                            <Text className={styles.sectionTitle}>Signatures</Text>
                            <div className={styles.infoGrid}>
                                {/* Initiator Signature - Always shows (they initiated the renewal) */}
                                <Card className={styles.infoCard}>
                                    <Text weight="semibold" style={{ marginBottom: '8px', color: '#1e3a5f' }}>Initiator</Text>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Name</Text>
                                        <Text>
                                            {(initiator?.initiatorDetails as any)?.name ||
                                                (permit.prePermitChecks as any)?.initiatorSignature?.name ||
                                                'N/A'}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Signature</Text>
                                        {renderSignature(
                                            (initiator?.initiatorDetails as any)?.signature ||
                                            (permit.prePermitChecks as any)?.initiatorSignature?.signature,
                                            (initiator?.initiatorDetails as any)?.name
                                        )}
                                    </div>
                                </Card>

                                {/* Executing Agency Signature - Only shows if executor approved the renewal */}
                                {(permit as any).pendingRenewal?.executorApproval?.approved ? (
                                    <Card className={styles.infoCard}>
                                        <Text weight="semibold" style={{ marginBottom: '8px', color: '#f59e0b' }}>Executing Agency</Text>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Name</Text>
                                            <Text>
                                                {(permit as any).executingAgency?.acceptorName ||
                                                    executionApproval?.approvedBy?.name ||
                                                    'N/A'}
                                            </Text>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Signature</Text>
                                            {renderSignature(
                                                (permit as any).executingAgency?.acceptorSignature?.signature ||
                                                (permit as any).executingAgency?.acceptorSignature,
                                                (permit as any).executingAgency?.acceptorName
                                            )}
                                        </div>
                                    </Card>
                                ) : (
                                    <Card className={styles.infoCard} style={{ opacity: 0.5 }}>
                                        <Text weight="semibold" style={{ marginBottom: '8px', color: '#f59e0b' }}>Executing Agency</Text>
                                        <Badge color="warning">Pending Approval</Badge>
                                    </Card>
                                )}

                                {/* Issuer Signature - Only shows if issuer approved the renewal (isActive becomes false) */}
                                {(permit as any).pendingRenewal?.isActive === false ? (
                                    <Card className={styles.infoCard}>
                                        <Text weight="semibold" style={{ marginBottom: '8px', color: '#16a34a' }}>Issuer</Text>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Name</Text>
                                            <Text>
                                                {(permit as any).issuerCertification?.issuerDetails?.name ||
                                                    issuerApproval?.approvedBy?.name ||
                                                    'N/A'}
                                            </Text>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Signature</Text>
                                            {renderSignature(
                                                (permit as any).issuerCertification?.issuerDetails?.signature ||
                                                (issuerApproval as any)?.approvedBy?.signature,
                                                (permit as any).issuerCertification?.issuerDetails?.name || issuerApproval?.approvedBy?.name
                                            )}
                                        </div>
                                    </Card>
                                ) : (
                                    <Card className={styles.infoCard} style={{ opacity: 0.5 }}>
                                        <Text weight="semibold" style={{ marginBottom: '8px', color: '#16a34a' }}>Issuer</Text>
                                        <Badge color="warning">
                                            {(permit as any).pendingRenewal?.executorApproval?.approved
                                                ? 'Pending Approval'
                                                : 'Awaiting Executor'}
                                        </Badge>
                                    </Card>
                                )}
                            </div>

                        </div>
                    </Card>
                )}

                {/* Initiator Info */}
                <Card className={styles.tabCard}>
                    <div className={styles.section}>
                        <Text className={styles.sectionTitle}>
                            <Document24Regular />Work Description
                        </Text>
                        <Card className={styles.infoCard}>
                            <Text>{(initiator?.briefDescriptionOfWork as string) || 'N/A'}</Text>
                        </Card>

                        <Divider style={{ margin: '16px 0' }} />

                        <div className={styles.infoGrid}>
                            <div>
                                <Text className={styles.sectionTitle}>Equipment Location</Text>
                                <Card className={styles.infoCard}>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Equipment</Text>
                                        <Text>{(initiator?.equipmentLocation as Record<string, unknown>)?.equipmentNameNo as string || 'N/A'}</Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Location</Text>
                                        <Text>{(initiator?.equipmentLocation as Record<string, unknown>)?.location as string || 'N/A'}</Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Sub Location</Text>
                                        <Text>{(initiator?.equipmentLocation as Record<string, unknown>)?.subLocation as string || 'N/A'}</Text>
                                    </div>
                                </Card>
                            </div>
                            <div>
                                <Text className={styles.sectionTitle}>Work Period</Text>
                                <Card className={styles.infoCard}>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">From</Text>
                                        <Text>
                                            {formatDate(((initiator?.periodOfWork as Record<string, unknown>)?.from as Record<string, unknown>)?.date as string)}{' '}
                                            {formatTime(((initiator?.periodOfWork as Record<string, unknown>)?.from as Record<string, unknown>)?.hrs as string)}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">To</Text>
                                        <Text>
                                            {formatDate(((initiator?.periodOfWork as Record<string, unknown>)?.to as Record<string, unknown>)?.date as string)}{' '}
                                            {formatTime(((initiator?.periodOfWork as Record<string, unknown>)?.to as Record<string, unknown>)?.hrs as string)}
                                        </Text>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {(initiator?.initiatorDetails as Record<string, unknown>) && (
                            <>
                                <Divider style={{ margin: '16px 0' }} />
                                <Text className={styles.sectionTitle}>Initiator Details</Text>
                                <Card className={styles.infoCard}>
                                    <div className={styles.infoGrid}>
                                        <div>
                                            <div className={styles.infoItem}>
                                                <Text weight="semibold">Name</Text>
                                                <Text>{(initiator?.initiatorDetails as Record<string, unknown>)?.name as string || 'N/A'}</Text>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <Text weight="semibold">Date</Text>
                                                <Text>{formatDate((initiator?.initiatorDetails as Record<string, unknown>)?.date as string)}</Text>
                                            </div>
                                        </div>
                                        <div>
                                            {renderSignature(
                                                (initiator?.initiatorDetails as Record<string, unknown>)?.signature as string,
                                                (initiator?.initiatorDetails as Record<string, unknown>)?.name as string
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </>
                        )}
                    </div>
                </Card>

                {/* Check Points / Risk Assessment */}
                {(initiator?.checkPoints as any[]) && (initiator?.checkPoints as any[]).length > 0 && (
                    <Card className={styles.tabCard}>
                        <div className={styles.section}>
                            <Text className={styles.sectionTitle}>
                                <Shield24Regular />Check Points / Risk Assessment
                            </Text>
                            <div className={styles.tableContainer}>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHeaderCell>SN</TableHeaderCell>
                                            <TableHeaderCell>Risk Assessment</TableHeaderCell>
                                            <TableHeaderCell>Hazard Mitigation Measures</TableHeaderCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(initiator?.checkPoints as any[]).map((cp: any, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell>{cp.sn || idx + 1}</TableCell>
                                                <TableCell>{cp.riskAssessment || '-'}</TableCell>
                                                <TableCell>{cp.hazardMitigationMeasures || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Pre-Permit Checks */}
                <Card className={styles.tabCard}>
                    <div className={styles.section}>
                        <Text className={styles.sectionTitle}>
                            <Checkmark24Regular />Pre-Permit Checks
                        </Text>
                        <Card className={styles.infoCard}>
                            {[
                                { key: 'electricalIsolation', label: 'Electrical Isolation' },
                                { key: 'mechanicalIsolation', label: 'Mechanical Isolation' },
                                { key: 'gasIsolation', label: 'Gas Isolation' },
                                { key: 'utilitiesIsolation', label: 'Utilities Isolation' },
                                { key: 'trafficAwareness', label: 'Traffic Awareness' },
                                { key: 'relevantDeptAwareOfIsolation', label: 'Dept Aware of Isolation' },
                                { key: 'workingAtHeight', label: 'Working at Height' },
                                { key: 'workingInConfinedSpace', label: 'Working in Confined Space' },
                                { key: 'excavation', label: 'Excavation' },
                                { key: 'gasTestingRequired', label: 'Gas Testing Required' },
                                { key: 'periodicGasTestingRequired', label: 'Periodic Gas Testing Required' },
                                { key: 'multipleExecutingAgencies', label: 'Multiple Executing Agencies' },
                                { key: 'locationAccessible', label: 'Location Accessible' },
                                { key: 'fireDeptStandby', label: 'Fire Dept Standby' },
                                { key: 'gasSafetyStandby', label: 'Gas Safety Standby' },
                                { key: 'ambulanceStandby', label: 'Ambulance Standby' },
                            ].map((item) => (
                                <div key={item.key} className={styles.checkRow}>
                                    <Text>{item.label}</Text>
                                    <Badge color={isYes(prePermitChecks?.[item.key]) ? 'success' : 'danger'}>
                                        {isYes(prePermitChecks?.[item.key]) ? 'YES' : 'NO'}
                                    </Badge>
                                </div>
                            ))}
                        </Card>
                    </div>
                </Card>

                {/* Execution Info */}
                <Card className={styles.tabCard}>
                    <div className={styles.section}>
                        {executionApproval && (
                            <>
                                <Text className={styles.sectionTitle}>
                                    <Shield24Regular />Execution Approval
                                </Text>

                                {/* Basic Approval Info */}
                                <Card className={styles.infoCard}>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Status</Text>
                                        <Badge color={(executionApproval.approved as boolean) ? 'success' : 'warning'}>
                                            {(executionApproval.approved as boolean) ? 'Approved' : 'Returned'}
                                        </Badge>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Approved By</Text>
                                        <Text>{executionApproval.approvedBy?.name || 'Unknown'}</Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Approved Date & Time</Text>
                                        <Text>
                                            {formatDate(executionApproval.approvedAt as string)}
                                            {(permit as any).executingAgency?.acceptanceTime &&
                                                ` at ${formatTime((permit as any).executingAgency.acceptanceTime)}`}
                                        </Text>
                                    </div>
                                    {executionApproval.comments && (
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Comments</Text>
                                            <Text>{executionApproval.comments as string}</Text>
                                        </div>
                                    )}
                                </Card>

                                {/* Executing Agency Details */}
                                {(permit as any).executingAgency && (
                                    <>
                                        <Divider style={{ margin: '16px 0' }} />
                                        <Text className={styles.sectionTitle}>Executing Agency Details</Text>

                                        <div className={styles.infoGrid}>
                                            <Card className={styles.infoCard}>
                                                <Text weight="semibold" style={{ marginBottom: '8px', color: '#1e3a5f' }}>
                                                    Personnel Information
                                                </Text>
                                                {(permit as any).executingAgency.numberOfPersonsAttached && (
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Number of Persons</Text>
                                                        <Badge color="brand">{(permit as any).executingAgency.numberOfPersonsAttached}</Badge>
                                                    </div>
                                                )}
                                                {(permit as any).executingAgency.nameOfPersons?.length > 0 && (
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Personnel Names</Text>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                            {(permit as any).executingAgency.nameOfPersons.map((name: string, idx: number) => (
                                                                <Badge key={idx} color="success">{name}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {(permit as any).executingAgency.attachSeparateList && (
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Separate List</Text>
                                                        <Badge color="informative">Attached</Badge>
                                                    </div>
                                                )}
                                            </Card>

                                            <Card className={styles.infoCard}>
                                                <Text weight="semibold" style={{ marginBottom: '8px', color: '#1e3a5f' }}>
                                                    PPE & Tools/Equipment
                                                </Text>
                                                {(permit as any).executingAgency.specialPPEsToolsEquipment?.length > 0 ? (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                        {(permit as any).executingAgency.specialPPEsToolsEquipment.map((item: string, idx: number) => (
                                                            <Badge key={idx} appearance="filled" color="brand">{item}</Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                                        No special PPE/Tools specified
                                                    </Text>
                                                )}
                                            </Card>
                                        </div>

                                        {/* Signatures */}
                                        <Divider style={{ margin: '16px 0' }} />
                                        <Text className={styles.sectionTitle}>Signatures</Text>
                                        <div className={styles.infoGrid}>
                                            {/* Acceptor */}
                                            <Card className={styles.infoCard}>
                                                <Text weight="semibold" style={{ marginBottom: '8px', color: '#f59e0b' }}>
                                                    Acceptor
                                                </Text>
                                                <div className={styles.infoItem}>
                                                    <Text weight="semibold">Name</Text>
                                                    <Text>{(permit as any).executingAgency.acceptorName || 'N/A'}</Text>
                                                </div>
                                                <div className={styles.infoItem}>
                                                    <Text weight="semibold">Acceptance Date & Time</Text>
                                                    <Text>
                                                        {formatDate((permit as any).executingAgency.acceptanceDate)}
                                                        {(permit as any).executingAgency.acceptanceTime &&
                                                            ` at ${formatTime((permit as any).executingAgency.acceptanceTime)}`}
                                                    </Text>
                                                </div>
                                                <div className={styles.infoItem}>
                                                    <Text weight="semibold">Signature</Text>
                                                    {renderSignature(
                                                        (permit as any).executingAgency.acceptorSignature?.signature ||
                                                        (permit as any).executingAgency.acceptorSignature,
                                                        (permit as any).executingAgency.acceptorName
                                                    )}
                                                </div>
                                            </Card>

                                            {/* Holder (if present) */}
                                            {(permit as any).executingAgency.holderName && (
                                                <Card className={styles.infoCard}>
                                                    <Text weight="semibold" style={{ marginBottom: '8px', color: '#f59e0b' }}>
                                                        Holder
                                                    </Text>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Name</Text>
                                                        <Text>{(permit as any).executingAgency.holderName}</Text>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Signature</Text>
                                                        {renderSignature(
                                                            (permit as any).executingAgency.holderSignature?.signature,
                                                            (permit as any).executingAgency.holderName
                                                        )}
                                                    </div>
                                                </Card>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Pre-Execution Checks */}
                                {(permit as any).preExecutionChecks && (
                                    <>
                                        <Divider style={{ margin: '16px 0' }} />
                                        <Text className={styles.sectionTitle}>Pre-Execution Safety Checks</Text>
                                        <Card className={styles.infoCard}>
                                            {[
                                                { key: 'jobSpecificSafetyTalk', label: 'Job Specific Safety Talk Conducted' },
                                                { key: 'sparkGeneratingWork', label: 'Spark Generating Work' },
                                                { key: 'combustibleMaterialRemoved', label: 'Combustible Material Removed' },
                                                { key: 'barriersGuardsUsed', label: 'Barriers/Guards Used' },
                                                { key: 'barricadingRequired', label: 'Barricading Required' },
                                                { key: 'fireExtinguisherLocationKnown', label: 'Fire Extinguisher Location Known' },
                                                { key: 'additionalIlluminationRequired', label: 'Additional Illumination Required' },
                                                { key: 'additionalSupplyPointsRequired', label: 'Additional Supply Points Required' },
                                                { key: 'gasTestingRequired', label: 'Gas Testing Required' },
                                                { key: 'periodicGasMonitoringRequired', label: 'Periodic Gas Monitoring Required' },
                                            ].map((check) => {
                                                const value = (permit as any).preExecutionChecks?.[check.key];
                                                if (!value) return null;
                                                return (
                                                    <div key={check.key} className={styles.checkRow}>
                                                        <Text>{check.label}</Text>
                                                        <Badge color={
                                                            String(value).toUpperCase() === 'YES' ? 'success' :
                                                                String(value).toUpperCase() === 'NO' ? 'danger' : 'informative'
                                                        }>
                                                            {String(value).toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </Card>

                                        {/* Representative Details */}
                                        {(permit as any).preExecutionChecks?.repDetails && (
                                            <>
                                                <Divider style={{ margin: '16px 0' }} />
                                                <Text className={styles.sectionTitle}>Representative Details</Text>
                                                <Card className={styles.infoCard}>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Name</Text>
                                                        <Text>{(permit as any).preExecutionChecks.repDetails.name || 'N/A'}</Text>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Date & Time</Text>
                                                        <Text>
                                                            {formatDate((permit as any).preExecutionChecks.repDetails.date)}
                                                            {(permit as any).preExecutionChecks.repDetails.time &&
                                                                ` at ${formatTime((permit as any).preExecutionChecks.repDetails.time)}`}
                                                        </Text>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Signature</Text>
                                                        {renderSignature(
                                                            (permit as any).preExecutionChecks.repDetails.signature,
                                                            (permit as any).preExecutionChecks.repDetails.name
                                                        )}
                                                    </div>
                                                </Card>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {!executionApproval && (
                            <MessageBar intent="info">
                                <MessageBarBody>No execution approval data available</MessageBarBody>
                            </MessageBar>
                        )}
                    </div>
                </Card>

                {/* Issuer Info */}
                <Card className={styles.tabCard}>
                    <div className={styles.section}>
                        {issuerApproval && (
                            <>
                                <Text className={styles.sectionTitle}>
                                    <Info24Regular />Issuer Approval
                                </Text>

                                {/* Basic Approval Info */}
                                <Card className={styles.infoCard}>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Status</Text>
                                        <Badge color={(issuerApproval.approved as boolean) ? 'success' : 'warning'}>
                                            {(issuerApproval.approved as boolean) ? 'Approved' : 'Returned'}
                                        </Badge>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Approved By</Text>
                                        <Text>{issuerApproval.approvedBy?.name || 'Unknown'}</Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text weight="semibold">Approved Date & Time</Text>
                                        <Text>
                                            {formatDate(issuerApproval.approvedAt as string)}
                                            {(permit as any).issuerCertification?.issuerDetails?.time &&
                                                ` at ${formatTime((permit as any).issuerCertification.issuerDetails.time)}`}
                                        </Text>
                                    </div>
                                    {(issuerApproval.comments || issuerApproval.remarks) && (
                                        <div className={styles.infoItem}>
                                            <Text weight="semibold">Comments</Text>
                                            <Text>{(issuerApproval.comments || issuerApproval.remarks) as string}</Text>
                                        </div>
                                    )}
                                </Card>

                                {/* Isolation Details */}
                                {(permit as any).isolationDetails && (permit as any).isolationDetails.length > 0 && (
                                    <>
                                        <Divider style={{ margin: '16px 0' }} />
                                        <Text className={styles.sectionTitle}>Isolation Details</Text>
                                        <div className={styles.infoGrid}>
                                            {(permit as any).isolationDetails.map((isolation: any, idx: number) => (
                                                <Card key={idx} className={styles.infoCard}>
                                                    <Text weight="semibold" style={{ marginBottom: '8px', color: '#d97706' }}>
                                                        S.No: {isolation.sn}
                                                    </Text>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Equipment</Text>
                                                        <Text>{isolation.equipmentNameNo || 'N/A'}</Text>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Isolation Type</Text>
                                                        <Badge color="warning">{isolation.isolationType || 'N/A'}</Badge>
                                                    </div>
                                                    {isolation.formNo && (
                                                        <div className={styles.infoItem}>
                                                            <Text weight="semibold">Form No</Text>
                                                            <Text>{isolation.formNo}</Text>
                                                        </div>
                                                    )}
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Authorized Isolator</Text>
                                                        <Text>{isolation.nameOfAuthorizedIsolator || 'N/A'}</Text>
                                                    </div>
                                                    {isolation.dateAndTime && (
                                                        <div className={styles.infoItem}>
                                                            <Text weight="semibold">Date & Time</Text>
                                                            <Text>{formatDate(isolation.dateAndTime)}</Text>
                                                        </div>
                                                    )}
                                                </Card>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Issuer Certification Details */}
                                {(permit as any).issuerCertification && (
                                    <>
                                        <Divider style={{ margin: '16px 0' }} />
                                        <Text className={styles.sectionTitle}>Issuer Certification</Text>

                                        {/* Verification Status */}
                                        {(permit as any).issuerCertification.verifiedAndFoundSatisfactory !== undefined && (
                                            <Card className={styles.infoCard} style={{ marginBottom: '16px' }}>
                                                <div className={styles.infoItem}>
                                                    <Text weight="semibold">Verified and Found Satisfactory</Text>
                                                    <Badge color={(permit as any).issuerCertification.verifiedAndFoundSatisfactory ? 'success' : 'danger'}>
                                                        {(permit as any).issuerCertification.verifiedAndFoundSatisfactory ? 'YES' : 'NO'}
                                                    </Badge>
                                                </div>
                                            </Card>
                                        )}

                                        {/* Checklist */}
                                        {(permit as any).issuerCertification.checklist && (
                                            <Card className={styles.infoCard}>
                                                {[
                                                    { key: 'isolationVerified', label: 'Isolation Verified' },
                                                    { key: 'lockoutTagoutCompliant', label: 'Lockout/Tagout Compliant' },
                                                    { key: 'workAreaInspected', label: 'Work Area Inspected' },
                                                    { key: 'safetyMeasuresVerified', label: 'Safety Measures Verified' },
                                                    { key: 'ppeVerified', label: 'PPE Verified' },
                                                    { key: 'emergencyProceduresInPlace', label: 'Emergency Procedures in Place' },
                                                    { key: 'allHazardsIdentified', label: 'All Hazards Identified' },
                                                    { key: 'correctPersonnelAssigned', label: 'Correct Personnel Assigned' },
                                                ].map((check) => {
                                                    const value = (permit as any).issuerCertification?.checklist?.[check.key];
                                                    if (!value) return null;
                                                    return (
                                                        <div key={check.key} className={styles.checkRow}>
                                                            <Text>{check.label}</Text>
                                                            <Badge color={
                                                                String(value).toUpperCase() === 'YES' ? 'success' :
                                                                    String(value).toUpperCase() === 'NO' ? 'danger' : 'informative'
                                                            }>
                                                                {String(value).toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </Card>
                                        )}

                                        {/* Restrictions */}
                                        {(permit as any).issuerCertification.restrictions && (
                                            <>
                                                <Divider style={{ margin: '16px 0' }} />
                                                <Card className={styles.infoCard}>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Restrictions/Special Instructions</Text>
                                                        <Text>{(permit as any).issuerCertification.restrictions}</Text>
                                                    </div>
                                                </Card>
                                            </>
                                        )}

                                        {/* Issuer Signature Details */}
                                        {(permit as any).issuerCertification.issuerDetails && (
                                            <>
                                                <Divider style={{ margin: '16px 0' }} />
                                                <Text className={styles.sectionTitle}>Issuer Signature</Text>
                                                <Card className={styles.infoCard}>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Name</Text>
                                                        <Text>{(permit as any).issuerCertification.issuerDetails.name || 'N/A'}</Text>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Date & Time</Text>
                                                        <Text>
                                                            {formatDate((permit as any).issuerCertification.issuerDetails.date)}
                                                            {(permit as any).issuerCertification.issuerDetails.time &&
                                                                ` at ${formatTime((permit as any).issuerCertification.issuerDetails.time)}`}
                                                        </Text>
                                                    </div>
                                                    <div className={styles.infoItem}>
                                                        <Text weight="semibold">Signature</Text>
                                                        {renderSignature(
                                                            (permit as any).issuerCertification.issuerDetails.signature,
                                                            (permit as any).issuerCertification.issuerDetails.name
                                                        )}
                                                    </div>
                                                </Card>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {!issuerApproval && (
                            <MessageBar intent="info">
                                <MessageBarBody>No issuer approval data available</MessageBarBody>
                            </MessageBar>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PermitDetails;
