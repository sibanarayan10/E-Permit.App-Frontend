/**
 * Data Request List Page
 * Shows all data requests with actions for creating, sending to executor/issuer
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    makeStyles,
    tokens,
    Text,
    Button,
    Card,
    Spinner,
    Badge,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    TableCellLayout,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    MessageBar,
    MessageBarBody,
} from '@fluentui/react-components';
import {
    Add24Regular,
    MoreHorizontal24Regular,
    Mail24Regular,
    Delete24Regular,
    ArrowSync24Regular,
    DocumentData24Regular,
    ChevronLeft24Regular,
    ChevronRight24Regular,
} from '@fluentui/react-icons';
import {
    getAllDataRequests,
    sendToExecutor,
    sendToIssuer,
    deleteDataRequest,
    createDataRequest,
    type DataRequest,
} from '@/services';
import {
    PermitTypeSelectionModal,
    ExecutorSelectionModal,
    IssuerSelectionModal,
    AddPermitDrawer,
    CreateHeightPermitDrawer,
} from '@/components/modals';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    page: {
        padding: tokens.spacingHorizontalXL,
        minHeight: '100%',
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalM,
        },
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalXL,
        flexWrap: 'wrap',
        gap: tokens.spacingVerticalM,
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
        },
    },
    title: {
        fontSize: tokens.fontSizeHero800,
        fontWeight: tokens.fontWeightBold,
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
        backgroundClip: 'text',
        color: 'transparent',
        WebkitBackgroundClip: 'text',
    },
    subtitle: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase300,
    },
    card: {
        padding: tokens.spacingHorizontalL,
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalS,
        },
    },
    tableContainer: {
        overflowX: 'auto',
        '@media (max-width: 768px)': {
            overflowX: 'visible',
        },
    },
    table: {
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
        textTransform: 'capitalize' as const,
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        marginTop: tokens.spacingVerticalL,
        paddingTop: tokens.spacingVerticalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        flexWrap: 'wrap',
    },
    emptyState: {
        textAlign: 'center',
        padding: tokens.spacingVerticalXXL,
        color: tokens.colorNeutralForeground3,
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
    },
    // Mobile Card List
    mobileCardList: {
        display: 'none',
        '@media (max-width: 768px)': {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalS,
        },
    },
    mobileCard: {
        padding: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground2,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
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
    },
    mobileCardLabel: {
        color: tokens.colorNeutralForeground3,
        fontWeight: tokens.fontWeightSemibold,
        minWidth: '90px',
    },
    mobileCardValue: {
        color: tokens.colorNeutralForeground1,
        textAlign: 'right' as const,
    },
    mobileCardFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: tokens.spacingVerticalXS,
        paddingTop: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    },
});

const getStatusColor = (status: string): 'brand' | 'success' | 'warning' | 'danger' | 'informative' => {
    switch (status) {
        case 'draft':
            return 'informative';
        case 'pending_executor':
            return 'warning';
        case 'executor_approved':
            return 'brand';
        case 'pending_issuer':
            return 'warning';
        case 'approved':
            return 'success';
        case 'rejected':
            return 'danger';
        default:
            return 'informative';
    }
};

const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const DataRequestListPage: React.FC = () => {
    const styles = useStyles();
    const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Modals
    const [showTypeSelection, setShowTypeSelection] = useState(false);
    const [selectedPermitType, setSelectedPermitType] = useState<'general' | 'height' | null>(null);
    const [showAddPermitDrawer, setShowAddPermitDrawer] = useState(false);
    const [showHeightPermitDrawer, setShowHeightPermitDrawer] = useState(false);
    const [showExecutorModal, setShowExecutorModal] = useState(false);
    const [showIssuerModal, setShowIssuerModal] = useState(false);
    const [selectedDataRequest, setSelectedDataRequest] = useState<DataRequest | null>(null);
    const [_actionLoading, setActionLoading] = useState(false);

    // Track if we're waiting for permit creation
    const waitingForPermitCreation = useRef(false);

    const fetchDataRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllDataRequests(page, 10);
            setDataRequests(response.data.dataRequests);
            setTotalPages(response.data.pagination.pages);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data requests');
            toast.error('Failed to load data requests');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchDataRequests();
    }, [fetchDataRequests]);

    // Handle create flow
    const handleCreateClick = () => {
        setShowTypeSelection(true);
    };

    const handleSelectGeneralPermit = () => {
        setSelectedPermitType('general');
        setShowTypeSelection(false);
        waitingForPermitCreation.current = true;
        setShowAddPermitDrawer(true);
    };

    const handleSelectHeightPermit = () => {
        setSelectedPermitType('height');
        setShowTypeSelection(false);
        waitingForPermitCreation.current = true;
        setShowHeightPermitDrawer(true);
    };

    // After permit is created, create data request with the permit ID from callback
    const handlePermitCreated = async (permitId?: string) => {
        if (!waitingForPermitCreation.current || !selectedPermitType) {
            // Normal permit creation, just close and refresh
            setShowAddPermitDrawer(false);
            setShowHeightPermitDrawer(false);
            return;
        }

        waitingForPermitCreation.current = false;

        try {
            if (permitId) {
                // Create the data request linked to the permit using the received permit ID
                await createDataRequest(permitId, selectedPermitType);
                toast.success('Data request created successfully with new permit');
                fetchDataRequests();
            } else {
                toast.error('Could not obtain the created permit ID');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create data request');
        } finally {
            setShowAddPermitDrawer(false);
            setShowHeightPermitDrawer(false);
            setSelectedPermitType(null);
        }
    };

    const handleDrawerClose = () => {
        waitingForPermitCreation.current = false;
        setShowAddPermitDrawer(false);
        setShowHeightPermitDrawer(false);
        setSelectedPermitType(null);
    };

    // Handle send to executor
    const handleSendToExecutor = (dataRequest: DataRequest) => {
        setSelectedDataRequest(dataRequest);
        setShowExecutorModal(true);
    };

    const handleExecutorSelected = async (executor: { _id: string; name: string; email: string }) => {
        if (!selectedDataRequest) return;

        try {
            setActionLoading(true);
            await sendToExecutor(selectedDataRequest._id, executor._id);
            toast.success(`Email sent to ${executor.name}`);
            setShowExecutorModal(false);
            setSelectedDataRequest(null);
            fetchDataRequests();
        } catch (err: any) {
            toast.error(err.message || 'Failed to send to executor');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle send to issuer
    const handleSendToIssuer = (dataRequest: DataRequest) => {
        setSelectedDataRequest(dataRequest);
        setShowIssuerModal(true);
    };

    const handleIssuerSelected = async (issuer: { _id: string; name: string; email: string }) => {
        if (!selectedDataRequest) return;

        try {
            setActionLoading(true);
            await sendToIssuer(selectedDataRequest._id, issuer._id);
            toast.success(`Email sent to ${issuer.name}`);
            setShowIssuerModal(false);
            setSelectedDataRequest(null);
            fetchDataRequests();
        } catch (err: any) {
            toast.error(err.message || 'Failed to send to issuer');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async (dataRequest: DataRequest) => {
        if (!confirm('Are you sure you want to delete this data request?')) return;

        try {
            setActionLoading(true);
            await deleteDataRequest(dataRequest._id);
            toast.success('Data request deleted');
            fetchDataRequests();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete data request');
        } finally {
            setActionLoading(false);
        }
    };

    // Render action menu based on status
    const renderActionMenu = (dataRequest: DataRequest) => {
        const actions = [];

        if (dataRequest.status === 'draft') {
            actions.push(
                <MenuItem
                    key="send-executor"
                    icon={<Mail24Regular />}
                    onClick={() => handleSendToExecutor(dataRequest)}
                >
                    Send to Executor
                </MenuItem>
            );
            actions.push(
                <MenuItem
                    key="delete"
                    icon={<Delete24Regular />}
                    onClick={() => handleDelete(dataRequest)}
                >
                    Delete
                </MenuItem>
            );
        }

        if (dataRequest.status === 'executor_approved') {
            actions.push(
                <MenuItem
                    key="send-issuer"
                    icon={<Mail24Regular />}
                    onClick={() => handleSendToIssuer(dataRequest)}
                >
                    Send to Issuer
                </MenuItem>
            );
        }

        if (actions.length === 0) {
            return <Text size={200}>No actions available</Text>;
        }

        return (
            <Menu>
                <MenuTrigger disableButtonEnhancement>
                    <Button appearance="subtle" icon={<MoreHorizontal24Regular />} />
                </MenuTrigger>
                <MenuPopover>
                    <MenuList>{actions}</MenuList>
                </MenuPopover>
            </Menu>
        );
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <Text as="h1" className={styles.title}>
                        <DocumentData24Regular style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                        Data Requests
                    </Text>
                    <Text className={styles.subtitle}>
                        Manage and track data requests for permits
                    </Text>
                </div>
                <div style={{ display: 'flex', gap: tokens.spacingHorizontalM }}>
                    <Button
                        appearance="subtle"
                        icon={<ArrowSync24Regular />}
                        onClick={fetchDataRequests}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        appearance="primary"
                        icon={<Add24Regular />}
                        onClick={handleCreateClick}
                    >
                        Create Data Request
                    </Button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <MessageBar intent="error" style={{ marginBottom: tokens.spacingVerticalL }}>
                    <MessageBarBody>{error}</MessageBarBody>
                </MessageBar>
            )}

            {/* Main Content */}
            <Card className={styles.card}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spinner size="large" label="Loading data requests..." />
                    </div>
                ) : dataRequests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <DocumentData24Regular style={{ fontSize: '48px', marginBottom: '16px' }} />
                        <Text size={400} block>No data requests found</Text>
                        <Text size={200}>Create your first data request to get started</Text>
                    </div>
                ) : (
                    <>
                        <div className={styles.tableContainer}>
                            {/* Desktop Table View */}
                            <Table className={styles.table}>
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell>Data Request ID</TableHeaderCell>
                                        <TableHeaderCell className={styles.hideOnSmallTablet}>Permit ID</TableHeaderCell>
                                        <TableHeaderCell className={styles.hideOnSmallTablet}>Permit Type</TableHeaderCell>
                                        <TableHeaderCell>Status</TableHeaderCell>
                                        <TableHeaderCell className={styles.hideOnTablet}>Created By</TableHeaderCell>
                                        <TableHeaderCell className={styles.hideOnTablet}>Created At</TableHeaderCell>
                                        <TableHeaderCell>Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dataRequests.map((dr) => (
                                        <TableRow key={dr._id}>
                                            <TableCell>
                                                <TableCellLayout>
                                                    <Text weight="semibold">{dr.dataRequestId}</Text>
                                                </TableCellLayout>
                                            </TableCell>
                                            <TableCell className={styles.hideOnSmallTablet}>
                                                <TableCellLayout>{dr.permitNumber}</TableCellLayout>
                                            </TableCell>
                                            <TableCell className={styles.hideOnSmallTablet}>
                                                <TableCellLayout>
                                                    <Badge
                                                        appearance="filled"
                                                        color={dr.permitType === 'general' ? 'brand' : 'success'}
                                                    >
                                                        {dr.permitType === 'general' ? 'General' : 'Height'}
                                                    </Badge>
                                                </TableCellLayout>
                                            </TableCell>
                                            <TableCell>
                                                <TableCellLayout>
                                                    <Badge
                                                        appearance="tint"
                                                        color={getStatusColor(dr.status)}
                                                        className={styles.statusBadge}
                                                    >
                                                        {formatStatus(dr.status)}
                                                    </Badge>
                                                </TableCellLayout>
                                            </TableCell>
                                            <TableCell className={styles.hideOnTablet}>
                                                <TableCellLayout>{dr.createdBy?.name || '-'}</TableCellLayout>
                                            </TableCell>
                                            <TableCell className={styles.hideOnTablet}>
                                                <TableCellLayout>
                                                    {new Date(dr.createdAt).toLocaleDateString()}
                                                </TableCellLayout>
                                            </TableCell>
                                            <TableCell>
                                                <TableCellLayout>
                                                    {renderActionMenu(dr)}
                                                </TableCellLayout>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Mobile Card View */}
                            <div className={styles.mobileCardList}>
                                {dataRequests.map((dr) => (
                                    <div key={dr._id} className={styles.mobileCard}>
                                        <div className={styles.mobileCardHeader}>
                                            <div className={styles.mobileCardTitle}>
                                                <Text weight="semibold" size={400}>{dr.dataRequestId}</Text>
                                                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                                    {dr.permitNumber}
                                                </Text>
                                            </div>
                                            <Badge
                                                appearance="tint"
                                                color={getStatusColor(dr.status)}
                                                className={styles.statusBadge}
                                                size="small"
                                            >
                                                {formatStatus(dr.status)}
                                            </Badge>
                                        </div>

                                        <div className={styles.mobileCardBody}>
                                            <div className={styles.mobileCardRow}>
                                                <Text className={styles.mobileCardLabel}>Permit Type</Text>
                                                <Badge
                                                    appearance="filled"
                                                    color={dr.permitType === 'general' ? 'brand' : 'success'}
                                                    size="small"
                                                >
                                                    {dr.permitType === 'general' ? 'General' : 'Height'}
                                                </Badge>
                                            </div>
                                            <div className={styles.mobileCardRow}>
                                                <Text className={styles.mobileCardLabel}>Created By</Text>
                                                <Text className={styles.mobileCardValue}>{dr.createdBy?.name || '-'}</Text>
                                            </div>
                                            <div className={styles.mobileCardRow}>
                                                <Text className={styles.mobileCardLabel}>Created</Text>
                                                <Text className={styles.mobileCardValue}>
                                                    {new Date(dr.createdAt).toLocaleDateString()}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className={styles.mobileCardFooter}>
                                            {renderActionMenu(dr)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className={styles.pagination}>
                            <Button
                                appearance="subtle"
                                icon={<ChevronLeft24Regular />}
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </Button>
                            <Text>
                                Page {page} of {totalPages}
                            </Text>
                            <Button
                                appearance="subtle"
                                icon={<ChevronRight24Regular />}
                                iconPosition="after"
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </>
                )}
            </Card>

            {/* Modals */}
            <PermitTypeSelectionModal
                isOpen={showTypeSelection}
                onClose={() => setShowTypeSelection(false)}
                onSelectGeneralPermit={handleSelectGeneralPermit}
                onSelectHeightPermit={handleSelectHeightPermit}
            />

            {/* General Permit Drawer */}
            <AddPermitDrawer
                isOpen={showAddPermitDrawer}
                onClose={handleDrawerClose}
                onPermitCreated={handlePermitCreated}
            />

            {/* Height Permit Drawer */}
            <CreateHeightPermitDrawer
                isOpen={showHeightPermitDrawer}
                onClose={handleDrawerClose}
                onSuccess={handlePermitCreated}
            />

            <ExecutorSelectionModal
                open={showExecutorModal}
                onClose={() => {
                    setShowExecutorModal(false);
                    setSelectedDataRequest(null);
                }}
                permitNumber={selectedDataRequest?.dataRequestId || ''}
                onSelectExecutor={handleExecutorSelected}
            />

            <IssuerSelectionModal
                open={showIssuerModal}
                onClose={() => {
                    setShowIssuerModal(false);
                    setSelectedDataRequest(null);
                }}
                permitNumber={selectedDataRequest?.dataRequestId || ''}
                onSelectIssuer={handleIssuerSelected}
            />
        </div>
    );
};

export default DataRequestListPage;
