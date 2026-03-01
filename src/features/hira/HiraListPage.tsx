/**
 * HIRA JSA List Page
 * 
 * Displays all HIRA records with filtering, pagination, and actions
 * including view, edit, clone, export, and delete.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
    Input,
    Badge,
    Spinner,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Tooltip,
    Divider,
} from '@fluentui/react-components';
import {
    Add24Regular,
    Search24Regular,
    ArrowClockwise24Regular,
    MoreHorizontal24Regular,
    Eye24Regular,
    Edit24Regular,
    Delete24Regular,
    Copy24Regular,
    DocumentPdf24Regular,
    ArrowDownload24Regular,
    Star24Regular,
    Star24Filled,
    ChevronLeft24Regular,
    ChevronRight24Regular,
} from '@fluentui/react-icons';
import toast from 'react-hot-toast';
import {
    HiraJsa,
    getRiskLevelColor,
} from '../../models/hiraJsa.types';
import hiraService from '../../services/hiraService';

const useStyles = makeStyles({
    container: {
        padding: tokens.spacingHorizontalL,
        maxWidth: '1400px',
        margin: '0 auto',
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalM,
        },
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalL,
        flexWrap: 'wrap',
        gap: tokens.spacingVerticalM,
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
        },
    },
    title: {
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    titleBadge: {
        backgroundColor: '#E07020',
        color: 'white',
        padding: '4px 12px',
        borderRadius: tokens.borderRadiusMedium,
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
    },
    controls: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        alignItems: 'center',
        flexWrap: 'wrap',
        '@media (max-width: 768px)': {
            width: '100%',
        },
    },
    searchInput: {
        minWidth: '250px',
        '@media (max-width: 768px)': {
            minWidth: '100%',
            flex: 1,
        },
    },
    filterDropdown: {
        minWidth: '150px',
    },
    tableCard: {
        padding: tokens.spacingHorizontalM,
        overflow: 'hidden',
        '@media (max-width: 768px)': {
            padding: 0,
        },
    },
    table: {
        width: '100%',
        '@media (max-width: 768px)': {
            display: 'none',
        },
    },
    // Hide on tablet (< 1024px)
    hideOnTablet: {
        '@media (max-width: 1024px)': {
            display: 'none',
        },
    },
    // Hide on small tablet (< 900px)
    hideOnSmallTablet: {
        '@media (max-width: 900px)': {
            display: 'none',
        },
    },
    statusBadge: {
        padding: '4px 8px',
        borderRadius: tokens.borderRadiusMedium,
        fontSize: tokens.fontSizeBase100,
        fontWeight: tokens.fontWeightSemibold,
    },
    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: tokens.spacingVerticalM,
        padding: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
        },
    },
    paginationInfo: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    paginationButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        alignItems: 'center',
    },
    emptyState: {
        textAlign: 'center',
        padding: tokens.spacingVerticalXXL,
        color: tokens.colorNeutralForeground3,
    },
    riskSummary: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
    },
    riskDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: tokens.spacingVerticalXXL,
    },
    rowHover: {
        cursor: 'pointer',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
        },
    },
    // Mobile Card List (visible only on mobile < 768px)
    mobileCardList: {
        display: 'none',
        '@media (max-width: 768px)': {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalS,
            padding: tokens.spacingHorizontalM,
        },
    },
    mobileCard: {
        padding: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        boxShadow: tokens.shadow2,
        cursor: 'pointer',
        ':active': {
            backgroundColor: tokens.colorNeutralBackground1Pressed,
        },
    },
    mobileCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: tokens.spacingHorizontalS,
    },
    mobileCardTitle: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
    },
    mobileCardBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    mobileCardRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: tokens.fontSizeBase200,
        gap: tokens.spacingHorizontalS,
    },
    mobileCardLabel: {
        color: tokens.colorNeutralForeground3,
        fontWeight: tokens.fontWeightSemibold,
        minWidth: '80px',
    },
    mobileCardValue: {
        color: tokens.colorNeutralForeground1,
        textAlign: 'right' as const,
        flex: 1,
    },
    mobileCardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: tokens.spacingVerticalXS,
        paddingTop: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    },
});

const HiraListPage: React.FC = () => {
    const styles = useStyles();
    const navigate = useNavigate();

    // State
    const [hiras, setHiras] = useState<HiraJsa[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        total: 1,
        count: 0,
        totalRecords: 0,
        hasNext: false,
        hasPrev: false,
    });

    // Delete dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [hiraToDelete, setHiraToDelete] = useState<HiraJsa | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Load HIRAs
    const loadHiras = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await hiraService.getAllHiras({
                page,
                limit: 10,
                search: searchQuery || undefined,
            });

            if (response.success) {
                setHiras(response.data.hiras);
                setPagination(response.data.pagination);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load HIRA records');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        loadHiras();
    }, [loadHiras]);

    // Handle search
    const handleSearch = () => {
        loadHiras(1);
    };

    // Handle create new
    const handleCreate = () => {
        navigate('/hira/new');
    };

    // Handle view
    const handleView = (hira: HiraJsa) => {
        navigate(`/hira/${hira._id}`);
    };

    // Handle edit
    const handleEdit = (hira: HiraJsa) => {
        if (hira.isLocked) {
            toast.error('Cannot edit a locked HIRA');
            return;
        }
        navigate(`/hira/${hira._id}/edit`);
    };

    // Handle clone
    const handleClone = async (hira: HiraJsa) => {
        try {
            const response = await hiraService.cloneHira(hira._id);
            if (response.success) {
                toast.success(`HIRA cloned successfully as ${response.data.hiraNumber}`);
                loadHiras();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to clone HIRA');
        }
    };

    // Handle set as default
    const handleSetDefault = async (hira: HiraJsa) => {
        try {
            const response = await hiraService.setDefaultHira(hira._id);
            if (response.success) {
                toast.success(response.message);
                loadHiras();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to set default HIRA');
        }
    };

    // Handle delete
    const confirmDelete = (hira: HiraJsa) => {
        if (hira.isLocked) {
            toast.error('Cannot delete a locked HIRA');
            return;
        }
        setHiraToDelete(hira);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!hiraToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await hiraService.deleteHira(hiraToDelete._id);
            if (response.success) {
                toast.success('HIRA deleted successfully');
                setIsDeleteDialogOpen(false);
                setHiraToDelete(null);
                loadHiras();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete HIRA');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Handle export PDF
    const handleExportPdf = async (hira: HiraJsa) => {
        try {
            toast.loading('Generating PDF...');
            await hiraService.downloadHiraPdf(hira._id, hira.hiraNumber);
            toast.dismiss();
            toast.success('PDF downloaded successfully');
        } catch (error: any) {
            toast.dismiss();
            toast.error('Failed to export PDF');
        }
    };

    // Handle export Excel
    const handleExportExcel = async (hira: HiraJsa) => {
        try {
            toast.loading('Generating Excel...');
            await hiraService.downloadHiraExcel(hira._id, hira.hiraNumber);
            toast.dismiss();
            toast.success('Excel downloaded successfully');
        } catch (error: any) {
            toast.dismiss();
            toast.error('Failed to export Excel');
        }
    };

    // Get risk summary for a HIRA
    const getRiskSummary = (hira: HiraJsa) => {
        const levels: { [key: string]: number } = { Low: 0, Medium: 0, High: 0, Extreme: 0 };
        hira.rows.forEach(row => {
            if (row.riskLevel) {
                levels[row.riskLevel] = (levels[row.riskLevel] || 0) + 1;
            }
        });
        return levels;
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.title}>
                    <span className={styles.titleBadge}>HIRA</span>
                    Hazard Identification & Risk Assessment
                </div>
                <div className={styles.controls}>
                    <Input
                        className={styles.searchInput}
                        placeholder="Search by HIRA number, area..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        contentBefore={<Search24Regular />}
                    />
                    <Button
                        icon={<ArrowClockwise24Regular />}
                        onClick={() => loadHiras()}
                    >
                        Refresh
                    </Button>
                    <Button
                        appearance="primary"
                        icon={<Add24Regular />}
                        onClick={handleCreate}
                    >
                        Create HIRA
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="medium" label="Loading HIRA records..." />
                    </div>
                ) : hiras.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Text size={400}>No HIRA records found</Text>
                        <br />
                        <Text size={200}>Create your first HIRA to get started</Text>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <Table className={styles.table}>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>HIRA Number</TableHeaderCell>
                                    <TableHeaderCell>Area</TableHeaderCell>
                                    <TableHeaderCell className={styles.hideOnSmallTablet}>Job Type</TableHeaderCell>
                                    <TableHeaderCell className={styles.hideOnTablet}>Prepared By</TableHeaderCell>
                                    <TableHeaderCell className={styles.hideOnSmallTablet}>Rows</TableHeaderCell>
                                    <TableHeaderCell>Risk Summary</TableHeaderCell>
                                    <TableHeaderCell className={styles.hideOnSmallTablet}>Default</TableHeaderCell>
                                    <TableHeaderCell className={styles.hideOnTablet}>Created</TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hiras.map((hira) => {
                                    const riskSummary = getRiskSummary(hira);
                                    return (
                                        <TableRow
                                            key={hira._id}
                                            className={styles.rowHover}
                                            onClick={() => handleView(hira)}
                                        >
                                            <TableCell>
                                                <Text weight="semibold">{hira.hiraNumber}</Text>
                                            </TableCell>
                                            <TableCell>{hira.jobHeader.area}</TableCell>
                                            <TableCell className={styles.hideOnSmallTablet}>{hira.jobHeader.jobType}</TableCell>
                                            <TableCell className={styles.hideOnTablet}>{hira.jobHeader.preparedBy}</TableCell>
                                            <TableCell className={styles.hideOnSmallTablet}>
                                                <Badge appearance="filled" color="brand">{hira.rows.length}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className={styles.riskSummary}>
                                                    {(riskSummary.Low ?? 0) > 0 && (
                                                        <Tooltip content={`${riskSummary.Low ?? 0} Low`} relationship="label">
                                                            <div className={styles.riskDot} style={{ backgroundColor: getRiskLevelColor('Low') }}></div>
                                                        </Tooltip>
                                                    )}
                                                    {(riskSummary.Medium ?? 0) > 0 && (
                                                        <Tooltip content={`${riskSummary.Medium ?? 0} Medium`} relationship="label">
                                                            <div className={styles.riskDot} style={{ backgroundColor: getRiskLevelColor('Medium') }}></div>
                                                        </Tooltip>
                                                    )}
                                                    {(riskSummary.High ?? 0) > 0 && (
                                                        <Tooltip content={`${riskSummary.High ?? 0} High`} relationship="label">
                                                            <div className={styles.riskDot} style={{ backgroundColor: getRiskLevelColor('High') }}></div>
                                                        </Tooltip>
                                                    )}
                                                    {(riskSummary.Extreme ?? 0) > 0 && (
                                                        <Tooltip content={`${riskSummary.Extreme ?? 0} Extreme`} relationship="label">
                                                            <div className={styles.riskDot} style={{ backgroundColor: getRiskLevelColor('Extreme') }}></div>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className={styles.hideOnSmallTablet}>
                                                {hira.isDefault ? (
                                                    <Tooltip content="Default HIRA for permits" relationship="label">
                                                        <Badge
                                                            appearance="filled"
                                                            style={{ backgroundColor: '#E07020', color: 'white' }}
                                                        >
                                                            <Star24Filled style={{ fontSize: '12px', marginRight: '4px' }} />
                                                            Default
                                                        </Badge>
                                                    </Tooltip>
                                                ) : (
                                                    <span style={{ color: tokens.colorNeutralForeground4 }}>-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className={styles.hideOnTablet}>
                                                {new Date(hira.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Menu>
                                                    <MenuTrigger>
                                                        <Button
                                                            icon={<MoreHorizontal24Regular />}
                                                            appearance="subtle"
                                                            size="small"
                                                        />
                                                    </MenuTrigger>
                                                    <MenuPopover>
                                                        <MenuList>
                                                            <MenuItem icon={<Eye24Regular />} onClick={() => handleView(hira)}>
                                                                View
                                                            </MenuItem>
                                                            {!hira.isLocked && (
                                                                <MenuItem icon={<Edit24Regular />} onClick={() => handleEdit(hira)}>
                                                                    Edit
                                                                </MenuItem>
                                                            )}
                                                            <MenuItem icon={<Copy24Regular />} onClick={() => handleClone(hira)}>
                                                                Clone as Template
                                                            </MenuItem>
                                                            <Divider />
                                                            <MenuItem
                                                                icon={hira.isDefault ? <Star24Filled style={{ color: '#E07020' }} /> : <Star24Regular />}
                                                                onClick={() => handleSetDefault(hira)}
                                                            >
                                                                {hira.isDefault ? 'Remove as Default' : 'Set as Default'}
                                                            </MenuItem>
                                                            <Divider />
                                                            <MenuItem icon={<DocumentPdf24Regular />} onClick={() => handleExportPdf(hira)}>
                                                                Export PDF
                                                            </MenuItem>
                                                            <MenuItem icon={<ArrowDownload24Regular />} onClick={() => handleExportExcel(hira)}>
                                                                Export Excel
                                                            </MenuItem>
                                                            <Divider />
                                                            {!hira.isLocked && (
                                                                <MenuItem
                                                                    icon={<Delete24Regular />}
                                                                    onClick={() => confirmDelete(hira)}
                                                                    style={{ color: tokens.colorPaletteRedForeground1 }}
                                                                >
                                                                    Delete
                                                                </MenuItem>
                                                            )}
                                                        </MenuList>
                                                    </MenuPopover>
                                                </Menu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {/* Mobile Card View */}
                        <div className={styles.mobileCardList}>
                            {hiras.map((hira) => {
                                const riskSummary = getRiskSummary(hira);
                                return (
                                    <div key={hira._id} className={styles.mobileCard} onClick={() => handleView(hira)}>
                                        <div className={styles.mobileCardHeader}>
                                            <div className={styles.mobileCardTitle}>
                                                <Text weight="semibold" size={400}>{hira.hiraNumber}</Text>
                                                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                                    {hira.jobHeader.area}
                                                </Text>
                                            </div>
                                            {hira.isDefault && (
                                                <Badge appearance="filled" style={{ backgroundColor: '#E07020', color: 'white' }} size="small">
                                                    <Star24Filled style={{ fontSize: '10px' }} />
                                                </Badge>
                                            )}
                                        </div>

                                        <div className={styles.mobileCardBody}>
                                            <div className={styles.mobileCardRow}>
                                                <Text className={styles.mobileCardLabel}>Job Type</Text>
                                                <Text className={styles.mobileCardValue}>{hira.jobHeader.jobType}</Text>
                                            </div>
                                            <div className={styles.mobileCardRow}>
                                                <Text className={styles.mobileCardLabel}>Rows</Text>
                                                <Badge appearance="filled" color="brand" size="small">{hira.rows.length}</Badge>
                                            </div>
                                            <div className={styles.mobileCardRow}>
                                                <Text className={styles.mobileCardLabel}>Risk</Text>
                                                <div className={styles.riskSummary}>
                                                    {(riskSummary.Low ?? 0) > 0 && (
                                                        <Tooltip content={`${riskSummary.Low ?? 0} Low`} relationship="label">
                                                            <div className={styles.riskDot} style={{ backgroundColor: getRiskLevelColor('Low') }}></div>
                                                        </Tooltip>
                                                    )}
                                                    {(riskSummary.Medium ?? 0) > 0 && (
                                                        <Tooltip content={`${riskSummary.Medium ?? 0} Medium`} relationship="label">
                                                            <div className={styles.riskDot} style={{ backgroundColor: getRiskLevelColor('Medium') }}></div>
                                                        </Tooltip>
                                                    )}
                                                    {(riskSummary.High ?? 0) > 0 && (
                                                        <Tooltip content={`${riskSummary.High ?? 0} High`} relationship="label">
                                                            <div className={styles.riskDot} style={{ backgroundColor: getRiskLevelColor('High') }}></div>
                                                        </Tooltip>
                                                    )}
                                                    {(riskSummary.Extreme ?? 0) > 0 && (
                                                        <Tooltip content={`${riskSummary.Extreme ?? 0} Extreme`} relationship="label">
                                                            <div className={styles.riskDot} style={{ backgroundColor: getRiskLevelColor('Extreme') }}></div>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.mobileCardFooter}>
                                            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                                {new Date(hira.createdAt).toLocaleDateString()}
                                            </Text>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Menu>
                                                    <MenuTrigger>
                                                        <Button
                                                            icon={<MoreHorizontal24Regular />}
                                                            appearance="subtle"
                                                            size="small"
                                                        />
                                                    </MenuTrigger>
                                                    <MenuPopover>
                                                        <MenuList>
                                                            <MenuItem icon={<Eye24Regular />} onClick={() => handleView(hira)}>
                                                                View
                                                            </MenuItem>
                                                            {!hira.isLocked && (
                                                                <MenuItem icon={<Edit24Regular />} onClick={() => handleEdit(hira)}>
                                                                    Edit
                                                                </MenuItem>
                                                            )}
                                                            <MenuItem icon={<Copy24Regular />} onClick={() => handleClone(hira)}>
                                                                Clone
                                                            </MenuItem>
                                                            <Divider />
                                                            <MenuItem icon={<DocumentPdf24Regular />} onClick={() => handleExportPdf(hira)}>
                                                                Export PDF
                                                            </MenuItem>
                                                            <MenuItem icon={<ArrowDownload24Regular />} onClick={() => handleExportExcel(hira)}>
                                                                Export Excel
                                                            </MenuItem>
                                                            <Divider />
                                                            {!hira.isLocked && (
                                                                <MenuItem
                                                                    icon={<Delete24Regular />}
                                                                    onClick={() => confirmDelete(hira)}
                                                                    style={{ color: tokens.colorPaletteRedForeground1 }}
                                                                >
                                                                    Delete
                                                                </MenuItem>
                                                            )}
                                                        </MenuList>
                                                    </MenuPopover>
                                                </Menu>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className={styles.pagination}>
                            <span className={styles.paginationInfo}>
                                Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.totalRecords)} of {pagination.totalRecords} records
                            </span>
                            <div className={styles.paginationButtons}>
                                <Button
                                    icon={<ChevronLeft24Regular />}
                                    appearance="subtle"
                                    disabled={!pagination.hasPrev}
                                    onClick={() => loadHiras(pagination.current - 1)}
                                >
                                    Previous
                                </Button>
                                <Text>Page {pagination.current} of {pagination.total}</Text>
                                <Button
                                    icon={<ChevronRight24Regular />}
                                    iconPosition="after"
                                    appearance="subtle"
                                    disabled={!pagination.hasNext}
                                    onClick={() => loadHiras(pagination.current + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={(_, { open }) => setIsDeleteDialogOpen(open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Delete HIRA</DialogTitle>
                        <DialogContent>
                            Are you sure you want to delete HIRA <strong>{hiraToDelete?.hiraNumber}</strong>?
                            This action cannot be undone.
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
                            >
                                {deleteLoading ? <Spinner size="tiny" /> : 'Delete'}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
};

export default HiraListPage;
