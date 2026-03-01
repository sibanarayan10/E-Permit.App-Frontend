/**
 * HIRA Details Embed Component
 * 
 * Embeddable component to display HIRA details within other pages (e.g., Permit Details).
 * Pass a HIRA ID or HIRA data object to display the full HIRA information.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Badge,
    Button,
    Spinner,
    Divider,
} from '@fluentui/react-components';
import {
    Shield24Regular,
    Open24Regular,
    ArrowDownload24Regular,
    Warning24Regular,
} from '@fluentui/react-icons';
import toast from 'react-hot-toast';
import {
    HiraJsa,
    RiskLevel,
    getRiskLevelColor,
    getRiskLevelBgColor,
} from '../../models/hiraJsa.types';
import hiraService from '../../services/hiraService';

const useStyles = makeStyles({
    container: {
        padding: tokens.spacingHorizontalM,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalM,
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    hiraBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
        backgroundColor: '#1a5f2a',
        color: 'white',
        padding: '4px 12px',
        borderRadius: tokens.borderRadiusMedium,
        fontWeight: tokens.fontWeightSemibold,
    },
    actionButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
    },
    summaryCard: {
        marginBottom: tokens.spacingVerticalM,
        padding: tokens.spacingHorizontalM,
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: tokens.spacingHorizontalS,
        marginTop: tokens.spacingVerticalS,
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    },
    summaryItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: tokens.spacingVerticalXS,
        borderRadius: tokens.borderRadiusMedium,
    },
    summaryCount: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightBold,
        color: 'white',
    },
    summaryLabel: {
        fontSize: tokens.fontSizeBase100,
        color: 'white',
    },
    jobHeaderCard: {
        marginBottom: tokens.spacingVerticalM,
        padding: tokens.spacingHorizontalM,
    },
    jobHeaderTitle: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        color: '#E07020',
        marginBottom: tokens.spacingVerticalS,
    },
    jobHeaderGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
        },
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    fieldLabel: {
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground3,
    },
    fieldValue: {
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground1,
        backgroundColor: '#f8f9fa',
        padding: '6px 10px',
        borderRadius: tokens.borderRadiusMedium,
    },
    rowsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    rowCard: {
        padding: tokens.spacingHorizontalS,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: 'white',
    },
    rowHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalS,
        paddingBottom: tokens.spacingVerticalXS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    rowGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: tokens.spacingHorizontalS,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
        },
    },
    listContainer: {
        padding: tokens.spacingVerticalXS,
        backgroundColor: '#fff8e1',
        borderRadius: tokens.borderRadiusMedium,
        fontSize: tokens.fontSizeBase200,
    },
    listContainerGreen: {
        padding: tokens.spacingVerticalXS,
        backgroundColor: '#e8f5e9',
        borderRadius: tokens.borderRadiusMedium,
        fontSize: tokens.fontSizeBase200,
    },
    listItem: {
        fontSize: tokens.fontSizeBase200,
        padding: '2px 0',
        borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
        ':last-child': {
            borderBottom: 'none',
        },
    },
    riskSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: tokens.spacingHorizontalXS,
        padding: tokens.spacingVerticalXS,
        backgroundColor: '#fff8e1',
        borderRadius: tokens.borderRadiusMedium,
        marginTop: tokens.spacingVerticalXS,
    },
    riskLabel: {
        fontSize: tokens.fontSizeBase100,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground3,
        textAlign: 'center',
    },
    riskValue: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
        borderRadius: tokens.borderRadiusMedium,
        fontWeight: tokens.fontWeightBold,
        fontSize: tokens.fontSizeBase300,
        backgroundColor: '#f5f5f5',
    },
    riskScore: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
        borderRadius: tokens.borderRadiusMedium,
        fontWeight: tokens.fontWeightBold,
        fontSize: tokens.fontSizeBase300,
    },
    riskLevel: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
        borderRadius: tokens.borderRadiusMedium,
        fontWeight: tokens.fontWeightBold,
        fontSize: tokens.fontSizeBase200,
        color: 'white',
    },
    acmSection: {
        marginTop: tokens.spacingVerticalS,
        padding: tokens.spacingVerticalXS,
        backgroundColor: '#e8f5e9',
        borderRadius: tokens.borderRadiusMedium,
        border: '2px solid #4caf50',
    },
    acmTitle: {
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        color: '#2e7d32',
        marginBottom: tokens.spacingVerticalXS,
    },
    residualSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: tokens.spacingHorizontalXS,
        padding: tokens.spacingVerticalXS,
        backgroundColor: '#e3f2fd',
        borderRadius: tokens.borderRadiusMedium,
        marginTop: tokens.spacingVerticalXS,
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacingVerticalS,
        padding: tokens.spacingVerticalL,
        color: tokens.colorPaletteRedForeground1,
    },
});

interface HiraDetailsEmbedProps {
    hiraId?: string;
    hiraData?: HiraJsa;
    showActions?: boolean;
}

export const HiraDetailsEmbed: React.FC<HiraDetailsEmbedProps> = ({
    hiraId,
    hiraData,
    showActions = true,
}) => {
    const styles = useStyles();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [hira, setHira] = useState<HiraJsa | null>(hiraData || null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (hiraId && !hiraData) {
            loadHira(hiraId);
        }
    }, [hiraId, hiraData]);

    const loadHira = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await hiraService.getHiraById(id);
            if (response.success) {
                setHira(response.data);
            } else {
                setError('Failed to load HIRA');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load HIRA');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenHiraPage = () => {
        const id = hira?._id || hiraId;
        if (id) {
            navigate(`/hira/${id}`);
        }
    };

    const handleExportPdf = async () => {
        if (!hira) return;
        try {
            toast.loading('Generating PDF...');
            await hiraService.downloadHiraPdf(hira._id, hira.hiraNumber);
            toast.dismiss();
            toast.success('PDF downloaded');
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to export PDF');
        }
    };

    const getRiskSummary = () => {
        if (!hira) return { Low: 0, Medium: 0, High: 0, Extreme: 0 };
        const summary = { Low: 0, Medium: 0, High: 0, Extreme: 0 };
        hira.rows.forEach(row => {
            if (row.riskLevel) {
                summary[row.riskLevel as keyof typeof summary] += 1;
            }
        });
        return summary;
    };

    const isACMRequired = (level: RiskLevel): boolean => {
        return level === 'Medium' || level === 'High' || level === 'Extreme';
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner size="medium" label="Loading HIRA..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <Warning24Regular style={{ fontSize: '48px' }} />
                <Text>{error}</Text>
                <Button onClick={() => hiraId && loadHira(hiraId)}>Retry</Button>
            </div>
        );
    }

    if (!hira) {
        return (
            <div className={styles.errorContainer}>
                <Warning24Regular style={{ fontSize: '48px' }} />
                <Text>No HIRA data available</Text>
            </div>
        );
    }

    const riskSummary = getRiskSummary();

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Shield24Regular style={{ fontSize: '24px', color: '#0078d4' }} />
                    <div className={styles.hiraBadge}>
                        <span style={{ fontWeight: 'bold' }}>{hira.hiraNumber.split('-')[2] || '##'}</span>
                        HIRA JSA
                    </div>
                    <Badge appearance="tint" color="brand">{hira.hiraNumber}</Badge>
                    <Badge appearance="tint" color={hira.status === 'Locked' ? 'success' : hira.status === 'Submitted' ? 'important' : 'warning'}>
                        {hira.status}
                    </Badge>
                </div>
                {showActions && (
                    <div className={styles.actionButtons}>
                        <Button
                            icon={<ArrowDownload24Regular />}
                            onClick={handleExportPdf}
                            size="small"
                        >
                            PDF
                        </Button>
                        <Button
                            appearance="primary"
                            icon={<Open24Regular />}
                            onClick={handleOpenHiraPage}
                            size="small"
                        >
                            Open Full View
                        </Button>
                    </div>
                )}
            </div>

            {/* Risk Summary */}
            <Card className={styles.summaryCard}>
                <Text weight="semibold" size={200}>Risk Summary ({hira.rows.length} tasks)</Text>
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem} style={{ backgroundColor: getRiskLevelColor('Low') }}>
                        <span className={styles.summaryCount}>{riskSummary.Low}</span>
                        <span className={styles.summaryLabel}>Low</span>
                    </div>
                    <div className={styles.summaryItem} style={{ backgroundColor: getRiskLevelColor('Medium') }}>
                        <span className={styles.summaryCount}>{riskSummary.Medium}</span>
                        <span className={styles.summaryLabel}>Medium</span>
                    </div>
                    <div className={styles.summaryItem} style={{ backgroundColor: getRiskLevelColor('High') }}>
                        <span className={styles.summaryCount}>{riskSummary.High}</span>
                        <span className={styles.summaryLabel}>High</span>
                    </div>
                    <div className={styles.summaryItem} style={{ backgroundColor: getRiskLevelColor('Extreme') }}>
                        <span className={styles.summaryCount}>{riskSummary.Extreme}</span>
                        <span className={styles.summaryLabel}>Extreme</span>
                    </div>
                </div>
            </Card>

            {/* Job Header */}
            <Card className={styles.jobHeaderCard}>
                <Text className={styles.jobHeaderTitle}>Job Information</Text>
                <div className={styles.jobHeaderGrid}>
                    <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>Area</span>
                        <span className={styles.fieldValue}>{hira.jobHeader.area}</span>
                    </div>
                    <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>Job Type</span>
                        <span className={styles.fieldValue}>{hira.jobHeader.jobType}</span>
                    </div>
                    <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>Job Details</span>
                        <span className={styles.fieldValue}>{hira.jobHeader.jobDetails}</span>
                    </div>
                    <div className={styles.fieldGroup}>
                        <span className={styles.fieldLabel}>Prepared By</span>
                        <span className={styles.fieldValue}>{hira.jobHeader.preparedBy}</span>
                    </div>
                </div>
            </Card>

            <Divider style={{ margin: `${tokens.spacingVerticalM} 0` }} />

            {/* HIRA Rows */}
            <Text weight="semibold" style={{ marginBottom: tokens.spacingVerticalS, display: 'block' }}>
                Risk Assessment Details
            </Text>
            <div className={styles.rowsContainer}>
                {hira.rows.map((row, rowIndex) => {
                    const showACM = row.riskLevel ? isACMRequired(row.riskLevel) : false;

                    return (
                        <Card key={row._id || rowIndex} className={styles.rowCard}>
                            {/* Row Header */}
                            <div className={styles.rowHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                                    <Badge appearance="filled" color="brand" size="small">
                                        {row.serialNo}
                                    </Badge>
                                    <Text weight="semibold" size={200}>{row.taskActivity}</Text>
                                </div>
                            </div>

                            {/* Hazards, Risks, ECM */}
                            <div className={styles.rowGrid}>
                                <div className={styles.fieldGroup}>
                                    <span className={styles.fieldLabel}>Hazards</span>
                                    <div className={styles.listContainer}>
                                        {row.hazards.length > 0 ? (
                                            row.hazards.map((h, i) => (
                                                <div key={i} className={styles.listItem}>• {h}</div>
                                            ))
                                        ) : (
                                            <Text size={100} style={{ fontStyle: 'italic', color: tokens.colorNeutralForeground3 }}>No hazards listed</Text>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <span className={styles.fieldLabel}>Risks</span>
                                    <div className={styles.listContainer}>
                                        {row.risks.length > 0 ? (
                                            row.risks.map((r, i) => (
                                                <div key={i} className={styles.listItem}>• {r}</div>
                                            ))
                                        ) : (
                                            <Text size={100} style={{ fontStyle: 'italic', color: tokens.colorNeutralForeground3 }}>No risks listed</Text>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <span className={styles.fieldLabel}>Existing Control Measures (ECM)</span>
                                    <div className={styles.listContainer}>
                                        {row.existingControlMeasures.length > 0 ? (
                                            row.existingControlMeasures.map((e, i) => (
                                                <div key={i} className={styles.listItem}>• {e}</div>
                                            ))
                                        ) : (
                                            <Text size={100} style={{ fontStyle: 'italic', color: tokens.colorNeutralForeground3 }}>No ECM listed</Text>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Risk Assessment */}
                            <div className={styles.riskSection}>
                                <div className={styles.fieldGroup}>
                                    <span className={styles.riskLabel}>Likelihood</span>
                                    <div className={styles.riskValue}>{row.likelihood}</div>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <span className={styles.riskLabel}>Severity</span>
                                    <div className={styles.riskValue}>{row.severity}</div>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <span className={styles.riskLabel}>Risk Score</span>
                                    <div className={styles.riskScore} style={{ backgroundColor: getRiskLevelBgColor(row.riskLevel) }}>
                                        {row.riskScore}
                                    </div>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <span className={styles.riskLabel}>Risk Level</span>
                                    <div className={styles.riskLevel} style={{ backgroundColor: getRiskLevelColor(row.riskLevel) }}>
                                        {row.riskLevel}
                                    </div>
                                </div>
                            </div>

                            {/* ACM Section - Only for Moderate+ risks */}
                            {showACM && (
                                <div className={styles.acmSection}>
                                    <Text className={styles.acmTitle}>Additional Control Measures (ACM)</Text>

                                    {row.opportunity && (
                                        <div style={{ marginBottom: tokens.spacingVerticalXS }}>
                                            <span className={styles.fieldLabel}>Opportunity: </span>
                                            <Badge appearance="outline" size="small">{row.opportunity}</Badge>
                                        </div>
                                    )}

                                    <div className={styles.listContainerGreen}>
                                        {row.additionalControlMeasures.length > 0 ? (
                                            row.additionalControlMeasures.map((a, i) => (
                                                <div key={i} className={styles.listItem}>• {a}</div>
                                            ))
                                        ) : (
                                            <Text size={100} style={{ fontStyle: 'italic', color: tokens.colorNeutralForeground3 }}>No ACM listed</Text>
                                        )}
                                    </div>

                                    {/* Residual Risk */}
                                    {(row.residualLikelihood || row.residualSeverity) && (
                                        <div className={styles.residualSection}>
                                            <div className={styles.fieldGroup}>
                                                <span className={styles.riskLabel}>Res. Likelihood</span>
                                                <div className={styles.riskValue}>{row.residualLikelihood || '-'}</div>
                                            </div>
                                            <div className={styles.fieldGroup}>
                                                <span className={styles.riskLabel}>Res. Severity</span>
                                                <div className={styles.riskValue}>{row.residualSeverity || '-'}</div>
                                            </div>
                                            <div className={styles.fieldGroup}>
                                                <span className={styles.riskLabel}>Res. RS</span>
                                                <div className={styles.riskScore} style={{ backgroundColor: row.residualRiskLevel ? getRiskLevelBgColor(row.residualRiskLevel) : '#e0e0e0' }}>
                                                    {row.residualRiskScore || '-'}
                                                </div>
                                            </div>
                                            <div className={styles.fieldGroup}>
                                                <span className={styles.riskLabel}>Res. RL</span>
                                                <div className={styles.riskLevel} style={{ backgroundColor: row.residualRiskLevel ? getRiskLevelColor(row.residualRiskLevel) : '#ccc' }}>
                                                    {row.residualRiskLevel || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Low risk indicator */}
                            {!showACM && (
                                <div style={{
                                    marginTop: tokens.spacingVerticalXS,
                                    padding: tokens.spacingVerticalXS,
                                    backgroundColor: '#e8f5e9',
                                    borderRadius: tokens.borderRadiusMedium,
                                    color: '#2e7d32',
                                    fontSize: tokens.fontSizeBase100
                                }}>
                                    ✓ Risk level is {row.riskLevel} - No additional control measures required
                                </div>
                            )}

                            {/* Responsibility */}
                            {row.responsibility && (
                                <div style={{ marginTop: tokens.spacingVerticalXS, padding: '4px 8px', backgroundColor: '#f8f9fa', borderRadius: tokens.borderRadiusMedium }}>
                                    <span className={styles.fieldLabel}>Responsibility: </span>
                                    <Text size={200}>{row.responsibility}</Text>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default HiraDetailsEmbed;
