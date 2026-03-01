/**
 * HIRA JSA Form Page - Improved Version
 * 
 * Features:
 * - Responsive card-based layout (no horizontal scroll)
 * - Add/remove buttons for array fields (hazards, risks, ECM, ACM)
 * - Conditional ACM section (only shows for Moderate/High/Extreme risk)
 * - Styled input fields with background colors
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Button,
    Input,
    Text,
    Spinner,
    Card,
    Badge,
    Tooltip,
    Dropdown,
    Option,
} from '@fluentui/react-components';
import {
    ArrowLeft24Regular,
    Save24Regular,
    Add24Regular,
    Add16Regular,
    Delete24Regular,
    Delete16Regular,
} from '@fluentui/react-icons';
import toast from 'react-hot-toast';
import {
    HiraRow,
    HiraJobHeader,
    CreateHiraRequest,
    OPPORTUNITY_OPTIONS,
    RiskLevel,
    OpportunityOption,
    calculateRiskScorePreview,
    getRiskLevelPreview,
    getRiskLevelColor,
    getRiskLevelBgColor,
    createEmptyHiraRow,
    createEmptyJobHeader,
} from '../../models/hiraJsa.types';
import hiraService from '../../services/hiraService';
import { useUser } from '@/context';

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
    actionButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
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
        color: tokens.colorNeutralForeground2,
    },
    fieldInput: {
        backgroundColor: '#f8f9fa',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
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
    rowNumber: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightBold,
        color: '#E07020',
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
    // Array Field (Hazards, Risks, etc)
    arrayField: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    arrayHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    arrayItems: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    arrayItem: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
        alignItems: 'center',
    },
    arrayInput: {
        flex: 1,
        backgroundColor: '#fff3e0',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    arrayInputGreen: {
        flex: 1,
        backgroundColor: '#e8f5e9',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    addItemBtn: {
        minWidth: 'auto',
        padding: '2px 8px',
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
    riskInput: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
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
        fontSize: tokens.fontSizeBase300,
        color: 'white',
    },
    // ACM Section (Conditional)
    acmSection: {
        marginTop: tokens.spacingVerticalM,
        padding: tokens.spacingVerticalS,
        backgroundColor: '#e8f5e9',
        borderRadius: tokens.borderRadiusMedium,
        border: '2px dashed #4caf50',
    },
    acmTitle: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        color: '#2e7d32',
        marginBottom: tokens.spacingVerticalS,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
    },
    // Residual Risk Section
    residualSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalS,
        backgroundColor: '#e3f2fd',
        borderRadius: tokens.borderRadiusMedium,
        marginTop: tokens.spacingVerticalS,
    },
    // Other
    opportunitySection: {
        marginTop: tokens.spacingVerticalS,
    },
    responsibilitySection: {
        marginTop: tokens.spacingVerticalS,
    },
    addRowButton: {
        marginTop: tokens.spacingVerticalL,
        marginBottom: tokens.spacingVerticalL,
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
    },
    riskWarning: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: tokens.spacingVerticalXS,
        borderRadius: tokens.borderRadiusMedium,
        fontSize: tokens.fontSizeBase200,
        marginTop: tokens.spacingVerticalXS,
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

const HiraFormPage: React.FC = () => {
    const styles = useStyles();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const { user } = useUser();

    // State
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hiraNumber, setHiraNumber] = useState<string>('');
    const [jobHeader, setJobHeader] = useState<HiraJobHeader>(() => ({
        ...createEmptyJobHeader(),
        preparedBy: user?.name || '', // Auto-populate with logged-in user's name
    }));
    const [rows, setRows] = useState<Omit<HiraRow, '_id' | 'riskScore' | 'riskLevel' | 'residualRiskScore' | 'residualRiskLevel'>[]>([
        { ...createEmptyHiraRow(), serialNo: 1 },
    ]);

    // Load data
    useEffect(() => {
        if (isEditMode && id) {
            loadHira(id);
        } else {
            loadNextNumber();
        }
    }, [id, isEditMode]);

    const loadNextNumber = async () => {
        try {
            const response = await hiraService.getNextHiraNumber();
            if (response.success) {
                setHiraNumber(response.data.hiraNumber);
            }
        } catch (error) {
            console.error('Failed to load HIRA number:', error);
        }
    };

    const loadHira = async (hiraId: string) => {
        setLoading(true);
        try {
            const response = await hiraService.getHiraById(hiraId);
            if (response.success) {
                const hira = response.data;
                setHiraNumber(hira.hiraNumber);
                setJobHeader(hira.jobHeader);
                setRows(hira.rows.map(row => ({
                    serialNo: row.serialNo,
                    taskActivity: row.taskActivity,
                    hazards: row.hazards || [],
                    risks: row.risks || [],
                    existingControlMeasures: row.existingControlMeasures || [],
                    likelihood: row.likelihood,
                    severity: row.severity,
                    opportunity: row.opportunity || '',
                    additionalControlMeasures: row.additionalControlMeasures || [],
                    residualLikelihood: row.residualLikelihood,
                    residualSeverity: row.residualSeverity,
                    responsibility: row.responsibility || '',
                })));
            }
        } catch (error: any) {
            toast.error('Failed to load HIRA');
            navigate('/hira');
        } finally {
            setLoading(false);
        }
    };

    // Row management
    const addRow = () => {
        setRows([...rows, { ...createEmptyHiraRow(), serialNo: rows.length + 1 }]);
    };

    const removeRow = (index: number) => {
        if (rows.length <= 1) {
            toast.error('At least one row is required');
            return;
        }
        const newRows = rows.filter((_, i) => i !== index);
        newRows.forEach((row, i) => { row.serialNo = i + 1; });
        setRows(newRows);
    };

    const updateRow = (index: number, field: string, value: any) => {
        const newRows = [...rows];
        const row = newRows[index];
        if (row) {
            (row as any)[field] = value;
            setRows(newRows);
        }
    };

    // Array field management
    const addArrayItem = (rowIndex: number, field: string) => {
        const newRows = [...rows];
        const row = newRows[rowIndex];
        if (row) {
            const arr = (row as any)[field] as string[];
            arr.push('');
            setRows(newRows);
        }
    };

    const updateArrayItem = (rowIndex: number, field: string, itemIndex: number, value: string) => {
        const newRows = [...rows];
        const row = newRows[rowIndex];
        if (row) {
            const arr = (row as any)[field] as string[];
            arr[itemIndex] = value;
            setRows(newRows);
        }
    };

    const removeArrayItem = (rowIndex: number, field: string, itemIndex: number) => {
        const newRows = [...rows];
        const row = newRows[rowIndex];
        if (row) {
            const arr = (row as any)[field] as string[];
            arr.splice(itemIndex, 1);
            setRows(newRows);
        }
    };

    const getPreviewRisk = (likelihood: number, severity: number) => {
        const score = calculateRiskScorePreview(likelihood, severity);
        const level = getRiskLevelPreview(score);
        return { score, level };
    };

    // Check if ACM is required (Moderate or higher)
    const isACMRequired = (level: RiskLevel): boolean => {
        return level === 'Medium' || level === 'High' || level === 'Extreme';
    };

    // Save
    const handleSave = async () => {
        if (!jobHeader.area || !jobHeader.jobType || !jobHeader.jobDetails || !jobHeader.preparedBy) {
            toast.error('Please fill in all job header fields');
            return;
        }

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row?.taskActivity) {
                toast.error(`Row ${i + 1}: Task/Activity is required`);
                return;
            }
            if (!row.likelihood || !row.severity) {
                toast.error(`Row ${i + 1}: Likelihood and Severity are required`);
                return;
            }
        }

        setSaving(true);
        try {
            const data: CreateHiraRequest = {
                jobHeader,
                rows: rows.map(row => ({
                    taskActivity: row.taskActivity,
                    hazards: row.hazards.filter(h => h.trim()),
                    risks: row.risks.filter(r => r.trim()),
                    existingControlMeasures: row.existingControlMeasures.filter(e => e.trim()),
                    likelihood: row.likelihood,
                    severity: row.severity,
                    opportunity: row.opportunity as OpportunityOption | '',
                    additionalControlMeasures: row.additionalControlMeasures.filter(a => a.trim()),
                    residualLikelihood: row.residualLikelihood,
                    residualSeverity: row.residualSeverity,
                    responsibility: row.responsibility,
                })),
            };

            let response;
            if (isEditMode && id) {
                response = await hiraService.updateHira(id, data);
            } else {
                response = await hiraService.createHira(data);
            }

            if (response.success) {
                toast.success(isEditMode ? 'HIRA updated successfully' : 'HIRA created successfully');
                navigate('/hira');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save HIRA');
        } finally {
            setSaving(false);
        }
    };

    // Render array field with add button
    const renderArrayField = (
        rowIndex: number,
        field: string,
        label: string,
        items: string[],
        placeholder: string,
        isGreen: boolean = false
    ) => (
        <div className={styles.arrayField}>
            <div className={styles.arrayHeader}>
                <span className={styles.fieldLabel}>{label}</span>
                <Button
                    icon={<Add16Regular />}
                    appearance="subtle"
                    size="small"
                    className={styles.addItemBtn}
                    onClick={() => addArrayItem(rowIndex, field)}
                >
                    Add
                </Button>
            </div>
            <div className={styles.arrayItems}>
                {items.length === 0 ? (
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3, fontStyle: 'italic' }}>
                        Click "Add" to add {label.toLowerCase()}
                    </Text>
                ) : (
                    items.map((item, itemIndex) => (
                        <div key={itemIndex} className={styles.arrayItem}>
                            <Input
                                className={isGreen ? styles.arrayInputGreen : styles.arrayInput}
                                value={item}
                                onChange={(e) => updateArrayItem(rowIndex, field, itemIndex, e.target.value)}
                                placeholder={`${placeholder} ${itemIndex + 1}`}
                            />
                            <Tooltip content="Remove" relationship="label">
                                <Button
                                    icon={<Delete16Regular />}
                                    appearance="subtle"
                                    size="small"
                                    onClick={() => removeArrayItem(rowIndex, field, itemIndex)}
                                />
                            </Tooltip>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <Spinner size="large" label="Loading HIRA..." />
                </div>
            </div>
        );
    }

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
                    <span className={styles.hiraNumber}>{hiraNumber.split('-')[2] || '##'}</span>
                    HIRA JSA
                </div>
                <Text className={styles.title}>
                    Hazard Identification, Risk & Opportunity Assessment
                </Text>
                <div className={styles.actionButtons}>
                    <Button
                        appearance="primary"
                        icon={<Save24Regular />}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save HIRA'}
                    </Button>
                </div>
            </div>

            {/* Job Header Card */}
            <Card className={styles.jobHeaderCard}>
                <Text className={styles.jobHeaderTitle}>Job Information</Text>
                <div className={styles.jobHeaderGrid}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Area *</label>
                        <Input
                            className={styles.fieldInput}
                            value={jobHeader.area}
                            onChange={(e) => setJobHeader({ ...jobHeader, area: e.target.value })}
                            placeholder="e.g., Bhilai Plant - Section A"
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Job Type *</label>
                        <Input
                            className={styles.fieldInput}
                            value={jobHeader.jobType}
                            onChange={(e) => setJobHeader({ ...jobHeader, jobType: e.target.value })}
                            placeholder="e.g., Maintenance Work"
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Job Details *</label>
                        <Input
                            className={styles.fieldInput}
                            value={jobHeader.jobDetails}
                            onChange={(e) => setJobHeader({ ...jobHeader, jobDetails: e.target.value })}
                            placeholder="Describe the work to be performed"
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Prepared By *</label>
                        <Input
                            className={styles.fieldInput}
                            value={jobHeader.preparedBy}
                            onChange={(e) => setJobHeader({ ...jobHeader, preparedBy: e.target.value })}
                            placeholder="Name of person preparing this HIRA"
                        />
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
                                    <td className={styles.refCell} style={{ backgroundColor: '#FF0000', color: 'white' }}>EXTREME HIGH (UNACCEPTABLE)</td>
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
                                    <td className={styles.refCellLeft}>SERIOUS INJURY / OCCUPATIONAL DISEASE</td>
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
                                    <td className={styles.refCell} style={{ backgroundColor: '#00B050', color: 'white' }}>LOW (ACCEPTABLE)</td>
                                    <td className={styles.refCellLeft}>ECM</td>
                                </tr>
                                <tr>
                                    <td className={styles.refCellLeft}>FIRST AID / NEGLIGIBLE</td>
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
                {rows.map((row, rowIndex) => {
                    const initialRisk = getPreviewRisk(row.likelihood, row.severity);
                    const showACM = isACMRequired(initialRisk.level);
                    const residualRisk = row.residualLikelihood && row.residualSeverity
                        ? getPreviewRisk(row.residualLikelihood, row.residualSeverity)
                        : { score: 0, level: '' as RiskLevel };

                    return (
                        <Card key={rowIndex} className={styles.rowCard}>
                            {/* Row Header */}
                            <div className={styles.rowHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                                    <Badge appearance="filled" color="brand" size="large">
                                        {row.serialNo}
                                    </Badge>
                                    <Text weight="semibold">Task / Activity</Text>
                                </div>
                                <Tooltip content="Delete this row" relationship="label">
                                    <Button
                                        icon={<Delete24Regular />}
                                        appearance="subtle"
                                        onClick={() => removeRow(rowIndex)}
                                        disabled={rows.length <= 1}
                                    />
                                </Tooltip>
                            </div>

                            {/* Task Activity */}
                            <div className={styles.fieldGroup} style={{ marginBottom: tokens.spacingVerticalM }}>
                                <Input
                                    className={styles.fieldInput}
                                    value={row.taskActivity}
                                    onChange={(e) => updateRow(rowIndex, 'taskActivity', e.target.value)}
                                    placeholder="Describe the task or activity..."
                                    style={{ backgroundColor: '#fff3e0' }}
                                />
                            </div>

                            {/* Hazards, Risks, ECM Grid - 3 equal columns */}
                            <div className={styles.rowGrid}>
                                <div>
                                    {renderArrayField(rowIndex, 'hazards', 'Hazards', row.hazards, 'Hazard')}
                                </div>
                                <div>
                                    {renderArrayField(rowIndex, 'risks', 'Risks', row.risks, 'Risk')}
                                </div>
                                <div>
                                    {renderArrayField(rowIndex, 'existingControlMeasures', 'Existing Control Measures (ECM)', row.existingControlMeasures, 'Control measure')}
                                </div>
                            </div>

                            {/* Risk Assessment Section */}
                            <div className={styles.riskSection}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.riskLabel}>Likelihood (1-5)</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={5}
                                        className={styles.riskInput}
                                        value={String(row.likelihood || '')}
                                        onChange={(e) => updateRow(rowIndex, 'likelihood', Number(e.target.value))}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.riskLabel}>Severity (1-5)</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={5}
                                        className={styles.riskInput}
                                        value={String(row.severity || '')}
                                        onChange={(e) => updateRow(rowIndex, 'severity', Number(e.target.value))}
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.riskLabel}>Risk Score</label>
                                    <div
                                        className={styles.riskScore}
                                        style={{ backgroundColor: getRiskLevelBgColor(initialRisk.level) }}
                                    >
                                        {initialRisk.score || '-'}
                                    </div>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.riskLabel}>Risk Level</label>
                                    <div
                                        className={styles.riskLevel}
                                        style={{ backgroundColor: getRiskLevelColor(initialRisk.level) || '#ccc' }}
                                    >
                                        {initialRisk.level ? initialRisk.level.charAt(0) : '-'}
                                    </div>
                                </div>
                            </div>

                            {/* ACM Section - Only shows when risk is Moderate or higher */}
                            {showACM && (
                                <div className={styles.acmSection}>
                                    <div className={styles.acmTitle}>
                                        ⚠️ Additional Control Measures Required (Risk: {initialRisk.level})
                                    </div>

                                    {/* Opportunity - Only shown in ACM section */}
                                    <div className={styles.fieldGroup} style={{ marginBottom: tokens.spacingVerticalM }}>
                                        <label className={styles.fieldLabel}>Opportunity</label>
                                        <Dropdown
                                            value={row.opportunity || ''}
                                            onOptionSelect={(_, data) => updateRow(rowIndex, 'opportunity', data.optionValue)}
                                            placeholder="Select opportunity..."
                                            style={{ backgroundColor: '#e8f5e9' }}
                                        >
                                            <Option value="">Select...</Option>
                                            {OPPORTUNITY_OPTIONS.map(opt => (
                                                <Option key={opt} value={opt}>{opt}</Option>
                                            ))}
                                        </Dropdown>
                                    </div>

                                    {renderArrayField(rowIndex, 'additionalControlMeasures', 'Additional Control Measures (ACM)', row.additionalControlMeasures, 'Additional control', true)}

                                    {/* Residual Risk */}
                                    <div className={styles.residualSection}>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.riskLabel}>Residual Likelihood</label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={5}
                                                className={styles.riskInput}
                                                value={String(row.residualLikelihood || '')}
                                                onChange={(e) => updateRow(rowIndex, 'residualLikelihood', e.target.value ? Number(e.target.value) : null)}
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.riskLabel}>Residual Severity</label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={5}
                                                className={styles.riskInput}
                                                value={String(row.residualSeverity || '')}
                                                onChange={(e) => updateRow(rowIndex, 'residualSeverity', e.target.value ? Number(e.target.value) : null)}
                                            />
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.riskLabel}>Residual RS</label>
                                            <div
                                                className={styles.riskScore}
                                                style={{ backgroundColor: residualRisk.level ? getRiskLevelBgColor(residualRisk.level) : '#e0e0e0' }}
                                            >
                                                {residualRisk.score || '-'}
                                            </div>
                                        </div>
                                        <div className={styles.fieldGroup}>
                                            <label className={styles.riskLabel}>Residual RL</label>
                                            <div
                                                className={styles.riskLevel}
                                                style={{ backgroundColor: residualRisk.level ? getRiskLevelColor(residualRisk.level) : '#ccc' }}
                                            >
                                                {residualRisk.level ? residualRisk.level.charAt(0) : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warning for non-ACM rows when risk is low */}
                            {!showACM && initialRisk.level && (
                                <div style={{
                                    marginTop: tokens.spacingVerticalS,
                                    padding: tokens.spacingVerticalXS,
                                    backgroundColor: '#e8f5e9',
                                    borderRadius: tokens.borderRadiusMedium,
                                    color: '#2e7d32',
                                    fontSize: tokens.fontSizeBase200
                                }}>
                                    ✓ Risk level is {initialRisk.level} - No additional control measures required
                                </div>
                            )}

                            {/* Responsibility - Always visible for all rows */}
                            <div className={styles.responsibilitySection}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Responsibility (Name & Designation)</label>
                                    <Input
                                        className={styles.fieldInput}
                                        value={row.responsibility || ''}
                                        onChange={(e) => updateRow(rowIndex, 'responsibility', e.target.value)}
                                        placeholder="Person responsible for this task"
                                        style={{ backgroundColor: '#f8f9fa' }}
                                    />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Add Row Button */}
            <Button
                icon={<Add24Regular />}
                appearance="primary"
                className={styles.addRowButton}
                onClick={addRow}
                size="large"
            >
                Add New Task / Activity
            </Button>
        </div>
    );
};

export default HiraFormPage;
