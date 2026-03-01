/**
 * Dashboard Page - Redesigned to match modern dashboard layout
 * Features: Compact Stats Section, Last Permits, Validation Queue (notifications), Performance Review
 * Display-only mode - no clickable actions
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    makeStyles,
    tokens,
    Text,
    Badge,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Avatar,
    Input,
    Dropdown,
    Option,
    Button,
    Drawer,
    DrawerHeader,
    DrawerHeaderTitle,
    DrawerBody,
    Spinner,
    Tooltip,
} from '@fluentui/react-components';
import {
    Warning24Regular,
    Clock24Regular,
    ArrowRight16Regular,
    Search24Regular,
    DocumentBulletList24Regular,
    Info24Regular,
    Dismiss16Regular,
    Dismiss24Regular,
    Eye24Regular,
    Checkmark24Regular,
    ChevronLeft20Regular,
    ChevronRight20Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import {
    getDashboardStats,
    getDashboardPermits,
    getRecentUserActivity,
    getValidationQueue,
    getPermitById,
    getHeightPermitById,
    type DashboardStats,
    type DashboardPermit,
    type UserActivity,
    type ValidationQueue,
} from '@/services';
import { PageLoading } from '@/components/common';
import { PermitDetails, HeightPermitDetails } from '@/components/permits';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: tokens.spacingHorizontalL,
        padding: tokens.spacingHorizontalL,
        maxWidth: '1600px',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        margin: '0 auto',
        minHeight: 'calc(100vh - 120px)',
        '@media (max-width: 1200px)': {
            gridTemplateColumns: '1fr',
        },
        '@media (max-width: 480px)': {
            padding: tokens.spacingHorizontalS,
            gap: tokens.spacingHorizontalS,
        },
    },
    mainContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
        minWidth: 0,
        overflowX: 'hidden',
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
        minWidth: 0,
        '@media (max-width: 1200px)': {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.spacingHorizontalM,
        },
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
        },
    },
    // Compact Stats Section - Match reference image
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 900px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
        '@media (max-width: 500px)': {
            gridTemplateColumns: '1fr',
        },
    },
    statCard: {
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
        borderRadius: tokens.borderRadiusLarge,
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: tokens.shadow4,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        minHeight: '60px',
    },
    statIcon: {
        width: '40px',
        height: '40px',
        borderRadius: tokens.borderRadiusMedium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    statContent: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    statValue: {
        fontSize: '24px',
        fontWeight: tokens.fontWeightBold,
        lineHeight: 1,
    },
    statLabel: {
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground3,
    },
    // Last Permits Section
    permitsCard: {
        borderRadius: tokens.borderRadiusLarge,
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: tokens.shadow4,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    cardTitle: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
    },
    filterRow: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        flexWrap: 'wrap',
        '@media (max-width: 480px)': {
            padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
        },
    },
    filterButton: {
        borderRadius: '20px',
        padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
        fontSize: tokens.fontSizeBase200,
        backgroundColor: '#0066cc',
        color: 'white',
        border: 'none',
    },
    filterButtonInactive: {
        borderRadius: '20px',
        padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
        fontSize: tokens.fontSizeBase200,
        backgroundColor: tokens.colorNeutralBackground3,
        color: tokens.colorNeutralForeground1,
        border: 'none',
    },
    searchContainer: {
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        '@media (max-width: 480px)': {
            flexBasis: '100%',
            justifyContent: 'stretch',
        },
    },
    searchInput: {
        width: '200px',
        '@media (max-width: 768px)': {
            width: '150px',
        },
        '@media (max-width: 480px)': {
            width: '100%',
            minWidth: 0,
            flex: 1,
        },
    },
    tableContainer: {
        overflowX: 'auto',
        '@media (max-width: 768px)': {
            overflowX: 'hidden',
        },
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        '@media (max-width: 768px)': {
            display: 'none',
        },
    },
    tableRow: {
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    tableCell: {
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        verticalAlign: 'middle',
    },
    tableCellHeader: {
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    // Hide less important columns on tablet
    hideOnTablet: {
        '@media (max-width: 1024px)': {
            display: 'none',
        },
    },
    // Hide on small tablets
    hideOnSmallTablet: {
        '@media (max-width: 900px)': {
            display: 'none',
        },
    },
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    userName: {
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase300,
    },
    permitId: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    statusBadge: {
        fontSize: tokens.fontSizeBase100,
        padding: '2px 8px',
        borderRadius: '12px',
    },
    expirationBadge: {
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightMedium,
    },
    // Mobile Card List (visible only on mobile)
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
    mobileCardUser: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        flex: 1,
        minWidth: 0,
    },
    mobileCardUserInfo: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
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
    },
    mobileCardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: tokens.spacingVerticalXS,
        paddingTop: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    mobileDescription: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
    },
    settingsIcon: {
        padding: '4px',
        borderRadius: '4px',
    },
    // Validation Queue Section - Notifications only
    validationCard: {
        borderRadius: tokens.borderRadiusLarge,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: tokens.shadow8,
        padding: tokens.spacingHorizontalL,
        color: 'white',
    },
    validationHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalM,
    },
    validationTitle: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        color: 'white',
    },
    // Recent Notifications
    notificationsList: {
        marginTop: tokens.spacingVerticalXS,
        maxHeight: '200px',
        overflowY: 'auto',
        paddingRight: '4px',
    },
    notificationItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: tokens.spacingHorizontalS,
        padding: `${tokens.spacingVerticalS} 0`,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        ':last-child': {
            borderBottom: 'none',
        },
    },
    notificationIcon: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    notificationContent: {
        flex: 1,
        minWidth: 0,
    },
    notificationTitle: {
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    notificationMessage: {
        fontSize: tokens.fontSizeBase100,
        opacity: 0.85,
        marginTop: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    notificationTime: {
        fontSize: tokens.fontSizeBase100,
        opacity: 0.6,
        marginTop: '2px',
    },
    validationAlert: {
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalM,
        display: 'flex',
        alignItems: 'flex-start',
        gap: tokens.spacingHorizontalS,
        marginTop: tokens.spacingVerticalM,
    },
    validationAlertIcon: {
        flexShrink: 0,
        marginTop: '2px',
    },
    validationAlertText: {
        fontSize: tokens.fontSizeBase200,
        opacity: 0.9,
        flex: 1,
    },
    validationAlertClose: {
        flexShrink: 0,
        cursor: 'pointer',
        opacity: 0.7,
        ':hover': {
            opacity: 1,
        },
    },
    // Performance Review Section
    performanceCard: {
        borderRadius: tokens.borderRadiusLarge,
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: tokens.shadow4,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        padding: tokens.spacingHorizontalL,
    },
    performanceHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalM,
    },
    performanceList: {
        maxHeight: '180px',
        overflowY: 'auto',
        paddingRight: '4px',
    },
    performanceItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacingVerticalS} 0`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        ':last-child': {
            borderBottom: 'none',
        },
    },
    performanceUser: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        flex: 1,
        minWidth: 0,
    },
    performanceInfo: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },
    performanceStats: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '2px',
        flexShrink: 0,
    },
    actionCount: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    roleTag: {
        fontSize: tokens.fontSizeBase100,
        padding: '2px 8px',
        borderRadius: '4px',
        backgroundColor: tokens.colorNeutralBackground3,
    },
    statArrow: {
        width: '24px',
        height: '24px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.colorNeutralBackground3,
        color: tokens.colorNeutralForeground3,
    },
    // Total Permits Summary
    possibleClientsCard: {
        borderRadius: tokens.borderRadiusLarge,
        backgroundColor: tokens.colorNeutralBackground1,
        boxShadow: tokens.shadow4,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        padding: tokens.spacingHorizontalL,
    },
    possibleClientsHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    avatarGroup: {
        display: 'flex',
        marginLeft: tokens.spacingHorizontalXS,
    },
    overlappingAvatar: {
        marginLeft: '-8px',
        border: `2px solid ${tokens.colorNeutralBackground1}`,
    },
    // Empty state
    emptyState: {
        textAlign: 'center',
        padding: tokens.spacingVerticalL,
        color: tokens.colorNeutralForeground3,
    },
    emptyStateWhite: {
        textAlign: 'center',
        padding: tokens.spacingVerticalM,
        opacity: 0.7,
    },
    // View button
    viewButton: {
        minWidth: 'auto',
        padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    },
    // Modal
    modalLarge: {
        maxWidth: '900px',
        width: '90vw',
    },
    loadingCenter: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: tokens.spacingVerticalXXL,
    },
    // Pagination
    paginationContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    paginationInfo: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    paginationButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
    },
    // Responsive pagination
    paginationContainerMobile: {
        '@media (max-width: 480px)': {
            flexDirection: 'column',
            gap: tokens.spacingVerticalS,
            alignItems: 'stretch',
        },
    },
});

const DashboardPage: React.FC = () => {
    const styles = useStyles();
    const { user } = useUser(); // Get current logged-in user

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [permits, setPermits] = useState<DashboardPermit[]>([]);
    const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
    const [_validationQueue, setValidationQueue] = useState<ValidationQueue | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAlert, setShowAlert] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'closed'>('all');
    const [sortBy, setSortBy] = useState<'createdAt' | 'permitNumber' | 'status'>('createdAt');

    // Permit details modal state
    const [selectedPermit, setSelectedPermit] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsRes, permitsRes, activityRes, validationRes] = await Promise.allSettled([
                getDashboardStats(),
                getDashboardPermits(1, 100, '', 'createdAt', 'desc'),
                getRecentUserActivity(5),
                getValidationQueue(10),
            ]);

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value.data);
            }
            if (permitsRes.status === 'fulfilled') {
                setPermits(permitsRes.value.data.permits || []);
            }
            if (activityRes.status === 'fulfilled') {
                setUserActivity(activityRes.value.data || []);
            }
            if (validationRes.status === 'fulfilled') {
                setValidationQueue(validationRes.value.data);
            }
        } catch {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Reset pagination when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilter]);

    const getStatusBadge = (status: string, permit?: DashboardPermit) => {
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
                <Badge appearance="filled" color="informative" className={styles.statusBadge}>
                    • Pending Closure
                </Badge>
            );
        }

        // If it's a pending status with active renewal, show "Renewal"
        if (hasPendingRenewal && (status === 'Pending_Execution' || status === 'Pending_Issuer')) {
            return (
                <Badge appearance="filled" color="important" className={styles.statusBadge}>
                    • Renewal
                </Badge>
            );
        }

        const statusConfig: Record<string, { color: 'success' | 'warning' | 'danger' | 'informative'; label: string }> = {
            Approved: { color: 'success', label: 'Approved' },
            Pending_Execution: { color: 'warning', label: 'Pending' },
            Pending_Issuer: { color: 'warning', label: 'Pending' },
            Returned: { color: 'danger', label: 'Returned' },
            Draft: { color: 'informative', label: 'Draft' },
            Closed: { color: 'informative', label: 'Closed' },
        };
        const config = statusConfig[status] || { color: 'informative', label: status?.replace(/_/g, ' ') || 'Unknown' };
        return (
            <Badge appearance="filled" color={config.color} className={styles.statusBadge}>
                • {config.label}
            </Badge>
        );
    };

    const getPermitSource = (permitType: string) => {
        return permitType === 'height' ? 'Height Work' : 'General Work';
    };

    const filteredPermits = useMemo(() => {
        let result = permits.filter((permit) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                permit.permitNumber?.toLowerCase().includes(searchLower) ||
                permit.description?.toLowerCase().includes(searchLower) ||
                permit.createdBy?.name?.toLowerCase().includes(searchLower);

            // Filter by status
            if (activeFilter === 'active') {
                return matchesSearch && permit.status === 'Approved';
            } else if (activeFilter === 'closed') {
                return matchesSearch && permit.status === 'Closed';
            }
            return matchesSearch;
        });

        // Sort
        result = [...result].sort((a, b) => {
            if (sortBy === 'permitNumber') {
                return (a.permitNumber || '').localeCompare(b.permitNumber || '');
            } else if (sortBy === 'status') {
                return (a.status || '').localeCompare(b.status || '');
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return result;
    }, [permits, searchTerm, activeFilter, sortBy]);

    // Get pending permits for the current logged-in user (including renewal requests and closure)
    const myPendingPermits = useMemo(() => {
        if (!user) return [];
        const userId = user._id || (user as any).id;

        return permits.filter((permit) => {
            // Check if the permit is pending (Pending_Execution or Pending_Issuer)
            const isPending = permit.status === 'Pending_Execution' || permit.status === 'Pending_Issuer';

            // Check if the permit has a pending renewal request
            const p = permit as any;
            const hasPendingRenewal = p?.pendingRenewal && (
                p.pendingRenewal.isActive === true ||
                p.pendingRenewal.requestedAt
            );

            // Check if the permit is pending closure
            const isPendingClosure =
                p?.currentStage === 'Closure_Initiated' ||
                p?.currentStage === 'Closure_Executor' ||
                p?.currentStage === 'Closure_Issuer' ||
                p?.stage === 'closure_initiated' ||
                p?.stage === 'closure_executor' ||
                p?.stage === 'closure_issuer';

            // Include if pending OR if approved with pending renewal OR pending closure
            if (!isPending && !hasPendingRenewal && !isPendingClosure) return false;

            // Check if the permit belongs to the current user (created by them or assigned to them)
            const createdById = permit.createdBy?._id;
            const executorId = permit.assignedExecutor?._id;
            const issuerId = permit.assignedIssuer?._id;

            return createdById === userId || executorId === userId || issuerId === userId;
        }).slice(0, 5); // Limit to 5 most recent
    }, [permits, user]);

    const getRoleTag = (workflowStage?: string) => {
        const roleMap: Record<string, string> = {
            Initiator: 'Initiator',
            Execution: 'Executor',
            Issuer: 'Issuer',
        };
        return roleMap[workflowStage || ''] || 'User';
    };

    // Helper to extract profile picture URL (handles both string and object formats)
    const getProfilePicUrl = (pic: any): string | undefined => {
        if (!pic) return undefined;
        if (typeof pic === 'string') return pic;
        if (typeof pic === 'object' && pic.url) return pic.url;
        return undefined;
    };

    const formatTimeAgo = (date?: string) => {
        if (!date) return '';
        const now = new Date();
        const then = new Date(date);
        const diff = now.getTime() - then.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    // Handle viewing permit details
    const handleViewDetails = async (permit: DashboardPermit) => {
        try {
            setLoadingDetails(true);
            setShowDetailsModal(true);

            // Fetch full permit details
            if (permit.permitType === 'height') {
                const response = await getHeightPermitById(permit._id);
                setSelectedPermit({ ...response.data, permitType: 'height' });
            } else {
                const response = await getPermitById(permit._id);
                setSelectedPermit({ ...response.data, permitType: 'general' });
            }
        } catch (error) {
            toast.error('Failed to load permit details');
            setShowDetailsModal(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    if (loading) return <PageLoading label="Loading dashboard..." />;

    // Compact stats: Total, Draft, Total Pending (Executor + Issuer), Total Approved
    const totalPending = (stats?.pendingExecution || 0) + (stats?.pendingIssuer || 0);
    const statCards = [
        {
            label: 'Total Permits',
            value: stats?.totalPermits || 0,
            icon: <DocumentBulletList24Regular />,
            color: '#0284c7',
            bgColor: '#e0f2fe',
        },
        {
            label: 'Draft',
            value: stats?.draftPermits || 0,
            icon: <Clock24Regular />,
            color: '#6b7280',
            bgColor: '#f3f4f6',
        },
        {
            label: 'Total Pending',
            value: totalPending,
            icon: <Warning24Regular />,
            color: '#f59e0b',
            bgColor: '#fef3c7',
        },
        {
            label: 'Total Approved',
            value: stats?.activePermits || 0,
            icon: <Checkmark24Regular />,
            color: '#16a34a',
            bgColor: '#dcfce7',
        },
    ];

    return (
        <div className={styles.container}>
            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Compact Stats Row - matching reference image */}
                <div className={styles.statsRow}>
                    {statCards.map((stat) => (
                        <div key={stat.label} className={styles.statCard}>
                            <div
                                className={styles.statIcon}
                                style={{ backgroundColor: stat.bgColor, color: stat.color }}
                            >
                                {stat.icon}
                            </div>
                            <div className={styles.statContent}>
                                <Text className={styles.statValue} style={{ color: stat.color }}>
                                    {stat.value}
                                </Text>
                                <Text className={styles.statLabel}>{stat.label}</Text>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Permits Section */}
                <div className={styles.permitsCard}>
                    <div className={styles.filterRow}>
                        <span
                            className={activeFilter === 'all' ? styles.filterButton : styles.filterButtonInactive}
                            onClick={() => setActiveFilter('all')}
                            style={{ cursor: 'pointer' }}
                        >
                            All
                        </span>
                        <span
                            className={activeFilter === 'active' ? styles.filterButton : styles.filterButtonInactive}
                            onClick={() => setActiveFilter('active')}
                            style={{ cursor: 'pointer' }}
                        >
                            Active
                        </span>
                        <span
                            className={activeFilter === 'closed' ? styles.filterButton : styles.filterButtonInactive}
                            onClick={() => setActiveFilter('closed')}
                            style={{ cursor: 'pointer' }}
                        >
                            Closed
                        </span>
                        <div className={styles.searchContainer}>
                            <Input
                                placeholder="Search..."
                                contentBefore={<Search24Regular />}
                                className={styles.searchInput}
                                value={searchTerm}
                                onChange={(_, data) => setSearchTerm(data.value)}
                            />
                            <Dropdown
                                placeholder="Sort by"
                                value={sortBy === 'createdAt' ? 'Date' : sortBy === 'permitNumber' ? 'Permit #' : 'Status'}
                                onOptionSelect={(_, data) => {
                                    const val = data.optionValue as string;
                                    if (val === 'date') setSortBy('createdAt');
                                    else if (val === 'permitNumber') setSortBy('permitNumber');
                                    else if (val === 'status') setSortBy('status');
                                }}
                                style={{ minWidth: '100px' }}
                            >
                                <Option value="date">Date</Option>
                                <Option value="permitNumber">Permit #</Option>
                                <Option value="status">Status</Option>
                            </Dropdown>
                        </div>
                    </div>
                    <div className={styles.tableContainer}>
                        {filteredPermits.length === 0 ? (
                            <div className={styles.emptyState}>
                                <DocumentBulletList24Regular style={{ fontSize: '48px', marginBottom: '12px' }} />
                                <Text>No permits found</Text>
                            </div>
                        ) : (
                            <>
                                {/* Desktop/Tablet Table View */}
                                <Table className={styles.table}>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHeaderCell className={styles.tableCellHeader}>Client</TableHeaderCell>
                                            <TableHeaderCell className={styles.tableCellHeader}>Permit ID</TableHeaderCell>
                                            <TableHeaderCell className={`${styles.tableCellHeader} ${styles.hideOnTablet}`}>Description</TableHeaderCell>
                                            <TableHeaderCell className={`${styles.tableCellHeader} ${styles.hideOnSmallTablet}`}>Permit Type</TableHeaderCell>
                                            <TableHeaderCell className={`${styles.tableCellHeader} ${styles.hideOnSmallTablet}`}>Assignee</TableHeaderCell>
                                            <TableHeaderCell className={styles.tableCellHeader}>Status</TableHeaderCell>
                                            <TableHeaderCell className={styles.tableCellHeader}>Action</TableHeaderCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPermits
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((permit) => (
                                                <TableRow key={permit._id} className={styles.tableRow}>
                                                    <TableCell className={styles.tableCell}>
                                                        <div className={styles.userCell}>
                                                            <Avatar
                                                                name={permit.createdBy?.name || 'Unknown'}
                                                                image={getProfilePicUrl(permit.createdBy?.profilePicture) ? { src: getProfilePicUrl(permit.createdBy?.profilePicture) } : undefined}
                                                                size={32}
                                                            />
                                                            <span className={styles.userName}>
                                                                {permit.createdBy?.name?.split(' ').map(n => n[0]).join('. ') + '.' || 'Unknown'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={styles.tableCell}>
                                                        <span className={styles.permitId}>#{permit.permitNumber || 'N/A'}</span>
                                                    </TableCell>
                                                    <TableCell className={`${styles.tableCell} ${styles.hideOnTablet}`}>
                                                        <Tooltip
                                                            content={permit.description || '-'}
                                                            relationship="description"
                                                            withArrow
                                                        >
                                                            <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', cursor: 'pointer' }}>
                                                                {permit.description || '-'}
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell className={`${styles.tableCell} ${styles.hideOnSmallTablet}`}>
                                                        {getPermitSource(permit.permitType)}
                                                    </TableCell>
                                                    <TableCell className={`${styles.tableCell} ${styles.hideOnSmallTablet}`}>
                                                        <div className={styles.userCell}>
                                                            <Avatar
                                                                name={permit.assignedExecutor?.name || permit.assignedIssuer?.name || 'Unassigned'}
                                                                image={getProfilePicUrl(permit.assignedExecutor?.profilePicture) || getProfilePicUrl(permit.assignedIssuer?.profilePicture) ? { src: getProfilePicUrl(permit.assignedExecutor?.profilePicture) || getProfilePicUrl(permit.assignedIssuer?.profilePicture) } : undefined}
                                                                size={24}
                                                            />
                                                            <span>
                                                                {permit.assignedExecutor?.name?.split(' ')[0] ||
                                                                    permit.assignedIssuer?.name?.split(' ')[0] ||
                                                                    'Unassigned'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={styles.tableCell}>
                                                        {getStatusBadge(permit.status, permit)}
                                                    </TableCell>
                                                    <TableCell className={styles.tableCell}>
                                                        <Button
                                                            className={styles.viewButton}
                                                            appearance="subtle"
                                                            size="small"
                                                            icon={<Eye24Regular />}
                                                            onClick={() => handleViewDetails(permit)}
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>

                                {/* Mobile Card View */}
                                <div className={styles.mobileCardList}>
                                    {filteredPermits
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((permit) => (
                                            <div key={permit._id} className={styles.mobileCard}>
                                                <div className={styles.mobileCardHeader}>
                                                    <div className={styles.mobileCardUser}>
                                                        <Avatar
                                                            name={permit.createdBy?.name || 'Unknown'}
                                                            image={getProfilePicUrl(permit.createdBy?.profilePicture) ? { src: getProfilePicUrl(permit.createdBy?.profilePicture) } : undefined}
                                                            size={40}
                                                        />
                                                        <div className={styles.mobileCardUserInfo}>
                                                            <Text weight="semibold">
                                                                {permit.createdBy?.name || 'Unknown'}
                                                            </Text>
                                                            <Text className={styles.permitId}>
                                                                #{permit.permitNumber || 'N/A'}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(permit.status, permit)}
                                                </div>

                                                <div className={styles.mobileCardBody}>
                                                    {permit.description && (
                                                        <Text className={styles.mobileDescription}>
                                                            {permit.description}
                                                        </Text>
                                                    )}
                                                    <div className={styles.mobileCardRow}>
                                                        <Text className={styles.mobileCardLabel}>Type</Text>
                                                        <Text className={styles.mobileCardValue}>
                                                            {getPermitSource(permit.permitType)}
                                                        </Text>
                                                    </div>
                                                    <div className={styles.mobileCardRow}>
                                                        <Text className={styles.mobileCardLabel}>Assignee</Text>
                                                        <div className={styles.userCell}>
                                                            <Avatar
                                                                name={permit.assignedExecutor?.name || permit.assignedIssuer?.name || 'Unassigned'}
                                                                size={20}
                                                            />
                                                            <Text className={styles.mobileCardValue}>
                                                                {permit.assignedExecutor?.name?.split(' ')[0] ||
                                                                    permit.assignedIssuer?.name?.split(' ')[0] ||
                                                                    'Unassigned'}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={styles.mobileCardFooter}>
                                                    <Text style={{ fontSize: tokens.fontSizeBase100, color: tokens.colorNeutralForeground3 }}>
                                                        {new Date(permit.createdAt).toLocaleDateString()}
                                                    </Text>
                                                    <Button
                                                        appearance="primary"
                                                        size="small"
                                                        icon={<Eye24Regular />}
                                                        onClick={() => handleViewDetails(permit)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                    {/* Pagination Controls */}
                    {filteredPermits.length > 0 && (
                        <div className={styles.paginationContainer}>
                            <Text className={styles.paginationInfo}>
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredPermits.length)} - {Math.min(currentPage * itemsPerPage, filteredPermits.length)} of {filteredPermits.length}
                            </Text>
                            <div className={styles.paginationButtons}>
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<ChevronLeft20Regular />}
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<ChevronRight20Regular />}
                                    iconPosition="after"
                                    disabled={currentPage >= Math.ceil(filteredPermits.length / itemsPerPage)}
                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredPermits.length / itemsPerPage), prev + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className={styles.sidebar}>
                {/* My Pending Permits - Shows current user's pending permits */}
                <div className={styles.validationCard}>
                    <div className={styles.validationHeader}>
                        <Text className={styles.validationTitle}>My Pending Permits</Text>
                        <div
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Clock24Regular style={{ width: '16px', height: '16px' }} />
                        </div>
                    </div>

                    {/* User's Pending Permits List */}
                    <div className={styles.notificationsList}>
                        {myPendingPermits.length > 0 ? (
                            myPendingPermits.map((permit) => (
                                <div
                                    key={permit._id}
                                    className={styles.notificationItem}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleViewDetails(permit)}
                                >
                                    <div className={styles.notificationIcon}>
                                        <DocumentBulletList24Regular style={{ width: '16px', height: '16px' }} />
                                    </div>
                                    <div className={styles.notificationContent}>
                                        <Text className={styles.notificationTitle}>
                                            #{permit.permitNumber || 'N/A'}
                                        </Text>
                                        <Text className={styles.notificationMessage}>
                                            {permit.description?.length > 50
                                                ? permit.description.slice(0, 50) + '...'
                                                : permit.description || 'No description'}
                                        </Text>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <Badge
                                                appearance="filled"
                                                color={permit.status === 'Pending_Execution' ? 'warning' : 'informative'}
                                                style={{ fontSize: '10px', padding: '2px 6px' }}
                                            >
                                                {permit.status === 'Pending_Execution' ? 'Pending Executor' : 'Pending Issuer'}
                                            </Badge>
                                            <Text className={styles.notificationTime}>
                                                {formatTimeAgo(permit.createdAt)}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyStateWhite}>
                                <Text>No pending permits</Text>
                            </div>
                        )}
                    </div>

                    {showAlert && myPendingPermits.length > 0 && (
                        <div className={styles.validationAlert}>
                            <Info24Regular className={styles.validationAlertIcon} />
                            <Text className={styles.validationAlertText}>
                                You have {myPendingPermits.length} permit(s) awaiting action.
                            </Text>
                            <Dismiss16Regular
                                className={styles.validationAlertClose}
                                onClick={() => setShowAlert(false)}
                            />
                        </div>
                    )}
                </div>

                {/* Performance Review */}
                <div className={styles.performanceCard}>
                    <div className={styles.performanceHeader}>
                        <Text className={styles.cardTitle}>Performance Review</Text>
                        <div className={styles.statArrow}>
                            <ArrowRight16Regular />
                        </div>
                    </div>
                    {userActivity.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Text>No recent activity</Text>
                        </div>
                    ) : (
                        <div className={styles.performanceList}>
                            {userActivity.map((activity, index) => (
                                <div key={activity.user._id || index} className={styles.performanceItem}>
                                    <div className={styles.performanceUser}>
                                        <Avatar
                                            name={activity.user.name}
                                            image={getProfilePicUrl(activity.user.profilePicture) ? { src: getProfilePicUrl(activity.user.profilePicture) } : undefined}
                                            size={40}
                                        />
                                        <div className={styles.performanceInfo}>
                                            <Text weight="semibold" style={{ fontSize: tokens.fontSizeBase300 }}>
                                                {activity.user.name}
                                            </Text>
                                            <Text className={styles.actionCount}>
                                                {activity.totalPermits} permits
                                            </Text>
                                        </div>
                                    </div>
                                    <div className={styles.performanceStats}>
                                        <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                            {activity.recentActions[0]?.actionLabel || 'Active'}
                                        </Text>
                                        <Text className={styles.actionCount}>
                                            {activity.recentActions.length} actions
                                        </Text>
                                    </div>
                                    <span className={styles.roleTag}>
                                        {getRoleTag(activity.user.workflowStage)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Total Permits Summary */}
                {/* <div className={styles.possibleClientsCard}>
                    <div className={styles.possibleClientsHeader}>
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: '#e0f2fe',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0284c7',
                            }}
                        >
                            <Person24Regular />
                        </div>
                        <div>
                            <Text weight="semibold" style={{ display: 'block' }}>
                                {stats?.totalPermits || 0} Total Permits
                            </Text>
                            <Text style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                                {stats?.totalGeneral || 0} General • {stats?.totalHeight || 0} Height
                            </Text>
                        </div>
                    </div>
                    <div className={styles.avatarGroup} style={{ marginTop: tokens.spacingVerticalS }}>
                        {permits.slice(0, 5).map((permit, index) => (
                            <Avatar
                                key={permit._id}
                                name={permit.createdBy?.name || 'User'}
                                image={getProfilePicUrl(permit.createdBy?.profilePicture) ? { src: getProfilePicUrl(permit.createdBy?.profilePicture) } : undefined}
                                size={32}
                                className={index > 0 ? styles.overlappingAvatar : ''}
                            />
                        ))}
                        {permits.length > 5 && (
                            <Avatar
                                name={`+${permits.length - 5}`}
                                size={32}
                                className={styles.overlappingAvatar}
                                style={{ backgroundColor: tokens.colorNeutralBackground4 }}
                            />
                        )}
                    </div>
                </div> */}
            </div>

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
                    {loadingDetails ? (
                        <div className={styles.loadingCenter}>
                            <Spinner size="medium" label="Loading permit details..." />
                        </div>
                    ) : selectedPermit ? (
                        selectedPermit.permitType === 'height' ? (
                            <HeightPermitDetails
                                permit={selectedPermit}
                                canDownload={true}
                            />
                        ) : (
                            <PermitDetails
                                permit={selectedPermit}
                                canDownload={true}
                            />
                        )
                    ) : null}
                </DrawerBody>
            </Drawer>
        </div>
    );
};

export default DashboardPage;
