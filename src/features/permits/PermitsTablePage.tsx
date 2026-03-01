/**
 * Permits Table Page - Full functionality matching original
 * Includes: stats, tabs, filters, all workflow actions, modals, PDF download
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
    Input,
    Dropdown,
    Option,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    TableCellLayout,
    Badge,
    Spinner,
    Tab,
    TabList,
    Tooltip,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Textarea,
    Drawer,
    DrawerHeader,
    DrawerHeaderTitle,
    DrawerBody,
} from '@fluentui/react-components';
import {
    Search24Regular,
    Add24Regular,
    Eye24Regular,
    Edit24Regular,
    Delete24Regular,
    Send24Regular,
    Checkmark24Regular,
    ArrowUndo24Regular,
    ArrowDownload24Regular,
    ArrowClockwise24Regular,
    LockClosed24Regular,
    DocumentBulletList24Regular,
    Clock24Regular,
    CheckmarkCircle24Regular,
    Warning24Regular,
    DismissCircle24Regular,
    Dismiss24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import {
    getAllPermits,
    getAllPermitStats,
    submitToExecution,
    executionApprove,
    executionReturn,
    issuerApprove,
    issuerReturn,
    cancelPermit,
    renewPermit,
    deletePermit,
    initiateClose,
    executorApproveClosure,
    issuerApproveClosure,
    // Height Permit services
    submitHeightPermitToExecution,
    renewHeightPermit,
    cancelHeightPermit,
    deleteHeightPermit,
    executionApproveHeightPermit,
    executionReturnHeightPermit,
    issuerApproveHeightPermit,
    issuerReturnHeightPermit,
    initiateHeightPermitClosure,
    executorApproveHeightPermitClosure,
    issuerApproveHeightPermitClosure,
    downloadHeightPermitPDF,
} from '@/services';
import { PageLoading } from '@/components/common';
import {
    CancelPermitModal,
    RenewPermitModal,
    ExecutorSelectionModal,
    IssuerSelectionModal,
    InitiatorClosureModal,
    AddPermitDrawer,
    // Height Permit components
    PermitTypeSelectionModal,
    CreateHeightPermitDrawer,
} from '@/components/modals';
import { PermitDetails, HeightPermitDetails } from '@/components/permits';
import { ExecutionApprovalForm, IssuerApprovalForm, HeightPermitExecutionApprovalDrawer, HeightPermitIssuerApprovalDrawer } from '@/components/forms';
import { RenewalApprovalDrawer, ExecutorClosureDrawer, IssuerClosureDrawer, HeightPermitExecutorClosureDrawer, HeightPermitIssuerClosureDrawer } from '@/components/drawers';
import { generateGeneralWorkPermitPDF, generatePermitPDF, generateSimplePermitPDF, sendClosureEmailWithPDF } from '@/utils';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        padding: tokens.spacingHorizontalL,
        maxWidth: '1600px',
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
        gap: tokens.spacingHorizontalM,
    },
    title: {
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightSemibold,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalL,
        '@media (max-width: 600px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    },
    statCard: {
        padding: tokens.spacingHorizontalM,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ':hover': {
            boxShadow: tokens.shadow8,
            transform: 'translateY(-2px)',
        },
    },
    statContent: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    statIcon: {
        width: '40px',
        height: '40px',
        borderRadius: tokens.borderRadiusMedium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    statValue: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightBold,
        lineHeight: 1,
    },
    statLabel: {
        fontSize: tokens.fontSizeBase100,
        color: tokens.colorNeutralForeground3,
    },
    filterBar: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalM,
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    searchInput: {
        minWidth: '250px',
        flex: 1,
        maxWidth: '400px',
        '@media (max-width: 768px)': {
            minWidth: '100%',
            maxWidth: '100%',
        },
    },
    tableCard: {
        padding: 0,
        overflow: 'hidden',
    },
    tableWrapper: {
        overflowX: 'auto' as const,
        '@media (max-width: 768px)': {
            overflowX: 'visible' as const,
        },
    },
    // Desktop table - hidden on mobile
    desktopTable: {
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
    actionButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
        flexWrap: 'wrap',
    },
    emptyState: {
        textAlign: 'center' as const,
        padding: tokens.spacingVerticalXXL,
        color: tokens.colorNeutralForeground3,
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalM,
        flexWrap: 'wrap',
    },
    modalLarge: {
        maxWidth: '900px',
        width: '90vw',
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
        gap: '2px',
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
    },
    mobileCardValue: {
        color: tokens.colorNeutralForeground1,
        textAlign: 'right' as const,
        maxWidth: '60%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
    },
    mobileCardFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: tokens.spacingVerticalXS,
        paddingTop: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalXS,
    },
    mobileDescription: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
        maxWidth: '100%',
    },
    // Responsive toolbar
    toolbarContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalM,
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
        },
    },
    tabListWrapper: {
        '@media (max-width: 768px)': {
            overflowX: 'auto',
            marginBottom: tokens.spacingVerticalS,
        },
    },
});

interface PermitStats {
    Draft?: number;
    Pending_Execution?: number;
    Pending_Issuer?: number;
    Approved?: number;
    Returned?: number;
    Closed?: number;
    Cancelled?: number;
    total?: number;
}

interface Permit {
    _id: string;
    permitNumber?: string;
    protocolNumber?: string;
    permitStatus?: string;
    status?: string; // For Height Permits
    currentStage?: string;
    workflowStage?: string; // For Height Permits
    createdBy?: { _id?: string; name?: string };
    initiator?: { briefDescriptionOfWork?: string; name?: string; periodOfWork?: { from?: { date?: string }; to?: { date?: string } } };
    createdAt?: string;
    periodOfWork?: { fromDate?: string; toDate?: string };
    assignedExecutor?: { _id?: string; name?: string } | string;
    assignedIssuer?: { _id?: string; name?: string } | string;
    permitType?: 'general' | 'height'; // To distinguish between permit types
    jobLocation?: string; // For Height Permits
    jobDescription?: string; // For Height Permits
    schedule?: { startTimeDate?: { date?: string; hrs?: string }; finishTimeDate?: { date?: string; hrs?: string } }; // For Height Permits
}

export const PermitsTablePage: React.FC = () => {
    const styles = useStyles();
    useNavigate(); // Keep hook but don't store unused value
    const { user } = useUser();

    // State
    const [permits, setPermits] = useState<Permit[]>([]);
    const [stats, setStats] = useState<PermitStats>({});
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const isInitialMount = useRef(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal states
    const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [showExecutorModal, setShowExecutorModal] = useState(false);
    const [showIssuerModal, setShowIssuerModal] = useState(false);
    const [showExecutionApprovalModal, setShowExecutionApprovalModal] = useState(false);
    const [showIssuerApprovalModal, setShowIssuerApprovalModal] = useState(false);
    const [showRenewalApprovalDrawer, setShowRenewalApprovalDrawer] = useState(false);
    const [showInitiatorClosureModal, setShowInitiatorClosureModal] = useState(false);
    const [showExecutorClosureModal, setShowExecutorClosureModal] = useState(false);
    const [showIssuerClosureModal, setShowIssuerClosureModal] = useState(false);
    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [returnType, setReturnType] = useState<'execution' | 'issuer'>('execution');
    const [showAddPermitDrawer, setShowAddPermitDrawer] = useState(false);
    const [editPermitId, setEditPermitId] = useState<string | null>(null);

    // Height Permit states
    const [showPermitTypeModal, setShowPermitTypeModal] = useState(false);
    const [showCreateHeightPermitDrawer, setShowCreateHeightPermitDrawer] = useState(false);
    const [editHeightPermitId, setEditHeightPermitId] = useState<string | null>(null);
    const [showHeightPermitExecutionApproval, setShowHeightPermitExecutionApproval] = useState(false);
    const [showHeightPermitIssuerApproval, setShowHeightPermitIssuerApproval] = useState(false);
    const [showHeightPermitExecutorClosure, setShowHeightPermitExecutorClosure] = useState(false);
    const [showHeightPermitIssuerClosure, setShowHeightPermitIssuerClosure] = useState(false);
    const [selectedHeightPermitId, setSelectedHeightPermitId] = useState<string | null>(null);

    // Fetch permits - NOW USES COMBINED API FOR BOTH GENERAL + HEIGHT PERMITS
    const fetchPermits = useCallback(async (page = 1, showTableLoader = false) => {
        try {
            if (showTableLoader) {
                setTableLoading(true);
            } else if (isInitialMount.current) {
                setLoading(true);
            }
            // Use combined API to get both General and Height permits
            const response = await getAllPermits(null, null, page, 8);
            const data = response.data as any;
            setPermits(data?.permits || data?.data || []);
            // Handle various pagination response formats
            const paginationData = data?.pagination || {};
            const total = paginationData?.totalPages || paginationData?.pages || paginationData?.total || Math.ceil((data?.total || data?.permits?.length || 10) / 8) || 1;
            setTotalPages(total);
            isInitialMount.current = false;
        } catch (error) {
            toast.error('Failed to fetch permits');
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    }, []);

    // Fetch stats - NOW USES COMBINED API FOR BOTH GENERAL + HEIGHT PERMITS
    const fetchStats = useCallback(async () => {
        try {
            // Use combined stats API
            const response = await getAllPermitStats();
            setStats((response.data as PermitStats) || {});
        } catch {
            // Silently fail - stats are not critical
        }
    }, []);

    useEffect(() => {
        fetchPermits(currentPage);
        fetchStats();
    }, [currentPage, fetchPermits, fetchStats]);

    // Filter permits based on tab and search
    const filteredPermits = permits.filter((permit) => {
        // Tab filter
        if (activeTab === 'pending') {
            // Include both regular pending and closure pending statuses
            if (user?.workflowStage === 'Execution' &&
                permit.permitStatus !== 'Pending_Execution' &&
                permit.permitStatus !== 'Pending_Closure_Execution') return false;
            if (user?.workflowStage === 'Issuer' &&
                permit.permitStatus !== 'Pending_Issuer' &&
                permit.permitStatus !== 'Pending_Closure_Issuer') return false;
        }
        if (activeTab === 'draft' && permit.permitStatus !== 'Draft') return false;
        if (activeTab === 'approved' && permit.permitStatus !== 'Approved') return false;
        if (activeTab === 'closed' && permit.permitStatus !== 'Closed') return false;

        // Status filter
        if (statusFilter && permit.permitStatus !== statusFilter) return false;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                permit.permitNumber?.toLowerCase().includes(search) ||
                permit.protocolNumber?.toLowerCase().includes(search) ||
                permit.initiator?.briefDescriptionOfWork?.toLowerCase().includes(search)
            );
        }
        return true;
    });


    // Status badge - now accepts full permit to detect renewal requests
    const getStatusBadge = (status?: string, permit?: Permit) => {
        if (!status) return <Badge appearance="outline">Unknown</Badge>;

        // Check if this is a renewal request (pending renewal exists and is active)
        const p = permit as any;
        const hasPendingRenewal = p?.pendingRenewal && (
            p.pendingRenewal.isActive === true ||
            p.pendingRenewal.requestedAt
        );

        // Check if permit is pending closure
        const isPendingClosure =
            p?.currentStage === 'Closure_Initiated' ||
            p?.currentStage === 'Closure_Executor' ||
            p?.currentStage === 'Closure_Issuer' ||
            p?.stage === 'closure_initiated' ||
            p?.stage === 'closure_executor' ||
            p?.stage === 'closure_issuer';

        // If it's pending closure, show "Pending Closure"
        if (isPendingClosure) {
            return (
                <Badge appearance="filled" color="informative">
                    Pending Closure
                </Badge>
            );
        }

        // If it's a pending status with active renewal, show "Renewal Request"
        if (hasPendingRenewal && (status === 'Pending_Execution' || status === 'Pending_Issuer')) {
            return (
                <Badge appearance="filled" color="important">
                    Renewal Request
                </Badge>
            );
        }

        const colors: Record<string, 'success' | 'warning' | 'danger' | 'informative' | 'important'> = {
            Draft: 'informative',
            Pending_Execution: 'warning',
            Pending_Issuer: 'important',
            Approved: 'success',
            Returned: 'danger',
            Closed: 'informative',
            Cancelled: 'danger',
            Pending_Closure_Execution: 'warning',
            Pending_Closure_Issuer: 'important',
        };
        return (
            <Badge appearance="filled" color={colors[status] ?? 'informative'}>
                {status.replace(/_/g, ' ')}
            </Badge>
        );
    };

    // Action handlers
    const handleViewDetails = (permit: Permit) => {
        setSelectedPermit(permit);
        setShowDetailsModal(true);
    };

    const handleEdit = (permit: Permit) => {
        // Check permit type and open appropriate drawer
        if (permit.permitType === 'height') {
            setEditHeightPermitId(permit._id);
            setShowCreateHeightPermitDrawer(true);
        } else {
            setEditPermitId(permit._id);
            setShowAddPermitDrawer(true);
        }
    };

    const handleDelete = async (permit: Permit) => {
        if (!window.confirm('Are you sure you want to delete this permit?')) return;
        try {
            setActionLoading(`delete-${permit._id}`);

            // Check permit type and call appropriate API
            if (permit.permitType === 'height') {
                await deleteHeightPermit(permit._id);
            } else {
                await deletePermit(permit._id);
            }

            toast.success('Permit deleted successfully');
            fetchPermits(currentPage);
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete permit');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSubmitToExecution = (permit: Permit) => {
        setSelectedPermit(permit);
        setShowExecutorModal(true);
    };

    const handleExecutorSelected = async (executor: { _id: string }) => {
        if (!selectedPermit) return;
        try {
            setActionLoading(`submit-${selectedPermit._id}`);

            // Check permit type and call appropriate API
            if (selectedPermit.permitType === 'height') {
                await submitHeightPermitToExecution(selectedPermit._id, executor._id);
            } else {
                await submitToExecution(selectedPermit._id, executor._id);
            }

            toast.success('Permit submitted to execution');
            setShowExecutorModal(false);
            fetchPermits(currentPage);
            fetchStats();
        } catch (error) {
            toast.error('Failed to submit permit');
        } finally {
            setActionLoading(null);
        }
    };

    // Helper function to check if permit is a renewal request
    const isRenewalPending = (permit: Permit): boolean => {
        const p = permit as any;
        // Check for active pending renewal using multiple indicators
        const hasPendingRenewal = p.pendingRenewal && (
            p.pendingRenewal.isActive === true ||
            (p.pendingRenewal.requestedAt && !p.pendingRenewal.executorApproval?.approved)
        );
        const isExecStage = permit.permitStatus === 'Pending_Execution';

        // Debug logging
        if (isExecStage) {
            console.log('[Renewal Check] Permit:', permit.permitNumber, 'pendingRenewal:', p.pendingRenewal, 'hasPendingRenewal:', hasPendingRenewal);
        }

        return !!(hasPendingRenewal && isExecStage);
    };

    // Handle opening execution approval (detects renewals automatically)
    const handleOpenExecutionApproval = (permit: Permit) => {
        setSelectedPermit(permit);

        // 🔑 KEY LOGIC: Check if this is a renewal FIRST (applies to both General and Height permits)
        if (isRenewalPending(permit)) {
            // Show renewal approval drawer (simple - just renewal info)
            setShowRenewalApprovalDrawer(true);
            return;
        }

        // Check if this is a Height Permit (non-renewal)
        if (permit.permitType === 'height') {
            setSelectedHeightPermitId(permit._id);
            setShowHeightPermitExecutionApproval(true);
            return;
        }

        // Show regular execution approval form for General Permits (non-renewal)
        setShowExecutionApprovalModal(true);
    };

    // Handle execution approval form submission (for non-renewals)
    const handleExecutionApprove = async (data: Record<string, unknown>) => {
        if (!selectedPermit) return;
        try {
            setActionLoading(`approve-execution-${selectedPermit._id}`);
            await executionApprove(selectedPermit._id, data as any);
            toast.success('Execution approved and forwarded to issuer');
            setShowExecutionApprovalModal(false);
            fetchPermits(currentPage);
            fetchStats();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to approve execution');
        } finally {
            setActionLoading(null);
        }
    };

    const handleIssuerSelected = async (_issuer: { _id: string }) => {
        // After execution approval, forward to selected issuer
        toast.success('Permit forwarded to issuer');
        setShowIssuerModal(false);
        fetchPermits(currentPage);
        fetchStats();
    };

    const handleOpenReturn = (permit: Permit, type: 'execution' | 'issuer') => {
        setSelectedPermit(permit);
        setReturnType(type);
        setReturnReason('');
        setShowReturnDialog(true);
    };

    const handleReturn = async () => {
        if (!selectedPermit || !returnReason.trim()) {
            toast.error('Please enter a return reason');
            return;
        }
        try {
            setActionLoading(`return-${selectedPermit._id}`);
            const isHeightPermit = selectedPermit.permitType === 'height';

            if (returnType === 'execution') {
                if (isHeightPermit) {
                    await executionReturnHeightPermit(selectedPermit._id, returnReason);
                } else {
                    await executionReturn(selectedPermit._id, { returnedReason: returnReason });
                }
            } else {
                if (isHeightPermit) {
                    await issuerReturnHeightPermit(selectedPermit._id, returnReason);
                } else {
                    await issuerReturn(selectedPermit._id, { returnedReason: returnReason });
                }
            }
            toast.success('Permit returned to initiator');
            setShowReturnDialog(false);
            fetchPermits(currentPage);
            fetchStats();
        } catch (error) {
            toast.error('Failed to return permit');
        } finally {
            setActionLoading(null);
        }
    };

    // Check if permit is a renewal pending issuer approval
    const isRenewalPendingIssuer = (permit: Permit): boolean => {
        const p = permit as any;
        // Check for active pending renewal using multiple indicators
        const hasPendingRenewal = p.pendingRenewal && (
            p.pendingRenewal.isActive === true ||
            p.pendingRenewal.requestedAt
        );
        const isIssuerStage = permit.permitStatus === 'Pending_Issuer';

        // Debug logging
        if (isIssuerStage) {
            console.log('[Issuer Renewal Check] Permit:', permit.permitNumber, 'pendingRenewal:', p.pendingRenewal, 'hasPendingRenewal:', hasPendingRenewal);
        }

        return !!(hasPendingRenewal && isIssuerStage);
    };

    // Handle opening issuer approval (detects renewals automatically)
    const handleOpenIssuerApproval = (permit: Permit) => {
        setSelectedPermit(permit);

        // 🔑 KEY LOGIC: Check if this is a renewal FIRST (applies to both General and Height permits)
        if (isRenewalPendingIssuer(permit)) {
            // Show renewal approval drawer (simple - just renewal info)
            setShowRenewalApprovalDrawer(true);
            return;
        }

        // Check if this is a Height Permit (non-renewal)
        if (permit.permitType === 'height') {
            setSelectedHeightPermitId(permit._id);
            setShowHeightPermitIssuerApproval(true);
            return;
        }

        // Show regular issuer approval form for General Permits (non-renewal)
        setShowIssuerApprovalModal(true);
    };

    // Handle issuer approval form submission (for non-renewals)
    const handleIssuerApprove = async (data: Record<string, unknown>) => {
        if (!selectedPermit) return;
        try {
            setActionLoading(`approve-issuer-${selectedPermit._id}`);
            await issuerApprove(selectedPermit._id, data as any);
            toast.success('Permit approved');
            setShowIssuerApprovalModal(false);
            fetchPermits(currentPage);
            fetchStats();
        } catch (error) {
            toast.error('Failed to approve permit');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelPermit = async (data: { reason: string; comments?: string }) => {
        if (!selectedPermit) return;
        try {
            setActionLoading(`cancel-${selectedPermit._id}`);

            // Check permit type and call appropriate API (both use same data format now)
            if (selectedPermit.permitType === 'height') {
                await cancelHeightPermit(selectedPermit._id, data);
            } else {
                await cancelPermit(selectedPermit._id, data);
            }

            toast.success('Permit cancelled');
            setShowCancelModal(false);
            fetchPermits(currentPage);
            fetchStats();
        } catch (error) {
            toast.error('Failed to cancel permit');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRenewPermit = async (data: Record<string, unknown>) => {
        if (!selectedPermit) return;
        try {
            setActionLoading(`renew-${selectedPermit._id}`);

            // Check permit type and call appropriate API
            if (selectedPermit.permitType === 'height') {
                await renewHeightPermit(selectedPermit._id, data as any);
            } else {
                await renewPermit(selectedPermit._id, data as unknown as import('@/models').RenewPermitPayload);
            }

            toast.success('Renewal request submitted! Awaiting Executor approval.');
            setShowRenewModal(false);
            fetchPermits(currentPage);
            fetchStats();
        } catch (error) {
            toast.error('Failed to submit renewal request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleInitiatorClosure = async (data: any) => {
        if (!selectedPermit) return;
        try {
            setActionLoading(`closure-${selectedPermit._id}`);

            // Check permit type and call appropriate API
            if (selectedPermit.permitType === 'height') {
                await initiateHeightPermitClosure(selectedPermit._id, data);
            } else {
                await initiateClose(selectedPermit._id, data as any);
            }

            toast.success('Closure request submitted');
            setShowInitiatorClosureModal(false);
            fetchPermits(currentPage);
            fetchStats();
        } catch (error) {
            toast.error('Failed to submit closure request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleExecutorClosure = async (data: any) => {
        if (!selectedPermit) return;
        try {
            setActionLoading(`executor-closure-${selectedPermit._id}`);

            // Check permit type and call appropriate API
            if (selectedPermit.permitType === 'height') {
                await executorApproveHeightPermitClosure(selectedPermit._id);
            } else {
                await executorApproveClosure(selectedPermit._id, data as any);
            }

            toast.success('Closure approved');
            setShowExecutorClosureModal(false);
            setShowHeightPermitExecutorClosure(false);
            fetchPermits(currentPage);
            fetchStats();
        } catch (error) {
            toast.error('Failed to approve closure');
        } finally {
            setActionLoading(null);
        }
    };

    const handleIssuerClosure = async (data: any) => {
        if (!selectedPermit) return;
        try {
            setActionLoading(`issuer-closure-${selectedPermit._id}`);

            let closedPermit: any = null;

            // Check permit type and call appropriate API
            if (selectedPermit.permitType === 'height') {
                const response = await issuerApproveHeightPermitClosure(selectedPermit._id, data);
                closedPermit = response.data;
            } else {
                const response = await issuerApproveClosure(selectedPermit._id, data as any);
                closedPermit = response.data;
            }

            toast.success('Permit closed');
            setShowIssuerClosureModal(false);
            setShowHeightPermitIssuerClosure(false);
            fetchPermits(currentPage);
            fetchStats();

            // Send closure email with PDF attachment to initiator and executor (fire-and-forget)
            // Only for general permits (height permits have backend PDF generation)
            // Use the UPDATED permit data from the API response
            if (selectedPermit.permitType !== 'height' && closedPermit) {
                const initiator = closedPermit.createdBy as any;
                const executor = closedPermit.assignedExecutor as any;

                // Send to initiator
                if (initiator && typeof initiator === 'object' && initiator.email) {
                    sendClosureEmailWithPDF(closedPermit as any, initiator.email, initiator.name || 'Initiator')
                        .then(result => {
                            if (result.success) {
                                console.log('📧 Closure PDF email sent to initiator:', initiator.email);
                            } else {
                                console.warn('Failed to send closure PDF to initiator:', result.message);
                            }
                        })
                        .catch(err => console.error('Error sending closure PDF to initiator:', err));
                }

                // Send to executor
                if (executor && typeof executor === 'object' && executor.email) {
                    sendClosureEmailWithPDF(closedPermit as any, executor.email, executor.name || 'Executor')
                        .then(result => {
                            if (result.success) {
                                console.log('📧 Closure PDF email sent to executor:', executor.email);
                            } else {
                                console.warn('Failed to send closure PDF to executor:', result.message);
                            }
                        })
                        .catch(err => console.error('Error sending closure PDF to executor:', err));
                }
            }
        } catch (error) {
            toast.error('Failed to close permit');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownloadPDF = async (permit: Permit) => {
        try {
            toast.loading('Generating PDF...', { id: 'pdf-download' });
            // Try the main generator first
            await generateGeneralWorkPermitPDF(permit as any, user);
            toast.success('PDF downloaded successfully', { id: 'pdf-download' });
        } catch (error) {
            console.error('Error generating PDF:', error);
            try {
                // Fallback to regular permit PDF
                await generatePermitPDF(permit as any, user);
                toast.success('PDF downloaded successfully', { id: 'pdf-download' });
            } catch (fallbackError) {
                try {
                    // Final fallback to simple PDF
                    await generateSimplePermitPDF(permit as any, user);
                    toast.success('PDF downloaded successfully', { id: 'pdf-download' });
                } catch (finalError) {
                    toast.error('Failed to generate PDF', { id: 'pdf-download' });
                }
            }
        }
    };

    // Height Permit PDF Download (Backend generated)
    const handleDownloadHeightPermitPDF = async (permit: Permit) => {
        try {
            toast.loading('Generating Height Permit PDF...', { id: 'pdf-download' });

            // Call backend to get PDF
            const pdfBlob = await downloadHeightPermitPDF(permit._id);

            // Create blob URL and trigger download
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Height_Permit_${permit.permitNumber || 'Unknown'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Height Permit PDF downloaded successfully', { id: 'pdf-download' });
        } catch (error) {
            console.error('Error downloading Height Permit PDF:', error);
            toast.error('Failed to generate Height Permit PDF', { id: 'pdf-download' });
        }
    };

    // Unified PDF download handler
    const handleDownloadPermitPDF = async (permit: Permit) => {
        if (permit.permitType === 'height') {
            await handleDownloadHeightPermitPDF(permit);
        } else {
            await handleDownloadPDF(permit);
        }
    };

    // Permission checks - handle createdBy as both object and string, and user.id vs user._id
    const isCreator = (permit: Permit) => {
        const creatorId = typeof permit.createdBy === 'string'
            ? permit.createdBy
            : permit.createdBy?._id;
        const userId = (user as any)?.id || user?._id;
        return creatorId === userId;
    };
    const canEdit = (permit: Permit) =>
        (isCreator(permit) && (permit.permitStatus === 'Draft' || permit.permitStatus === 'Returned')) ||
        ['ADMIN', 'SUBADMIN'].includes(user?.role || '');
    const canDelete = (permit: Permit) =>
        (permit.permitStatus === 'Draft' && isCreator(permit)) ||
        (['ADMIN', 'SUBADMIN'].includes(user?.role || '') && permit.permitStatus !== 'Approved');

    // Render action buttons
    const renderActions = (permit: Permit) => {
        return (
            <div className={styles.actionButtons}>
                {/* View Details */}
                <Tooltip content="View Details" relationship="label">
                    <Button
                        icon={<Eye24Regular />}
                        style={{ color: 'green' }}
                        appearance="subtle"
                        size="small"
                        onClick={() => handleViewDetails(permit)}
                    />
                </Tooltip>

                {/* Edit - for Draft/Returned by creator or admin */}
                {canEdit(permit) && (
                    <Tooltip content="Edit" relationship="label">
                        <Button
                            icon={<Edit24Regular />}
                            style={{ color: 'blue' }}
                            appearance="subtle"
                            size="small"
                            onClick={() => handleEdit(permit)}
                        />
                    </Tooltip>
                )}
                {/* Delete */}
                {canDelete(permit) && (
                    <Tooltip content="Delete" relationship="label">
                        <Button
                            icon={<Delete24Regular />}
                            style={{ color: 'red' }}
                            appearance="subtle"
                            size="small"
                            onClick={() => handleDelete(permit)}
                            disabled={actionLoading === `delete-${permit._id}`}
                        />
                    </Tooltip>
                )}

                {/* PDF Download - for approved/closed/cancelled */}
                {['Approved', 'Closed', 'Cancelled'].includes(permit.permitStatus || '') && (
                    <Tooltip content="Download PDF" relationship="label">
                        <Button
                            icon={<ArrowDownload24Regular />}
                            appearance="subtle"
                            size="small"
                            onClick={() => handleDownloadPermitPDF(permit)}
                        />
                    </Tooltip>
                )}

                {/* Renew - for approved permits by initiator */}
                {permit.permitStatus === 'Approved' &&
                    (user?.workflowStage === 'Initiator' || ['ADMIN', 'SUBADMIN'].includes(user?.role || '')) && (
                        <Tooltip content="Renew Permit" relationship="label">
                            <Button
                                icon={<ArrowClockwise24Regular />}
                                appearance="subtle"
                                size="small"
                                onClick={() => {
                                    setSelectedPermit(permit);
                                    setShowRenewModal(true);
                                }}
                            />
                        </Tooltip>
                    )}

                {/* Initiator Close Permit */}
                {user?.workflowStage === 'Initiator' &&
                    isCreator(permit) &&
                    ['Approved', 'Cancelled'].includes(permit.permitStatus || '') && (
                        <Tooltip content="Close Permit" relationship="label">
                            <Button
                                icon={<LockClosed24Regular />}
                                appearance="subtle"
                                size="small"
                                onClick={() => {
                                    setSelectedPermit(permit);
                                    setShowInitiatorClosureModal(true);
                                }}
                            />
                        </Tooltip>
                    )}

                {/* Submit to Execution - Draft/Returned by creator */}
                {user?.workflowStage === 'Initiator' &&
                    isCreator(permit) &&
                    ['Draft', 'Returned'].includes(permit.permitStatus || '') && (
                        <Tooltip content="Submit to Execution" relationship="label">
                            <Button
                                icon={<Send24Regular />}
                                appearance="subtle"
                                size="small"
                                onClick={() => handleSubmitToExecution(permit)}
                                disabled={actionLoading === `submit-${permit._id}`}
                            />
                        </Tooltip>
                    )}

                {/* Execution Actions */}
                {user?.workflowStage === 'Execution' && permit.permitStatus === 'Pending_Execution' && (
                    <>
                        <Tooltip content={isRenewalPending(permit) ? "Review Renewal" : "Approve"} relationship="label">
                            <Button
                                icon={<Checkmark24Regular />}
                                appearance="subtle"
                                size="small"
                                onClick={() => handleOpenExecutionApproval(permit)}
                            />
                        </Tooltip>
                        <Tooltip content="Return" relationship="label">
                            <Button
                                icon={<ArrowUndo24Regular />}
                                appearance="subtle"
                                size="small"
                                onClick={() => handleOpenReturn(permit, 'execution')}
                            />
                        </Tooltip>
                    </>
                )}

                {/* Executor Closure Approval */}
                {user?.workflowStage === 'Execution' &&
                    permit.permitStatus === 'Pending_Closure_Execution' && (
                        <Tooltip content="Approve Closure" relationship="label">
                            <Button
                                icon={<CheckmarkCircle24Regular />}
                                appearance="primary"
                                style={{ backgroundColor: '#107c10' }}
                                size="small"
                                onClick={() => {
                                    setSelectedPermit(permit);
                                    // Check permit type and show appropriate drawer
                                    if (permit.permitType === 'height') {
                                        setShowHeightPermitExecutorClosure(true);
                                    } else {
                                        setShowExecutorClosureModal(true);
                                    }
                                }}
                            />
                        </Tooltip>
                    )}

                {/* Issuer Actions */}
                {user?.workflowStage === 'Issuer' && permit.permitStatus === 'Pending_Issuer' && (
                    <>
                        <Tooltip content={isRenewalPendingIssuer(permit) ? "Review Renewal" : "Approve"} relationship="label">
                            <Button
                                icon={<Checkmark24Regular />}
                                appearance="primary"
                                size="small"
                                onClick={() => handleOpenIssuerApproval(permit)}
                            />
                        </Tooltip>
                        <Tooltip content="Return" relationship="label">
                            <Button
                                icon={<ArrowUndo24Regular />}
                                appearance="subtle"
                                size="small"
                                onClick={() => handleOpenReturn(permit, 'issuer')}
                            />
                        </Tooltip>
                    </>
                )}

                {/* Issuer Cancel */}
                {user?.workflowStage === 'Issuer' && permit.permitStatus === 'Approved' && (
                    <Tooltip content="Cancel Permit" relationship="label">
                        <Button
                            icon={<DismissCircle24Regular />}
                            appearance="subtle"
                            size="small"
                            onClick={() => {
                                setSelectedPermit(permit);
                                setShowCancelModal(true);
                            }}
                        />
                    </Tooltip>
                )}

                {/* Issuer Closure Approval */}
                {user?.workflowStage === 'Issuer' &&
                    permit.permitStatus === 'Pending_Closure_Issuer' && (
                        <Tooltip content="Close Permit" relationship="label">
                            <Button
                                icon={<LockClosed24Regular />}
                                appearance="primary"
                                style={{ backgroundColor: '#6b21a8' }}
                                size="small"
                                onClick={() => {
                                    setSelectedPermit(permit);
                                    // Check permit type and show appropriate drawer
                                    if (permit.permitType === 'height') {
                                        setShowHeightPermitIssuerClosure(true);
                                    } else {
                                        setShowIssuerClosureModal(true);
                                    }
                                }}
                            />
                        </Tooltip>
                    )}
            </div>
        );
    };

    if (loading && currentPage === 1) {
        return <PageLoading label="Loading permits..." />;
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Text className={styles.title}>Work Permits</Text>
                {(user?.workflowStage === 'Initiator' || ['ADMIN', 'SUBADMIN'].includes(user?.role || '')) && (
                    <Button
                        appearance="primary"
                        icon={<Add24Regular />}
                        onClick={() => setShowPermitTypeModal(true)}
                    >
                        Create Permit
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                {/* Total */}
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#0078d415', color: '#0078d4' }}>
                            <DocumentBulletList24Regular />
                        </div>
                        <div className={styles.statInfo}>
                            <Text className={styles.statValue} style={{ color: '#0078d4' }}>
                                {stats.total || Object.values(stats).reduce((a, b) => typeof b === 'number' ? a + b : a, 0)}
                            </Text>
                            <Text className={styles.statLabel}>Total</Text>
                        </div>
                    </div>
                </Card>
                {/* Draft */}
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#6c757d15', color: '#6c757d' }}>
                            <Clock24Regular />
                        </div>
                        <div className={styles.statInfo}>
                            <Text className={styles.statValue} style={{ color: '#6c757d' }}>{stats.Draft || 0}</Text>
                            <Text className={styles.statLabel}>Draft</Text>
                        </div>
                    </div>
                </Card>
                {/* Pending Exec */}
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#ffc10715', color: '#ffc107' }}>
                            <Warning24Regular />
                        </div>
                        <div className={styles.statInfo}>
                            <Text className={styles.statValue} style={{ color: '#ffc107' }}>{stats.Pending_Execution || 0}</Text>
                            <Text className={styles.statLabel}>Pending Exec</Text>
                        </div>
                    </div>
                </Card>
                {/* Pending Issuer */}
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#17a2b815', color: '#17a2b8' }}>
                            <Warning24Regular />
                        </div>
                        <div className={styles.statInfo}>
                            <Text className={styles.statValue} style={{ color: '#17a2b8' }}>{stats.Pending_Issuer || 0}</Text>
                            <Text className={styles.statLabel}>Pending Issuer</Text>
                        </div>
                    </div>
                </Card>
                {/* Approved */}
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#28a74515', color: '#28a745' }}>
                            <CheckmarkCircle24Regular />
                        </div>
                        <div className={styles.statInfo}>
                            <Text className={styles.statValue} style={{ color: '#28a745' }}>{stats.Approved || 0}</Text>
                            <Text className={styles.statLabel}>Approved</Text>
                        </div>
                    </div>
                </Card>
                {/* Returned */}
                <Card className={styles.statCard}>
                    <div className={styles.statContent}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#dc354515', color: '#dc3545' }}>
                            <DismissCircle24Regular />
                        </div>
                        <div className={styles.statInfo}>
                            <Text className={styles.statValue} style={{ color: '#dc3545' }}>{stats.Returned || 0}</Text>
                            <Text className={styles.statLabel}>Returned</Text>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalM, flexWrap: 'wrap', gap: tokens.spacingHorizontalM }}>
                <TabList
                    selectedValue={activeTab}
                    onTabSelect={(_, data) => setActiveTab(data.value as string)}
                >
                    <Tab value="all">All Permits</Tab>
                    <Tab value="draft">Draft</Tab>
                    {(user?.workflowStage === 'Execution' || user?.workflowStage === 'Issuer') && (
                        <Tab value="pending">Pending My Action</Tab>
                    )}
                    <Tab value="approved">Approved</Tab>
                    <Tab value="closed">Closed</Tab>
                </TabList>

                <div className={styles.filterBar} style={{ marginBottom: 0 }}>
                    <Input
                        className={styles.searchInput}
                        placeholder="Search by permit number, protocol, or description..."
                        contentBefore={<Search24Regular />}
                        value={searchTerm}
                        onChange={(_, data) => setSearchTerm(data.value)}
                    />
                    <Dropdown
                        placeholder="Filter by status"
                        value={statusFilter}
                        onOptionSelect={(_, data) => setStatusFilter(data.optionValue || '')}
                        style={{ minWidth: '180px' }}
                    >
                        <Option value="">All Status</Option>
                        <Option value="Draft">Draft</Option>
                        <Option value="Pending_Execution">Pending Execution</Option>
                        <Option value="Pending_Issuer">Pending Issuer</Option>
                        <Option value="Approved">Approved</Option>
                        <Option value="Returned">Returned</Option>
                        <Option value="Closed">Closed</Option>
                        <Option value="Cancelled">Cancelled</Option>
                    </Dropdown>
                    {(searchTerm || statusFilter) && (
                        <Button
                            appearance="subtle"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('');
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <Card className={styles.tableCard}>
                <div className={styles.tableWrapper} style={{ position: 'relative' }}>
                    {tableLoading && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                            <Spinner size="medium" label="Loading..." />
                        </div>
                    )}
                    {filteredPermits.length === 0 ? (
                        <div className={styles.emptyState}>
                            <DocumentBulletList24Regular style={{ fontSize: '48px', marginBottom: '16px' }} />
                            <Text>No permits found</Text>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <Table className={styles.desktopTable}>
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell>Permit No.</TableHeaderCell>
                                        <TableHeaderCell className={styles.hideOnSmallTablet}>Protocol No.</TableHeaderCell>
                                        <TableHeaderCell>Status</TableHeaderCell>
                                        <TableHeaderCell className={styles.hideOnSmallTablet}>Stage</TableHeaderCell>
                                        <TableHeaderCell className={styles.hideOnTablet}>Description</TableHeaderCell>
                                        <TableHeaderCell className={styles.hideOnSmallTablet}>Valid Period</TableHeaderCell>
                                        <TableHeaderCell>Actions</TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPermits.map((permit) => (
                                        <TableRow key={permit._id}>
                                            <TableCell>
                                                <TableCellLayout>
                                                    <Text weight="semibold">{permit.permitNumber || 'N/A'}</Text>
                                                </TableCellLayout>
                                            </TableCell>
                                            <TableCell className={styles.hideOnSmallTablet}>
                                                <TableCellLayout>{permit.protocolNumber || 'N/A'}</TableCellLayout>
                                            </TableCell>
                                            <TableCell>
                                                <TableCellLayout>{getStatusBadge(permit.permitStatus, permit)}</TableCellLayout>
                                            </TableCell>
                                            <TableCell className={styles.hideOnSmallTablet}>
                                                <Badge appearance="outline">{permit.currentStage || 'Unknown'}</Badge>
                                            </TableCell>
                                            <TableCell className={styles.hideOnTablet}>
                                                <Tooltip content={permit.permitType === 'height' ? (permit.jobDescription || 'N/A') : (permit.initiator?.briefDescriptionOfWork || 'N/A')} relationship="label">
                                                    <TableCellLayout style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                        {permit.permitType === 'height'
                                                            ? (permit.jobDescription || 'N/A')
                                                            : (permit.initiator?.briefDescriptionOfWork || 'N/A')}
                                                    </TableCellLayout>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className={styles.hideOnSmallTablet}>
                                                <TableCellLayout>
                                                    {permit.permitType === 'height'
                                                        ? (permit.schedule?.startTimeDate?.date && permit.schedule?.finishTimeDate?.date
                                                            ? `${new Date(permit.schedule.startTimeDate.date).toLocaleDateString()} - ${new Date(permit.schedule.finishTimeDate.date).toLocaleDateString()}`
                                                            : permit.schedule?.startTimeDate?.date
                                                                ? new Date(permit.schedule.startTimeDate.date).toLocaleDateString()
                                                                : 'N/A')
                                                        : (permit.initiator?.periodOfWork?.from?.date && permit.initiator?.periodOfWork?.to?.date
                                                            ? `${new Date(permit.initiator.periodOfWork.from.date).toLocaleDateString()} - ${new Date(permit.initiator.periodOfWork.to.date).toLocaleDateString()}`
                                                            : permit.initiator?.periodOfWork?.from?.date
                                                                ? new Date(permit.initiator.periodOfWork.from.date).toLocaleDateString()
                                                                : 'N/A')}
                                                </TableCellLayout>
                                            </TableCell>
                                            <TableCell>{renderActions(permit)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Mobile Card View */}
                            <div className={styles.mobileCardList}>
                                {filteredPermits.map((permit) => (
                                    <div key={permit._id} className={styles.mobileCard}>
                                        <div className={styles.mobileCardHeader}>
                                            <div className={styles.mobileCardTitle}>
                                                <Text weight="semibold" size={400}>{permit.permitNumber || 'N/A'}</Text>
                                                {permit.protocolNumber && (
                                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{permit.protocolNumber}</Text>
                                                )}
                                            </div>
                                            {getStatusBadge(permit.permitStatus, permit)}
                                        </div>

                                        <div className={styles.mobileCardBody}>
                                            <Text className={styles.mobileDescription}>
                                                {permit.permitType === 'height'
                                                    ? (permit.jobDescription || 'N/A')
                                                    : (permit.initiator?.briefDescriptionOfWork || 'N/A')}
                                            </Text>

                                            <div className={styles.mobileCardRow}>
                                                <Text className={styles.mobileCardLabel}>Stage</Text>
                                                <Badge appearance="outline" size="small">{permit.currentStage || 'Unknown'}</Badge>
                                            </div>

                                            <div className={styles.mobileCardRow}>
                                                <Text className={styles.mobileCardLabel}>Valid Period</Text>
                                                <Text className={styles.mobileCardValue}>
                                                    {permit.permitType === 'height'
                                                        ? (permit.schedule?.startTimeDate?.date && permit.schedule?.finishTimeDate?.date
                                                            ? `${new Date(permit.schedule.startTimeDate.date).toLocaleDateString()} - ${new Date(permit.schedule.finishTimeDate.date).toLocaleDateString()}`
                                                            : permit.schedule?.startTimeDate?.date
                                                                ? new Date(permit.schedule.startTimeDate.date).toLocaleDateString()
                                                                : 'N/A')
                                                        : (permit.initiator?.periodOfWork?.from?.date && permit.initiator?.periodOfWork?.to?.date
                                                            ? `${new Date(permit.initiator.periodOfWork.from.date).toLocaleDateString()} - ${new Date(permit.initiator.periodOfWork.to.date).toLocaleDateString()}`
                                                            : permit.initiator?.periodOfWork?.from?.date
                                                                ? new Date(permit.initiator.periodOfWork.from.date).toLocaleDateString()
                                                                : 'N/A')}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className={styles.mobileCardFooter}>
                                            {renderActions(permit)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: tokens.spacingHorizontalL,
                    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
                    flexWrap: 'wrap',
                    gap: tokens.spacingHorizontalM,
                }}>
                    <Text style={{ color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200 }}>
                        Page {currentPage} of {totalPages} ({permits.length} items)
                    </Text>
                    <div style={{ display: 'flex', gap: tokens.spacingHorizontalS }}>
                        <Button
                            appearance="subtle"
                            size="small"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                        >
                            ← Previous
                        </Button>
                        <Button
                            appearance="subtle"
                            size="small"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                        >
                            Next →
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Modals */}
            {selectedPermit && (
                <>
                    {/* Execution Approval Modal */}
                    <ExecutionApprovalForm
                        open={showExecutionApprovalModal}
                        onClose={() => setShowExecutionApprovalModal(false)}
                        permit={selectedPermit ? { _id: selectedPermit._id, permitNumber: selectedPermit.permitNumber || '' } : null}
                        onSubmit={handleExecutionApprove}
                    />

                    {/* Issuer Approval Modal */}
                    <IssuerApprovalForm
                        open={showIssuerApprovalModal}
                        onClose={() => setShowIssuerApprovalModal(false)}
                        permit={selectedPermit ? { _id: selectedPermit._id, permitNumber: selectedPermit.permitNumber || '' } : null}
                        onSubmit={handleIssuerApprove}
                    />

                    {/* Cancel Modal */}
                    <CancelPermitModal
                        open={showCancelModal}
                        onClose={() => setShowCancelModal(false)}
                        permit={selectedPermit ? { _id: selectedPermit._id, permitNumber: selectedPermit.permitNumber || '' } : null}
                        onSubmit={handleCancelPermit}
                        isLoading={actionLoading === `cancel-${selectedPermit?._id}`}
                    />

                    {/* Renew Modal */}
                    <RenewPermitModal
                        open={showRenewModal}
                        onClose={() => setShowRenewModal(false)}
                        permit={selectedPermit as any}
                        onSubmit={handleRenewPermit}
                        isLoading={actionLoading === `renew-${selectedPermit?._id}`}
                    />

                    {/* Executor Selection Modal */}
                    <ExecutorSelectionModal
                        open={showExecutorModal}
                        onClose={() => setShowExecutorModal(false)}
                        permitNumber={selectedPermit.permitNumber || ''}
                        onSelectExecutor={handleExecutorSelected}
                    />

                    {/* Issuer Selection Modal */}
                    <IssuerSelectionModal
                        open={showIssuerModal}
                        onClose={() => setShowIssuerModal(false)}
                        permitNumber={selectedPermit.permitNumber || ''}
                        onSelectIssuer={handleIssuerSelected}
                    />

                    {/* Initiator Closure Modal */}
                    <InitiatorClosureModal
                        open={showInitiatorClosureModal}
                        onClose={() => setShowInitiatorClosureModal(false)}
                        permitNumber={selectedPermit.permitNumber || ''}
                        user={user as any}
                        onConfirm={handleInitiatorClosure}
                        isLoading={actionLoading === `closure-${selectedPermit?._id}`}
                    />

                    {/* Executor Closure Drawer (General Permits) */}
                    <ExecutorClosureDrawer
                        open={showExecutorClosureModal}
                        onClose={() => setShowExecutorClosureModal(false)}
                        permitNumber={selectedPermit.permitNumber || ''}
                        onConfirm={handleExecutorClosure}
                        isLoading={actionLoading === `executor-closure-${selectedPermit?._id}`}
                    />

                    {/* Height Permit Executor Closure Drawer */}
                    <HeightPermitExecutorClosureDrawer
                        open={showHeightPermitExecutorClosure}
                        onClose={() => setShowHeightPermitExecutorClosure(false)}
                        permit={selectedPermit as any}
                        onConfirm={handleExecutorClosure}
                        isLoading={actionLoading === `executor-closure-${selectedPermit?._id}`}
                    />

                    {/* Issuer Closure Drawer (General Permits) */}
                    <IssuerClosureDrawer
                        open={showIssuerClosureModal}
                        onClose={() => setShowIssuerClosureModal(false)}
                        permitNumber={selectedPermit.permitNumber || ''}
                        onConfirm={handleIssuerClosure}
                        isLoading={actionLoading === `issuer-closure-${selectedPermit?._id}`}
                    />

                    {/* Height Permit Issuer Closure Drawer */}
                    <HeightPermitIssuerClosureDrawer
                        open={showHeightPermitIssuerClosure}
                        onClose={() => setShowHeightPermitIssuerClosure(false)}
                        permit={selectedPermit as any}
                        onConfirm={handleIssuerClosure}
                        isLoading={actionLoading === `issuer-closure-${selectedPermit?._id}`}
                    />
                </>
            )}

            {/* Return Reason Dialog */}
            <Dialog open={showReturnDialog} onOpenChange={(_, d) => !d.open && setShowReturnDialog(false)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Return Permit</DialogTitle>
                        <DialogContent>
                            <Text style={{ marginBottom: '16px' }}>
                                Please provide a reason for returning this permit:
                            </Text>
                            <Textarea
                                placeholder="Enter return reason..."
                                value={returnReason}
                                onChange={(_, data) => setReturnReason(data.value)}
                                style={{ width: '100%', minHeight: '100px' }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setShowReturnDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleReturn}
                                disabled={!returnReason.trim() || actionLoading !== null}
                            >
                                Return Permit
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            {/* Renewal Approval Drawer - Works for both Executor AND Issuer */}
            <RenewalApprovalDrawer
                open={showRenewalApprovalDrawer}
                onClose={() => setShowRenewalApprovalDrawer(false)}
                permit={selectedPermit as any}
                onApprove={async (comments) => {
                    try {
                        setActionLoading(`renewal-approve-${selectedPermit?._id}`);

                        // Determine which API to call based on permit status AND permit type
                        const isPendingExecution = selectedPermit?.permitStatus === 'Pending_Execution';
                        const isHeightPermit = selectedPermit?.permitType === 'height';

                        if (isPendingExecution) {
                            // Executor stage: forward to issuer
                            if (isHeightPermit) {
                                const issuerId = typeof selectedPermit?.assignedIssuer === 'string'
                                    ? selectedPermit.assignedIssuer
                                    : selectedPermit?.assignedIssuer?._id || '';
                                await executionApproveHeightPermit(selectedPermit!._id, {
                                    assignedIssuerId: issuerId,
                                    comments,
                                    isRenewalApproval: true,
                                });
                            } else {
                                await executionApprove(selectedPermit!._id, {
                                    comments,
                                    isRenewalApproval: true,
                                } as any);
                            }
                            toast.success('Renewal approved and forwarded to issuer');
                        } else {
                            // Issuer stage: final approval (updates permit period)
                            if (isHeightPermit) {
                                await issuerApproveHeightPermit(selectedPermit!._id, {
                                    comments,
                                    isRenewalApproval: true,
                                    approved: true,
                                });
                            } else {
                                await issuerApprove(selectedPermit!._id, {
                                    comments,
                                    isRenewalApproval: true,
                                    approved: true,
                                } as any);
                            }
                            toast.success('Renewal approved - Period updated successfully');
                        }

                        setShowRenewalApprovalDrawer(false);
                        await fetchPermits(currentPage, true);
                        await fetchStats();
                    } catch (error: any) {
                        toast.error(error.response?.data?.message || 'Failed to approve renewal');
                    } finally {
                        setActionLoading(null);
                    }
                }}
                onReject={async (reason) => {
                    try {
                        setActionLoading(`renewal-reject-${selectedPermit?._id}`);

                        // Determine which API to call based on permit status AND permit type
                        const isPendingExecution = selectedPermit?.permitStatus === 'Pending_Execution';
                        const isHeightPermit = selectedPermit?.permitType === 'height';

                        if (isPendingExecution) {
                            // Executor stage: return to initiator
                            if (isHeightPermit) {
                                await executionReturnHeightPermit(selectedPermit!._id, reason);
                            } else {
                                await executionReturn(selectedPermit!._id, { returnedReason: reason, comments: reason });
                            }
                            toast.success('Renewal rejected and returned to initiator');
                        } else {
                            // Issuer stage: return to initiator
                            if (isHeightPermit) {
                                await issuerReturnHeightPermit(selectedPermit!._id, reason);
                            } else {
                                await issuerReturn(selectedPermit!._id, { returnedReason: reason, comments: reason });
                            }
                            toast.success('Renewal rejected and returned to initiator');
                        }

                        setShowRenewalApprovalDrawer(false);
                        await fetchPermits(currentPage, true);
                        await fetchStats();
                    } catch (error: any) {
                        toast.error(error.response?.data?.message || 'Failed to reject renewal');
                    } finally {
                        setActionLoading(null);
                    }
                }}
                isLoading={actionLoading?.startsWith('renewal-') || false}
            />

            {/* Add/Edit Permit Drawer */}
            <AddPermitDrawer
                isOpen={showAddPermitDrawer}
                onClose={() => {
                    setShowAddPermitDrawer(false);
                    setEditPermitId(null);
                }}
                onPermitCreated={() => {
                    fetchPermits(1, true);
                    fetchStats();
                    setEditPermitId(null);
                }}
                editPermitId={editPermitId}
            />

            {/* Permit Type Selection Modal */}
            <PermitTypeSelectionModal
                isOpen={showPermitTypeModal}
                onClose={() => setShowPermitTypeModal(false)}
                onSelectGeneralPermit={() => {
                    setShowPermitTypeModal(false);
                    setShowAddPermitDrawer(true);
                }}
                onSelectHeightPermit={() => {
                    setShowPermitTypeModal(false);
                    setShowCreateHeightPermitDrawer(true);
                }}
            />

            {/* Create/Edit Height Permit Drawer */}
            <CreateHeightPermitDrawer
                isOpen={showCreateHeightPermitDrawer}
                onClose={() => {
                    setShowCreateHeightPermitDrawer(false);
                    setEditHeightPermitId(null);
                }}
                onSuccess={() => {
                    fetchPermits(1, true);
                    fetchStats();
                    setEditHeightPermitId(null);
                }}
                permitToEdit={editHeightPermitId ? ({ _id: editHeightPermitId } as any) : null}
            />

            {/* Height Permit Execution Approval Drawer */}
            <HeightPermitExecutionApprovalDrawer
                open={showHeightPermitExecutionApproval}
                onClose={() => {
                    setShowHeightPermitExecutionApproval(false);
                    setSelectedHeightPermitId(null);
                }}
                permitId={selectedHeightPermitId}
                onSuccess={() => {
                    fetchPermits(currentPage, true);
                    fetchStats();
                }}
            />

            {/* Height Permit Issuer Approval Drawer */}
            <HeightPermitIssuerApprovalDrawer
                open={showHeightPermitIssuerApproval}
                onClose={() => {
                    setShowHeightPermitIssuerApproval(false);
                    setSelectedHeightPermitId(null);
                }}
                permitId={selectedHeightPermitId}
                onSuccess={() => {
                    fetchPermits(currentPage, true);
                    fetchStats();
                }}
            />

            {/* Permit Details Drawer */}
            <Drawer
                open={showDetailsModal}
                onOpenChange={(_, d) => {
                    if (!d.open) {
                        setShowDetailsModal(false);
                        setSelectedPermit(null);
                    }
                }}
                position="end"
                size="large"
            >
                <DrawerHeader style={{
                    background: selectedPermit?.permitType === 'height'
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)',
                    color: 'white',
                }}>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedPermit(null);
                                }}
                                style={{ color: 'white' }}
                            />
                        }
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
                            <Text style={{ fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightBold, color: 'white' }}>
                                {selectedPermit?.permitType === 'height' ? 'Height Work Permit' : 'General Work Permit'}
                            </Text>
                            {selectedPermit?.permitNumber && (
                                <Badge appearance="tint" color="brand">
                                    {selectedPermit.permitNumber}
                                </Badge>
                            )}
                        </div>
                    </DrawerHeaderTitle>
                </DrawerHeader>
                <DrawerBody style={{ padding: 0, overflow: 'auto' }}>
                    {selectedPermit && selectedPermit.permitType === 'height' ? (
                        <HeightPermitDetails
                            permit={selectedPermit as any}
                            canDownload={true}
                        />
                    ) : selectedPermit ? (
                        <PermitDetails
                            permit={selectedPermit as any}
                            canDownload={true}
                        />
                    ) : null}
                </DrawerBody>
            </Drawer>
        </div>
    );
};

export default PermitsTablePage;
