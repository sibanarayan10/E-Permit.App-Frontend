/**
 * Height Permit Issuer Approval Drawer
 * For issuer to give final approval on Height Permits
 */

import React, { useState, useEffect } from 'react';
import {
    makeStyles,
    tokens,
    Drawer,
    DrawerHeader,
    DrawerHeaderTitle,
    DrawerBody,
    Button,
    Text,
    Textarea,
    Field,
    Badge,
    MessageBar,
    MessageBarBody,
    Image,
    Spinner,
    Card,
} from '@fluentui/react-components';
import {
    Dismiss24Regular,
    Checkmark24Regular,
    Person24Regular,
    Location24Regular,
    Calendar24Regular,
    Shield24Regular,
    CheckmarkCircle24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import { getHeightPermitById, issuerApproveHeightPermit } from '@/services';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    header: {
        background: 'linear-gradient(135deg, #28a745, #20c997)',
        color: 'white',
    },
    body: {
        padding: tokens.spacingHorizontalL,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        paddingRight: '4px',
        paddingBottom: '100px',
    },
    section: {
        marginBottom: tokens.spacingVerticalL,
        padding: tokens.spacingHorizontalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalM,
        color: tokens.colorBrandForeground1,
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingHorizontalM,
    },
    infoItem: {
        marginBottom: tokens.spacingVerticalS,
    },
    infoLabel: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        marginBottom: '2px',
    },
    infoValue: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
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
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalM,
        paddingTop: tokens.spacingVerticalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground1,
        marginTop: 'auto',
        flexShrink: 0,
    },
    hazardBadge: {
        marginRight: tokens.spacingHorizontalXS,
        marginBottom: tokens.spacingVerticalXS,
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
    },
    approvalCard: {
        backgroundColor: tokens.colorNeutralBackground3,
        padding: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalS,
    },
});

interface HeightPermitIssuerApprovalDrawerProps {
    open: boolean;
    onClose: () => void;
    permitId: string | null;
    onSuccess: () => void;
}

