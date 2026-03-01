/**
 * UserActivityPanel - Login History & Session Monitoring for Admin User Profile View
 * Shows complete login history, session status, and security insights
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
    Badge,
    Spinner,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Tooltip,
    TabList,
    Tab,
    Divider,
} from '@fluentui/react-components';
import {
    History24Regular,
    Shield24Regular,
    SignOut24Regular,
    Checkmark24Regular,
    Dismiss24Regular,
    Desktop24Regular,
    Globe24Regular,
    Clock24Regular,
    ArrowClockwise24Regular,
    Warning24Regular,
    LockClosed24Regular,
    PersonAvailable24Regular,
    PresenceBlocked24Regular,
    ChevronLeft24Regular,
    ChevronRight24Regular,
    Phone24Regular,
    Tablet24Regular,
} from '@fluentui/react-icons';
import {
    getUserLoginHistory,
    getUserSessionStatus,
    forceLogoutUser,
    type LoginRecord,
    type LoginStats,
    type SessionStatusResponse,
} from '@/services/activity.service';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
    },
    sectionCard: {
        padding: tokens.spacingVerticalM,
        borderRadius: tokens.borderRadiusLarge,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacingVerticalM,
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontWeight: '600' as unknown as undefined,
        color: tokens.colorBrandForeground1,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: tokens.spacingHorizontalS,
        marginBottom: tokens.spacingVerticalM,
    },
    statItem: {
        padding: tokens.spacingVerticalS,
        borderRadius: tokens.borderRadiusMedium,
        textAlign: 'center' as const,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ':hover': {
            transform: 'translateY(-1px)',
            boxShadow: tokens.shadow4,
        },
    },
    statValue: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: '700' as unknown as undefined,
        display: 'block',
        lineHeight: '1.2',
    },
    statLabel: {
        fontSize: tokens.fontSizeBase100,
        color: tokens.colorNeutralForeground3,
        marginTop: '2px',
    },
    onlineIndicator: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: tokens.borderRadiusCircular,
        fontWeight: '600' as unknown as undefined,
        fontSize: tokens.fontSizeBase200,
    },
    onlineDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'pulse 2s infinite',
    },
    sessionInfoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingVerticalS,
        marginTop: tokens.spacingVerticalS,
    },
    sessionInfoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    sessionInfoLabel: {
        fontSize: tokens.fontSizeBase100,
        color: tokens.colorNeutralForeground3,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    sessionInfoValue: {
        fontSize: tokens.fontSizeBase200,
        fontWeight: '500' as unknown as undefined,
    },
    tableWrapper: {
        overflowX: 'auto' as const,
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    loginRow: {
        transition: 'background-color 0.15s ease',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
        },
    },
    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: tokens.spacingVerticalS,
    },
    paginationInfo: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    paginationButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
    },
    emptyState: {
        textAlign: 'center' as const,
        padding: tokens.spacingVerticalXL,
        color: tokens.colorNeutralForeground3,
    },
    loadingState: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: tokens.spacingVerticalXL,
    },
    accountStatusGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingVerticalS,
    },
    warningBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalS,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        marginBottom: tokens.spacingVerticalS,
    },
    dangerBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalS,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: '#fee2e2',
        border: '1px solid #ef4444',
        marginBottom: tokens.spacingVerticalS,
    },
    filterRow: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        marginBottom: tokens.spacingVerticalM,
        flexWrap: 'wrap' as const,
    },
    deviceIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: tokens.fontSizeBase200,
    },
    recentSessionCard: {
        padding: tokens.spacingVerticalXS,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground3,
        marginBottom: tokens.spacingVerticalXS,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

// Helpers
const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
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

const getDeviceIcon = (device: string | null) => {
    switch (device?.toLowerCase()) {
        case 'mobile':
            return <Phone24Regular />;
        case 'tablet':
            return <Tablet24Regular />;
        default:
            return <Desktop24Regular />;
    }
};

const getSessionStatusColor = (status: string): 'success' | 'danger' | 'warning' | 'informative' => {
    switch (status) {
        case 'online': return 'success';
        case 'offline': return 'danger';
        case 'expired': return 'warning';
        default: return 'informative';
    }
};

interface UserActivityPanelProps {
    userId: string;
    userName?: string;
}

type TabValue = 'overview' | 'loginHistory' | 'sessions';

export const UserActivityPanel: React.FC<UserActivityPanelProps> = ({ userId, userName: _userName }) => {
    const styles = useStyles();

    const [activeTab, setActiveTab] = useState<TabValue>('overview');
    const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);
    const [loginStats, setLoginStats] = useState<LoginStats | null>(null);
    const [sessionData, setSessionData] = useState<SessionStatusResponse | null>(null);
    const [isLoadingLogin, setIsLoadingLogin] = useState(false);
    const [isLoadingSession, setIsLoadingSession] = useState(false);
    const [loginPage, setLoginPage] = useState(1);
    const [loginTotalPages, setLoginTotalPages] = useState(1);
    const [loginTotalRecords, setLoginTotalRecords] = useState(0);
    const [loginStatusFilter, setLoginStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
    const [isForceLoggingOut, setIsForceLoggingOut] = useState(false);

    // Fetch login history
    const fetchLoginHistory = useCallback(async (page = 1) => {
        try {
            setIsLoadingLogin(true);
            const statusParam = loginStatusFilter === 'all' ? undefined : loginStatusFilter;
            const data = await getUserLoginHistory(userId, page, 10, statusParam);
            setLoginRecords(data.records);
            setLoginStats(data.stats);
            setLoginPage(data.pagination.current);
            setLoginTotalPages(data.pagination.total);
            setLoginTotalRecords(data.pagination.totalRecords);
        } catch {
            toast.error('Failed to load login history');
        } finally {
            setIsLoadingLogin(false);
        }
    }, [userId, loginStatusFilter]);

    // Fetch session status
    const fetchSessionStatus = useCallback(async () => {
        try {
            setIsLoadingSession(true);
            const data = await getUserSessionStatus(userId);
            setSessionData(data);
        } catch {
            toast.error('Failed to load session status');
        } finally {
            setIsLoadingSession(false);
        }
    }, [userId]);

    // Initial load
    useEffect(() => {
        fetchLoginHistory(1);
        fetchSessionStatus();
    }, [fetchLoginHistory, fetchSessionStatus]);

    // Re-fetch when filter changes
    useEffect(() => {
        fetchLoginHistory(1);
    }, [loginStatusFilter, fetchLoginHistory]);

    // Force logout handler
    const handleForceLogout = async () => {
        try {
            setIsForceLoggingOut(true);
            const result = await forceLogoutUser(userId);
            toast.success(`Session terminated. ${result.sessionsTerminated} session(s) ended.`);
            fetchSessionStatus();
        } catch {
            toast.error('Failed to terminate session');
        } finally {
            setIsForceLoggingOut(false);
        }
    };

    // ==================== RENDER SECTIONS ====================

    const renderOverview = () => (
        <div className={styles.container}>
            {/* Account Status Alerts */}
            {sessionData?.accountStatus?.isLocked && (
                <div className={styles.dangerBanner}>
                    <LockClosed24Regular style={{ color: '#ef4444' }} />
                    <div>
                        <Text weight="semibold" style={{ color: '#991b1b' }}>Security Alert</Text>
                        <Text size={200} style={{ color: '#991b1b', display: 'block' }}>
                            {sessionData.accountStatus.failedAttemptsLast24h} failed login attempts in the last 24 hours.
                            Account may be under brute-force attack.
                        </Text>
                    </div>
                </div>
            )}
            {(sessionData?.accountStatus?.failedAttemptsLast24h ?? 0) > 0 &&
                !sessionData?.accountStatus?.isLocked && (
                    <div className={styles.warningBanner}>
                        <Warning24Regular style={{ color: '#d97706' }} />
                        <Text size={200} style={{ color: '#92400e' }}>
                            {sessionData?.accountStatus?.failedAttemptsLast24h ?? 0} failed login attempt(s) in the last 24 hours.
                        </Text>
                    </div>
                )}

            {/* Online Status */}
            <Card className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>
                        <PersonAvailable24Regular />
                        Current Status
                    </Text>
                    <Button
                        icon={<ArrowClockwise24Regular />}
                        appearance="subtle"
                        size="small"
                        onClick={fetchSessionStatus}
                    />
                </div>

                {isLoadingSession ? (
                    <div className={styles.loadingState}>
                        <Spinner size="small" label="Loading..." />
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalM }}>
                            <div className={styles.onlineIndicator} style={{
                                backgroundColor: sessionData?.isOnline ? '#dcfce7' : '#f3f4f6',
                                color: sessionData?.isOnline ? '#166534' : '#6b7280',
                            }}>
                                <span className={styles.onlineDot} style={{
                                    backgroundColor: sessionData?.isOnline ? '#22c55e' : '#9ca3af',
                                    boxShadow: sessionData?.isOnline ? '0 0 0 3px rgba(34,197,94,0.3)' : 'none',
                                }} />
                                {sessionData?.isOnline ? 'Online' : 'Offline'}
                            </div>

                            {sessionData?.isOnline && (
                                <Button
                                    icon={isForceLoggingOut ? <Spinner size="tiny" /> : <SignOut24Regular />}
                                    appearance="secondary"
                                    size="small"
                                    onClick={handleForceLogout}
                                    disabled={isForceLoggingOut}
                                    style={{ color: '#dc3545' }}
                                >
                                    Force Logout
                                </Button>
                            )}
                        </div>

                        {sessionData?.activeSession && (
                            <div className={styles.sessionInfoGrid}>
                                <div className={styles.sessionInfoItem}>
                                    <Text className={styles.sessionInfoLabel}>Session Started</Text>
                                    <Text className={styles.sessionInfoValue}>
                                        {formatDate(sessionData.activeSession.sessionStart)}
                                    </Text>
                                </div>
                                <div className={styles.sessionInfoItem}>
                                    <Text className={styles.sessionInfoLabel}>Last Activity</Text>
                                    <Text className={styles.sessionInfoValue}>
                                        {formatTimeAgo(sessionData.activeSession.lastActivity)}
                                    </Text>
                                </div>
                                <div className={styles.sessionInfoItem}>
                                    <Text className={styles.sessionInfoLabel}>IP Address</Text>
                                    <Text className={styles.sessionInfoValue}>
                                        {sessionData.activeSession.ipAddress ?? '—'}
                                    </Text>
                                </div>
                                <div className={styles.sessionInfoItem}>
                                    <Text className={styles.sessionInfoLabel}>Device / Browser</Text>
                                    <Text className={styles.sessionInfoValue}>
                                        {sessionData.activeSession.device ?? '—'} · {sessionData.activeSession.browser ?? '—'}
                                    </Text>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Login Stats */}
            <Card className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>
                        <History24Regular />
                        Login Statistics
                    </Text>
                </div>
                {loginStats && (
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem} style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <Text className={styles.statValue} style={{ color: '#2563eb' }}>
                                {loginStats.totalLogins}
                            </Text>
                            <Text className={styles.statLabel}>Total Logins</Text>
                        </div>
                        <div className={styles.statItem} style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' }}>
                            <Text className={styles.statValue} style={{ color: '#16a34a' }}>
                                {loginStats.successLogins}
                            </Text>
                            <Text className={styles.statLabel}>Successful</Text>
                        </div>
                        <div className={styles.statItem} style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
                            <Text className={styles.statValue} style={{ color: '#dc2626' }}>
                                {loginStats.failedLogins}
                            </Text>
                            <Text className={styles.statLabel}>Failed</Text>
                        </div>
                        <div className={styles.statItem} style={{ backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe' }}>
                            <Text className={styles.statValue} style={{ color: '#7c3aed', fontSize: tokens.fontSizeBase200 }}>
                                {formatTimeAgo(loginStats.lastLoginTime)}
                            </Text>
                            <Text className={styles.statLabel}>Last Login</Text>
                        </div>
                    </div>
                )}

                {loginStats?.lastLoginTime && (
                    <div style={{
                        padding: tokens.spacingVerticalS,
                        backgroundColor: tokens.colorNeutralBackground3,
                        borderRadius: tokens.borderRadiusMedium
                    }}>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                            Last successful login on{' '}
                            <Text weight="semibold" size={200}>
                                {formatDate(loginStats.lastLoginTime)}
                            </Text>{' '}
                            from{' '}
                            <Text weight="semibold" size={200}>
                                {loginStats.lastLoginIp ?? 'Unknown IP'}
                            </Text>{' '}
                            using{' '}
                            <Text weight="semibold" size={200}>
                                {loginStats.lastLoginBrowser ?? 'Unknown Browser'} on {loginStats.lastLoginDevice ?? 'Unknown Device'}
                            </Text>
                        </Text>
                    </div>
                )}
            </Card>

            {/* Account Status */}
            <Card className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>
                        <Shield24Regular />
                        Account Status
                    </Text>
                </div>
                <div className={styles.accountStatusGrid}>
                    <div className={styles.sessionInfoItem}>
                        <Text className={styles.sessionInfoLabel}>Account</Text>
                        <Badge
                            appearance="filled"
                            color={sessionData?.accountStatus?.isActive ? 'success' : 'danger'}
                        >
                            {sessionData?.accountStatus?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    <div className={styles.sessionInfoItem}>
                        <Text className={styles.sessionInfoLabel}>Security</Text>
                        <Badge
                            appearance="filled"
                            color={sessionData?.accountStatus?.isLocked ? 'danger' : 'success'}
                        >
                            {sessionData?.accountStatus?.isLocked ? 'At Risk' : 'Secure'}
                        </Badge>
                    </div>
                    <div className={styles.sessionInfoItem}>
                        <Text className={styles.sessionInfoLabel}>Session</Text>
                        <Badge
                            appearance="filled"
                            color={sessionData?.isOnline ? 'success' : 'informative'}
                        >
                            {sessionData?.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                    </div>
                    <div className={styles.sessionInfoItem}>
                        <Text className={styles.sessionInfoLabel}>Failed (24h)</Text>
                        <Badge
                            appearance="filled"
                            color={
                                (sessionData?.accountStatus?.failedAttemptsLast24h ?? 0) > 3
                                    ? 'danger'
                                    : (sessionData?.accountStatus?.failedAttemptsLast24h ?? 0) > 0
                                        ? 'warning'
                                        : 'success'
                            }
                        >
                            {sessionData?.accountStatus?.failedAttemptsLast24h ?? 0}
                        </Badge>
                    </div>
                </div>
            </Card>
        </div>
    );

    const renderLoginHistory = () => (
        <div className={styles.container}>
            {/* Filter buttons */}
            <div className={styles.filterRow}>
                <Button
                    appearance={loginStatusFilter === 'all' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setLoginStatusFilter('all')}
                >
                    All ({loginStats?.totalLogins ?? 0})
                </Button>
                <Button
                    appearance={loginStatusFilter === 'success' ? 'primary' : 'secondary'}
                    size="small"
                    icon={<Checkmark24Regular />}
                    onClick={() => setLoginStatusFilter('success')}
                    style={loginStatusFilter === 'success' ? { backgroundColor: '#16a34a' } : {}}
                >
                    Success ({loginStats?.successLogins ?? 0})
                </Button>
                <Button
                    appearance={loginStatusFilter === 'failed' ? 'primary' : 'secondary'}
                    size="small"
                    icon={<Dismiss24Regular />}
                    onClick={() => setLoginStatusFilter('failed')}
                    style={loginStatusFilter === 'failed' ? { backgroundColor: '#dc2626' } : {}}
                >
                    Failed ({loginStats?.failedLogins ?? 0})
                </Button>
                <div style={{ flex: 1 }} />
                <Button
                    icon={<ArrowClockwise24Regular />}
                    appearance="subtle"
                    size="small"
                    onClick={() => fetchLoginHistory(loginPage)}
                />
            </div>

            {isLoadingLogin ? (
                <div className={styles.loadingState}>
                    <Spinner size="small" label="Loading login history..." />
                </div>
            ) : loginRecords.length === 0 ? (
                <div className={styles.emptyState}>
                    <History24Regular style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }} />
                    <Text block>No login records found</Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        Login activity will appear here once available.
                    </Text>
                </div>
            ) : (
                <>
                    <div className={styles.tableWrapper}>
                        <Table size="small">
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>Status</TableHeaderCell>
                                    <TableHeaderCell>Time</TableHeaderCell>
                                    <TableHeaderCell>IP Address</TableHeaderCell>
                                    <TableHeaderCell>Device / Browser</TableHeaderCell>
                                    <TableHeaderCell>Logout</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loginRecords.map((record) => (
                                    <TableRow key={record._id} className={styles.loginRow}>
                                        <TableCell>
                                            <Tooltip
                                                content={
                                                    record.status === 'failed'
                                                        ? `Reason: ${record.failureReason ?? 'Unknown'}`
                                                        : 'Login successful'
                                                }
                                                relationship="label"
                                            >
                                                <Badge
                                                    appearance="filled"
                                                    color={record.status === 'success' ? 'success' : 'danger'}
                                                    icon={record.status === 'success' ? <Checkmark24Regular /> : <PresenceBlocked24Regular />}
                                                >
                                                    {record.status === 'success' ? 'Success' : 'Failed'}
                                                </Badge>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip content={formatDate(record.loginTime)} relationship="label">
                                                <Text size={200}>{formatTimeAgo(record.loginTime)}</Text>
                                            </Tooltip>
                                            <br />
                                            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                                {formatDate(record.loginTime)}
                                            </Text>
                                        </TableCell>
                                        <TableCell>
                                            <div className={styles.deviceIcon}>
                                                <Globe24Regular style={{ fontSize: '14px' }} />
                                                <Text size={200}>{record.ipAddress ?? '—'}</Text>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={styles.deviceIcon}>
                                                {getDeviceIcon(record.device)}
                                                <Text size={200}>
                                                    {record.device ?? '—'}
                                                </Text>
                                            </div>
                                            <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>
                                                {record.browser ?? ''} · {record.os ?? ''}
                                            </Text>
                                        </TableCell>
                                        <TableCell>
                                            {record.status === 'success' ? (
                                                record.logoutTime ? (
                                                    <Tooltip content={formatDate(record.logoutTime)} relationship="label">
                                                        <Text size={200}>{formatTimeAgo(record.logoutTime)}</Text>
                                                    </Tooltip>
                                                ) : (
                                                    <Badge appearance="tint" color="success">Active</Badge>
                                                )
                                            ) : (
                                                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>—</Text>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <Text className={styles.paginationInfo}>
                            Page {loginPage} of {loginTotalPages} · {loginTotalRecords} records
                        </Text>
                        <div className={styles.paginationButtons}>
                            <Button
                                icon={<ChevronLeft24Regular />}
                                appearance="subtle"
                                size="small"
                                disabled={loginPage <= 1}
                                onClick={() => fetchLoginHistory(loginPage - 1)}
                            />
                            <Button
                                icon={<ChevronRight24Regular />}
                                appearance="subtle"
                                size="small"
                                disabled={loginPage >= loginTotalPages}
                                onClick={() => fetchLoginHistory(loginPage + 1)}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderSessions = () => (
        <div className={styles.container}>
            <Card className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>
                        <Clock24Regular />
                        Recent Sessions
                    </Text>
                    <Button
                        icon={<ArrowClockwise24Regular />}
                        appearance="subtle"
                        size="small"
                        onClick={fetchSessionStatus}
                    />
                </div>

                {isLoadingSession ? (
                    <div className={styles.loadingState}>
                        <Spinner size="small" label="Loading sessions..." />
                    </div>
                ) : sessionData?.recentSessions?.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Clock24Regular style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.4 }} />
                        <Text block>No sessions found</Text>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
                        {sessionData?.recentSessions?.map((session) => (
                            <div key={session._id} className={styles.recentSessionCard}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS }}>
                                    <Badge
                                        appearance="filled"
                                        color={getSessionStatusColor(session.status)}
                                        size="small"
                                    >
                                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                    </Badge>
                                    <div>
                                        <Text size={200} weight="medium">
                                            {formatDate(session.sessionStart)}
                                        </Text>
                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>
                                            {session.device ?? 'Unknown'} · {session.browser ?? 'Unknown'} · {session.ipAddress ?? '—'}
                                        </Text>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                        Last Active
                                    </Text>
                                    <Text size={200} style={{ display: 'block' }}>
                                        {formatTimeAgo(session.lastActivity)}
                                    </Text>
                                    {session.logoutReason && (
                                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                                            {session.logoutReason === 'manual' ? 'Logged out' :
                                                session.logoutReason === 'expired' ? 'Session expired' :
                                                    session.logoutReason === 'inactivity' ? 'Inactivity' :
                                                        session.logoutReason === 'admin_forced' ? 'Admin forced' : '—'}
                                        </Text>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );

    return (
        <div className={styles.container}>
            <Divider style={{ margin: `${tokens.spacingVerticalS} 0` }} />

            <TabList
                selectedValue={activeTab}
                onTabSelect={(_, data) => setActiveTab(data.value as TabValue)}
                size="small"
            >
                <Tab value="overview" icon={<Shield24Regular />}>Overview</Tab>
                <Tab value="loginHistory" icon={<History24Regular />}>Login History</Tab>
                <Tab value="sessions" icon={<Clock24Regular />}>Sessions</Tab>
            </TabList>

            <div style={{ marginTop: tokens.spacingVerticalS }}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'loginHistory' && renderLoginHistory()}
                {activeTab === 'sessions' && renderSessions()}
            </div>

            {/* Add pulse animation */}
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

export default UserActivityPanel;
