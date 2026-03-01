/**
 * HIRA JSA View Page - Improved Version
 * 
 * Read-only view of a HIRA record with responsive card-based layout.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Button,
    Text,
    Spinner,
    Card,
    Badge,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
} from '@fluentui/react-components';
import {
    ArrowLeft24Regular,
    Edit24Regular,
    DocumentPdf24Regular,
    ArrowDownload24Regular,
    Copy24Regular,
    ChevronDown20Regular,
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
        padding: tokens.spacingHorizontalL,
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: tokens.colorNeutralBackground2,
        minHeight: 'calc(100vh - 120px)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalL,
        flexWrap: 'wrap',
    },
    hiraBadge: {
        backgroundColor: '#E07020',
        color: 'white',
        padding: '8px 16px',
        borderRadius: tokens.borderRadiusMedium,
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightBold,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    hiraNumber: {
        backgroundColor: 'white',
        color: '#E07020',
        padding: '4px 12px',
        borderRadius: tokens.borderRadiusMedium,
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightBold,
    },
    title: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightBold,
        color: '#1a5f2a',
        flex: 1,
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
    },
    actionButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
    },
    // Summary Card
    summaryCard: {
        marginBottom: tokens.spacingVerticalL,
        padding: tokens.spacingHorizontalM,
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: tokens.spacingHorizontalM,
        marginTop: tokens.spacingVerticalM,
        '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    },
    summaryItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: tokens.spacingVerticalS,
        borderRadius: tokens.borderRadiusMedium,
    },
    summaryCount: {
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightBold,
        color: 'white',
    },
    summaryLabel: {
        fontSize: tokens.fontSizeBase200,
        color: 'white',
    },
    // Job Header Card
    jobHeaderCard: {
        marginBottom: tokens.spacingVerticalL,
        padding: tokens.spacingHorizontalM,
    },
    jobHeaderTitle: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        color: '#E07020',
        marginBottom: tokens.spacingVerticalM,
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
        padding: '8px 12px',
        borderRadius: tokens.borderRadiusMedium,
    },
    // Row Cards
    rowsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
    },
    rowCard: {
        padding: tokens.spacingHorizontalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: 'white',
    },
    rowHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalM,
        paddingBottom: tokens.spacingVerticalS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    rowGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
        },
    },
    fullWidth: {
        gridColumn: '1 / -1',
    },
    // List Items
    listContainer: {
        padding: tokens.spacingVerticalS,
        backgroundColor: '#fff8e1',
        borderRadius: tokens.borderRadiusMedium,
    },
    listContainerGreen: {
        padding: tokens.spacingVerticalS,
        backgroundColor: '#e8f5e9',
        borderRadius: tokens.borderRadiusMedium,
    },
    listItem: {
        fontSize: tokens.fontSizeBase200,
        padding: '4px 0',
        borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
        ':last-child': {
            borderBottom: 'none',
        },
    },
    // Risk Section
    riskSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalS,
        backgroundColor: '#fff8e1',
        borderRadius: tokens.borderRadiusMedium,
        marginTop: tokens.spacingVerticalS,
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
        padding: '6px 10px',
        borderRadius: tokens.borderRadiusMedium,
        fontWeight: tokens.fontWeightBold,
        fontSize: tokens.fontSizeBase400,
        backgroundColor: '#f5f5f5',
    },
    riskScore: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        borderRadius: tokens.borderRadiusMedium,
        fontWeight: tokens.fontWeightBold,
        fontSize: tokens.fontSizeBase400,
    },
    riskLevel: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 10px',
        borderRadius: tokens.borderRadiusMedium,
        fontWeight: tokens.fontWeightBold,
        fontSize: tokens.fontSizeBase400,
        color: 'white',
    },
    // ACM Section
    acmSection: {
        marginTop: tokens.spacingVerticalM,
        padding: tokens.spacingVerticalS,
        backgroundColor: '#e8f5e9',
        borderRadius: tokens.borderRadiusMedium,
        border: '2px solid #4caf50',
    },
    acmTitle: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        color: '#2e7d32',
        marginBottom: tokens.spacingVerticalS,
    },
    residualSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalS,
        backgroundColor: '#e3f2fd',
        borderRadius: tokens.borderRadiusMedium,
        marginTop: tokens.spacingVerticalS,
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
    },
    // Reference Section
    referenceCard: {
        marginBottom: tokens.spacingVerticalL,
        padding: tokens.spacingHorizontalM,
        overflow: 'auto',
    },
    referenceTitle: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        color: '#E07020',
        marginBottom: tokens.spacingVerticalM,
    },
    referenceGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 992px)': {
            gridTemplateColumns: '1fr',
        },
    },
    refTable: {
        borderCollapse: 'collapse',
        width: '100%',
        fontSize: '11px',
    },
    refHeader: {
        backgroundColor: '#E07020',
        color: 'white',
        padding: '4px 6px',
        fontWeight: tokens.fontWeightSemibold,
        textAlign: 'center',
        fontSize: '10px',
        border: '1px solid #C55A10',
    },
    refCell: {
        border: '1px solid #ccc',
        padding: '4px 6px',
        fontSize: '10px',
        textAlign: 'center',
    },
    refCellLeft: {
        border: '1px solid #ccc',
        padding: '4px 6px',
        fontSize: '10px',
        textAlign: 'left',
    },
    legendBox: {
        padding: tokens.spacingVerticalS,
        backgroundColor: '#f5f5f5',
        borderRadius: tokens.borderRadiusMedium,
    },
    legendTitle: {
        fontWeight: tokens.fontWeightBold,
        fontSize: '12px',
        marginBottom: tokens.spacingVerticalS,
        color: '#E07020',
    },
    legendItem: {
        fontSize: '10px',
        marginBottom: '2px',
    },
    matrixBox: {
        padding: tokens.spacingVerticalS,
    },
    matrixTitle: {
        fontWeight: tokens.fontWeightBold,
        fontSize: '12px',
        marginBottom: tokens.spacingVerticalS,
        color: '#E07020',
        textAlign: 'center',
    },
    matrixTable: {
        borderCollapse: 'collapse',
        width: '100%',
    },
    matrixCell: {
        border: '1px solid #ccc',
        padding: '4px',
        textAlign: 'center',
        fontWeight: tokens.fontWeightBold,
        fontSize: '10px',
        color: 'white',
        minWidth: '24px',
    },
    matrixHeaderCell: {
        border: '1px solid #ccc',
        padding: '4px',
        textAlign: 'center',
        fontWeight: tokens.fontWeightBold,
        fontSize: '9px',
        backgroundColor: '#666',
        color: 'white',
    },
    legendColorBox: {
        display: 'inline-block',
        padding: '2px 6px',
        marginRight: '4px',
        marginTop: '4px',
        borderRadius: '2px',
        fontSize: '9px',
        color: 'white',
    },
});

const HiraViewPage: React.FC = () => {
    const styles = useStyles();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [hira, setHira] = useState<HiraJsa | null>(null);

    useEffect(() => {
        if (id) {
            loadHira(id);
        }
    }, [id]);

    const loadHira = async (hiraId: string) => {
        setLoading(true);
        try {
            const response = await hiraService.getHiraById(hiraId);
            if (response.success) {
                setHira(response.data);
            }
        } catch (error: any) {
            toast.error('Failed to load HIRA');
            navigate('/hira');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        if (hira?.isLocked) {
            toast.error('Cannot edit a locked HIRA');
            return;
        }
        navigate(`/hira/${id}/edit`);
    };

    const handleClone = async () => {
        if (!id || !hira) return;
        try {
            const response = await hiraService.cloneHira(id);
            if (response.success) {
                toast.success(`HIRA cloned as ${response.data.hiraNumber}`);
                navigate(`/hira/${response.data._id}/edit`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to clone');
        }
    };

    const handleExportPdf = async () => {
        if (!id || !hira) return;
        try {
            toast.loading('Generating PDF...');
            await hiraService.downloadHiraPdf(id, hira.hiraNumber);
            toast.dismiss();
            toast.success('PDF downloaded');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to export PDF');
        }
    };

    const handleExportExcel = async () => {
        if (!id || !hira) return;
        try {
            toast.loading('Generating Excel...');
            await hiraService.downloadHiraExcel(id, hira.hiraNumber);
            toast.dismiss();
            toast.success('Excel downloaded');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to export Excel');
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
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <Spinner size="large" label="Loading HIRA..." />
                </div>
            </div>
        );
    }

    if (!hira) {
        return (
            <div className={styles.container}>
                <Text>HIRA not found</Text>
            </div>
        );
    }

    const riskSummary = getRiskSummary();

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Button
                    icon={<ArrowLeft24Regular />}
                    appearance="subtle"
                    onClick={() => navigate('/hira')}
                >
                    Back
                </Button>
                <div className={styles.hiraBadge}>
                    <span className={styles.hiraNumber}>{hira.hiraNumber.split('-')[2] || '##'}</span>
                    HIRA JSA
                </div>
                <Text className={styles.title}>
                    Hazard Identification, Risk & Opportunity Assessment
                </Text>
                <div className={styles.actionButtons}>
                    <Button icon={<Copy24Regular />} onClick={handleClone}>Clone</Button>
                    <Menu>
                        <MenuTrigger disableButtonEnhancement>
                            <Button icon={<ArrowDownload24Regular />} iconPosition="after">
                                Export <ChevronDown20Regular />
                            </Button>
                        </MenuTrigger>
                        <MenuPopover>
                            <MenuList>
                                <MenuItem icon={<DocumentPdf24Regular />} onClick={handleExportPdf}>
                                    Export as PDF
                                </MenuItem>
                                <MenuItem icon={<ArrowDownload24Regular />} onClick={handleExportExcel}>
                                    Export as Excel
                                </MenuItem>
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                    {!hira.isLocked && (
                        <Button appearance="primary" icon={<Edit24Regular />} onClick={handleEdit}>
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            {/* Risk Summary Card */}
            <Card className={styles.summaryCard}>
                <Text weight="semibold">Risk Summary ({hira.rows.length} tasks)</Text>
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

            {/* Job Header Card */}
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

            {/* Reference Section - Severity, Likelihood, Risk Level, Legends, Matrix */}
            <Card className={styles.referenceCard}>
                <Text className={styles.referenceTitle}>Risk Assessment Reference Guide</Text>
                <div className={styles.referenceGrid}>
                    {/* Left: Severity & Likelihood Table */}
                    <div>
                        <table className={styles.refTable}>
                            <thead>
                                <tr>
                                    <th className={styles.refHeader}>SEVERITY</th>
                                    <th className={styles.refHeader}>RATING</th>
                                    <th className={styles.refHeader}>LIKELIHOOD</th>
                                    <th className={styles.refHeader}>RATING</th>
                                    <th className={styles.refHeader}>RISK SCORE</th>
                                    <th className={styles.refHeader}>RISK LEVEL</th>
                                    <th className={styles.refHeader}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className={styles.refCellLeft}>MULTIPLE FATALITY</td>
                                    <td className={styles.refCell}>5</td>
                                    <td className={styles.refCellLeft}>ALMOST CERTAIN</td>
                                    <td className={styles.refCell}>5</td>
                                    <td className={styles.refCell}>20-25</td>
                                    <td className={styles.refCell} style={{ backgroundColor: '#FF0000', color: 'white' }}>EXTREME HIGH</td>
                                    <td className={styles.refCellLeft}>ECM + ACM</td>
                                </tr>
                                <tr>
                                    <td className={styles.refCellLeft}>SINGLE FATALITY</td>
                                    <td className={styles.refCell}>4</td>
                                    <td className={styles.refCellLeft}>QUITE POSSIBLE</td>
                                    <td className={styles.refCell}>4</td>
                                    <td className={styles.refCell}>12-16</td>
                                    <td className={styles.refCell} style={{ backgroundColor: '#FF8000', color: 'white' }}>HIGH</td>
                                    <td className={styles.refCellLeft}>ECM + ACM</td>
                                </tr>
                                <tr>
                                    <td className={styles.refCellLeft}>SERIOUS INJURY</td>
                                    <td className={styles.refCell}>3</td>
                                    <td className={styles.refCellLeft}>UNUSUAL BUT POSSIBLE</td>
                                    <td className={styles.refCell}>3</td>
                                    <td className={styles.refCell}>5-10</td>
                                    <td className={styles.refCell} style={{ backgroundColor: '#FFC000' }}>MODERATE</td>
                                    <td className={styles.refCellLeft}>ECM + ACM</td>
                                </tr>
                                <tr>
                                    <td className={styles.refCellLeft}>MINOR INJURY</td>
                                    <td className={styles.refCell}>2</td>
                                    <td className={styles.refCellLeft}>UNLIKELY</td>
                                    <td className={styles.refCell}>2</td>
                                    <td className={styles.refCell}>1-4</td>
                                    <td className={styles.refCell} style={{ backgroundColor: '#00B050', color: 'white' }}>LOW</td>
                                    <td className={styles.refCellLeft}>ECM</td>
                                </tr>
                                <tr>
                                    <td className={styles.refCellLeft}>FIRST AID</td>
                                    <td className={styles.refCell}>1</td>
                                    <td className={styles.refCellLeft}>VERY UNLIKELY</td>
                                    <td className={styles.refCell}>1</td>
                                    <td className={styles.refCell}></td>
                                    <td className={styles.refCell}></td>
                                    <td className={styles.refCellLeft}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Middle: Legends */}
                    <div className={styles.legendBox}>
                        <div className={styles.legendTitle}>LEGENDS</div>
                        <div className={styles.legendItem}><strong>L</strong> : LOW</div>
                        <div className={styles.legendItem}><strong>LIK</strong> : LIKELIHOOD</div>
                        <div className={styles.legendItem}><strong>M</strong> : MODERATE</div>
                        <div className={styles.legendItem}><strong>S</strong> : SEVERITY</div>
                        <div className={styles.legendItem}><strong>H</strong> : HIGH</div>
                        <div className={styles.legendItem}><strong>RS</strong> : RISK SCORE</div>
                        <div className={styles.legendItem}><strong>EH</strong> : EXTREME HIGH</div>
                        <div className={styles.legendItem}><strong>RL</strong> : RISK LEVEL</div>
                    </div>

                    {/* Right: Risk Rating Matrix */}
                    <div className={styles.matrixBox}>
                        <div className={styles.matrixTitle}>RISK RATING MATRIX</div>
                        <table className={styles.matrixTable}>
                            <tbody>
                                <tr>
                                    <td className={styles.matrixHeaderCell} rowSpan={6} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>SEVERITY</td>
                                    <td className={styles.matrixHeaderCell}></td>
                                    <td className={styles.matrixHeaderCell}>1</td>
                                    <td className={styles.matrixHeaderCell}>2</td>
                                    <td className={styles.matrixHeaderCell}>3</td>
                                    <td className={styles.matrixHeaderCell}>4</td>
                                    <td className={styles.matrixHeaderCell}>5</td>
                                </tr>
                                {[5, 4, 3, 2, 1].map(sev => (
                                    <tr key={sev}>
                                        <td className={styles.matrixHeaderCell}>{sev}</td>
                                        {[1, 2, 3, 4, 5].map(lik => {
                                            const score = sev * lik;
                                            let bgColor = '#00B050';
                                            if (score >= 16) bgColor = '#FF0000';
                                            else if (score >= 11) bgColor = '#FF8000';
                                            else if (score >= 6) bgColor = '#FFC000';
                                            return (
                                                <td key={lik} className={styles.matrixCell} style={{ backgroundColor: bgColor }}>
                                                    {score}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '9px' }}>
                            <span className={styles.legendColorBox} style={{ backgroundColor: '#00B050' }}>1-4 LOW</span>
                            <span className={styles.legendColorBox} style={{ backgroundColor: '#FFC000', color: '#333' }}>5-10 MODERATE</span>
                            <span className={styles.legendColorBox} style={{ backgroundColor: '#FF8000' }}>11-15 HIGH</span>
                            <span className={styles.legendColorBox} style={{ backgroundColor: '#FF0000' }}>16-25 EXTREME</span>
                        </div>
                        <div style={{ marginTop: '4px', textAlign: 'center', fontSize: '9px', color: '#666' }}>
                            → PROBABILITY
                        </div>
                    </div>
                </div>
            </Card>

            {/* HIRA Rows */}
            <div className={styles.rowsContainer}>
                {hira.rows.map((row, rowIndex) => {
                    const showACM = row.riskLevel ? isACMRequired(row.riskLevel) : false;

                    return (
                        <Card key={row._id || rowIndex} className={styles.rowCard}>
                            {/* Row Header */}
                            <div className={styles.rowHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                                    <Badge appearance="filled" color="brand" size="large">
                                        {row.serialNo}
                                    </Badge>
                                    <Text weight="semibold">{row.taskActivity}</Text>
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
                                            <Text size={200} style={{ fontStyle: 'italic', color: tokens.colorNeutralForeground3 }}>No hazards listed</Text>
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
                                            <Text size={200} style={{ fontStyle: 'italic', color: tokens.colorNeutralForeground3 }}>No risks listed</Text>
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
                                            <Text size={200} style={{ fontStyle: 'italic', color: tokens.colorNeutralForeground3 }}>No ECM listed</Text>
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

                                    {/* Opportunity - Only shown in ACM section */}
                                    {row.opportunity && (
                                        <div style={{ marginBottom: tokens.spacingVerticalS }}>
                                            <span className={styles.fieldLabel}>Opportunity: </span>
                                            <Badge appearance="outline">{row.opportunity}</Badge>
                                        </div>
                                    )}

                                    <div className={styles.listContainerGreen}>
                                        {row.additionalControlMeasures.length > 0 ? (
                                            row.additionalControlMeasures.map((a, i) => (
                                                <div key={i} className={styles.listItem}>• {a}</div>
                                            ))
                                        ) : (
                                            <Text size={200} style={{ fontStyle: 'italic', color: tokens.colorNeutralForeground3 }}>No ACM listed</Text>
                                        )}
                                    </div>

                                    {/* Residual Risk */}
                                    {(row.residualLikelihood || row.residualSeverity) && (
                                        <div className={styles.residualSection}>
                                            <div className={styles.fieldGroup}>
                                                <span className={styles.riskLabel}>Residual Likelihood</span>
                                                <div className={styles.riskValue}>{row.residualLikelihood || '-'}</div>
                                            </div>
                                            <div className={styles.fieldGroup}>
                                                <span className={styles.riskLabel}>Residual Severity</span>
                                                <div className={styles.riskValue}>{row.residualSeverity || '-'}</div>
                                            </div>
                                            <div className={styles.fieldGroup}>
                                                <span className={styles.riskLabel}>Residual RS</span>
                                                <div className={styles.riskScore} style={{ backgroundColor: row.residualRiskLevel ? getRiskLevelBgColor(row.residualRiskLevel) : '#e0e0e0' }}>
                                                    {row.residualRiskScore || '-'}
                                                </div>
                                            </div>
                                            <div className={styles.fieldGroup}>
                                                <span className={styles.riskLabel}>Residual RL</span>
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
                                    marginTop: tokens.spacingVerticalS,
                                    padding: tokens.spacingVerticalXS,
                                    backgroundColor: '#e8f5e9',
                                    borderRadius: tokens.borderRadiusMedium,
                                    color: '#2e7d32',
                                    fontSize: tokens.fontSizeBase200
                                }}>
                                    ✓ Risk level is {row.riskLevel} - No additional control measures required
                                </div>
                            )}

                            {/* Responsibility - Always visible for all rows */}
                            {row.responsibility && (
                                <div style={{ marginTop: tokens.spacingVerticalS, padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: tokens.borderRadiusMedium }}>
                                    <span className={styles.fieldLabel}>Responsibility (Name & Designation): </span>
                                    <Text>{row.responsibility}</Text>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div >
    );
};

export default HiraViewPage;