export const HeightPermitIssuerApprovalDrawer: React.FC<HeightPermitIssuerApprovalDrawerProps> = ({
    open,
    onClose,
    permitId,
    onSuccess,
}) => {
    const styles = useStyles();
    const { user, signature: userSignature } = useUser();

    const [permit, setPermit] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState('');

    // Fetch permit details
    useEffect(() => {
        if (open && permitId) {
            setLoading(true);
            setComments('');
            getHeightPermitById(permitId)
                .then((res) => {
                    setPermit(res.data);
                })
                .catch((err) => {
                    toast.error('Failed to load permit details');
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [open, permitId]);

    // Handle approval
    const handleApprove = async () => {
        if (!permit) return;

        try {
            setSubmitting(true);
            await issuerApproveHeightPermit(permit._id, {
                comments,
                issuerDetails: {
                    name: user?.name || '',
                    signature: userSignature || '',
                    date: new Date(),
                    time: new Date().toTimeString().slice(0, 5),
                },
            });
            toast.success('Height Permit approved successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to approve permit');
        } finally {
            setSubmitting(false);
        }
    };

    // Render hazards as badges
    const renderHazardBadges = () => {
        if (!permit?.hazardsAssociated) return [];

        const hazards = permit.hazardsAssociated;
        const activeHazards: string[] = [];

        const isHazardActive = (val: any) => val === true || val === 'YES';

        if (isHazardActive(hazards.fallingObjects)) activeHazards.push('Falling Objects');
        if (isHazardActive(hazards.highWinds)) activeHazards.push('High Winds');
        if (isHazardActive(hazards.weatherConditions)) activeHazards.push('Weather Conditions');
        if (isHazardActive(hazards.unguardedEdges)) activeHazards.push('Unguarded Edges');
        if (isHazardActive(hazards.manualHandlingOfLoads)) activeHazards.push('Manual Handling of Loads');
        if (isHazardActive(hazards.riskOfFallingPersons)) activeHazards.push('Fall Risk');
        if (isHazardActive(hazards.overheadElectricCables)) activeHazards.push('Overhead Cables');
        if (isHazardActive(hazards.unsecuredLadders)) activeHazards.push('Unsecured Ladders');
        if (isHazardActive(hazards.illumination)) activeHazards.push('Poor Illumination');
        if (isHazardActive(hazards.unevenFloorSurfaces)) activeHazards.push('Uneven Floor');
        if (isHazardActive(hazards.fragileRoofs)) activeHazards.push('Fragile Roofs');
        if (isHazardActive(hazards.equipmentMachinery)) activeHazards.push('Equipment Hazards');

        return activeHazards.map((h, i) => (
            <Badge key={i} color="danger" appearance="filled" className={styles.hazardBadge}>
                {h}
            </Badge>
        ));
    };

    // Format date
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-GB');
        } catch {
            return 'N/A';
        }
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckmarkCircle24Regular />
                        Height Permit Final Approval
                    </div>
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody className={styles.body}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="large" label="Loading permit details..." />
                    </div>
                ) : permit ? (
                    <>
                        <div className={styles.content}>
                            {/* Permit Info Card */}
                            <Card className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Checkmark24Regular />
                                    Permit Information
                                </Text>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Permit Number</Text>
                                        <Text className={styles.infoValue}>{permit.permitNumber}</Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Protocol Number</Text>
                                        <Text className={styles.infoValue}>{permit.protocolNumber || 'N/A'}</Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Responsible Person</Text>
                                        <Text className={styles.infoValue}>
                                            {permit.personOrContractorResponsible?.name || 'N/A'}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Contractor's Supervisor</Text>
                                        <Text className={styles.infoValue}>
                                            {permit.personOrContractorResponsible?.nameOfContractorsSupervisor || 'N/A'}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Departmental Rep</Text>
                                        <Text className={styles.infoValue}>
                                            {permit.personOrContractorResponsible?.nameOfDepartmentalRepresentative || 'N/A'}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Created By</Text>
                                        <Text className={styles.infoValue}>
                                            {permit.createdBy?.name || 'N/A'}
                                        </Text>
                                    </div>
                                </div>
                            </Card>

                            {/* Location & Description */}
                            <div className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Location24Regular />
                                    Work Details
                                </Text>
                                <div className={styles.infoItem}>
                                    <Text className={styles.infoLabel}>Job Location</Text>
                                    <Text className={styles.infoValue}>{permit.jobLocation || 'N/A'}</Text>
                                </div>
                                <div className={styles.infoItem} style={{ marginTop: '12px' }}>
                                    <Text className={styles.infoLabel}>Job Description</Text>
                                    <Text className={styles.infoValue}>{permit.jobDescription || 'N/A'}</Text>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Calendar24Regular />
                                    Work Schedule
                                </Text>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Start Date</Text>
                                        <Text className={styles.infoValue}>
                                            {formatDate(permit.schedule?.startTimeDate?.date)}
                                            {permit.schedule?.startTimeDate?.hrs && ` at ${permit.schedule.startTimeDate.hrs}`}
                                        </Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Finish Date</Text>
                                        <Text className={styles.infoValue}>
                                            {formatDate(permit.schedule?.finishTimeDate?.date)}
                                            {permit.schedule?.finishTimeDate?.hrs && ` at ${permit.schedule.finishTimeDate.hrs}`}
                                        </Text>
                                    </div>
                                </div>
                            </div>

                            {/* Hazards */}
                            <div className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Shield24Regular />
                                    Associated Hazards
                                </Text>
                                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                    {renderHazardBadges()}
                                    {renderHazardBadges().length === 0 && (
                                        <Text style={{ color: tokens.colorNeutralForeground3 }}>
                                            No specific hazards identified
                                        </Text>
                                    )}
                                </div>
                            </div>

                            {/* Executor Approval Info */}
                            {permit.executionApproval && (
                                <div className={styles.section}>
                                    <Text className={styles.sectionTitle}>
                                        <Checkmark24Regular />
                                        Executor Approval
                                    </Text>
                                    <div className={styles.approvalCard}>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoItem}>
                                                <Text className={styles.infoLabel}>Approved By</Text>
                                                <Text className={styles.infoValue}>
                                                    {permit.executionApproval.repDetails?.name ||
                                                        permit.assignedExecutor?.name || 'N/A'}
                                                </Text>
                                            </div>
                                            <div className={styles.infoItem}>
                                                <Text className={styles.infoLabel}>Approved At</Text>
                                                <Text className={styles.infoValue}>
                                                    {formatDate(permit.executionApproval.approvedAt)}
                                                </Text>
                                            </div>
                                        </div>
                                        {permit.executionApproval.repDetails?.signature && (
                                            <div className={styles.signatureBox} style={{ marginTop: '8px' }}>
                                                <Image
                                                    src={permit.executionApproval.repDetails.signature}
                                                    alt="Executor Signature"
                                                    style={{ maxHeight: '50px' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Your Approval Details */}
                            <div className={styles.section}>
                                <Text className={styles.sectionTitle}>
                                    <Person24Regular />
                                    Your Approval Details
                                </Text>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Issuer Name</Text>
                                        <Text className={styles.infoValue}>{user?.name || 'N/A'}</Text>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Text className={styles.infoLabel}>Your Signature</Text>
                                        {userSignature ? (
                                            <div className={styles.signatureBox}>
                                                <Image
                                                    src={userSignature}
                                                    alt="Signature"
                                                    style={{ maxHeight: '60px' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className={styles.signatureBox}>
                                                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                                    No signature in profile
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className={styles.section}>
                                <Field label="Comments (Optional)">
                                    <Textarea
                                        value={comments}
                                        onChange={(_, d) => setComments(d.value)}
                                        placeholder="Add any comments for this approval..."
                                        rows={3}
                                    />
                                </Field>
                            </div>

                            {/* Info message */}
                            <MessageBar intent="success">
                                <MessageBarBody>
                                    Clicking "Approve Permit" will grant final approval and allow work to commence.
                                </MessageBarBody>
                            </MessageBar>
                        </div>

                        {/* Footer */}
                        <div className={styles.footer}>
                            <Button appearance="secondary" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                icon={<CheckmarkCircle24Regular />}
                                onClick={handleApprove}
                                disabled={submitting}
                                style={{ backgroundColor: '#28a745' }}
                            >
                                {submitting ? 'Approving...' : 'Approve Permit'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <MessageBar intent="error">
                        <MessageBarBody>Failed to load permit details.</MessageBarBody>
                    </MessageBar>
                )}
            </DrawerBody>
        </Drawer>
    );
};

export default HeightPermitIssuerApprovalDrawer;
