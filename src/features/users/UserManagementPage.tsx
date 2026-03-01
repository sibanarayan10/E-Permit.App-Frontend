/**
 * User Management Page - Professional Admin user CRUD with Fluent UI
 * Features: User listing, create/edit/delete, role management, search & filter
 */

import React, { useState, useEffect, useCallback } from 'react';
import { UserActivityPanel } from './UserActivityPanel';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
    Input,
    Dropdown,
    Option,
    Badge,
    Spinner,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Avatar,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    Field,
    Tooltip,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@fluentui/react-components';
import {
    People24Regular,
    People24Filled,
    Search24Regular,
    Edit24Regular,
    Delete24Regular,
    ArrowClockwise24Regular,
    PersonAdd24Regular,
    Dismiss24Regular,
    Person24Regular,
    Mail24Regular,
    Key24Regular,
    Shield24Regular,
    Checkmark24Regular,
    Wrench24Regular,
    Certificate24Regular,
    Phone24Regular,
    Eye24Regular,
    History24Regular,
    PersonAvailable24Regular,
    SignOut24Regular,
} from '@fluentui/react-icons';
import {
    getActiveSessions,
    getRecentLogins,
    forceLogoutUser,
    type ActiveSession,
    type RecentLogin,
} from '@/services/activity.service';
import { useUser } from '@/context';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/services';
import { PageLoading } from '@/components/common';
import type { User, CreateUserPayload, UpdateUserPayload, UserRole } from '@/models';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: tokens.colorNeutralBackground2,
    },
    hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalL}`,
        marginBottom: tokens.spacingVerticalL,
    },
    heroContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
    },
    heroTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        color: 'white',
    },
    heroTitleText: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'white',
    },
    heroSubtitle: {
        fontSize: tokens.fontSizeBase300,
        opacity: 0.9,
        color: 'white',
    },
    heroActions: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `0 ${tokens.spacingHorizontalL} ${tokens.spacingVerticalXL}`,
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
        minWidth: '280px',
        flex: 1,
        maxWidth: '400px',
    },
    filterDropdown: {
        minWidth: '150px',
    },
    tableCard: {
        padding: 0,
        overflow: 'hidden',
        borderRadius: tokens.borderRadiusLarge,
        boxShadow: tokens.shadow4,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    table: {
        width: '100%',
    },
    tableRow: {
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        ':hover': {
            backgroundColor: `${tokens.colorBrandBackground2} !important`,
            transform: 'scale(1.005)',
            boxShadow: `inset 0 0 0 1px ${tokens.colorBrandStroke1}`,
        },
    },
    emptyState: {
        textAlign: 'center',
        padding: tokens.spacingVerticalXXL,
        color: tokens.colorNeutralForeground3,
    },
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
    userName: {
        fontWeight: tokens.fontWeightMedium,
        display: 'block',
    },
    userEmail: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    actionButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
    },
    // Desktop table - hidden on mobile
    desktopTable: {
        '@media (max-width: 768px)': {
            display: 'none',
        },
    },
    // Mobile card list - hidden on desktop
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
    mobileCardUser: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        flex: 1,
    },
    mobileCardBody: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
    },
    mobileCardFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalXS,
        paddingTop: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    // Hide on tablet
    hideOnTablet: {
        '@media (max-width: 1024px)': {
            display: 'none',
        },
    },
    // Hide on small tablet
    hideOnSmallTablet: {
        '@media (max-width: 900px)': {
            display: 'none',
        },
    },
    paginationContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: tokens.spacingHorizontalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
    },
    drawerBody: {
        padding: tokens.spacingVerticalL,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
    },
    drawerSection: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    drawerSectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalM,
        color: tokens.colorBrandForeground1,
    },
    drawerFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    },
});

const roleOptions: { key: UserRole; text: string }[] = [
    { key: 'CLIENT', text: 'Client' },
    { key: 'ADMIN', text: 'Admin' },
    { key: 'SUBADMIN', text: 'Sub Admin' },
];

const stageOptions = [
    { key: 'Initiator', text: 'Initiator' },
    { key: 'Execution', text: 'Execution' },
    { key: 'Issuer', text: 'Issuer' },
];

const filterRoleOptions = [
    { key: 'all', text: 'All Roles' },
    { key: 'ADMIN', text: 'Admin' },
    { key: 'SUBADMIN', text: 'Sub Admin' },
    { key: 'CLIENT', text: 'Client' },
];

const LOCATIONS = {
    PLANT_A: "Bhilai"
};

const SUB_LOCATIONS: Record<string, string[]> = {
    [LOCATIONS.PLANT_A]: [
        "DIC-01-CO-CCD",
        "DIC-02-BF-1-8-SGP",
        "DIC-03-EMD",
        "DIC-04-UTILITIES",
        "DIC-05-SMS2",
        "DIC-06-SHOPS",
        "DIC-07-PLATEMILL",
        "DIC-08-PBS",
        "DIC-09-RSM-RTR",
        "DIC-10-RMP",
        "DIC-11-WMD",
        "DIC-12-WRM-MM",
        "DIC-13-BRM",
        "DIC-14-MECH",
        "DIC-15-OHP",
        "DIC-16-SP2",
        "DIC-17-SP3",
        "DIC-18-T&D",
        "DIC-19-URM",
        "DIC-20-SMS3",
        "DIC-21-ELECT-ORG",
        "DIC-22-RCL",
        "DIC-23-INA",
        "DIC-24-RED",
        "DIC-25-SERVICES",
        "DIC-26-TOWNSERVICES-CnIT-HRD",
        "DIC-27-PROJECTS-CONSTRUCTION",
        "DIC-28-FINANCE-ACCOUNTS-MM",
        "DIC-29-FIRE-SAFETY-ENV"
    ]
};

const filterStageOptions = [
    { key: 'all', text: 'All Stages' },
    { key: 'Initiator', text: 'Initiator' },
    { key: 'Execution', text: 'Execution' },
    { key: 'Issuer', text: 'Issuer' },
];

export const UserManagementPage: React.FC = () => {
    const styles = useStyles();
    const { user: currentUser } = useUser();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [stageFilter, setStageFilter] = useState('all');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Active Sessions Drawer state
    const [showActiveSessionsDrawer, setShowActiveSessionsDrawer] = useState(false);
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [isLoadingActiveSessions, setIsLoadingActiveSessions] = useState(false);
    const [totalOnline, setTotalOnline] = useState(0);
    const [forcingLogoutId, setForcingLogoutId] = useState<string | null>(null);

    // Recent Logins state
    const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);
    const [isLoadingRecentLogins, setIsLoadingRecentLogins] = useState(false);

    const fetchActiveSessions = useCallback(async () => {
        try {
            setIsLoadingActiveSessions(true);
            const data = await getActiveSessions();
            setActiveSessions(data.sessions);
            setTotalOnline(data.totalOnline);
        } catch {
            toast.error('Failed to load active sessions');
        } finally {
            setIsLoadingActiveSessions(false);
        }
    }, []);

    const fetchRecentLogins = useCallback(async () => {
        try {
            setIsLoadingRecentLogins(true);
            const data = await getRecentLogins(10);
            setRecentLogins(data.logins);
        } catch {
            toast.error('Failed to load recent logins');
        } finally {
            setIsLoadingRecentLogins(false);
        }
    }, []);

    const handleOpenActiveSessions = () => {
        setShowActiveSessionsDrawer(true);
        fetchActiveSessions();
        fetchRecentLogins();
    };

    const handleForceLogoutFromDrawer = async (userId: string) => {
        try {
            setForcingLogoutId(userId);
            await forceLogoutUser(userId);
            toast.success('Session terminated successfully');
            fetchActiveSessions();
        } catch {
            toast.error('Failed to terminate session');
        } finally {
            setForcingLogoutId(null);
        }
    };

    const formatTimeAgo = (dateStr: string | null): string => {
        if (!dateStr) return '—';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    const formatSessionDate = (dateStr: string | null): string => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    };

    const getSessionProfilePic = (session: ActiveSession): string | undefined => {
        const pp = session.user?.profilePicture;
        if (!pp) return undefined;
        if (typeof pp === 'string') return pp;
        return (pp as any)?.url;
    };

    // Form state
    const [formData, setFormData] = useState<CreateUserPayload>({
        name: '',
        userId: '',
        email: '',
        password: '',
        role: 'CLIENT',
        workflowStage: 'Initiator',
        phone: '',
        location: '',
        subLocation: '',
    });

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            // Fetch all users with a high limit to show complete user list
            const response = await getAllUsers(1, 1000);
            setUsers(response.data?.users ?? []);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Filter users
    const filteredUsers = users.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const matchesStage = stageFilter === 'all' || u.workflowStage === stageFilter;
        return matchesSearch && matchesRole && matchesStage;
    });

    // Stats
    const stats = {
        total: users.length,
        admins: users.filter((u) => u.role === 'ADMIN').length,
        subadmins: users.filter((u) => u.role === 'SUBADMIN').length,
        initiators: users.filter((u) => u.workflowStage === 'Initiator').length,
        executors: users.filter((u) => u.workflowStage === 'Execution').length,
        issuers: users.filter((u) => u.workflowStage === 'Issuer').length,
    };

    const handleCreate = async () => {
        if (!formData.name || !formData.userId || !formData.email || !formData.password) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Prevent SUBADMIN from creating ADMIN or SUBADMIN
        if (currentUser?.role === 'SUBADMIN' && (formData.role === 'ADMIN' || formData.role === 'SUBADMIN')) {
            toast.error('Sub Admins cannot create Admin or Sub Admin users');
            return;
        }

        try {
            setIsSaving(true);
            const response = await createUser(formData);

            // Optimistically update local state with new user
            if (response.data) {
                setUsers(prevUsers => [...prevUsers, response.data as User]);
            }

            toast.success('User created successfully');
            setShowCreateDialog(false);
            resetForm();

            // Refresh to ensure data consistency (non-blocking)
            fetchUsers().catch(console.error);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create user';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;

        try {
            setIsSaving(true);

            // Prevent SUBADMIN from assigning ADMIN or SUBADMIN role
            if (currentUser?.role === 'SUBADMIN' && (formData.role === 'ADMIN' || formData.role === 'SUBADMIN')) {
                toast.error('Sub Admins cannot assign Admin or Sub Admin roles');
                setIsSaving(false);
                return;
            }

            const updates: UpdateUserPayload = {
                name: formData.name,
                userId: formData.userId,
                role: formData.role,
                workflowStage: formData.workflowStage,
                phone: formData.phone,
                location: formData.location,
                subLocation: formData.subLocation,
            };
            const response = await updateUser(selectedUser._id ?? '', updates);

            // Optimistically update local state with updated user
            if (response.data) {
                setUsers(prevUsers =>
                    prevUsers.map(u =>
                        u._id === selectedUser._id ? response.data as User : u
                    )
                );
            }

            toast.success('User updated successfully');
            setShowEditDialog(false);
            resetForm();

            // Refresh to ensure data consistency (non-blocking)
            fetchUsers().catch(console.error);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update user';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;

        try {
            setIsSaving(true);
            await deleteUser(selectedUser._id ?? '');

            // Optimistically remove user from local state
            setUsers(prevUsers => prevUsers.filter(u => u._id !== selectedUser._id));

            toast.success('User deleted successfully');
            setShowDeleteDialog(false);
            setSelectedUser(null);

            // Refresh to ensure data consistency (non-blocking)
            fetchUsers().catch(console.error);
        } catch (error) {
            toast.error('Failed to delete user');
        } finally {
            setIsSaving(false);
        }
    };

    const openEditDialog = (user: User) => {
        // Prevent SUBADMIN from editing ADMIN
        if (currentUser?.role === 'SUBADMIN' && user.role === 'ADMIN') {
            toast.error('Sub Admins cannot edit Administrators');
            return;
        }

        setSelectedUser(user);
        setFormData({
            name: user.name,
            userId: user.userId ?? '',
            email: user.email,
            password: '',
            role: user.role,
            workflowStage: user.workflowStage ?? 'Initiator',
            phone: user.phone ?? '',
            location: user.location ?? '',
            subLocation: user.subLocation ?? '',
        });
        setShowEditDialog(true);
    };

    const openDeleteDialog = (user: User) => {
        // Prevent SUBADMIN from deleting ADMIN
        if (currentUser?.role === 'SUBADMIN' && user.role === 'ADMIN') {
            toast.error('Sub Admins cannot delete Administrators');
            return;
        }

        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            userId: '',
            email: '',
            password: '',
            role: 'CLIENT',
            workflowStage: 'Initiator',
            phone: '',
            location: '',
            subLocation: '',
        });
        setSelectedUser(null);
    };

    const getRoleBadgeColor = (role: string): 'danger' | 'brand' => {
        return role === 'ADMIN' || role === 'SUBADMIN' ? 'danger' : 'brand';
    };

    const getStageColor = (stage?: string): 'success' | 'warning' | 'informative' | 'subtle' => {
        switch (stage) {
            case 'Initiator': return 'success';
            case 'Execution': return 'warning';
            case 'Issuer': return 'informative';
            default: return 'subtle';
        }
    };

    // Open user details
    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setShowUserDetails(true);
    };

    // Helper to get profile picture URL
    const getProfilePictureUrl = (user: User): string | undefined => {
        if (!user.profilePicture) return undefined;
        if (typeof user.profilePicture === 'string') return user.profilePicture;
        return (user.profilePicture as any)?.url;
    };

    // Check if current user is admin
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUBADMIN') {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <Card style={{ padding: tokens.spacingVerticalXXL, textAlign: 'center' }}>
                        <Shield24Regular style={{ fontSize: '48px', color: tokens.colorNeutralForeground3, marginBottom: '16px' }} />
                        <Text size={500} weight="semibold" block>Access Denied</Text>
                        <Text style={{ color: tokens.colorNeutralForeground3 }}>
                            You don't have permission to access user management.
                        </Text>
                    </Card>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <PageLoading label="Loading users..." />;
    }

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroTitle}>
                        <People24Filled style={{ fontSize: '32px' }} />
                        <div>
                            <Text className={styles.heroTitleText}>User Management</Text>
                            <Text className={styles.heroSubtitle}>Manage users, roles, and permissions</Text>
                        </div>
                    </div>
                    <div className={styles.heroActions}>
                        <Button
                            icon={<ArrowClockwise24Regular />}
                            appearance="secondary"
                            onClick={fetchUsers}
                        >
                            Refresh
                        </Button>
                        <Button
                            icon={<PersonAdd24Regular />}
                            appearance="primary"
                            onClick={() => {
                                resetForm();
                                setShowCreateDialog(true);
                            }}
                        >
                            Add User
                        </Button>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <Card className={styles.statCard} onClick={() => { setRoleFilter('all'); setStageFilter('all'); }}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#e0f2fe' }}>
                                <People24Regular style={{ color: '#0284c7' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.total}</Text>
                                <Text className={styles.statLabel}>Total</Text>
                            </div>
                        </div>
                    </Card>
                    <Card className={styles.statCard} onClick={() => { setRoleFilter('ADMIN'); setStageFilter('all'); }}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#fee2e2' }}>
                                <Shield24Regular style={{ color: '#ef4444' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.admins}</Text>
                                <Text className={styles.statLabel}>Admins</Text>
                            </div>
                        </div>
                    </Card>
                    <Card className={styles.statCard} onClick={() => { setRoleFilter('SUBADMIN'); setStageFilter('all'); }}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#ffedd5' }}>
                                <Shield24Regular style={{ color: '#f97316' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.subadmins}</Text>
                                <Text className={styles.statLabel}>Sub Admins</Text>
                            </div>
                        </div>
                    </Card>
                    <Card className={styles.statCard} onClick={() => { setRoleFilter('all'); setStageFilter('Initiator'); }}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#dcfce7' }}>
                                <PersonAdd24Regular style={{ color: '#10b981' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.initiators}</Text>
                                <Text className={styles.statLabel}>Initiators</Text>
                            </div>
                        </div>
                    </Card>
                    <Card className={styles.statCard} onClick={() => { setRoleFilter('all'); setStageFilter('Execution'); }}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
                                <Wrench24Regular style={{ color: '#f59e0b' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.executors}</Text>
                                <Text className={styles.statLabel}>Executors</Text>
                            </div>
                        </div>
                    </Card>
                    <Card className={styles.statCard} onClick={() => { setRoleFilter('all'); setStageFilter('Issuer'); }}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
                                <Certificate24Regular style={{ color: '#3b82f6' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.issuers}</Text>
                                <Text className={styles.statLabel}>Issuers</Text>
                            </div>
                        </div>
                    </Card>
                    <Card className={styles.statCard} onClick={() => { setRoleFilter('CLIENT'); setStageFilter('all'); }}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#f3f4f6' }}>
                                <Person24Regular style={{ color: '#6b7280' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.total - stats.admins - stats.subadmins}</Text>
                                <Text className={styles.statLabel}>Clients</Text>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filter Bar */}
                <div className={styles.filterBar}>
                    <Input
                        className={styles.searchInput}
                        placeholder="Search by name or email..."
                        contentBefore={<Search24Regular />}
                        value={searchTerm}
                        onChange={(_, data) => setSearchTerm(data.value)}
                    />
                    <Dropdown
                        className={styles.filterDropdown}
                        value={filterRoleOptions.find(r => r.key === roleFilter)?.text}
                        onOptionSelect={(_, data) => setRoleFilter(data.optionValue as string)}
                    >
                        {filterRoleOptions.map((opt) => (
                            <Option key={opt.key} value={opt.key}>{opt.text}</Option>
                        ))}
                    </Dropdown>
                    <Dropdown
                        className={styles.filterDropdown}
                        value={filterStageOptions.find(s => s.key === stageFilter)?.text}
                        onOptionSelect={(_, data) => setStageFilter(data.optionValue as string)}
                    >
                        {filterStageOptions.map((opt) => (
                            <Option key={opt.key} value={opt.key}>{opt.text}</Option>
                        ))}
                    </Dropdown>
                    {(roleFilter !== 'all' || stageFilter !== 'all' || searchTerm) && (
                        <Button
                            icon={<Dismiss24Regular />}
                            appearance="subtle"
                            onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStageFilter('all'); }}
                        >
                            Clear
                        </Button>
                    )}
                    <div style={{ flex: 1 }} />
                    {currentUser?.role === 'ADMIN' && (
                        <Tooltip content="Active Sessions Log" relationship="label">
                            <Button
                                icon={<History24Regular />}
                                appearance="secondary"
                                onClick={handleOpenActiveSessions}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                }}
                            >
                                Logs
                                {totalOnline > 0 && (
                                    <Badge
                                        appearance="filled"
                                        color="success"
                                        size="small"
                                        style={{ marginLeft: '6px' }}
                                    >
                                        {totalOnline}
                                    </Badge>
                                )}
                            </Button>
                        </Tooltip>
                    )}
                </div>

                {/* Results info */}
                <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalS, display: 'block' }}>
                    Showing {filteredUsers.length} of {users.length} users
                </Text>

                {/* Users Table */}
                <Card className={styles.tableCard}>
                    {filteredUsers.length === 0 ? (
                        <div className={styles.emptyState}>
                            <People24Regular style={{ fontSize: '48px', marginBottom: '16px' }} />
                            <Text weight="semibold" block>No users found</Text>
                            <Text size={200}>Try adjusting your search or filters</Text>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className={styles.desktopTable}>
                                <Table className={styles.table} size="small">
                                    <TableHeader>
                                        <TableRow style={{ backgroundColor: tokens.colorNeutralBackground3 }}>
                                            <TableHeaderCell style={{ fontWeight: tokens.fontWeightSemibold }}>
                                                User Info
                                            </TableHeaderCell>
                                            <TableHeaderCell className={styles.hideOnSmallTablet} style={{ fontWeight: tokens.fontWeightSemibold, textAlign: 'center' }}>
                                                User ID
                                            </TableHeaderCell>
                                            <TableHeaderCell style={{ fontWeight: tokens.fontWeightSemibold, textAlign: 'center' }}>
                                                Role
                                            </TableHeaderCell>
                                            <TableHeaderCell className={styles.hideOnSmallTablet} style={{ fontWeight: tokens.fontWeightSemibold, textAlign: 'center' }}>
                                                Stage
                                            </TableHeaderCell>
                                            <TableHeaderCell className={styles.hideOnTablet} style={{ fontWeight: tokens.fontWeightSemibold }}>
                                                Contact
                                            </TableHeaderCell>
                                            <TableHeaderCell className={styles.hideOnTablet} style={{ fontWeight: tokens.fontWeightSemibold }}>
                                                Location
                                            </TableHeaderCell>
                                            <TableHeaderCell className={styles.hideOnTablet} style={{ fontWeight: tokens.fontWeightSemibold, textAlign: 'center' }}>
                                                Status
                                            </TableHeaderCell>
                                            <TableHeaderCell style={{ width: '120px', fontWeight: tokens.fontWeightSemibold, textAlign: 'center' }}>
                                                Actions
                                            </TableHeaderCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((user, index) => (
                                                <TableRow
                                                    key={user._id}
                                                    className={styles.tableRow}
                                                    style={{
                                                        backgroundColor: index % 2 === 0 ? 'transparent' : tokens.colorNeutralBackground1Hover,
                                                    }}
                                                >
                                                    <TableCell style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                                                        <div className={styles.userCell}>
                                                            <Avatar
                                                                name={user.name}
                                                                image={getProfilePictureUrl(user) ? { src: getProfilePictureUrl(user) } : undefined}
                                                                size={48}
                                                                style={{
                                                                    border: `2px solid ${tokens.colorBrandBackground}`,
                                                                    boxShadow: tokens.shadow4
                                                                }}
                                                            />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <Text
                                                                    className={styles.userName}
                                                                    style={{
                                                                        fontSize: tokens.fontSizeBase300,
                                                                        color: tokens.colorNeutralForeground1,
                                                                        display: 'block',
                                                                        marginBottom: '2px'
                                                                    }}
                                                                >
                                                                    {user.name}
                                                                </Text>
                                                                <Text
                                                                    className={styles.userEmail}
                                                                    style={{
                                                                        fontSize: tokens.fontSizeBase200,
                                                                        color: tokens.colorNeutralForeground3,
                                                                        display: 'block',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {user.email}
                                                                </Text>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnSmallTablet} style={{ textAlign: 'center' }}>
                                                        <Badge
                                                            appearance="tint"
                                                            color="brand"
                                                            size="medium"
                                                            style={{
                                                                fontWeight: tokens.fontWeightSemibold,
                                                                fontSize: tokens.fontSizeBase200
                                                            }}
                                                        >
                                                            {user.userId || 'Not Set'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell style={{ textAlign: 'center' }}>
                                                        <Badge
                                                            appearance="filled"
                                                            color={getRoleBadgeColor(user.role)}
                                                            size="large"
                                                            style={{
                                                                fontWeight: tokens.fontWeightSemibold,
                                                                minWidth: '70px'
                                                            }}
                                                        >
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnSmallTablet} style={{ textAlign: 'center' }}>
                                                        <Badge
                                                            appearance="outline"
                                                            color={getStageColor(user.workflowStage)}
                                                            size="medium"
                                                            style={{
                                                                minWidth: '90px',
                                                                fontWeight: tokens.fontWeightMedium
                                                            }}
                                                        >
                                                            {user.workflowStage ?? 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnTablet}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Phone24Regular style={{ color: tokens.colorNeutralForeground3, fontSize: '16px' }} />
                                                            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                                                                {user.phone || 'Not provided'}
                                                            </Text>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnTablet}>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <Text size={200} weight="medium">{user.location || '-'}</Text>
                                                            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                                                {user.subLocation || ''}
                                                            </Text>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnTablet} style={{ textAlign: 'center' }}>
                                                        <Badge
                                                            appearance="filled"
                                                            color="success"
                                                            size="medium"
                                                            icon={<Checkmark24Regular />}
                                                            style={{ fontWeight: tokens.fontWeightSemibold }}
                                                        >
                                                            Active
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className={styles.actionButtons} style={{ justifyContent: 'center' }}>
                                                            <Tooltip content="View Details" relationship="label">
                                                                <Button
                                                                    icon={<Eye24Regular />}
                                                                    appearance="subtle"
                                                                    size="small"
                                                                    onClick={() => handleViewDetails(user)}
                                                                    style={{
                                                                        color: tokens.colorBrandForeground1,
                                                                        minWidth: '32px'
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip content="Edit User" relationship="label">
                                                                <Button
                                                                    icon={<Edit24Regular />}
                                                                    appearance="subtle"
                                                                    size="small"
                                                                    onClick={() => openEditDialog(user)}
                                                                    style={{
                                                                        color: '#0078d4',
                                                                        minWidth: '32px'
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                            {user._id !== currentUser?._id && (
                                                                <Tooltip content="Delete User" relationship="label">
                                                                    <Button
                                                                        icon={<Delete24Regular />}
                                                                        appearance="subtle"
                                                                        size="small"
                                                                        onClick={() => openDeleteDialog(user)}
                                                                        style={{
                                                                            color: '#d13438',
                                                                            minWidth: '32px'
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className={styles.mobileCardList}>
                                {filteredUsers
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map((user) => (
                                        <div key={user._id} className={styles.mobileCard}>
                                            <div className={styles.mobileCardHeader}>
                                                <div className={styles.mobileCardUser}>
                                                    <Avatar
                                                        name={user.name}
                                                        image={getProfilePictureUrl(user) ? { src: getProfilePictureUrl(user) } : undefined}
                                                        size={48}
                                                    />
                                                    <div>
                                                        <Text weight="semibold" block>{user.name}</Text>
                                                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                                            {user.email}
                                                        </Text>
                                                    </div>
                                                </div>
                                                <Badge appearance="filled" color={getRoleBadgeColor(user.role)}>
                                                    {user.role}
                                                </Badge>
                                            </div>

                                            <div className={styles.mobileCardBody}>
                                                <div>
                                                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>User ID</Text>
                                                    <br />
                                                    <Badge appearance="tint" color="brand" size="small">
                                                        {user.userId || 'Not Set'}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Stage</Text>
                                                    <br />
                                                    <Badge appearance="outline" color={getStageColor(user.workflowStage)} size="small">
                                                        {user.workflowStage ?? 'N/A'}
                                                    </Badge>
                                                </div>
                                                {user.phone && (
                                                    <div>
                                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Phone</Text>
                                                        <br />
                                                        <Text size={200}>{user.phone}</Text>
                                                    </div>
                                                )}
                                                <div>
                                                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Location</Text>
                                                    <br />
                                                    <Text size={200} weight="medium">{user.location || '-'}</Text>
                                                    {user.subLocation && (
                                                        <>
                                                            <br />
                                                            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>{user.subLocation}</Text>
                                                        </>
                                                    )}
                                                </div>
                                                <div>
                                                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Status</Text>
                                                    <br />
                                                    <Badge appearance="filled" color="success" size="small">Active</Badge>
                                                </div>
                                            </div>

                                            <div className={styles.mobileCardFooter}>
                                                <Button
                                                    icon={<Eye24Regular />}
                                                    appearance="subtle"
                                                    size="small"
                                                    onClick={() => handleViewDetails(user)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    icon={<Edit24Regular />}
                                                    appearance="subtle"
                                                    size="small"
                                                    onClick={() => openEditDialog(user)}
                                                >
                                                    Edit
                                                </Button>
                                                {user._id !== currentUser?._id && (
                                                    <Button
                                                        icon={<Delete24Regular />}
                                                        appearance="subtle"
                                                        size="small"
                                                        onClick={() => openDeleteDialog(user)}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {/* Pagination */}
                            <div className={styles.paginationContainer}>
                                <Text style={{ color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200 }}>
                                    Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)} ({filteredUsers.length} users)
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
                                        disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Next →
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Create User Drawer */}
            <Drawer
                open={showCreateDialog}
                onOpenChange={(_, data) => !data.open && setShowCreateDialog(false)}
                position="end"
                size="medium"
            >
                <DrawerHeader style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={() => setShowCreateDialog(false)}
                                style={{ color: 'white' }}
                            />
                        }
                    >
                        <PersonAdd24Regular style={{ marginRight: '8px' }} />
                        Add New User
                    </DrawerHeaderTitle>
                </DrawerHeader>

                <DrawerBody className={styles.drawerBody}>
                    <div className={styles.drawerSection}>
                        <Text className={styles.drawerSectionTitle}>
                            <Person24Regular />
                            User Details
                        </Text>

                        <Field label="Full Name" required style={{ marginBottom: '12px' }}>
                            <Input
                                value={formData.name}
                                onChange={(_, data) => setFormData({ ...formData, name: data.value })}
                                placeholder="Enter full name"
                                contentBefore={<Person24Regular />}
                            />
                        </Field>

                        <Field label="User ID" required hint="Must be exactly 6 digits" style={{ marginBottom: '12px' }}>
                            <Input
                                type="text"
                                value={formData.userId}
                                onChange={(_, data) => {
                                    // Only allow numeric input and max 6 digits
                                    const value = data.value.replace(/\D/g, '').slice(0, 6);
                                    setFormData({ ...formData, userId: value });
                                }}
                                placeholder="Enter 6-digit ID"
                                contentBefore={<Certificate24Regular />}
                                maxLength={6}
                            />
                        </Field>

                        <Field label="Email Address" required style={{ marginBottom: '12px' }}>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(_, data) => setFormData({ ...formData, email: data.value })}
                                placeholder="Enter email address"
                                contentBefore={<Mail24Regular />}
                            />
                        </Field>

                        <Field label="Password" required style={{ marginBottom: '12px' }}>
                            <Input
                                type="password"
                                value={formData.password}
                                onChange={(_, data) => setFormData({ ...formData, password: data.value })}
                                placeholder="Enter password"
                                contentBefore={<Key24Regular />}
                            />
                        </Field>

                        <Field label="Phone Number" style={{ marginBottom: '12px' }}>
                            <Input
                                type="tel"
                                value={formData.phone ?? ''}
                                onChange={(_, data) => setFormData({ ...formData, phone: data.value })}
                                placeholder="Enter phone number"
                                contentBefore={<Phone24Regular />}
                            />
                        </Field>

                        <Field label="Location" style={{ marginBottom: '12px' }}>
                            <Dropdown
                                value={formData.location}
                                onOptionSelect={(_, data) =>
                                    setFormData({
                                        ...formData,
                                        location: data.optionValue as string,
                                        subLocation: ''
                                    })
                                }
                                style={{ width: '100%' }}
                                placeholder="Select Location"
                            >
                                {Object.values(LOCATIONS).map((loc) => (
                                    <Option key={loc} value={loc}>
                                        {loc}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>

                        <Field label="Sub Location">
                            <Dropdown
                                value={formData.subLocation}
                                onOptionSelect={(_, data) =>
                                    setFormData({ ...formData, subLocation: data.optionValue as string })
                                }
                                style={{ width: '100%' }}
                                placeholder="Select Sub Location"
                                disabled={!formData.location}
                            >
                                {(formData.location ? SUB_LOCATIONS[formData.location] || [] : []).map((sub) => (
                                    <Option key={sub} value={sub}>
                                        {sub}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                    </div>

                    <div className={styles.drawerSection}>
                        <Text className={styles.drawerSectionTitle}>
                            <Shield24Regular />
                            Role & Access
                        </Text>

                        <Field label="Role" style={{ marginBottom: '12px' }}>
                            <Dropdown
                                value={roleOptions.find((r) => r.key === formData.role)?.text}
                                onOptionSelect={(_, data) =>
                                    setFormData({ ...formData, role: data.optionValue as UserRole })
                                }
                                style={{ width: '100%' }}
                            >
                                {roleOptions
                                    .filter(option => currentUser?.role === 'ADMIN' || option.key === 'CLIENT')
                                    .map((option) => (
                                        <Option key={option.key} value={option.key}>
                                            {option.text}
                                        </Option>
                                    ))}
                            </Dropdown>
                        </Field>

                        <Field label="Workflow Stage">
                            <Dropdown
                                value={stageOptions.find((s) => s.key === formData.workflowStage)?.text}
                                onOptionSelect={(_, data) =>
                                    setFormData({ ...formData, workflowStage: data.optionValue as string })
                                }
                                style={{ width: '100%' }}
                                disabled={formData.role === 'ADMIN' || formData.role === 'SUBADMIN'}
                            >
                                {stageOptions.map((option) => (
                                    <Option key={option.key} value={option.key}>
                                        {option.text}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                    </div>
                </DrawerBody>

                <div className={styles.drawerFooter}>
                    <Button appearance="secondary" onClick={() => setShowCreateDialog(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleCreate}
                        disabled={isSaving}
                        icon={isSaving ? <Spinner size="tiny" /> : <Checkmark24Regular />}
                    >
                        {isSaving ? 'Creating...' : 'Create User'}
                    </Button>
                </div>
            </Drawer>

            {/* Edit User Drawer */}
            <Drawer
                open={showEditDialog}
                onOpenChange={(_, data) => !data.open && setShowEditDialog(false)}
                position="end"
                size="medium"
            >
                <DrawerHeader style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={() => setShowEditDialog(false)}
                                style={{ color: 'white' }}
                            />
                        }
                    >
                        <Edit24Regular style={{ marginRight: '8px' }} />
                        Edit User
                    </DrawerHeaderTitle>
                </DrawerHeader>

                <DrawerBody className={styles.drawerBody}>
                    <div className={styles.drawerSection}>
                        <Text className={styles.drawerSectionTitle}>
                            <Person24Regular />
                            User Details
                        </Text>

                        <Field label="Full Name" required style={{ marginBottom: '12px' }}>
                            <Input
                                value={formData.name}
                                onChange={(_, data) => setFormData({ ...formData, name: data.value })}
                                contentBefore={<Person24Regular />}
                            />
                        </Field>

                        <Field label="User ID" required hint="Must be exactly 6 digits" style={{ marginBottom: '12px' }}>
                            <Input
                                type="text"
                                value={formData.userId}
                                onChange={(_, data) => {
                                    // Only allow numeric input and max 6 digits
                                    const value = data.value.replace(/\D/g, '').slice(0, 6);
                                    setFormData({ ...formData, userId: value });
                                }}
                                placeholder="Enter 6-digit ID"
                                contentBefore={<Certificate24Regular />}
                                maxLength={6}
                            />
                        </Field>

                        <Field label="Email Address" style={{ marginBottom: '12px' }}>
                            <Input
                                value={formData.email}
                                disabled
                                contentBefore={<Mail24Regular />}
                            />
                        </Field>

                        <Field label="Phone Number" style={{ marginBottom: '12px' }}>
                            <Input
                                type="tel"
                                value={formData.phone ?? ''}
                                onChange={(_, data) => setFormData({ ...formData, phone: data.value })}
                                placeholder="Enter phone number"
                                contentBefore={<Phone24Regular />}
                            />
                        </Field>

                        <Field label="Location" style={{ marginBottom: '12px' }}>
                            <Dropdown
                                value={formData.location}
                                onOptionSelect={(_, data) =>
                                    setFormData({
                                        ...formData,
                                        location: data.optionValue as string,
                                        subLocation: ''
                                    })
                                }
                                style={{ width: '100%' }}
                                placeholder="Select Location"
                            >
                                {Object.values(LOCATIONS).map((loc) => (
                                    <Option key={loc} value={loc}>
                                        {loc}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>

                        <Field label="Sub Location">
                            <Dropdown
                                value={formData.subLocation}
                                onOptionSelect={(_, data) =>
                                    setFormData({ ...formData, subLocation: data.optionValue as string })
                                }
                                style={{ width: '100%' }}
                                placeholder="Select Sub Location"
                                disabled={!formData.location}
                            >
                                {(formData.location ? SUB_LOCATIONS[formData.location] || [] : []).map((sub) => (
                                    <Option key={sub} value={sub}>
                                        {sub}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                    </div>

                    <div className={styles.drawerSection}>
                        <Text className={styles.drawerSectionTitle}>
                            <Shield24Regular />
                            Role & Access
                        </Text>

                        <Field label="Role" style={{ marginBottom: '12px' }}>
                            <Dropdown
                                value={roleOptions.find((r) => r.key === formData.role)?.text}
                                onOptionSelect={(_, data) =>
                                    setFormData({ ...formData, role: data.optionValue as UserRole })
                                }
                                style={{ width: '100%' }}
                            >
                                {roleOptions
                                    .filter(option => currentUser?.role === 'ADMIN' || option.key === 'CLIENT')
                                    .map((option) => (
                                        <Option key={option.key} value={option.key}>
                                            {option.text}
                                        </Option>
                                    ))}
                            </Dropdown>
                        </Field>

                        <Field label="Workflow Stage">
                            <Dropdown
                                value={stageOptions.find((s) => s.key === formData.workflowStage)?.text}
                                onOptionSelect={(_, data) =>
                                    setFormData({ ...formData, workflowStage: data.optionValue as string })
                                }
                                style={{ width: '100%' }}
                                disabled={formData.role === 'ADMIN' || formData.role === 'SUBADMIN'}
                            >
                                {stageOptions.map((option) => (
                                    <Option key={option.key} value={option.key}>
                                        {option.text}
                                    </Option>
                                ))}
                            </Dropdown>
                        </Field>
                    </div>
                </DrawerBody>

                <div className={styles.drawerFooter}>
                    <Button appearance="secondary" onClick={() => setShowEditDialog(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleUpdate}
                        disabled={isSaving}
                        icon={isSaving ? <Spinner size="tiny" /> : <Checkmark24Regular />}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </Drawer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={(_, data) => setShowDeleteDialog(data.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogContent>
                            <Text>
                                Are you sure you want to delete <strong>{selectedUser?.name}</strong>?
                                This action cannot be undone.
                            </Text>
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleDelete}
                                disabled={isSaving}
                                style={{ backgroundColor: '#dc3545' }}
                            >
                                {isSaving ? 'Deleting...' : 'Delete User'}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            {/* User Details Drawer */}
            <Drawer
                open={showUserDetails}
                onOpenChange={(_, data) => {
                    if (!data.open) {
                        setShowUserDetails(false);
                        setSelectedUser(null);
                    }
                }}
                position="end"
                size="medium"
            >
                <DrawerHeader style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={() => {
                                    setShowUserDetails(false);
                                    setSelectedUser(null);
                                }}
                                style={{ color: 'white' }}
                            />
                        }
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Person24Regular />
                            <Text style={{ fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightBold, color: 'white' }}>
                                User Details
                            </Text>
                        </div>
                    </DrawerHeaderTitle>
                </DrawerHeader>
                <DrawerBody className={styles.drawerBody}>
                    {selectedUser && (
                        <>
                            {/* User Profile Section */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: tokens.spacingVerticalXL,
                                backgroundColor: tokens.colorNeutralBackground3,
                                borderRadius: tokens.borderRadiusLarge,
                                marginBottom: tokens.spacingVerticalM,
                            }}>
                                <Avatar
                                    name={selectedUser.name}
                                    image={getProfilePictureUrl(selectedUser) ? { src: getProfilePictureUrl(selectedUser) } : undefined}
                                    size={96}
                                    style={{ marginBottom: tokens.spacingVerticalM }}
                                />
                                <Text size={500} weight="bold" block>{selectedUser.name}</Text>
                                <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
                                    {selectedUser.email}
                                </Text>
                                <div style={{ display: 'flex', gap: tokens.spacingHorizontalS, marginTop: tokens.spacingVerticalM }}>
                                    <Badge appearance="filled" color={getRoleBadgeColor(selectedUser.role)} size="large">
                                        {selectedUser.role}
                                    </Badge>
                                    <Badge appearance="outline" color={getStageColor(selectedUser.workflowStage)} size="large">
                                        {selectedUser.workflowStage ?? 'N/A'}
                                    </Badge>
                                </div>
                            </div>

                            {/* User Information */}
                            <div className={styles.drawerSection}>
                                <Text className={styles.drawerSectionTitle}>
                                    <Person24Regular />
                                    Personal Information
                                </Text>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingVerticalM }}>
                                    <div>
                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Full Name</Text>
                                        <Text block weight="medium">{selectedUser.name}</Text>
                                    </div>
                                    <div>
                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>User ID</Text>
                                        <Badge appearance="tint" color="brand">
                                            {selectedUser.userId || 'Not Set'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Email</Text>
                                        <Text block weight="medium">{selectedUser.email}</Text>
                                    </div>
                                    <div>
                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Phone</Text>
                                        <Text block weight="medium">{selectedUser.phone || '-'}</Text>
                                    </div>
                                    <div>
                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Status</Text>
                                        <Badge appearance="filled" color="success">Active</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Role & Access */}
                            <div className={styles.drawerSection}>
                                <Text className={styles.drawerSectionTitle}>
                                    <Shield24Regular />
                                    Role & Access
                                </Text>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingVerticalM }}>
                                    <div>
                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Role</Text>
                                        <Badge appearance="filled" color={getRoleBadgeColor(selectedUser.role)}>
                                            {selectedUser.role}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Workflow Stage</Text>
                                        <Badge appearance="outline" color={getStageColor(selectedUser.workflowStage)}>
                                            {selectedUser.workflowStage ?? 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Login History & Session Monitoring - Admin Only */}
                            {currentUser?.role === 'ADMIN' && selectedUser._id && (
                                <UserActivityPanel
                                    userId={selectedUser._id}
                                    userName={selectedUser.name}
                                />
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: tokens.spacingHorizontalM, marginTop: tokens.spacingVerticalL }}>
                                <Button
                                    appearance="primary"
                                    icon={<Edit24Regular />}
                                    onClick={() => {
                                        setShowUserDetails(false);
                                        openEditDialog(selectedUser);
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    Edit User
                                </Button>
                                {selectedUser._id !== currentUser?._id && (
                                    <Button
                                        appearance="secondary"
                                        icon={<Delete24Regular />}
                                        onClick={() => {
                                            setShowUserDetails(false);
                                            openDeleteDialog(selectedUser);
                                        }}
                                        style={{ color: '#dc3545' }}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </DrawerBody>
            </Drawer>

            {/* Active Sessions & Recent Logins Drawer */}
            <Drawer
                open={showActiveSessionsDrawer}
                onOpenChange={(_, data) => {
                    if (!data.open) setShowActiveSessionsDrawer(false);
                }}
                position="end"
                size="large"
            >
                <DrawerHeader style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={() => setShowActiveSessionsDrawer(false)}
                                style={{ color: 'white' }}
                            />
                        }
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <PersonAvailable24Regular />
                            <div>
                                <Text style={{ fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightBold, color: 'white', display: 'block' }}>
                                    Session Logs
                                </Text>
                                <Text style={{ fontSize: tokens.fontSizeBase200, color: 'rgba(255,255,255,0.85)' }}>
                                    {totalOnline} user{totalOnline !== 1 ? 's' : ''} currently online
                                </Text>
                            </div>
                        </div>
                    </DrawerHeaderTitle>
                </DrawerHeader>
                <DrawerBody className={styles.drawerBody}>
                    {/* Refresh button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: tokens.spacingVerticalS }}>
                        <Button
                            icon={<ArrowClockwise24Regular />}
                            appearance="subtle"
                            size="small"
                            onClick={() => { fetchActiveSessions(); fetchRecentLogins(); }}
                            disabled={isLoadingActiveSessions || isLoadingRecentLogins}
                        >
                            Refresh All
                        </Button>
                    </div>

                    {/* Two-column horizontal layout */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: tokens.spacingHorizontalL,
                        minHeight: 0,
                    }}>
                        {/* LEFT PANEL — Active Sessions */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: tokens.spacingVerticalS,
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacingHorizontalS,
                                paddingBottom: tokens.spacingVerticalS,
                                borderBottom: `2px solid #22c55e`,
                            }}>
                                <span style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    backgroundColor: '#22c55e',
                                    display: 'inline-block',
                                    boxShadow: '0 0 0 3px rgba(34,197,94,0.3)',
                                    animation: 'pulse 2s infinite',
                                }} />
                                <Text weight="bold" size={400}>Active Now</Text>
                                <Badge appearance="filled" color="success" size="small">{totalOnline}</Badge>
                            </div>

                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: tokens.spacingVerticalS,
                            }}>
                                {isLoadingActiveSessions ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXL }}>
                                        <Spinner size="medium" label="Loading..." />
                                    </div>
                                ) : activeSessions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
                                        <PersonAvailable24Regular style={{ fontSize: '40px', color: tokens.colorNeutralForeground3, marginBottom: '8px' }} />
                                        <Text block size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground3 }}>No one online</Text>
                                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>No users are currently active.</Text>
                                    </div>
                                ) : (
                                    activeSessions.map((session) => (
                                        <Card
                                            key={session._id}
                                            style={{
                                                padding: tokens.spacingVerticalS,
                                                borderRadius: tokens.borderRadiusLarge,
                                                border: `1px solid ${tokens.colorNeutralStroke1}`,
                                                borderLeft: '3px solid #22c55e',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                                                <Avatar
                                                    name={session.user?.name ?? 'Unknown'}
                                                    image={getSessionProfilePic(session) ? { src: getSessionProfilePic(session) } : undefined}
                                                    size={40}
                                                />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Text weight="semibold" size={300} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {session.user?.name ?? 'Unknown'}
                                                        </Text>
                                                        <span style={{
                                                            width: '7px', height: '7px', borderRadius: '50%',
                                                            backgroundColor: '#22c55e', display: 'inline-block', flexShrink: 0,
                                                            boxShadow: '0 0 0 2px rgba(34,197,94,0.3)',
                                                            animation: 'pulse 2s infinite',
                                                        }} />
                                                    </div>
                                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {session.user?.email ?? ''}
                                                    </Text>
                                                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                                        <Badge appearance="filled" color={session.user?.role === 'ADMIN' || session.user?.role === 'SUBADMIN' ? 'danger' : 'brand'} size="small">
                                                            {session.user?.role ?? '—'}
                                                        </Badge>
                                                        {session.user?.workflowStage && (
                                                            <Badge appearance="outline" color="informative" size="small">
                                                                {session.user.workflowStage}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Tooltip content="Force Logout" relationship="label">
                                                    <Button
                                                        icon={forcingLogoutId === session.user?._id ? <Spinner size="tiny" /> : <SignOut24Regular />}
                                                        appearance="subtle"
                                                        size="small"
                                                        onClick={() => handleForceLogoutFromDrawer(session.user?._id)}
                                                        disabled={forcingLogoutId === session.user?._id}
                                                        style={{ color: '#dc3545' }}
                                                    />
                                                </Tooltip>
                                            </div>
                                            {/* Compact session info */}
                                            <div style={{
                                                display: 'flex',
                                                gap: tokens.spacingHorizontalM,
                                                marginTop: tokens.spacingVerticalXS,
                                                padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
                                                backgroundColor: tokens.colorNeutralBackground3,
                                                borderRadius: tokens.borderRadiusMedium,
                                                flexWrap: 'wrap',
                                            }}>
                                                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                                    🌐 {session.ipAddress ?? '—'}
                                                </Text>
                                                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                                    💻 {session.device ?? '—'} · {session.browser ?? '—'}
                                                </Text>
                                                <Text size={100} style={{ color: '#16a34a', fontWeight: 600 }}>
                                                    ⏱ {formatTimeAgo(session.lastActivity)}
                                                </Text>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* RIGHT PANEL — Recent Logins */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: tokens.spacingVerticalS,
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacingHorizontalS,
                                paddingBottom: tokens.spacingVerticalS,
                                borderBottom: `2px solid #667eea`,
                            }}>
                                <History24Regular style={{ color: '#667eea' }} />
                                <Text weight="bold" size={400}>Recent Logins</Text>
                                <Badge appearance="filled" color="informative" size="small">
                                    Last {recentLogins.length}
                                </Badge>
                            </div>

                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: tokens.spacingVerticalS,
                            }}>
                                {isLoadingRecentLogins ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacingVerticalXXL }}>
                                        <Spinner size="medium" label="Loading..." />
                                    </div>
                                ) : recentLogins.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: tokens.spacingVerticalXXL }}>
                                        <History24Regular style={{ fontSize: '40px', color: tokens.colorNeutralForeground3, marginBottom: '8px' }} />
                                        <Text block size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground3 }}>No login records</Text>
                                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>No recent login activity found.</Text>
                                    </div>
                                ) : (
                                    recentLogins.map((login, idx) => (
                                        <Card
                                            key={login._id}
                                            style={{
                                                padding: tokens.spacingVerticalS,
                                                borderRadius: tokens.borderRadiusLarge,
                                                border: `1px solid ${tokens.colorNeutralStroke1}`,
                                                borderLeft: '3px solid #667eea',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                                                {/* Rank number */}
                                                <div style={{
                                                    width: '28px', height: '28px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '12px', fontWeight: 700, flexShrink: 0,
                                                }}>
                                                    {idx + 1}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <Text weight="semibold" size={300} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                        {login.user?.name ?? 'Unknown'}
                                                    </Text>
                                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {login.user?.email ?? ''}
                                                    </Text>
                                                </div>
                                                <Badge appearance="filled" color={login.user?.role === 'ADMIN' || login.user?.role === 'SUBADMIN' ? 'danger' : 'brand'} size="small">
                                                    {login.user?.role ?? '—'}
                                                </Badge>
                                            </div>
                                            {/* Login info */}
                                            <div style={{
                                                display: 'flex',
                                                gap: tokens.spacingHorizontalM,
                                                marginTop: tokens.spacingVerticalXS,
                                                padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
                                                backgroundColor: tokens.colorNeutralBackground3,
                                                borderRadius: tokens.borderRadiusMedium,
                                                flexWrap: 'wrap',
                                            }}>
                                                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                                    📅 {formatSessionDate(login.loginTime)}
                                                </Text>
                                                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                                    🌐 {login.ipAddress ?? '—'}
                                                </Text>
                                                <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                                    💻 {login.device ?? '—'} · {login.browser ?? '—'}
                                                </Text>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </DrawerBody>
            </Drawer>

            {/* Pulse animation for online dots */}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default UserManagementPage;
